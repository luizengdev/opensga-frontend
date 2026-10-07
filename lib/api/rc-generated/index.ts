"use client";

import {useMutation, useQuery} from "@tanstack/react-query";

import {
  addComponenteMatriz,
  avaliarDiario,
  changePassword,
  createAdminUser,
  createPortalReclamacao,
  createCampus,
  createComunicado,
  createCurso,
  createDisciplina,
  createFatura,
  createInscricao,
  createMatricula,
  createMatriz,
  deleteMatriz,
  createPreco,
  createProfessor,
  createTurma,
  deleteCampus,
  deleteComponente,
  deleteComunicado,
  deleteCurso,
  deleteDiario,
  deleteDisciplina,
  deleteMatricula,
  deletePreco,
  deleteTurma,
  deleteUser,
  enturmarAluno,
  fecharReclamacao,
  fecharSemestre,
  getAlunos,
  getAuditoriaMec,
  getCampi,
  getCatalogoCursos,
  getComponentesMatriz,
  getComunicados,
  getCursos,
  getDashboardAdmin,
  getDashboardProfessor,
  getDiarios,
  getDisciplinas,
  getFaturas,
  getMatriculas,
  getMatriz,
  getMatrizes,
  getMe,
  getPortalContexto,
  getPrecos,
  getProfessores,
  getReclamacoes,
  getTurma,
  getTurmas,
  getUsers,
  login,
  responderReclamacao,
  updateCampus,
  updateCurso,
  updateDisciplina,
  updateFaturaStatus,
  updateMatriculaStatus,
  updatePreco,
  updateProfessor,
  updateUser,
  type AddComponenteInput,
  type AdminDashboard,
  type AuthRole,
  type CatalogoCurso,
  type ChangePasswordInput,
  type CreateAdminInput,
  type CreatePortalReclamacaoInput,
  type CreateCampusInput,
  type CreateComunicadoInput,
  type CreateCursoInput,
  type CreateDisciplinaInput,
  type CreateFaturaInput,
  type CreateInscricaoInput,
  type CreateMatriculaInput,
  type CreateMatrizInput,
  type CreateProfessorInput,
  type CreateTurmaInput,
  type DashboardPeriodQuery,
  type FecharSemestreInput,
  type LoginInput,
  type MeProfile,
  type PortalContexto,
  type ProfessorDashboard,
  type StatusFatura,
  type StatusMatricula,
  type UpdateGradesInput,
  type UpdateProfessorInput,
  type UpdateUserInput,
} from "@/lib/api/fetch-generated";

export const getGetCatalogoCursosQueryKey = () => {
  return ["/api/catalogo"] as const;
};

export const useGetCatalogoCursos = (options?: {
  query?: {initialData?: CatalogoCurso[]};
}) => {
  return useQuery({
    queryKey: getGetCatalogoCursosQueryKey(),
    queryFn: getCatalogoCursos,
    initialData: options?.query?.initialData,
  });
};

export const useCreateInscricao = () => {
  return useMutation({
    mutationFn: (data: CreateInscricaoInput) => createInscricao(data),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
  });
};

export const getGetMeQueryKey = () => ["/api/v1/auth/me"] as const;
export const useGetMe = (options?: {query?: {initialData?: MeProfile}}) =>
  useQuery({
    queryKey: getGetMeQueryKey(),
    queryFn: getMe,
    initialData: options?.query?.initialData,
  });

export const getGetPortalContextoQueryKey = (alunoId?: string) =>
  ["/api/v1/portal/contexto", alunoId] as const;
export const useGetPortalContexto = (options?: {
  alunoId?: string;
  query?: {initialData?: PortalContexto};
}) =>
  useQuery({
    queryKey: getGetPortalContextoQueryKey(options?.alunoId),
    queryFn: () => getPortalContexto(options?.alunoId),
    initialData: options?.query?.initialData,
  });

export const useCreatePortalReclamacao = () =>
  useMutation({mutationFn: (data: CreatePortalReclamacaoInput) => createPortalReclamacao(data)});

export const useChangePassword = () =>
  useMutation({mutationFn: (data: ChangePasswordInput) => changePassword(data)});

