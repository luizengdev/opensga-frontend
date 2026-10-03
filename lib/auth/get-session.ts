import dayjs from "dayjs";
import { cookies } from "next/headers";

export type SessionRole = "ADMIN" | "PROFESSOR" | "ALUNO" | "RESPONSAVEL";

export interface Session {
  sub: string;
  role: SessionRole;
  email: string;
}

const SESSION_ROLES: SessionRole[] = [
  "ADMIN",
  "PROFESSOR",
  "ALUNO",
  "RESPONSAVEL",
];

const AUTH_COOKIE_NAME = "auth_token";

export const isAlunoRole = (role: SessionRole) => {
  return role === "ALUNO" || role === "RESPONSAVEL";
};

export const isAdminRole = (role: SessionRole) => {
  return role === "ADMIN" || role === "PROFESSOR";
};

const isSessionRole = (value: unknown): value is SessionRole => {
  return typeof value === "string" && SESSION_ROLES.some((role) => role === value);
};

const decodeJwtPayload = (token: string) => {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  const payloadSegment = segments[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const normalized = payloadSegment.replaceAll("-", "+").replaceAll("_", "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
    const parsed: unknown = JSON.parse(json);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const exp = payload.exp;

  if (typeof exp !== "number" || dayjs.unix(exp).isBefore(dayjs())) {
    return null;
  }

  const { sub, role, email } = payload;

  if (
    typeof sub !== "string" ||
    sub.length === 0 ||
    !isSessionRole(role) ||
    typeof email !== "string" ||
    email.length === 0
  ) {
    return null;
  }

  return { sub, role, email };
};
