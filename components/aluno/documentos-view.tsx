"use client";

import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  QrCode,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {PendingButtonLabel} from "@/components/pending-button-label";
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

const TEMPO_EMISSAO: Record<TipoDocumento, string> = {
  DECLARACAO_MATRICULA: "Emissão instantânea com hash autenticador",
  HISTORICO_PARCIAL: "Assinatura digitalizada da Secretaria Geral",
  QUITACAO_FINANCEIRA: "Validação bancária automática",
  CARTEIRINHA_ESTUDANTIL: "Padrão nacional do estudante",
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
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-3 py-1.5 text-xs font-bold text-success-foreground">
            <ShieldCheck className="size-4 text-success" />
            <span>Válido sem necessidade de carimbo físico</span>
          </div>
        }
        description="Certidões e comprovantes gerados eletronicamente com autenticidade verificável."
        eyebrow="SECRETARIA DIGITAL · AUTOATENDIMENTO DISCENTE"
        title="Emissão de Documentos Oficiais"
      />

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
                className="flex flex-col justify-between space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40"
                key={item.id}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      Gratuito · 100% Digital
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{item.titulo}</h3>
                  <p className="text-xs leading-relaxed font-medium text-muted-foreground">{item.descricao}</p>
                  <div className="space-y-1 pt-2 text-xs font-medium text-muted-foreground">
                    <p>
                      <span className="font-bold text-foreground">Usos comuns:</span> {item.finalidade}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    {TEMPO_EMISSAO[item.tipo]}
                  </span>
                  <Button
                    className="shrink-0 text-xs font-bold"
                    disabled={!temMatricula || isPending}
                    onClick={() => emitir({tipo: item.tipo, alunoId})}
                    size="sm"
                  >
                    <PendingButtonLabel
                      icon={<Download className="size-3.5" />}
                      isPending={tipoPendente === item.tipo}
                      label="Visualizar & Baixar"
                      pendingLabel="Emitindo…"
                    />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/60 p-4 text-xs leading-relaxed font-medium text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-foreground" />
        <div>
          <strong className="mb-0.5 block font-bold text-foreground">Base Legal de Autenticidade Digital</strong>
          Os documentos emitidos pelo Portal do Aluno OpenSGA possuem código de autenticação interno gerado na
          emissão. Só entram no catálogo os modelos liberados pela Secretaria. Declaração e carteirinha exigem
          matrícula ativa; a quitação é bloqueada se houver fatura atrasada.
        </div>
      </div>

      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
