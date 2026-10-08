"use client";

import {useState} from "react";
import {Clock, Info} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {formatCorteNota, formatPercentualRegra, REGULAMENTO_PADRAO} from "@/lib/academic/regulamento";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {
  calcularBoletimDisciplina,
  disciplinasDoPeriodoLetivo,
  formatNota,
} from "@/lib/aluno/disciplina";
import {displayName} from "@/lib/aluno/labels";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";

interface NotasViewProps {
  initialData: PortalContexto;
}

export const NotasView = ({initialData}: NotasViewProps) => {
  const {data: parametros} = useGetParametrizacoes();
  const corteDireta = parametros?.corteAprovacaoDireta ?? REGULAMENTO_PADRAO.corteAprovacaoDireta;
  const corteFinal = parametros?.corteMediaFinal ?? REGULAMENTO_PADRAO.corteMediaFinal;
  const limiteFaltasPct = parametros?.limiteFaltasPercentual ?? REGULAMENTO_PADRAO.limiteFaltasPercentual;
  const periodo = getPeriodoLetivoAtual(parametros);
  const periodoLabel = formatPeriodoLetivo(periodo);
  const {contexto} = usePortalAluno(initialData);
  const {matricula, disciplinas} = contexto;
  const disciplinasSemestre = disciplinasDoPeriodoLetivo(disciplinas, periodo);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(
    disciplinasSemestre[0]?.id ?? null,
  );
  const selected =
    disciplinasSemestre.find((disciplina) => disciplina.id === selectedDisciplineId) ?? disciplinasSemestre[0];
  const selectedCalc = selected
    ? calcularBoletimDisciplina({
        disciplina: selected,
        limiteFaltasPercentual: limiteFaltasPct,
      })
    : null;
  const cortePresenca = 100 - limiteFaltasPct;
  const semestreFechado = disciplinasSemestre.some((disciplina) => disciplina.semestreFechado);

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="O boletim aparece depois que a matrícula e as turmas estiverem ativas."
          eyebrow="BOLETIM DISCENTE"
          title="Notas e Frequência"
        />
        <AlunoEmptyState
          description="Não há disciplinas para acompanhar neste momento."
          icon={Info}
          title="Sem lançamentos"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        description="Acompanhamento contínuo de avaliações (AV, AVS, AV3) e assiduidade presencial/síncrona."
        eyebrow={`BOLETIM DISCENTE · SEMESTRE ${periodoLabel}`}
        title="Notas e Frequência"
      />

      <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-foreground" />
          <h3 className="font-heading text-sm font-bold text-foreground">Como funcionam as notas e faltas no OpenSGA</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 text-xs leading-relaxed font-medium text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted p-3.5">
            <span className="mb-1 block font-bold text-foreground">1. Frequência é soberana</span>
            Você pode ter até {formatPercentualRegra(limiteFaltasPct)} de faltas na carga horária. Exceder o limite
            acarreta Reprovação por Falta (RF), independentemente das notas.
          </div>
          <div className="rounded-lg border border-border bg-muted p-3.5">
            <span className="mb-1 block font-bold text-foreground">2. Nota Semestral (NS)</span>
            Sua nota é o maior valor entre a Prova Regular (AV) e a Substitutiva (AVS):{" "}
            <code className="rounded border border-border bg-card px-1 py-0.5 font-mono font-bold text-foreground">
              NS = MAX(AV, AVS)
            </code>
            . Nota mínima para aprovação direta é {formatCorteNota(corteDireta)}.
          </div>
          <div className="rounded-lg border border-border bg-muted p-3.5">
            <span className="mb-1 block font-bold text-foreground">3. Prova Final (AV3)</span>
            Se ficar com NS abaixo de {formatCorteNota(corteDireta)} e presença regular, você tem direito à AV3. A Média
            Final é calculada por{" "}
            <code className="rounded border border-border bg-card px-1 py-0.5 font-mono font-bold text-foreground">
              (NS + AV3) / 2
            </code>{" "}
            (mínimo {formatCorteNota(corteFinal)}).
          </div>
        </div>
      </div>

      {disciplinasSemestre.length === 0 ? (
        <AlunoEmptyState
          description="Aguarde a enturmação nas turmas do período."
          icon={Info}
          title="Nenhuma disciplina no boletim"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  Grade de Avaliações {periodoLabel}
                </h2>
                <p className="text-xs font-medium text-muted-foreground">
                  Clique em uma linha para conferir o cálculo individual e detalhes das aulas.
                </p>
              </div>
              <span className="rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                {semestreFechado ? "Semestre fechado" : "Lançamento Aberto"}
              </span>
            </div>
            <Table className="text-xs">
              <TableHeader className="bg-muted font-mono text-foreground">
                <TableRow>
                  <TableHead className="h-auto px-4 py-3.5">Disciplina & Turma</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">AV</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">AVS (Subst.)</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">NS = MAX</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">AV3</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">Faltas / Limite</TableHead>
                  <TableHead className="h-auto px-3 py-3.5 text-center">% Presença</TableHead>
                  <TableHead className="h-auto px-4 py-3.5 text-right">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinasSemestre.map((disciplina) => {
                  const calc = calcularBoletimDisciplina({
                    disciplina,
                    limiteFaltasPercentual: limiteFaltasPct,
                  });
                  const isSelected = disciplina.id === selected?.id;

                  return (
                    <TableRow
                      className={`cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                      data-state={isSelected ? "selected" : undefined}
                      key={disciplina.id}
                      onClick={() => setSelectedDisciplineId(disciplina.id)}
                    >
                      <TableCell className="px-4 py-3.5">
                        <div className="font-heading text-sm font-bold text-foreground">{disciplina.nomeDisciplina}</div>
                        <div className="font-mono text-xs font-medium text-muted-foreground">
                          {disciplina.codigoDisciplina} · {displayName(disciplina.professorNome)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center font-mono font-bold text-foreground">
                        {disciplina.notaAv === null ? (
                          <span className="font-normal text-muted-foreground">—</span>
                        ) : (
                          formatNota(disciplina.notaAv)
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center font-mono font-bold text-foreground">
                        {disciplina.notaAvs === null ? (
                          <span className="font-normal text-muted-foreground">—</span>
                        ) : (
                          formatNota(disciplina.notaAvs)
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center">
                        {calc.ns !== null ? (
                          <span
                            className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-bold ${
                              calc.ns >= corteDireta
                                ? "border-success/40 bg-success/15 text-success"
                                : "border-warning/40 bg-warning/15 text-warning"
                            }`}
                          >
                            {formatNota(calc.ns)}
                          </span>
                        ) : (
                          <span className="font-normal text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center font-mono font-bold text-foreground">
                        {disciplina.notaAv3 !== null ? (
                          formatNota(disciplina.notaAv3)
                        ) : calc.habilitaAv3 ? (
                          <span className="rounded border border-warning/40 bg-warning/15 px-2 py-0.5 font-sans text-[11px] font-bold text-warning">
                            Liberada
                          </span>
                        ) : (
                          <span className="font-normal text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center font-mono font-semibold">
                        <span
                          className={
                            calc.emRisco || calc.rf ? "font-bold text-destructive" : "text-foreground"
                          }
                        >
                          {disciplina.totalFaltas}
                        </span>{" "}
                        <span className="font-normal text-muted-foreground">/ {calc.limiteFaltas}h</span>
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-center font-mono font-bold">
                        <span
                          className={
                            calc.frequencia < cortePresenca
                              ? "rounded border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-destructive"
                              : "text-foreground"
                          }
                        >
                          {calc.frequencia}%
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        <AlunoStatusBadge kind="disciplina" status={calc.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {selected && selectedCalc ? (
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-start">
                <div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    DETALHAMENTO DA TURMA {selected.codigoTurma}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-foreground">{selected.nomeDisciplina}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {selected.professorNome} · {selected.salaOuLink ?? selected.horario} (
                    {TIPO_ENTREGA_LABEL[selected.tipoEntrega]})
                  </p>
                </div>
                <AlunoStatusBadge kind="disciplina" status={selectedCalc.status} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-1 rounded-lg border border-border bg-muted p-4">
                  <span className="text-xs font-semibold text-muted-foreground">Carga Horária Total</span>
                  <p className="font-mono text-xl font-bold text-foreground">{selected.chTotal}h</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {selected.chCumprida}h ministradas até hoje
                  </p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-muted p-4">
                  <span className="text-xs font-semibold text-muted-foreground">Faltas Registradas</span>
                  <p
                    className={`font-mono text-xl font-bold ${selectedCalc.rf ? "text-destructive" : "text-foreground"}`}
                  >
                    {selected.totalFaltas} faltas
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    Limite: {selectedCalc.limiteFaltas}h ({selectedCalc.limiteFaltas - selected.totalFaltas} restantes)
                  </p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-muted p-4">
                  <span className="text-xs font-semibold text-muted-foreground">Nota Semestral (NS)</span>
                  <p className="font-mono text-xl font-bold text-foreground">
                    {selectedCalc.ns !== null ? formatNota(selectedCalc.ns) : "Aguardando"}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    MAX(AV: {formatNota(selected.notaAv)}, AVS: {formatNota(selected.notaAvs)})
                  </p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-muted p-4">
                  <span className="text-xs font-semibold text-muted-foreground">Status da AV3</span>
                  <p className="font-heading text-lg font-bold text-foreground">
                    {selectedCalc.habilitaAv3
                      ? "Liberada"
                      : selectedCalc.ns !== null && selectedCalc.ns >= corteDireta
                        ? "Dispensado"
                        : "Não se aplica"}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {selectedCalc.habilitaAv3
                      ? "Requerimento disponível na secretaria"
                      : selectedCalc.ns !== null && selectedCalc.ns >= corteDireta
                        ? `Aprovado direto com NS ≥ ${formatCorteNota(corteDireta)}`
                        : selectedCalc.rf
                          ? "RF soberano: AV3 não se aplica"
                          : "NS ainda não consolidada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span>
                  As notas são atualizadas pelo professor da disciplina até 72 horas após a aplicação de cada
                  instrumento avaliativo. Em caso de divergência de presença, procure seu docente antes do fechamento
                  letivo.
                </span>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
