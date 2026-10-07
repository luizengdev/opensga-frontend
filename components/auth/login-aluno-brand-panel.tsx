import {NexaUniversityMark} from "@/components/auth/nexa-university-mark";
export const LoginAlunoBrandPanel = () => {
  return (
    <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:w-[46%] xl:w-1/2">
      <div className="pointer-events-none absolute -top-24 -right-16 size-[28rem] rounded-full bg-sidebar-accent/80" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-[24rem] rounded-full bg-sidebar-primary/10" />
      <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-14 xl:px-16">
        <div className="flex flex-col gap-3">
          <NexaUniversityMark tone="inverse" />
          <span className="font-mono text-[10px] tracking-wider text-sidebar-foreground/70 uppercase">
            Portal do aluno · OpenSGA
          </span>
        </div>

        <div className="max-w-md space-y-4">
          <p className="font-heading text-4xl font-medium tracking-tight text-balance xl:text-5xl">
            Seu semestre, em um só lugar.
          </p>
          <p className="text-sm leading-relaxed text-sidebar-foreground/75">
            Notas, frequência e mensalidades — o acompanhamento da sua vida
            acadêmica, sem cara de secretaria.
          </p>
        </div>

        <p className="font-mono text-[11px] tracking-wide text-sidebar-foreground/55">
          Alunos e responsáveis no mesmo acesso
        </p>
      </div>
    </aside>
  );
};
