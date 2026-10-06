"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {MessageSquareWarning} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {StatusReclamacaoBadge} from "@/components/admin/status-reclamacao-badge";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {formatDateBr} from "@/lib/admin/format";
import {TIPO_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Reclamacao} from "@/lib/api/fetch-generated";
import {
  getGetReclamacoesQueryKey,
  useFecharReclamacao,
  useGetReclamacoes,
  useResponderReclamacao,
} from "@/lib/api/rc-generated";

const respostaSchema = z.object({
  resposta: z.string().min(3),
});

type RespostaFormValues = z.infer<typeof respostaSchema>;

interface OuvidoriaViewProps {
  initialReclamacoes: Reclamacao[];
}

export const OuvidoriaView = ({initialReclamacoes}: OuvidoriaViewProps) => {
  const queryClient = useQueryClient();
  const {data: reclamacoes} = useGetReclamacoes({initialData: initialReclamacoes});
  const {mutate: responder, isPending: isRespondendo} = useResponderReclamacao();
  const {mutate: fechar, isPending: isFechando} = useFecharReclamacao();
  const [selected, setSelected] = useState<Reclamacao | null>(null);
  const lista = reclamacoes ?? initialReclamacoes;

  const form = useForm<RespostaFormValues>({
    resolver: zodResolver(respostaSchema),
    defaultValues: {resposta: ""},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetReclamacoesQueryKey()});
  };

  const onSubmit = form.handleSubmit((payload) => {
    if (!selected) {
      return;
    }

    responder(
      {id: selected.id, resposta: payload.resposta},
      {
        onSuccess: () => {
          toast.success("Resposta registrada.");
          invalidate();
          setSelected(null);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description="Chamados da comunidade acadêmica. Responda ou encerre os protocolos em aberto."
        eyebrow="Ouvidoria geral"
        title="Ouvidoria"
      />

      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Não há reclamações registradas no momento."
            icon={MessageSquareWarning}
            title="Caixa vazia"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((reclamacao) => (
            <Card key={reclamacao.id}>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{reclamacao.assunto}</h2>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {reclamacao.usuario.nome} · {reclamacao.usuario.email} ·{" "}
                      {formatDateBr(reclamacao.criadoEm)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TIPO_RECLAMACAO_LABEL[reclamacao.tipo]}</Badge>
                    <StatusReclamacaoBadge status={reclamacao.status} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{reclamacao.descricao}</p>
                {reclamacao.resposta ? (
                  <div className="rounded-[calc(var(--radius)-4px)] bg-muted/40 p-3 text-xs">
                    <span className="font-semibold text-foreground">Resposta: </span>
                    {reclamacao.resposta}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  {reclamacao.status !== "FECHADO" ? (
                    <Button
                      onClick={() => {
                        setSelected(reclamacao);
                        form.reset({resposta: reclamacao.resposta ?? ""});
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Responder
                    </Button>
                  ) : null}
                  {reclamacao.status !== "FECHADO" ? (
                    <Button
                      disabled={isFechando}
                      onClick={() =>
                        fechar(reclamacao.id, {
                          onSuccess: () => {
                            toast.success("Reclamação encerrada.");
                            invalidate();
                          },
                          onError: (error) => toast.error(getMutationErrorMessage(error)),
                        })
                      }
                      size="sm"
                    >
                      Encerrar
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog onOpenChange={(open) => !open && setSelected(null)} open={Boolean(selected)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder ouvidoria</DialogTitle>
            <DialogDescription>{selected?.assunto}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="resposta"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Resposta</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setSelected(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isRespondendo} type="submit">
                  Enviar resposta
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
