import {Card, CardContent} from "@/components/ui/card";
import {formatCurrencyBrl} from "@/lib/admin/format";
import type {buildVolumeFinanceiro} from "@/lib/admin/academic-charts";

interface AcademicChartFinanceiroProps {
  periodoLabel: string;
  volume: ReturnType<typeof buildVolumeFinanceiro>;
}

export const AcademicChartFinanceiro = ({periodoLabel, volume}: AcademicChartFinanceiroProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4">
        <div className="space-y-1 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Conciliação financeira de mensalidades</span>
            <span className="font-mono text-[11px] font-bold">{formatCurrencyBrl(volume.total)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Volume Stripe no período {periodoLabel}: liquidado, a vencer e inadimplência.
          </p>
        </div>

        <div className="flex h-4 overflow-hidden rounded-[calc(var(--radius)-4px)] border border-border bg-muted">
          {volume.pctLiquidado > 0 ? (
            <div className="h-full bg-success" style={{width: `${volume.pctLiquidado}%`}} />
          ) : null}
          {volume.pctAVencer > 0 ? (
            <div className="h-full bg-warning" style={{width: `${volume.pctAVencer}%`}} />
          ) : null}
          {volume.pctInadimplencia > 0 ? (
            <div className="h-full bg-destructive" style={{width: `${volume.pctInadimplencia}%`}} />
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-[calc(var(--radius)-4px)] border border-success/20 bg-success/10 p-2.5">
            <span className="block text-[10px] font-medium text-success-foreground">Liquidado</span>
            <span className="mt-0.5 block font-mono text-xs font-bold tabular-nums text-success-foreground">
              {formatCurrencyBrl(volume.liquidado)}
            </span>
            <span className="font-mono text-[10px] text-success-foreground">({volume.pctLiquidado}%)</span>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-warning/20 bg-warning/10 p-2.5">
            <span className="block text-[10px] font-medium text-warning-foreground">A vencer</span>
            <span className="mt-0.5 block font-mono text-xs font-bold tabular-nums text-warning-foreground">
              {formatCurrencyBrl(volume.aVencer)}
            </span>
            <span className="font-mono text-[10px] text-warning-foreground">({volume.pctAVencer}%)</span>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-destructive/30 bg-destructive/10 p-2.5">
            <span className="block text-[10px] font-medium text-destructive">Inadimplência</span>
            <span className="mt-0.5 block font-mono text-xs font-bold tabular-nums text-destructive">
              {formatCurrencyBrl(volume.inadimplencia)}
            </span>
            <span className="font-mono text-[10px] text-destructive">({volume.pctInadimplencia}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span>Taxa de adimplência em dia</span>
          <span className="font-mono font-semibold text-success-foreground">
            {volume.pctLiquidado}% faturamento recuperado
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
