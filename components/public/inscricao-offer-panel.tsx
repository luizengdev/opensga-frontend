"use client";

import {BadgePercent} from "lucide-react";
import {useMemo, useState} from "react";

import {InscricaoForm} from "@/components/public/inscricao-form";
import {InscricaoOfferStepper} from "@/components/public/inscricao-offer-stepper";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {CatalogoCurso} from "@/lib/api/fetch-generated";
import {
  formatCatalogPrice,
  listCampusOfertas,
  listEstados,
} from "@/lib/public/catalog";

interface InscricaoOfferPanelProps {
  catalogo: CatalogoCurso[];
  curso: CatalogoCurso;
}

export const InscricaoOfferPanel = ({
  catalogo,
  curso,
}: InscricaoOfferPanelProps) => {
  const ofertas = useMemo(() => {
    return listCampusOfertas(catalogo, curso);
  }, [catalogo, curso]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [estado, setEstado] = useState(curso.campus.estado);
  const [cursoId, setCursoId] = useState(curso.cursoId);

  const selected = ofertas.find((item) => item.cursoId === cursoId) ?? curso;
  const estados = listEstados(ofertas);

  const estadoItems = [
    {label: "Estado", value: null},
    ...estados.map((item) => ({label: item, value: item})),
  ];
  const campusItems = [
    {label: "Polo/Unidade", value: null},
    ...ofertas
      .filter((item) => item.campus.estado === estado)
      .map((item) => ({
        label: `${item.campus.nome} · ${item.campus.cidade}`,
        value: item.cursoId,
      })),
  ];

  const confirmUnit = () => {
    if (!estado || !cursoId) {
      return;
    }

    setStep(2);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-6">
      {step < 3 ? (
        <InscricaoOfferStepper
          current={step}
          labels={["Selecione sua unidade", "Confira a melhor oferta", "Inscreva-se"]}
        />
      ) : (
        <InscricaoOfferStepper
          current={3}
          labels={["Curso", "Dados", "Inscrição"]}
        />
      )}
      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Curso com mensalidade ativa no catálogo Nexa
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Estado</p>
            <Select
              items={estadoItems}
              value={estado || null}
              onValueChange={(value) => {
                const nextEstado = value ?? "";
                setEstado(nextEstado);
                const firstCampus = ofertas.find(
                  (item) => item.campus.estado === nextEstado,
                );
                setCursoId(firstCampus?.cursoId ?? "");
              }}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {estadoItems.map((item) => (
                    <SelectItem key={item.value ?? "estado"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Polo/Unidade</p>
            <Select
              items={campusItems}
              value={cursoId || null}
              onValueChange={(value) => {
                const nextId = value ?? "";
                setCursoId(nextId);
              }}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {campusItems.map((item) => (
                    <SelectItem key={item.value ?? "campus"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={confirmUnit}
            disabled={!estado || !cursoId}
          >
            Ver minha oferta
          </Button>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            <BadgePercent className="size-4" />
            Oferta especial — 1ª mensalidade
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Primeira mensalidade:</p>
            <p className="font-heading text-3xl font-bold text-emerald-600">
              {formatCatalogPrice(0, selected.moeda)}
            </p>
            <p className="mt-3 text-sm text-slate-500">Demais mensalidades:</p>
            <p className="font-heading text-2xl font-bold text-slate-900">
              {formatCatalogPrice(selected.valor, selected.moeda)}
              <span className="text-sm font-medium text-slate-500">/mês</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              A taxa de inscrição é isenta pelo cupom institucional na primeira
              fatura. O valor acima é a mensalidade cadastrada no OpenSGA.
            </p>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                {`${selected.campus.cidade} - ${selected.campus.estado}`}
              </p>
              <p className="text-xs text-slate-500">{selected.campus.nome}</p>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-blue-600"
              onClick={() => setStep(1)}
            >
              Trocar
            </Button>
          </div>
          <Button
            className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setStep(3)}
          >
            Inscreva-se
          </Button>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="mt-6">
          <InscricaoForm curso={selected} onBack={() => setStep(2)} />
        </div>
      ) : null}
    </div>
  );
};
