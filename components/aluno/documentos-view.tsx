"use client";

import {CreditCard, FileText, GraduationCap, QrCode, ShieldCheck, type LucideIcon} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {Button} from "@/components/ui/button";
import {useEmitirDocumento} from "@/lib/aluno/use-emitir-documento";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto, PortalDocumentoCatalogoItem, TipoDocumento} from "@/lib/api/fetch-generated";
import {useGetPortalDocumentos} from "@/lib/api/rc-generated";

interface DocumentosViewProps {
  initialCatalogo: PortalDocumentoCatalogoItem[];
  initialData: PortalContexto;
}

const ICONES: Record<TipoDocumento, LucideIcon> = {
  DECLARACAO_MATRICULA: FileText,
  HISTORICO_PARCIAL: GraduationCap,
  QUITACAO_FINANCEIRA: CreditCard,
  CARTEIRINHA_ESTUDANTIL: QrCode,
};

export const DocumentosView = ({initialCatalogo, initialData}: DocumentosViewProps) => {
  const {alunoId, contexto} = usePortalAluno(initialData);
  const {data: catalogo} = useGetPortalDocumentos({initialData: initialCatalogo});
  const {documento, emitir, fechar, isPending, tipoPendente} = useEmitirDocumento();
  const lista = catalogo ?? initialCatalogo;
  const temMatricula = Boolean(contexto.matricula);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        description="Certidões geradas a partir do texto da Secretaria e do seu vínculo no OpenSGA, com código de autenticação interno."
        eyebrow="SECRETARIA DIGITAL · AUTOATENDIMENTO"
        title="Emissão de documentos oficiais"
      />
      <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-xs font-semibold text-success-foreground">
        <ShieldCheck className="size-4" />
        Só entram no catálogo os modelos liberados pela Secretaria. Declaração e carteirinha exigem matrícula
        ativa; a quitação é bloqueada se houver fatura atrasada.
      </div>
      {lista.length === 0 ? (
        <AlunoEmptyState
          description="A Secretaria desativou a emissão no autoatendimento. Procure o registro acadêmico se precisar de uma certidão."
          icon={FileText}
          title="Nenhum documento disponível"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lista.map((item) => {
            const Icon = ICONES[item.tipo];

            return (
              <div
                className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40"
                key={item.id}
              >
                <div className="space-y-2">
                  <Icon className="size-5 text-foreground" />
                  <h3 className="font-heading text-base font-bold text-foreground">{item.titulo}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{item.descricao}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">Finalidade: {item.finalidade}</p>
                </div>
                <Button
                  disabled={!temMatricula || isPending}
                  onClick={() => emitir({tipo: item.tipo, alunoId})}
                >
                  {tipoPendente === item.tipo ? "Emitindo…" : "Emitir agora"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
