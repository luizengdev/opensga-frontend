import {requestApi} from "@/lib/api/request";

export type CatalogoModalidade = "PRESENCIAL" | "SEMIPRESENCIAL" | "EAD";
export type CatalogoTipoGraduacao = "BACHARELADO" | "LICENCIATURA" | "TECNOLOGO";
export type CatalogoIntervalo = "MONTH";

export interface CatalogoCurso {
  cursoId: string;
  nome: string;
  modalidade: CatalogoModalidade;
  tipoGraduacao: CatalogoTipoGraduacao;
  duracaoSemestres: number;
  campus: {
    nome: string;
    cidade: string;
    estado: string;
  };
  valor: number;
  moeda: string;
  intervalo: CatalogoIntervalo;
}

export interface CreateInscricaoInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  cursoModalidadeId: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export const getCatalogoCursos = async () => {
  try {
    return await requestApi<CatalogoCurso[]>("/api/catalogo", {
      cache: "no-store",
    });
  } catch {
    return [];
  }
};

export const createInscricao = async (data: CreateInscricaoInput) => {
  return requestApi<CheckoutSession>("/api/inscricao", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
