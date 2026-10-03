import { redirect } from "next/navigation";

import { getSession, isAdminRole, type Session } from "./get-session";

export const requireAdminSession = async (): Promise<Session> => {
  const session = await getSession();

  if (!session || !isAdminRole(session.role)) {
    redirect("/login-admin");
  }

  return session;
};
