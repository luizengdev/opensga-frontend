import { redirect } from "next/navigation";

import { LoginAdminForm } from "@/components/auth/login-admin-form";
import { getSession, isAdminRole } from "@/lib/auth/get-session";

const LoginAdminPage = async () => {
  const session = await getSession();

  if (session && isAdminRole(session.role)) {
    redirect("/area-admin/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Login administrativo
        </h1>
        <p className="text-muted-foreground">
          Acesso para secretaria, coordenação e corpo docente.
        </p>
      </div>
      <LoginAdminForm />
    </div>
  );
};

export default LoginAdminPage;
