"use client";

import {
  ArrowRight,
  FileCheck2,
  Layers,
  MessageSquareWarning,
  Percent,
  PlusCircle,
  Receipt,
  Users,
} from "lucide-react";
import Link from "next/link";

import {AcademicChartsSection} from "@/components/admin/academic-charts-section";
import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {ComunicadosResumoCard} from "@/components/admin/comunicados-resumo-card";
import {StatusFaturaBadge} from "@/components/admin/status-fatura-badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {buildOfertaPorCurso} from "@/lib/admin/academic-charts";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {STATUS_MATRICULA_LABEL} from "@/lib/admin/labels";
import type {
  AdminDashboard,
  AuditoriaMec,
  Campus,
  Comunicado,
  Fatura,
  StatusMatricula,
  Turma,
} from "@/lib/api/fetch-generated";
import {
  useGetCampi,
  useGetComunicados,
  useGetDashboardAdmin,
  useGetFaturas,
  useGetTurmas,
} from "@/lib/api/rc-generated";

const CICLO_STATUS = [
  "ATIVO",
  "PRE_MATRICULADO",
  "TRANCADO",
  "CANCELADO",
  "FORMADO",
  "EVADIDO",
  "TRANSFERIDO",
] as const;

const CICLO_DOT: Record<(typeof CICLO_STATUS)[number], string> = {
  ATIVO: "bg-success",
  PRE_MATRICULADO: "bg-info",
  TRANCADO: "bg-warning",
  CANCELADO: "bg-destructive",
  FORMADO: "bg-primary",
  EVADIDO: "bg-muted-foreground",
  TRANSFERIDO: "bg-chart-2",
};

interface DashboardAdminViewProps {
  initialAuditorias: AuditoriaMec[];
  initialCampi: Campus[];
  initialComunicados: Comunicado[];
  initialDashboard: AdminDashboard;
  initialFaturas: Fatura[];
  initialTurmas: Turma[];
}

