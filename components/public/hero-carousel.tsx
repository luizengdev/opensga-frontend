"use client";

import {Building2, ChevronLeft, ChevronRight} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import Link from "next/link";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {CAROUSEL_SLIDES} from "@/lib/public/carousel-slides";

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = CAROUSEL_SLIDES[currentSlide];

  const goToPrevious = () => {
    setCurrentSlide((previous) =>
      previous === 0 ? CAROUSEL_SLIDES.length - 1 : previous - 1,
    );
  };

  const goToNext = () => {
    setCurrentSlide((previous) => (previous + 1) % CAROUSEL_SLIDES.length);
  };

  if (!slide) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <motion.div
          className="space-y-6 text-center lg:col-span-6 lg:text-left"
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, ease: "easeOut"}}
        >
          <p className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
            Conexão com a próxima geração
          </p>
          <h1 className="font-heading text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Formando líderes para a economia global.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
            Na Nexa University, unimos excelência acadêmica tradicional com a
            tecnologia de gestão mais inovadora do mercado para projetar o seu
            sucesso corporativo.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
            <Button
              size="lg"
              className="bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              nativeButton={false}
              render={<Link href="#cursos" />}
            >
              Conheça nossos cursos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500 hover:bg-slate-900 hover:text-white"
              nativeButton={false}
              render={<Link href="/inscricao" />}
            >
              Processo seletivo
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6 text-left">
            <div>
              <p className="font-heading text-2xl font-bold text-white">94%</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Empregabilidade em 6 meses
              </p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">
                Nota 5
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Conceito máximo MEC
              </p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">120+</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Parcerias corporativas
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="w-full lg:col-span-6"
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.12, ease: "easeOut"}}
        >
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />
            <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.tag}
                  className="flex min-h-0 flex-1 flex-col justify-between"
                  initial={{opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -16}}
                  transition={{duration: 0.3, ease: "easeOut"}}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded border border-blue-800/40 bg-blue-950/60 px-2.5 py-1 text-xs font-medium tracking-widest text-blue-400 uppercase">
                      {slide.tag}
                    </span>
                    <p className="font-mono text-xs text-slate-400">
                      {currentSlide + 1} / {CAROUSEL_SLIDES.length}
                    </p>
                  </div>
                  <div className="mt-auto space-y-3">
                    <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {slide.title}
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-slate-300">
                      {slide.desc}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                      <Building2 className="size-3.5 text-blue-400" />
                      <span>{slide.highlight}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                <div className="flex gap-2">
                  {CAROUSEL_SLIDES.map((item, index) => (
                    <Button
                      key={item.tag}
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Ir para slide ${index + 1}`}
                      className={
                        currentSlide === index
                          ? "h-1.5 w-8 rounded-full bg-blue-600 hover:bg-blue-600"
                          : "h-1.5 w-2 rounded-full bg-slate-700 hover:bg-slate-600"
                      }
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    aria-label="Slide anterior"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    aria-label="Próximo slide"
                    onClick={goToNext}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
