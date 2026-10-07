"use client";

import {type ReactNode, useState} from "react";

import {AdminHeader} from "@/components/admin/admin-header";
import {AdminSidebar} from "@/components/admin/admin-sidebar";
import {SessionIdleGuard} from "@/components/auth/session-idle-guard";
import type {Parametrizacoes} from "@/lib/api/fetch-generated";
import type {SessionRole} from "@/lib/auth/roles";
import {ADMIN_IDLE_MS} from "@/lib/auth/session-idle";

interface AdminShellProps {
  children: ReactNode;
  email: string;
  initialParametrizacoes: Parametrizacoes;
  nome: string;
  role: SessionRole;
}

export const AdminShell = ({
  children,
  email,
  initialParametrizacoes,
  nome,
  role,
}: AdminShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <SessionIdleGuard idleMs={ADMIN_IDLE_MS} loginPath="/login-admin" />
      <AdminSidebar
        email={email}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        role={role}
      />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <AdminHeader
          email={email}
          initialParametrizacoes={initialParametrizacoes}
          nome={nome}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          role={role}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
