"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {AlertTriangle, Calendar, CheckCircle2, Layers, PlusCircle, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminCombobox} from "@/components/admin/admin-combobox";
import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {ConflictDialog} from "@/components/admin/conflict-dialog";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card";
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
import {chExtensaoDaAuditoria} from "@/lib/academic/carga-horaria";
import {formatPercent} from "@/lib/admin/format";
import {MODALIDADE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage, isConflictError} from "@/lib/admin/mutation-error";
import type {
  AuditoriaMec,
  ComponenteCurricular,
  Curso,
  Disciplina,
  Matriz,
} from "@/lib/api/fetch-generated";
import {
  getGetMatrizesQueryKey,
  useAddComponenteMatriz,
  useCreateMatriz,
  useDeleteComponente,
  useDeleteMatriz,
  useGetAuditoriaMec,
  useGetComponentesMatriz,
  useGetCursos,
  useGetDisciplinas,
  useGetMatrizes,
} from "@/lib/api/rc-generated";

const matrizSchema = z.object({
  cursoId: z.string().min(1),
  nome: z.string().min(3).max(100),
  anoVigencia: z.number().int().min(2020),
});

const componenteSchema = z.object({
  disciplinaId: z.string().min(1),
  semestreIdeal: z.number().int().min(1).max(16),
});

type MatrizFormValues = z.infer<typeof matrizSchema>;
type ComponenteFormValues = z.infer<typeof componenteSchema>;

const chExtensaoExibida = (item: ComponenteCurricular) => {
  if (item.chExtensao > 0) {
    return item.chExtensao;
  }

  return item.tipo === "EXTENSAO" ? item.chTotal : 0;
};

interface MatrizesViewProps {
  initialAuditoria: AuditoriaMec | null;
  initialComponentes: ComponenteCurricular[];
  initialCursos: Curso[];
  initialDisciplinas: Disciplina[];
  initialMatrizes: Matriz[];
}

