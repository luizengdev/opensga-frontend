"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {GraduationCap, Pencil, PlusCircle, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminSelect} from "@/components/admin/admin-select";
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
import {MODALIDADE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Campus, Curso, ModalidadeCurso} from "@/lib/api/fetch-generated";
import {
  getGetCursosQueryKey,
  useCreateCurso,
  useDeleteCurso,
  useGetCampi,
  useGetCursos,
  useUpdateCurso,
} from "@/lib/api/rc-generated";

const modalidades: ModalidadeCurso[] = ["PRESENCIAL", "SEMIPRESENCIAL", "EAD"];

const cursoSchema = z.object({
  campusId: z.string().min(1),
  nome: z.string().min(3).max(150),
  codigoMec: z.string().max(50).optional(),
  modalidade: z.enum(["PRESENCIAL", "SEMIPRESENCIAL", "EAD"]),
  duracaoSemestres: z.number().int().min(1).max(20),
});

type CursoFormValues = z.infer<typeof cursoSchema>;

interface CursosViewProps {
  initialCampi: Campus[];
  initialCursos: Curso[];
}

export const CursosView = ({initialCampi, initialCursos}: CursosViewProps) => {
  const queryClient = useQueryClient();
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: campi} = useGetCampi({initialData: initialCampi});
  const {mutate: createCurso, isPending: isCreating} = useCreateCurso();
  const {mutate: updateCurso, isPending: isUpdating} = useUpdateCurso();
  const {mutate: deleteCurso, isPending: isDeleting} = useDeleteCurso();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const lista = cursos ?? initialCursos;
  const listaCampi = campi ?? initialCampi;

  const form = useForm<CursoFormValues>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      campusId: listaCampi[0]?.id ?? "",
      nome: "",
      codigoMec: "",
      modalidade: "PRESENCIAL",
      duracaoSemestres: 8,
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetCursosQueryKey()});
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({
      campusId: listaCampi[0]?.id ?? "",
      nome: "",
      codigoMec: "",
      modalidade: "PRESENCIAL",
      duracaoSemestres: 8,
    });
    setDialogOpen(true);
  };

  const openEdit = (curso: Curso) => {
    setEditing(curso);
    form.reset({
      campusId: curso.campusId,
      nome: curso.nome,
      codigoMec: curso.codigoMec ?? "",
      modalidade: curso.modalidade,
      duracaoSemestres: curso.duracaoSemestres,
    });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((payload) => {
    const data = {
      campusId: payload.campusId,
      nome: payload.nome,
      modalidade: payload.modalidade,
      duracaoSemestres: payload.duracaoSemestres,
      ...(payload.codigoMec ? {codigoMec: payload.codigoMec} : {}),
    };

    if (editing) {
      updateCurso(
        {id: editing.id, data},
        {
          onSuccess: () => {
            toast.success("Curso atualizado.");
            invalidate();
            setDialogOpen(false);
          },
          onError: (error) => toast.error(getMutationErrorMessage(error)),
        },
      );
      return;
    }

    createCurso(data, {
      onSuccess: () => {
        toast.success("Curso cadastrado.");
        invalidate();
        setDialogOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  const campusNome = (campusId: string) => {
    return listaCampi.find((campus) => campus.id === campusId)?.nome ?? campusId;
  };

  const filtrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (termo.length === 0) {
      return lista;
    }

    return lista.filter((curso) => {
      const campus = listaCampi.find((item) => item.id === curso.campusId);
      const campos = [
        curso.nome,
        curso.codigoMec ?? "",
        MODALIDADE_LABEL[curso.modalidade],
        campus?.nome ?? "",
        campus?.codigoPolo ?? "",
      ];

      return campos.some((campo) => campo.toLowerCase().includes(termo));
    });
  }, [lista, listaCampi, searchTerm]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button disabled={listaCampi.length === 0} onClick={openCreate} size="sm">
            <PlusCircle />
            Novo curso
          </Button>
        }
        description="Graduação por campus e modalidade. Engenharia presencial e EAD são cursos distintos."
        eyebrow="Oferta de graduação"
        title="Cursos ofertados"
      />

      <Card>
        <CardContent>
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar por nome, campus, modalidade ou código MEC..."
            value={searchTerm}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Cadastre um campus antes de criar cursos de graduação."
              icon={GraduationCap}
              title="Nenhum curso cadastrado"
            />
          ) : filtrados.length === 0 ? (
            <AdminEmptyState
              description="Nenhum curso corresponde ao termo informado. Ajuste a busca para ver a oferta."
              icon={GraduationCap}
              title="Nenhum curso encontrado"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Código MEC</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((curso) => (
                  <TableRow key={curso.id}>
                    <TableCell className="font-medium">{curso.nome}</TableCell>
                    <TableCell>{campusNome(curso.campusId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{MODALIDADE_LABEL[curso.modalidade]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {curso.codigoMec ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono">{curso.duracaoSemestres} sem.</TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Editar ${curso.nome}`}
                        onClick={() => openEdit(curso)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Excluir ${curso.nome}`}
                        disabled={isDeleting}
                        onClick={() =>
                          deleteCurso(curso.id, {
                            onSuccess: () => {
                              toast.success("Curso removido.");
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
            <DialogDescription>
              Vincule o curso a um campus e defina a modalidade de oferta.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="campusId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaCampi.map((campus) => ({
                          value: campus.id,
                          label: `${campus.codigoPolo} · ${campus.nome}`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Selecione o campus"
                        value={field.value}
                      />
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
                      <Input placeholder="Engenharia de Software" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="modalidade"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <FormControl>
                        <AdminSelect
                          items={modalidades.map((item) => ({
                            value: item,
                            label: MODALIDADE_LABEL[item],
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
                  name="duracaoSemestres"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Duração (semestres)</FormLabel>
                      <FormControl>
                        <Input
                          max={20}
                          min={1}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                          ref={field.ref}
                          type="number"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="codigoMec"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Código MEC (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
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
