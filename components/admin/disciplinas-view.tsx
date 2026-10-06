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
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Disciplina} from "@/lib/api/fetch-generated";
import {
  getGetDisciplinasQueryKey,
  useCreateDisciplina,
  useDeleteDisciplina,
  useGetDisciplinas,
  useUpdateDisciplina,
} from "@/lib/api/rc-generated";

const disciplinaSchema = z.object({
  nome: z.string().min(3).max(150),
  codigo: z.string().min(2).max(20),
});

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
    defaultValues: {nome: "", codigo: ""},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetDisciplinasQueryKey()});
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({nome: "", codigo: ""});
    setDialogOpen(true);
  };

  const openEdit = (disciplina: Disciplina) => {
    setEditing(disciplina);
    form.reset({nome: disciplina.nome, codigo: disciplina.codigo});
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((disciplina) => (
                  <TableRow key={disciplina.id}>
                    <TableCell className="font-mono">{disciplina.codigo}</TableCell>
                    <TableCell>{disciplina.nome}</TableCell>
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
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar disciplina" : "Nova disciplina"}</DialogTitle>
            <DialogDescription>
              Entidade global reutilizada nas matrizes curriculares.
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
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating || isUpdating} type="submit">
                  {editing ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
