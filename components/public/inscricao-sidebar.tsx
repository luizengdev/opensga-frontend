import {ArrowRight} from "lucide-react";

export const InscricaoSidebar = () => {
  return (
    <aside className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-slate-900">
          Como ingressar em 3 etapas
        </h2>
        <p className="text-xs text-slate-500">
          Fluxo de matrícula da Nexa University: cadastro, escolha do curso com
          mensalidade ativa e confirmação no Stripe.
        </p>
      </div>
      <div className="relative ml-2.5 space-y-6 border-l border-slate-200 pl-5">
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-4 ring-slate-50">
            1
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Cadastro do candidato
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Nome, e-mail, CPF, telefone e data de nascimento para gerar o
            vínculo acadêmico.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-4 ring-slate-50">
            2
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Modalidade e curso
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Primeiro escolha Presencial ou EAD; em seguida, o combo lista só os
            cursos daquela modalidade.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-4 ring-slate-50">
            3
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Checkout e matrícula
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Assinatura mensal com isenção de 100% na primeira fatura. A
            matrícula fica pré-matriculada até o Stripe confirmar o pagamento.
          </p>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-xs font-medium text-blue-900">
          Sobre a primeira mensalidade
        </p>
        <p className="text-xs leading-relaxed text-blue-700">
          O cartão é cadastrado no checkout. A taxa de inscrição não é cobrada:
          o cupom institucional zera a primeira fatura.
        </p>
        <p className="flex items-center gap-1 pt-1 text-xs font-medium text-blue-800">
          Continuar para o Stripe
          <ArrowRight className="size-3" />
        </p>
      </div>
    </aside>
  );
};
