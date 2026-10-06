"use client";

import {Calendar, ChevronDown, LogOut, Menu, Moon, School, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {usePathname} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatPeriodoLetivo,
  getPeriodoLetivoAtual,
} from "@/lib/academic/periodo-letivo";
import {getAdminBreadcrumb} from "@/lib/admin/nav";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";
import type {SessionRole} from "@/lib/auth/roles";

interface AdminHeaderProps {
  email: string;
  nome: string;
  onOpenMobileSidebar: () => void;
  role: SessionRole;
}

export const AdminHeader = ({
  email,
  nome,
  onOpenMobileSidebar,
  role,
}: AdminHeaderProps) => {
  const pathname = usePathname();
  const periodo = getPeriodoLetivoAtual();
  const {resolvedTheme, setTheme} = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const initial = nome.charAt(0).toUpperCase();
  const cargo = role === "ADMIN" ? "Secretaria Geral" : "Docente Titular";

  const handleLogout = () => {
    void clearAuthTokenCookie().then(() => {
      window.location.assign("/login-admin");
    });
  };

  const handleToggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-xs sm:px-6">
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
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
            <School className="size-3.5" />
            <span>OpenSGA</span>
            <span>/</span>
          </div>
          <span className="font-semibold tracking-tight text-foreground">
            {getAdminBreadcrumb(pathname, role)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-[calc(var(--radius)-4px)] border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground lg:flex">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Período:</span>
          <span className="font-mono font-medium">
            {formatPeriodoLetivo(periodo)}
          </span>
        </div>

        <Button
          aria-label="Alternar tema claro ou escuro"
          onClick={handleToggleTheme}
          size="icon-sm"
          title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
          variant="outline"
        >
          {isDarkMode ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="h-auto gap-2 py-1 pr-1.5 pl-2" variant="ghost" />
            }
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initial}
            </span>
            <span className="hidden flex-col text-left xl:flex">
              <span className="max-w-[160px] truncate text-xs leading-tight font-medium text-foreground">
                {nome}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {cargo}
              </span>
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <div className="px-1.5 py-2">
              <p className="truncate text-xs font-medium text-foreground">{nome}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{email}</p>
              <p className="mt-1 font-mono text-[10px] font-medium text-foreground">
                Perfil: {role}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut />
              Encerrar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
