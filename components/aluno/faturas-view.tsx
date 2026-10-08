"use client";

import {useState} from "react";
import {CheckCircle2, CreditCard, FileText, Receipt} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatCompetenciaBr, formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {firstName} from "@/lib/aluno/labels";
import {useEmitirDocumento} from "@/lib/aluno/use-emitir-documento";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto, PortalFatura} from "@/lib/api/fetch-generated";

interface FaturasViewProps {
  initialData: PortalContexto;
}

type FiltroFatura = "todas" | "pendentes" | "pagas";

const FILTROS: Array<{id: FiltroFatura; label: string}> = [
  {id: "todas", label: "Todas"},
  {id: "pendentes", label: "Pendentes"},
  {id: "pagas", label: "Pagas"},
];

const podePagarFatura = (fatura: PortalFatura) => {
  return Boolean(
    fatura.stripePaymentUrl &&
      fatura.valor > 0 &&
      (fatura.status === "PENDENTE" || fatura.status === "ATRASADA"),
  );
};

const openPayment = (fatura: PortalFatura) => {
  if (!podePagarFatura(fatura) || !fatura.stripePaymentUrl) {
    return;
  }

  window.location.assign(fatura.stripePaymentUrl);
};

export const FaturasView = ({initialData}: FaturasViewProps) => {
  const {alunoId, contexto} = usePortalAluno(initialData);
  const {documento, emitir, fechar, isPending} = useEmitirDocumento();
  const {faturas, profile} = contexto;
  const [filter, setFilter] = useState<FiltroFatura>("todas");
  const faturaAberta = faturas.find((fatura) => fatura.status === "PENDENTE" || fatura.status === "ATRASADA");
  const faturasPagas = faturas.filter((fatura) => fatura.status === "PAGA");
  const totalPago = faturasPagas.reduce((soma, fatura) => soma + fatura.valor, 0);
  const faturasZeradas = faturas.filter((fatura) => fatura.valor <= 0);
  const faturasFiltradas = faturas.filter((fatura) => {
    if (filter === "pendentes") {
      return fatura.status === "PENDENTE" || fatura.status === "ATRASADA";
    }

    if (filter === "pagas") {
      return fatura.status === "PAGA";
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          <Button
            disabled={isPending}
            onClick={() => emitir({tipo: "QUITACAO_FINANCEIRA", alunoId})}
            variant="outline"
          >
            <Receipt className="size-4" />
            {isPending ? "Emitindo…" : "Declaração de Quitação Anual"}
          </Button>
        }
        description="Consulta de vencimentos, histórico de quitações e emissão de comprovantes."
        eyebrow={`GESTÃO FINANCEIRA PESSOAL · DISCENTE ${firstName(profile.nome).toUpperCase()}`}
        title="Mensalidades & Faturas"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Próximo Vencimento</span>
            {faturaAberta ? (
              <AlunoStatusBadge kind="fatura" status={faturaAberta.status} />
            ) : (
              <span className="rounded border border-success/25 bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success-foreground">
                Sem Pendências
              </span>
            )}
          </div>
          {faturaAberta ? (
            <>
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">
                  {formatCurrencyBrl(faturaAberta.valor)}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Vence em {formatDateBr(faturaAberta.dataVencimento)}
                </p>
              </div>
              {podePagarFatura(faturaAberta) ? (
                <Button className="mt-2 w-full text-xs font-bold" onClick={() => openPayment(faturaAberta)}>
                  <CreditCard className="size-4" />
                  Pagar Fatura (Stripe)
                </Button>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">Isento / R$ 0 — sem Checkout.</p>
              )}
            </>
          ) : (
            <div>
              <p className="font-heading text-lg font-bold text-foreground">Mensalidades em dia</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Não há faturas em aberto no momento.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Total Quitado no Período</span>
          <div>
            <p className="font-mono text-2xl font-bold text-foreground">{formatCurrencyBrl(totalPago)}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {faturasPagas.length} mensalidades quitadas com sucesso.
            </p>
          </div>
          {faturasPagas.length > 0 ? (
            <div className="flex items-center gap-1 pt-2 text-xs font-semibold text-success">
              <CheckCircle2 className="size-4" />
              Histórico com quitações registradas
            </div>
          ) : (
            <p className="pt-2 text-xs font-medium text-muted-foreground">Ainda não há quitações neste histórico.</p>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-muted/60 p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Convênios & Isenções</span>
          <div>
            <p className="font-heading text-base font-bold text-foreground">Checkout só com valor devido</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {faturasZeradas.length} lançamento(s) com valor R$ 0,00 neste histórico.
            </p>
          </div>
          <p className="pt-2 text-xs leading-relaxed font-medium text-muted-foreground">
            Para valores zerados, a quitação é automática sem necessidade de Checkout Stripe.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">Histórico de Cobranças</h2>
            <p className="text-xs font-medium text-muted-foreground">
              Relação de mensalidades e status bancário em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
            {FILTROS.map((item) => (
              <Button
                key={item.id}
                onClick={() => setFilter(item.id)}
                size="xs"
                variant={filter === item.id ? "secondary" : "ghost"}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {faturasFiltradas.length === 0 ? (
          <div className="p-4">
            <AlunoEmptyState
              description="Quando houver cobrança lançada pela secretaria, ela aparece nesta lista."
              icon={CreditCard}
              title="Nenhuma fatura neste filtro"
            />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted font-mono text-foreground">
              <TableRow>
                <TableHead>Descrição da Mensalidade</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faturasFiltradas.map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell>
                    <div className="font-heading text-sm font-bold text-foreground">{fatura.descricao}</div>
                    {fatura.pagoEm ? (
                      <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                        Liquidado em: {formatDateBr(fatura.pagoEm)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-muted-foreground">
                    {formatCompetenciaBr(fatura.dataVencimento)}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-foreground">
                    {formatDateBr(fatura.dataVencimento)}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-foreground">
                    {formatCurrencyBrl(fatura.valor)}
                  </TableCell>
                  <TableCell>
                    <AlunoStatusBadge kind="fatura" status={fatura.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {podePagarFatura(fatura) ? (
                      <Button onClick={() => openPayment(fatura)} size="sm">
                        <CreditCard className="size-3.5" /> Pagar
                      </Button>
                    ) : fatura.status === "PAGA" ? (
                      <Button
                        className="h-auto p-0 text-xs font-bold"
                        disabled={isPending}
                        onClick={() => emitir({tipo: "QUITACAO_FINANCEIRA", alunoId})}
                        variant="link"
                      >
                        <FileText className="size-3.5" /> Recibo
                      </Button>
                    ) : fatura.valor <= 0 ? (
                      <span className="text-xs font-medium text-muted-foreground">Isento / R$ 0</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
