"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {MessageSquareWarning, Send} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminSelect} from "@/components/admin/admin-select";
import {ReclamacaoProtocoloCard} from "@/components/admin/reclamacao-protocolo-card";
import {PendingButtonLabel} from "@/components/pending-button-label";
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
import {formatProtocoloOuvidoria} from "@/lib/admin/format";
import {STATUS_RECLAMACAO_LABEL, TIPO_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Reclamacao, StatusReclamacao, TipoReclamacao} from "@/lib/api/fetch-generated";
import {
  getGetReclamacoesQueryKey,
  useFecharReclamacao,
  useGetReclamacoes,
  useResponderReclamacao,
} from "@/lib/api/rc-generated";

const statusOptions: StatusReclamacao[] = ["ABERTO", "EM_ANALISE", "RESPONDIDO", "FECHADO"];
const tipoOptions: TipoReclamacao[] = [
  "SECRETARIA",
  "ACADEMICO",
  "FINANCEIRO",
  "INFRAESTRUTURA",
  "OUVIDORIA_GERAL",
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tipoFilter, setTipoFilter] = useState("ALL");
  const [selected, setSelected] = useState<Reclamacao | null>(null);
  const lista = reclamacoes ?? initialReclamacoes;

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return lista.filter((reclamacao) => {
      const matchesStatus = statusFilter === "ALL" || reclamacao.status === statusFilter;
      const matchesTipo = tipoFilter === "ALL" || reclamacao.tipo === tipoFilter;
      const matchesSearch =
        termo.length === 0 ||
        reclamacao.assunto.toLowerCase().includes(termo) ||
        reclamacao.usuario.nome.toLowerCase().includes(termo) ||
        reclamacao.descricao.toLowerCase().includes(termo);

      return matchesStatus && matchesTipo && matchesSearch;
    });
  }, [lista, searchTerm, statusFilter, tipoFilter]);

  const form = useForm<RespostaFormValues>({
    resolver: zodResolver(respostaSchema),
    defaultValues: {resposta: ""},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetReclamacoesQueryKey()});
  };

  const openResposta = (reclamacao: Reclamacao) => {
    setSelected(reclamacao);
    form.reset({resposta: reclamacao.resposta ?? ""});
  };

  const onSubmit = form.handleSubmit((payload) => {
    if (!selected) {
      return;
    }

    responder(
      {id: selected.id, resposta: payload.resposta},
      {
        onSuccess: () => {
          toast.success("Resposta oficial registrada.");
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
        description="Canal regulamentado para manifestações, solicitações de revisão acadêmica e ocorrências operacionais."
        eyebrow="Ouvidoria & relações com a comunidade"
        title="Ouvidoria institucional"
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar manifestação por assunto ou solicitante..."
            value={searchTerm}
          />
          <AdminSelect
            items={[
              {value: "ALL", label: "Todos os status"},
              ...statusOptions.map((status) => ({
                value: status,
                label: STATUS_RECLAMACAO_LABEL[status],
              })),
            ]}
            onValueChange={setStatusFilter}
            value={statusFilter}
          />
          <AdminSelect
            items={[
              {value: "ALL", label: "Todos os tipos de ocorrência"},
              ...tipoOptions.map((tipo) => ({
                value: tipo,
                label: TIPO_RECLAMACAO_LABEL[tipo],
              })),
            ]}
            onValueChange={setTipoFilter}
            value={tipoFilter}
          />
        </CardContent>
      </Card>

      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Não há protocolos de ouvidoria registrados no momento."
            icon={MessageSquareWarning}
            title="Nenhuma manifestação encontrada"
          />
        </Card>
      ) : filtradas.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Não há protocolos de ouvidoria correspondentes aos filtros aplicados."
            icon={MessageSquareWarning}
            title="Nenhuma manifestação encontrada"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtradas.map((reclamacao) => (
            <ReclamacaoProtocoloCard
              isFechando={isFechando}
              key={reclamacao.id}
              onFechar={() =>
                fechar(reclamacao.id, {
                  onSuccess: () => {
                    toast.success("Protocolo encerrado.");
                    invalidate();
                  },
                  onError: (error) => toast.error(getMutationErrorMessage(error)),
                })
              }
              onResponder={() => openResposta(reclamacao)}
              reclamacao={reclamacao}
            />
          ))}
        </div>
      )}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
        open={Boolean(selected)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resposta oficial: {selected?.assunto}</DialogTitle>
            <DialogDescription>
              Protocolo: {selected ? formatProtocoloOuvidoria(selected.id) : ""} · Solicitante:{" "}
              {selected?.usuario.nome}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Manifestação: </strong>
                {selected?.descricao}
              </div>
              <FormField
                control={form.control}
                name="resposta"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Parecer / resposta oficial da instituição</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-28"
                        placeholder="Insira os esclarecimentos regulamentares ou as providências adotadas..."
                        {...field}
                      />
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
                  <PendingButtonLabel
                    icon={<Send />}
                    isPending={isRespondendo}
                    label="Registrar e notificar"
                    pendingLabel="Enviando..."
                  />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
