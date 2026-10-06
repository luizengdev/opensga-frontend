"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {FileCheck2, PlusCircle, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {StatusMatriculaBadge} from "@/components/admin/status-matricula-badge";
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
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {STATUS_MATRICULA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Curso, Matricula, Matriz, StatusMatricula} from "@/lib/api/fetch-generated";
import {
  getGetMatriculasQueryKey,
  useCreateMatricula,
  useDeleteMatricula,
  useGetCursos,
  useGetMatriculas,
  useGetMatrizes,
  useUpdateMatriculaStatus,
} from "@/lib/api/rc-generated";

const statusOptions: StatusMatricula[] = [
  "PRE_MATRICULADO",
  "ATIVO",
  "TRANCADO",
  "CANCELADO",
  "FORMADO",
  "EVADIDO",
];

const matriculaSchema = z.object({
  nome: z.string().min(3).max(150),
  email: z.email(),
  cpf: z.string().length(14),
  telefone: z.string().optional(),
  dataNascimento: z.iso.date(),
  cursoId: z.string().min(1),
  matrizCurricularId: z.string().min(1),
  semestreIngresso: z.string().regex(/^\d{4}\.[12]$/),
});

type MatriculaFormValues = z.infer<typeof matriculaSchema>;

interface MatriculasViewProps {
  initialCursos: Curso[];
  initialMatriculas: Matricula[];
  initialMatrizes: Matriz[];
}

export const MatriculasView = ({
  initialCursos,
  initialMatriculas,
  initialMatrizes,
}: MatriculasViewProps) => {
  const queryClient = useQueryClient();
  const periodo = getPeriodoLetivoAtual();
  const {data: matriculas} = useGetMatriculas({initialData: initialMatriculas});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: matrizes} = useGetMatrizes({initialData: initialMatrizes});
  const {mutate: createMatricula, isPending: isCreating} = useCreateMatricula();
  const {mutate: updateStatus, isPending: isUpdating} = useUpdateMatriculaStatus();
  const {mutate: deleteMatricula, isPending: isDeleting} = useDeleteMatricula();
  const [dialogOpen, setDialogOpen] = useState(false);
  const lista = matriculas ?? initialMatriculas;
  const listaCursos = cursos ?? initialCursos;
  const listaMatrizes = matrizes ?? initialMatrizes;

  const form = useForm<MatriculaFormValues>({
    resolver: zodResolver(matriculaSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      dataNascimento: "",
      cursoId: listaCursos[0]?.id ?? "",
      matrizCurricularId: "",
      semestreIngresso: formatPeriodoLetivo(periodo),
    },
  });

  const cursoId = form.watch("cursoId");
  const matrizesDoCurso = useMemo(
    () => listaMatrizes.filter((matriz) => matriz.cursoId === cursoId),
    [listaMatrizes, cursoId],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetMatriculasQueryKey()});
  };

  const onSubmit = form.handleSubmit((payload) => {
    createMatricula(
      {
        ...payload,
        telefone: payload.telefone || undefined,
      },
      {
        onSuccess: (result) => {
          toast.success(`Matrícula criada. RA ${result.ra}`);
          invalidate();
          setDialogOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusCircle />
            Nova matrícula
          </Button>
        }
        description="Vínculo acadêmico, RA gerado pela API e ciclo de status da matrícula."
        eyebrow="Secretaria acadêmica"
        title="Matrículas e RA"
      />

      <Card>
        <CardContent>
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Crie uma matrícula informando os dados do aluno, o curso e a matriz curricular."
              icon={FileCheck2}
              title="Nenhuma matrícula"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RA</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Ingresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((matricula) => (
                  <TableRow key={matricula.id}>
                    <TableCell className="font-mono">{matricula.aluno.ra}</TableCell>
                    <TableCell>
                      <div className="font-medium">{matricula.aluno.user.nome}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {matricula.aluno.user.email}
                      </div>
                    </TableCell>
                    <TableCell>{matricula.curso.nome}</TableCell>
                    <TableCell className="font-mono">{matricula.semestreIngresso}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusMatriculaBadge status={matricula.status} />
                        <div className="w-40">
                          <AdminSelect
                            disabled={isUpdating}
                            items={statusOptions.map((status) => ({
                              value: status,
                              label: STATUS_MATRICULA_LABEL[status],
                            }))}
                            onValueChange={(status) =>
                              updateStatus(
                                {id: matricula.id, status: status as StatusMatricula},
                                {
                                  onSuccess: () => {
                                    toast.success("Status atualizado.");
                                    invalidate();
                                  },
                                  onError: (error) => toast.error(getMutationErrorMessage(error)),
                                },
                              )
                            }
                            value={matricula.status}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Excluir matrícula ${matricula.aluno.ra}`}
                        disabled={isDeleting}
                        onClick={() =>
                          deleteMatricula(matricula.id, {
                            onSuccess: () => {
                              toast.success("Matrícula removida.");
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
            <DialogTitle>Nova matrícula</DialogTitle>
            <DialogDescription>O RA é gerado automaticamente pela API.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome do aluno</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cursoId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Curso</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaCursos.map((curso) => ({
                          value: curso.id,
                          label: curso.nome,
                        }))}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const primeira = listaMatrizes.find((matriz) => matriz.cursoId === value);
                          form.setValue("matrizCurricularId", primeira?.id ?? "");
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matrizCurricularId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Matriz curricular</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={matrizesDoCurso.map((matriz) => ({
                          value: matriz.id,
                          label: `${matriz.nome} (${matriz.anoVigencia})`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Selecione a matriz"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semestreIngresso"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Semestre de ingresso</FormLabel>
                    <FormControl>
                      <Input placeholder="2026.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  Matricular
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
