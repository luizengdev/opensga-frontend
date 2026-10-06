"use client";

import {type ReactNode, useState} from "react";

import {AdminHeader} from "@/components/admin/admin-header";
import {AdminSidebar} from "@/components/admin/admin-sidebar";
import type {SessionRole} from "@/lib/auth/roles";

interface AdminShellProps {
  children: ReactNode;
  email: string;
  nome: string;
  role: SessionRole;
}

export const AdminShell = ({children, email, nome, role}: AdminShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <AdminSidebar
        email={email}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        role={role}
      />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <AdminHeader
          email={email}
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
