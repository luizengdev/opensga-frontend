import Link from "next/link";
import {redirect} from "next/navigation";

import {LoginAlunoBrandPanel} from "@/components/auth/login-aluno-brand-panel";
import {LoginAlunoForm} from "@/components/auth/login-aluno-form";
import {NexaUniversityMark} from "@/components/auth/nexa-university-mark";
import {buttonVariants} from "@/components/ui/button";
import {getSession, isAlunoRole} from "@/lib/auth/get-session";
import {cn} from "@/lib/utils";

const LoginAlunoPage = async () => {
  const session = await getSession();

  if (session && isAlunoRole(session.role)) {
    redirect("/area-aluno/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <section className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-10 lg:mb-16">
          <NexaUniversityMark />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Área do aluno
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Olá.
            <br />
            Que bom ter você de volta.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Entre com e-mail, CPF ou RA. Responsáveis do aluno menor usam o
            mesmo acesso.
          </p>

          <div className="mt-8">
            <LoginAlunoForm />
          </div>

          <div className="mt-8 flex flex-col gap-1">
            <Link
              className={cn(buttonVariants({variant: "link"}), "h-auto justify-start px-0")}
              href="/inscricao"
            >
              Ainda não tem matrícula? Inscreva-se
            </Link>
            <Link
              className={cn(buttonVariants({variant: "link"}), "h-auto justify-start px-0")}
              href="/login-admin"
            >
              Acesso da secretaria e docentes
            </Link>
          </div>
        </div>
      </section>

      <LoginAlunoBrandPanel />
    </div>
  );
};

export default LoginAlunoPage;
