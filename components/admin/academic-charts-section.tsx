"use client";

import {BarChart3} from "lucide-react";
import {useState} from "react";

import {AcademicChartExtensao} from "@/components/admin/academic-chart-extensao";
import {AcademicChartFinanceiro} from "@/components/admin/academic-chart-financeiro";
import {AcademicChartMatriculas} from "@/components/admin/academic-chart-matriculas";
import {AcademicChartOcupacao} from "@/components/admin/academic-chart-ocupacao";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
    <Tabs
      className="gap-4 pt-2"
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
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
            Auditoria MEC
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="matriculas">
        <AcademicChartMatriculas matriculasPorStatus={matriculasPorStatus} />
      </TabsContent>
      <TabsContent value="ocupacao">
        <AcademicChartOcupacao polos={polos} />
      </TabsContent>
      <TabsContent value="financeiro">
        <AcademicChartFinanceiro periodoLabel={periodoLabel} volume={volume} />
      </TabsContent>
      <TabsContent value="extensao">
        <AcademicChartExtensao auditorias={auditorias} />
      </TabsContent>
    </Tabs>
  );
};
