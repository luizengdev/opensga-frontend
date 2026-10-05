import {CheckCircle} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import type {InscricaoAcesso} from "@/lib/api/fetch-generated";

interface InscricaoSuccessProps {
  email?: string;
  variant?: "isento" | "pagamento";
  acesso?: InscricaoAcesso | null;
}

export const InscricaoSuccess = ({
  email,
  variant = "pagamento",
  acesso,
}: InscricaoSuccessProps) => {
  const isIsento = variant === "isento";
  const loginEmail = acesso?.email ?? email;

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          {isIsento ? "Inscrição recebida" : "Pagamento em andamento"}
        </h1>
        <p className="text-sm text-slate-500">
          {isIsento
            ? "A primeira mensalidade está isenta. Sua pré-matrícula foi registrada sem cobrança de cartão. A mensalidade seguinte será uma fatura pendente no próximo ciclo."
            : "Se você pagou com cartão, a confirmação é imediata. Se escolheu boleto, pague o voucher em até 3 dias; a matrícula só é efetivada depois do pagamento."}
        </p>
      </div>
      {isIsento ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-sm font-medium text-slate-900">Acesso à área do aluno</p>
          {acesso ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="text-slate-500">E-mail: </span>
                {acesso.email}
              </p>
              <p>
                <span className="text-slate-500">Registro Acadêmico (RA): </span>
                <span className="font-mono text-slate-900">{acesso.ra}</span>
              </p>
              <p>
                <span className="text-slate-500">Senha provisória: </span>
                {acesso.senhaProvisoria ? (
                  <span className="font-mono text-base font-semibold text-blue-700">
                    {acesso.senhaProvisoria}
                  </span>
                ) : (
                  <span>use a senha já enviada ao seu e-mail</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              As credenciais foram enviadas
              {loginEmail ? ` para ${loginEmail}` : " para o e-mail informado na ficha"}.
            </p>
          )}
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            No primeiro acesso, troque a senha provisória. Você também recebe estes dados por e-mail.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-500">
          <p className="font-medium text-slate-900">Próximos passos</p>
          <p>
            1. As credenciais de acesso serão enviadas
            {loginEmail ? ` para ${loginEmail}` : " para o e-mail informado na ficha"}.
          </p>
          <p>
            2. No primeiro acesso, troque a senha. Pix não está disponível neste ciclo: use cartão
            ou boleto.
          </p>
        </div>
      )}
      <div className="flex gap-3">
        <Button
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          nativeButton={false}
          render={<Link href="/login-aluno" />}
        >
          Acessar área do aluno
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          Voltar para home
        </Button>
      </div>
    </div>
  );
};
