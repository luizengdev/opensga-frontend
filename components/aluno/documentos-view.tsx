"use client";

import {useState} from "react";
import {CreditCard, FileText, GraduationCap, QrCode, ShieldCheck, type LucideIcon} from "lucide-react";

import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {DocumentViewerDialog, type AlunoDocumentoTipo} from "@/components/aluno/document-viewer-dialog";
import {Button} from "@/components/ui/button";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface DocumentosViewProps {
  initialData: PortalContexto;
}

const CATALOGO: Array<{
  type: AlunoDocumentoTipo;
  titulo: string;
  descricao: string;
  finalidade: string;
  icone: LucideIcon;
}> = [
  {
    type: "declaracao_matricula",
    titulo: "Declaração de matrícula ativa",
    descricao: "Atesta vínculo discente no semestre vigente com disciplinas e carga horária.",
    finalidade: "Estágios, passe estudantil e bancos.",
    icone: FileText,
  },
  {
    type: "historico_parcial",
    titulo: "Histórico escolar parcial",
    descricao: "Espelho curricular com disciplinas, médias finais e horas integralizadas.",
    finalidade: "Transferência, processos seletivos e intercâmbio.",
    icone: GraduationCap,
  },
  {
    type: "quitacao_financeira",
    titulo: "Declaração de quitação financeira",
    descricao: "Certidão de adimplência das mensalidades até a data corrente.",
    finalidade: "Bolsas, convênios e comprovação de pagamentos.",
    icone: CreditCard,
  },
  {
    type: "carteirinha_estudantil",
    titulo: "Carteirinha estudantil digital",
    descricao: "Identificação estudantil com RA e validade vinculada à matrícula ativa.",
    finalidade: "Acesso ao campus e meia-entrada.",
    icone: QrCode,
  },
];

export const DocumentosView = ({initialData}: DocumentosViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const [documento, setDocumento] = useState<AlunoDocumentoTipo | null>(null);
  const temMatricula = Boolean(contexto.matricula);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        description="Certidões geradas a partir do seu vínculo no OpenSGA, com código de autenticação interno."
        eyebrow="SECRETARIA DIGITAL · AUTOATENDIMENTO"
        title="Emissão de documentos oficiais"
      />
      <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-xs font-semibold text-success-foreground">
        <ShieldCheck className="size-4" />
        Documentos emitidos com os dados oficiais da matrícula. Sem IDs internos de Stripe.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATALOGO.map((documento) => {
          const Icon = documento.icone;

          return (
            <div
              className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40"
              key={documento.type}
            >
              <div className="space-y-2">
                <Icon className="size-5 text-foreground" />
                <h3 className="font-heading text-base font-bold text-foreground">{documento.titulo}</h3>
                <p className="text-xs font-medium text-muted-foreground">{documento.descricao}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">Finalidade: {documento.finalidade}</p>
              </div>
              <Button disabled={!temMatricula} onClick={() => setDocumento(documento.type)}>
                Emitir agora
              </Button>
            </div>
          );
        })}
      </div>
      <DocumentViewerDialog contexto={contexto} onClose={() => setDocumento(null)} type={documento} />
    </div>
  );
};
