"use client";

import {GraduationCap, User} from "lucide-react";
import {motion} from "motion/react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  {href: "/#institucional", label: "A instituição"},
  {href: "/#cursos", label: "Graduação"},
  {href: "/#diferenciais", label: "Diferenciais Nexa"},
  {href: "/#estudantes", label: "Egressos"},
];

export const PublicNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <motion.span
            className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            whileHover={{scale: 1.06}}
            transition={{type: "spring", stiffness: 400, damping: 22}}
          >
            <GraduationCap className="size-5" />
          </motion.span>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text font-sans text-xl font-bold tracking-tight text-transparent">
            Nexa
            <span className="font-sans font-medium text-blue-600">
              University
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="text-slate-600 hover:bg-transparent hover:text-blue-600"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            className="rounded-full bg-blue-600 px-5 text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            nativeButton={false}
            render={<Link href="/inscricao" />}
          >
            Inscreva-se
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                />
              }
            >
              <User data-icon="inline-start" />
              Acessar portais
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuItem render={<Link href="/login-aluno" />}>
                <GraduationCap />
                Área do aluno
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/login-admin" />}>
                <User />
                Acesso interno
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
