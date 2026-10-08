"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Calendar, PlusCircle, Search, Trash2} from "lucide-react";
import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {useForm, useWatch} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminCombobox} from "@/components/admin/admin-combobox";
import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {ConflictDialog} from "@/components/admin/conflict-dialog";
import {Badge} from "@/components/ui/badge";
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
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {
  buildTurmaRestrictMessage,
  getMutationErrorMessage,
  isConflictError,
} from "@/lib/admin/mutation-error";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {Campus, Curso, Matriz, Professor, TipoEntrega, Turma} from "@/lib/api/fetch-generated";
import {
  getGetTurmasQueryKey,
  useCreateTurma,
  useDeleteTurma,
  useGetComponentesMatriz,
  useGetCursos,
  useGetMatrizes,
  useGetTurmas,
} from "@/lib/api/rc-generated";

const tiposEntrega: TipoEntrega[] = [
  "PRESENCIAL_FISICO",
  "SINCRONO_MEDIADO",
  "ASSINCRONO_DIGITAL",
];

const turmaSchema = z.object({
  cursoId: z.string().min(1),
  campusId: z.string().min(1),
  disciplinaId: z.string().min(1),
  professorId: z.string().min(1),
  codigo: z.string().min(3).max(50),
  anoLetivo: z.number().int().min(2020),
  semestreLetivo: z.union([z.literal(1), z.literal(2)]),
  capacidade: z.number().int().min(1),
  horario: z.string().min(3).max(100),
  salaOuLink: z.string().max(255).optional(),
  tipoEntrega: z.enum(["PRESENCIAL_FISICO", "SINCRONO_MEDIADO", "ASSINCRONO_DIGITAL"]),
});

type TurmaFormValues = z.infer<typeof turmaSchema>;

interface TurmasListViewProps {
  anoLetivo: number;
  initialCampi: Campus[];
  initialCursos: Curso[];
  initialMatrizes: Matriz[];
  initialProfessores: Professor[];
  initialTurmas: Turma[];
  isAdmin: boolean;
  semestreLetivo: number;
}