export const DashboardAdminView = ({
  initialAuditorias,
  initialCampi,
  initialComunicados,
  initialDashboard,
  initialFaturas,
  initialTurmas,
}: DashboardAdminViewProps) => {
  const periodo = {
    anoLetivo: initialDashboard.anoLetivo,
    semestreLetivo: initialDashboard.semestreLetivo,
  };

  const {data: dashboard} = useGetDashboardAdmin({
    query: periodo,
    initialData: initialDashboard,
  });
  const {data: turmas} = useGetTurmas({
    query: periodo,
    initialData: initialTurmas,
  });
  const {data: faturas} = useGetFaturas({initialData: initialFaturas});
  const {data: comunicados} = useGetComunicados({
    query: {publicoAlvo: "ADMIN"},
    initialData: initialComunicados,
  });
  const {data: campi} = useGetCampi({initialData: initialCampi});

  const painel = dashboard ?? initialDashboard;
  const turmasPeriodo = turmas ?? initialTurmas ?? [];
  const listaFaturas = faturas ?? initialFaturas ?? [];
  const listaComunicados = comunicados ?? initialComunicados ?? [];
  const listaCampi = campi ?? initialCampi ?? [];

  const quantidadePorStatus = (status: StatusMatricula) => {
    return (
      painel.matriculasPorStatus.find((item) => item.status === status)?.quantidade ?? 0
    );
  };

  const totalMatriculas = painel.matriculasPorStatus.reduce(
    (acc, item) => acc + item.quantidade,
    0,
  );
  const ativasCount = quantidadePorStatus("ATIVO");
  const preMatriculadasCount = quantidadePorStatus("PRE_MATRICULADO");
  const vagasOcupadas = turmasPeriodo.reduce(
    (acc, turma) => acc + (turma.quantidadeDiarios ?? 0),
    0,
  );
  const vagasTotais = turmasPeriodo.reduce((acc, turma) => acc + turma.capacidade, 0);
  const valorPendente = listaFaturas
    .filter((fatura) => fatura.status === "PENDENTE" || fatura.status === "ATRASADA")
    .reduce((acc, fatura) => acc + fatura.valor, 0);

  const periodoLabel = formatPeriodoLetivo(periodo);
  const ofertaPorCurso = buildOfertaPorCurso(turmasPeriodo, listaCampi);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <>
            <Button nativeButton={false} render={<Link href="/area-admin/matriculas" />} size="sm" variant="outline">
              <FileCheck2 />
              Nova matrícula
            </Button>
            <Button nativeButton={false} render={<Link href="/area-admin/turmas" />} size="sm">
              <PlusCircle />
              Ofertar turma
            </Button>
          </>
        }
        description="Monitoramento de matrículas, enturmações, conformidade curricular MEC e fluxos financeiros."
        eyebrow="Painel executivo e regulatório"
        title={`Secretaria acadêmica e gestão ${periodoLabel}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Matrículas totais</span>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {totalMatriculas}
                </div>
              </div>
              <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>
                <strong className="font-mono tabular-nums text-foreground">{ativasCount}</strong> ativas
              </span>
              <span>
                <strong className="font-mono tabular-nums text-info">{preMatriculadasCount}</strong> pré-matr.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Ocupação média</span>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {painel.ocupacaoMedia.toFixed(1)}%
                </div>
              </div>
              <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-success/10 text-success">
                <Percent className="size-4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>
                <strong className="font-mono tabular-nums text-foreground">
                  {painel.turmasNoPeriodo}
                </strong>{" "}
                turmas
              </span>
              <span className="font-mono tabular-nums">
                {vagasOcupadas}/{vagasTotais} vagas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Faturas a receber</span>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {painel.faturasPendentes}
                </div>
              </div>
              <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-warning/10 text-warning">
                <Receipt className="size-4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Volume em aberto</span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {formatCurrencyBrl(valorPendente)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Ouvidoria aberta</span>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {painel.reclamacoesAbertas}
                </div>
              </div>
              <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-info/10 text-info">
                <MessageSquareWarning className="size-4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Chamados da comunidade</span>
              <Button
                className="h-auto p-0 text-xs"
                nativeButton={false} render={<Link href="/area-admin/ouvidoria" />}
                variant="link"
              >
                Responder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AcademicChartsSection
        anoLetivo={painel.anoLetivo}
        auditorias={initialAuditorias}
        campi={listaCampi}
        faturas={listaFaturas}
        matriculasPorStatus={painel.matriculasPorStatus}
        semestreLetivo={painel.semestreLetivo}
        turmas={turmasPeriodo}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Ciclo de matrículas</CardTitle>
            <CardDescription>
              Distribuição dos registros discentes no período letivo {periodoLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            {CICLO_STATUS.map((status) => {
              const count = quantidadePorStatus(status);
              const percent =
                totalMatriculas > 0 ? Math.round((count / totalMatriculas) * 100) : 0;

              return (
                <div
                  className="flex items-center justify-between rounded-[calc(var(--radius)-4px)] bg-muted/40 p-2.5"
                  key={status}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`size-2 rounded-full ${CICLO_DOT[status]}`} />
                    <span className="text-xs font-medium text-foreground">
                      {STATUS_MATRICULA_LABEL[status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold tabular-nums">
                      {count}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Auditoria de vagas</span>
              <Button
                className="h-7 gap-1 px-2 text-xs"
                nativeButton={false} render={<Link href="/area-admin/matriculas" />}
                size="sm"
                variant="ghost"
              >
                Ver todos os RAs
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Oferta ativa por curso ({periodoLabel})</CardTitle>
              <CardDescription>
                Quantidade de turmas e ocupação das vagas, agrupadas por curso.
              </CardDescription>
            </div>
            <Button nativeButton={false} render={<Link href="/area-admin/turmas" />} size="sm" variant="outline">
              Ver turmas
            </Button>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            {ofertaPorCurso.length === 0 ? (
              <AdminEmptyState
                description="Não há turmas ofertadas neste período letivo."
                icon={Layers}
                title="Nenhuma oferta no semestre"
              />
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {ofertaPorCurso.map((curso) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[calc(var(--radius)-4px)] bg-muted/40 p-2.5"
                    key={curso.cursoId}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-xs font-medium text-foreground">{curso.nome}</p>
                        <p className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                          {curso.quantidadeTurmas}{" "}
                          <span className="font-sans text-[10px] font-normal text-muted-foreground">
                            {curso.quantidadeTurmas === 1 ? "turma" : "turmas"}
                          </span>
                        </p>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{width: `${Math.min(curso.percentual, 100)}%`}}
                        />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                        <span className="truncate">{curso.campusNome}</span>
                        <span className="shrink-0 tabular-nums">
                          {curso.inscritos}/{curso.capacidade} · {curso.percentual}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-auto flex items-center justify-between rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="size-4 text-primary" />
                Auditoria regulamentar MEC: Resolução CNE/CES nº 7/2018 (extensão mínima institucional)
              </div>
              <Button nativeButton={false} render={<Link href="/area-admin/matrizes" />} size="sm" variant="outline">
                Consultar matrizes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComunicadosResumoCard
          actionLabel="Gerenciar"
          comunicados={listaComunicados}
          description="Avisos vigentes expedidos à secretaria"
          emptyText="Nenhum comunicado vigente destinado ao perfil administrador."
          href="/area-admin/comunicados"
          title="Comunicados oficiais"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Faturas e conciliação</CardTitle>
              <CardDescription>Cobranças recentes no gateway Stripe</CardDescription>
            </div>
            <Button
              className="text-xs"
              nativeButton={false} render={<Link href="/area-admin/financeiro/faturas" />}
              size="sm"
              variant="ghost"
            >
              Ver faturas
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {listaFaturas.slice(0, 3).map((fatura) => (
              <div
                className="flex items-center justify-between rounded-[calc(var(--radius)-4px)] border border-border p-2.5 text-xs"
                key={fatura.id}
              >
                <div>
                  <div className="font-medium text-foreground">{fatura.aluno.user.nome}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    RA: {fatura.aluno.ra} · Venc: {formatDateBr(fatura.dataVencimento)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrencyBrl(fatura.valor)}
                  </span>
                  <StatusFaturaBadge status={fatura.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
