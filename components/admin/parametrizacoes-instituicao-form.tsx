"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {formatPercentualRegra} from "@/lib/academic/regulamento";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Parametrizacoes} from "@/lib/api/fetch-generated";
import {getGetParametrizacoesQueryKey, useUpdateParametrizacoes} from "@/lib/api/rc-generated";

const instituicaoSchema = z.object({
  nomeIes: z.string().min(3).max(120),
  siglaIes: z.string().min(2).max(20),
  mantenedora: z.string().max(200),
  cnpj: z
    .string()
    .max(18)
    .refine((valor) => valor.length === 0 || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(valor), {
      message: "Use o formato 00.000.000/0000-00 ou deixe em branco.",
    }),
  percentualMinimoExtensao: z.number().min(10).max(50),
});

type InstituicaoFormValues = z.infer<typeof instituicaoSchema>;

interface ParametrizacoesInstituicaoFormProps {
  parametros: Parametrizacoes;
}

export const ParametrizacoesInstituicaoForm = ({
  parametros,
}: ParametrizacoesInstituicaoFormProps) => {
  const queryClient = useQueryClient();
  const {mutate: salvar, isPending} = useUpdateParametrizacoes();
  const form = useForm<InstituicaoFormValues>({
    resolver: zodResolver(instituicaoSchema),
    defaultValues: {
      nomeIes: parametros.nomeIes,
      siglaIes: parametros.siglaIes,
      mantenedora: parametros.mantenedora,
      cnpj: parametros.cnpj,
      percentualMinimoExtensao: parametros.percentualMinimoExtensao,
    },
  });

  useEffect(() => {
    form.reset({
      nomeIes: parametros.nomeIes,
      siglaIes: parametros.siglaIes,
      mantenedora: parametros.mantenedora,
      cnpj: parametros.cnpj,
      percentualMinimoExtensao: parametros.percentualMinimoExtensao,
    });
  }, [form, parametros]);

  const onSubmit = form.handleSubmit((payload) => {
    salvar(payload, {
      onSuccess: (atualizado) => {
        toast.success(
          `Identidade de ${atualizado.siglaIes} salva. Meta de extensão: ${formatPercentualRegra(atualizado.percentualMinimoExtensao)}.`,
        );
        void queryClient.invalidateQueries({queryKey: getGetParametrizacoesQueryKey()});
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidade institucional e extensão</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nomeIes"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome da IES</FormLabel>
                    <FormControl>
                      <Input maxLength={120} {...field} />
                    </FormControl>
                    <FormDescription>Disponível nos documentos como {"{{ies.nome}}"}.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siglaIes"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Sigla</FormLabel>
                    <FormControl>
                      <Input maxLength={20} {...field} />
                    </FormControl>
                    <FormDescription>Placeholder {"{{ies.sigla}}"}.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mantenedora"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Mantenedora</FormLabel>
                    <FormControl>
                      <Input maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input maxLength={18} placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="percentualMinimoExtensao"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Meta mínima de extensão curricular (%)</FormLabel>
                  <FormControl>
                    <Input
                      max={50}
                      min={10}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      ref={field.ref}
                      step="1"
                      type="number"
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Piso legal da Resolução CNE/CES nº 7/2018 é 10%. A IES pode exigir mais, nunca menos.
                    A auditoria das matrizes usa este percentual.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={isPending} type="submit">
              {isPending ? "Salvando..." : "Salvar identidade"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
