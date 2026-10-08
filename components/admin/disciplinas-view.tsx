"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {BookOpen, Pencil, PlusCircle, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {CargaCurricularFields} from "@/components/admin/carga-curricular-fields";
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
import {Input} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {splitCargaHoraria} from "@/lib/academic/carga-horaria";
import {TIPO_COMPONENTE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {Disciplina} from "@/lib/api/fetch-generated";
import {
  getGetDisciplinasQueryKey,
  useCreateDisciplina,
  useDeleteDisciplina,
  useGetDisciplinas,
  useUpdateDisciplina,
} from "@/lib/api/rc-generated";

const disciplinaSchema = z
  .object({
    nome: z.string().min(3).max(150),
    codigo: z.string().min(2).max(20),
    tipo: z.enum([
      "CORE_VIDA_CARREIRA",
      "ESPECIFICO",
      "ELETIVA_TRILHA",
      "EXTENSAO",
      "OPTATIVO",
    ]),
    tipoEntrega: z.enum(["PRESENCIAL_FISICO", "SINCRONO_MEDIADO", "ASSINCRONO_DIGITAL"]),
    chTotal: z.number().int().min(10),
    chPresencial: z.number().int().min(0),
    chSincrona: z.number().int().min(0),
    chAssincrona: z.number().int().min(0),
    chExtensao: z.number().int().min(0),
  })
  .refine(
    (payload) => payload.chPresencial + payload.chSincrona + payload.chAssincrona === payload.chTotal,
    {
      message: "A soma presencial + síncrona + assíncrona deve ser igual à CH total.",
      path: ["chAssincrona"],
    },
  );

type DisciplinaFormValues = z.infer<typeof disciplinaSchema>;

interface DisciplinasViewProps {
  initialDisciplinas: Disciplina[];
}

export const DisciplinasView = ({initialDisciplinas}: DisciplinasViewProps) => {
  const queryClient = useQueryClient();
  const {data: disciplinas} = useGetDisciplinas({initialData: initialDisciplinas});
  const {mutate: createDisciplina, isPending: isCreating} = useCreateDisciplina();
  const {mutate: updateDisciplina, isPending: isUpdating} = useUpdateDisciplina();
  const {mutate: deleteDisciplina, isPending: isDeleting} = useDeleteDisciplina();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Disciplina | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const lista = disciplinas ?? initialDisciplinas;

  const form = useForm<DisciplinaFormValues>({
    resolver: zodResolver(disciplinaSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      tipo: "ESPECIFICO",
      tipoEntrega: "PRESENCIAL_FISICO",
      chTotal: 60,
      chPresencial: 60,
      chSincrona: 0,
      chAssincrona: 0,
      chExtensao: 0,
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetDisciplinasQueryKey()});
  };

  const cargaPadrao = {
    tipo: "ESPECIFICO" as const,
    tipoEntrega: "PRESENCIAL_FISICO" as const,
    chTotal: 60,
    chPresencial: 60,
    chSincrona: 0,
    chAssincrona: 0,
    chExtensao: 0,
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({nome: "", codigo: "", ...cargaPadrao});
    setDialogOpen(true);
  };

  const openEdit = (disciplina: Disciplina) => {
    setEditing(disciplina);
    form.reset({
      nome: disciplina.nome,
      codigo: disciplina.codigo,
      tipo: disciplina.tipo,
      tipoEntrega: disciplina.tipoEntrega,
      chTotal: disciplina.chTotal,
      chPresencial: disciplina.chPresencial,
      chSincrona: disciplina.chSincrona,
      chAssincrona: disciplina.chAssincrona,
      chExtensao: disciplina.chExtensao,
    });
    setDialogOpen(true);
  };

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (termo.length === 0) {
      return lista;
    }

    return lista.filter((disciplina) => {
      return (
        disciplina.nome.toLowerCase().includes(termo) ||
        disciplina.codigo.toLowerCase().includes(termo)
      );
    });
  }, [lista, searchTerm]);

  const pagination = useClientPagination({items: filtradas, resetKey: searchTerm});

  const onSubmit = form.handleSubmit((payload) => {
    const data = {...payload, codigo: payload.codigo.toUpperCase()};

    if (editing) {
      updateDisciplina(
        {id: editing.id, data},
        {
          onSuccess: () => {
            toast.success("Disciplina atualizada.");
            invalidate();
            setDialogOpen(false);
          },
          onError: (error) => toast.error(getMutationErrorMessage(error)),
        },
      );
      return;
    }

    createDisciplina(data, {
      onSuccess: () => {
        toast.success("Disciplina cadastrada.");
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
          <Button onClick={openCreate} size="sm">
            <PlusCircle />
            Nova disciplina
          </Button>
        }
        description="Catálogo global de componentes curriculares reutilizáveis nas matrizes dos cursos."
        eyebrow="Catálogo acadêmico global"
        title="Disciplinas"
      />

      <Card>
        <CardContent>
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar por código da disciplina (ex: ESW101) ou nome..."
            value={searchTerm}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Cadastre disciplinas globais como Cálculo I ou Ética antes de montar as matrizes."
              icon={BookOpen}
              title="Nenhuma disciplina cadastrada"
            />
          ) : filtradas.length === 0 ? (
            <AdminEmptyState
              description="Nenhuma disciplina corresponde ao termo informado. Ajuste a busca para ver o catálogo."
              icon={BookOpen}
              title="Nenhuma disciplina encontrada"
            />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CH total</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((disciplina) => (
                  <TableRow key={disciplina.id}>
                    <TableCell className="font-mono">{disciplina.codigo}</TableCell>
                    <TableCell>{disciplina.nome}</TableCell>
                    <TableCell className="font-mono">{disciplina.chTotal}h</TableCell>
                    <TableCell>{TIPO_COMPONENTE_LABEL[disciplina.tipo]}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Editar ${disciplina.nome}`}
                        onClick={() => openEdit(disciplina)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Excluir ${disciplina.nome}`}
                        disabled={isDeleting}
                        onClick={() =>
                          deleteDisciplina(disciplina.id, {
                            onSuccess: () => {
                              toast.success("Disciplina removida.");
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar disciplina" : "Nova disciplina"}</DialogTitle>
            <DialogDescription>
              CH total = presencial + síncrona + assíncrona. Semestre ideal é definido ao incluir a disciplina na matriz.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="codigo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="CALC-I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Cálculo I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CargaCurricularFields
                control={form.control}
                onChTotalChange={(chTotal) => {
                  const distribuicao = splitCargaHoraria(chTotal, "PRESENCIAL");
                  form.setValue("chPresencial", distribuicao.chPresencial);
                  form.setValue("chSincrona", distribuicao.chSincrona);
                  form.setValue("chAssincrona", distribuicao.chAssincrona);
                }}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating || isUpdating} type="submit">
                  <PendingButtonLabel
                    isPending={isCreating || isUpdating}
                    label={editing ? "Salvar" : "Cadastrar"}
                    pendingLabel={editing ? "Salvando..." : "Cadastrando..."}
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
