"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Search} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {TermoTurmaEmAbertoAlert} from "@/components/admin/termo-turma-em-aberto-alert";
import {PendingButtonLabel} from "@/components/pending-button-label";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {describeDiarioAluno} from "@/lib/admin/termos";
import {formatNota} from "@/lib/aluno/disciplina";
import type {CreateTermoIndividualInput, TermoDiarioResumo} from "@/lib/api/fetch-generated";
import {useCreateTermoIndividual, useGetTermosDiarios} from "@/lib/api/rc-generated";

const alteracaoSchema = z
  .object({
    notaAv: z.string(),
    notaAvs: z.string(),
    notaAv3: z.string(),
    totalFaltas: z.string(),
  })
  .refine(
    (payload) =>
      payload.notaAv.trim() !== "" ||
      payload.notaAvs.trim() !== "" ||
      payload.notaAv3.trim() !== "" ||
      payload.totalFaltas.trim() !== "",
    {message: "Informe ao menos uma nota (AV, AVS ou AV3) ou o total de faltas."},
  );

type AlteracaoFormValues = z.infer<typeof alteracaoSchema>;

const parseNota = (value: string) => {
  if (value.trim().length === 0) {
    return undefined;
  }

  return Number(value.replace(",", "."));
};

const parseFaltas = (value: string) => {
  if (value.trim().length === 0) {
    return undefined;
  }

  return Number.parseInt(value, 10);
};

const isNotaValida = (value: number | undefined) => {
  return value === undefined || (Number.isFinite(value) && value >= 0 && value <= 10);
};

export const TermoAberturaIndividualSection = () => {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<TermoDiarioResumo | null>(null);
  const termoBusca = busca.trim();
  const {data: resultados, isFetching} = useGetTermosDiarios(termoBusca);
  const {mutate: solicitar, isPending} = useCreateTermoIndividual();
  const form = useForm<AlteracaoFormValues>({
    resolver: zodResolver(alteracaoSchema),
    defaultValues: {notaAv: "", notaAvs: "", notaAv3: "", totalFaltas: ""},
  });
  const diarios = resultados ?? [];

  const onSubmit = form.handleSubmit((payload) => {
    if (!selecionado || !selecionado.semestreFechado) {
      return;
    }

    const notaAv = parseNota(payload.notaAv);
    const notaAvs = parseNota(payload.notaAvs);
    const notaAv3 = parseNota(payload.notaAv3);
    const totalFaltas = parseFaltas(payload.totalFaltas);

    if (![notaAv, notaAvs, notaAv3].every(isNotaValida)) {
      toast.error("Notas devem estar entre 0 e 10.");
      return;
    }

    if (totalFaltas !== undefined && (!Number.isInteger(totalFaltas) || totalFaltas < 0)) {
      toast.error("O total de faltas deve ser um inteiro maior ou igual a zero.");
      return;
    }

    const data: CreateTermoIndividualInput = {
      diarioClasseId: selecionado.id,
      ...(notaAv !== undefined ? {notaAv} : {}),
      ...(notaAvs !== undefined ? {notaAvs} : {}),
      ...(notaAv3 !== undefined ? {notaAv3} : {}),
      ...(totalFaltas !== undefined ? {totalFaltas} : {}),
    };

    solicitar(data, {
      onSuccess: () => {
        toast.success("Solicitação de alteração enviada para a Secretaria.");
        form.reset({notaAv: "", notaAvs: "", notaAv3: "", totalFaltas: ""});
        setSelecionado(null);
        setBusca("");
        void queryClient.invalidateQueries({queryKey: ["/api/v1/termos"]});
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alteração individual de notas ou faltas</CardTitle>
        <CardDescription>
          Só é possível solicitar termo se a turma do aluno já estiver encerrada. Turma em aberto:
          use o diário regular.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminSearchField
          onValueChange={(value) => {
            setBusca(value);
            setSelecionado(null);
          }}
          placeholder="Buscar por RA ou nome do aluno"
          value={busca}
        />
        {termoBusca.length >= 2 && !selecionado ? (
          diarios.length === 0 && !isFetching ? (
            <AdminEmptyState
              description="Nenhum diário deste professor corresponde ao RA ou nome informado."
              icon={Search}
              title="Nenhum aluno encontrado"
            />
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {diarios.map((diario) => (
                <Button
                  className="h-auto w-full justify-start rounded-none px-3 py-2 text-left font-normal"
                  key={diario.id}
                  onClick={() => {
                    setSelecionado(diario);
                    form.reset({notaAv: "", notaAvs: "", notaAv3: "", totalFaltas: ""});
                  }}
                  variant="ghost"
                >
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm text-foreground">{describeDiarioAluno(diario)}</span>
                      <span className="text-xs text-muted-foreground">
                        {diario.turma.codigo} · {diario.turma.disciplina.nome} ·{" "}
                        {formatPeriodoLetivo(diario.turma)}
                      </span>
                    </span>
                    <Badge variant={diario.semestreFechado ? "success" : "warning"}>
                      {diario.semestreFechado ? "Turma encerrada" : "Turma em aberto"}
                    </Badge>
                  </span>
                </Button>
              ))}
            </div>
          )
        ) : null}
        {selecionado ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{describeDiarioAluno(selecionado)}</p>
              <p className="text-xs text-muted-foreground">
                {selecionado.turma.codigo} · {selecionado.turma.curso.nome} ·{" "}
                {selecionado.turma.disciplina.nome}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                <div>
                  <dt className="text-muted-foreground">AV atual</dt>
                  <dd className="font-mono">{formatNota(selecionado.notaAv)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AVS atual</dt>
                  <dd className="font-mono">{formatNota(selecionado.notaAvs)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AV3 atual</dt>
                  <dd className="font-mono">{formatNota(selecionado.notaAv3)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">NS</dt>
                  <dd className="font-mono">{formatNota(selecionado.notaSemestral)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Faltas</dt>
                  <dd className="font-mono">{selecionado.totalFaltas}</dd>
                </div>
              </dl>
            </div>
            {!selecionado.semestreFechado ? (
              <TermoTurmaEmAbertoAlert turmaId={selecionado.turma.id} />
            ) : null}
            {selecionado.semestreFechado ? (
              <Form {...form}>
              <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={onSubmit}>
                <FormField
                  control={form.control}
                  name="notaAv"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Novo AV</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder={formatNota(selecionado.notaAv)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notaAvs"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Novo AVS</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder={formatNota(selecionado.notaAvs)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notaAv3"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Novo AV3</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" placeholder={formatNota(selecionado.notaAv3)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalFaltas"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Novas faltas</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder={String(selecionado.totalFaltas)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button disabled={isPending} size="sm" type="submit">
                    <PendingButtonLabel
                      isPending={isPending}
                      label="Solicitar alteração"
                      pendingLabel="Enviando..."
                    />
                  </Button>
                </div>
              </form>
              </Form>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