export const MatrizesView = ({
  initialAuditoria,
  initialComponentes,
  initialCursos,
  initialDisciplinas,
  initialMatrizes,
}: MatrizesViewProps) => {
  const queryClient = useQueryClient();
  const {data: matrizes} = useGetMatrizes({initialData: initialMatrizes});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: disciplinas} = useGetDisciplinas({initialData: initialDisciplinas});
  const listaMatrizes = matrizes ?? initialMatrizes;
  const listaCursos = cursos ?? initialCursos;
  const listaDisciplinas = disciplinas ?? initialDisciplinas;
  const [selectedId, setSelectedId] = useState(listaMatrizes[0]?.id ?? "");
  const [matrizDialogOpen, setMatrizDialogOpen] = useState(false);
  const [componenteDialogOpen, setComponenteDialogOpen] = useState(false);
  const [conflict, setConflict] = useState<{
    entityName: string;
    message: string;
    recommendedAction: string;
  } | null>(null);
  const [pendingComponente, setPendingComponente] = useState<ComponenteCurricular | null>(null);
  const [pendingMatrizDelete, setPendingMatrizDelete] = useState(false);

  const {data: auditoria} = useGetAuditoriaMec(selectedId, {
    initialData: selectedId === initialMatrizes[0]?.id ? (initialAuditoria ?? undefined) : undefined,
  });
  const {data: componentes, isFetching: isFetchingComponentes} = useGetComponentesMatriz(
    selectedId,
    {
      initialData:
        selectedId === initialMatrizes[0]?.id ? initialComponentes : undefined,
    },
  );

  const {mutate: createMatriz, isPending: isCreatingMatriz} = useCreateMatriz();
  const {mutate: addComponente, isPending: isAddingComponente} = useAddComponenteMatriz();
  const {mutate: removeComponente, isPending: isRemoving} = useDeleteComponente();
  const {mutate: removeMatriz, isPending: isDeletingMatriz} = useDeleteMatriz();

  const listaComponentes =
    componentes ?? (selectedId === initialMatrizes[0]?.id ? initialComponentes : []);
  const relatorio = auditoria ?? null;
  const matrizAtual = listaMatrizes.find((item) => item.id === selectedId);

  const matrizForm = useForm<MatrizFormValues>({
    resolver: zodResolver(matrizSchema),
    defaultValues: {
      cursoId: listaCursos[0]?.id ?? "",
      nome: "",
      anoVigencia: 2026,
    },
  });

  const componenteForm = useForm<ComponenteFormValues>({
    resolver: zodResolver(componenteSchema),
    defaultValues: {
      disciplinaId: "",
      semestreIdeal: 1,
    },
  });

  const invalidateMatrizes = () => {
    void queryClient.invalidateQueries({queryKey: getGetMatrizesQueryKey()});
    void queryClient.invalidateQueries({queryKey: ["/api/v1/academic/matrizes"]});
  };

  const componentesPorSemestre = useMemo(() => {
    const grupos = new Map<number, ComponenteCurricular[]>();
    listaComponentes.forEach((item) => {
      const atual = grupos.get(item.semestreIdeal) ?? [];
      grupos.set(item.semestreIdeal, [...atual, item]);
    });
    return Array.from(grupos.entries()).sort((a, b) => a[0] - b[0]);
  }, [listaComponentes]);

  const cursoNome = (cursoId: string) => {
    return listaCursos.find((curso) => curso.id === cursoId)?.nome ?? cursoId;
  };

  const disciplinasDisponiveis = useMemo(() => {
    const vinculadas = new Set(listaComponentes.map((item) => item.disciplinaId));
    return listaDisciplinas.filter((disciplina) => !vinculadas.has(disciplina.id));
  }, [listaComponentes, listaDisciplinas]);

  const onCreateMatriz = matrizForm.handleSubmit((payload) => {
    createMatriz(payload, {
      onSuccess: (created) => {
        toast.success("Matriz curricular criada.");
        invalidateMatrizes();
        setSelectedId(created.id);
        setMatrizDialogOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  const onAddComponente = componenteForm.handleSubmit((payload) => {
    if (!selectedId) {
      return;
    }

    const disciplina = listaDisciplinas.find((item) => item.id === payload.disciplinaId);

    if (!disciplina) {
      toast.error("Disciplina não encontrada no catálogo.");
      return;
    }

    addComponente(
      {
        matrizCurricularId: selectedId,
        disciplinaId: disciplina.id,
        semestreIdeal: payload.semestreIdeal,
        tipo: disciplina.tipo,
        tipoEntrega: disciplina.tipoEntrega,
        chTotal: disciplina.chTotal,
        chPresencial: disciplina.chPresencial,
        chSincrona: disciplina.chSincrona,
        chAssincrona: disciplina.chAssincrona,
        chExtensao: disciplina.chExtensao,
      },
      {
        onSuccess: () => {
          toast.success("Componente adicionado à matriz.");
          invalidateMatrizes();
          setComponenteDialogOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <>
            {listaMatrizes.length > 0 ? (
              <div className="w-64">
                <AdminSelect
                  items={listaMatrizes.map((matriz) => ({
                    value: matriz.id,
                    label: `${matriz.nome} (${cursoNome(matriz.cursoId)})`,
                  }))}
                  onValueChange={setSelectedId}
                  value={selectedId}
                />
              </div>
            ) : null}
            <Button onClick={() => setMatrizDialogOpen(true)} size="sm" variant="outline">
              <PlusCircle />
              Nova matriz
            </Button>
            {selectedId ? (
              <Button
                disabled={isDeletingMatriz || isFetchingComponentes}
                onClick={() => {
                  if (isFetchingComponentes) {
                    return;
                  }

                  if (listaComponentes.length > 0) {
                    toast.error("Remova os componentes antes de excluir a matriz.");
                    return;
                  }

                  setPendingMatrizDelete(true);
                }}
                size="sm"
                variant="outline"
              >
                <Trash2 />
                Excluir matriz
              </Button>
            ) : null}
            <Button
              disabled={!selectedId}
              onClick={() => {
                componenteForm.reset({
                  disciplinaId: "",
                  semestreIdeal: 1,
                });
                setComponenteDialogOpen(true);
              }}
              size="sm"
            >
              <PlusCircle />
              Adicionar componente
            </Button>
          </>
        }
        description="Verificação formal da curricularização da extensão (Resolução CNE/CES nº 7/2018) e da multimodalidade (Decreto nº 12.456/2026)."
        eyebrow="Regulação e diretrizes curriculares nacionais (DCN / MEC)"
        title="Matrizes curriculares e auditoria MEC"
      />

      {!matrizAtual ? (
        <Card>
          <AdminEmptyState
            description="Crie uma matriz vinculada a um curso para iniciar a auditoria de extensão."
            icon={Layers}
            title="Nenhuma matriz cadastrada"
          />
        </Card>
      ) : null}

      {relatorio ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-foreground uppercase">
                  Relatório de auditoria MEC
                </span>
                {relatorio.conformeDecreto12456 ? (
                  <Badge variant="success">
                    <CheckCircle2 />
                    Conforme Decreto 12.456
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle />
                    Conflito regulatório
                  </Badge>
                )}
                {relatorio.cumpreRegra10PorcentoExtensao ? (
                  <Badge>
                    <CheckCircle2 />
                    Extensão ≥ {relatorio.percentualMinimoExtensao ?? 10}%
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle />
                    Extensão &lt; {relatorio.percentualMinimoExtensao ?? 10}%
                  </Badge>
                )}
              </div>
              <CardDescription>
                {relatorio.cursoNome}
                {relatorio.modalidadeCurso
                  ? ` · ${MODALIDADE_LABEL[relatorio.modalidadeCurso]}`
                  : ""}{" "}
                · {relatorio.campusNome} (Polo: {relatorio.codigoPolo})
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-bold tabular-nums text-primary">
                {formatPercent(relatorio.percentualExtensao)}
              </div>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Extensão curricular
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Limiar institucional: {relatorio.percentualMinimoExtensao ?? 10}%</span>
                <span className="font-mono">{formatPercent(relatorio.percentualExtensao)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    relatorio.cumpreRegra10PorcentoExtensao
                      ? "h-full bg-primary"
                      : "h-full bg-destructive"
                  }
                  style={{width: `${Math.min(relatorio.percentualExtensao, 100)}%`}}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">Carga horária geral</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chTotalGeral}h
                </span>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">CH extensão (tipo)</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {chExtensaoDaAuditoria(relatorio)}h
                </span>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">CH presencial</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chPresencialTotal}h
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({formatPercent(relatorio.percentualPresencial)})
                </span>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">CH síncrona</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chSincronaTotal}h
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({formatPercent(relatorio.percentualSincrono)})
                </span>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">CH assíncrona</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chAssincronaTotal}h
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({formatPercent(relatorio.percentualAssincrono)})
                </span>
              </div>
            </div>
            {relatorio.violacoes.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>Violações do Decreto nº 12.456/2026 e da extensão curricular</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {relatorio.violacoes.map((violacao) => (
                      <li key={`${violacao.codigo}-${violacao.disciplinaId ?? violacao.mensagem}`}>
                        {violacao.mensagem}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {matrizAtual && listaComponentes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Componentes Curriculares da Matriz ({listaComponentes.length} disciplinas
              mapeadas)
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              Vigência: {matrizAtual.anoVigencia}
            </span>
          </div>

          {componentesPorSemestre.map(([semestre, itens]) => {
            const chSemestre = itens.reduce((acc, item) => acc + item.chTotal, 0);
            const chExtSemestre = itens.reduce((acc, item) => acc + chExtensaoExibida(item), 0);

            return (
              <Card className="gap-0 py-0" key={semestre} size="sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{semestre}º Semestre Ideal</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] font-normal text-muted-foreground">
                    <span>
                      Carga Total: <strong className="text-foreground">{chSemestre}h</strong>
                    </span>
                    {chExtSemestre > 0 ? (
                      <span className="font-semibold text-success-foreground">
                        Extensão: {chExtSemestre}h
                      </span>
                    ) : null}
                  </div>
                </div>
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                        Código
                      </TableHead>
                      <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                        Disciplina
                      </TableHead>
                      <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                        Classificação Curricular
                      </TableHead>
                      <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                        Tipo Entrega
                      </TableHead>
                      <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                        CH Total
                      </TableHead>
                      <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                        CH Extensão
                      </TableHead>
                      <TableHead className="px-4 text-right text-[10px] font-medium tracking-wider uppercase">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item) => {
                      const chExt = chExtensaoExibida(item);

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="px-4 font-mono font-medium">
                            {item.disciplina.codigo}
                          </TableCell>
                          <TableCell className="px-4 font-medium whitespace-normal">
                            {item.disciplina.nome}
                          </TableCell>
                          <TableCell className="px-4">
                            <Badge
                              className="rounded font-mono text-[10px] font-medium"
                              variant={item.tipo === "EXTENSAO" ? "success" : "secondary"}
                            >
                              {item.tipo.replaceAll("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 text-muted-foreground">
                            {item.tipoEntrega.replaceAll("_", " ")}
                          </TableCell>
                          <TableCell className="px-4 text-center font-mono font-semibold">
                            {item.chTotal}h
                          </TableCell>
                          <TableCell className="px-4 text-center font-mono font-semibold text-success-foreground">
                            {chExt > 0 ? `${chExt}h` : "—"}
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <Button
                              aria-label={`Remover ${item.disciplina.nome}`}
                              disabled={isRemoving}
                              onClick={() => setPendingComponente(item)}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Trash2 />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            );
          })}
        </div>
      ) : null}

      {matrizAtual && listaComponentes.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Adicione disciplinas com carga horária e tipo de entrega para calcular a extensão."
            icon={Layers}
            title="Matriz sem componentes"
          />
        </Card>
      ) : null}

      <ConfirmDialog
        confirmLabel="Remover da matriz"
        description={
          pendingComponente
            ? `Desvincular ${pendingComponente.disciplina.codigo} — ${pendingComponente.disciplina.nome} desta matriz? A disciplina, as turmas e os alunos não são apagados. Se houver alunos enturmados, a exclusão será recusada.`
            : ""
        }
        isPending={isRemoving}
        onConfirm={() => {
          if (!pendingComponente) {
            return;
          }

          const componente = pendingComponente;

          removeComponente(componente.id, {
            onSuccess: () => {
              toast.success("Componente removido.");
              invalidateMatrizes();
              setPendingComponente(null);
            },
            onError: (error) => {
              setPendingComponente(null);

              if (isConflictError(error)) {
                setConflict({
                  entityName: `Componente ${componente.disciplina.codigo}`,
                  message: getMutationErrorMessage(error),
                  recommendedAction:
                    "Desenturme os alunos na turma desta disciplina antes de desvincular o componente da matriz.",
                });
                return;
              }

              toast.error(getMutationErrorMessage(error));
            },
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingComponente(null);
          }
        }}
        open={pendingComponente !== null}
        title="Remover componente da matriz?"
      />

      <ConfirmDialog
        confirmLabel="Excluir matriz"
        description={
          matrizAtual
            ? `Excluir ${matrizAtual.nome}? Só é permitida se a matriz estiver sem componentes e sem matrículas.`
            : ""
        }
        isPending={isDeletingMatriz}
        onConfirm={() => {
          if (!selectedId) {
            return;
          }

          const matrizId = selectedId;
          const remaining = listaMatrizes.filter((item) => item.id !== matrizId);

          removeMatriz(matrizId, {
            onSuccess: () => {
              toast.success("Matriz excluída.");
              setSelectedId(remaining[0]?.id ?? "");
              invalidateMatrizes();
              setPendingMatrizDelete(false);
            },
            onError: (error) => {
              setPendingMatrizDelete(false);

              if (isConflictError(error)) {
                const message = getMutationErrorMessage(error);
                setConflict({
                  entityName: matrizAtual?.nome ?? "Matriz",
                  message,
                  recommendedAction: message.includes("componentes")
                    ? "Remova todos os componentes da matriz antes de excluí-la."
                    : "Reatribua ou encerre as matrículas vinculadas a esta matriz antes de excluí-la.",
                });
                return;
              }

              toast.error(getMutationErrorMessage(error));
            },
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingMatrizDelete(false);
          }
        }}
        open={pendingMatrizDelete}
        title="Excluir matriz curricular?"
      />

      <ConflictDialog
        dependencyMessage={conflict?.message ?? ""}
        entityName={conflict?.entityName ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setConflict(null);
          }
        }}
        open={conflict !== null}
        recommendedAction={conflict?.recommendedAction ?? ""}
      />

      <Dialog onOpenChange={setMatrizDialogOpen} open={matrizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova matriz curricular</DialogTitle>
            <DialogDescription>Versionamento curricular por curso e ano de vigência.</DialogDescription>
          </DialogHeader>
          <Form {...matrizForm}>
            <form className="space-y-4" onSubmit={onCreateMatriz}>
              <FormField
                control={matrizForm.control}
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
                        onValueChange={field.onChange}
                        placeholder="Selecione o curso"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={matrizForm.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Matriz 2026.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={matrizForm.control}
                name="anoVigencia"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Ano de vigência</FormLabel>
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
              <DialogFooter>
                <Button onClick={() => setMatrizDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreatingMatriz} type="submit">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setComponenteDialogOpen} open={componenteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar componente</DialogTitle>
            <DialogDescription>
              Carga horária, tipo e entrega vêm do catálogo da disciplina. Informe só o semestre ideal nesta matriz.
            </DialogDescription>
          </DialogHeader>
          <Form {...componenteForm}>
            <form className="space-y-4" onSubmit={onAddComponente}>
              <FormField
                control={componenteForm.control}
                name="disciplinaId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Disciplina</FormLabel>
                    <FormControl>
                      <AdminCombobox
                        emptyText="Nenhuma disciplina disponível."
                        items={disciplinasDisponiveis.map((disciplina) => ({
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
                control={componenteForm.control}
                name="semestreIdeal"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Semestre ideal</FormLabel>
                    <FormControl>
                      <Input
                        max={16}
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
              <DialogFooter>
                <Button
                  onClick={() => setComponenteDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button disabled={isAddingComponente} type="submit">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