export const getGetDashboardAdminQueryKey = (query?: DashboardPeriodQuery) =>
  ["/api/v1/dashboard/admin", query] as const;
export const useGetDashboardAdmin = (options: {
  query?: DashboardPeriodQuery;
  initialData?: AdminDashboard;
}) =>
  useQuery({
    queryKey: getGetDashboardAdminQueryKey(options.query),
    queryFn: () => getDashboardAdmin(options.query),
    initialData: options.initialData,
  });

export const getGetDashboardProfessorQueryKey = (query?: DashboardPeriodQuery) =>
  ["/api/v1/dashboard/professor", query] as const;
export const useGetDashboardProfessor = (options: {
  query?: DashboardPeriodQuery;
  initialData?: ProfessorDashboard;
}) =>
  useQuery({
    queryKey: getGetDashboardProfessorQueryKey(options.query),
    queryFn: () => getDashboardProfessor(options.query),
    initialData: options.initialData,
  });

export const getGetCampiQueryKey = () => ["/api/v1/academic/campi"] as const;
export const useGetCampi = (options?: {initialData?: Awaited<ReturnType<typeof getCampi>>}) =>
  useQuery({queryKey: getGetCampiQueryKey(), queryFn: getCampi, initialData: options?.initialData});
export const useCreateCampus = () =>
  useMutation({mutationFn: (data: CreateCampusInput) => createCampus(data)});
export const useUpdateCampus = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: Partial<CreateCampusInput>}) => updateCampus(payload),
  });
export const useDeleteCampus = () => useMutation({mutationFn: deleteCampus});

export const getGetCursosQueryKey = (campusId?: string) =>
  ["/api/v1/academic/cursos", campusId] as const;
export const useGetCursos = (options?: {
  campusId?: string;
  initialData?: Awaited<ReturnType<typeof getCursos>>;
}) =>
  useQuery({
    queryKey: getGetCursosQueryKey(options?.campusId),
    queryFn: () => getCursos(options?.campusId),
    initialData: options?.initialData,
  });
export const useCreateCurso = () =>
  useMutation({mutationFn: (data: CreateCursoInput) => createCurso(data)});
export const useUpdateCurso = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: Partial<CreateCursoInput>}) => updateCurso(payload),
  });
export const useDeleteCurso = () => useMutation({mutationFn: deleteCurso});

export const getGetDisciplinasQueryKey = () => ["/api/v1/academic/disciplinas"] as const;
export const useGetDisciplinas = (options?: {
  initialData?: Awaited<ReturnType<typeof getDisciplinas>>;
}) =>
  useQuery({
    queryKey: getGetDisciplinasQueryKey(),
    queryFn: getDisciplinas,
    initialData: options?.initialData,
  });
export const useCreateDisciplina = () =>
  useMutation({mutationFn: (data: CreateDisciplinaInput) => createDisciplina(data)});
export const useUpdateDisciplina = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: Partial<CreateDisciplinaInput>}) =>
      updateDisciplina(payload),
  });
export const useDeleteDisciplina = () => useMutation({mutationFn: deleteDisciplina});

export const getGetMatrizesQueryKey = (cursoId?: string) =>
  ["/api/v1/academic/matrizes", cursoId] as const;
export const useGetMatrizes = (options?: {
  cursoId?: string;
  initialData?: Awaited<ReturnType<typeof getMatrizes>>;
}) =>
  useQuery({
    queryKey: getGetMatrizesQueryKey(options?.cursoId),
    queryFn: () => getMatrizes(options?.cursoId),
    initialData: options?.initialData,
  });
export const useGetMatriz = (id: string, options?: {initialData?: Awaited<ReturnType<typeof getMatriz>>}) =>
  useQuery({
    queryKey: ["/api/v1/academic/matrizes", id],
    queryFn: () => getMatriz(id),
    initialData: options?.initialData,
    enabled: Boolean(id),
  });
export const useCreateMatriz = () =>
  useMutation({mutationFn: (data: CreateMatrizInput) => createMatriz(data)});
