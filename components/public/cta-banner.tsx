import Link from "next/link";

import {MotionReveal} from "@/components/public/motion-reveal";
import {Button} from "@/components/ui/button";

export const CtaBanner = () => {
  return (
    <section className="bg-slate-900 py-16 text-white">
      <MotionReveal className="mx-auto w-full max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
          Pronto para acelerar sua trajetória acadêmica?
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base">
          Garanta sua vaga no processo seletivo da Nexa University e descubra
          como uma formação executiva transforma o seu futuro.
        </p>
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            className="rounded-full bg-blue-600 px-8 text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            nativeButton={false}
            render={<Link href="/inscricao" />}
          >
            Fazer inscrição agora
          </Button>
        </div>
      </MotionReveal>
    </section>
  );
};
