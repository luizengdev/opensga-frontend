import { redirect } from "next/navigation";

import { LoginAlunoForm } from "@/components/auth/login-aluno-form";
import { getSession, isAlunoRole } from "@/lib/auth/get-session";

const LoginAlunoPage = async () => {
  const session = await getSession();

  if (session && isAlunoRole(session.role)) {
    redirect("/area-aluno/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Login do aluno
        </h1>
        <p className="text-muted-foreground">
          OpenSGA — acesso para aluno e responsável.
        </p>
      </div>
      <LoginAlunoForm />
    </div>
  );
};

export default LoginAlunoPage;
