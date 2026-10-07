"use client";

import {FileCheck2, ShieldCheck} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {MODALIDADE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {displayName} from "@/lib/aluno/labels";
import {useEmitirDocumento} from "@/lib/aluno/use-emitir-documento";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface MatriculaViewProps {
  initialData: PortalContexto;
}

export const MatriculaView = ({initialData}: MatriculaViewProps) => {
  const {alunoId, contexto} = usePortalAluno(initialData);
  const {documento, emitir, fechar, isPending} = useEmitirDocumento();
  const {profile, matricula, disciplinas} = contexto;

  if (!matricula) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <AlunoPageHeader
          description="O comprovante fica disponível após a efetivação do vínculo."
          eyebrow="VÍNCULO ACADÊMICO"
          title="Minha matrícula"
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
          <Button
            disabled={isPending}
            onClick={() => emitir({tipo: "DECLARACAO_MATRICULA", alunoId})}
            variant="outline"
          >
            {isPending ? "Emitindo…" : "Emitir declaração"}
          </Button>
        }
        description="Identidade acadêmica, polo e disciplinas em que você está enturmado. Sem alteração de ciclo."
        eyebrow={`VÍNCULO ACADÊMICO · RA ${matricula.ra}`}
        title="Minha matrícula"
      />

      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-heading text-xl font-bold text-foreground">{profile.nome}</p>
            <p className="font-mono text-xs font-semibold text-muted-foreground">RA {matricula.ra}</p>
          </div>
          <AlunoStatusBadge kind="matricula" status={matricula.status} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Curso</p>
            <p className="text-sm font-medium text-foreground">{matricula.curso.nome}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Modalidade</p>
            <p className="text-sm font-medium text-foreground">{MODALIDADE_LABEL[matricula.curso.modalidade]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Polo / campus</p>
            <p className="text-sm font-medium text-foreground">
              {matricula.curso.campus.nome} ({matricula.curso.campus.codigoPolo})
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Ingresso</p>
            <p className="text-sm font-medium text-foreground">{matricula.semestreIngresso}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Período atual</p>
            <p className="text-sm font-medium text-foreground">{matricula.periodoAtual}º</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Matriz</p>
            <p className="text-sm font-medium text-foreground">{matricula.matrizCurricular.nome}</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/60 p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
        <p className="text-xs font-medium text-muted-foreground">
          Este comprovante reflete o vínculo no OpenSGA. Alterações de status (trancamento, cancelamento ou formatura)
          são feitas pela Secretaria.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="border-b border-border p-4">
          <h2 className="font-heading text-base font-bold text-foreground">Enturmação do semestre</h2>
        </div>
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Disciplina</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disciplinas.map((disciplina) => (
              <TableRow key={disciplina.id}>
                <TableCell className="font-medium">{disciplina.nomeDisciplina}</TableCell>
                <TableCell className="font-mono text-xs">{disciplina.codigoTurma}</TableCell>
                <TableCell>{displayName(disciplina.professorNome)}</TableCell>
                <TableCell>{TIPO_ENTREGA_LABEL[disciplina.tipoEntrega]}</TableCell>
                <TableCell>{disciplina.horario}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
