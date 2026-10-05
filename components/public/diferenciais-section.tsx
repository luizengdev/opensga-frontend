import {
  Briefcase,
  Compass,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";

import {MotionReveal} from "@/components/public/motion-reveal";
import {Card, CardContent} from "@/components/ui/card";
import {DIFERENCIAIS, type Diferencial} from "@/lib/public/diferenciais";

const ICON_MAP: Record<Diferencial["icon"], LucideIcon> = {
  trophy: Trophy,
  target: Target,
  compass: Compass,
  briefcase: Briefcase,
  sparkles: Sparkles,
  shield: ShieldCheck,
};

export const DiferenciaisSection = () => {
  return (
    <section
      id="diferenciais"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <MotionReveal className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
        <p className="text-xs font-medium tracking-wider text-blue-600 uppercase">
          Excelência acadêmica e corporativa
        </p>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Por que escolher a Nexa University?
        </h2>
        <p className="text-base leading-relaxed text-slate-500">
          Unimos pilares de negócios rígidos para entregar o ecossistema
          educacional mais maduro do ensino privado brasileiro.
        </p>
      </MotionReveal>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {DIFERENCIAIS.map((item, index) => {
          const Icon = ICON_MAP[item.icon];

          return (
            <MotionReveal key={item.title} delay={index * 0.08}>
              <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-0 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300">
                <CardContent className="space-y-4 px-0">
                  <span
                    className={`flex size-10 items-center justify-center rounded-lg ${item.iconClassName}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                  <p
                    className={`text-xs font-medium ${item.footnoteClassName}`}
                  >
                    {item.footnote}
                  </p>
                </CardContent>
              </Card>
            </MotionReveal>
          );
        })}
      </div>
    </section>
  );
};
