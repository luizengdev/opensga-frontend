"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  MapPin,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {DiarioClasse, Matricula, Turma} from "@/lib/api/fetch-generated";
import {
  getGetDiariosQueryKey,
  useAvaliarDiario,
  useDeleteDiario,
  useEnturmarAluno,
  useGetDiarios,
  useGetTurma,
} from "@/lib/api/rc-generated";

const enturmarSchema = z.object({
  matriculaId: z.string().min(1),
});

const avaliacaoSchema = z.object({
  notaA1: z.string(),
  notaA2: z.string(),
  notaAF: z.string(),
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
  const {mutate: removerDiario, isPending: isRemovendo} = useDeleteDiario();
  const [enturmarOpen, setEnturmarOpen] = useState(false);
  const [avaliacaoOpen, setAvaliacaoOpen] = useState(false);
  const [diarioSelecionado, setDiarioSelecionado] = useState<DiarioClasse | null>(null);

  const atual = turma ?? initialTurma;
  const listaDiarios = diarios ?? initialDiarios;
  const listaMatriculas = initialMatriculas;
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
    defaultValues: {notaA1: "", notaA2: "", notaAF: "", totalFaltas: 0},
  });

  const notas = avaliacaoForm.watch();
  const preview = useMemo(() => {
    const a1 = parseNota(notas.notaA1);
    const a2 = parseNota(notas.notaA2);
    const af = parseNota(notas.notaAF);
    const faltas = Number(notas.totalFaltas) || 0;

    if (a1 === undefined || a2 === undefined || Number.isNaN(a1) || Number.isNaN(a2)) {
      return {ms: "—", mf: "—", status: "Lançamentos parciais"};
    }

    const ms = a1 * 0.4 + a2 * 0.6;

    if (faltas > 20) {
      return {
        ms: ms.toFixed(1),
        mf: "—",
        status: "Reprovado por frequência (faltas > 25%)",
      };
    }

    if (ms >= 6) {
      return {
        ms: ms.toFixed(1),
        mf: ms.toFixed(1),
        status: "Aprovado direto por média semestral (MS ≥ 6,0)",
      };
    }

    if (af === undefined || Number.isNaN(af)) {
      return {
        ms: ms.toFixed(1),
        mf: "Aguardando AF",
        status: "Elegível para avaliação final (MS < 6,0)",
      };
    }

    const mf = (ms + af) / 2;
    return {
      ms: ms.toFixed(1),
      mf: mf.toFixed(1),
      status:
        mf >= 5
          ? "Aprovado após exame final (MF ≥ 5,0)"
          : "Reprovado em exame final (MF < 5,0)",
    };
  }, [notas]);

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetDiariosQueryKey({turmaId: atual.id}),
    });
  };

  const openAvaliacao = (diario: DiarioClasse) => {
    setDiarioSelecionado(diario);
    avaliacaoForm.reset({
      notaA1: diario.notaA1 === null ? "" : String(diario.notaA1),
      notaA2: diario.notaA2 === null ? "" : String(diario.notaA2),
      notaAF: diario.notaAF === null ? "" : String(diario.notaAF),
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
        notaA1: parseNota(payload.notaA1),
        notaA2: parseNota(payload.notaA2),
        notaAF: parseNota(payload.notaAF),
        totalFaltas: payload.totalFaltas,
      },
      {
        onSuccess: () => {
          toast.success("Notas lançadas.");
          invalidate();
          setAvaliacaoOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

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
        {isAdmin ? (
          <Button onClick={() => setEnturmarOpen(true)} size="sm">
            <UserPlus />
            Enturmar aluno
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <GraduationCap className="size-3.5 text-primary" />
              Professor titular
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
              Horário semestral
            </span>
            <div className="mt-1 font-mono text-xs font-semibold">{atual.horario}</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {atual.anoLetivo}.{atual.semestreLetivo}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              Local
            </span>
            <div className="mt-1 text-sm font-semibold">{atual.salaOuLink || "A definir"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              Ocupação
            </span>
            <div className="mt-1 font-mono text-sm font-semibold tabular-nums">
              {listaDiarios.length}/{atual.capacidade}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diário de classe</CardTitle>
          <CardDescription>
            Lançamento de A1, A2, AF e faltas. MS = (A1 × 0,4) + (A2 × 0,6).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listaDiarios.length === 0 ? (
            <AdminEmptyState
              description="Enturme matrículas ativas para iniciar o diário eletrônico."
              icon={Users}
              title="Nenhum aluno enturmado"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RA</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>A1</TableHead>
                  <TableHead>A2</TableHead>
                  <TableHead>AF</TableHead>
                  <TableHead>Final</TableHead>
                  <TableHead>Faltas</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaDiarios.map((diario) => (
                  <TableRow key={diario.id}>
                    <TableCell className="font-mono">{diario.aluno.ra}</TableCell>
                    <TableCell>{diario.aluno.nome}</TableCell>
                    <TableCell className="font-mono">{diario.notaA1 ?? "—"}</TableCell>
                    <TableCell className="font-mono">{diario.notaA2 ?? "—"}</TableCell>
                    <TableCell className="font-mono">{diario.notaAF ?? "—"}</TableCell>
                    <TableCell className="font-mono">{diario.notaFinal ?? "—"}</TableCell>
                    <TableCell className="font-mono">{diario.totalFaltas}</TableCell>
                    <TableCell>
                      {diario.aprovado === null ? (
                        <Badge variant="outline">Em avaliação</Badge>
                      ) : diario.aprovado ? (
                        <Badge>Aprovado</Badge>
                      ) : (
                        <Badge variant="destructive">Reprovado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Lançar notas de ${diario.aluno.nome}`}
                        onClick={() => openAvaliacao(diario)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil />
                      </Button>
                      {isAdmin ? (
                        <Button
                          aria-label={`Remover ${diario.aluno.nome} do diário`}
                          disabled={isRemovendo}
                          onClick={() =>
                            removerDiario(diario.id, {
                              onSuccess: () => {
                                toast.success("Aluno removido do diário.");
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
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setEnturmarOpen} open={enturmarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enturmar aluno</DialogTitle>
            <DialogDescription>Vincule uma matrícula ativa a esta turma.</DialogDescription>
          </DialogHeader>
          <Form {...enturmarForm}>
            <form className="space-y-4" onSubmit={onEnturmar}>
              <FormField
                control={enturmarForm.control}
                name="matriculaId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={matriculasDisponiveis.map((matricula) => ({
                          value: matricula.id,
                          label: `${matricula.aluno.ra} · ${matricula.aluno.user.nome}`,
                        }))}
                        onValueChange={field.onChange}
                        placeholder="Selecione o RA"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setEnturmarOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isEnturmando} type="submit">
                  Enturmar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setAvaliacaoOpen} open={avaliacaoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lançar notas</DialogTitle>
            <DialogDescription>
              {diarioSelecionado
                ? `${diarioSelecionado.aluno.ra} · ${diarioSelecionado.aluno.nome}`
                : "Avaliação"}
            </DialogDescription>
          </DialogHeader>
          <Form {...avaliacaoForm}>
            <form className="space-y-4" onSubmit={onAvaliar}>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={avaliacaoForm.control}
                  name="notaA1"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>A1</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder="0-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={avaliacaoForm.control}
                  name="notaA2"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>A2</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder="0-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={avaliacaoForm.control}
                  name="notaAF"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>AF</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder="0-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={avaliacaoForm.control}
                name="totalFaltas"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Total de faltas</FormLabel>
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
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3 text-xs">
                <p>
                  MS: <span className="font-mono font-semibold">{preview.ms}</span> · MF:{" "}
                  <span className="font-mono font-semibold">{preview.mf}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{preview.status}</p>
              </div>
              <DialogFooter>
                <Button onClick={() => setAvaliacaoOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isAvaliando} type="submit">
                  Salvar lançamento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
