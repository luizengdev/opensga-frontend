import type {CatalogoCurso, CatalogoModalidade} from "@/lib/api/fetch-generated";
import {getPublicCourseById} from "@/lib/public/courses";

export type CatalogoTipoGraduacao = "BACHARELADO" | "LICENCIATURA" | "TECNOLOGO";

const MODALIDADE_ORDER: CatalogoModalidade[] = [
  "PRESENCIAL",
  "SEMIPRESENCIAL",
  "EAD",
];

export const MODALIDADE_OPTIONS: Array<{
  value: CatalogoModalidade;
  label: string;
}> = [
  {value: "PRESENCIAL", label: "Presencial"},
  {value: "SEMIPRESENCIAL", label: "Semipresencial"},
  {value: "EAD", label: "EAD"},
];

const MODALIDADE_LABEL: Record<CatalogoModalidade, string> = {
  PRESENCIAL: "Presencial",
  SEMIPRESENCIAL: "Semipresencial",
  EAD: "EAD",
};

export const TIPO_GRADUACAO_LABEL: Record<CatalogoTipoGraduacao, string> = {
  BACHARELADO: "Bacharelado",
  LICENCIATURA: "Licenciatura",
  TECNOLOGO: "Tecnólogo",
};

export const INGRESSO_OPTIONS = [
  {
    value: "VESTIBULAR",
    label: "Vestibular",
    description: "Garanta sua vaga agora. A matrícula segue para o checkout.",
  },
  {
    value: "ENEM",
    label: "ENEM",
    description: "Use sua nota do ENEM para ingressar no curso.",
  },
  {
    value: "DIPLOMA",
    label: "Portador de Diploma",
    description: "Se você já concluiu uma graduação, ingresse sem vestibular.",
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferência",
    description: "Aproveite disciplinas e continue seus estudos.",
  },
] as const;

export type FormaIngresso = (typeof INGRESSO_OPTIONS)[number]["value"];

export const getModalidadeLabel = (modalidade: CatalogoModalidade) => {
  return MODALIDADE_LABEL[modalidade];
};

export const getTipoGraduacaoLabel = (tipo?: CatalogoTipoGraduacao) => {
  return TIPO_GRADUACAO_LABEL[tipo ?? "BACHARELADO"];
};

export const formatDuracaoMeses = (duracaoSemestres: number) => {
  return `${duracaoSemestres * 6} meses`;
};

export const formatCatalogPrice = (valor: number, moeda: string) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda.toUpperCase(),
  }).format(valor);
};

export const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const formatTelefone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const uniqueSorted = (values: string[]) => {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right, "pt-BR"),
  );
};

export const listEstados = (catalogo: CatalogoCurso[]) => {
  return uniqueSorted(catalogo.map((curso) => curso.campus.estado));
};

export const listCidades = (catalogo: CatalogoCurso[], estado?: string) => {
  return uniqueSorted(
    catalogo
      .filter((curso) => !estado || curso.campus.estado === estado)
      .map((curso) => curso.campus.cidade),
  );
};

export const listTiposGraduacao = (catalogo: CatalogoCurso[]) => {
  return uniqueSorted(catalogo.map((curso) => curso.tipoGraduacao));
};

export const listDuracoes = (catalogo: CatalogoCurso[]) => {
  return [...new Set(catalogo.map((curso) => curso.duracaoSemestres))].sort(
    (left, right) => left - right,
  );
};

export const listAvailableModalidades = (catalogo: CatalogoCurso[]) => {
  const present = new Set(catalogo.map((curso) => curso.modalidade));

  return MODALIDADE_ORDER.filter((modalidade) => present.has(modalidade));
};

export interface CatalogoFilters {
  estado: string;
  cidade: string;
  tipoGraduacao: string;
  duracaoSemestres: string;
  modalidade: "all" | CatalogoModalidade;
  search: string;
}

export const emptyCatalogoFilters = (): CatalogoFilters => {
  return {
    estado: "",
    cidade: "",
    tipoGraduacao: "",
    duracaoSemestres: "",
    modalidade: "all",
    search: "",
  };
};

export const filterCatalogo = (
  catalogo: CatalogoCurso[],
  filters: CatalogoFilters,
) => {
  const query = filters.search.trim().toLowerCase();

  return catalogo.filter((curso) => {
    if (filters.estado && curso.campus.estado !== filters.estado) {
      return false;
    }

    if (filters.cidade && curso.campus.cidade !== filters.cidade) {
      return false;
    }

    if (filters.tipoGraduacao && curso.tipoGraduacao !== filters.tipoGraduacao) {
      return false;
    }

    if (
      filters.duracaoSemestres &&
      String(curso.duracaoSemestres) !== filters.duracaoSemestres
    ) {
      return false;
    }

    if (
      filters.modalidade !== "all" &&
      curso.modalidade !== filters.modalidade
    ) {
      return false;
    }

    if (query && !curso.nome.toLowerCase().includes(query)) {
      return false;
    }

    return true;
  });
};

export const listCampusOfertas = (
  catalogo: CatalogoCurso[],
  curso: CatalogoCurso,
) => {
  return catalogo.filter(
    (item) =>
      item.nome === curso.nome && item.modalidade === curso.modalidade,
  );
};

export const resolveCatalogCourseId = (
  catalogo: CatalogoCurso[],
  hint?: string,
) => {
  if (!hint || catalogo.length === 0) {
    return "";
  }

  const byId = catalogo.find((curso) => curso.cursoId === hint);

  if (byId) {
    return byId.cursoId;
  }

  const publicCourse = getPublicCourseById(hint);
  const nameHint = publicCourse?.name.split("&")[0]?.trim() ?? hint;
  const normalizedHint = nameHint.toLowerCase();

  const byName = catalogo.find((curso) => {
    const nome = curso.nome.toLowerCase();
    return nome.includes(normalizedHint) || normalizedHint.includes(nome);
  });

  return byName?.cursoId ?? "";
};
