"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {useForm, useWatch} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminSelect} from "@/components/admin/admin-select";
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
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Parametrizacoes} from "@/lib/api/fetch-generated";
import {getGetParametrizacoesQueryKey, useUpdateParametrizacoes} from "@/lib/api/rc-generated";

const periodoSchema = z.object({
  periodoAutomatico: z.enum(["true", "false"]),
  anoLetivo: z.number().int().min(2020).max(2100),
  semestreLetivo: z.union([z.literal(1), z.literal(2)]),
});

type PeriodoFormValues = z.infer<typeof periodoSchema>;

interface ParametrizacoesPeriodoFormProps {
  parametros: Parametrizacoes;
}

export const ParametrizacoesPeriodoForm = ({parametros}: ParametrizacoesPeriodoFormProps) => {
  const queryClient = useQueryClient();
  const {mutate: salvar, isPending} = useUpdateParametrizacoes();
  const form = useForm<PeriodoFormValues>({
    resolver: zodResolver(periodoSchema),
    defaultValues: {
      periodoAutomatico: parametros.periodoAutomatico ? "true" : "false",
      anoLetivo: parametros.anoLetivo,
      semestreLetivo: parametros.semestreLetivo === 1 ? 1 : 2,
    },
  });

  useEffect(() => {
    form.reset({
      periodoAutomatico: parametros.periodoAutomatico ? "true" : "false",
      anoLetivo: parametros.anoLetivo,
      semestreLetivo: parametros.semestreLetivo === 1 ? 1 : 2,
    });
  }, [form, parametros]);

  const modoPeriodo = useWatch({control: form.control, name: "periodoAutomatico"});
  const automatico = modoPeriodo === "true";

  const onSubmit = form.handleSubmit((payload) => {
    const periodoAutomatico = payload.periodoAutomatico === "true";
    salvar(
      {
        periodoAutomatico,
        anoLetivo: payload.anoLetivo,
        semestreLetivo: payload.semestreLetivo,
      },
      {
        onSuccess: (atualizado) => {
          toast.success(
            periodoAutomatico
              ? `Período acompanha o calendário (${formatPeriodoLetivo(atualizado)}).`
              : `Virada registrada. O período vigente passou a ser ${formatPeriodoLetivo(atualizado)}.`,
          );
          void queryClient.invalidateQueries({queryKey: getGetParametrizacoesQueryKey()});
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Período letivo institucional</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="periodoAutomatico"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Modo de vigência</FormLabel>
                  <FormControl>
                    <AdminSelect
                      items={[
                        {value: "true", label: "Acompanhar o calendário civil"},
                        {value: "false", label: "Definir manualmente (virada de semestre)"},
                      ]}
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    No modo manual o header, os painéis e as ofertas padrão usam o par ano/semestre
                    gravado aqui até a próxima virada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="anoLetivo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Ano letivo</FormLabel>
                    <FormControl>
                      <Input
                        disabled={automatico}
                        min={2020}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        ref={field.ref}
                        type="number"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semestreLetivo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Semestre</FormLabel>
                    <FormControl>
                      <AdminSelect
                        disabled={automatico}
                        items={[
                          {value: "1", label: "1º semestre"},
                          {value: "2", label: "2º semestre"},
                        ]}
                        onValueChange={(value) => field.onChange(value === "1" ? 1 : 2)}
                        value={String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={isPending} type="submit">
              {isPending ? "Salvando..." : "Salvar período"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
