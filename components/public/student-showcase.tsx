"use client";

import {Award, CheckCircle2, Quote} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import Link from "next/link";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {STUDENT_STORIES, type StudentStory} from "@/lib/public/student-stories";

export const StudentShowcase = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentStory | null>(
    STUDENT_STORIES[0] ?? null,
  );

  const featured = selectedStudent ?? STUDENT_STORIES[0];

  if (!featured) {
    return null;
  }

  return (
    <section
      id="estudantes"
      className="relative overflow-hidden border-t border-slate-800 bg-slate-900 py-20 text-white sm:py-28"
    >
      <div className="pointer-events-none absolute top-0 right-1/4 size-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 size-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-16 max-w-3xl space-y-4 text-center"
          initial={{opacity: 0, y: 24}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.2}}
          transition={{duration: 0.55, ease: "easeOut"}}
        >
          <p className="inline-flex rounded-full border border-blue-800/40 bg-blue-950/60 px-3 py-1 text-xs font-medium tracking-widest text-blue-400 uppercase">
            Comunidade de líderes e egressos
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trajetórias que inspiram a próxima geração
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            Conheça quem já viveu a experiência Nexa e hoje lidera equipes em
            unicórnios, bancos globais e empresas de vanguarda.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-800/90 p-6 sm:p-10 lg:col-span-7">
            <Quote className="absolute top-6 right-6 size-12 text-blue-500/20" />
            <AnimatePresence mode="wait">
              <motion.div
                key={featured.id}
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -12}}
                transition={{duration: 0.28, ease: "easeOut"}}
              >
                <div className="flex flex-col items-center gap-6 border-b border-slate-700/60 pb-6 sm:flex-row sm:items-start">
                  <div className="relative shrink-0">
                    <div
                      className={`flex size-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-tr font-heading text-3xl font-medium text-white shadow-lg shadow-blue-900/30 ${featured.avatarBg}`}
                    >
                      {featured.initials}
                    </div>
                    <span className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-2 border-slate-800 bg-emerald-500 text-white">
                      <CheckCircle2 className="size-4" />
                    </span>
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                        {featured.name}
                      </h3>
                      <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                        {featured.badge}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-300">
                      {featured.role} na {featured.company}
                    </p>
                    <p className="pt-1 text-xs text-slate-400">
                      {featured.course} · {featured.year}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 py-6">
                  <p className="text-base leading-relaxed text-slate-200 italic sm:text-lg">
                    {`"${featured.quote}"`}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-blue-800/40 bg-blue-950/40 p-2.5 text-xs text-blue-300">
                    <Award className="size-4 shrink-0 text-blue-400" />
                    <span>
                      Impacto de carreira:{" "}
                      <strong className="font-medium text-white">
                        {featured.impactMetric}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
                  <span className="text-xs text-slate-400">
                    Quer construir um perfil executivo como este?
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:bg-transparent hover:text-blue-300"
                    nativeButton={false}
                    render={<Link href="/inscricao" />}
                  >
                    Iniciar processo seletivo
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="space-y-3 lg:col-span-5">
            <p className="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
              Selecione para ver a história
            </p>
            {STUDENT_STORIES.map((student) => {
              const isSelected = featured.id === student.id;

              return (
                <Button
                  key={student.id}
                  type="button"
                  variant="ghost"
                  aria-pressed={isSelected}
                  className={`h-auto w-full gap-4 justify-start whitespace-normal rounded-2xl border p-4 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:translate-y-0 ${
                    isSelected
                      ? "translate-x-1 border-blue-500 bg-slate-800 text-white shadow-md shadow-blue-900/20 hover:bg-slate-800 hover:text-white focus-visible:border-blue-500 focus-visible:shadow-md focus-visible:shadow-blue-900/20"
                      : "border-slate-700/50 bg-slate-800/40 text-slate-200 hover:border-slate-600 hover:bg-slate-800/70 hover:text-slate-200 focus-visible:border-slate-700/50"
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-base font-bold text-white shadow-inner ${student.avatarBg}`}
                  >
                    {student.initials}
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="flex items-center justify-between">
                      <span className="truncate text-sm font-bold text-white">
                        {student.name}
                      </span>
                      {isSelected ? (
                        <span className="rounded bg-blue-900/50 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                          Ativo
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-slate-300">
                      {student.role} · {student.company}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {student.course}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
