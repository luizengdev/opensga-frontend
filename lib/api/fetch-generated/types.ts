export type AuthRole = "ADMIN" | "PROFESSOR" | "ALUNO" | "RESPONSAVEL";
export type StatusMatricula =
  | "PRE_MATRICULADO"
  | "ATIVO"
  | "TRANCADO"
  | "CANCELADO"
  | "FORMADO"
  | "EVADIDO";
export type StatusFatura = "PENDENTE" | "PAGA" | "ATRASADA" | "CANCELADA";
export type StatusReclamacao = "ABERTO" | "EM_ANALISE" | "RESPONDIDO" | "FECHADO";
export type TipoReclamacao =
  | "FINANCEIRO"
  | "ACADEMICO"
  | "SECRETARIA"
  | "INFRAESTRUTURA"
  | "OUVIDORIA_GERAL";
export type ModalidadeCurso = "PRESENCIAL" | "SEMIPRESENCIAL" | "EAD";
export type TipoComponente =
  | "CORE_VIDA_CARREIRA"
  | "ESPECIFICO"
  | "ELETIVA_TRILHA"
  | "EXTENSAO"
  | "OPTATIVO";
export type TipoEntrega = "PRESENCIAL_FISICO" | "SINCRONO_MEDIADO" | "ASSINCRONO_DIGITAL";
export type IntervaloCobranca = "MONTH";
export type StatusDisciplina = "EM_ABERTO" | "APROVADO" | "RF" | "RN";

export interface DeleteResponse {
  id: string;
}

export interface MeProfile {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  role: AuthRole;
  avatarUrl: string | null;
  ativo: boolean;
  aluno: {id: string; ra: string} | null;
  professor: {id: string; matricula: string; titulacao: string} | null;
}

export interface DashboardPeriodQuery {
  anoLetivo?: number;
  semestreLetivo?: number;
}

export interface AdminDashboard {
  anoLetivo: number;
  semestreLetivo: number;
  matriculasPorStatus: {status: StatusMatricula; quantidade: number}[];
  turmasNoPeriodo: number;
  ocupacaoMedia: number;
  faturasPendentes: number;
  reclamacoesAbertas: number;
}

export interface ProfessorDashboardTurma {
  id: string;
  codigo: string;
  capacidade: number;
  quantidadeDiarios: number;
}

export interface ProfessorDashboard {
  anoLetivo: number;
  semestreLetivo: number;
  turmas: ProfessorDashboardTurma[];
  lancamentosPendentes: number;
}

export interface Campus {
  id: string;
  nome: string;
  codigoPolo: string;
  cidade: string;
  estado: string;
  endereco: string;
}

export interface CreateCampusInput {
  nome: string;
  codigoPolo: string;
  cidade: string;
  estado: string;
  endereco: string;
}

export interface Curso {
  id: string;
  campusId: string;
  nome: string;
  codigoMec: string | null;
  modalidade: ModalidadeCurso;
  duracaoSemestres: number;
}

