import {ArrowRight} from "lucide-react";

export const InscricaoSidebar = () => {
  return (
    <aside className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-lg font-bold text-slate-900">
          Como ingressar em 4 etapas
        </h2>
        <p className="text-xs text-slate-500">
          Fluxo de admissão da Nexa University, pensado para reduzir burocracia
          e acelerar a análise do seu cadastro.
        </p>
      </div>
      <div className="relative ml-2.5 space-y-6 border-l border-slate-200 pl-5">
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-4 ring-slate-50">
            1
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Cadastro simplificado
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Preenchimento de dados básicos e escolha do curso de interesse.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-4 ring-slate-50">
            2
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Análise de nota ou vestibular
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Aproveitamento da nota do ENEM ou agendamento da prova online.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-4 ring-slate-50">
            3
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Upload de documentos
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Envio digitalizado direto pela esteira de admissões.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-[29px] top-0 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-4 ring-slate-50">
            4
          </span>
          <h3 className="text-sm font-medium text-slate-900">
            Matrícula e chave de acesso
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Confirmação e liberação das credenciais do ecossistema Nexa.
          </p>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-xs font-medium text-blue-900">
          Dúvidas com sua inscrição?
        </p>
        <p className="text-xs leading-relaxed text-blue-700">
          Consultores acadêmicos da Nexa podem orientar sobre bolsas de mérito,
          financiamento e aproveitamento de disciplinas.
        </p>
        <p className="flex items-center gap-1 pt-1 text-xs font-medium text-blue-800">
          Falar com um orientador
          <ArrowRight className="size-3" />
        </p>
      </div>
    </aside>
  );
};
