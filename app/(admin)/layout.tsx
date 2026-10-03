import Link from "next/link";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground">
        <p className="font-heading text-base font-medium">Área administrativa</p>
        <nav className="flex flex-col gap-1">
          <Link
            href="/area-admin/dashboard"
            className="rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/area-admin/turmas"
            className="rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Turmas
          </Link>
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
