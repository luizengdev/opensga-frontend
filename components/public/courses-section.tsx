"use client";

import {Check, Clock} from "lucide-react";
import Link from "next/link";

import {MotionReveal} from "@/components/public/motion-reveal";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import type {CourseCategory, PublicCourse} from "@/lib/public/courses";
import {PUBLIC_COURSES} from "@/lib/public/courses";
import {useState} from "react";

const CATEGORY_FILTERS: {id: "all" | CourseCategory; label: string}[] = [
  {id: "all", label: "Todos"},
  {id: "tech", label: "Tecnologia"},
  {id: "business", label: "Negócios"},
  {id: "eng", label: "Engenharias"},
];

export const CoursesSection = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | CourseCategory>(
    "all",
  );
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(
    null,
  );

  const filteredCourses =
    activeCategory === "all"
      ? PUBLIC_COURSES
      : PUBLIC_COURSES.filter((course) => course.category === activeCategory);

  return (
    <section id="cursos" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <MotionReveal>
            <p className="text-xs font-medium tracking-wider text-blue-600 uppercase">
              Catálogo acadêmico
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cursos de graduação
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Currículos desenhados para tecnologia, mercado financeiro e
              liderança corporativa.
            </p>
          </MotionReveal>
          <div className="flex flex-wrap items-center gap-1 self-start rounded-lg bg-slate-100 p-1 md:self-auto">
            {CATEGORY_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                size="sm"
                variant={activeCategory === filter.id ? "secondary" : "ghost"}
                onClick={() => setActiveCategory(filter.id)}
              >
                {filter.label}
                {filter.id === "all" ? ` (${PUBLIC_COURSES.length})` : null}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 ring-0 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col justify-between space-y-4 px-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{course.categoryLabel}</span>
                    <Badge
                      variant="outline"
                      className="h-auto rounded border-transparent bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 shadow-none hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-0"
                    >
                      {course.mecScore}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    {course.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {course.description}
                  </p>
                  <div className="space-y-1.5 border-t border-slate-100 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="size-3.5" />
                      <span>Duração: {course.duration}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Média salarial inicial:{" "}
                      <span className="font-medium text-slate-900">
                        {course.salaryAvg}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                      Destaques da grade
                    </p>
                    {course.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-center gap-1.5 text-xs text-slate-500"
                      >
                        <Check className="size-3.5 shrink-0 text-blue-600" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900"
                    onClick={() => setSelectedCourse(course)}
                  >
                    Ver matriz curricular
                  </Button>
                  <Button
                    size="sm"
                    className="bg-slate-900 text-white hover:bg-blue-600"
                    nativeButton={false}
                    render={<Link href={`/inscricao?curso=${course.id}`} />}
                  >
                    Inscrever-se
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Dialog
        open={Boolean(selectedCourse)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCourse(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl" showCloseButton>
          {selectedCourse ? (
            <>
              <DialogHeader>
                <p className="text-xs font-medium tracking-wider text-blue-600 uppercase">
                  {selectedCourse.categoryLabel}
                </p>
                <DialogTitle className="font-heading text-2xl font-bold">
                  {selectedCourse.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedCourse.description}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div>
                  <span className="block text-slate-500">Duração</span>
                  <span className="font-medium text-slate-900">
                    {selectedCourse.duration}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Avaliação MEC</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedCourse.mecScore}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Modalidade</span>
                  <span className="font-medium text-slate-900">
                    {selectedCourse.modality}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">
                    Média salarial inicial
                  </span>
                  <span className="font-medium text-slate-900">
                    {selectedCourse.salaryAvg}
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {selectedCourse.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <Check className="size-4 shrink-0 text-blue-600" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <DialogFooter>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  nativeButton={false}
                  render={
                    <Link href={`/inscricao?curso=${selectedCourse.id}`} />
                  }
                >
                  Iniciar inscrição neste curso
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};
