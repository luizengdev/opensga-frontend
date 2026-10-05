"use client";

import {useMutation, useQuery} from "@tanstack/react-query";

import {
  createInscricao,
  getCatalogoCursos,
  type CatalogoCurso,
  type CreateInscricaoInput,
} from "@/lib/api/fetch-generated";

export const getGetCatalogoCursosQueryKey = () => {
  return ["/api/catalogo"] as const;
};

export const useGetCatalogoCursos = (options?: {
  query?: {initialData?: CatalogoCurso[]};
}) => {
  return useQuery({
    queryKey: getGetCatalogoCursosQueryKey(),
    queryFn: getCatalogoCursos,
    initialData: options?.query?.initialData,
  });
};

export const useCreateInscricao = () => {
  return useMutation({
    mutationFn: (data: CreateInscricaoInput) => createInscricao(data),
  });
};
