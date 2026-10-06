import type {ReactNode} from "react";

import {AdminShell} from "@/components/admin/admin-shell";
import {QueryProvider} from "@/components/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {getMe} from "@/lib/api/fetch-generated";
import {getSession, isAdminRole} from "@/lib/auth/get-session";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = async ({children}: AdminLayoutProps) => {
  const session = await getSession();

  if (!session || !isAdminRole(session.role)) {
    return children;
  }

  const me = await getMe();

  return (
    <QueryProvider>
      <AdminShell email={me.email} nome={me.nome} role={session.role}>
        {children}
      </AdminShell>
      <Toaster />
    </QueryProvider>
  );
};

export default AdminLayout;
