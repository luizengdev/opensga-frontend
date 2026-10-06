export type SessionRole = "ADMIN" | "PROFESSOR" | "ALUNO" | "RESPONSAVEL";

const SESSION_ROLES: SessionRole[] = [
  "ADMIN",
  "PROFESSOR",
  "ALUNO",
  "RESPONSAVEL",
];

export const isAlunoRole = (role: SessionRole) => {
  return role === "ALUNO" || role === "RESPONSAVEL";
};

export const isAdminRole = (role: SessionRole) => {
  return role === "ADMIN" || role === "PROFESSOR";
};

export const isSessionRole = (value: unknown): value is SessionRole => {
  return typeof value === "string" && SESSION_ROLES.some((role) => role === value);
};
