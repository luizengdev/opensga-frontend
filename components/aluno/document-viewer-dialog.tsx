"use client";

import {Printer, ShieldCheck, X} from "lucide-react";
import Image from "next/image";
import {useRef} from "react";
import dayjs from "dayjs";

import {NexaUniversityMark} from "@/components/auth/nexa-university-mark";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {MODALIDADE_LABEL, TIPO_COMPONENTE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {formatNota} from "@/lib/aluno/disciplina";
import {STATUS_DISCIPLINA_LABEL} from "@/lib/aluno/labels";
import type {DocumentoEmitido} from "@/lib/api/fetch-generated";
import {corpoTemHtml, sanitizeDocumentoHtml} from "@/lib/documento/html";
import {imprimirFolhaDocumento} from "@/lib/documento/imprimir";

interface DocumentViewerDialogProps {
  documento: DocumentoEmitido | null;
  onClose: () => void;
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const paragrafosDoCorpo = (corpo: string) => {
  return corpo
    .split(/\n+/)
    .map((paragrafo) => paragrafo.trim())
    .filter((paragrafo) => paragrafo.length > 0);
};

const formatDataEmissao = (valor: string) => {
  const data = dayjs(valor);
  return `${data.format("DD")} de ${MESES[data.month()]} de ${data.format("YYYY")}`;
};

const statusBadgeClass = (status: DocumentoEmitido["matriz"][number]["statusDisciplina"]) => {
  if (status === "APROVADO") {
    return "bg-success/15 text-success-foreground";
  }

  if (status === "EM_ABERTO") {
    return "bg-warning/15 text-warning-foreground";
  }

  if (status === "RF" || status === "RN") {
    return "bg-destructive/15 text-destructive";
  }

  return "bg-muted text-muted-foreground";
};

export const DocumentViewerDialog = ({documento, onClose}: DocumentViewerDialogProps) => {
  const percentualCh =
    documento && documento.chTotalCurso > 0
      ? ((documento.chIntegralizada / documento.chTotalCurso) * 100).toFixed(1).replace(".", ",")
      : "0,0";
  const validadeCarteirinha = documento
    ? `${dayjs(documento.emitidoEm).format("YYYY")}/${dayjs(documento.emitidoEm).add(1, "year").format("YYYY")}`
    : "";
  const folhaRef = useRef<HTMLDivElement>(null);

  const imprimir = () => {
    if (!folhaRef.current || !documento) {
      return;
    }

    imprimirFolhaDocumento({folha: folhaRef.current, titulo: documento.titulo});
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={Boolean(documento)}
    >
      <DialogContent
        className="max-h-[90vh] w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{documento?.titulo ?? "Documento oficial"}</DialogTitle>
        <DialogDescription className="sr-only">
          Folha oficial emitida pela Secretaria. Use imprimir para gerar o PDF.
        </DialogDescription>
        {documento ? (
          <div>
            <div className="print-hidden flex items-center justify-between bg-sidebar px-6 py-3.5 text-sidebar-foreground">
              <div className="flex items-center gap-3">
                <NexaUniversityMark compact linked={false} tone="inverse" />
                <span className="font-mono text-xs tracking-wider text-sidebar-foreground/80">
                  DOCUMENTO OFICIAL DIGITAL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={imprimir} size="sm" variant="secondary">
                  <Printer className="size-3.5" />
                  Imprimir / Salvar PDF
                </Button>
                <Button
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={onClose}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-4" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </div>
            </div>
            <div className="print-document space-y-8 bg-card p-8 text-card-foreground md:p-12" ref={folhaRef}>
              <div className="flex items-start justify-between border-b-2 border-foreground pb-6">
                <div className="space-y-1">
                  <NexaUniversityMark linked={false} />
                  <p className="text-xs font-medium text-muted-foreground">
                    Credenciada pelo Ministério da Educação (MEC) · {documento.curso.campusNome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Secretaria Geral de Registro e Controle Acadêmico
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
                    <ShieldCheck className="size-3.5 text-success" />
                    Válido em todo território nacional
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    Autenticidade: {documento.codigoAutenticacao}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="py-2 text-center">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground uppercase">
                    {documento.titulo}
                  </h2>
                  {documento.tipo === "HISTORICO_PARCIAL" ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Carga horária cumprida: {documento.chIntegralizada}h de {documento.chTotalCurso}h (
                      {percentualCh}%)
                    </p>
                  ) : (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Semestre vigente: {documento.periodoAtual}º período · ingresso {documento.semestreIngresso}
                    </p>
                  )}
                </div>

                {corpoTemHtml(documento.corpo) ? (
                  <div
                    className="space-y-4 text-sm leading-relaxed text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_b]:font-semibold [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{__html: sanitizeDocumentoHtml(documento.corpo)}}
                  />
                ) : (
                  <div className="space-y-4 text-justify text-sm leading-relaxed text-foreground">
                    {paragrafosDoCorpo(documento.corpo).map((paragrafo, indice) => (
                      <p key={`${indice}-${paragrafo.slice(0, 24)}`}>{paragrafo}</p>
                    ))}
                  </div>
                )}

                {documento.tipo === "DECLARACAO_MATRICULA" ? (
                  <div className="pt-2">
                    <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Componentes curriculares do período ({documento.disciplinas.length} disciplinas)
                    </h4>
                    <div className="overflow-hidden rounded-md border border-border text-xs">
                      <table className="w-full text-left">
                        <thead className="border-b border-border bg-muted font-medium text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2">Código</th>
                            <th className="px-3 py-2">Disciplina</th>
                            <th className="px-3 py-2">CH</th>
                            <th className="px-3 py-2">Modalidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documento.disciplinas.map((disciplina) => (
                            <tr className="border-t border-border" key={`${disciplina.codigo}-${disciplina.nome}`}>
                              <td className="px-3 py-1.5 font-mono text-muted-foreground">{disciplina.codigo}</td>
                              <td className="px-3 py-1.5 font-medium text-foreground">{disciplina.nome}</td>
                              <td className="px-3 py-1.5 font-mono">{disciplina.chTotal}h</td>
                              <td className="px-3 py-1.5">{TIPO_ENTREGA_LABEL[disciplina.tipoEntrega]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {documento.tipo === "HISTORICO_PARCIAL" ? (
                  <div className="overflow-hidden rounded-md border border-border text-xs">
                    <table className="w-full text-left">
                      <thead className="border-b border-border bg-muted font-medium text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Sem.</th>
                          <th className="px-3 py-2">Disciplina</th>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">CH</th>
                          <th className="px-3 py-2">Nota</th>
                          <th className="px-3 py-2">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documento.matriz.map((componente) => (
                          <tr className="border-t border-border" key={`${componente.codigo}-${componente.semestreIdeal}`}>
                            <td className="px-3 py-1.5 font-mono">{componente.semestreIdeal}º</td>
                            <td className="px-3 py-1.5 font-medium text-foreground">{componente.nome}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">
                              {TIPO_COMPONENTE_LABEL[componente.tipo]}
                            </td>
                            <td className="px-3 py-1.5 font-mono">{componente.chTotal}h</td>
                            <td className="px-3 py-1.5 font-mono">{formatNota(componente.notaFinal)}</td>
                            <td className="px-3 py-1.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(componente.statusDisciplina)}`}
                              >
                                {componente.statusDisciplina
                                  ? STATUS_DISCIPLINA_LABEL[componente.statusDisciplina]
                                  : "Não cursada"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {documento.tipo === "CARTEIRINHA_ESTUDANTIL" ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary bg-primary p-6 text-primary-foreground shadow-xl">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <NexaUniversityMark compact linked={false} tone="on-primary" />
                          <p className="font-mono text-[10px] text-primary-foreground/70">
                            DOCUMENTO NACIONAL DO ESTUDANTE
                          </p>
                        </div>
                        <span className="rounded border border-success/40 bg-success/20 px-2 py-0.5 font-mono text-[10px] text-success-foreground">
                          VÁLIDO {validadeCarteirinha}
                        </span>
                      </div>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                          {documento.aluno.avatarUrl ? (
                            <Image
                              alt={documento.aluno.nome}
                              className="object-cover"
                              fill
                              sizes="80px"
                              src={documento.aluno.avatarUrl}
                              unoptimized
                            />
                          ) : (
                            <span className="font-heading text-2xl font-bold">
                              {documento.aluno.nome.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="font-mono text-[10px] uppercase text-primary-foreground/70">
                            Nome do estudante
                          </p>
                          <p className="text-sm leading-tight font-semibold">{documento.aluno.nome}</p>
                          <p className="mt-2 font-mono text-[10px] uppercase text-primary-foreground/70">
                            Curso / matrícula
                          </p>
                          <p>
                            {documento.curso.nome} ({MODALIDADE_LABEL[documento.curso.modalidade]})
                          </p>
                          <p className="font-mono text-[11px] text-primary-foreground/80">
                            RA {documento.aluno.ra} · {documento.periodoAtual}º período
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-primary-foreground/20 pt-4 font-mono text-[11px] text-primary-foreground/70">
                        <span>MEC / DNE Certificado</span>
                        <span>{documento.codigoAutenticacao}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 items-end gap-8 border-t border-border pt-8">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Emitido em: {formatDataEmissao(documento.emitidoEm)}</p>
                  <p className="font-mono text-[11px]">Código de verificação: {documento.codigoAutenticacao}</p>
                  <p className="text-[10px]">A validação desta declaração pode ser confirmada junto à Secretaria.</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="mx-auto w-44 border-b border-border pb-1">
                    <span className="font-heading text-xs italic text-foreground">Secretaria Geral Acadêmica</span>
                  </div>
                  <p className="text-[11px] font-semibold text-foreground">Diretoria de Registro Escolar</p>
                  <p className="text-[10px] text-muted-foreground">Nexa University</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
