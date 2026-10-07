"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {TIPO_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import type {TipoReclamacao} from "@/lib/api/fetch-generated";

const schema = z.object({
  assunto: z.string().min(3).max(200),
  tipo: z.enum(["FINANCEIRO", "ACADEMICO", "SECRETARIA", "INFRAESTRUTURA", "OUVIDORIA_GERAL"]),
  descricao: z.string().min(3),
});

type FormValues = z.infer<typeof schema>;

const TIPOS = Object.keys(TIPO_RECLAMACAO_LABEL) as TipoReclamacao[];

interface OuvidoriaTicketDialogProps {
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  open: boolean;
}

export const OuvidoriaTicketDialog = ({isPending, onOpenChange, onSubmit, open}: OuvidoriaTicketDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assunto: "",
      tipo: "ACADEMICO",
      descricao: "",
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo protocolo</DialogTitle>
          <DialogDescription>Abra um chamado em seu nome. A secretaria responde neste mesmo painel.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="assunto"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Resumo do pedido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    items={TIPOS.map((tipo) => ({value: tipo, label: TIPO_RECLAMACAO_LABEL[tipo]}))}
                    onValueChange={(next) => {
                      if (typeof next === "string") {
                        field.onChange(next);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{() => TIPO_RECLAMACAO_LABEL[field.value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS.map((tipo) => (
                        <SelectItem key={tipo} label={TIPO_RECLAMACAO_LABEL[tipo]} value={tipo}>
                          {TIPO_RECLAMACAO_LABEL[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              Enviar protocolo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
