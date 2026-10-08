"use client";

import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {TermosPendentesList} from "@/components/admin/termos-pendentes-list";
import {TermosRelatorio} from "@/components/admin/termos-relatorio";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import type {Professor, TermoAbertura} from "@/lib/api/fetch-generated";

interface AprovacaoTermosViewProps {
  initialPendentes: TermoAbertura[];
  initialProfessores: Professor[];
  initialTermos: TermoAbertura[];
}

export const AprovacaoTermosView = ({
  initialPendentes,
  initialProfessores,
  initialTermos,
}: AprovacaoTermosViewProps) => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        description="Aprove a reabertura de turmas fechadas ou a alteração individual de AV, AVS, AV3 e faltas. O relatório consolida volume, autoria e status."
        eyebrow="Acadêmico & regulação"
        title="Controle e Aprovação de Termos"
      />
      <Tabs defaultValue="pendentes">
        <TabsList className="h-auto w-full flex-wrap sm:w-fit">
          <TabsTrigger className="text-xs" value="pendentes">
            Pendentes
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="relatorio">
            Relatório
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4" value="pendentes">
          <TermosPendentesList initialPendentes={initialPendentes} />
        </TabsContent>
        <TabsContent className="mt-4" value="relatorio">
          <TermosRelatorio initialProfessores={initialProfessores} initialTermos={initialTermos} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
