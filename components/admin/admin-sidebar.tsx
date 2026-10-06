"use client";

import {
  BookOpen,
  Building2,
  Calendar,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LogOut,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

import {Button} from "@/components/ui/button";
import {getAdminNavGroups} from "@/lib/admin/nav";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";
import type {SessionRole} from "@/lib/auth/roles";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/area-admin/dashboard": LayoutDashboard,
  "/area-admin/turmas": Calendar,
  "/area-admin/matrizes": Layers,
  "/area-admin/disciplinas": BookOpen,
  "/area-admin/cursos": GraduationCap,
  "/area-admin/campi": Building2,
  "/area-admin/matriculas": FileCheck2,
  "/area-admin/usuarios": Users,
  "/area-admin/financeiro/precos": Tag,
  "/area-admin/financeiro/faturas": Receipt,
  "/area-admin/comunicados": Megaphone,
  "/area-admin/ouvidoria": MessageSquareWarning,
};

interface AdminSidebarProps {
  email: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  role: SessionRole;
}

export const AdminSidebar = ({
  email,
  isOpenMobile,
  onCloseMobile,
  role,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const navGroups = getAdminNavGroups(role);
  const initial = email.charAt(0).toUpperCase();
  const isProfessor = role === "PROFESSOR";

  const handleLogout = () => {
    void clearAuthTokenCookie().then(() => {
      window.location.assign("/login-admin");
    });
  };

  return (
    <>
      {isOpenMobile ? (
        <Button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 h-full w-full rounded-none bg-background/80 backdrop-blur-xs hover:bg-background/80 md:hidden"
          onClick={onCloseMobile}
          variant="ghost"
        />
      ) : null}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-sidebar-primary font-serif text-base font-bold text-sidebar-primary-foreground shadow-xs">
              Ω
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base font-semibold tracking-tight text-sidebar-foreground">
                OpenSGA
              </span>
              <span className="text-[10px] tracking-tight text-sidebar-foreground/70">
                Portal Administrativo
              </span>
            </div>
          </div>
          <span
            className={`rounded-[calc(var(--radius)-4px)] border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide ${
              isProfessor
                ? "border-primary/30 bg-primary/15 text-primary"
                : "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
            }`}
          >
            {isProfessor ? "DOCENTE" : "ADMIN"}
          </span>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div className="space-y-1" key={group.group}>
              <div className="px-3 pb-1 text-[11px] font-medium tracking-wider text-sidebar-foreground/60 uppercase">
                {group.group}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Button
                      className={`h-auto w-full justify-start gap-2.5 px-3 py-2 text-xs font-medium ${
                        isActive
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                      key={item.href}
                      nativeButton={false}
                      onClick={onCloseMobile}
                      render={<Link href={item.href} />}
                      variant="ghost"
                    >
                      <Icon
                        className={`size-4 shrink-0 stroke-[1.8] ${
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/70"
                        }`}
                      />
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {isActive ? (
                        <ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/50" />
                      ) : null}
                    </Button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-sidebar-border bg-sidebar/50 p-3">
          <div className="flex items-center gap-3 rounded-[calc(var(--radius)-4px)] p-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] text-sidebar-foreground/60">
                {email}
              </p>
            </div>
            <Button
              aria-label="Sair"
              className="size-8 text-sidebar-foreground/60 hover:text-destructive"
              onClick={handleLogout}
              size="icon-sm"
              title="Encerrar sessão"
              variant="ghost"
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
