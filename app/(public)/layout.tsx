import type {Metadata} from "next";
import type {ReactNode} from "react";

import {NexaMotionProvider} from "@/components/public/nexa-motion-provider";
import {PublicFooter} from "@/components/public/public-footer";
import {PublicNavbar} from "@/components/public/public-navbar";

export const metadata: Metadata = {
  title: "Nexa University | Formando líderes para a economia global",
  description:
    "Portal institucional e sistema de admissões da Nexa University. Excelência acadêmica, inovação tecnológica e alta empregabilidade executiva.",
};

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({children}: PublicLayoutProps) => {
  return (
    <div className="nexa-theme flex min-h-full flex-1 flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <NexaMotionProvider>
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </NexaMotionProvider>
    </div>
  );
};

export default PublicLayout;
