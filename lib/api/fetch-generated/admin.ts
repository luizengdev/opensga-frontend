import {requestApi, toQueryString} from "@/lib/api/request";

import type {
  AddComponenteInput,
  AdminDashboard,
  Aluno,
  AuditoriaMec,
  Campus,
  Comunicado,
  ComponenteCurricular,
  CreateAdminInput,
  CreateCampusInput,
  CreateComunicadoInput,
  CreateCursoInput,
  CreateDisciplinaInput,
  CreateFaturaInput,
  CreateMatriculaInput,
  CreateMatriculaResponse,
  CreateMatrizInput,
  CreateProfessorInput,
  CreateTurmaInput,
  Curso,
  DashboardPeriodQuery,
  DeleteResponse,
  DiarioClasse,
  Disciplina,
  Fatura,
  FecharSemestreInput,
  FecharSemestreResponse,
  Matricula,
  Matriz,
  MatrizDetail,
  MeProfile,
  PrecoCurso,
  Professor,
  ProfessorDashboard,
  Reclamacao,
  StatusFatura,
  StatusMatricula,
  StatusReclamacao,
  TipoReclamacao,
  Turma,
  UpdateGradesInput,
  UpdateProfessorInput,
  UpdateUserInput,
  User,
} from "./types";

export * from "./types";

export const getMe = async () => {
  return requestApi<MeProfile>("/api/v1/auth/me");
};

export const getDashboardAdmin = async (query?: DashboardPeriodQuery) => {
  return requestApi<AdminDashboard>(
    `/api/v1/dashboard/admin${toQueryString(query)}`,
  );
};

export const getDashboardProfessor = async (query?: DashboardPeriodQuery) => {
  return requestApi<ProfessorDashboard>(
    `/api/v1/dashboard/professor${toQueryString(query)}`,
  );
};

export const getCampi = async () => requestApi<Campus[]>("/api/v1/academic/campi");
export const createCampus = async (data: CreateCampusInput) =>
  requestApi<Campus>("/api/v1/academic/campi", {method: "POST", body: JSON.stringify(data)});
export const updateCampus = async ({id, data}: {id: string; data: Partial<CreateCampusInput>}) =>
  requestApi<Campus>(`/api/v1/academic/campi/${id}`, {method: "PATCH", body: JSON.stringify(data)});
export const deleteCampus = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/academic/campi/${id}`, {method: "DELETE"});

export const getCursos = async (campusId?: string) =>
  requestApi<Curso[]>(`/api/v1/academic/cursos${toQueryString({campusId})}`);
export const createCurso = async (data: CreateCursoInput) =>
  requestApi<Curso>("/api/v1/academic/cursos", {method: "POST", body: JSON.stringify(data)});
export const updateCurso = async ({id, data}: {id: string; data: Partial<CreateCursoInput>}) =>
  requestApi<Curso>(`/api/v1/academic/cursos/${id}`, {method: "PATCH", body: JSON.stringify(data)});
export const deleteCurso = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/academic/cursos/${id}`, {method: "DELETE"});

export const getDisciplinas = async () => requestApi<Disciplina[]>("/api/v1/academic/disciplinas");
export const createDisciplina = async (data: CreateDisciplinaInput) =>
  requestApi<Disciplina>("/api/v1/academic/disciplinas", {method: "POST", body: JSON.stringify(data)});
export const updateDisciplina = async ({id, data}: {id: string; data: Partial<CreateDisciplinaInput>}) =>
  requestApi<Disciplina>(`/api/v1/academic/disciplinas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteDisciplina = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/academic/disciplinas/${id}`, {method: "DELETE"});

export const getMatrizes = async (cursoId?: string) =>
  requestApi<Matriz[]>(`/api/v1/academic/matrizes${toQueryString({cursoId})}`);
export const getMatriz = async (id: string) => requestApi<MatrizDetail>(`/api/v1/academic/matrizes/${id}`);
export const createMatriz = async (data: CreateMatrizInput) =>
  requestApi<Matriz>("/api/v1/academic/matrizes", {method: "POST", body: JSON.stringify(data)});
export const getAuditoriaMec = async (id: string) =>
  requestApi<AuditoriaMec>(`/api/v1/academic/matrizes/${id}/auditoria-mec`);
export const getComponentesMatriz = async (id: string) =>
  requestApi<ComponenteCurricular[]>(`/api/v1/academic/matrizes/${id}/componentes`);
export const addComponenteMatriz = async (data: AddComponenteInput) =>
  requestApi<ComponenteCurricular>("/api/v1/academic/matrizes/componentes", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteComponente = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/academic/componentes/${id}`, {method: "DELETE"});

export const getTurmas = async (query?: {
  campusId?: string;
  anoLetivo?: number;
  semestreLetivo?: number;
}) => requestApi<Turma[]>(`/api/v1/academic/turmas${toQueryString(query)}`);
export const getTurma = async (id: string) => requestApi<Turma>(`/api/v1/academic/turmas/${id}`);
export const createTurma = async (data: CreateTurmaInput) =>
  requestApi<Turma>("/api/v1/academic/turmas", {method: "POST", body: JSON.stringify(data)});
export const deleteTurma = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/academic/turmas/${id}`, {method: "DELETE"});

