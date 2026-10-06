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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {formatPercent} from "@/lib/admin/format";
import {TIPO_COMPONENTE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
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

const componenteSchema = z.object({
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
  chExtensao: z.number().int().min(0),
});

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

    const chBuckets =
      payload.tipoEntrega === "PRESENCIAL_FISICO"
        ? {chPresencial: payload.chTotal, chSincrona: 0, chAssincrona: 0}
        : payload.tipoEntrega === "SINCRONO_MEDIADO"
          ? {chPresencial: 0, chSincrona: payload.chTotal, chAssincrona: 0}
          : {chPresencial: 0, chSincrona: 0, chAssincrona: payload.chTotal};

    addComponente(
      {
        matrizCurricularId: selectedId,
        disciplinaId: payload.disciplinaId,
        semestreIdeal: payload.semestreIdeal,
        tipo: payload.tipo,
        tipoEntrega: payload.tipoEntrega,
        chTotal: payload.chTotal,
        chExtensao: payload.chExtensao,
        ...chBuckets,
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
              onClick={() => setComponenteDialogOpen(true)}
              size="sm"
            >
              <PlusCircle />
              Adicionar componente
            </Button>
          </>
        }
        description="Verificação da curricularização da extensão universitária (Resolução CNE/CES nº 7/2018)."
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
                {relatorio.cumpreRegra10PorcentoExtensao ? (
                  <Badge>
                    <CheckCircle2 />
                    Conforme MEC (≥ 10% extensão)
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle />
                    Não conforme (&lt; 10% extensão)
                  </Badge>
                )}
              </div>
              <CardDescription>
                {relatorio.cursoNome} · {relatorio.campusNome} (Polo: {relatorio.codigoPolo})
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
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">Carga horária geral</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chTotalGeral}h
                </span>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3">
                <span className="block text-[11px] text-muted-foreground">CH de extensão</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {relatorio.chExtensaoTotal}h
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
            </div>
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
                    {TIPO_ENTREGA_LABEL[item.tipoEntrega]} · CH {item.chTotal}h · Extensão{" "}
                    {item.chExtensao}h
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
              A soma das cargas deve respeitar a CH total do componente.
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
