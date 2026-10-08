"use client";

import {useEffect, useRef, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {CheckCircle2, Clock, FileQuestion, PlusCircle} from "lucide-react";
import {toast} from "sonner";

import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {OuvidoriaTicketDialog} from "@/components/aluno/ouvidoria-ticket-dialog";
import {Button} from "@/components/ui/button";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {formatDateBr, formatProtocoloOuvidoria} from "@/lib/admin/format";
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
  const {ouvidoria, profile} = contexto;
  const queryClient = useQueryClient();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(ouvidoria[0]?.id ?? null);
  const selected = ouvidoria.find((ticket) => ticket.id === selectedId) ?? ouvidoria[0];
  const {mutate: criarProtocolo, isPending} = useCreatePortalReclamacao();

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openDialog = () => {
    setSubmitted(false);
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (isPending) {
      return;
    }

    setDialogOpen(open);
    if (!open) {
      setSubmitted(false);
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          <Button className="h-auto gap-2 px-4 py-2.5 text-xs font-bold" onClick={openDialog} size="lg">
            <PlusCircle className="size-4" />
            Abrir Novo Protocolo
          </Button>
        }
        description="Canal direto com a coordenação de curso, secretaria e diretoria de atendimento."
        eyebrow="ATENDIMENTO INDIVIDUAL · PROTOCOLOS PESSOAIS"
        title="Ouvidoria & Requerimentos"
      />

      {ouvidoria.length === 0 ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-12 text-center">
          <FileQuestion className="mx-auto size-10 text-muted-foreground" strokeWidth={1} />
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Você não possui nenhum protocolo em aberto
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs font-medium text-muted-foreground">
              Caso precise de esclarecimentos sobre notas, solicitações financeiras ou apoio pedagógico, abra um
              chamado diretamente por aqui.
            </p>
          </div>
          <Button className="h-auto gap-1.5 px-4 py-2 text-xs font-bold" onClick={openDialog} size="lg">
            <PlusCircle className="size-4" />
            Criar Primeiro Protocolo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <span className="block font-mono text-xs font-bold text-muted-foreground">
              Seus Chamados ({ouvidoria.length})
            </span>
            <div className="space-y-2">
              {ouvidoria.map((ticket) => {
                const isSelected = ticket.id === selected?.id;

                return (
                  <Button
                    className={`h-auto w-full flex-col items-stretch gap-0 rounded-xl border p-4 text-left whitespace-normal shadow-none ${
                      isSelected
                        ? "border-foreground bg-card shadow-xs"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                    key={ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    variant="ghost"
                  >
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-muted-foreground">
                        {formatProtocoloOuvidoria(ticket.id)}
                      </span>
                      <AlunoStatusBadge kind="reclamacao" status={ticket.status} />
                    </div>
                    <h4 className="font-heading line-clamp-1 text-sm font-bold text-foreground">{ticket.assunto}</h4>
                    <div className="mt-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{TIPO_RECLAMACAO_LABEL[ticket.tipo]}</span>
                      <span className="font-mono">{formatDateBr(ticket.criadoEm)}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {selected ? (
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-start">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {formatProtocoloOuvidoria(selected.id)} · {TIPO_RECLAMACAO_LABEL[selected.tipo]}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{selected.assunto}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Aberto em {formatDateBr(selected.criadoEm)} por {profile.nome}
                  </p>
                </div>
                <AlunoStatusBadge kind="reclamacao" status={selected.status} />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                  Solicitação do Estudante
                </span>
                <div className="rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed font-medium whitespace-pre-wrap text-foreground">
                  {selected.descricao}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                  Parecer da Coordenação / Ouvidoria
                </span>
                {selected.resposta ? (
                  <div className="space-y-2 rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed text-foreground">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                      <CheckCircle2 className="size-4 text-success" />
                      Resposta Oficial
                    </div>
                    <p className="font-medium whitespace-pre-wrap text-foreground">{selected.resposta}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-4 text-xs font-medium text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    <span>Chamado em análise pelo setor responsável. Prazo médio de resposta: até 3 dias úteis.</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <OuvidoriaTicketDialog
        isPending={isPending}
        onOpenChange={handleOpenChange}
        onSubmit={(values) => {
          criarProtocolo(values, {
            onSuccess: (created) => {
              queryClient.invalidateQueries({
                queryKey: getGetPortalContextoQueryKey(alunoId),
              });
              setSelectedId(created.id);
              setSubmitted(true);
              closeTimerRef.current = setTimeout(() => {
                setSubmitted(false);
                setDialogOpen(false);
                closeTimerRef.current = null;
              }, 1200);
            },
            onError: (error) => {
              toast.error(getMutationErrorMessage(error));
            },
          });
        }}
        open={dialogOpen}
        submitted={submitted}
      />
    </div>
  );
};