export const useDeleteMatriz = () => useMutation({mutationFn: deleteMatriz});
export const useGetAuditoriaMec = (
  id: string,
  options?: {initialData?: Awaited<ReturnType<typeof getAuditoriaMec>>},
) =>
  useQuery({
    queryKey: ["/api/v1/academic/matrizes", id, "auditoria-mec"],
    queryFn: () => getAuditoriaMec(id),
    initialData: options?.initialData,
    enabled: Boolean(id),
    retry: false,
  });
export const useGetComponentesMatriz = (
  id: string,
  options?: {initialData?: Awaited<ReturnType<typeof getComponentesMatriz>>},
) =>
  useQuery({
    queryKey: ["/api/v1/academic/matrizes", id, "componentes"],
    queryFn: () => getComponentesMatriz(id),
    initialData: options?.initialData,
    enabled: Boolean(id),
  });
export const useAddComponenteMatriz = () =>
  useMutation({mutationFn: (data: AddComponenteInput) => addComponenteMatriz(data)});
export const useDeleteComponente = () => useMutation({mutationFn: deleteComponente});

export const getGetTurmasQueryKey = (query?: DashboardPeriodQuery & {campusId?: string}) =>
  ["/api/v1/academic/turmas", query] as const;
export const useGetTurmas = (options?: {
  query?: {campusId?: string; anoLetivo?: number; semestreLetivo?: number};
  initialData?: Awaited<ReturnType<typeof getTurmas>>;
}) =>
  useQuery({
    queryKey: getGetTurmasQueryKey(options?.query),
    queryFn: () => getTurmas(options?.query),
    initialData: options?.initialData,
  });
export const useGetTurma = (id: string, options?: {initialData?: Awaited<ReturnType<typeof getTurma>>}) =>
  useQuery({
    queryKey: ["/api/v1/academic/turmas", id],
    queryFn: () => getTurma(id),
    initialData: options?.initialData,
    enabled: Boolean(id),
  });
export const useCreateTurma = () =>
  useMutation({mutationFn: (data: CreateTurmaInput) => createTurma(data)});
export const useDeleteTurma = () => useMutation({mutationFn: deleteTurma});

export const getGetDiariosQueryKey = (query?: {turmaId?: string}) =>
  ["/api/v1/diario", query] as const;
export const useGetDiarios = (options?: {
  query?: {turmaId?: string; matriculaId?: string};
  initialData?: Awaited<ReturnType<typeof getDiarios>>;
}) =>
  useQuery({
    queryKey: getGetDiariosQueryKey(options?.query),
    queryFn: () => getDiarios(options?.query),
    initialData: options?.initialData,
  });
export const useEnturmarAluno = () =>
  useMutation({
    mutationFn: (data: {matriculaId: string; turmaId: string}) => enturmarAluno(data),
  });
export const useAvaliarDiario = () =>
  useMutation({mutationFn: (data: UpdateGradesInput) => avaliarDiario(data)});
export const useFecharSemestre = () =>
  useMutation({mutationFn: (data: FecharSemestreInput) => fecharSemestre(data)});
export const useDeleteDiario = () => useMutation({mutationFn: deleteDiario});

export const getGetUsersQueryKey = () => ["/api/v1/users"] as const;
export const useGetUsers = (options?: {initialData?: Awaited<ReturnType<typeof getUsers>>}) =>
  useQuery({queryKey: getGetUsersQueryKey(), queryFn: () => getUsers(), initialData: options?.initialData});
export const useCreateAdminUser = () =>
  useMutation({mutationFn: (data: CreateAdminInput) => createAdminUser(data)});
export const getGetProfessoresQueryKey = () => ["/api/v1/users/professores"] as const;
export const useGetProfessores = (options?: {
  initialData?: Awaited<ReturnType<typeof getProfessores>>;
}) =>
  useQuery({
    queryKey: getGetProfessoresQueryKey(),
    queryFn: getProfessores,
    initialData: options?.initialData,
  });
export const useCreateProfessor = () =>
  useMutation({mutationFn: (data: CreateProfessorInput) => createProfessor(data)});
