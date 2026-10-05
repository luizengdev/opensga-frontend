import {CheckCircle} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";

interface InscricaoSuccessProps {
  email?: string;
}

export const InscricaoSuccess = ({email}: InscricaoSuccessProps) => {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Pagamento iniciado
        </h1>
        <p className="text-sm text-slate-500">
          Recebemos o método de pagamento. A primeira fatura é isenta e a
          matrícula será confirmada assim que o Stripe notificar a instituição.
        </p>
      </div>
      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-500">
        <p className="font-medium text-slate-900">Próximos passos</p>
        <p>
          1. As credenciais de acesso serão enviadas
          {email ? ` para ${email}` : " para o e-mail informado na ficha"}.
        </p>
        <p>2. As mensalidades seguintes seguem o valor do curso escolhido.</p>
      </div>
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
