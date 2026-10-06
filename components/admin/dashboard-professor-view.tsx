"use client";

import {
  AlertCircle,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import type {DiarioClasse, ProfessorDashboard, Turma} from "@/lib/api/fetch-generated";
import {
  useGetDashboardProfessor,
  useGetDiarios,
  useGetTurmas,
} from "@/lib/api/rc-generated";

interface DashboardProfessorViewProps {
  initialDashboard: ProfessorDashboard;
  initialDiarios: DiarioClasse[];
  initialTurmas: Turma[];
  nome: string;
}

export const DashboardProfessorView = ({
  initialDashboard,
  initialDiarios,
  initialTurmas,
  nome,
}: DashboardProfessorViewProps) => {
  const periodo = {
    anoLetivo: initialDashboard.anoLetivo,
    semestreLetivo: initialDashboard.semestreLetivo,
  };

  const {data: dashboard} = useGetDashboardProfessor({
    query: periodo,
    initialData: initialDashboard,
  });
  const {data: turmas} = useGetTurmas({
    query: periodo,
    initialData: initialTurmas,
  });
  const {data: diarios} = useGetDiarios({initialData: initialDiarios});

  const painel = dashboard ?? initialDashboard;
  const minhasTurmas = turmas ?? initialTurmas;
  const idsTurmas = new Set(minhasTurmas.map((turma) => turma.id));
  const meusDiarios = (diarios ?? initialDiarios).filter((diario) => idsTurmas.has(diario.turmaId));
  const pendenciasNs = meusDiarios.filter((diario) => diario.notaSemestral === null).length;
  const pendenciasAv3 = meusDiarios.filter((diario) => diario.habilitaAv3 && diario.notaAv3 === null).length;
  const lancamentosPendentes = pendenciasNs + pendenciasAv3;
  const periodoLabel = formatPeriodoLetivo(periodo);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button nativeButton={false} render={<Link href="/area-admin/turmas" />} size="sm">
            <Calendar />
            Minhas turmas atribuídas ({minhasTurmas.length})
          </Button>
        }
        description={`Diários de classe, controle de frequência e lançamento de notas no período letivo ${periodoLabel}.`}
        eyebrow="Portal do corpo docente · espaço pedagógico"
        title={`Olá, ${nome}`}
      />

      <div className="space-y-2 rounded-[var(--radius)] border border-border bg-muted/50 p-4 text-xs text-foreground">
        <div className="flex items-center gap-2 font-semibold">
          <Calculator className="size-4 text-primary" />
          Regimento de avaliação e integralização (fórmula vigente)
        </div>
        <div className="grid grid-cols-1 gap-3 pt-1 text-muted-foreground md:grid-cols-3">
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-card p-2.5">
            <span className="mb-0.5 block font-semibold text-foreground">Nota semestral (NS)</span>
            <code className="font-mono text-[11px] font-semibold text-primary">
              NS = MAX(AV, AVS)
            </code>
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-card p-2.5">
            <span className="mb-0.5 block font-semibold text-foreground">Aprovação direta</span>
            NS ≥ 6,0 e frequência ≥ 75% (faltas ≤ 25% da CH)
          </div>
          <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-card p-2.5">
            <span className="mb-0.5 block font-semibold text-foreground">AV3</span>
            Se NS &lt; 6,0:{" "}
            <code className="font-mono font-semibold text-primary">MF = (NS + AV3) / 2</code>{" "}
            (aprovado se MF ≥ 5,0)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <span className="text-xs font-medium text-muted-foreground">Turmas sob minha regência</span>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {painel.turmas.length}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Período letivo {periodoLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <span className="text-xs font-medium text-muted-foreground">Alunos atendidos (diários)</span>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {meusDiarios.length}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Matrículas regulares vinculadas</p>
          </CardContent>
        </Card>
        <Card className={lancamentosPendentes > 0 ? "border-warning/40 bg-warning/5" : undefined}>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Lançamentos pendentes</span>
              {lancamentosPendentes > 0 ? (
                <AlertCircle className="size-4 text-warning" />
              ) : (
                <CheckCircle2 className="size-4 text-success" />
              )}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {lancamentosPendentes}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {pendenciasNs} sem NS · {pendenciasAv3} aguardando AV3
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas turmas e diários de classe</CardTitle>
          <CardDescription>
            Acesse o diário para lançar AV, AVS, AV3 e registrar o total de faltas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {minhasTurmas.length === 0 ? (
            <AdminEmptyState
              description="Não há turmas atribuídas a você neste período letivo."
              icon={BookOpen}
              title="Nenhuma turma no período"
            />
          ) : (
            <div className="divide-y divide-border">
              {minhasTurmas.map((turma) => {
                const turmaDiarios = meusDiarios.filter((diario) => diario.turmaId === turma.id);
                const semNotas = turmaDiarios.filter(
                  (diario) => diario.notaSemestral === null,
                ).length;

                return (
                  <div
                    className="flex flex-col justify-between gap-4 py-4 md:flex-row md:items-center"
                    key={turma.id}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{turma.codigo}</span>
                        <Badge variant="outline">{TIPO_ENTREGA_LABEL[turma.tipoEntrega]}</Badge>
                        {semNotas > 0 ? (
                          <Badge variant="warning">{semNotas} notas pendentes</Badge>
                        ) : null}
                      </div>
                      <h3 className="text-sm font-medium text-foreground">{turma.disciplina.nome}</h3>
                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span>Horário: {turma.horario}</span>
                        <span>·</span>
                        <span>Local: {turma.salaOuLink || "A definir"}</span>
                        <span>·</span>
                        <span>
                          Inscritos: {turma.quantidadeDiarios ?? turmaDiarios.length}/
                          {turma.capacidade}
                        </span>
                      </div>
                    </div>
                    <Button nativeButton={false} render={<Link href={`/area-admin/turmas/${turma.id}`} />} size="sm">
                      <FileSpreadsheet />
                      Abrir diário e lançar notas
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
