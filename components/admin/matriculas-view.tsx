"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Check, FileCheck2, Pencil, PlusCircle} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminSelect} from "@/components/admin/admin-select";
import {StatusMatriculaBadge} from "@/components/admin/status-matricula-badge";
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
import {formatPeriodoLetivo, getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {MODALIDADE_LABEL, STATUS_MATRICULA_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Curso, Matricula, Matriz, StatusMatricula} from "@/lib/api/fetch-generated";
import {
  getGetMatriculasQueryKey,
  useCreateMatricula,
  useGetCursos,
  useGetMatriculas,
  useGetMatrizes,
  useUpdateMatriculaStatus,
} from "@/lib/api/rc-generated";

const statusOptions: StatusMatricula[] = [
  "ATIVO",
  "PRE_MATRICULADO",
  "TRANCADO",
  "CANCELADO",
  "FORMADO",
  "EVADIDO",
];

const STATUS_CICLO_LABEL: Record<StatusMatricula, string> = {
  ATIVO: "Ativo (regular em disciplinas)",
  PRE_MATRICULADO: "Pré-matriculado (aguardando documentação)",
  TRANCADO: "Trancado (interrupção temporária)",
  CANCELADO: "Cancelado (desligamento solicitado)",
  FORMADO: "Formado (conclusão e colação de grau)",
  EVADIDO: "Evadido (abandono de curso)",
};

const matriculaSchema = z.object({
  nome: z.string().min(3).max(150),
  email: z.email(),
  cpf: z.string().length(14),
  telefone: z.string().optional(),
  dataNascimento: z.iso.date(),
  cursoId: z.string().min(1),
  matrizCurricularId: z.string().min(1),
  semestreIngresso: z.string().regex(/^\d{4}\.[12]$/),
});

const statusSchema = z.object({
  status: z.enum([
    "PRE_MATRICULADO",
    "ATIVO",
    "TRANCADO",
    "CANCELADO",
    "FORMADO",
    "EVADIDO",
  ]),
});

type MatriculaFormValues = z.infer<typeof matriculaSchema>;
type StatusFormValues = z.infer<typeof statusSchema>;

interface MatriculasViewProps {
  initialCursos: Curso[];
  initialMatriculas: Matricula[];
  initialMatrizes: Matriz[];
}

export const MatriculasView = ({
  initialCursos,
  initialMatriculas,
  initialMatrizes,
}: MatriculasViewProps) => {
  const queryClient = useQueryClient();
  const periodo = getPeriodoLetivoAtual();
  const {data: matriculas} = useGetMatriculas({initialData: initialMatriculas});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: matrizes} = useGetMatrizes({initialData: initialMatrizes});
  const {mutate: createMatricula, isPending: isCreating} = useCreateMatricula();
  const {mutate: updateStatus, isPending: isUpdating} = useUpdateMatriculaStatus();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [targetMatricula, setTargetMatricula] = useState<Matricula | null>(null);
  const lista = matriculas ?? initialMatriculas;
  const listaCursos = cursos ?? initialCursos;
  const listaMatrizes = matrizes ?? initialMatrizes;

  const form = useForm<MatriculaFormValues>({
    resolver: zodResolver(matriculaSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      dataNascimento: "",
      cursoId: listaCursos[0]?.id ?? "",
      matrizCurricularId: "",
      semestreIngresso: formatPeriodoLetivo(periodo),
    },
  });

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {status: "ATIVO"},
  });

  const cursoId = form.watch("cursoId");
  const matrizesDoCurso = useMemo(
    () => listaMatrizes.filter((matriz) => matriz.cursoId === cursoId),
    [listaMatrizes, cursoId],
  );

  const filtradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return lista.filter((matricula) => {
      const matchesStatus = statusFilter === "ALL" || matricula.status === statusFilter;
      const matchesSearch =
        termo.length === 0 ||
        matricula.aluno.ra.toLowerCase().includes(termo) ||
        matricula.aluno.user.nome.toLowerCase().includes(termo) ||
        matricula.aluno.user.cpf.toLowerCase().includes(termo) ||
        matricula.aluno.user.email.toLowerCase().includes(termo) ||
        matricula.curso.nome.toLowerCase().includes(termo);

      return matchesStatus && matchesSearch;
    });
  }, [lista, searchTerm, statusFilter]);

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetMatriculasQueryKey()});
  };

  const openCreate = () => {
    const primeiraMatriz = listaMatrizes.find((matriz) => matriz.cursoId === listaCursos[0]?.id);
    form.reset({
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      dataNascimento: "",
      cursoId: listaCursos[0]?.id ?? "",
      matrizCurricularId: primeiraMatriz?.id ?? "",
      semestreIngresso: formatPeriodoLetivo(periodo),
    });
    setCreateOpen(true);
  };

  const openStatus = (matricula: Matricula) => {
    setTargetMatricula(matricula);
    statusForm.reset({status: matricula.status});
  };

  const onCreate = form.handleSubmit((payload) => {
    createMatricula(
      {
        ...payload,
        telefone: payload.telefone || undefined,
      },
      {
        onSuccess: (result) => {
          toast.success(`Matrícula criada. RA ${result.ra}`);
          invalidate();
          setCreateOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const onUpdateStatus = statusForm.handleSubmit((payload) => {
    if (!targetMatricula) {
      return;
    }

    updateStatus(
      {id: targetMatricula.id, status: payload.status},
      {
        onSuccess: () => {
          toast.success("Status atualizado.");
          invalidate();
          setTargetMatricula(null);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusCircle />
            Efetivar nova matrícula
          </Button>
        }
        description="Registro acadêmico (RA), ciclo de vida do aluno e vínculo estrutural à matriz curricular MEC."
        eyebrow="Secretaria acadêmica e registros escolares"
        title="Gestão de matrículas e RAs"
      />

      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar por RA (ex: 2026000001), nome do discente ou CPF..."
            value={searchTerm}
          />
          <div className="w-full md:w-52">
            <AdminSelect
              items={[
                {value: "ALL", label: "Todos os status"},
                ...statusOptions.map((status) => ({
                  value: status,
                  label: STATUS_MATRICULA_LABEL[status],
                })),
              ]}
              onValueChange={setStatusFilter}
              value={statusFilter}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Crie uma matrícula informando os dados do aluno, o curso e a matriz curricular."
              icon={FileCheck2}
              title="Nenhuma matrícula"
            />
          ) : filtradas.length === 0 ? (
            <AdminEmptyState
              description="Ajuste o termo de pesquisa ou o filtro de status selecionado."
              icon={FileCheck2}
              title="Nenhuma matrícula encontrada"
            />
          ) : (
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                    Registro acadêmico (RA)
                  </TableHead>
                  <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                    Aluno / contato
                  </TableHead>
                  <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                    Curso / modalidade
                  </TableHead>
                  <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                    Matriz curricular
                  </TableHead>
                  <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                    Período / ingresso
                  </TableHead>
                  <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                    Situação
                  </TableHead>
                  <TableHead className="px-4 text-right text-[10px] font-medium tracking-wider uppercase">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((matricula) => (
                  <TableRow key={matricula.id}>
                    <TableCell className="px-4 font-mono font-bold">
                      {matricula.aluno.ra}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal">
                      <div className="font-semibold text-foreground">
                        {matricula.aluno.user.nome}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        CPF: {matricula.aluno.user.cpf} · {matricula.aluno.user.email}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal">
                      <div className="font-medium text-foreground">{matricula.curso.nome}</div>
                      <Badge
                        className="mt-0.5"
                        variant={
                          matricula.curso.modalidade === "PRESENCIAL"
                            ? "default"
                            : matricula.curso.modalidade === "SEMIPRESENCIAL"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {MODALIDADE_LABEL[matricula.curso.modalidade]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal text-muted-foreground">
                      <div className="max-w-[200px] truncate" title={matricula.matrizCurricular.nome}>
                        {matricula.matrizCurricular.nome}
                      </div>
                      <span className="font-mono text-[10px]">
                        Vigência: {matricula.matrizCurricular.anoVigencia}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 text-center font-mono tabular-nums">
                      <div className="font-semibold text-foreground">
                        {matricula.periodoAtual}º período
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Ingresso: {matricula.semestreIngresso}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <StatusMatriculaBadge status={matricula.status} />
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button onClick={() => openStatus(matricula)} size="sm" variant="outline">
                        <Pencil className="text-primary" />
                        Ciclo de status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setTargetMatricula(null);
          }
        }}
        open={targetMatricula !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar status: RA {targetMatricula?.aluno.ra}</DialogTitle>
            <DialogDescription>
              Aluno: {targetMatricula?.aluno.user.nome} · Curso: {targetMatricula?.curso.nome}
            </DialogDescription>
          </DialogHeader>
          <Form {...statusForm}>
            <form className="space-y-4" onSubmit={onUpdateStatus}>
              <FormField
                control={statusForm.control}
                name="status"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Novo status regulamentar da matrícula</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={statusOptions.map((status) => ({
                          value: status,
                          label: STATUS_CICLO_LABEL[status],
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                A alteração de status reflete imediatamente na capacidade das turmas, na
                elegibilidade para emissão de declarações escolares e nos diários de classe ativos.
              </div>
              <DialogFooter>
                <Button onClick={() => setTargetMatricula(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isUpdating} type="submit">
                  <Check />
                  Atualizar status
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Efetivar matrícula com vínculo curricular</DialogTitle>
            <DialogDescription>
              Cadastro oficial de discente no livro de matrículas do OpenSGA (padrão MEC).
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onCreate}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Nome completo do aluno</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Beatriz Lima Cavalcanti" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>E-mail institucional / contato</FormLabel>
                      <FormControl>
                        <Input placeholder="aluno@opensga.edu.br" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Curso de graduação</FormLabel>
                      <FormControl>
                        <AdminSelect
                          items={listaCursos.map((curso) => ({
                            value: curso.id,
                            label: `${curso.nome} (${MODALIDADE_LABEL[curso.modalidade]})`,
                          }))}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const primeira = listaMatrizes.find((matriz) => matriz.cursoId === value);
                            form.setValue("matrizCurricularId", primeira?.id ?? "");
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="matrizCurricularId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Matriz curricular obrigatória</FormLabel>
                      <FormControl>
                        <AdminSelect
                          items={matrizesDoCurso.map((matriz) => ({
                            value: matriz.id,
                            label: `${matriz.nome} (vigência ${matriz.anoVigencia})`,
                          }))}
                          onValueChange={field.onChange}
                          placeholder="Selecione a matriz"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semestreIngresso"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Semestre de ingresso</FormLabel>
                      <FormControl>
                        <Input placeholder="2026.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center rounded-[calc(var(--radius)-4px)] border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                  O número de Registro Acadêmico (RA) será gerado automaticamente com prefixo do
                  ano de ingresso.
                </div>
              </div>
              <FormField
                control={form.control}
                name="telefone"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(81) 90000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreating} type="submit">
                  Concluir matrícula
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
