import {requestApi, toQueryString} from "@/lib/api/request";

import type {
  AuthRole,
  MeProfile,
  ModalidadeCurso,
  StatusDisciplina,
  StatusFatura,
  StatusMatricula,
  StatusReclamacao,
  TipoComponente,
  TipoDocumento,
  TipoEntrega,
  TipoReclamacao,
} from "./types";

export interface PortalMatricula {
  id: string;
  ra: string;
  status: StatusMatricula;
  periodoAtual: number;
  semestreIngresso: string;
  curso: {
    id: string;
    nome: string;
    modalidade: ModalidadeCurso;
    campus: {nome: string; codigoPolo: string};
  };
  matrizCurricular: {
    id: string;
    nome: string;
    anoVigencia: number;
    chTotalCurso: number;
    chIntegralizada: number;
  };
}

export interface PortalDisciplina {
  id: string;
  codigoTurma: string;
  codigoDisciplina: string;
  nomeDisciplina: string;
  professorNome: string;
  horario: string;
  salaOuLink: string | null;
  tipoEntrega: TipoEntrega;
  anoLetivo: number;
  semestreLetivo: number;
  chTotal: number;
  chCumprida: number;
  totalFaltas: number;
  notaAv: number | null;
  notaAvs: number | null;
  notaAv3: number | null;
  notaSemestral: number | null;
  mediaFinal: number | null;
  habilitaAv3: boolean;
  statusDisciplina: StatusDisciplina;
  semestreFechado: boolean;
}

export interface PortalComponente {
  id: string;
  codigo: string;
  nome: string;
  semestreIdeal: number;
  tipo: TipoComponente;
  chTotal: number;
  statusDisciplina: StatusDisciplina | null;
  notaFinal: number | null;
}

export interface PortalFatura {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: StatusFatura;
  stripePaymentUrl: string | null;
  pagoEm: string | null;
}

export interface PortalComunicado {
  id: string;
  titulo: string;
  conteudo: string;
  publicoAlvo: AuthRole[];
  criadoEm: string;
}

export interface PortalReclamacao {
  id: string;
  assunto: string;
  tipo: TipoReclamacao;
  descricao: string;
  resposta: string | null;
  status: StatusReclamacao;
  criadoEm: string;
}

export interface PortalContexto {
  profile: MeProfile;
  alunoId: string | null;
  matricula: PortalMatricula | null;
  disciplinas: PortalDisciplina[];
  matriz: PortalComponente[];
  faturas: PortalFatura[];
  comunicados: PortalComunicado[];
  ouvidoria: PortalReclamacao[];
}

export interface CreatePortalReclamacaoInput {
  assunto: string;
  tipo: TipoReclamacao;
  descricao: string;
}

export interface ChangePasswordInput {
  senhaAtual: string;
  senhaNova: string;
}

export interface PortalDocumentoCatalogoItem {
  id: string;
  tipo: TipoDocumento;
  titulo: string;
  descricao: string;
  finalidade: string;
}

export interface DocumentoEmitido {
  tipo: TipoDocumento;
  titulo: string;
  corpo: string;
  codigoAutenticacao: string;
  emitidoEm: string;
  aluno: {nome: string; cpf: string; ra: string; avatarUrl: string | null};
  curso: {
    nome: string;
    modalidade: ModalidadeCurso;
    campusNome: string;
    codigoPolo: string;
  };
  periodoAtual: number;
  semestreIngresso: string;
  chIntegralizada: number;
  chTotalCurso: number;
  disciplinas: Array<{
    codigo: string;
    nome: string;
    chTotal: number;
    tipoEntrega: TipoEntrega;
  }>;
  matriz: Array<{
    semestreIdeal: number;
    codigo: string;
    nome: string;
    tipo: TipoComponente;
    chTotal: number;
    notaFinal: number | null;
    statusDisciplina: StatusDisciplina | null;
  }>;
}

export interface EmitirDocumentoInput {
  tipo: TipoDocumento;
  alunoId?: string;
}

export const getPortalContexto = async (alunoId?: string) => {
  return requestApi<PortalContexto>(`/api/v1/portal/contexto${toQueryString({alunoId})}`);
};

export const getPortalDocumentos = async () => {
  return requestApi<PortalDocumentoCatalogoItem[]>("/api/v1/portal/documentos");
};

export const emitirPortalDocumento = async (data: EmitirDocumentoInput) => {
  return requestApi<DocumentoEmitido>("/api/v1/portal/documentos/emitir", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createPortalReclamacao = async (data: CreatePortalReclamacaoInput) => {
  return requestApi<PortalReclamacao>("/api/v1/portal/ouvidoria", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const changePassword = async (data: ChangePasswordInput) => {
  return requestApi<{message: string}>("/api/v1/auth/senha", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