export const useGetAlunos = (options?: {initialData?: Awaited<ReturnType<typeof getAlunos>>}) =>
  useQuery({
    queryKey: ["/api/v1/users/alunos"],
    queryFn: getAlunos,
    initialData: options?.initialData,
  });
export const useUpdateUser = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: UpdateUserInput}) => updateUser(payload),
  });
export const useUpdateProfessor = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: UpdateProfessorInput}) => updateProfessor(payload),
  });
export const useDeleteUser = () => useMutation({mutationFn: deleteUser});

export const getGetMatriculasQueryKey = (status?: StatusMatricula) =>
  ["/api/v1/matriculas", status] as const;
export const useGetMatriculas = (options?: {
  status?: StatusMatricula;
  initialData?: Awaited<ReturnType<typeof getMatriculas>>;
}) =>
  useQuery({
    queryKey: getGetMatriculasQueryKey(options?.status),
    queryFn: () => getMatriculas(options?.status),
    initialData: options?.initialData,
  });
export const useCreateMatricula = () =>
  useMutation({mutationFn: (data: CreateMatriculaInput) => createMatricula(data)});
export const useUpdateMatriculaStatus = () =>
  useMutation({
    mutationFn: (payload: {id: string; status: StatusMatricula}) => updateMatriculaStatus(payload),
  });
export const useDeleteMatricula = () => useMutation({mutationFn: deleteMatricula});

export const getGetPrecosQueryKey = () => ["/api/v1/financeiro/precos"] as const;
export const useGetPrecos = (options?: {initialData?: Awaited<ReturnType<typeof getPrecos>>}) =>
  useQuery({queryKey: getGetPrecosQueryKey(), queryFn: getPrecos, initialData: options?.initialData});
export const useCreatePreco = () =>
  useMutation({mutationFn: (data: {cursoId: string; valor: number}) => createPreco(data)});
export const useUpdatePreco = () =>
  useMutation({
    mutationFn: (payload: {id: string; data: {valor?: number; ativo?: boolean}}) =>
      updatePreco(payload),
  });
export const useDeletePreco = () => useMutation({mutationFn: deletePreco});

export const getGetFaturasQueryKey = () => ["/api/v1/financeiro/faturas"] as const;
export const useGetFaturas = (options?: {initialData?: Awaited<ReturnType<typeof getFaturas>>}) =>
  useQuery({queryKey: getGetFaturasQueryKey(), queryFn: () => getFaturas(), initialData: options?.initialData});
export const useCreateFatura = () =>
  useMutation({mutationFn: (data: CreateFaturaInput) => createFatura(data)});
export const useUpdateFaturaStatus = () =>
  useMutation({
    mutationFn: (payload: {id: string; status: StatusFatura}) => updateFaturaStatus(payload),
  });

export const getGetComunicadosQueryKey = (query?: {publicoAlvo?: AuthRole}) =>
  ["/api/v1/comunicados", query] as const;
export const useGetComunicados = (options?: {
  query?: {publicoAlvo?: AuthRole};
  initialData?: Awaited<ReturnType<typeof getComunicados>>;
}) =>
  useQuery({
    queryKey: getGetComunicadosQueryKey(options?.query),
    queryFn: () => getComunicados(options?.query),
    initialData: options?.initialData,
  });
export const useCreateComunicado = () =>
  useMutation({mutationFn: (data: CreateComunicadoInput) => createComunicado(data)});
export const useDeleteComunicado = () => useMutation({mutationFn: deleteComunicado});

export const getGetReclamacoesQueryKey = () => ["/api/v1/ouvidoria/reclamacoes"] as const;
export const useGetReclamacoes = (options?: {
  initialData?: Awaited<ReturnType<typeof getReclamacoes>>;
}) =>
  useQuery({
    queryKey: getGetReclamacoesQueryKey(),
    queryFn: () => getReclamacoes(),
    initialData: options?.initialData,
  });
export const useResponderReclamacao = () =>
  useMutation({
    mutationFn: (payload: {id: string; resposta: string}) => responderReclamacao(payload),
  });
export const useFecharReclamacao = () => useMutation({mutationFn: fecharReclamacao});
