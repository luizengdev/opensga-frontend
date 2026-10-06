"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {
  ArrowLeft,
  Calculator,
  Calendar,
  Clock,
  Edit3,
  GraduationCap,
  MapPin,
  Percent,
  Save,
  UserPlus,
  Lock,
} from "lucide-react";
import Link from "next/link";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminSelect} from "@/components/admin/admin-select";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {ConflictDialog} from "@/components/admin/conflict-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";
import {previewLancamento} from "@/lib/academic/lancamento-preview";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage, isConflictError} from "@/lib/admin/mutation-error";
import type {DiarioClasse, Matricula, Turma} from "@/lib/api/fetch-generated";
import {
  getGetDiariosQueryKey,
  useAvaliarDiario,
  useEnturmarAluno,
  useFecharSemestre,
  useGetDiarios,
  useGetTurma,
} from "@/lib/api/rc-generated";

const enturmarSchema = z.object({
  matriculaId: z.string().min(1),
});

const avaliacaoSchema = z.object({
  notaAv: z.string(),
  notaAvs: z.string(),
  notaAv3: z.string(),
  totalFaltas: z.number().int().min(0),
});

type EnturmarFormValues = z.infer<typeof enturmarSchema>;
type AvaliacaoFormValues = z.infer<typeof avaliacaoSchema>;

const parseNota = (value: string) => {
  if (value.trim().length === 0) {
    return undefined;
  }

  return Number(value.replace(",", "."));
};

const formatDiarioNota = (nota: number | null, accent = false) => {
  if (nota === null) {
    return <span className="italic text-muted-foreground">—</span>;
  }

  return (
    <span className={accent ? "font-medium text-primary" : "font-medium"}>
      {nota.toFixed(1)}
    </span>
  );
};

interface TurmaDetailViewProps {
  initialDiarios: DiarioClasse[];
  initialMatriculas: Matricula[];
  initialTurma: Turma;
  isAdmin: boolean;
}

