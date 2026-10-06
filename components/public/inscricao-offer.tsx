"use client";

import {useState} from "react";

import {InscricaoOfferHero} from "@/components/public/inscricao-offer-hero";
import {InscricaoOfferPanel} from "@/components/public/inscricao-offer-panel";
import {InscricaoQueryProvider} from "@/components/public/inscricao-query-provider";
import {InscricaoSuccess} from "@/components/public/inscricao-success";
import type {CatalogoCurso, InscricaoAcesso} from "@/lib/api/fetch-generated";

interface InscricaoOfferProps {
  catalogo: CatalogoCurso[];
  curso: CatalogoCurso;
}

export const InscricaoOffer = ({catalogo, curso}: InscricaoOfferProps) => {
  const [acesso, setAcesso] = useState<InscricaoAcesso | null>(null);

  return (
    <InscricaoQueryProvider>
      {acesso ? (
        <div className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <InscricaoSuccess variant="isento" acesso={acesso} />
          </div>
        </div>
      ) : (
        <>
          <InscricaoOfferHero curso={curso} />
          <div className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-7xl items-start gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <p className="text-xs font-medium tracking-wider text-blue-600 uppercase">
                  Home / Inscrição / Graduação / {curso.nome}
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {`Curso de ${curso.nome}.`}
                </h2>
                <p className="max-w-xl text-sm text-slate-500">
                  Escolha o campus da oferta, confira a mensalidade cadastrada no sistema e conclua a inscrição. Cobrança agora, se houver, aceita cartão ou boleto.
                </p>
              </div>
              <div className="lg:col-span-5">
                <InscricaoOfferPanel
                  catalogo={catalogo}
                  curso={curso}
                  onInscricaoConcluida={setAcesso}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </InscricaoQueryProvider>
  );
};
