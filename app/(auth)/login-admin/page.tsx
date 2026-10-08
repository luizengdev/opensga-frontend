import Link from "next/link";
import {redirect} from "next/navigation";

import {LoginAdminForm} from "@/components/auth/login-admin-form";
import {NexaUniversityMark} from "@/components/auth/nexa-university-mark";
import {buttonVariants} from "@/components/ui/button";
import {getSession, isAdminRole} from "@/lib/auth/get-session";
import {cn} from "@/lib/utils";

const LoginAdminPage = async () => {
  const session = await getSession();

  if (session && isAdminRole(session.role)) {
    redirect("/area-admin/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 py-8 sm:px-10">
      <NexaUniversityMark />

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
        <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">Acesso interno</h1>
        <p className="mt-2 text-sm text-muted-foreground">Secretaria, coordenação e corpo docente.</p>

        <div className="mt-8">
          <LoginAdminForm />
        </div>
      </div>
    </div>
  );
};

export default LoginAdminPage;
