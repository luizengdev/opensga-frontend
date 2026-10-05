import { redirect } from "next/navigation";

import { getSession, isAdminRole } from "@/lib/auth/get-session";

const LoginAdminPage = async () => {
  const session = await getSession();

  if (session && isAdminRole(session.role)) {
    redirect("/area-admin/dashboard");
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-xl font-medium text-foreground">
        Login administrativo
      </h1>
      <p className="text-muted-foreground">
        OpenSGA — acesso para admin e professor.
      </p>
    </div>
  );
};

export default LoginAdminPage;
