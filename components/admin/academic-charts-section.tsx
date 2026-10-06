"use client";

import {cn} from "cn";
import {BarChart3} from "lucide-react";
import {useState} from "react";

import {AcademicChartExtensao} from "@/components/admin/academic-chart-extensao";
import {AcademicChartFinanceiro} from "@/components/admin/academic-chart-financeiro";
import {AcademicChartMatriculas} from "@/components/admin/academic-chart-matriculas";
import {AcademicChartOcupacao} from "@/components/admin/academic-chart-ocupacao";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {
  buildOcupacaoPorCampus,
  buildVolumeFinanceiro,
} from "@/lib/admin/academic-charts";
import type {
  AuditoriaMec,
  Campus,
  Fatura,
  StatusMatricula,
  Turma,
} from "@/lib/api/fetch-generated";

type ChartTab = "matriculas" | "ocupacao" | "financeiro" | "extensao";

interface AcademicChartsSectionProps {
  anoLetivo: number;
  semestreLetivo: number;
  auditorias: AuditoriaMec[];
  campi: Campus[];
  faturas: Fatura[];
  matriculasPorStatus: {status: StatusMatricula; quantidade: number}[];
  turmas: Turma[];
}

export const AcademicChartsSection = ({
  anoLetivo,
  semestreLetivo,
  auditorias,
  campi,
  faturas,
  matriculasPorStatus,
  turmas,
}: AcademicChartsSectionProps) => {
  const [tab, setTab] = useState<ChartTab>("matriculas");
  const periodoLabel = formatPeriodoLetivo({anoLetivo, semestreLetivo});
  const polos = buildOcupacaoPorCampus(turmas ?? [], campi ?? []);
  const volume = buildVolumeFinanceiro(faturas ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Indicadores analíticos e regulatórios ({periodoLabel})
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Retenção escolar, capacidade dos polos MEC, conciliação Stripe e extensão curricular.
          </p>
        </div>
        <Tabs
          onValueChange={(value) => {
            if (
              value === "matriculas" ||
              value === "ocupacao" ||
              value === "financeiro" ||
              value === "extensao"
            ) {
              setTab(value);
            }
          }}
          value={tab}
        >
          <TabsList className="h-auto w-full flex-wrap sm:w-fit">
            <TabsTrigger className="text-xs" value="matriculas">
              Matrículas
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="ocupacao">
              Ocupação dos polos
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="financeiro">
              Recebíveis Stripe
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="extensao">
              Auditoria MEC (≥10%)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className={cn("transition-opacity", tab === "matriculas" ? "ring-2 ring-ring/50 rounded-xl" : "opacity-70")}>
          <AcademicChartMatriculas matriculasPorStatus={matriculasPorStatus} />
        </div>
        <div className={cn("transition-opacity", tab === "ocupacao" ? "ring-2 ring-ring/50 rounded-xl" : "opacity-70")}>
          <AcademicChartOcupacao polos={polos} />
        </div>
        <div className={cn("transition-opacity", tab === "financeiro" ? "ring-2 ring-ring/50 rounded-xl" : "opacity-70")}>
          <AcademicChartFinanceiro periodoLabel={periodoLabel} volume={volume} />
        </div>
        <div className={cn("transition-opacity", tab === "extensao" ? "ring-2 ring-ring/50 rounded-xl" : "opacity-70")}>
          <AcademicChartExtensao auditorias={auditorias} />
        </div>
      </div>
    </div>
  );
};