export const TurmaDetailView = ({
  initialDiarios,
  initialMatriculas,
  initialTurma,
  isAdmin,
}: TurmaDetailViewProps) => {
  const queryClient = useQueryClient();
  const {data: turma} = useGetTurma(initialTurma.id, {initialData: initialTurma});
  const {data: diarios} = useGetDiarios({
    query: {turmaId: initialTurma.id},
    initialData: initialDiarios,
  });
  const {mutate: enturmar, isPending: isEnturmando} = useEnturmarAluno();
  const {mutate: avaliar, isPending: isAvaliando} = useAvaliarDiario();
  const {mutate: fechar, isPending: isFechando} = useFecharSemestre();
  const [enturmarOpen, setEnturmarOpen] = useState(false);
  const [avaliacaoOpen, setAvaliacaoOpen] = useState(false);
  const [diarioSelecionado, setDiarioSelecionado] = useState<DiarioClasse | null>(null);
  const [fechamentoConflict, setFechamentoConflict] = useState<string | null>(null);
  const [fecharConfirmOpen, setFecharConfirmOpen] = useState(false);

  const atual = turma ?? initialTurma;
  const listaDiarios = diarios ?? initialDiarios;
  const listaMatriculas = initialMatriculas;
  const emailPorMatricula = useMemo(
    () =>
      new Map(
        listaMatriculas.map((matricula) => [matricula.id, matricula.aluno.user.email] as const),
      ),
    [listaMatriculas],
  );
  const matriculasDisponiveis = listaMatriculas.filter(
    (matricula) =>
      matricula.status === "ATIVO" &&
      !listaDiarios.some((diario) => diario.matriculaId === matricula.id),
  );

  const enturmarForm = useForm<EnturmarFormValues>({
    resolver: zodResolver(enturmarSchema),
    defaultValues: {matriculaId: ""},
  });

  const avaliacaoForm = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {notaAv: "", notaAvs: "", notaAv3: "", totalFaltas: 0},
  });

  const chTurma = atual.chTotal ?? listaDiarios.find((diario) => diario.chTotal > 0)?.chTotal ?? 0;
  const limiteTurma = limiteFaltasDaDisciplina(chTurma);
  const notas = avaliacaoForm.watch();
  const chLancamento =
    diarioSelecionado && diarioSelecionado.chTotal > 0 ? diarioSelecionado.chTotal : chTurma;
  const limiteLancamento = limiteFaltasDaDisciplina(chLancamento);
  const preview = useMemo(
    () =>
      previewLancamento({
        notaAv: parseNota(notas.notaAv),
        notaAvs: parseNota(notas.notaAvs),
        notaAv3: parseNota(notas.notaAv3),
        totalFaltas: Number(notas.totalFaltas) || 0,
        chTotal: chLancamento,
      }),
    [chLancamento, notas],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetDiariosQueryKey({turmaId: atual.id}),
    });
  };

  const openAvaliacao = (diario: DiarioClasse) => {
    setDiarioSelecionado(diario);
    avaliacaoForm.reset({
      notaAv: diario.notaAv === null ? "" : String(diario.notaAv),
      notaAvs: diario.notaAvs === null ? "" : String(diario.notaAvs),
      notaAv3: diario.notaAv3 === null ? "" : String(diario.notaAv3),
      totalFaltas: diario.totalFaltas,
    });
    setAvaliacaoOpen(true);
  };

  const onEnturmar = enturmarForm.handleSubmit((payload) => {
    enturmar(
      {matriculaId: payload.matriculaId, turmaId: atual.id},
      {
        onSuccess: () => {
          toast.success("Aluno enturmado.");
          invalidate();
          setEnturmarOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const onAvaliar = avaliacaoForm.handleSubmit((payload) => {
    if (!diarioSelecionado) {
      return;
    }

    avaliar(
      {
        diarioClasseId: diarioSelecionado.id,
        notaAv: parseNota(payload.notaAv),
        notaAvs: parseNota(payload.notaAvs),
        ...(preview.habilitaAv3 ? {notaAv3: parseNota(payload.notaAv3)} : {}),
        totalFaltas: payload.totalFaltas,
      },
      {
        onSuccess: () => {
          toast.success("Lançamento salvo. Aprovação e CH entram só no fechamento.");
          invalidate();
          setAvaliacaoOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const semestreJaFechado = listaDiarios.length > 0 && listaDiarios.every((diario) => diario.semestreFechado);

  const onFecharSemestre = () => {
    fechar(
      {turmaId: atual.id},
      {
        onSuccess: (resultado) => {
          toast.success(`Semestre fechado: ${resultado.fechados} diários integralizados.`);
          invalidate();
          setFecharConfirmOpen(false);
        },
        onError: (error) => {
          setFecharConfirmOpen(false);

          if (isConflictError(error)) {
            setFechamentoConflict(getMutationErrorMessage(error));
            return;
          }

          toast.error(getMutationErrorMessage(error));
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Voltar para lista de turmas"
            nativeButton={false} render={<Link href="/area-admin/turmas" />}
            size="icon-sm"
            variant="outline"
          >
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Turma {atual.codigo}
              </span>
              <Badge variant="outline">{TIPO_ENTREGA_LABEL[atual.tipoEntrega]}</Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {atual.disciplina.nome}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isFechando || listaDiarios.length === 0 || semestreJaFechado}
            onClick={() => setFecharConfirmOpen(true)}
            size="sm"
            variant="outline"
          >
            <Lock />
            {semestreJaFechado ? "Semestre fechado" : "Fechar semestre"}
          </Button>
          {isAdmin ? (
            <Button onClick={() => setEnturmarOpen(true)} size="sm">
              <UserPlus />
              Enturmar Aluno
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <GraduationCap className="size-3.5 text-primary" />
              Professor Titular
            </span>
            <div className="mt-1 text-sm font-semibold">{atual.professor.user.nome}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {atual.professor.titulacao} · {atual.professor.matricula}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5 text-primary" />
              Horário Semestral
            </span>
            <div className="mt-1 font-mono text-xs font-semibold">{atual.horario}</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              Ano/Sem: {atual.anoLetivo}.{atual.semestreLetivo}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              Local / Sala / Link
            </span>
            <div className="mt-1 truncate text-xs font-medium">{atual.salaOuLink || "Sala padrão"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {chTurma > 0
                ? `Carga Horária: ${chTurma}h (Máx ${limiteTurma} faltas)`
                : "Carga horária da disciplina na matriz ainda não vinculada"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Percent className="size-3.5 text-primary" />
              Vagas Ofertadas
            </span>
            <div className="mt-1 font-mono text-sm font-bold tabular-nums">
              {listaDiarios.length} / {atual.capacidade} alunos
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {atual.capacidade - listaDiarios.length} vagas remanescentes
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius)] border border-border bg-muted/40 p-4 text-xs md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Calculator className="size-4 text-primary" />
            <span>Regulamento Geral de Avaliação e Integralização MEC</span>
          </div>
          <p className="text-muted-foreground">
            Lançamento calcula{" "}
            <strong className="font-mono text-foreground">NS = MAX(AV, AVS)</strong> e habilita AV3.
            Aprovação, RF, RN e CH cumprida só no{" "}
            <strong className="text-foreground">fechamento do semestre</strong>. RF se faltas &gt; 25%
            da CH da disciplina. AV3:{" "}
            <strong className="font-mono text-foreground">MF = (NS + AV3) / 2</strong> (corte 5,0).
          </p>
        </div>
        <span className="shrink-0 rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground">
          {chTurma > 0 ? `CH: ${chTurma}h · Limite faltas: ${limiteTurma}h` : "CH da matriz pendente"}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diário de Classe Eletrônico</CardTitle>
          <CardDescription>
            Lançamento e consolidação de AV, AVS, AV3 e cômputo de faltas.
          </CardDescription>
          <CardAction>
            <span className="font-mono text-xs text-muted-foreground">
              {listaDiarios.length} diários ativos
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          {listaDiarios.length === 0 ? (
            <AdminEmptyState
              description="Esta turma ainda não possui discentes vinculados ao diário eletrônico."
              icon={Calendar}
              title="Nenhum aluno enturmado"
            />
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-muted/30 text-[10px] font-medium tracking-wider uppercase">
                <TableRow>
                  <TableHead className="text-muted-foreground">RA</TableHead>
                  <TableHead className="text-muted-foreground">Aluno</TableHead>
                  <TableHead className="text-center text-muted-foreground">AV</TableHead>
                  <TableHead className="text-center text-muted-foreground">AVS</TableHead>
                  <TableHead className="text-center text-muted-foreground">AV3</TableHead>
                  <TableHead className="text-center text-muted-foreground">NS</TableHead>
                  <TableHead className="text-center text-muted-foreground">Faltas (CH)</TableHead>
                  <TableHead className="text-center text-muted-foreground">Média Final</TableHead>
                  <TableHead className="text-center text-muted-foreground">Resultado</TableHead>
                  <TableHead className="text-right text-muted-foreground">Lançamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaDiarios.map((diario) => {
                  const chDiario = diario.chTotal > 0 ? diario.chTotal : chTurma;
                  const limiteDiario = limiteFaltasDaDisciplina(chDiario);
                  const riscoRf =
                    diario.statusDisciplina === "EM_ABERTO" && chDiario > 0 && diario.totalFaltas > limiteDiario;
                  const email = emailPorMatricula.get(diario.matriculaId);

                  return (
                    <TableRow key={diario.id}>
                      <TableCell className="font-mono font-medium">{diario.aluno.ra}</TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="font-semibold">{diario.aluno.nome}</div>
                        {email ? (
                          <div className="font-mono text-[10px] text-muted-foreground">{email}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-center font-mono tabular-nums">
                        {formatDiarioNota(diario.notaAv)}
                      </TableCell>
                      <TableCell className="text-center font-mono tabular-nums">
                        {formatDiarioNota(diario.notaAvs)}
                      </TableCell>
                      <TableCell className="text-center font-mono tabular-nums">
                        {formatDiarioNota(diario.notaAv3, true)}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold tabular-nums">
                        {diario.notaSemestral === null ? "—" : diario.notaSemestral.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center font-mono tabular-nums">
                        <span
                          className={
                            riscoRf || diario.statusDisciplina === "RF"
                              ? "font-bold text-destructive"
                              : "text-foreground"
                          }
                        >
                          {diario.totalFaltas}h
                        </span>
                        <span className="text-[10px] text-muted-foreground"> / {limiteDiario}h</span>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold tabular-nums">
                        {diario.mediaFinal === null ? "—" : diario.mediaFinal.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {diario.statusDisciplina === "RF" ? (
                            <Badge variant="destructive">RF</Badge>
                          ) : diario.statusDisciplina === "APROVADO" ? (
                            <Badge variant="success">Aprovado</Badge>
                          ) : diario.statusDisciplina === "RN" ? (
                            <Badge variant="destructive">RN</Badge>
                          ) : diario.habilitaAv3 ? (
                            <Badge variant="warning">AV3</Badge>
                          ) : (
                            <Badge variant="outline">Em Aberto</Badge>
                          )}
                          {riscoRf ? <Badge variant="warning">Risco RF</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          disabled={diario.semestreFechado}
                          onClick={() => openAvaliacao(diario)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit3 className="text-primary" />
                          Lançar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setEnturmarOpen} open={enturmarOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enturmar Aluno na Disciplina</DialogTitle>
            <DialogDescription className="wrap-break-word">
              Vincular matrícula ativa da matriz curricular à turma {atual.codigo}
            </DialogDescription>
          </DialogHeader>
          <Form {...enturmarForm}>
            <form className="min-w-0 space-y-4" onSubmit={onEnturmar}>
              <FormField
                control={enturmarForm.control}
                name="matriculaId"
                render={({field}) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Selecione o Aluno (Matrícula Ativa)</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={matriculasDisponiveis.map((matricula) => ({
                          value: matricula.id,
                          label: `${matricula.aluno.ra} - ${matricula.aluno.user.nome} (${matricula.curso.nome})`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Selecione um aluno cadastrado..."
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                A enturmação criará automaticamente o diário eletrônico para cômputo de AV, AVS, AV3 e
                frequência.
              </p>
              <DialogFooter>
                <Button onClick={() => setEnturmarOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isEnturmando} type="submit">
                  Efetivar Enturmação
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setAvaliacaoOpen} open={avaliacaoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {diarioSelecionado
                ? `Lançamento Acadêmico: ${diarioSelecionado.aluno.nome}`
                : "Lançamento Acadêmico"}
            </DialogTitle>
            <DialogDescription>
              {diarioSelecionado
                ? `RA: ${diarioSelecionado.aluno.ra} · Turma: ${atual.codigo} · Carga: ${chLancamento}h`
                : "Avaliação"}
            </DialogDescription>
          </DialogHeader>
          <Form {...avaliacaoForm}>
            <form className="space-y-4" onSubmit={onAvaliar}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField
                  control={avaliacaoForm.control}
                  name="notaAv"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>AV (0 a 10)</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder="Ex: 8.5" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Avaliação regular</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={avaliacaoForm.control}
                  name="notaAvs"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>AVS (0 a 10)</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder="Ex: 7.0" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Substitutiva · NS = MAX(AV, AVS)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={avaliacaoForm.control}
                  name="notaAv3"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>AV3 (0 a 10)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!preview.habilitaAv3}
                          inputMode="decimal"
                          placeholder="Ex: 6.0"
                          step="0.1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {preview.habilitaAv3 ? "Recuperação final · NS < 6,0" : "Habilitada só se NS < 6,0"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={avaliacaoForm.control}
                  name="totalFaltas"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Total de Faltas (Horas)</FormLabel>
                      <FormControl>
                        <Input
                          max={chLancamento > 0 ? chLancamento : undefined}
                          min={0}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                          ref={field.ref}
                          type="number"
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {chLancamento > 0
                          ? `Limite legal: ${limiteLancamento}h (25% de ${chLancamento}h)`
                          : "Limite de 25% sobre a CH da disciplina na matriz"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-center rounded-[calc(var(--radius)-4px)] border border-border bg-muted/60 p-2.5 text-xs">
                  <span className="block text-[11px] font-semibold text-foreground">
                    Cálculo em Tempo Real:
                  </span>
                  <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-foreground">
                    <span>
                      NS: <strong>{preview.ns}</strong>
                    </span>
                    <span>
                      MF: <strong>{preview.mf}</strong>
                    </span>
                  </div>
                  <span className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {preview.status}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setAvaliacaoOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isAvaliando} type="submit">
                  <Save />
                  Consolidar Lançamento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        confirmLabel="Fechar semestre"
        description={`O fechamento da turma ${atual.codigo} integraliza a CH dos aprovados, aplica RF se as faltas ultrapassarem 25% da carga e calcula a AV3. Esta ação não pode ser desfeita.`}
        icon={Lock}
        isPending={isFechando}
        onConfirm={onFecharSemestre}
        onOpenChange={setFecharConfirmOpen}
        open={fecharConfirmOpen}
        title="Fechar semestre desta turma?"
      />

      <ConflictDialog
        confirmLabel="Entendido, continuar lançamento"
        dependencyMessage={fechamentoConflict ?? ""}
        entityName={`Turma ${atual.codigo}`}
        eyebrow="HTTP 409 Conflict · Fechamento atômico"
        onOpenChange={(open) => {
          if (!open) {
            setFechamentoConflict(null);
          }
        }}
        open={fechamentoConflict !== null}
        recommendedAction="Lance AV ou AVS para obter a NS e, se NS < 6,0 com frequência regular, informe a AV3. Nenhum diário é persistido até a turma estar completa."
        ruleLabel="POST /diario/fechar-semestre"
        title={`Fechamento bloqueado: turma ${atual.codigo}`}
      />
    </div>
  );
};
