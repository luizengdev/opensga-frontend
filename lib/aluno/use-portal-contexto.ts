"use client";

import {useSearchParams} from "next/navigation";

import {useGetPortalContexto} from "@/lib/api/rc-generated";
import type {PortalContexto} from "@/lib/api/fetch-generated";

export const usePortalAluno = (initialData: PortalContexto) => {
  const searchParams = useSearchParams();
  const alunoId = searchParams.get("alunoId") ?? initialData.alunoId ?? undefined;
  const {data} = useGetPortalContexto({
    alunoId,
    query: {initialData},
  });

  return {
    alunoId,
    contexto: data ?? initialData,
  };
};
