"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Check, ExternalLink, PlusCircle, Receipt} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminCombobox} from "@/components/admin/admin-combobox";
import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {StatusFaturaBadge} from "@/components/admin/status-fatura-badge";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {STATUS_FATURA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {Aluno, Fatura, StatusFatura} from "@/lib/api/fetch-generated";
import {
  getGetFaturasQueryKey,
  useCreateFatura,
  useGetAlunos,
  useGetFaturas,
  useUpdateFaturaStatus,
} from "@/lib/api/rc-generated";

const statusOptions: StatusFatura[] = ["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"];

const STATUS_CONCILIACAO_LABEL: Record<StatusFatura, string> = {
  PAGA: "Paga (liquidação confirmada)",
  PENDENTE: "Pendente (aguardando vencimento)",
  ATRASADA: "Atrasada (vencimento expirado)",
  CANCELADA: "Cancelada (anulada pela secretaria)",
};

const faturaSchema = z.object({
  alunoId: z.string().min(1),
  descricao: z.string().min(3).max(255),
  valor: z.number().positive(),
  dataVencimento: z.iso.date(),
});

const statusSchema = z.object({
  status: z.enum(["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"]),
});

type FaturaFormValues = z.infer<typeof faturaSchema>;
type StatusFormValues = z.infer<typeof statusSchema>;

interface FaturasViewProps {
  initialAlunos: Aluno[];
  initialFaturas: Fatura[];
}

export const FaturasView = ({initialAlunos, initialFaturas}: FaturasViewProps) => {
  const queryClient = useQueryClient();
  const {data: faturas} = useGetFaturas({initialData: initialFaturas});
  const {data: alunos} = useGetAlunos({initialData: initialAlunos});
  const {mutate: createFatura, isPending: isCreating} = useCreateFatura();
  const {mutate: updateStatus, isPending: isUpdating} = useUpdateFaturaStatus();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [targetFatura, setTargetFatura] = useState<Fatura | null>(null);
  const lista = faturas ?? initialFaturas;
  const listaAlunos = alunos ?? initialAlunos;

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return lista.filter((fatura) => {
      const matchesStatus = statusFilter === "ALL" || fatura.status === statusFilter;
      const matchesSearch =
        termo.length === 0 ||
        fatura.aluno.ra.toLowerCase().includes(termo) ||
        fatura.aluno.user.nome.toLowerCase().includes(termo) ||
        fatura.descricao.toLowerCase().includes(termo);

      return matchesStatus && matchesSearch;
    });
  }, [lista, searchTerm, statusFilter]);

  const pagination = useClientPagination({
    items: filtradas,
    resetKey: `${searchTerm}|${statusFilter}`,
  });

  const alunoItems = useMemo(
    () =>
      listaAlunos.map((aluno) => ({
        value: aluno.id,
        label: `${aluno.ra} · ${aluno.user.nome}`,
        description: aluno.user.email,
        keywords: aluno.user.cpf,
      })),
    [listaAlunos],
  );

  const createForm = useForm<FaturaFormValues>({
    resolver: zodResolver(faturaSchema),
    defaultValues: {
      alunoId: "",
      descricao: "",
      valor: 0,
      dataVencimento: "",
    },
  });

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {status: "PENDENTE"},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetFaturasQueryKey()});
  };

  const openCreate = () => {
    createForm.reset({
      alunoId: "",
      descricao: "",
      valor: 0,
      dataVencimento: "",
    });
    setCreateOpen(true);
  };

  const openStatus = (fatura: Fatura) => {
    setTargetFatura(fatura);
    statusForm.reset({status: fatura.status});
  };

  const onCreate = createForm.handleSubmit((payload) => {
    createFatura(payload, {
      onSuccess: () => {
        toast.success("Fatura emitida.");
        invalidate();
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  const onUpdateStatus = statusForm.handleSubmit((payload) => {
    if (!targetFatura) {
      return;
    }

    updateStatus(
      {id: targetFatura.id, status: payload.status},
      {
        onSuccess: () => {
          toast.success("Status da fatura atualizado.");
          invalidate();
          setTargetFatura(null);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button disabled={listaAlunos.length === 0} onClick={openCreate} size="sm">
            <PlusCircle />
            Emitir fatura
          </Button>
        }
        description="Controle de mensalidades, taxas de matrícula e conciliação de pagamentos com o Stripe."
        eyebrow="Financeiro e gestão de recebíveis"
        title="Faturas acadêmicas"
      />

      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar por aluno, RA ou descrição da cobrança..."
            value={searchTerm}
          />
          <div className="w-full md:w-52">
            <AdminSelect
              items={[
                {value: "ALL", label: "Todos os status"},
                ...statusOptions.map((status) => ({
                  value: status,
                  label: STATUS_FATURA_LABEL[status],
                })),
              ]}
              onValueChange={setStatusFilter}
              value={statusFilter}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Lance uma fatura vinculada a um aluno já cadastrado."
              icon={Receipt}
              title="Nenhuma fatura"
            />
          ) : filtradas.length === 0 ? (
            <AdminEmptyState
              description="Nenhum título corresponde aos critérios de pesquisa selecionados."
              icon={Receipt}
              title="Nenhuma fatura encontrada"
            />
          ) : (
            <>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Aluno / RA
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Descrição do título
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Valor (R$)
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Vencimento
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Liquidação
                    </TableHead>
                    <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                      Situação
                    </TableHead>
                    <TableHead className="px-4 text-right text-[10px] font-medium tracking-wider uppercase">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell className="px-4 whitespace-normal">
                        <div className="font-semibold text-foreground">{fatura.aluno.user.nome}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          RA: {fatura.aluno.ra}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal">
                        <div className="font-medium text-foreground">{fatura.descricao}</div>
                        {fatura.stripeInvoiceId ? (
                          <div className="font-mono text-[10px] text-muted-foreground">
                            Stripe ID: {fatura.stripeInvoiceId}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-4 font-mono text-sm font-bold tabular-nums">
                        {formatCurrencyBrl(fatura.valor)}
                      </TableCell>
                      <TableCell className="px-4 font-mono text-[11px]">
                        {formatDateBr(fatura.dataVencimento)}
                      </TableCell>
                      <TableCell className="px-4 font-mono text-[11px] text-muted-foreground">
                        {fatura.pagoEm ? formatDateBr(fatura.pagoEm) : "—"}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <StatusFaturaBadge status={fatura.status} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {fatura.stripePaymentUrl ? (
                            <Button
                              aria-label={`Abrir cobrança Stripe de ${fatura.aluno.user.nome}`}
                              nativeButton={false}
                              render={
                                <a href={fatura.stripePaymentUrl} rel="noreferrer" target="_blank" />
                              }
                              size="icon-sm"
                              variant="ghost"
                            >
                              <ExternalLink />
                            </Button>
                          ) : null}
                          <Button onClick={() => openStatus(fatura)} size="sm" variant="outline">
                            Alterar status
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AdminTablePagination
                className="px-4"
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Emitir nova fatura acadêmica</DialogTitle>
            <DialogDescription>
              Lançamento financeiro vinculado a um aluno. Valor em reais e vencimento no formato
              AAAA-MM-DD.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={onCreate}>
              <FormField
                control={createForm.control}
                name="alunoId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Aluno</FormLabel>
                    <FormControl>
                      <AdminCombobox
                        emptyText="Nenhum aluno encontrado. Refine a busca."
                        items={alunoItems}
                        onValueChange={field.onChange}
                        placeholder="Buscar por RA, nome ou e-mail…"
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Digite RA, nome, e-mail ou CPF. A lista mostra até 50 resultados.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="descricao"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Descrição do lançamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mensalidade acadêmica 2026.2 — parcela 04/06" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={createForm.control}
                  name="valor"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Valor nominal (R$)</FormLabel>
                      <FormControl>
                        <Input
                          min={0.01}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                          ref={field.ref}
                          step="0.01"
                          type="number"
                          value={Number.isNaN(field.value) ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="dataVencimento"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Data de vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  <PendingButtonLabel isPending={isCreating} label="Emitir" pendingLabel="Emitindo..." />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setTargetFatura(null);
          }
        }}
        open={targetFatura !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conciliação manual de fatura</DialogTitle>
            <DialogDescription>
              Aluno: {targetFatura?.aluno.user.nome} · Valor:{" "}
              {targetFatura ? formatCurrencyBrl(targetFatura.valor) : ""}
            </DialogDescription>
          </DialogHeader>
          <Form {...statusForm}>
            <form className="space-y-4" onSubmit={onUpdateStatus}>
              <FormField
                control={statusForm.control}
                name="status"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Novo status financeiro</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={statusOptions.map((status) => ({
                          value: status,
                          label: STATUS_CONCILIACAO_LABEL[status],
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                A liquidação manual vale quando o pagamento ocorre no balcão ou por transferência que o
                webhook do Stripe não processou.
              </div>
              <DialogFooter>
                <Button onClick={() => setTargetFatura(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isUpdating} type="submit">
                  <PendingButtonLabel
                    icon={<Check />}
                    isPending={isUpdating}
                    label="Salvar status"
                    pendingLabel="Salvando..."
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
