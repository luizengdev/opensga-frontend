"use client";

import dayjs from "dayjs";
import {SlidersHorizontal} from "lucide-react";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {ParametrizacoesAvaliacaoForm} from "@/components/admin/parametrizacoes-avaliacao-form";
import {ParametrizacoesInstituicaoForm} from "@/components/admin/parametrizacoes-instituicao-form";
import {ParametrizacoesMarcoCard} from "@/components/admin/parametrizacoes-marco-card";
import {ParametrizacoesPeriodoForm} from "@/components/admin/parametrizacoes-periodo-form";
import {Card} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import type {Parametrizacoes} from "@/lib/api/fetch-generated";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";

interface ParametrizacoesViewProps {
  initialParametrizacoes: Parametrizacoes;
}

export const ParametrizacoesView = ({initialParametrizacoes}: ParametrizacoesViewProps) => {
  const {data: parametros} = useGetParametrizacoes({initialData: initialParametrizacoes});
  const vigente = parametros ?? initialParametrizacoes;

  if (!vigente) {
    return (
      <Card>
        <AdminEmptyState
          description="Não foi possível carregar o singleton institucional. Confira se a API aplicou a migration de parametrizações."
          icon={SlidersHorizontal}
          title="Parametrizações indisponíveis"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description={`Período vigente ${formatPeriodoLetivo(vigente)}${vigente.periodoAutomatico ? " (calendário)" : " (manual)"}. Última alteração em ${dayjs(vigente.atualizadoEm).format("DD/MM/YYYY HH:mm")}.`}
        eyebrow="Acadêmico & regulação"
        title="Parametrizações"
      />
      <Tabs defaultValue="periodo">
        <TabsList className="h-auto w-full flex-wrap sm:w-fit">
          <TabsTrigger className="text-xs" value="periodo">
            Período letivo
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="avaliacao">
            Avaliação
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="instituicao">
            Instituição
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4 space-y-4" value="periodo">
          <ParametrizacoesPeriodoForm parametros={vigente} />
          <ParametrizacoesMarcoCard />
        </TabsContent>
        <TabsContent className="mt-4 space-y-4" value="avaliacao">
          <ParametrizacoesAvaliacaoForm parametros={vigente} />
          <ParametrizacoesMarcoCard />
        </TabsContent>
        <TabsContent className="mt-4 space-y-4" value="instituicao">
          <ParametrizacoesInstituicaoForm parametros={vigente} />
          <ParametrizacoesMarcoCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
