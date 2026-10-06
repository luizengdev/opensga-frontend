"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {CreditCard, Pencil, PlusCircle, Tag, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
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
import {formatCurrencyBrl} from "@/lib/admin/format";
import {MODALIDADE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {Curso, ModalidadeCurso, PrecoCurso} from "@/lib/api/fetch-generated";
import {
  getGetPrecosQueryKey,
  useCreatePreco,
  useDeletePreco,
  useGetCursos,
  useGetPrecos,
  useUpdatePreco,
} from "@/lib/api/rc-generated";

const createSchema = z.object({
  cursoId: z.string().min(1),
  valor: z.number().positive(),
});

const editSchema = z.object({
  valor: z.number().positive(),
  ativo: z.enum(["true", "false"]),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

const modalidadeBadgeVariant = (modalidade: ModalidadeCurso) => {
  if (modalidade === "PRESENCIAL") {
    return "default" as const;
  }

  if (modalidade === "SEMIPRESENCIAL") {
    return "secondary" as const;
  }

  return "outline" as const;
};

interface PrecosViewProps {
  initialCursos: Curso[];
  initialPrecos: PrecoCurso[];
}

export const PrecosView = ({initialCursos, initialPrecos}: PrecosViewProps) => {
  const queryClient = useQueryClient();
  const {data: precos} = useGetPrecos({initialData: initialPrecos});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {mutate: createPreco, isPending: isCreating} = useCreatePreco();
  const {mutate: updatePreco, isPending: isUpdating} = useUpdatePreco();
  const {mutate: deletePreco, isPending: isDeleting} = useDeletePreco();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PrecoCurso | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PrecoCurso | null>(null);
  const lista = precos ?? initialPrecos;
  const listaCursos = cursos ?? initialCursos;
  const pagination = useClientPagination({items: lista});
  const cursosSemPreco = useMemo(() => {
    const usados = new Set(lista.map((preco) => preco.cursoId));
    return listaCursos.filter((curso) => !usados.has(curso.id));
  }, [lista, listaCursos]);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {cursoId: "", valor: 0},
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {valor: 0, ativo: "true"},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetPrecosQueryKey()});
  };

  const openCreate = () => {
    createForm.reset({cursoId: cursosSemPreco[0]?.id ?? "", valor: 0});
    setCreateOpen(true);
  };

  const openEdit = (preco: PrecoCurso) => {
    setEditing(preco);
    editForm.reset({valor: preco.valor, ativo: preco.ativo ? "true" : "false"});
  };

  const onCreate = createForm.handleSubmit((payload) => {
    createPreco(payload, {
      onSuccess: () => {
        toast.success("Preço cadastrado em reais. Product e Price sincronizados no Stripe.");
        invalidate();
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  const onEdit = editForm.handleSubmit((payload) => {
    if (!editing) {
      return;
    }

    updatePreco(
      {
        id: editing.id,
        data: {valor: payload.valor, ativo: payload.ativo === "true"},
      },
      {
        onSuccess: () => {
          toast.success("Preço atualizado. Um novo Price Stripe foi sincronizado se o valor mudou.");
          invalidate();
          setEditing(null);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const onConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    const preco = pendingDelete;

    deletePreco(preco.id, {
      onSuccess: () => {
        toast.success("Preço removido. Product e Price foram arquivados no Stripe.");
        invalidate();
        setPendingDelete(null);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button disabled={cursosSemPreco.length === 0} onClick={openCreate} size="sm">
            <PlusCircle />
            Definir novo preço
          </Button>
        }
        description="1 preço ativo por curso. O valor entra em reais e a API sincroniza Product e Price no Stripe."
        eyebrow="Controladoria e faturamento recorrente"
        title="Tabela de preços e mensalidades"
      />

      <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-muted/40 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-primary text-primary-foreground">
            <CreditCard className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <span>Sincronização Stripe Checkout e Invoicing</span>
              <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-success-foreground">
                Via API
              </span>
            </div>
            <p className="text-muted-foreground">
              Os valores cadastrados geram links de cartão e boleto no catálogo público quando há cobrança.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valores vigentes por curso</CardTitle>
          <CardDescription>
            Tabela cadastrada com IDs sincronizados na infraestrutura Stripe. Não cole IDs price_ no
            formulário.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Cadastre um valor em reais por curso. A API cria Product e Price no Stripe."
              icon={Tag}
              title="Nenhum preço cadastrado"
            />
          ) : (
            <>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Curso de graduação
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Modalidade
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Mensalidade (BRL)
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Stripe Product
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Stripe Price ID
                    </TableHead>
                    <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-right text-[10px] font-medium tracking-wider uppercase">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map((preco) => (
                    <TableRow key={preco.id}>
                      <TableCell className="px-4 font-semibold whitespace-normal">
                        {preco.curso.nome}
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge variant={modalidadeBadgeVariant(preco.curso.modalidade)}>
                          {MODALIDADE_LABEL[preco.curso.modalidade]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 font-mono text-sm font-bold tabular-nums">
                        {formatCurrencyBrl(preco.valor)}
                        <span className="font-sans text-[10px] font-normal text-muted-foreground">
                          {" "}
                          /mês
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate px-4 font-mono text-[11px] text-muted-foreground">
                        {preco.stripeProductId}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate px-4 font-mono text-[11px] text-muted-foreground">
                        {preco.stripePriceId}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        {preco.ativo ? (
                          <Badge variant="success">Vigente</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button onClick={() => openEdit(preco)} size="sm" variant="outline">
                            <Pencil className="text-primary" />
                            Editar
                          </Button>
                          <Button
                            aria-label={`Excluir preço de ${preco.curso.nome}`}
                            disabled={isDeleting}
                            onClick={() => setPendingDelete(preco)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Trash2 />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar precificação de curso</DialogTitle>
            <DialogDescription>
              Definição de mensalidade acadêmica sincronizada com o Stripe. Um preço por curso.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={onCreate}>
              <FormField
                control={createForm.control}
                name="cursoId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Curso de graduação</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={cursosSemPreco.map((curso) => ({
                          value: curso.id,
                          label: `${curso.nome} · ${MODALIDADE_LABEL[curso.modalidade]}`,
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="valor"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Valor mensal da mensalidade (R$)</FormLabel>
                    <FormControl>
                      <Input
                        min={0.01}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        placeholder="Ex: 850.00"
                        ref={field.ref}
                        step="0.01"
                        type="number"
                        value={Number.isNaN(field.value) ? "" : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      A API sincroniza um novo Price no Stripe imediatamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  Confirmar e sincronizar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        open={editing !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar preço: {editing?.curso.nome}</DialogTitle>
            <DialogDescription>
              Alterar o valor arquiva o Price antigo no Stripe e cria uma nova versão.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4" onSubmit={onEdit}>
              <FormField
                control={editForm.control}
                name="valor"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Novo valor mensal (R$)</FormLabel>
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
                control={editForm.control}
                name="ativo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Status da precificação</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={[
                          {value: "true", label: "Vigente (ativo no catálogo público)"},
                          {value: "false", label: "Inativo (desativar novas contratações)"},
                        ]}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setEditing(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isUpdating} type="submit">
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        description={
          pendingDelete
            ? `Remover o preço de ${pendingDelete.curso.nome}? O Product e o Price serão arquivados no Stripe.`
            : ""
        }
        isPending={isDeleting}
        onConfirm={onConfirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        open={pendingDelete !== null}
        title={pendingDelete ? `Remover preço de ${pendingDelete.curso.nome}?` : "Remover preço"}
      />
    </div>
  );
};