export interface CreateCursoInput {
  campusId: string;
  nome: string;
  codigoMec?: string;
  modalidade: ModalidadeCurso;
  duracaoSemestres?: number;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

export interface CreateDisciplinaInput {
  nome: string;
  codigo: string;
}

export interface Matriz {
  id: string;
  cursoId: string;
  nome: string;
  anoVigencia: number;
  ativo: boolean;
}

export interface MatrizDetail extends Matriz {
  curso: {id: string; nome: string; modalidade: ModalidadeCurso};
  componentes: Array<{
    id: string;
    disciplinaId: string;
    semestreIdeal: number;
    tipo: TipoComponente;
    tipoEntrega: TipoEntrega;
    chTotal: number;
    disciplina: Disciplina;
  }>;
}

export interface CreateMatrizInput {
  cursoId: string;
  nome: string;
  anoVigencia: number;
}

export interface ComponenteCurricular {
  id: string;
  matrizCurricularId: string;
  disciplinaId: string;
  semestreIdeal: number;
  tipo: TipoComponente;
  tipoEntrega: TipoEntrega;
  chTotal: number;
  chPresencial: number;
  chSincrona: number;
  chAssincrona: number;
  chExtensao: number;
  disciplina: Disciplina;
}

export interface AddComponenteInput {
  matrizCurricularId: string;
  disciplinaId: string;
  semestreIdeal: number;
  tipo: TipoComponente;
  tipoEntrega: TipoEntrega;
  chTotal: number;
  chPresencial?: number;
  chSincrona?: number;
  chAssincrona?: number;
  chExtensao?: number;
}

export interface AuditoriaMec {
  matrizId: string;
  matrizNome: string;
  cursoNome: string;
  modalidadeCurso?: ModalidadeCurso;
  campusId: string;
  campusNome: string;
  codigoPolo: string;
  chTotalGeral: number;
  chExtensaoTotal: number;
  chExtensaoPorTipo: number;
  percentualExtensao: number;
  cumpreRegra10PorcentoExtensao: boolean;
  chPresencialTotal: number;
  percentualPresencial: number;
  chSincronaTotal: number;
  percentualSincrono: number;
  chAssincronaTotal: number;
  percentualAssincrono: number;
  percentualPresencialESincrono: number;
  quantidadeComponentes: number;
  conformeDecreto12456: boolean;
  violacoes: Array<{
    codigo: "IDENTIDADE_CH" | "MODALIDADE_DISCIPLINA" | "EXTENSAO_10";
    mensagem: string;
    disciplinaId?: string;
  }>;
}

export interface Turma {
  id: string;
  campusId: string;
  disciplinaId: string;
  professorId: string;
  codigo: string;
  anoLetivo: number;
  semestreLetivo: number;
  capacidade: number;
  horario: string;
  salaOuLink: string | null;
  tipoEntrega: TipoEntrega;
  disciplina: Disciplina;
  chTotal: number | null;
  professor: {
    id: string;
    matricula: string;
    titulacao: string;
    user: {id: string; nome: string; email: string};
  };
  quantidadeDiarios?: number;
}

export interface CreateTurmaInput {
  campusId: string;
  disciplinaId: string;
  professorId: string;
  codigo: string;
  anoLetivo: number;
  semestreLetivo: number;
  capacidade?: number;
  horario: string;
  salaOuLink?: string;
  tipoEntrega: TipoEntrega;
}

export interface DiarioClasse {
  id: string;
  matriculaId: string;
  turmaId: string;
  notaAv: number | null;
  notaAvs: number | null;
  notaAv3: number | null;
  notaSemestral: number | null;
  mediaFinal: number | null;
  habilitaAv3: boolean;
  totalFaltas: number;
  chTotal: number;
  chCumprida: number;
  statusDisciplina: StatusDisciplina;
  semestreFechado: boolean;
  turma: {id: string; codigo: string; disciplina: Disciplina};
  aluno: {ra: string; nome: string};
}

export interface UpdateGradesInput {
  diarioClasseId: string;
  notaAv?: number;
  notaAvs?: number;
  notaAv3?: number;
  totalFaltas?: number;
}

export interface FecharSemestreInput {
  turmaId: string;
}

export interface FecharSemestreResponse {
  turmaId: string;
  fechados: number;
  diarios: Array<{
    id: string;
    notaAv: number | null;
    notaAvs: number | null;
    notaAv3: number | null;
    notaSemestral: number | null;
    mediaFinal: number | null;
    habilitaAv3: boolean;
    totalFaltas: number;
    chTotal: number;
    chCumprida: number;
    statusDisciplina: StatusDisciplina;
    semestreFechado: boolean;
  }>;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  avatarUrl: string | null;
  role: AuthRole;
  ativo: boolean;
}

export interface Professor {
  id: string;
  matricula: string;
  titulacao: string;
  departamento: string;
  user: User;
}

export interface Aluno {
  id: string;
  ra: string;
  dataNascimento: string;
  responsavelId: string | null;
  user: User;
}

export interface CreateAdminInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  senha: string;
}

export interface UpdateUserInput {
  nome?: string;
  email?: string;
  cpf?: string;
  telefone?: string | null;
  ativo?: boolean;
  senha?: string;
}

export interface UpdateProfessorInput {
  nome?: string;
  telefone?: string | null;
  ativo?: boolean;
  titulacao?: string;
  departamento?: string;
}

export interface CreateProfessorInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  senha: string;
  matricula: string;
  titulacao: string;
  departamento: string;
}

export interface Matricula {
  id: string;
  status: StatusMatricula;
  periodoAtual: number;
  semestreIngresso: string;
  curso: {id: string; nome: string; modalidade: ModalidadeCurso};
  matrizCurricular: {id: string; nome: string; anoVigencia: number};
  aluno: {
    ra: string;
    user: {id: string; nome: string; email: string; cpf: string; ativo: boolean};
  };
}

export interface CreateMatriculaInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  cursoId: string;
  matrizCurricularId: string;
  semestreIngresso: string;
}

export interface CreateMatriculaResponse {
  message: string;
  ra: string;
  matriculaId: string;
  matrizNome: string;
}

export interface PrecoCurso {
  id: string;
  cursoId: string;
  valor: number;
  moeda: string;
  intervalo: IntervaloCobranca;
  stripeProductId: string;
  stripePriceId: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  curso: {id: string; nome: string; modalidade: ModalidadeCurso};
}

export interface Fatura {
  id: string;
  alunoId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: StatusFatura;
  stripeInvoiceId: string | null;
  stripePaymentUrl: string | null;
  pagoEm: string | null;
  aluno: {ra: string; user: {id: string; nome: string; email: string}};
}

export interface CreateFaturaInput {
  alunoId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  publicoAlvo: AuthRole[];
  criadoEm: string;
}

export interface CreateComunicadoInput {
  titulo: string;
  conteudo: string;
  publicoAlvo: AuthRole[];
}

export interface Reclamacao {
  id: string;
  usuarioId: string;
  assunto: string;
  tipo: TipoReclamacao;
  descricao: string;
  resposta: string | null;
  status: StatusReclamacao;
  criadoEm: string;
  usuario: {id: string; nome: string; email: string; role: AuthRole};
}
