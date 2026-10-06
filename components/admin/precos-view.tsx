"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {PlusCircle, Tag, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
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
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Curso, PrecoCurso} from "@/lib/api/fetch-generated";
import {
  getGetPrecosQueryKey,
  useCreatePreco,
  useDeletePreco,
  useGetCursos,
  useGetPrecos,
  useUpdatePreco,
} from "@/lib/api/rc-generated";

const precoSchema = z.object({
  cursoId: z.string().min(1),
  valor: z.number().positive(),
});

type PrecoFormValues = z.infer<typeof precoSchema>;

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrecoCurso | null>(null);
  const lista = precos ?? initialPrecos;
  const listaCursos = cursos ?? initialCursos;
  const pagination = useClientPagination({items: lista});
  const cursosSemPreco = useMemo(() => {
    const usados = new Set(lista.map((preco) => preco.cursoId));
    return listaCursos.filter((curso) => !usados.has(curso.id));
  }, [lista, listaCursos]);

  const form = useForm<PrecoFormValues>({
    resolver: zodResolver(precoSchema),
    defaultValues: {cursoId: "", valor: 0},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetPrecosQueryKey()});
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({cursoId: cursosSemPreco[0]?.id ?? "", valor: 0});
    setDialogOpen(true);
  };

  const openEdit = (preco: PrecoCurso) => {
    setEditing(preco);
    form.reset({cursoId: preco.cursoId, valor: preco.valor});
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((payload) => {
    if (editing) {
      updatePreco(
        {id: editing.id, data: {valor: payload.valor}},
        {
          onSuccess: () => {
            toast.success("Preço atualizado. Um novo Price Stripe foi sincronizado.");
            invalidate();
            setDialogOpen(false);
          },
          onError: (error) => toast.error(getMutationErrorMessage(error)),
        },
      );
      return;
    }

    createPreco(payload, {
      onSuccess: () => {
        toast.success("Preço cadastrado em reais.");
        invalidate();
        setDialogOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button disabled={cursosSemPreco.length === 0} onClick={openCreate} size="sm">
            <PlusCircle />
            Novo preço
          </Button>
        }
        description="Informe o valor em reais. A API sincroniza Product e Price no Stripe."
        eyebrow="Financeiro · Stripe"
        title="Tabela de preços"
      />

      <Card>
        <CardContent>
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Cadastre um valor em reais por curso. Não cole IDs price_ no formulário."
              icon={Tag}
              title="Nenhum preço cadastrado"
            />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((preco) => (
                  <TableRow key={preco.id}>
                    <TableCell className="font-medium">{preco.curso.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{MODALIDADE_LABEL[preco.curso.modalidade]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrencyBrl(preco.valor)}</TableCell>
                    <TableCell>
                      <Badge variant={preco.ativo ? "default" : "secondary"}>
                        {preco.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-[11px] text-muted-foreground">
                      {preco.stripePriceId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => openEdit(preco)} size="sm" variant="ghost">
                        Alterar valor
                      </Button>
                      <Button
                        disabled={isUpdating}
                        onClick={() =>
                          updatePreco(
                            {id: preco.id, data: {ativo: !preco.ativo}},
                            {
                              onSuccess: () => {
                                toast.success("Status do preço atualizado.");
                                invalidate();
                              },
                              onError: (error) => toast.error(getMutationErrorMessage(error)),
                            },
                          )
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {preco.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        aria-label={`Excluir preço de ${preco.curso.nome}`}
                        disabled={isDeleting}
                        onClick={() =>
                          deletePreco(preco.id, {
                            onSuccess: () => {
                              toast.success("Preço removido.");
                              invalidate();
                            },
                            onError: (error) => toast.error(getMutationErrorMessage(error)),
                          })
                        }
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              <AdminTablePagination
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

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Atualizar valor" : "Novo preço"}</DialogTitle>
            <DialogDescription>
              Valor em reais. Alterar o valor arquiva o Price antigo no Stripe.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              {!editing ? (
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
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
              ) : null}
              <FormField
                control={form.control}
                name="valor"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        min={0.01}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        ref={field.ref}
                        step="0.01"
                        type="number"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating || isUpdating} type="submit">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
