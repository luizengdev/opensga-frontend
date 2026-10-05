import {GraduationCap} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

import {PUBLIC_COURSES} from "@/lib/public/courses";

export const PublicFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-sm text-slate-500">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
              <GraduationCap className="size-4" />
            </span>
            <span className="font-sans text-base font-bold text-slate-900">
              Nexa University
            </span>
          </div>
          <p className="leading-relaxed">
            Formando líderes de negócios, engenharia e tecnologia para a
            economia global com excelência acadêmica.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium text-slate-900">Graduação</h2>
          <ul className="space-y-1">
            {PUBLIC_COURSES.map((course) => (
              <li key={course.id}>{course.name}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium text-slate-900">Portais e acesso</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/login-aluno"
                className="text-slate-500 hover:text-blue-600"
              >
                Área do aluno
              </Link>
            </li>
            <li>
              <Link
                href="/login-admin"
                className="text-slate-500 hover:text-blue-600"
              >
                Acesso interno
              </Link>
            </li>
            <li>
              <Link
                href="/inscricao"
                className="text-slate-500 hover:text-blue-600"
              >
                Ficha de inscrição
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium text-slate-900">Campus e contato</h2>
          <p>Av. Faria Lima, 3400 — Itaim Bibi, São Paulo - SP</p>
          <p>Central de atendimento: 0800 720 4000</p>
          <p>admissoes@nexauniversity.edu.br</p>
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 px-4 pt-8 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p>
          {`© ${dayjs().format("YYYY")} Nexa University. Todos os direitos reservados. Credenciada com nota máxima pelo Ministério da Educação (MEC).`}
        </p>
        <p>Termos de uso · Privacidade e LGPD · Ouvidoria</p>
      </div>
    </footer>
  );
};
