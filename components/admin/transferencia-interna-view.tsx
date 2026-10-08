"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {ArrowLeftRight} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminCombobox} from "@/components/admin/admin-combobox";
import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {StatusMatriculaBadge} from "@/components/admin/status-matricula-badge";
import {PendingButtonLabel} from "@/components/pending-button-label";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Spinner} from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {MODALIDADE_LABEL, TIPO_CAMPUS_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {STATUS_DISCIPLINA_LABEL} from "@/lib/aluno/labels";
import type {Campus, Curso, Matricula, Matriz} from "@/lib/api/fetch-generated";
import {
  getGetMatriculasQueryKey,
  useGetCampi,
  useGetCursos,
  useGetMatriculas,
  useGetMatrizes,
  useGetTransferenciaPreview,
  useTransferirMatricula,
} from "@/lib/api/rc-generated";

const transferenciaSchema = z.object({
  matriculaOrigemId: z.string().min(1, "Selecione o aluno."),
  cursoDestinoId: z.string().min(1, "Selecione o curso ou polo de destino."),
  matrizCurricularId: z.string().min(1, "Selecione a matriz curricular de destino."),
});

type TransferenciaFormValues = z.infer<typeof transferenciaSchema>;

const ORIGEM_ELEGIVEL = new Set(["ATIVO", "TRANCADO"]);

interface TransferenciaInternaViewProps {
  initialCampi: Campus[];
  initialCursos: Curso[];
  initialMatriculas: Matricula[];
  initialMatrizes: Matriz[];
}

export const TransferenciaInternaView = ({
  initialCampi,
  initialCursos,
  initialMatriculas,
  initialMatrizes,
}: TransferenciaInternaViewProps) => {
  const queryClient = useQueryClient();
  const {data: matriculas} = useGetMatriculas({initialData: initialMatriculas});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: matrizes} = useGetMatrizes({initialData: initialMatrizes});
  const {data: campi} = useGetCampi({initialData: initialCampi});
  const {mutate: transferir, isPending} = useTransferirMatricula();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const listaMatriculas = matriculas ?? initialMatriculas;
  const listaCursos = cursos ?? initialCursos;
  const listaMatrizes = matrizes ?? initialMatrizes;
  const listaCampi = campi ?? initialCampi;

  const form = useForm<TransferenciaFormValues>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      matriculaOrigemId: "",
      cursoDestinoId: "",
      matrizCurricularId: "",
    },
  });

  const matriculaOrigemId = form.watch("matriculaOrigemId");
  const cursoDestinoId = form.watch("cursoDestinoId");
  const matrizCurricularId = form.watch("matrizCurricularId");

  const campusPorId = useMemo(() => {
    return new Map(listaCampi.map((campus) => [campus.id, campus]));
  }, [listaCampi]);

  const cursoPorId = useMemo(() => {
    return new Map(listaCursos.map((curso) => [curso.id, curso]));
  }, [listaCursos]);

  const origem = useMemo(() => {
    return listaMatriculas.find((item) => item.id === matriculaOrigemId) ?? null;
  }, [listaMatriculas, matriculaOrigemId]);

  const origemElegiveis = useMemo(() => {
    return listaMatriculas.filter((item) => ORIGEM_ELEGIVEL.has(item.status));
  }, [listaMatriculas]);

  const alunoItems = useMemo(() => {
    return origemElegiveis.map((item) => {
      const curso = cursoPorId.get(item.curso.id);
      const campus = curso ? campusPorId.get(curso.campusId) : undefined;

      return {
        value: item.id,
        label: `${item.aluno.user.nome} · RA ${item.aluno.ra}`,
        description: [
          item.curso.nome,
          MODALIDADE_LABEL[item.curso.modalidade],
          campus ? `${campus.nome} (${TIPO_CAMPUS_LABEL[campus.tipo]})` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        keywords: `${item.aluno.ra} ${item.aluno.user.cpf} ${item.aluno.user.email}`,
      };
    });
  }, [campusPorId, cursoPorId, origemElegiveis]);

  const destinoItems = useMemo(() => {
    return listaCursos
      .filter((curso) => curso.id !== origem?.curso.id)
      .map((curso) => {
        const campus = campusPorId.get(curso.campusId);

        return {
          value: curso.id,
          label: `${curso.nome} · ${MODALIDADE_LABEL[curso.modalidade]}`,
          description: campus
            ? `${campus.nome} · ${TIPO_CAMPUS_LABEL[campus.tipo]}`
            : curso.codigoMec ?? "",
          keywords: `${curso.nome} ${curso.codigoMec ?? ""} ${campus?.codigoPolo ?? ""}`,
        };
      });
  }, [campusPorId, listaCursos, origem?.curso.id]);

  const matrizesDestino = useMemo(() => {
    return listaMatrizes
      .filter((matriz) => matriz.cursoId === cursoDestinoId && matriz.ativo)
      .sort((a, b) => b.anoVigencia - a.anoVigencia)
      .map((matriz) => ({
        value: matriz.id,
        label: `${matriz.nome} (${matriz.anoVigencia})`,
      }));
  }, [cursoDestinoId, listaMatrizes]);

  const {data: preview, error: previewError, isFetching: isPreviewLoading} =
    useGetTransferenciaPreview({
      id: matriculaOrigemId,
      cursoId: cursoDestinoId,
      matrizCurricularId,
    });

  const historicosTransferidos = useMemo(() => {
    return listaMatriculas.filter((item) => item.status === "TRANSFERIDO");
  }, [listaMatriculas]);

  const onSelectOrigem = (value: string) => {
    form.setValue("matriculaOrigemId", value, {shouldValidate: true});
    form.setValue("cursoDestinoId", "");
    form.setValue("matrizCurricularId", "");
  };

  const onSelectDestino = (value: string) => {
    form.setValue("cursoDestinoId", value, {shouldValidate: true});
    const primeira = listaMatrizes
      .filter((matriz) => matriz.cursoId === value && matriz.ativo)
      .sort((a, b) => b.anoVigencia - a.anoVigencia)[0];
    form.setValue("matrizCurricularId", primeira?.id ?? "", {shouldValidate: true});
  };

  const onConfirm = () => {
    if (!matriculaOrigemId) {
      return;
    }

    transferir(
      {
        id: matriculaOrigemId,
        data: {
          cursoId: cursoDestinoId,
          matrizCurricularId,
        },
      },
      {
        onSuccess: (result) => {
          const aproveitadas = result.disciplinasTransferiveis.length;
          toast.success(
            result.mesmoCurso
              ? `Transferência concluída. ${aproveitadas} disciplina(s) do histórico foram aproveitadas.`
              : `Transferência concluída. ${aproveitadas} disciplina(s) em comum foram aproveitadas.`,
          );
          queryClient.invalidateQueries({queryKey: getGetMatriculasQueryKey()});
          form.reset();
          setConfirmOpen(false);
        },
        onError: (error) => {
          toast.error(getMutationErrorMessage(error));
        },
      },
    );
  };

  const resumoConfirmacao = preview
    ? [
        `${preview.aluno.nome} (RA ${preview.aluno.ra}) será transferido de ${preview.origem.nome} em ${preview.origem.campus.nome} para ${preview.destino.nome} em ${preview.destino.campus.nome}.`,
        preview.mesmoCurso
          ? "Mesmo curso: todo o histórico de disciplinas segue com o aluno."
          : `Cursos distintos: ${preview.disciplinasTransferiveis.length} disciplina(s) em comum serão aproveitadas e ${preview.disciplinasNaoTransferiveis.length} permanecerão no vínculo de origem.`,
      ].join(" ")
    : "";

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        description="Mude o aluno de curso ou de polo/campus. O mesmo curso leva o histórico completo; curso diferente aproveita só as disciplinas que existem na matriz de destino."
        eyebrow="Secretaria acadêmica"
        title="Transferência Interna"
      />

      <Card>
        <CardHeader>
          <CardTitle>Nova transferência</CardTitle>
          <CardDescription>
            A matrícula de origem passa a Transferido e um novo vínculo Ativo é criado no destino.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {origemElegiveis.length === 0 ? (
            <AdminEmptyState
              description="Só matrículas ativas ou trancadas podem ser transferidas."
              icon={ArrowLeftRight}
              title="Nenhum aluno elegível"
            />
          ) : (
            <Form {...form}>
              <form
                className="flex flex-col gap-5"
                onSubmit={form.handleSubmit(() => {
                  if (!preview) {
                    toast.error("Aguarde a simulação da transferência.");
                    return;
                  }

                  setConfirmOpen(true);
                })}
              >
                <FormField
                  control={form.control}
                  name="matriculaOrigemId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Aluno (matrícula de origem)</FormLabel>
                      <FormControl>
                        <AdminCombobox
                          emptyText="Nenhum aluno encontrado."
                          items={alunoItems}
                          onValueChange={onSelectOrigem}
                          placeholder="Buscar por nome, RA, CPF ou e-mail"
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Somente vínculos ATIVO ou TRANCADO. O RA permanece o mesmo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cursoDestinoId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Curso e polo/campus de destino</FormLabel>
                      <FormControl>
                        <AdminCombobox
                          disabled={!origem}
                          emptyText="Nenhum curso de destino."
                          items={destinoItems}
                          onValueChange={onSelectDestino}
                          placeholder="Buscar curso, modalidade ou unidade"
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Trocar o polo/campus do mesmo programa aproveita todo o histórico. Trocar de
                        curso aproveita só disciplinas globais em comum.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matrizCurricularId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Matriz curricular de destino</FormLabel>
                      <FormControl>
                        <AdminSelect
                          disabled={!cursoDestinoId || matrizesDestino.length === 0}
                          items={matrizesDestino}
                          onValueChange={field.onChange}
                          placeholder="Selecione a matriz ativa"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {previewError ? (
                  <p className="text-sm text-destructive">{getMutationErrorMessage(previewError)}</p>
                ) : null}

                {preview ? (
                  <div className="grid gap-4 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                        Origem
                      </span>
                      <p className="text-sm font-medium text-foreground">{preview.origem.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {MODALIDADE_LABEL[preview.origem.modalidade]} · {preview.origem.campus.nome}{" "}
                        ({TIPO_CAMPUS_LABEL[preview.origem.campus.tipo]}) · {preview.origem.matriz.nome}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                        Destino
                      </span>
                      <p className="text-sm font-medium text-foreground">{preview.destino.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {MODALIDADE_LABEL[preview.destino.modalidade]} · {preview.destino.campus.nome}{" "}
                        ({TIPO_CAMPUS_LABEL[preview.destino.campus.tipo]}) · {preview.destino.matriz.nome}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Badge variant={preview.mesmoCurso ? "success" : "info"}>
                        {preview.mesmoCurso
                          ? "Mesmo curso — histórico completo"
                          : "Cursos distintos — só disciplinas correspondentes"}
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground">
                        Aproveitadas ({preview.disciplinasTransferiveis.length})
                      </p>
                      {preview.disciplinasTransferiveis.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma disciplina a mover.</p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {preview.disciplinasTransferiveis.map((disciplina) => (
                            <li
                              className="text-xs text-muted-foreground"
                              key={disciplina.diarioId}
                            >
                              {disciplina.codigo} · {disciplina.nome} (
                              {STATUS_DISCIPLINA_LABEL[disciplina.statusDisciplina]})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground">
                        Permanecem na origem ({preview.disciplinasNaoTransferiveis.length})
                      </p>
                      {preview.disciplinasNaoTransferiveis.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {preview.mesmoCurso
                            ? "Nada fica para trás neste vínculo."
                            : "Não há disciplinas exclusivas da origem."}
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {preview.disciplinasNaoTransferiveis.map((disciplina) => (
                            <li
                              className="text-xs text-muted-foreground"
                              key={disciplina.diarioId}
                            >
                              {disciplina.codigo} · {disciplina.nome} (
                              {STATUS_DISCIPLINA_LABEL[disciplina.statusDisciplina]})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : isPreviewLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner className="size-4" />
                    Simulando aproveitamento de disciplinas…
                  </div>
                ) : null}

                <div>
                  <Button disabled={isPending || !preview} type="submit">
                    <PendingButtonLabel isPending={isPending} label="Revisar transferência" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico recente</CardTitle>
          <CardDescription>Vínculos que já passaram por transferência interna.</CardDescription>
        </CardHeader>
        <CardContent>
          {historicosTransferidos.length === 0 ? (
            <AdminEmptyState
              description="As transferências efetivadas aparecem aqui com status Transferido."
              icon={ArrowLeftRight}
              title="Nenhuma transferência registrada"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>RA</TableHead>
                  <TableHead>Curso de origem</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicosTransferidos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.aluno.user.nome}</TableCell>
                    <TableCell className="font-mono text-xs">{item.aluno.ra}</TableCell>
                    <TableCell>
                      {item.curso.nome} · {MODALIDADE_LABEL[item.curso.modalidade]}
                    </TableCell>
                    <TableCell>
                      <StatusMatriculaBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        confirmLabel="Confirmar transferência"
        description={resumoConfirmacao}
        icon={ArrowLeftRight}
        isPending={isPending}
        onConfirm={onConfirm}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Efetivar transferência interna"
      />
    </div>
  );
};
