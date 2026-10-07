"use client";

import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {MessageSquare} from "lucide-react";
import {toast} from "sonner";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {OuvidoriaTicketDialog} from "@/components/aluno/ouvidoria-ticket-dialog";
import {Button} from "@/components/ui/button";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {formatDateTimeBr, formatProtocoloOuvidoria} from "@/lib/admin/format";
import {TIPO_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import {
  getGetPortalContextoQueryKey,
  useCreatePortalReclamacao,
} from "@/lib/api/rc-generated";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface OuvidoriaViewProps {
  initialData: PortalContexto;
}

export const OuvidoriaView = ({initialData}: OuvidoriaViewProps) => {
  const {alunoId, contexto} = usePortalAluno(initialData);
  const {ouvidoria} = contexto;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(ouvidoria[0]?.id ?? null);
  const selected = ouvidoria.find((ticket) => ticket.id === selectedId) ?? ouvidoria[0];
  const {mutate: criarProtocolo, isPending} = useCreatePortalReclamacao();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            Novo protocolo
          </Button>
        }
        description="Acompanhe apenas os seus protocolos. Sem fila da Ouvidoria Geral."
        eyebrow="OUVIDORIA INSTITUCIONAL"
        title="Ouvidoria"
      />

      {ouvidoria.length === 0 ? (
        <AlunoEmptyState
          description="Abra um protocolo para falar com a ouvidoria. A resposta oficial aparece neste painel."
          icon={MessageSquare}
          title="Nenhum protocolo aberto"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            {ouvidoria.map((ticket) => (
              <Button
                className={`h-auto w-full flex-col items-start gap-1 rounded-xl border p-4 text-left ${
                  selected?.id === ticket.id ? "border-primary bg-muted" : "border-border bg-card"
                }`}
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                variant="ghost"
              >
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  {formatProtocoloOuvidoria(ticket.id)}
                </span>
                <span className="font-heading text-sm font-bold text-foreground">{ticket.assunto}</span>
                <AlunoStatusBadge kind="reclamacao" status={ticket.status} />
              </Button>
            ))}
          </div>
          {selected ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-muted-foreground">
                    {formatProtocoloOuvidoria(selected.id)} · {formatDateTimeBr(selected.criadoEm)}
                  </p>
                  <h3 className="font-heading text-lg font-bold text-foreground">{selected.assunto}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{TIPO_RECLAMACAO_LABEL[selected.tipo]}</p>
                </div>
                <AlunoStatusBadge kind="reclamacao" status={selected.status} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{selected.descricao}</p>
              {selected.resposta ? (
                <div className="rounded-lg border border-border bg-muted/60 p-4">
                  <p className="mb-1 text-xs font-bold text-foreground">Resposta oficial</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{selected.resposta}</p>
                </div>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">Aguardando resposta da ouvidoria.</p>
              )}
            </div>
          ) : null}
        </div>
      )}

      <OuvidoriaTicketDialog
        isPending={isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(values) => {
          criarProtocolo(values, {
            onSuccess: () => {
              toast.success("Protocolo aberto com sucesso.");
              queryClient.invalidateQueries({
                queryKey: getGetPortalContextoQueryKey(alunoId),
              });
              setDialogOpen(false);
            },
            onError: (error) => {
              toast.error(getMutationErrorMessage(error));
            },
          });
        }}
        open={dialogOpen}
      />
    </div>
  );
};
