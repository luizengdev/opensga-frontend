import { redirect } from "next/navigation";

import { getSession, isAlunoRole, type Session } from "./get-session";

export const requireAlunoSession = async (): Promise<Session> => {
  const session = await getSession();

  if (!session || !isAlunoRole(session.role)) {
    redirect("/login-aluno");
  }

  return session;
};
