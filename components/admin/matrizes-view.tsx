"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {AlertTriangle, CheckCircle2, Layers, PlusCircle, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
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
import {Separator} from "@/components/ui/separator";
import {chExtensaoDaAuditoria, splitCargaHoraria} from "@/lib/academic/carga-horaria";
import {formatPercent} from "@/lib/admin/format";
import {MODALIDADE_LABEL, TIPO_COMPONENTE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {
  AuditoriaMec,
  ComponenteCurricular,
  Curso,
  Disciplina,
  Matriz,
  TipoComponente,
  TipoEntrega,
} from "@/lib/api/fetch-generated";
import {
  getGetMatrizesQueryKey,
  useAddComponenteMatriz,
  useCreateMatriz,
  useDeleteComponente,
  useGetAuditoriaMec,
  useGetComponentesMatriz,
  useGetCursos,
  useGetDisciplinas,
  useGetMatrizes,
} from "@/lib/api/rc-generated";

const tiposComponente: TipoComponente[] = [
  "CORE_VIDA_CARREIRA",
  "ESPECIFICO",
  "ELETIVA_TRILHA",
  "EXTENSAO",
  "OPTATIVO",
];

const tiposEntrega: TipoEntrega[] = [
  "PRESENCIAL_FISICO",
  "SINCRONO_MEDIADO",
  "ASSINCRONO_DIGITAL",
];

const matrizSchema = z.object({
  cursoId: z.string().min(1),
  nome: z.string().min(3).max(100),
  anoVigencia: z.number().int().min(2020),
});

const componenteSchema = z
  .object({
    disciplinaId: z.string().min(1),
    semestreIdeal: z.number().int().min(1).max(16),
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

type MatrizFormValues = z.infer<typeof matrizSchema>;
type ComponenteFormValues = z.infer<typeof componenteSchema>;

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

  const {data: auditoria} = useGetAuditoriaMec(selectedId, {
    initialData: selectedId === initialMatrizes[0]?.id ? (initialAuditoria ?? undefined) : undefined,
  });
  const {data: componentes} = useGetComponentesMatriz(selectedId, {
    initialData:
      selectedId === initialMatrizes[0]?.id ? initialComponentes : undefined,
  });

  const {mutate: createMatriz, isPending: isCreatingMatriz} = useCreateMatriz();
  const {mutate: addComponente, isPending: isAddingComponente} = useAddComponenteMatriz();
  const {mutate: removeComponente, isPending: isRemoving} = useDeleteComponente();

  const listaComponentes = componentes ?? initialComponentes;
  const relatorio = auditoria ?? null;
  const matrizAtual = listaMatrizes.find((item) => item.id === selectedId);
  const modalidadeMatriz =
    listaCursos.find((curso) => curso.id === matrizAtual?.cursoId)?.modalidade ?? "PRESENCIAL";

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
      disciplinaId: listaDisciplinas[0]?.id ?? "",
      semestreIdeal: 1,
      tipo: "ESPECIFICO",
      tipoEntrega: "PRESENCIAL_FISICO",
      chTotal: 80,
      chPresencial: 80,
      chSincrona: 0,
      chAssincrona: 0,
      chExtensao: 0,
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

    addComponente(
      {
        matrizCurricularId: selectedId,
        disciplinaId: payload.disciplinaId,
        semestreIdeal: payload.semestreIdeal,
        tipo: payload.tipo,
        tipoEntrega: payload.tipoEntrega,
        chTotal: payload.chTotal,
        chPresencial: payload.chPresencial,
        chSincrona: payload.chSincrona,
        chAssincrona: payload.chAssincrona,
        chExtensao: payload.chExtensao,
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
            <Button
              disabled={!selectedId}
              onClick={() => {
                const chTotal = 80;
                const distribuicao = splitCargaHoraria(chTotal, modalidadeMatriz);
                componenteForm.reset({
                  disciplinaId: listaDisciplinas[0]?.id ?? "",
                  semestreIdeal: 1,
                  tipo: "ESPECIFICO",
                  tipoEntrega: "PRESENCIAL_FISICO",
                  chTotal,
                  ...distribuicao,
                  chExtensao: 0,
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
        description="Auditoria da Resolução CNE/CES nº 7/2018 (extensão ≥ 10%) e do Decreto nº 12.456/2026 (multimodalidade)."
        eyebrow="Regulação e diretrizes curriculares nacionais"
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
                    Extensão ≥ 10%
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle />
                    Extensão &lt; 10%
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
                <span>Limiar MEC: 10%</span>
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

      {componentesPorSemestre.map(([semestre, itens]) => (
        <Card key={semestre}>
          <CardHeader>
            <CardTitle>{semestre}º semestre ideal</CardTitle>
            <CardDescription>{itens.length} componente(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {itens.map((item) => (
              <div
                className="flex items-center justify-between gap-3 rounded-[calc(var(--radius)-4px)] border border-border p-3"
                key={item.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{item.disciplina.nome}</span>
                    <Badge variant="outline">{item.disciplina.codigo}</Badge>
                    <Badge variant="secondary">{TIPO_COMPONENTE_LABEL[item.tipo]}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {TIPO_ENTREGA_LABEL[item.tipoEntrega]} · CH {item.chTotal}h (P {item.chPresencial}h · S{" "}
                    {item.chSincrona}h · A {item.chAssincrona}h)
                  </p>
                </div>
                <Button
                  aria-label={`Remover ${item.disciplina.nome}`}
                  disabled={isRemoving}
                  onClick={() =>
                    removeComponente(item.id, {
                      onSuccess: () => {
                        toast.success("Componente removido.");
                        invalidateMatrizes();
                      },
                      onError: (error) => toast.error(getMutationErrorMessage(error)),
                    })
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {matrizAtual && listaComponentes.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Adicione disciplinas com carga horária e tipo de entrega para calcular a extensão."
            icon={Layers}
            title="Matriz sem componentes"
          />
        </Card>
      ) : null}

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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar componente</DialogTitle>
            <DialogDescription>
              CH total = presencial + síncrona + assíncrona. Os pisos seguem a modalidade {MODALIDADE_LABEL[modalidadeMatriz]}.
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
                      <AdminSelect
                        items={listaDisciplinas.map((disciplina) => ({
                          value: disciplina.id,
                          label: `${disciplina.codigo} · ${disciplina.nome}`,
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
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
                <FormField
                  control={componenteForm.control}
                  name="chTotal"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CH total</FormLabel>
                      <FormControl>
                        <Input
                          min={10}
                          onBlur={field.onBlur}
                          onChange={(event) => {
                            const chTotal = event.target.valueAsNumber;
                            field.onChange(chTotal);
                            if (!Number.isNaN(chTotal)) {
                              const distribuicao = splitCargaHoraria(chTotal, modalidadeMatriz);
                              componenteForm.setValue("chPresencial", distribuicao.chPresencial);
                              componenteForm.setValue("chSincrona", distribuicao.chSincrona);
                              componenteForm.setValue("chAssincrona", distribuicao.chAssincrona);
                            }
                          }}
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
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={componenteForm.control}
                  name="chPresencial"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CH presencial</FormLabel>
                      <FormControl>
                        <Input
                          min={0}
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
                  control={componenteForm.control}
                  name="chSincrona"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CH síncrona</FormLabel>
                      <FormControl>
                        <Input
                          min={0}
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
                  control={componenteForm.control}
                  name="chAssincrona"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CH assíncrona</FormLabel>
                      <FormControl>
                        <Input
                          min={0}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                          ref={field.ref}
                          type="number"
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">Soma = CH total</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={componenteForm.control}
                name="tipo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={tiposComponente.map((item) => ({
                          value: item,
                          label: TIPO_COMPONENTE_LABEL[item],
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
                control={componenteForm.control}
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
              <FormField
                control={componenteForm.control}
                name="chExtensao"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>CH extensão</FormLabel>
                    <FormControl>
                      <Input
                        min={0}
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
              <Separator />
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