export const getDiarios = async (query?: {turmaId?: string; matriculaId?: string}) =>
  requestApi<DiarioClasse[]>(`/api/v1/diario${toQueryString(query)}`);
export const enturmarAluno = async (data: {matriculaId: string; turmaId: string}) =>
  requestApi("/api/v1/diario/enturmar", {method: "POST", body: JSON.stringify(data)});
export const avaliarDiario = async (data: UpdateGradesInput) =>
  requestApi("/api/v1/diario/avaliar", {method: "PATCH", body: JSON.stringify(data)});
export const fecharSemestre = async (data: FecharSemestreInput) =>
  requestApi<FecharSemestreResponse>("/api/v1/diario/fechar-semestre", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteDiario = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/diario/${id}`, {method: "DELETE"});

export const getUsers = async (role?: User["role"]) =>
  requestApi<User[]>(`/api/v1/users${toQueryString({role})}`);
export const createAdminUser = async (data: CreateAdminInput) =>
  requestApi<User>("/api/v1/users/admins", {method: "POST", body: JSON.stringify(data)});
export const getProfessores = async () => requestApi<Professor[]>("/api/v1/users/professores");
export const createProfessor = async (data: CreateProfessorInput) =>
  requestApi<Professor>("/api/v1/users/professores", {method: "POST", body: JSON.stringify(data)});
export const getAlunos = async () => requestApi<Aluno[]>("/api/v1/users/alunos");
export const updateUser = async ({id, data}: {id: string; data: UpdateUserInput}) =>
  requestApi<User>(`/api/v1/users/${id}`, {method: "PATCH", body: JSON.stringify(data)});
export const updateProfessor = async ({id, data}: {id: string; data: UpdateProfessorInput}) =>
  requestApi<Professor>(`/api/v1/users/professores/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteUser = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/users/${id}`, {method: "DELETE"});

export const getMatriculas = async (status?: StatusMatricula) =>
  requestApi<Matricula[]>(`/api/v1/matriculas${toQueryString({status})}`);
export const createMatricula = async (data: CreateMatriculaInput) =>
  requestApi<CreateMatriculaResponse>("/api/v1/matriculas", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateMatriculaStatus = async ({id, status}: {id: string; status: StatusMatricula}) =>
  requestApi(`/api/v1/matriculas/${id}/status`, {method: "PATCH", body: JSON.stringify({status})});
export const deleteMatricula = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/matriculas/${id}`, {method: "DELETE"});

export const getPrecos = async () => requestApi<PrecoCurso[]>("/api/v1/financeiro/precos");
export const createPreco = async (data: {cursoId: string; valor: number}) =>
  requestApi<PrecoCurso>("/api/v1/financeiro/precos", {method: "POST", body: JSON.stringify(data)});
export const updatePreco = async ({
  id,
  data,
}: {
  id: string;
  data: {valor?: number; ativo?: boolean};
}) =>
  requestApi<PrecoCurso>(`/api/v1/financeiro/precos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deletePreco = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/financeiro/precos/${id}`, {method: "DELETE"});

export const getFaturas = async (query?: {alunoId?: string; status?: StatusFatura}) =>
  requestApi<Fatura[]>(`/api/v1/financeiro/faturas${toQueryString(query)}`);
export const createFatura = async (data: CreateFaturaInput) =>
  requestApi<Fatura>("/api/v1/financeiro/faturas", {method: "POST", body: JSON.stringify(data)});
export const updateFaturaStatus = async ({id, status}: {id: string; status: StatusFatura}) =>
  requestApi<Fatura>(`/api/v1/financeiro/faturas/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({status}),
  });

export const getComunicados = async () => requestApi<Comunicado[]>("/api/v1/comunicados");
export const createComunicado = async (data: CreateComunicadoInput) =>
  requestApi<Comunicado>("/api/v1/comunicados", {method: "POST", body: JSON.stringify(data)});
export const deleteComunicado = async (id: string) =>
  requestApi<DeleteResponse>(`/api/v1/comunicados/${id}`, {method: "DELETE"});

export const getReclamacoes = async (query?: {status?: StatusReclamacao; tipo?: TipoReclamacao}) =>
  requestApi<Reclamacao[]>(`/api/v1/ouvidoria/reclamacoes${toQueryString(query)}`);
export const responderReclamacao = async ({id, resposta}: {id: string; resposta: string}) =>
  requestApi<Reclamacao>(`/api/v1/ouvidoria/reclamacoes/${id}/responder`, {
    method: "PATCH",
    body: JSON.stringify({resposta}),
  });
export const fecharReclamacao = async (id: string) =>
  requestApi<Reclamacao>(`/api/v1/ouvidoria/reclamacoes/${id}/fechar`, {method: "PATCH"});
