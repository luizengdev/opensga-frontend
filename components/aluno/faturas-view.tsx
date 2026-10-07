"use client";

import {useState} from "react";
import {CreditCard, Receipt} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {DocumentViewerDialog} from "@/components/aluno/document-viewer-dialog";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {firstName} from "@/lib/aluno/labels";
import {useEmitirDocumento} from "@/lib/aluno/use-emitir-documento";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto, PortalFatura} from "@/lib/api/fetch-generated";

interface FaturasViewProps {
  initialData: PortalContexto;
}

type FiltroFatura = "todas" | "pendentes" | "pagas";

const openPayment = (fatura: PortalFatura) => {
  if (!fatura.stripePaymentUrl || fatura.valor <= 0) {
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
  const totalPago = faturas.filter((fatura) => fatura.status === "PAGA").reduce((soma, fatura) => soma + fatura.valor, 0);
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
            {isPending ? "Emitindo…" : "Declaração de quitação"}
          </Button>
        }
        description="Consulta de vencimentos, histórico de quitações e pagamento via Stripe quando houver valor devido."
        eyebrow={`GESTÃO FINANCEIRA PESSOAL · ${firstName(profile.nome).toUpperCase()}`}
        title="Mensalidades e faturas"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Próximo vencimento</span>
            {faturaAberta ? (
              <AlunoStatusBadge kind="fatura" status={faturaAberta.status} />
            ) : (
              <span className="rounded border border-success/25 bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success-foreground">
                Sem pendências
              </span>
            )}
          </div>
          {faturaAberta ? (
            <>
              <p className="font-mono text-2xl font-bold text-foreground">{formatCurrencyBrl(faturaAberta.valor)}</p>
              <p className="text-xs font-medium text-muted-foreground">{faturaAberta.descricao}</p>
              {faturaAberta.stripePaymentUrl && faturaAberta.valor > 0 ? (
                <Button onClick={() => openPayment(faturaAberta)} size="sm">
                  <CreditCard className="size-3.5" /> Pagar agora
                </Button>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">Isento / R$ 0 — sem Checkout.</p>
              )}
            </>
          ) : (
            <p className="font-heading text-base font-bold text-foreground">Nada a vencer</p>
          )}
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Total quitado</span>
          <p className="font-mono text-2xl font-bold text-foreground">{formatCurrencyBrl(totalPago)}</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Faturas no histórico</span>
          <p className="font-mono text-2xl font-bold text-foreground">{faturas.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {([
          {id: "todas", label: "Todas"},
          {id: "pendentes", label: "Pendentes"},
          {id: "pagas", label: "Pagas"},
        ] as const).map((item) => (
          <Button
            key={item.id}
            onClick={() => setFilter(item.id)}
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {faturasFiltradas.length === 0 ? (
        <AlunoEmptyState
          description="Quando houver cobrança lançada pela secretaria, ela aparece nesta lista."
          icon={CreditCard}
          title="Nenhuma fatura neste filtro"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faturasFiltradas.map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell className="font-medium">{fatura.descricao}</TableCell>
                  <TableCell>{formatDateBr(fatura.dataVencimento)}</TableCell>
                  <TableCell className="font-mono">{formatCurrencyBrl(fatura.valor)}</TableCell>
                  <TableCell>
                    <AlunoStatusBadge kind="fatura" status={fatura.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {fatura.stripePaymentUrl && fatura.valor > 0 && fatura.status !== "PAGA" ? (
                      <Button onClick={() => openPayment(fatura)} size="sm">
                        Pagar
                      </Button>
                    ) : fatura.valor <= 0 ? (
                      <span className="text-xs font-semibold text-muted-foreground">Isento</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {fatura.pagoEm ? formatDateBr(fatura.pagoEm) : "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <DocumentViewerDialog documento={documento} onClose={fechar} />
    </div>
  );
};