export const TurmasListView = ({
  anoLetivo,
  initialCampi,
  initialCursos,
  initialMatrizes,
  initialProfessores,
  initialTurmas,
  isAdmin,
  semestreLetivo,
}: TurmasListViewProps) => {
  const queryClient = useQueryClient();
  const [anoFiltro, setAnoFiltro] = useState(anoLetivo);
  const [semestreFiltro, setSemestreFiltro] = useState(semestreLetivo);
  const periodo = {anoLetivo: anoFiltro, semestreLetivo: semestreFiltro};
  const periodoInicial = anoFiltro === anoLetivo && semestreFiltro === semestreLetivo;
  const {data: turmas} = useGetTurmas({
    query: periodo,
    initialData: periodoInicial ? initialTurmas : undefined,
  });
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: matrizes} = useGetMatrizes({initialData: initialMatrizes});
  const {mutate: createTurma, isPending: isCreating} = useCreateTurma();
  const {mutate: deleteTurma, isPending: isDeleting} = useDeleteTurma();
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState("ALL");
  const [cursoFilter, setCursoFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflict, setConflict] = useState<{entityName: string; message: string} | null>(null);

  const lista = turmas ?? (periodoInicial ? initialTurmas : []);
  const listaCampi = initialCampi;
  const listaCursos = cursos ?? initialCursos;
  const listaMatrizes = matrizes ?? initialMatrizes;
  const listaProfessores = initialProfessores;

  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      cursoId: listaCursos[0]?.id ?? "",
      campusId: listaCursos[0]?.campusId ?? listaCampi[0]?.id ?? "",
      disciplinaId: "",
      professorId: listaProfessores[0]?.id ?? "",
      codigo: "",
      anoLetivo,
      semestreLetivo: semestreLetivo === 1 ? 1 : 2,
      capacidade: 50,
      horario: "",
      salaOuLink: "",
      tipoEntrega: "PRESENCIAL_FISICO",
    },
  });

  const cursoIdSelecionado = useWatch({control: form.control, name: "cursoId"});
  const disciplinaIdSelecionada = useWatch({control: form.control, name: "disciplinaId"});

  const matrizDoCurso = useMemo(() => {
    const doCurso = listaMatrizes.filter((matriz) => matriz.cursoId === cursoIdSelecionado);
    const ativas = doCurso.filter((matriz) => matriz.ativo);
    const candidatos = ativas.length > 0 ? ativas : doCurso;

    return [...candidatos].sort((a, b) => b.anoVigencia - a.anoVigencia)[0];
  }, [cursoIdSelecionado, listaMatrizes]);

  const {data: componentes} = useGetComponentesMatriz(
    dialogOpen ? (matrizDoCurso?.id ?? "") : "",
  );
  const disciplinasDoCurso = useMemo(() => {
    return (componentes ?? []).map((item) => ({
      id: item.disciplina.id,
      nome: item.disciplina.nome,
      codigo: item.disciplina.codigo,
      tipoEntrega: item.tipoEntrega,
    }));
  }, [componentes]);

  useEffect(() => {
    const curso = listaCursos.find((item) => item.id === cursoIdSelecionado);

    if (curso) {
      form.setValue("campusId", curso.campusId);
    }

    if (
      disciplinaIdSelecionada &&
      !disciplinasDoCurso.some((disciplina) => disciplina.id === disciplinaIdSelecionada)
    ) {
      form.setValue("disciplinaId", "");
    }
  }, [cursoIdSelecionado, disciplinaIdSelecionada, disciplinasDoCurso, form, listaCursos]);

  useEffect(() => {
    const componente = disciplinasDoCurso.find((item) => item.id === disciplinaIdSelecionada);

    if (componente) {
      form.setValue("tipoEntrega", componente.tipoEntrega);
    }
  }, [disciplinaIdSelecionada, disciplinasDoCurso, form]);

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return lista.filter((turma) => {
      const matchesCampus = campusFilter === "ALL" || turma.campusId === campusFilter;
      const matchesCurso = cursoFilter === "ALL" || turma.cursoId === cursoFilter;
      const matchesSearch =
        termo.length === 0 ||
        turma.codigo.toLowerCase().includes(termo) ||
        turma.disciplina.nome.toLowerCase().includes(termo) ||
        turma.curso.nome.toLowerCase().includes(termo) ||
        turma.professor.user.nome.toLowerCase().includes(termo);

      return matchesCampus && matchesCurso && matchesSearch;
    });
  }, [lista, campusFilter, cursoFilter, searchTerm]);

  const pagination = useClientPagination({
    items: filtradas,
    resetKey: `${searchTerm}|${campusFilter}|${cursoFilter}|${anoFiltro}|${semestreFiltro}`,
  });

  const invalidate = (queryPeriodo = periodo) => {
    void queryClient.invalidateQueries({queryKey: getGetTurmasQueryKey(queryPeriodo)});
    void queryClient.invalidateQueries({queryKey: ["/api/v1/academic/turmas"]});
  };

  const openDialog = () => {
    const cursoInicial = listaCursos[0];

    form.reset({
      cursoId: cursoInicial?.id ?? "",
      campusId: cursoInicial?.campusId ?? "",
      disciplinaId: "",
      professorId: listaProfessores[0]?.id ?? "",
      codigo: "",
      anoLetivo: anoFiltro,
      semestreLetivo: semestreFiltro === 1 ? 1 : 2,
      capacidade: 50,
      horario: "",
      salaOuLink: "",
      tipoEntrega: "PRESENCIAL_FISICO",
    });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((payload) => {
    createTurma(
      {
        ...payload,
        salaOuLink: payload.salaOuLink || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Turma ofertada.");
          setAnoFiltro(payload.anoLetivo);
          setSemestreFiltro(payload.semestreLetivo);
          invalidate({anoLetivo: payload.anoLetivo, semestreLetivo: payload.semestreLetivo});
          setDialogOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const campusNome = (campusId: string) => {
    return listaCampi.find((campus) => campus.id === campusId)?.codigoPolo ?? campusId;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          isAdmin ? (
            <Button onClick={openDialog} size="sm">
              <PlusCircle />
              Ofertar nova turma
            </Button>
          ) : null
        }
        description={`Período letivo ${formatPeriodoLetivo(periodo)} · horários, salas, ocupação e diários eletrônicos.`}
        eyebrow={isAdmin ? "Gestão acadêmica de turmas" : "Corpo docente"}
        title={isAdmin ? "Turmas ofertadas" : "Minhas turmas atribuídas"}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por código, curso, disciplina ou professor..."
              value={searchTerm}
            />
          </div>
          {isAdmin ? (
            <>
              <div className="w-full md:w-28">
                <Input
                  min={2020}
                  onChange={(event) => {
                    const ano = event.target.valueAsNumber;
                    if (!Number.isNaN(ano)) {
                      setAnoFiltro(ano);
                    }
                  }}
                  type="number"
                  value={anoFiltro}
                />
              </div>
              <div className="w-full md:w-40">
                <AdminSelect
                  items={[
                    {value: "1", label: "1º semestre"},
                    {value: "2", label: "2º semestre"},
                  ]}
                  onValueChange={(value) => setSemestreFiltro(value === "1" ? 1 : 2)}
                  value={String(semestreFiltro)}
                />
              </div>
              <div className="w-full md:w-56">
                <AdminSelect
                  items={[
                    {value: "ALL", label: "Todos os cursos"},
                    ...listaCursos.map((curso) => ({
                      value: curso.id,
                      label: curso.nome,
                    })),
                  ]}
                  onValueChange={setCursoFilter}
                  value={cursoFilter}
                />
              </div>
              <div className="w-full md:w-56">
                <AdminSelect
                  items={[
                    {value: "ALL", label: "Todos os campi e polos"},
                    ...listaCampi.map((campus) => ({
                      value: campus.id,
                      label: `${campus.codigoPolo} · ${campus.nome}`,
                    })),
                  ]}
                  onValueChange={setCampusFilter}
                  value={campusFilter}
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {filtradas.length === 0 ? (
            <AdminEmptyState
              description="Não há turmas para os filtros atuais neste período letivo."
              icon={Calendar}
              title="Nenhuma turma encontrada"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Ocupação</TableHead>
                    {isAdmin ? <TableHead className="text-right">Ações</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell>
                        <Button
                          className="h-auto p-0 font-mono"
                          nativeButton={false}
                          render={<Link href={`/area-admin/turmas/${turma.id}`} />}
                          variant="link"
                        >
                          {turma.codigo}
                        </Button>
                      </TableCell>
                      <TableCell>{turma.curso.nome}</TableCell>
                      <TableCell>
                        <div className="font-medium">{turma.disciplina.nome}</div>
                        <Badge variant="outline">{TIPO_ENTREGA_LABEL[turma.tipoEntrega]}</Badge>
                      </TableCell>
                      <TableCell>{turma.professor.user.nome}</TableCell>
                      <TableCell className="font-mono text-xs">{campusNome(turma.campusId)}</TableCell>
                      <TableCell className="font-mono text-xs">{turma.horario}</TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {turma.quantidadeDiarios ?? 0}/{turma.capacidade}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell className="text-right">
                          <Button
                            aria-label={`Excluir turma ${turma.codigo}`}
                            disabled={isDeleting}
                            onClick={() => {
                              const quantidadeDiarios = turma.quantidadeDiarios ?? 0;

                              if (quantidadeDiarios > 0) {
                                setConflict({
                                  entityName: `Turma ${turma.codigo}`,
                                  message: buildTurmaRestrictMessage(quantidadeDiarios),
                                });
                                return;
                              }

                              deleteTurma(turma.id, {
                                onSuccess: () => {
                                  toast.success("Turma removida.");
                                  invalidate();
                                },
                                onError: (error) => {
                                  if (isConflictError(error)) {
                                    setConflict({
                                      entityName: `Turma ${turma.codigo}`,
                                      message: getMutationErrorMessage(error),
                                    });
                                    return;
                                  }

                                  toast.error(getMutationErrorMessage(error));
                                },
                              });
                            }}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      ) : null}
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

      <ConflictDialog
        dependencyMessage={conflict?.message ?? ""}
        entityName={conflict?.entityName ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setConflict(null);
          }
        }}
        open={conflict !== null}
      />

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ofertar turma</DialogTitle>
            <DialogDescription>
              Escolha o curso e o semestre letivo. A disciplina precisa estar na matriz desse curso.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="cursoId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Curso</FormLabel>
                    <FormControl>
                      <AdminCombobox
                        emptyText="Nenhum curso encontrado."
                        items={listaCursos.map((curso) => ({
                          value: curso.id,
                          label: curso.nome,
                          keywords: `${curso.nome} ${curso.codigoMec ?? ""}`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Buscar curso..."
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="anoLetivo"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Ano letivo</FormLabel>
                      <FormControl>
                        <Input
                          min={2020}
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
                <FormField
                  control={form.control}
                  name="semestreLetivo"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Semestre</FormLabel>
                      <FormControl>
                        <AdminSelect
                          items={[
                            {value: "1", label: "1º semestre"},
                            {value: "2", label: "2º semestre"},
                          ]}
                          onValueChange={(value) => field.onChange(value === "1" ? 1 : 2)}
                          value={String(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="disciplinaId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Disciplina</FormLabel>
                    <FormControl>
                      <AdminCombobox
                        emptyText={
                          cursoIdSelecionado
                            ? "Nenhuma disciplina na matriz deste curso."
                            : "Selecione um curso primeiro."
                        }
                        items={disciplinasDoCurso.map((disciplina) => ({
                          value: disciplina.id,
                          label: `${disciplina.codigo} · ${disciplina.nome}`,
                          keywords: `${disciplina.codigo} ${disciplina.nome}`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Buscar por código ou nome..."
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="professorId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Professor titular</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaProfessores.map((professor) => ({
                          value: professor.id,
                          label: `${professor.user.nome} · ${professor.matricula}`,
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
                name="codigo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="ENG-CALC-T01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="horario"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seg/Qua 10:00 - 11:40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Capacidade</FormLabel>
                      <FormControl>
                        <Input
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
                name="salaOuLink"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Sala ou link</FormLabel>
                    <FormControl>
                      <Input placeholder="Sala 204 ou URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoEntrega"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo de entrega</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={tiposEntrega.map((item) => ({
                          value: item,
                          label: TIPO_ENTREGA_LABEL[item],
                        }))}
                        onValueChange={field.onChange}
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
                <Button disabled={isCreating} type="submit">
                  <PendingButtonLabel isPending={isCreating} label="Ofertar" pendingLabel="Ofertando..." />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
