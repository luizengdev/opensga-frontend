"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {DashboardMensalidadeCard} from "@/components/aluno/dashboard-mensalidade-card";
import {Button} from "@/components/ui/button";
import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {
  frequenciaPercentual,
  isRiscoRf,
  notaSemestralVisivel,
} from "@/lib/aluno/disciplina";
import {firstName, resumoTexto} from "@/lib/aluno/labels";
import {withAlunoQuery} from "@/lib/aluno/nav";
import {formatDateBr} from "@/lib/admin/format";
import {MODALIDADE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {useGetPortalContexto} from "@/lib/api/rc-generated";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface DashboardViewProps {
  initialData: PortalContexto;
}

export const DashboardView = ({initialData}: DashboardViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alunoId = searchParams.get("alunoId") ?? initialData.alunoId ?? undefined;
  const {data} = useGetPortalContexto({
    alunoId,
    query: {initialData},
  });
  const contexto = data ?? initialData;
  const {profile, matricula, disciplinas, faturas, comunicados} = contexto;
  const isResponsavel = profile.role === "RESPONSAVEL";
  const href = (path: string) => withAlunoQuery(path, alunoId);

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description={
            isResponsavel
              ? "Selecione um dependente na barra lateral para acompanhar o semestre."
              : "Quando a secretaria concluir sua matrícula, o semestre aparece aqui."
          }
          eyebrow="PORTAL DO ALUNO"
          title={isResponsavel ? "Painel de acompanhamento familiar" : `Olá, ${firstName(profile.nome)}`}
        />
        <AlunoEmptyState
          description="Ainda não há vínculo acadêmico disponível para este perfil."
          icon={Sparkles}
          title="Sem matrícula para exibir"
        />
      </div>
    );
  }

  const faturaAberta = faturas.find((fatura) => fatura.status === "PENDENTE" || fatura.status === "ATRASADA");
  const disciplinaRiscoFalta = disciplinas.find((disciplina) =>
    isRiscoRf({totalFaltas: disciplina.totalFaltas, chTotal: disciplina.chTotal}),
  );
  const disciplinaAv3 = disciplinas.find((disciplina) => disciplina.habilitaAv3);
  const proximaDisciplina = disciplinas[0];
  const isFirstAccess =
    matricula.status === "PRE_MATRICULADO" ||
    (matricula.periodoAtual === 1 && disciplinas.every((disciplina) => disciplina.notaSemestral === null));
  const periodoLabel = disciplinas[0]
    ? formatPeriodoLetivo({
        anoLetivo: disciplinas[0].anoLetivo,
        semestreLetivo: disciplinas[0].semestreLetivo,
      })
    : `${matricula.periodoAtual}º período`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {isFirstAccess ? (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-primary bg-primary p-5 text-primary-foreground shadow-xs sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-warning" />
              <span className="font-mono text-xs font-semibold tracking-wider text-primary-foreground/80 uppercase">
                Primeiro acesso ao OpenSGA
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold">
              Boas-vindas à sua jornada universitária, {firstName(profile.nome)}!
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-primary-foreground/80">
              Aqui você acompanha progresso, faltas em tempo real, comprovante de matrícula e mensalidades sem
              burocracia.
            </p>
          </div>
          <Button
            className="shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            nativeButton={false}
            render={<Link href={href("/area-aluno/matricula")} />}
          >
            Ver detalhes da matrícula
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : null}

      <AlunoPageHeader
        actions={
          isResponsavel && profile.dependentes.length > 1 ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-1.5">
              <Users className="ml-1 size-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Dependente:</span>
              {profile.dependentes.map((dependente) => (
                <Button
                  className={`h-auto px-3 py-1 text-xs ${
                    alunoId === dependente.id
                      ? "border border-border bg-card font-bold text-foreground shadow-xs"
                      : "font-medium text-muted-foreground"
                  }`}
                  key={dependente.id}
                  onClick={() => router.push(`/area-aluno/dashboard?alunoId=${dependente.id}`)}
                  size="sm"
                  variant="ghost"
                >
                  {firstName(dependente.nome)}
                </Button>
              ))}
            </div>
          ) : null
        }
        description={
          isResponsavel
            ? `Acompanhando ${profile.dependentes.find((dependente) => dependente.id === alunoId)?.nome ?? matricula.ra} em ${matricula.curso.nome}.`
            : `Você está com ${disciplinas.length} disciplinas em andamento neste semestre.`
        }
        eyebrow={`SEMESTRE LETIVO ${matricula.periodoAtual} · RA ${matricula.ra} · ${MODALIDADE_LABEL[matricula.curso.modalidade]}`}
        title={isResponsavel ? "Painel de acompanhamento familiar" : `Olá, ${firstName(profile.nome)}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Situação do período</span>
            <AlunoStatusBadge kind="matricula" status={matricula.status} />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-foreground">{matricula.curso.nome}</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Polo {matricula.curso.campus.nome} ({matricula.curso.campus.codigoPolo})
            </p>
          </div>
          <Button className="h-auto justify-start p-0 text-xs font-semibold" nativeButton={false} render={<Link href={href("/area-aluno/matricula")} />} variant="link">
            Comprovante de matrícula
            <ArrowRight className="size-3" />
          </Button>
        </div>

        <div
          className={`flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs ${
            disciplinaRiscoFalta ? "border-l-4 border-l-destructive" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Assiduidade</span>
            {disciplinaRiscoFalta ? (
              <span className="flex items-center gap-1 rounded border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                <AlertTriangle className="size-3.5" /> Limite próximo
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded border border-success/25 bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success-foreground">
                <CheckCircle2 className="size-3.5" /> Regular
              </span>
            )}
          </div>
          <div>
            {disciplinaRiscoFalta ? (
              <>
                <p className="font-heading text-base font-bold text-foreground">{disciplinaRiscoFalta.nomeDisciplina}</p>
                <p className="mt-0.5 text-xs font-semibold text-destructive">
                  {disciplinaRiscoFalta.totalFaltas} faltas (limite{" "}
                  {limiteFaltasDaDisciplina(disciplinaRiscoFalta.chTotal)}h)
                </p>
              </>
            ) : (
              <>
                <p className="font-heading text-base font-bold text-foreground">Frequência protegida</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Nenhuma disciplina no limiar de 25% da CH.
                </p>
              </>
            )}
          </div>
          <Button
            className={`h-auto justify-start p-0 text-xs font-semibold ${disciplinaRiscoFalta ? "text-destructive" : ""}`}
            nativeButton={false}
            render={<Link href={href("/area-aluno/notas")} />}
            variant="link"
          >
            Ver faltas detalhadas
            <ArrowRight className="size-3" />
          </Button>
        </div>

        <DashboardMensalidadeCard faturaAberta={faturaAberta} historicoHref={href("/area-aluno/faturas")} />

        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Status de provas</span>
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              {disciplinas.some((disciplina) => disciplina.semestreFechado) ? "Semestre fechado" : "Semestre aberto"}
            </span>
          </div>
          <div>
            {disciplinaAv3 ? (
              <>
                <p className="font-heading text-base font-bold text-warning-foreground">AV3 disponível</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {disciplinaAv3.nomeDisciplina} (NS: {notaSemestralVisivel(disciplinaAv3)?.toFixed(1) ?? "—"})
                </p>
              </>
            ) : (
              <>
                <p className="font-heading text-base font-bold text-foreground">Ciclo AV em andamento</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  NS = MAX(AV, AVS). Resultado oficial só no fechamento.
                </p>
              </>
            )}
          </div>
          <Button className="h-auto justify-start p-0 text-xs font-semibold" nativeButton={false} render={<Link href={href("/area-aluno/notas")} />} variant="link">
            Consultar boletim
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>

      {proximaDisciplina ? (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-primary bg-primary p-5 text-primary-foreground shadow-xs sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-success" />
              <span className="font-mono text-xs font-bold tracking-wider text-primary-foreground/80 uppercase">
                Próximo encontro acadêmico
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold">{proximaDisciplina.nomeDisciplina}</h3>
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs font-medium text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {proximaDisciplina.horario}
              </span>
              {proximaDisciplina.salaOuLink ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {proximaDisciplina.salaOuLink}
                  </span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{proximaDisciplina.professorNome}</span>
            </div>
          </div>
          <Button
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            nativeButton={false}
            render={<Link href={href("/area-aluno/notas")} />}
          >
            Ver diário de aula
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Minhas disciplinas em {periodoLabel}
            </h2>
            <p className="text-xs font-medium text-muted-foreground">
              Presença, carga horária e notas do semestre corrente.
            </p>
          </div>
          <Button className="h-auto p-0 text-xs font-bold" nativeButton={false} render={<Link href={href("/area-aluno/notas")} />} variant="link">
            Boletim completo
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {disciplinas.length === 0 ? (
          <AlunoEmptyState
            description="Quando a secretaria enturmar você, as disciplinas do semestre aparecem aqui."
            icon={Clock}
            title="Nenhuma disciplina neste semestre"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {disciplinas.map((disciplina) => {
              const limiteFaltas = limiteFaltasDaDisciplina(disciplina.chTotal);
              const frequencia = frequenciaPercentual({
                totalFaltas: disciplina.totalFaltas,
                chTotal: disciplina.chTotal,
              });
              const ns = notaSemestralVisivel(disciplina);
              const emRiscoFalta = isRiscoRf({
                totalFaltas: disciplina.totalFaltas,
                chTotal: disciplina.chTotal,
              });

              return (
                <div
                  className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40"
                  key={disciplina.id}
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {disciplina.codigoDisciplina} · {TIPO_ENTREGA_LABEL[disciplina.tipoEntrega]}
                      </span>
                      <AlunoStatusBadge kind="disciplina" status={disciplina.statusDisciplina} />
                    </div>
                    <h3 className="line-clamp-2 font-heading text-base font-bold text-foreground">
                      {disciplina.nomeDisciplina}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{disciplina.professorNome}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      <span className="truncate">{disciplina.horario}</span>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-muted-foreground">Frequência: </span>
                        <span className={`font-mono font-bold ${emRiscoFalta ? "text-destructive" : "text-foreground"}`}>
                          {frequencia}% ({disciplina.totalFaltas} faltas)
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">NS: </span>
                        <span className="font-mono font-bold text-foreground">
                          {ns !== null ? ns.toFixed(1) : "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] font-medium text-muted-foreground">
                        <span>
                          {disciplina.totalFaltas} de {limiteFaltas} faltas permitidas
                        </span>
                        <span className={emRiscoFalta ? "font-bold text-destructive" : ""}>
                          {emRiscoFalta ? "Limite próximo" : "Normal"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${emRiscoFalta ? "bg-destructive" : "bg-primary"}`}
                          style={{
                            width: `${limiteFaltas > 0 ? Math.min(100, (disciplina.totalFaltas / limiteFaltas) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {comunicados.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Avisos da IES para você</h2>
            <Button className="h-auto p-0 text-xs font-bold" nativeButton={false} render={<Link href={href("/area-aluno/comunicados")} />} variant="link">
              Mural completo
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {comunicados.slice(0, 2).map((comunicado) => (
              <Button
                className="h-auto flex-col items-start space-y-2 rounded-xl border border-border bg-card p-4 text-left shadow-xs hover:border-primary/40"
                key={comunicado.id}
                nativeButton={false}
                render={<Link href={href("/area-aluno/comunicados")} />}
                variant="ghost"
              >
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-muted-foreground">{formatDateBr(comunicado.criadoEm)}</span>
                  <span className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    Institucional
                  </span>
                </div>
                <h4 className="line-clamp-1 font-heading text-sm font-bold text-foreground">{comunicado.titulo}</h4>
                <p className="line-clamp-2 text-xs leading-relaxed font-medium text-muted-foreground">
                  {resumoTexto(comunicado.conteudo)}
                </p>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
