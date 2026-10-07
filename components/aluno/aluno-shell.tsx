"use client";

import {useState, type ReactNode} from "react";
import {useSearchParams} from "next/navigation";

import {AlunoHeader} from "@/components/aluno/aluno-header";
import {AlunoMobileNav} from "@/components/aluno/aluno-mobile-nav";
import {AlunoSidebar} from "@/components/aluno/aluno-sidebar";
import {useGetMe, useGetPortalContexto} from "@/lib/api/rc-generated";
import type {MeProfile} from "@/lib/api/fetch-generated";

interface AlunoShellProps {
  children: ReactNode;
  initialMe: MeProfile;
}

export const AlunoShell = ({children, initialMe}: AlunoShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const alunoIdParam = searchParams.get("alunoId") ?? undefined;

  const {data: me} = useGetMe({query: {initialData: initialMe}});
  const profile = me ?? initialMe;
  const selectedAlunoId =
    alunoIdParam ?? profile.aluno?.id ?? profile.dependentes[0]?.id ?? null;

  const {data: contexto} = useGetPortalContexto({
    alunoId: selectedAlunoId ?? undefined,
  });

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <AlunoSidebar
        isOpenMobile={isMobileSidebarOpen}
        matricula={contexto?.matricula ?? null}
        me={profile}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        selectedAlunoId={selectedAlunoId}
      />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <AlunoHeader
          matricula={contexto?.matricula ?? null}
          me={profile}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          selectedAlunoId={selectedAlunoId}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-8 md:pb-12">{children}</main>
      </div>
      <AlunoMobileNav
        onOpenMore={() => setIsMobileSidebarOpen(true)}
        selectedAlunoId={selectedAlunoId}
      />
    </div>
  );
};
