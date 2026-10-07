import type {StatusDisciplina} from "@/lib/api/fetch-generated";

export const STATUS_DISCIPLINA_LABEL: Record<StatusDisciplina, string> = {
  EM_ABERTO: "Em aberto",
  APROVADO: "Aprovado",
  RF: "Reprovado por falta (RF)",
  RN: "Reprovado por nota (RN)",
};

export const firstName = (nome: string) => {
  return nome.split(" ")[0] ?? nome;
};

export const displayName = (nome: string) => {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const resumoTexto = (conteudo: string, max = 160) => {
  if (conteudo.length <= max) {
    return conteudo;
  }

  return `${conteudo.slice(0, max).trim()}…`;
};
