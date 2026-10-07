"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Building2, MapPin, Pencil, PlusCircle, Trash2} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
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
import {TIPO_CAMPUS_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Campus, Curso, TipoCampus} from "@/lib/api/fetch-generated";
import {
  getGetCampiQueryKey,
  useCreateCampus,
  useDeleteCampus,
  useGetCampi,
  useGetCursos,
  useUpdateCampus,
} from "@/lib/api/rc-generated";

const tiposCampus: TipoCampus[] = ["CAMPI", "POLO"];

const campusSchema = z.object({
  nome: z.string().min(3).max(120),
  codigoPolo: z.string().min(2).max(20),
  tipo: z.enum(["CAMPI", "POLO"]),
  cidade: z.string().min(2).max(100),
  estado: z.string().length(2),
  endereco: z.string().min(5).max(255),
});

type CampusFormValues = z.infer<typeof campusSchema>;

interface CampiViewProps {
  initialCampi: Campus[];
  initialCursos: Curso[];
}

export const CampiView = ({initialCampi, initialCursos}: CampiViewProps) => {
  const queryClient = useQueryClient();
  const {data: campi} = useGetCampi({initialData: initialCampi});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {mutate: createCampus, isPending: isCreating} = useCreateCampus();
  const {mutate: updateCampus, isPending: isUpdating} = useUpdateCampus();
  const {mutate: deleteCampus, isPending: isDeleting} = useDeleteCampus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);

  const lista = campi ?? initialCampi;
  const listaCursos = cursos ?? initialCursos;

  const form = useForm<CampusFormValues>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      nome: "",
      codigoPolo: "",
      tipo: "CAMPI",
      cidade: "",
      estado: "",
      endereco: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      nome: "",
      codigoPolo: "",
      tipo: "CAMPI",
      cidade: "",
      estado: "",
      endereco: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (campus: Campus) => {
    setEditing(campus);
    form.reset({
      nome: campus.nome,
      codigoPolo: campus.codigoPolo,
      tipo: campus.tipo,
      cidade: campus.cidade,
      estado: campus.estado,
      endereco: campus.endereco,
    });
    setDialogOpen(true);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetCampiQueryKey()});
  };

  const onSubmit = form.handleSubmit((payload) => {
    const data = {
      ...payload,
      codigoPolo: payload.codigoPolo.toUpperCase(),
      estado: payload.estado.toUpperCase(),
    };

    if (editing) {
      updateCampus(
        {id: editing.id, data},
        {
          onSuccess: () => {
            toast.success("Campus atualizado com sucesso.");
            invalidate();
            setDialogOpen(false);
          },
          onError: (error) => toast.error(getMutationErrorMessage(error)),
        },
      );
      return;
    }

    createCampus(data, {
      onSuccess: () => {
        toast.success("Campus cadastrado com sucesso.");
        invalidate();
        setDialogOpen(false);
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  });

  const handleDelete = (id: string) => {
    deleteCampus(id, {
      onSuccess: () => {
        toast.success("Campus removido.");
        invalidate();
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusCircle />
            Novo polo / campus
          </Button>
        }
        description="Sedes físicas e polos de apoio presencial credenciados perante o Ministério da Educação."
        eyebrow="Estrutura institucional e polos credenciados"
        title="Campi e polos MEC"
      />

      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Cadastre a sede ou um polo de apoio presencial para ofertar cursos."
            icon={Building2}
            title="Nenhum campus cadastrado"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {lista.map((campus) => {
            const linked = listaCursos.filter((curso) => curso.campusId === campus.id).length;

            return (
              <Card key={campus.id}>
                <CardContent className="flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={campus.tipo === "POLO" ? "info" : "secondary"}>
                          {TIPO_CAMPUS_LABEL[campus.tipo]}
                        </Badge>
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                          {campus.codigoPolo}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {campus.cidade} - {campus.estado}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold tracking-tight">{campus.nome}</h3>
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span>{campus.endereco}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="font-mono text-muted-foreground">
                      {linked} curso(s) ofertado(s)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        aria-label={`Editar ${campus.nome}`}
                        onClick={() => openEdit(campus)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Excluir ${campus.nome}`}
                        disabled={isDeleting}
                        onClick={() => handleDelete(campus.id)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar campus" : "Cadastrar campus ou polo"}</DialogTitle>
            <DialogDescription>
              Campus presencial (sede) ou polo de apoio EAD credenciado no MEC.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="tipo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo da unidade</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={tiposCampus.map((tipo) => ({
                          value: tipo,
                          label: TIPO_CAMPUS_LABEL[tipo],
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome da unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Polo Regional Caruaru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="codigoPolo"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Código da unidade</FormLabel>
                      <FormControl>
                        <Input placeholder="POLO-CAR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input maxLength={2} placeholder="PE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cidade"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Caruaru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Central, 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating || isUpdating} type="submit">
                  {editing ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
