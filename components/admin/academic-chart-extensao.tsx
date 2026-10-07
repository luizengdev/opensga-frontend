import {AlertTriangle, CheckCircle2} from "lucide-react";

import {Card, CardContent} from "@/components/ui/card";
import {chExtensaoDaAuditoria} from "@/lib/academic/carga-horaria";
import {REGULAMENTO_PADRAO} from "@/lib/academic/regulamento";
import {scaleExtensaoBar} from "@/lib/admin/academic-charts";
import {formatPercent} from "@/lib/admin/format";
import type {AuditoriaMec} from "@/lib/api/fetch-generated";

interface AcademicChartExtensaoProps {
  auditorias: AuditoriaMec[];
}

export const AcademicChartExtensao = ({auditorias}: AcademicChartExtensaoProps) => {
  const conformes = auditorias.filter((item) => item.cumpreRegra10PorcentoExtensao).length;
  const total = auditorias.length;
  const pdiOk = total > 0 && conformes === total;
  const metaExtensao =
    auditorias[0]?.percentualMinimoExtensao ?? REGULAMENTO_PADRAO.percentualMinimoExtensao;
  const marcaMeta = Math.min(metaExtensao * 6, 100);

  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4">
        <div className="space-y-1 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Termômetro de curricularização da extensão</span>
            <span className="font-mono text-[11px] font-bold text-foreground">
              Meta institucional: ≥ {metaExtensao.toFixed(1).replace(".", ",")}
              %
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Resolução CNE/CES nº 7/2018: percentual da carga horária dedicado à extensão universitária.
          </p>
        </div>

        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {auditorias.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma matriz curricular para auditar.</p>
          ) : (
            auditorias.map((item) => (
              <div className="space-y-1" key={item.matrizId}>
                <div className="flex items-center justify-between text-xs">
                  <span className="max-w-[240px] truncate font-medium">{item.cursoNome}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span
                      className={
                        item.cumpreRegra10PorcentoExtensao
                          ? "font-bold text-success-foreground"
                          : "font-bold text-warning-foreground"
                      }
                    >
                      {formatPercent(item.percentualExtensao)}
                    </span>
                    <span className="font-sans text-[10px] text-muted-foreground">
                      ({chExtensaoDaAuditoria(item)}h de {item.chTotalGeral}h)
                    </span>
                  </div>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full border border-border bg-muted">
                  <div
                    className={
                      item.cumpreRegra10PorcentoExtensao ? "h-full bg-success" : "h-full bg-warning"
                    }
                    style={{width: `${scaleExtensaoBar(item.percentualExtensao)}%`}}
                  />
                  <div
                    className="absolute inset-y-0 w-0.5 bg-foreground/60"
                    style={{left: `${marcaMeta}%`}}
                    title={`Meta institucional: ${metaExtensao}%`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span>Status do Plano de Desenvolvimento Institucional (PDI)</span>
          {pdiOk ? (
            <span className="inline-flex items-center gap-1 font-semibold text-success-foreground">
              <CheckCircle2 className="size-3.5" />
              Conformidade aprovada ({conformes}/{total})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-warning-foreground">
              <AlertTriangle className="size-3.5" />
              {conformes}/{total} matrizes conformes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
