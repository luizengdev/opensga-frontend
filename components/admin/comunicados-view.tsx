"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Megaphone, PlusCircle, Send} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {ComunicadoMuralCard} from "@/components/admin/comunicado-mural-card";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
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
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {AuthRole, Comunicado} from "@/lib/api/fetch-generated";
import {useCreateComunicado, useDeleteComunicado, useGetComunicados} from "@/lib/api/rc-generated";

const papeis: AuthRole[] = ["ADMIN", "PROFESSOR", "ALUNO", "RESPONSAVEL"];

const comunicadoSchema = z.object({
  titulo: z.string().min(3).max(200),
  conteudo: z.string().min(3),
  publicoAlvo: z.array(z.enum(["ADMIN", "PROFESSOR", "ALUNO", "RESPONSAVEL"])).min(1),
});

type ComunicadoFormValues = z.infer<typeof comunicadoSchema>;

const defaultValues: ComunicadoFormValues = {
  titulo: "",
  conteudo: "",
  publicoAlvo: ["ADMIN", "PROFESSOR", "ALUNO"],
};

interface ComunicadosViewProps {
  canManage: boolean;
  initialComunicados: Comunicado[];
}

export const ComunicadosView = ({canManage, initialComunicados}: ComunicadosViewProps) => {
  const queryClient = useQueryClient();
  const {data: comunicados} = useGetComunicados({initialData: initialComunicados});
  const {mutate: createComunicado, isPending: isCreating} = useCreateComunicado();
  const {mutate: deleteComunicado, isPending: isDeleting} = useDeleteComunicado();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const lista = comunicados ?? initialComunicados;

  const form = useForm<ComunicadoFormValues>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: ["/api/v1/comunicados"]});
  };

  const openCreate = () => {
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((payload) => {
    createComunicado(payload, {
      onSuccess: () => {
        toast.success("Comunicado institucional publicado.");
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
          canManage ? (
            <Button onClick={openCreate} size="sm">
              <PlusCircle />
              Novo comunicado
            </Button>
          ) : null
        }
        description="Publicação de portarias, calendários de provas e editais acadêmicos para a comunidade."
        eyebrow="Secretaria & comunicação institucional"
        title="Comunicados oficiais"
      />

      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description={
              canManage
                ? "Não há informativos ou avisos vigentes registrados no momento."
                : "Não há comunicados vigentes destinados ao seu perfil."
            }
            icon={Megaphone}
            title="Nenhum comunicado publicado"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {lista.map((comunicado) => (
            <ComunicadoMuralCard
              canManage={canManage}
              comunicado={comunicado}
              isDeleting={isDeleting}
              key={comunicado.id}
              onDelete={() => setTargetId(comunicado.id)}
            />
          ))}
        </div>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publicar comunicado institucional</DialogTitle>
            <DialogDescription>
              Envio de aviso oficial direcionado aos perfis do OpenSGA.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="titulo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Título do comunicado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Calendário oficial de exames finais 2026.2"
                        {...field}
                      />
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
                    <FormLabel>Público-alvo destinatário</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        className="flex w-full flex-wrap"
                        multiple
                        onValueChange={(next) => field.onChange(next)}
                        value={field.value}
                      >
                        {papeis.map((papel) => (
                          <ToggleGroupItem
                            className="aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            key={papel}
                            size="sm"
                            value={papel}
                            variant="outline"
                          >
                            {ROLE_LABEL[papel]}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
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
                    <FormLabel>Conteúdo da publicação</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-28"
                        placeholder="Digite o teor do comunicado oficial..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  <Send />
                  Publicar comunicado
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        description="O aviso sai do mural de todos os destinatários. Esta ação não pode ser desfeita."
        isPending={isDeleting}
        onConfirm={() => {
          if (!targetId) {
            return;
          }

          deleteComunicado(targetId, {
            onSuccess: () => {
              toast.success("Comunicado removido.");
              invalidate();
              setTargetId(null);
            },
            onError: (error) => toast.error(getMutationErrorMessage(error)),
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setTargetId(null);
          }
        }}
        open={targetId !== null}
        title="Remover comunicado institucional?"
      />
    </div>
  );
};
