import {ArrowLeft} from "lucide-react";
import Link from "next/link";

import {InscricaoForm} from "@/components/public/inscricao-form";
import {InscricaoSidebar} from "@/components/public/inscricao-sidebar";
import {Button} from "@/components/ui/button";

interface InscricaoPageProps {
  searchParams: Promise<{curso?: string}>;
}

const InscricaoPage = async ({searchParams}: InscricaoPageProps) => {
  const params = await searchParams;

  return (
    <div className="bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-12">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft />
            Voltar ao portal institucional
          </Button>
          <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            Nexa University Admissions
          </p>
        </div>
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 md:col-span-7">
            <InscricaoForm initialCourseId={params.curso} />
          </div>
          <div className="md:col-span-5">
            <InscricaoSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscricaoPage;
