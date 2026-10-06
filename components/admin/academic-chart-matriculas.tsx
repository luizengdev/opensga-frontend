import {Card, CardContent} from "@/components/ui/card";
import {countByStatus, toPercent} from "@/lib/admin/academic-charts";
import type {StatusMatricula} from "@/lib/api/fetch-generated";

interface AcademicChartMatriculasProps {
  matriculasPorStatus: {status: StatusMatricula; quantidade: number}[];
}

export const AcademicChartMatriculas = ({
  matriculasPorStatus,
}: AcademicChartMatriculasProps) => {
  const total = matriculasPorStatus.reduce((acc, item) => acc + item.quantidade, 0);
  const ativos = countByStatus(matriculasPorStatus, "ATIVO");
  const pre = countByStatus(matriculasPorStatus, "PRE_MATRICULADO");
  const trancados = countByStatus(matriculasPorStatus, "TRANCADO");
  const cancelados = countByStatus(matriculasPorStatus, "CANCELADO");
  const pctAtivos = toPercent(ativos, total);
  const pctPre = toPercent(pre, total);
  const pctTrancados = toPercent(trancados, total);
  const pctCancelados = toPercent(cancelados, total);
  const retencao = pctAtivos + pctPre;

  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4">
        <div className="space-y-1 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Composição do corpo discente</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Total: {total} registros
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Funil de retenção: ativos, pré-matriculados, trancados e cancelados.
          </p>
        </div>

        <div className="flex h-6 overflow-hidden rounded-[calc(var(--radius)-4px)] border border-border bg-muted p-0.5">
          {pctAtivos > 0 ? (
            <div className="h-full bg-success" style={{width: `${pctAtivos}%`}} title={`Ativos: ${ativos}`} />
          ) : null}
          {pctPre > 0 ? (
            <div className="h-full bg-info" style={{width: `${pctPre}%`}} title={`Pré-matriculados: ${pre}`} />
          ) : null}
          {pctTrancados > 0 ? (
            <div className="h-full bg-warning" style={{width: `${pctTrancados}%`}} title={`Trancados: ${trancados}`} />
          ) : null}
          {pctCancelados > 0 ? (
            <div
              className="h-full bg-destructive"
              style={{width: `${pctCancelados}%`}}
              title={`Cancelados: ${cancelados}`}
            />
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-success" />
              Ativos
            </div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums">
              {ativos}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">({pctAtivos}%)</span>
            </div>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-info" />
              Pré-matr.
            </div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums">
              {pre}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">({pctPre}%)</span>
            </div>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-warning" />
              Trancados
            </div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums">
              {trancados}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">({pctTrancados}%)</span>
            </div>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-destructive" />
              Cancelados
            </div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums">
              {cancelados}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">({pctCancelados}%)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span>Índice de retenção acadêmica líquida</span>
          <span className="font-mono font-semibold text-foreground">{retencao}% no ciclo ativo</span>
        </div>
      </CardContent>
    </Card>
  );
};
