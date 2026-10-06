"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Calendar, PlusCircle, Search, Trash2} from "lucide-react";
import Link from "next/link";
import {useMemo, useState} from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Campus, Disciplina, Professor, TipoEntrega, Turma} from "@/lib/api/fetch-generated";
import {
  getGetTurmasQueryKey,
  useCreateTurma,
  useDeleteTurma,
  useGetTurmas,
} from "@/lib/api/rc-generated";

const tiposEntrega: TipoEntrega[] = [
  "PRESENCIAL_FISICO",
  "SINCRONO_MEDIADO",
  "ASSINCRONO_DIGITAL",
];

const turmaSchema = z.object({
  campusId: z.string().min(1),
  disciplinaId: z.string().min(1),
  professorId: z.string().min(1),
  codigo: z.string().min(3).max(50),
  capacidade: z.number().int().min(1),
  horario: z.string().min(3).max(100),
  salaOuLink: z.string().max(255).optional(),
  tipoEntrega: z.enum(["PRESENCIAL_FISICO", "SINCRONO_MEDIADO", "ASSINCRONO_DIGITAL"]),
});

type TurmaFormValues = z.infer<typeof turmaSchema>;

interface TurmasListViewProps {
  anoLetivo: number;
  initialCampi: Campus[];
  initialDisciplinas: Disciplina[];
  initialProfessores: Professor[];
  initialTurmas: Turma[];
  isAdmin: boolean;
  semestreLetivo: number;
}

export const TurmasListView = ({
  anoLetivo,
  initialCampi,
  initialDisciplinas,
  initialProfessores,
  initialTurmas,
  isAdmin,
  semestreLetivo,
}: TurmasListViewProps) => {
  const queryClient = useQueryClient();
  const periodo = {anoLetivo, semestreLetivo};
  const {data: turmas} = useGetTurmas({query: periodo, initialData: initialTurmas});
  const {mutate: createTurma, isPending: isCreating} = useCreateTurma();
  const {mutate: deleteTurma, isPending: isDeleting} = useDeleteTurma();
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const lista = turmas ?? initialTurmas;
  const listaCampi = initialCampi;
  const listaDisciplinas = initialDisciplinas;
  const listaProfessores = initialProfessores;

  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      campusId: listaCampi[0]?.id ?? "",
      disciplinaId: listaDisciplinas[0]?.id ?? "",
      professorId: listaProfessores[0]?.id ?? "",
      codigo: "",
      capacidade: 50,
      horario: "",
      salaOuLink: "",
      tipoEntrega: "PRESENCIAL_FISICO",
    },
  });

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return lista.filter((turma) => {
      const matchesCampus = campusFilter === "ALL" || turma.campusId === campusFilter;
      const matchesSearch =
        termo.length === 0 ||
        turma.codigo.toLowerCase().includes(termo) ||
        turma.disciplina.nome.toLowerCase().includes(termo) ||
        turma.professor.user.nome.toLowerCase().includes(termo);

      return matchesCampus && matchesSearch;
    });
  }, [lista, campusFilter, searchTerm]);

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetTurmasQueryKey(periodo)});
  };

  const onSubmit = form.handleSubmit((payload) => {
    createTurma(
      {
        ...payload,
        anoLetivo,
        semestreLetivo,
        salaOuLink: payload.salaOuLink || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Turma ofertada.");
          invalidate();
          setDialogOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const campusNome = (campusId: string) => {
    return listaCampi.find((campus) => campus.id === campusId)?.codigoPolo ?? campusId;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          isAdmin ? (
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <PlusCircle />
              Ofertar nova turma
            </Button>
          ) : null
        }
        description={`Período letivo ${formatPeriodoLetivo(periodo)} · horários, salas, ocupação e diários eletrônicos.`}
        eyebrow={isAdmin ? "Gestão acadêmica de turmas" : "Corpo docente"}
        title={isAdmin ? "Turmas ofertadas" : "Minhas turmas atribuídas"}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por código, disciplina ou professor titular..."
              value={searchTerm}
            />
          </div>
          {isAdmin ? (
            <div className="w-full md:w-56">
              <AdminSelect
                items={[
                  {value: "ALL", label: "Todos os campi e polos"},
                  ...listaCampi.map((campus) => ({
                    value: campus.id,
                    label: `${campus.codigoPolo} · ${campus.nome}`,
                  })),
                ]}
                onValueChange={setCampusFilter}
                value={campusFilter}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {filtradas.length === 0 ? (
            <AdminEmptyState
              description="Não há turmas para os filtros atuais neste período letivo."
              icon={Calendar}
              title="Nenhuma turma encontrada"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Ocupação</TableHead>
                  {isAdmin ? <TableHead className="text-right">Ações</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell>
                      <Button
                        className="h-auto p-0 font-mono"
                        nativeButton={false} render={<Link href={`/area-admin/turmas/${turma.id}`} />}
                        variant="link"
                      >
                        {turma.codigo}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{turma.disciplina.nome}</div>
                      <Badge variant="outline">{TIPO_ENTREGA_LABEL[turma.tipoEntrega]}</Badge>
                    </TableCell>
                    <TableCell>{turma.professor.user.nome}</TableCell>
                    <TableCell className="font-mono text-xs">{campusNome(turma.campusId)}</TableCell>
                    <TableCell className="font-mono text-xs">{turma.horario}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {turma.quantidadeDiarios ?? 0}/{turma.capacidade}
                    </TableCell>
                    {isAdmin ? (
                      <TableCell className="text-right">
                        <Button
                          aria-label={`Excluir turma ${turma.codigo}`}
                          disabled={isDeleting}
                          onClick={() =>
                            deleteTurma(turma.id, {
                              onSuccess: () => {
                                toast.success("Turma removida.");
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
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ofertar turma</DialogTitle>
            <DialogDescription>
              A turma entra no período {formatPeriodoLetivo(periodo)}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="codigo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="ENG-CALC-T01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campusId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaCampi.map((campus) => ({
                          value: campus.id,
                          label: `${campus.codigoPolo} · ${campus.nome}`,
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
                name="disciplinaId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Disciplina</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaDisciplinas.map((disciplina) => ({
                          value: disciplina.id,
                          label: `${disciplina.codigo} · ${disciplina.nome}`,
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
                name="professorId"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Professor titular</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={listaProfessores.map((professor) => ({
                          value: professor.id,
                          label: `${professor.user.nome} · ${professor.matricula}`,
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="horario"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seg/Qua 10:00 - 11:40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Capacidade</FormLabel>
                      <FormControl>
                        <Input
                          min={1}
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
              </div>
              <FormField
                control={form.control}
                name="salaOuLink"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Sala ou link</FormLabel>
                    <FormControl>
                      <Input placeholder="Sala 204 ou URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoEntrega"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo de entrega</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={tiposEntrega.map((item) => ({
                          value: item,
                          label: TIPO_ENTREGA_LABEL[item],
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
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
                  Ofertar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
