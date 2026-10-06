import {Card, CardContent} from "@/components/ui/card";
import type {buildOcupacaoPorCampus} from "@/lib/admin/academic-charts";

interface AcademicChartOcupacaoProps {
  polos: ReturnType<typeof buildOcupacaoPorCampus>;
}

export const AcademicChartOcupacao = ({polos}: AcademicChartOcupacaoProps) => {
  const capacidade = polos.reduce((acc, polo) => acc + polo.capacidade, 0);
  const inscritos = polos.reduce((acc, polo) => acc + polo.inscritos, 0);
  const media = capacidade > 0 ? ((inscritos / capacidade) * 100).toFixed(1) : "0.0";
  const vagasLivres = polos.reduce((acc, polo) => acc + polo.vagasLivres, 0);

  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4">
        <div className="space-y-1 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Taxa de ocupação por campus e polo MEC</span>
            <span className="font-mono text-[11px] text-muted-foreground">Média geral: {media}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Capacidade física versus enturmações no período letivo vigente.
          </p>
        </div>

        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {polos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Não há turmas no período para calcular ocupação.</p>
          ) : (
            polos.map((polo, index) => (
              <div className="space-y-1" key={polo.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    {polo.nome} ({polo.codigoPolo})
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {polo.inscritos}/{polo.capacidade} ({polo.percentual}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
                  <div
                    className={index % 3 === 0 ? "h-full bg-primary" : index % 3 === 1 ? "h-full bg-chart-2" : "h-full bg-chart-4"}
                    style={{width: `${polo.percentual}%`}}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span>Vagas remanescentes para reopção de curso</span>
          <span className="font-mono font-medium text-foreground">{vagasLivres} vagas livres</span>
        </div>
      </CardContent>
    </Card>
  );
};
