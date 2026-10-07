import { redirect } from "next/navigation";

import { LoginAdminForm } from "@/components/auth/login-admin-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSession, isAdminRole } from "@/lib/auth/get-session";

const LoginAdminPage = async () => {
  const session = await getSession();

  if (session && isAdminRole(session.role)) {
    redirect("/area-admin/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginAdminPage;
