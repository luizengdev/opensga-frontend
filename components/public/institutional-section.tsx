import {Check} from "lucide-react";
import Link from "next/link";

import {MotionReveal} from "@/components/public/motion-reveal";
import {Button} from "@/components/ui/button";

export const InstitutionalSection = () => {
  return (
    <section
      id="institucional"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <MotionReveal className="space-y-6 lg:col-span-5">
          <p className="text-xs font-medium tracking-wider text-blue-600 uppercase">
            Tradição e visão de futuro
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Construída por quem transforma a indústria.
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            A Nexa University nasceu da inquietação de conselheiros de empresas
            que buscavam profissionais com sólida bagagem conceitual e domínio
            prático imediato de ferramentas de gestão e dados.
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Check className="size-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-medium text-slate-900">
                  Metodologia problem-based learning
                </h3>
                <p className="text-xs text-slate-500">
                  Resolução de problemas corporativos reais em cada semestre,
                  com apresentação para bancas executivas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Check className="size-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-medium text-slate-900">
                  Mentoria de carreira individualizada
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhamento trimestral com executivos de RH e conselheiros
                  das principais indústrias do país.
                </p>
              </div>
            </div>
          </div>
        </MotionReveal>
        <MotionReveal
          className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white sm:p-10 lg:col-span-7"
          delay={0.12}
        >
          <div className="pointer-events-none absolute -right-10 -bottom-10 size-64 rounded-full bg-blue-600/20 blur-3xl" />
          <h3 className="mb-6 font-heading text-xl font-bold">
            Impacto no ecossistema produtivo
          </h3>
          <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-5">
              <p className="font-heading text-3xl font-bold text-blue-400">
                R$ 8.400
              </p>
              <p className="text-xs font-medium text-slate-200">
                Salário médio inicial
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Primeira colocação de recém-formados em posições de tecnologia e
                liderança.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-5">
              <p className="font-heading text-3xl font-bold text-emerald-400">
                40+ horas
              </p>
              <p className="text-xs font-medium text-slate-200">
                Mentorias individuais
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Carga horária de orientação executiva no currículo obrigatório.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-5">
              <p className="font-heading text-3xl font-bold text-purple-400">
                85%
              </p>
              <p className="text-xs font-medium text-slate-200">
                Estágio no 3º ano
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Alunos inseridos em estágios de alta relevância antes da
                formatura.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-5">
              <p className="font-heading text-3xl font-bold text-amber-400">
                100%
              </p>
              <p className="text-xs font-medium text-slate-200">
                Docentes mestres e doutores
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Corpo acadêmico com produção científica e histórico executivo.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-400">
              Processo seletivo aberto para o próximo semestre letivo.
            </p>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              nativeButton={false}
              render={<Link href="/inscricao" />}
            >
              Inscrever no vestibular
            </Button>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
};
