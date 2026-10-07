"use client";

import {Printer} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {MODALIDADE_LABEL, STATUS_MATRICULA_LABEL} from "@/lib/admin/labels";
import {formatNota} from "@/lib/aluno/disciplina";
import {STATUS_DISCIPLINA_LABEL} from "@/lib/aluno/labels";
import type {PortalContexto} from "@/lib/api/fetch-generated";

export type AlunoDocumentoTipo =
  | "declaracao_matricula"
  | "historico_parcial"
  | "quitacao_financeira"
  | "carteirinha_estudantil";

interface DocumentViewerDialogProps {
  contexto: PortalContexto;
  onClose: () => void;
  type: AlunoDocumentoTipo | null;
}

const TITULOS: Record<AlunoDocumentoTipo, string> = {
  declaracao_matricula: "Declaração de matrícula ativa",
  historico_parcial: "Histórico escolar parcial",
  quitacao_financeira: "Declaração de quitação financeira",
  carteirinha_estudantil: "Carteirinha estudantil digital",
};

export const DocumentViewerDialog = ({contexto, onClose, type}: DocumentViewerDialogProps) => {
  const matricula = contexto.matricula;
  const codigo = matricula ? `AUT-${matricula.ra}-${matricula.id.replaceAll("-", "").slice(0, 6).toUpperCase()}` : "";

  return (
    <Dialog onOpenChange={(open) => { if (!open) onClose(); }} open={Boolean(type)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type ? TITULOS[type] : "Documento"}</DialogTitle>
          <DialogDescription>Documento gerado a partir do vínculo acadêmico atual. Use imprimir para PDF.</DialogDescription>
        </DialogHeader>
        {type && matricula ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="font-heading text-lg font-bold">OpenSGA</p>
                <p className="text-xs font-medium text-muted-foreground">Portal do Aluno · documento oficial interno</p>
              </div>
              <span className="font-mono text-[10px] font-bold text-muted-foreground">{codigo}</span>
            </div>
            <p className="text-sm font-medium">
              {contexto.profile.nome} · RA {matricula.ra} · {STATUS_MATRICULA_LABEL[matricula.status]}
            </p>
            <p className="text-sm">
              {matricula.curso.nome} ({MODALIDADE_LABEL[matricula.curso.modalidade]}) · Polo{" "}
              {matricula.curso.campus.nome}
            </p>
            {type === "historico_parcial" ? (
              <ul className="space-y-1 text-xs">
                {contexto.matriz.map((componente) => (
                  <li key={componente.id}>
                    {componente.codigo} {componente.nome} — {componente.chTotal}h
                    {componente.statusDisciplina ? ` · ${STATUS_DISCIPLINA_LABEL[componente.statusDisciplina]}` : ""}
                    {componente.notaFinal !== null ? ` · ${formatNota(componente.notaFinal)}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            {type === "quitacao_financeira" ? (
              <ul className="space-y-1 text-xs">
                {contexto.faturas.map((fatura) => (
                  <li key={fatura.id}>
                    {fatura.descricao} · {formatCurrencyBrl(fatura.valor)} · {formatDateBr(fatura.dataVencimento)} ·{" "}
                    {fatura.status}
                  </li>
                ))}
              </ul>
            ) : null}
            {type === "declaracao_matricula" ? (
              <ul className="space-y-1 text-xs">
                {contexto.disciplinas.map((disciplina) => (
                  <li key={disciplina.id}>
                    {disciplina.codigoTurma} · {disciplina.nomeDisciplina} · {disciplina.chTotal}h
                  </li>
                ))}
              </ul>
            ) : null}
            {type === "carteirinha_estudantil" ? (
              <p className="text-xs text-muted-foreground">
                Identificação digital válida enquanto a matrícula permanecer ativa no semestre vigente.
              </p>
            ) : null}
            <Button onClick={() => window.print()} variant="outline">
              <Printer className="size-4" />
              Imprimir
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Não há matrícula para gerar este documento.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
