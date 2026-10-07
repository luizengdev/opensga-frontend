import {Suspense, type ReactNode} from "react";

import {AlunoShell} from "@/components/aluno/aluno-shell";
import {QueryProvider} from "@/components/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {getMe} from "@/lib/api/fetch-generated";
import {getSession, isAlunoRole} from "@/lib/auth/get-session";

interface AlunoLayoutProps {
  children: ReactNode;
}

const AlunoLayout = async ({children}: AlunoLayoutProps) => {
  const session = await getSession();

  if (!session || !isAlunoRole(session.role)) {
    return children;
  }

  const me = await getMe();

  return (
    <QueryProvider>
      <Suspense>
        <AlunoShell initialMe={me}>{children}</AlunoShell>
      </Suspense>
      <Toaster />
    </QueryProvider>
  );
};

export default AlunoLayout;
