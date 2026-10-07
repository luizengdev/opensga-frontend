"use client";

import {useState} from "react";
import {Info} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";
import {formatCorteNota, formatPercentualRegra, REGULAMENTO_PADRAO} from "@/lib/academic/regulamento";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";
import {
  formatNota,
  frequenciaPercentual,
  isRiscoRf,
  isRfPorFalta,
  notaSemestralVisivel,
} from "@/lib/aluno/disciplina";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface NotasViewProps {
  initialData: PortalContexto;
}

export const NotasView = ({initialData}: NotasViewProps) => {
  const {data: parametros} = useGetParametrizacoes();
  const corteDireta = parametros?.corteAprovacaoDireta ?? REGULAMENTO_PADRAO.corteAprovacaoDireta;
  const corteFinal = parametros?.corteMediaFinal ?? REGULAMENTO_PADRAO.corteMediaFinal;
  const limiteFaltasPct = parametros?.limiteFaltasPercentual ?? REGULAMENTO_PADRAO.limiteFaltasPercentual;
  const {contexto} = usePortalAluno(initialData);
  const {matricula, disciplinas} = contexto;
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(disciplinas[0]?.id ?? null);
  const selected = disciplinas.find((disciplina) => disciplina.id === selectedDisciplineId) ?? disciplinas[0];
  const semestreFechado = disciplinas.some((disciplina) => disciplina.semestreFechado);

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="O boletim aparece depois que a matrícula e as turmas estiverem ativas."
          eyebrow="BOLETIM DISCENTE"
          title="Notas e frequência"
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
        actions={
          <span className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground">
            {semestreFechado ? "Semestre fechado" : "Lançamento aberto"}
          </span>
        }
        description="Acompanhamento contínuo de AV, AVS, AV3 e assiduidade. Resultado oficial só no fechamento."
        eyebrow={`BOLETIM DISCENTE · ${matricula.periodoAtual}º PERÍODO`}
        title="Notas e frequência"
      />

      <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-foreground" />
          <h3 className="font-heading text-sm font-bold text-foreground">Como funcionam as notas e faltas</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 text-xs leading-relaxed font-medium text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/60 p-3.5">
            <span className="mb-1 block font-bold text-foreground">1. Frequência é soberana</span>
            Faltas acima de {formatPercentualRegra(limiteFaltasPct)} da CH geram RF e zeramento de CH,
            independentemente das notas.
          </div>
          <div className="rounded-lg border border-border bg-muted/60 p-3.5">
            <span className="mb-1 block font-bold text-foreground">2. Nota semestral (NS)</span>
            NS = MAX(AV, AVS), nulos ignorados. Aprovação direta no fechamento se NS ≥{" "}
            {formatCorteNota(corteDireta)} e frequência regular.
          </div>
          <div className="rounded-lg border border-border bg-muted/60 p-3.5">
            <span className="mb-1 block font-bold text-foreground">3. Prova final (AV3)</span>
            Com NS &lt; {formatCorteNota(corteDireta)} e presença regular, MF = (NS + AV3) / 2. Corte{" "}
            {formatCorteNota(corteFinal)}. Sem AV3 obrigatória o semestre não fecha.
          </div>
        </div>
      </div>

      {disciplinas.length === 0 ? (
        <AlunoEmptyState
          description="Aguarde a enturmação nas turmas do período."
          icon={Info}
          title="Nenhuma disciplina no boletim"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">Grade de avaliações</h2>
              <p className="text-xs font-medium text-muted-foreground">
                Clique em uma linha para ver o detalhe da disciplina.
              </p>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-muted font-mono text-foreground">
              <TableRow>
                <TableHead>Disciplina e turma</TableHead>
                <TableHead className="text-center">AV</TableHead>
                <TableHead className="text-center">AVS</TableHead>
                <TableHead className="text-center">NS = MAX</TableHead>
                <TableHead className="text-center">AV3</TableHead>
                <TableHead className="text-center">Faltas / limite</TableHead>
                <TableHead className="text-center">% Presença</TableHead>
                <TableHead className="text-right">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplinas.map((disciplina) => {
                const limite = limiteFaltasDaDisciplina(disciplina.chTotal, limiteFaltasPct);
                const ns = notaSemestralVisivel(disciplina);
                const frequencia = frequenciaPercentual({
                  totalFaltas: disciplina.totalFaltas,
                  chTotal: disciplina.chTotal,
                });
                const emRisco = isRiscoRf({
                  totalFaltas: disciplina.totalFaltas,
                  chTotal: disciplina.chTotal,
                  limiteFaltasPercentual: limiteFaltasPct,
                });
                const rf = isRfPorFalta({
                  totalFaltas: disciplina.totalFaltas,
                  chTotal: disciplina.chTotal,
                  limiteFaltasPercentual: limiteFaltasPct,
                });
                const isSelected = disciplina.id === selected?.id;

                return (
                  <TableRow
                    className={`cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                    key={disciplina.id}
                    onClick={() => setSelectedDisciplineId(disciplina.id)}
                  >
                    <TableCell>
                      <div className="font-heading text-sm font-bold text-foreground">{disciplina.nomeDisciplina}</div>
                      <div className="font-mono text-xs font-medium text-muted-foreground">
                        {disciplina.codigoTurma} · {disciplina.professorNome}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">{formatNota(disciplina.notaAv)}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{formatNota(disciplina.notaAvs)}</TableCell>
                    <TableCell className="text-center">
                      {ns !== null ? (
                        <span
                          className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-bold ${
                            ns >= 6
                              ? "border-success/25 bg-success/15 text-success-foreground"
                              : "border-warning/25 bg-warning/15 text-warning-foreground"
                          }`}
                        >
                          {ns.toFixed(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">
                      {disciplina.notaAv3 !== null ? (
                        formatNota(disciplina.notaAv3)
                      ) : disciplina.habilitaAv3 ? (
                        <span className="rounded border border-warning/25 bg-warning/15 px-2 py-0.5 font-sans text-[11px] font-bold text-warning-foreground">
                          Liberada
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      <span className={emRisco || rf ? "font-bold text-destructive" : "font-semibold text-foreground"}>
                        {disciplina.totalFaltas}
                      </span>
                      <span className="text-muted-foreground"> / {limite}h</span>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">{frequencia}%</TableCell>
                    <TableCell className="text-right">
                      <AlunoStatusBadge kind="disciplina" status={disciplina.statusDisciplina} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selected ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground">CH da disciplina</p>
            <p className="font-mono text-xl font-bold text-foreground">{selected.chTotal}h</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground">CH cumprida</p>
            <p className="font-mono text-xl font-bold text-foreground">{selected.chCumprida}h</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground">Média final</p>
            <p className="font-mono text-xl font-bold text-foreground">{formatNota(selected.mediaFinal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground">Fechamento</p>
            <p className="font-heading text-lg font-bold text-foreground">
              {selected.semestreFechado ? "Encerrado" : "Em lançamento"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
