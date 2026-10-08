"use client";

import {GraduationCap, Moon, Sun, Menu} from "lucide-react";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useTheme} from "next-themes";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {displayName} from "@/lib/aluno/labels";
import {getAlunoBreadcrumb, withAlunoQuery} from "@/lib/aluno/nav";
import type {MeProfile, PortalMatricula} from "@/lib/api/fetch-generated";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";

interface AlunoHeaderProps {
  matricula: PortalMatricula | null;
  me: MeProfile;
  onOpenMobileSidebar: () => void;
  selectedAlunoId: string | null;
}

export const AlunoHeader = ({matricula, me, onOpenMobileSidebar, selectedAlunoId}: AlunoHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const {data: parametros} = useGetParametrizacoes();
  const periodo = getPeriodoLetivoAtual(parametros);
  const {resolvedTheme, setTheme} = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const isResponsavel = me.role === "RESPONSAVEL";
  const initial = me.nome.charAt(0).toUpperCase();

  const handleLogout = () => {
    void clearAuthTokenCookie().then(() => {
      window.location.assign("/login-aluno");
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Abrir menu de navegação"
          className="md:hidden"
          onClick={onOpenMobileSidebar}
          size="icon-sm"
          variant="ghost"
        >
          <Menu />
        </Button>
        <div className="flex items-center gap-2 md:hidden">
          <span className="flex size-7 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-primary text-primary-foreground shadow-xs">
            <GraduationCap className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Nexa <span className="font-medium text-muted-foreground">University</span>
          </span>
        </div>
        <div className="hidden items-center gap-2 font-mono text-xs font-semibold text-muted-foreground sm:flex">
          <span>Nexa</span>
          <span className="text-border">/</span>
          <span className="font-bold text-foreground">{getAlunoBreadcrumb(pathname)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground md:flex">
          <span>Período: {formatPeriodoLetivo(periodo)}</span>
        </div>
        <Button
          aria-label="Alternar tema claro ou escuro"
          onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          size="icon-sm"
          title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
          variant="ghost"
        >
          {isDarkMode ? <Sun className="text-warning" /> : <Moon />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="h-auto gap-2 border-l border-border py-1 pr-1.5 pl-2" variant="ghost" />
            }
          >
            <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-serif text-xs font-bold text-foreground">
              {me.avatarUrl ? (
                <Image
                  alt={me.nome}
                  className="object-cover"
                  fill
                  sizes="32px"
                  src={me.avatarUrl}
                  unoptimized
                />
              ) : (
                initial
              )}
            </span>
            <span className="hidden text-left text-xs leading-tight sm:block">
              <span className="block font-bold text-foreground">{displayName(me.nome)}</span>
              <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                {isResponsavel ? "Guarda Legal" : `RA ${matricula?.ra ?? me.aluno?.ra ?? "—"}`}
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <div className="px-1.5 py-2">
              <p className="truncate text-xs font-medium text-foreground">{me.nome}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{me.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(withAlunoQuery("/area-aluno/perfil", selectedAlunoId))}
            >
              Perfil e senha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              Encerrar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
