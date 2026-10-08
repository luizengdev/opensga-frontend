"use client";

import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {TermoAberturaIndividualSection} from "@/components/admin/termo-abertura-individual-section";
import {TermoAberturaSolicitacoes} from "@/components/admin/termo-abertura-solicitacoes";
import {TermoAberturaTurmaSection} from "@/components/admin/termo-abertura-turma-section";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import type {TermoAbertura, TermoTurmaDisponivel} from "@/lib/api/fetch-generated";

interface TermoAberturaViewProps {
  anoLetivo: number;
  semestreLetivo: number;
  initialTermos: TermoAbertura[];
  initialTurmas: TermoTurmaDisponivel[];
}

export const TermoAberturaView = ({
  anoLetivo,
  semestreLetivo,
  initialTermos,
  initialTurmas,
}: TermoAberturaViewProps) => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        description={`Período vigente ${formatPeriodoLetivo({anoLetivo, semestreLetivo})}. A Secretaria precisa aprovar antes de reabrir a turma ou gravar a nota.`}
        eyebrow="Espaço do docente"
        title="Solicitação de Termo de Abertura de Notas/Faltas"
      />
      <TermoAberturaTurmaSection
        anoLetivo={anoLetivo}
        initialTurmas={initialTurmas}
        semestreLetivo={semestreLetivo}
      />
      <TermoAberturaIndividualSection />
      <TermoAberturaSolicitacoes initialTermos={initialTermos} />
    </div>
  );
};
