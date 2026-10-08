import type {
  AuthRole,
  ModalidadeCurso,
  StatusFatura,
  StatusMatricula,
  StatusReclamacao,
  TipoCampus,
  TipoComponente,
  StatusTermoAbertura,
  TipoDocumento,
  TipoEntrega,
  TipoReclamacao,
  TipoTermoAbertura,
} from "@/lib/api/fetch-generated";

export const STATUS_MATRICULA_LABEL: Record<StatusMatricula, string> = {
  PRE_MATRICULADO: "Pré-matriculado",
  ATIVO: "Ativo",
  TRANCADO: "Trancado",
  CANCELADO: "Cancelado",
  FORMADO: "Formado",
  EVADIDO: "Evadido",
  TRANSFERIDO: "Transferido",
};

export const STATUS_FATURA_LABEL: Record<StatusFatura, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  ATRASADA: "Atrasada",
  CANCELADA: "Cancelada",
};

export const STATUS_RECLAMACAO_LABEL: Record<StatusReclamacao, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em análise",
  RESPONDIDO: "Respondido",
  FECHADO: "Fechado",
};

export const TIPO_RECLAMACAO_LABEL: Record<TipoReclamacao, string> = {
  FINANCEIRO: "Financeiro / cobrança",
  ACADEMICO: "Coordenação pedagógica",
  SECRETARIA: "Secretaria acadêmica",
  INFRAESTRUTURA: "Infraestrutura & TI",
  OUVIDORIA_GERAL: "Ouvidoria geral",
};

export const MODALIDADE_LABEL: Record<ModalidadeCurso, string> = {
  PRESENCIAL: "Presencial",
  SEMIPRESENCIAL: "Semipresencial",
  EAD: "EAD",
};

export const TIPO_CAMPUS_LABEL: Record<TipoCampus, string> = {
  CAMPI: "Campus (presencial)",
  POLO: "Polo (EAD)",
};

export const modalidadesPorTipoCampus = (tipo: TipoCampus): ModalidadeCurso[] => {
  if (tipo === "POLO") {
    return ["EAD"];
  }

  return ["PRESENCIAL", "SEMIPRESENCIAL"];
};

export const TIPO_COMPONENTE_LABEL: Record<TipoComponente, string> = {
  CORE_VIDA_CARREIRA: "Core vida e carreira",
  ESPECIFICO: "Específico",
  ELETIVA_TRILHA: "Eletiva de trilha",
  EXTENSAO: "Extensão",
  OPTATIVO: "Optativo",
};

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  DECLARACAO_MATRICULA: "Declaração de matrícula",
  HISTORICO_PARCIAL: "Histórico escolar parcial",
  QUITACAO_FINANCEIRA: "Quitação financeira",
  CARTEIRINHA_ESTUDANTIL: "Carteirinha estudantil",
};

export const TIPO_ENTREGA_LABEL: Record<TipoEntrega, string> = {
  PRESENCIAL_FISICO: "Presencial físico",
  SINCRONO_MEDIADO: "Síncrono mediado",
  ASSINCRONO_DIGITAL: "Assíncrono digital",
};

export const ROLE_LABEL: Record<AuthRole, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
  RESPONSAVEL: "Responsável",
};

export const STATUS_TERMO_ABERTURA_LABEL: Record<StatusTermoAbertura, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
};

export const TIPO_TERMO_ABERTURA_LABEL: Record<TipoTermoAbertura, string> = {
  TURMA: "Abertura de turma",
  INDIVIDUAL: "Alteração individual",
};
