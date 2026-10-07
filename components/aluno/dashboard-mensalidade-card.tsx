"use client";

import {ArrowRight, CreditCard, Eye, EyeOff} from "lucide-react";
import Link from "next/link";
import {useState} from "react";

import {AlunoStatusBadge} from "@/components/aluno/aluno-status-badge";
import {Button} from "@/components/ui/button";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import type {PortalFatura} from "@/lib/api/fetch-generated";

interface DashboardMensalidadeCardProps {
  faturaAberta?: PortalFatura;
  historicoHref: string;
}

export const DashboardMensalidadeCard = ({
  faturaAberta,
  historicoHref,
}: DashboardMensalidadeCardProps) => {
  const [isValorVisivel, setIsValorVisivel] = useState(false);

  const openPayment = () => {
    if (!faturaAberta?.stripePaymentUrl || faturaAberta.valor <= 0) {
      return;
    }

    window.location.assign(faturaAberta.stripePaymentUrl);
  };

  return (
    <div
      className={`flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs ${
        isValorVisivel && faturaAberta ? "border-l-4 border-l-warning" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Mensalidade</span>
        <div className="flex items-center gap-1.5">
          {isValorVisivel ? (
            faturaAberta ? (
              <AlunoStatusBadge kind="fatura" status={faturaAberta.status} />
            ) : (
              <span className="rounded border border-success/25 bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success-foreground">
                Quitada
              </span>
            )
          ) : null}
          <Button
            aria-label={isValorVisivel ? "Ocultar valor da mensalidade" : "Mostrar valor da mensalidade"}
            aria-pressed={isValorVisivel}
            className="text-muted-foreground"
            onClick={() => setIsValorVisivel((visivel) => !visivel)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            {isValorVisivel ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>
        </div>
      </div>
      <div>
        {isValorVisivel ? (
          faturaAberta ? (
            <>
              <p className="font-mono text-2xl font-bold text-foreground">{formatCurrencyBrl(faturaAberta.valor)}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                Vence em {formatDateBr(faturaAberta.dataVencimento)}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-base font-bold text-foreground">Tudo em dia</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">Nenhuma fatura pendente.</p>
            </>
          )
        ) : (
          <>
            <p className="select-none font-mono text-2xl font-bold tracking-widest text-foreground">R$ ••••</p>
            <p className="mt-0.5 select-none text-xs font-medium tracking-widest text-muted-foreground">••••••••</p>
          </>
        )}
      </div>
      {isValorVisivel && faturaAberta && faturaAberta.stripePaymentUrl && faturaAberta.valor > 0 ? (
        <Button className="w-full text-xs font-bold" onClick={openPayment} size="sm">
          <CreditCard className="size-3.5" /> Pagar agora
        </Button>
      ) : (
        <Button
          className="h-auto justify-start p-0 text-xs font-semibold"
          nativeButton={false}
          render={<Link href={historicoHref} />}
          variant="link"
        >
          Histórico de recibos
          <ArrowRight className="size-3" />
        </Button>
      )}
    </div>
  );
};
