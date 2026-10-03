import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-heading text-base font-medium text-foreground">
            OpenSGA
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/inscricao"
              className={buttonVariants({ variant: "ghost" })}
            >
              Inscrição
            </Link>
            <Link
              href="/login-aluno"
              className={buttonVariants({ variant: "outline" })}
            >
              Área do aluno
            </Link>
            <Link
              href="/login-admin"
              className={buttonVariants()}
            >
              Acesso interno
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-border bg-muted">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          OpenSGA — Portal Institucional
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
