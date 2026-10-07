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
import {TIPO_COMPONENTE_LABEL, MODALIDADE_LABEL} from "@/lib/admin/labels";
import {formatNota} from "@/lib/aluno/disciplina";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto, TipoComponente} from "@/lib/api/fetch-generated";

interface CursoViewProps {
  initialData: PortalContexto;
}

export const CursoView = ({initialData}: CursoViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {matricula, matriz} = contexto;
  const [selectedSemestre, setSelectedSemestre] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="A matriz curricular aparece junto com a matrícula."
          eyebrow="ESTRUTURA CURRICULAR"
          title="Meu curso"
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
  const semestres = Array.from(new Set(matriz.map((componente) => componente.semestreIdeal))).sort((a, b) => a - b);
  const tipos = Object.keys(TIPO_COMPONENTE_LABEL) as TipoComponente[];
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
            <span className="font-mono text-xs font-semibold text-muted-foreground">Progresso do curso</span>
            <p className="font-mono text-2xl font-bold text-foreground">
              {percentualConclusao}%{" "}
              <span className="text-xs font-semibold text-muted-foreground">concluído</span>
            </p>
          </div>
        }
        description={`${matricula.curso.nome} · ${MODALIDADE_LABEL[matricula.curso.modalidade]}`}
        eyebrow={`ESTRUTURA CURRICULAR VIGENTE · MATRIZ ${matricula.matrizCurricular.anoVigencia}`}
        title="Meu curso e matriz"
      />

      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">Integralização curricular</h3>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {chIntegralizada} horas integralizadas de {chTotal}h do projeto pedagógico. CH só entra se a disciplina
              estiver aprovada.
            </p>
          </div>
          <span className="rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground">
            Ingresso: {matricula.semestreIngresso} · Atual: {matricula.periodoAtual}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{width: `${percentualConclusao}%`}} />
        </div>
        <div className="flex justify-between font-mono text-xs font-semibold text-muted-foreground">
          <span>0 horas</span>
          <span>{chTotal}h</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className={selectedSemestre === "todos" ? "font-bold" : ""}
          onClick={() => setSelectedSemestre("todos")}
          size="sm"
          variant={selectedSemestre === "todos" ? "default" : "outline"}
        >
          Todos os semestres
        </Button>
        {semestres.map((semestre) => (
          <Button
            className={selectedSemestre === String(semestre) ? "font-bold" : ""}
            key={semestre}
            onClick={() => setSelectedSemestre(String(semestre))}
            size="sm"
            variant={selectedSemestre === String(semestre) ? "default" : "outline"}
          >
            {semestre}º
          </Button>
        ))}
        <Select items={[{value: "todos", label: "Todos os tipos"}, ...tipos.map((tipo) => ({value: tipo, label: TIPO_COMPONENTE_LABEL[tipo]}))]} onValueChange={(next) => { if (typeof next === "string") setFilterTipo(next); }} value={filterTipo}>
          <SelectTrigger className="h-8 w-52 text-xs">
            <SelectValue placeholder="Tipo">{() => (filterTipo === "todos" ? "Todos os tipos" : TIPO_COMPONENTE_LABEL[filterTipo as TipoComponente])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem label="Todos os tipos" value="todos">
              Todos os tipos
            </SelectItem>
            {tipos.map((tipo) => (
              <SelectItem key={tipo} label={TIPO_COMPONENTE_LABEL[tipo]} value={tipo}>
                {TIPO_COMPONENTE_LABEL[tipo]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {componentesFiltrados.map((componente) => (
          <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-xs" key={componente.id}>
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {componente.codigo} · {componente.semestreIdeal}º semestre
              </span>
              {componente.statusDisciplina ? (
                <AlunoStatusBadge kind="disciplina" status={componente.statusDisciplina} />
              ) : (
                <span className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  Pendente
                </span>
              )}
            </div>
            <h3 className="font-heading text-sm font-bold text-foreground">{componente.nome}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {TIPO_COMPONENTE_LABEL[componente.tipo]} · {componente.chTotal}h
              {componente.notaFinal !== null ? ` · MF ${formatNota(componente.notaFinal)}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
