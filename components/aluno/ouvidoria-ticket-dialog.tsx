"use client";

import {useEffect} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2, Send, X} from "lucide-react";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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

const TIPOS: TipoReclamacao[] = [
  "ACADEMICO",
  "SECRETARIA",
  "FINANCEIRO",
  "INFRAESTRUTURA",
  "OUVIDORIA_GERAL",
];

interface OuvidoriaTicketDialogProps {
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  open: boolean;
  submitted: boolean;
}

export const OuvidoriaTicketDialog = ({
  isPending,
  onOpenChange,
  onSubmit,
  open,
  submitted,
}: OuvidoriaTicketDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assunto: "",
      tipo: "ACADEMICO",
      descricao: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-border bg-muted px-6 py-4">
          <DialogHeader className="gap-0">
            <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Novo Requerimento
            </span>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Abrir Protocolo na Ouvidoria
            </DialogTitle>
            <DialogDescription className="sr-only">
              Informe o setor, o assunto e a descrição para protocolar o chamado.
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <Button
                className="text-muted-foreground hover:text-foreground"
                size="icon-sm"
                type="button"
                variant="ghost"
              />
            }
          >
            <X className="size-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </div>

        {submitted ? (
          <div className="space-y-2 p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" />
            <h4 className="font-heading text-base font-bold text-foreground">Protocolo registrado com sucesso!</h4>
            <p className="text-xs font-medium text-muted-foreground">
              Você poderá acompanhar as respostas e atualizações diretamente nesta tela.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-4 p-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="tipo"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Setor de Atendimento</FormLabel>
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
                        <SelectTrigger className="w-full text-xs font-medium">
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
                name="assunto"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Assunto</FormLabel>
                    <FormControl>
                      <Input
                        className="text-xs font-medium"
                        placeholder="Ex: Dúvida sobre lançamento de horas complementares"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-xs font-medium"
                        placeholder="Descreva seu requerimento com clareza para agilizar o atendimento..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <DialogClose render={<Button className="text-xs font-semibold" type="button" variant="ghost" />}>
                  Cancelar
                </DialogClose>
                <Button className="text-xs font-bold" disabled={isPending} type="submit">
                  <Send className="size-3.5" />
                  Protocolar Chamado
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
