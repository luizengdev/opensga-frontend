"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Megaphone, PlusCircle, Trash2} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {formatDateBr} from "@/lib/admin/format";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {AuthRole, Comunicado} from "@/lib/api/fetch-generated";
import {
  getGetComunicadosQueryKey,
  useCreateComunicado,
  useDeleteComunicado,
  useGetComunicados,
} from "@/lib/api/rc-generated";

const papeis: AuthRole[] = ["ADMIN", "PROFESSOR", "ALUNO", "RESPONSAVEL"];

const comunicadoSchema = z.object({
  titulo: z.string().min(3).max(200),
  conteudo: z.string().min(3),
  publicoAlvo: z.array(z.enum(["ADMIN", "PROFESSOR", "ALUNO", "RESPONSAVEL"])).min(1),
});

type ComunicadoFormValues = z.infer<typeof comunicadoSchema>;

interface ComunicadosViewProps {
  initialComunicados: Comunicado[];
}

export const ComunicadosView = ({initialComunicados}: ComunicadosViewProps) => {
  const queryClient = useQueryClient();
  const {data: comunicados} = useGetComunicados({initialData: initialComunicados});
  const {mutate: createComunicado, isPending: isCreating} = useCreateComunicado();
  const {mutate: deleteComunicado, isPending: isDeleting} = useDeleteComunicado();
  const [dialogOpen, setDialogOpen] = useState(false);
  const lista = comunicados ?? initialComunicados;

  const form = useForm<ComunicadoFormValues>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: {titulo: "", conteudo: "", publicoAlvo: ["ALUNO"]},
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetComunicadosQueryKey()});
  };

  const onSubmit = form.handleSubmit((payload) => {
    createComunicado(payload, {
      onSuccess: () => {
        toast.success("Comunicado publicado.");
        invalidate();
        setDialogOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusCircle />
            Novo comunicado
          </Button>
        }
        description="Mural institucional expedido pela secretaria para os públicos selecionados."
        eyebrow="Comunicação institucional"
        title="Comunicados"
      />

      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Publique avisos para alunos, professores ou a comunidade acadêmica."
            icon={Megaphone}
            title="Nenhum comunicado"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((comunicado) => (
            <Card key={comunicado.id}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{comunicado.titulo}</h2>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {formatDateBr(comunicado.criadoEm)}
                    </p>
                  </div>
                  <Button
                    aria-label={`Excluir ${comunicado.titulo}`}
                    disabled={isDeleting}
                    onClick={() =>
                      deleteComunicado(comunicado.id, {
                        onSuccess: () => {
                          toast.success("Comunicado removido.");
                          invalidate();
                        },
                        onError: (error) => toast.error(getMutationErrorMessage(error)),
                      })
                    }
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{comunicado.conteudo}</p>
                <div className="flex flex-wrap gap-1">
                  {comunicado.publicoAlvo.map((papel) => (
                    <Badge key={papel} variant="outline">
                      {ROLE_LABEL[papel]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo comunicado</DialogTitle>
            <DialogDescription>Selecione ao menos um público-alvo.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="titulo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conteudo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publicoAlvo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Público-alvo</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {papeis.map((papel) => (
                        <label className="flex items-center gap-2 text-xs" key={papel}>
                          <Checkbox
                            checked={field.value.includes(papel)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...field.value, papel]
                                : field.value.filter((item) => item !== papel);
                              field.onChange(next);
                            }}
                          />
                          {ROLE_LABEL[papel]}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  Publicar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
