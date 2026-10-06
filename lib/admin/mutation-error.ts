import {ApiRequestError} from "@/lib/api/request";

export const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Erro ao processar requisição.";
};

export const isConflictError = (error: unknown) => {
  return error instanceof ApiRequestError && error.status === 409;
};

export const buildTurmaRestrictMessage = (quantidadeDiarios: number) => {
  return `Esta turma possui ${quantidadeDiarios} alunos enturmados com diários vinculados. Exclusão bloqueada por integridade relacional (409 Conflict). É necessário desenturmar os alunos antes de remover a turma.`;
};
