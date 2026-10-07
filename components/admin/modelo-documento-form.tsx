"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminSelect} from "@/components/admin/admin-select";
import {DocumentoCorpoEditor} from "@/components/admin/documento-corpo-editor";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
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
import {TIPO_DOCUMENTO_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {ModeloDocumento} from "@/lib/api/fetch-generated";
import {getGetModelosDocumentoQueryKey, useUpdateModeloDocumento} from "@/lib/api/rc-generated";

const modeloDocumentoFormSchema = z.object({
  titulo: z.string().min(3).max(200),
  descricao: z.string().min(3).max(500),
  finalidade: z.string().min(3).max(500),
  corpo: z.string().min(10).max(8000),
  ativo: z.enum(["true", "false"]),
});

type ModeloDocumentoFormValues = z.infer<typeof modeloDocumentoFormSchema>;

interface ModeloDocumentoFormProps {
  modelo: ModeloDocumento;
}

const PLACEHOLDERS =
  "{{aluno.nome}} {{aluno.cpf}} {{aluno.ra}} {{curso.nome}} {{curso.modalidade}} {{campus.nome}} {{campus.codigoPolo}} {{periodoAtual}} {{semestreIngresso}} {{dataEmissao}} {{codigoAutenticacao}} {{chIntegralizada}} {{chTotalCurso}} {{ies.nome}} {{ies.sigla}} {{ies.mantenedora}} {{ies.cnpj}}";

export const ModeloDocumentoForm = ({modelo}: ModeloDocumentoFormProps) => {
  const queryClient = useQueryClient();
  const {mutate: updateModelo, isPending} = useUpdateModeloDocumento();
  const form = useForm<ModeloDocumentoFormValues>({
    resolver: zodResolver(modeloDocumentoFormSchema),
    defaultValues: {
      titulo: modelo.titulo,
      descricao: modelo.descricao,
      finalidade: modelo.finalidade,
      corpo: modelo.corpo,
      ativo: modelo.ativo ? "true" : "false",
    },
  });

  const onSubmit = form.handleSubmit((payload) => {
    updateModelo(
      {
        id: modelo.id,
        data: {
          titulo: payload.titulo,
          descricao: payload.descricao,
          finalidade: payload.finalidade,
          corpo: payload.corpo,
          ativo: payload.ativo === "true",
        },
      },
      {
        onSuccess: () => {
          toast.success("Modelo atualizado. O texto entra na próxima emissão do aluno.");
          void queryClient.invalidateQueries({queryKey: getGetModelosDocumentoQueryKey()});
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            {TIPO_DOCUMENTO_LABEL[modelo.tipo]}
          </p>
          <h2 className="font-heading text-lg font-bold text-foreground">{modelo.titulo}</h2>
        </div>
        {modelo.ativo ? <Badge variant="success">Disponível no portal</Badge> : <Badge variant="secondary">Desativado</Badge>}
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="titulo"
            render={({field}) => (
              <FormItem>
                <FormLabel>Título do documento</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descricao"
            render={({field}) => (
              <FormItem>
                <FormLabel>Descrição no catálogo do aluno</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finalidade"
            render={({field}) => (
              <FormItem>
                <FormLabel>Finalidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="corpo"
            render={({field}) => (
              <FormItem>
                <FormLabel>Texto oficial</FormLabel>
                <FormControl>
                  <DocumentoCorpoEditor onBlur={field.onBlur} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormDescription>
                  Selecione trechos para negrito e alinhamento. Placeholders interpolados na emissão:{" "}
                  {PLACEHOLDERS}. Tabelas de histórico, disciplinas e a carteirinha continuam montadas pelo
                  sistema.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ativo"
            render={({field}) => (
              <FormItem>
                <FormLabel>Disponibilidade no portal do aluno</FormLabel>
                <FormControl>
                  <AdminSelect
                    items={[
                      {value: "true", label: "Ativo (aluno pode emitir)"},
                      {value: "false", label: "Inativo (oculto no autoatendimento)"},
                    ]}
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit">
            Salvar modelo
          </Button>
        </form>
      </Form>
    </Card>
  );
};
