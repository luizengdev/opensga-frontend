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
import {formatCorteNota, formatPercentualRegra} from "@/lib/academic/regulamento";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Parametrizacoes} from "@/lib/api/fetch-generated";
import {getGetParametrizacoesQueryKey, useUpdateParametrizacoes} from "@/lib/api/rc-generated";

const avaliacaoSchema = z
  .object({
    corteAprovacaoDireta: z.number().min(0).max(10),
    corteMediaFinal: z.number().min(0).max(10),
    limiteFaltasPercentual: z.number().min(1).max(50),
  })
  .refine((payload) => payload.corteAprovacaoDireta >= payload.corteMediaFinal, {
    message: "O corte de aprovação direta não pode ser inferior ao da média final.",
    path: ["corteAprovacaoDireta"],
  });

type AvaliacaoFormValues = z.infer<typeof avaliacaoSchema>;

interface ParametrizacoesAvaliacaoFormProps {
  parametros: Parametrizacoes;
}

export const ParametrizacoesAvaliacaoForm = ({parametros}: ParametrizacoesAvaliacaoFormProps) => {
  const queryClient = useQueryClient();
  const {mutate: salvar, isPending} = useUpdateParametrizacoes();
  const form = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {
      corteAprovacaoDireta: parametros.corteAprovacaoDireta,
      corteMediaFinal: parametros.corteMediaFinal,
      limiteFaltasPercentual: parametros.limiteFaltasPercentual,
    },
  });

  useEffect(() => {
    form.reset({
      corteAprovacaoDireta: parametros.corteAprovacaoDireta,
      corteMediaFinal: parametros.corteMediaFinal,
      limiteFaltasPercentual: parametros.limiteFaltasPercentual,
    });
  }, [form, parametros]);

  const onSubmit = form.handleSubmit((payload) => {
    salvar(payload, {
      onSuccess: (atualizado) => {
        toast.success(
          `Regulamento atualizado. NS ≥ ${formatCorteNota(atualizado.corteAprovacaoDireta)} aprova; MF ≥ ${formatCorteNota(atualizado.corteMediaFinal)}; RF acima de ${formatPercentualRegra(atualizado.limiteFaltasPercentual)} de faltas.`,
        );
        void queryClient.invalidateQueries({queryKey: getGetParametrizacoesQueryKey()});
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulamento de avaliação</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              A fórmula NS = MAX(AV, AVS) permanece. Diários já fechados não são recalculados.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="corteAprovacaoDireta"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Corte de aprovação direta</FormLabel>
                    <FormControl>
                      <Input
                        max={10}
                        min={0}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        ref={field.ref}
                        step="0.1"
                        type="number"
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>NS neste valor ou acima aprova no fechamento.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="corteMediaFinal"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Corte da média final (AV3)</FormLabel>
                    <FormControl>
                      <Input
                        max={10}
                        min={0}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        ref={field.ref}
                        step="0.1"
                        type="number"
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>MF = (NS + AV3) / 2. Aprovado se MF atingir este corte.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limiteFaltasPercentual"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Limite de faltas (%)</FormLabel>
                    <FormControl>
                      <Input
                        max={50}
                        min={1}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        ref={field.ref}
                        step="1"
                        type="number"
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>Faltas acima deste percentual da CH geram RF soberano.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={isPending} type="submit">
              {isPending ? "Salvando..." : "Salvar regulamento"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
