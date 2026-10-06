"use client";

import {BookOpen, FileText, Lightbulb, Repeat} from "lucide-react";

import {Button} from "@/components/ui/button";
import {INGRESSO_OPTIONS, type FormaIngresso} from "@/lib/public/catalog";

const ICONS = {
  VESTIBULAR: BookOpen,
  ENEM: FileText,
  DIPLOMA: Lightbulb,
  TRANSFERENCIA: Repeat,
};

interface InscricaoIngressoOptionsProps {
  value?: FormaIngresso;
  onChange: (value: FormaIngresso) => void;
}

export const InscricaoIngressoOptions = ({
  value,
  onChange,
}: InscricaoIngressoOptionsProps) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Formas de ingresso
        </p>
        <p className="mt-1 text-xs text-slate-500">
          A opção orienta o candidato. O checkout de matrícula segue o curso
          escolhido na API.
        </p>
      </div>
      <div className="space-y-2">
        {INGRESSO_OPTIONS.map((option) => {
          const Icon = ICONS[option.value];
          const selected = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant={selected ? "secondary" : "outline"}
              className={
                selected
                  ? "h-auto w-full items-start justify-start gap-3 rounded-xl border-blue-200 bg-blue-50 p-4 text-left"
                  : "h-auto w-full items-start justify-start gap-3 rounded-xl p-4 text-left"
              }
              onClick={() => onChange(option.value)}
            >
              <Icon className="mt-0.5 size-5 text-slate-700" />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-slate-900">
                  {option.label}
                </span>
                <span className="block text-xs font-normal text-slate-500">
                  {option.description}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
