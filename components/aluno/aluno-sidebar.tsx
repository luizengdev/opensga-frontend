"use client";

import {
  Bell,
  BookOpen,
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import {NexaUniversityMark} from "@/components/auth/nexa-university-mark";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ALUNO_NAV_ITEMS, withAlunoQuery} from "@/lib/aluno/nav";
import type {MeProfile, PortalMatricula} from "@/lib/api/fetch-generated";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";

const NAV_ICONS = {
  "/area-aluno/dashboard": LayoutDashboard,
  "/area-aluno/notas": GraduationCap,
  "/area-aluno/curso": BookOpen,
  "/area-aluno/matricula": FileCheck2,
  "/area-aluno/faturas": CreditCard,
  "/area-aluno/documentos": FileText,
  "/area-aluno/comunicados": Bell,
  "/area-aluno/ouvidoria": MessageSquare,
  "/area-aluno/perfil": UserCheck,
} as const;

interface AlunoSidebarProps {
  isOpenMobile: boolean;
  matricula: PortalMatricula | null;
  me: MeProfile;
  onCloseMobile: () => void;
  selectedAlunoId: string | null;
}

export const AlunoSidebar = ({
  isOpenMobile,
  matricula,
  me,
  onCloseMobile,
  selectedAlunoId,
}: AlunoSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResponsavel = me.role === "RESPONSAVEL";
  const dependentes = me.dependentes ?? [];

  const handleLogout = () => {
    void clearAuthTokenCookie().then(() => {
      window.location.assign("/login-aluno");
    });
  };

  const handleDependentChange = (alunoId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("alunoId", alunoId);
    router.push(`${pathname}?${params.toString()}`);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile ? (
        <Button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 h-full w-full rounded-none bg-foreground/60 backdrop-blur-xs hover:bg-foreground/60 md:hidden"
          onClick={onCloseMobile}
          variant="ghost"
        />
      ) : null}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-sidebar-border/80 p-5">
          <div className="min-w-0 flex-1 space-y-2">
            <NexaUniversityMark compact tone="inverse" />
            <div className="flex items-center gap-2 pl-0.5">
              <p className="font-sans text-xs font-medium text-sidebar-muted">Portal do Aluno</p>
              <span className="rounded bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-sidebar-foreground">
                {isResponsavel ? "RESPONSÁVEL" : "ALUNO"}
              </span>
            </div>
          </div>
          <Button
            aria-label="Fechar menu"
            className="size-8 shrink-0 text-sidebar-muted hover:text-sidebar-foreground md:hidden"
            onClick={onCloseMobile}
            size="icon-sm"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        {isResponsavel && dependentes.length > 0 ? (
          <div className="mx-3 mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent p-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-sidebar-muted">
              <span className="flex items-center gap-1">
                <Users className="size-3.5 text-sidebar-foreground" /> Dependente
              </span>
              <span className="font-mono text-xs">{dependentes.length} vinculados</span>
            </div>
            <Select
              items={dependentes.map((dependente) => ({
                value: dependente.id,
                label: `${dependente.nome} (${dependente.ra})`,
              }))}
              onValueChange={(next) => {
                if (typeof next === "string" && next.length > 0) {
                  handleDependentChange(next);
                }
              }}
              value={selectedAlunoId}
            >
              <SelectTrigger className="h-8 w-full border-sidebar-border bg-sidebar text-xs font-bold text-sidebar-foreground">
                <SelectValue placeholder="Selecione">
                  {() => {
                    const ativo = dependentes.find((dependente) => dependente.id === selectedAlunoId);
                    return ativo ? `${ativo.nome} (${ativo.ra})` : "Selecione";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dependentes.map((dependente) => (
                  <SelectItem
                    key={dependente.id}
                    label={`${dependente.nome} (${dependente.ra})`}
                    value={dependente.id}
                  >
                    {dependente.nome} ({dependente.ra})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="border-b border-sidebar-border/60 px-5 py-3">
          <div className="flex items-center justify-between font-mono text-xs font-semibold text-sidebar-muted">
            <span>RA {matricula?.ra ?? me.aluno?.ra ?? "—"}</span>
            <span>{matricula ? `${matricula.periodoAtual}º período` : "—"}</span>
          </div>
          <p className="mt-0.5 truncate text-xs font-bold text-sidebar-foreground">
            {matricula?.curso.nome ?? "Sem matrícula ativa"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ALUNO_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS] ?? LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Button
                className={`h-auto w-full justify-start gap-3 px-3 py-2.5 text-xs ${
                  isActive
                    ? "bg-sidebar-accent font-bold text-sidebar-accent-foreground shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    : "font-semibold text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                key={item.href}
                nativeButton={false}
                onClick={onCloseMobile}
                render={<Link href={withAlunoQuery(item.href, selectedAlunoId)} />}
                variant="ghost"
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/80 p-3">
          <Button
            className="h-auto w-full justify-start gap-3 px-3 py-2 text-xs font-semibold text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={handleLogout}
            variant="ghost"
          >
            <LogOut className="size-4" />
            Encerrar sessão
          </Button>
        </div>
      </aside>
    </>
  );
};
