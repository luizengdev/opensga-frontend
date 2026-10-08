"use client";

import {FileCheck2, FileText, ShieldCheck} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {PendingButtonLabel} from "@/components/pending-button-label";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {MODALIDADE_LABEL} from "@/lib/admin/labels";
import {disciplinasDoPeriodoLetivo} from "@/lib/aluno/disciplina";
import {useEmitirDocumento} from "@/lib/aluno/use-emitir-documento";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";
import {useGetParametrizacoes} from "@/lib/api/rc-generated";

interface MatriculaViewProps {
  initialData: PortalContexto;
}

export const MatriculaView = ({initialData}: MatriculaViewProps) => {
  const {alunoId, contexto} = usePortalAluno(initialData);
  const {documento, emitir, fechar, isPending} = useEmitirDocumento();
  const {data: parametros} = useGetParametrizacoes();
  const {profile, matricula, disciplinas} = contexto;
  const periodo = getPeriodoLetivoAtual(parametros);
  const periodoLabel = formatPeriodoLetivo(periodo);
  const disciplinasSemestre = disciplinasDoPeriodoLetivo(disciplinas, periodo);

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="O comprovante fica disponível após a efetivação do vínculo."
          eyebrow="REGISTRO ACADÊMICO OFICIAL"
          title="Minha Matrícula"
        />
        <AlunoEmptyState
          description="Não há matrícula ativa para emitir declaração."
          icon={FileCheck2}
          title="Sem matrícula"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          <Button disabled={isPending} onClick={() => emitir({tipo: "DECLARACAO_MATRICULA", alunoId})}>
            <PendingButtonLabel
              icon={<FileText className="size-4" />}
              isPending={isPending}
              label="Emitir Declaração de Matrícula"
              pendingLabel="Emitindo…"
            />
          </Button>
        }
        description="Dados institucionais de vínculo, polo presencial e ciclo acadêmico ativo."
        eyebrow={`REGISTRO ACADÊMICO OFICIAL · RA ${matricula.ra}`}
        title="Minha Matrícula"
      />

      <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-heading text-xl font-bold text-foreground">
              {profile.nome.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">{profile.nome}</h2>
                <AlunoStatusBadge kind="matricula" status={matricula.status} />
              </div>
              <p className="mt-0.5 font-mono text-xs font-medium text-muted-foreground">
                CPF {profile.cpf} · {profile.email}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted p-3.5 text-right">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
              Registro Acadêmico
            </span>
            <p className="font-mono text-xl font-bold text-foreground">{matricula.ra}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Curso de Graduação</span>
            <p className="text-sm font-bold text-foreground">{matricula.curso.nome}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Modalidade de Ensino</span>
            <p className="text-sm font-bold text-foreground">{MODALIDADE_LABEL[matricula.curso.modalidade]}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Polo Acadêmico</span>
            <p className="text-sm font-bold text-foreground">
              {matricula.curso.campus.nome} ({matricula.curso.campus.codigoPolo})
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Período Letivo Corrente</span>
            <p className="font-mono text-sm font-bold text-foreground">{periodoLabel}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Semestre de Ingresso</span>
            <p className="font-mono text-sm font-bold text-foreground">{matricula.semestreIngresso}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground">Matriz Curricular Vinculada</span>
            <p className="text-sm font-bold text-foreground">
              {matricula.matrizCurricular.nome} ({matricula.matrizCurricular.anoVigencia})
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground">
            Enturmação Ativa no Semestre {periodoLabel}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">
            Grade confirmada pela Secretaria Geral para o discente. Total de {disciplinasSemestre.length}{" "}
            componentes regulares.
          </p>
        </div>

        {disciplinasSemestre.length === 0 ? (
          <AlunoEmptyState
            description="A Secretaria ainda não confirmou turmas para este semestre letivo."
            icon={FileCheck2}
            title="Sem componentes no período"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border text-xs">
            <Table>
              <TableHeader className="bg-muted font-mono text-foreground">
                <TableRow>
                  <TableHead>Código & Turma</TableHead>
                  <TableHead>Componente Curricular</TableHead>
                  <TableHead>Professor Responsável</TableHead>
                  <TableHead>Horário & Sala</TableHead>
                  <TableHead>CH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinasSemestre.map((disciplina) => (
                  <TableRow key={disciplina.id}>
                    <TableCell className="font-mono font-medium text-muted-foreground">
                      {disciplina.codigoTurma}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">{disciplina.nomeDisciplina}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {disciplina.professorNome}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      <div>{disciplina.horario}</div>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {disciplina.salaOuLink ?? "A definir"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {disciplina.chTotal}h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/60 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
        <div className="space-y-1 text-xs leading-relaxed font-medium text-muted-foreground">
          <p className="font-bold text-foreground">Situação Regular e Ativa perante o MEC</p>
          <p>
            Sua matrícula está plenamente ativa e homologada. A renovação para o próximo semestre letivo ocorrerá
            durante o período de rematrícula anunciado no calendário acadêmico.
          </p>
        </div>
      </div>

      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
