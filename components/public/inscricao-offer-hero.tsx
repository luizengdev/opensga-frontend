import {Badge} from "@/components/ui/badge";
import type {CatalogoCurso} from "@/lib/api/fetch-generated";
import {
  formatDuracaoMeses,
  getModalidadeLabel,
} from "@/lib/public/catalog";

interface InscricaoOfferHeroProps {
  curso: CatalogoCurso;
}

export const InscricaoOfferHero = ({curso}: InscricaoOfferHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_42%)]" />
      <div className="relative mx-auto flex min-h-64 max-w-7xl flex-col justify-end gap-4 px-4 py-12 sm:px-6 lg:min-h-80 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
            Graduação
          </Badge>
          <Badge className="rounded-full bg-blue-600 text-white hover:bg-blue-600">
            {getModalidadeLabel(curso.modalidade)}
          </Badge>
        </div>
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {curso.nome}
        </h1>
        <p className="text-sm text-slate-300">{formatDuracaoMeses(curso.duracaoSemestres)}</p>
      </div>
    </section>
  );
};
