import {ArrowRight} from "lucide-react";
import Link from "next/link";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import type {CatalogoCurso} from "@/lib/api/fetch-generated";
import {
  formatDuracaoMeses,
  getModalidadeLabel,
  getTipoGraduacaoLabel,
} from "@/lib/public/catalog";

interface InscricaoCourseCardProps {
  curso: CatalogoCurso;
}

export const InscricaoCourseCard = ({curso}: InscricaoCourseCardProps) => {
  return (
    <Card className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white py-0 ring-0 shadow-none">
      <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {`${getTipoGraduacaoLabel(curso.tipoGraduacao)} | ${formatDuracaoMeses(curso.duracaoSemestres)}`}
          </p>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
              Graduação
            </p>
            <Badge className="h-auto rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-none hover:bg-blue-600">
              {getModalidadeLabel(curso.modalidade)}
            </Badge>
          </div>
          <h3 className="font-heading text-xl font-bold text-slate-900">
            {curso.nome}
          </h3>
        </div>
        <Button
          className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
          nativeButton={false}
          render={<Link href={`/inscricao/${curso.cursoId}`} />}
        >
          Saiba mais
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
};
