"use client";

import {useState} from "react";
import {BookOpen} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {MODALIDADE_LABEL, TIPO_COMPONENTE_LABEL} from "@/lib/admin/labels";
import {mediaFinalDoComponente} from "@/lib/aluno/disciplina";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto, TipoComponente} from "@/lib/api/fetch-generated";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";

interface CursoViewProps {
  initialData: PortalContexto;
}

export const CursoView = ({initialData}: CursoViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {data: parametros} = useGetParametrizacoes();
  const {matricula, matriz} = contexto;
  const [selectedSemestre, setSelectedSemestre] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const periodoLabel = formatPeriodoLetivo(getPeriodoLetivoAtual(parametros));

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="A matriz curricular aparece junto com a matrícula."
          eyebrow="ESTRUTURA CURRICULAR VIGENTE"
          title="Meu Curso & Matriz"
        />
        <AlunoEmptyState
          description="Não há grade para exibir sem um vínculo acadêmico."
          icon={BookOpen}
          title="Curso indisponível"
        />
      </div>
    );
  }

  const chIntegralizada = matricula.matrizCurricular.chIntegralizada;
  const chTotal = matricula.matrizCurricular.chTotalCurso;
  const percentualConclusao = chTotal > 0 ? Math.round((chIntegralizada / chTotal) * 100) : 0;
  const metadeCarga = Math.round(chTotal / 2);
  const semestres = Array.from(new Set(matriz.map((componente) => componente.semestreIdeal))).sort(
    (a, b) => a - b,
  );
  const tipos = Object.keys(TIPO_COMPONENTE_LABEL) as TipoComponente[];
  const tipoItems = [
    {value: "todos", label: "Todas as Categorias"},
    ...tipos.map((tipo) => ({value: tipo, label: TIPO_COMPONENTE_LABEL[tipo]})),
  ];
  const tipoSelecionado = tipoItems.find((item) => item.value === filterTipo)?.label;
  const componentesFiltrados = matriz.filter((componente) => {
    const matchSemestre = selectedSemestre === "todos" || String(componente.semestreIdeal) === selectedSemestre;
    const matchTipo = filterTipo === "todos" || componente.tipo === filterTipo;
    return matchSemestre && matchTipo;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          <div className="text-right">
            <span className="font-mono text-xs font-semibold text-muted-foreground">Progresso do Curso</span>
            <p className="font-mono text-2xl font-bold text-foreground">
              {percentualConclusao}%{" "}
              <span className="text-xs font-semibold text-muted-foreground">concluído</span>
            </p>
          </div>
        }
        description={`${matricula.curso.nome} · Modalidade ${MODALIDADE_LABEL[matricula.curso.modalidade]}`}
        eyebrow={`ESTRUTURA CURRICULAR VIGENTE · MATRIZ ${matricula.matrizCurricular.anoVigencia}`}
        title="Meu Curso & Matriz"
      />

      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">Integralização Curricular</h2>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {chIntegralizada} horas integralizadas de um total de {chTotal} horas exigidas pelo projeto pedagógico.
            </p>
          </div>
          <span className="rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground">
            Ingresso: {matricula.semestreIngresso} · Atual: {periodoLabel}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{width: `${percentualConclusao}%`}}
            />
          </div>
          <div className="flex justify-between font-mono text-xs font-semibold text-muted-foreground">
            <span>0 horas</span>
            <span>Metade ({metadeCarga}h)</span>
            <span>Formatura ({chTotal}h)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            onClick={() => setSelectedSemestre("todos")}
            size="sm"
            variant={selectedSemestre === "todos" ? "default" : "outline"}
          >
            Todos os Períodos
          </Button>
          {semestres.map((semestre) => (
            <Button
              key={semestre}
              onClick={() => setSelectedSemestre(String(semestre))}
              size="sm"
              variant={selectedSemestre === String(semestre) ? "default" : "outline"}
            >
              {semestre}º Semestre
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Categoria:</span>
          <Select
            items={tipoItems}
            onValueChange={(next) => {
              if (typeof next === "string" && next.length > 0) {
                setFilterTipo(next);
              }
            }}
            value={filterTipo}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue placeholder="Categoria">{() => tipoSelecionado ?? "Categoria"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tipoItems.map((item) => (
                <SelectItem key={item.value} label={item.label} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {componentesFiltrados.length === 0 ? (
        <AlunoEmptyState
          description="Nenhum componente corresponde ao período ou à categoria selecionados."
          icon={BookOpen}
          title="Nenhum componente neste filtro"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {componentesFiltrados.map((componente) => (
            <div
              className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs"
              key={componente.id}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-muted-foreground">
                    {componente.semestreIdeal}º Semestre · {componente.codigo}
                  </span>
                  {componente.statusDisciplina ? (
                    <AlunoStatusBadge kind="disciplina" status={componente.statusDisciplina} />
                  ) : (
                    <span className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      A cursar
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">{componente.nome}</h3>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="rounded border border-border bg-muted px-2 py-0.5 font-semibold text-foreground">
                    {TIPO_COMPONENTE_LABEL[componente.tipo]}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  <span className="font-mono font-semibold text-foreground">{componente.chTotal} horas</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="font-medium text-muted-foreground">Média Final:</span>
                <span className="font-mono font-bold text-foreground">{mediaFinalDoComponente(componente)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
