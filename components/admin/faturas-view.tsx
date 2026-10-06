"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {PlusCircle, Receipt} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {StatusFaturaBadge} from "@/components/admin/status-fatura-badge";
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
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {STATUS_FATURA_LABEL} from "@/lib/admin/labels";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Aluno, Fatura, StatusFatura} from "@/lib/api/fetch-generated";
import {
  getGetFaturasQueryKey,
  useCreateFatura,
  useGetAlunos,
  useGetFaturas,
  useUpdateFaturaStatus,
} from "@/lib/api/rc-generated";

const statusOptions: StatusFatura[] = ["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"];

const faturaSchema = z.object({
  alunoId: z.string().min(1),
  descricao: z.string().min(3).max(255),
  valor: z.number().positive(),
  dataVencimento: z.iso.date(),
});

type FaturaFormValues = z.infer<typeof faturaSchema>;

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const lista = faturas ?? initialFaturas;
  const listaAlunos = alunos ?? initialAlunos;
  const pagination = useClientPagination({items: lista});

  const form = useForm<FaturaFormValues>({
    resolver: zodResolver(faturaSchema),
    defaultValues: {
      alunoId: listaAlunos[0]?.id ?? "",
      descricao: "",
      valor: 0,
      dataVencimento: "",
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetFaturasQueryKey()});
  };

  const onSubmit = form.handleSubmit((payload) => {
    createFatura(payload, {
      onSuccess: () => {
        toast.success("Fatura criada.");
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
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusCircle />
            Nova fatura
          </Button>
        }
        description="Contas a receber acadêmicas. Status pode ser conciliado manualmente."
        eyebrow="Financeiro · contas a receber"
        title="Faturas acadêmicas"
      />

      <Card>
        <CardContent>
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Lance uma fatura vinculada a um aluno já cadastrado."
              icon={Receipt}
              title="Nenhuma fatura"
            />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell>
                      <div className="font-medium">{fatura.aluno.user.nome}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        RA {fatura.aluno.ra}
                      </div>
                    </TableCell>
                    <TableCell>{fatura.descricao}</TableCell>
                    <TableCell className="font-mono">{formatCurrencyBrl(fatura.valor)}</TableCell>
                    <TableCell className="font-mono">{formatDateBr(fatura.dataVencimento)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusFaturaBadge status={fatura.status} />
                        <div className="w-36">
                          <AdminSelect
                            disabled={isUpdating}
                            items={statusOptions.map((status) => ({
                              value: status,
                              label: STATUS_FATURA_LABEL[status],
                            }))}
                            onValueChange={(status) =>
                              updateStatus(
                                {id: fatura.id, status: status as StatusFatura},
                                {
                                  onSuccess: () => {
                                    toast.success("Status da fatura atualizado.");
                                    invalidate();
                                  },
                                  onError: (error) => toast.error(getMutationErrorMessage(error)),
                                },
                              )
                            }
                            value={fatura.status}
                          />
                        </div>
                      </div>
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
            <DialogTitle>Nova fatura</DialogTitle>
            <DialogDescription>Valor em reais e vencimento no formato AAAA-MM-DD.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="alunoId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Aluno</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaAlunos.map((aluno) => ({
                          value: aluno.id,
                          label: `${aluno.ra} · ${aluno.user.nome}`,
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
                control={form.control}
                name="descricao"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Mensalidade 2026.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
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
                <FormField
                  control={form.control}
                  name="dataVencimento"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  Lançar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
