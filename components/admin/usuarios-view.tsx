"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {Pencil, PlusCircle, Trash2, Users} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSearchField} from "@/components/admin/admin-search-field";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {ConflictDialog} from "@/components/admin/conflict-dialog";
import {Badge} from "@/components/ui/badge";
import {PendingButtonLabel} from "@/components/pending-button-label";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatDateBr} from "@/lib/admin/format";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage, isConflictError} from "@/lib/admin/mutation-error";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {Aluno, AuthRole, Professor, User} from "@/lib/api/fetch-generated";
import {
  getGetProfessoresQueryKey,
  getGetUsersQueryKey,
  useCreateAdminUser,
  useCreateProfessor,
  useDeleteUser,
  useGetAlunos,
  useGetProfessores,
  useGetUsers,
  useUpdateProfessor,
  useUpdateUser,
} from "@/lib/api/rc-generated";

const pessoaSchema = z.object({
  tipo: z.enum(["ADMIN", "PROFESSOR"]),
  nome: z.string().min(3).max(150),
  email: z.email(),
  cpf: z.string().length(14),
  telefone: z.string().optional(),
  senha: z.string().min(8).max(72),
  matricula: z.string().optional(),
  titulacao: z.string().optional(),
  departamento: z.string().optional(),
});

const editSchema = z.object({
  nome: z.string().min(3).max(150),
  email: z.email(),
  cpf: z.string().length(14),
  telefone: z.union([z.literal(""), z.string().min(10).max(20)]),
  senha: z.union([z.literal(""), z.string().min(8).max(72)]),
  ativo: z.enum(["true", "false"]),
  titulacao: z.string().max(50).optional(),
  departamento: z.string().max(100).optional(),
});

type PessoaFormValues = z.infer<typeof pessoaSchema>;
type EditFormValues = z.infer<typeof editSchema>;

const roleBadgeVariant = (role: AuthRole) => {
  if (role === "ADMIN") {
    return "default" as const;
  }

  if (role === "PROFESSOR") {
    return "success" as const;
  }

  return "secondary" as const;
};

interface UsuariosViewProps {
  currentUserId: string;
  initialAlunos: Aluno[];
  initialProfessores: Professor[];
  initialUsers: User[];
}

export const UsuariosView = ({
  currentUserId,
  initialAlunos,
  initialProfessores,
  initialUsers,
}: UsuariosViewProps) => {
  const queryClient = useQueryClient();
  const {data: users} = useGetUsers({initialData: initialUsers});
  const {data: professores} = useGetProfessores({initialData: initialProfessores});
  const {data: alunos} = useGetAlunos({initialData: initialAlunos});
  const {mutate: createAdmin, isPending: isCreatingAdmin} = useCreateAdminUser();
  const {mutate: createProfessor, isPending: isCreatingProfessor} = useCreateProfessor();
  const {mutate: updateUser, isPending: isUpdating} = useUpdateUser();
  const {mutate: updateProfessor, isPending: isUpdatingProfessor} = useUpdateProfessor();
  const {mutate: deleteUser, isPending: isDeleting} = useDeleteUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [conflict, setConflict] = useState<{entityName: string; message: string} | null>(null);
  const listaUsers = users ?? initialUsers;
  const listaProfessores = professores ?? initialProfessores;
  const listaAlunos = alunos ?? initialAlunos;

  const professorPorUserId = useMemo(() => {
    return new Map(listaProfessores.map((professor) => [professor.user.id, professor]));
  }, [listaProfessores]);

  const alunoPorUserId = useMemo(() => {
    return new Map(listaAlunos.map((aluno) => [aluno.user.id, aluno]));
  }, [listaAlunos]);

  const filtrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return listaUsers.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesSearch =
        termo.length === 0 ||
        user.nome.toLowerCase().includes(termo) ||
        user.email.toLowerCase().includes(termo) ||
        user.cpf.toLowerCase().includes(termo);

      return matchesRole && matchesSearch;
    });
  }, [listaUsers, roleFilter, searchTerm]);

  const pagination = useClientPagination({
    items: filtrados,
    resetKey: `${searchTerm}|${roleFilter}`,
  });

  const createForm = useForm<PessoaFormValues>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: {
      tipo: "PROFESSOR",
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      senha: "",
      matricula: "",
      titulacao: "",
      departamento: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      senha: "",
      ativo: "true",
      titulacao: "",
      departamento: "",
    },
  });

  const tipo = createForm.watch("tipo");
  const editingProfessor = editingUser ? professorPorUserId.get(editingUser.id) : undefined;
  const editingAluno = editingUser ? alunoPorUserId.get(editingUser.id) : undefined;

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetUsersQueryKey()});
    void queryClient.invalidateQueries({queryKey: getGetProfessoresQueryKey()});
    void queryClient.invalidateQueries({queryKey: ["/api/v1/users/alunos"]});
  };

  const openCreate = () => {
    createForm.reset({
      tipo: "PROFESSOR",
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      senha: "",
      matricula: "",
      titulacao: "",
      departamento: "",
    });
    setCreateOpen(true);
  };

  const openEdit = (user: User) => {
    const professor = professorPorUserId.get(user.id);
    setEditingUser(user);
    editForm.reset({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      telefone: user.telefone ?? "",
      senha: "",
      ativo: user.ativo ? "true" : "false",
      titulacao: professor?.titulacao ?? "",
      departamento: professor?.departamento ?? "",
    });
  };

  const onCreate = createForm.handleSubmit((payload) => {
    if (payload.tipo === "ADMIN") {
      createAdmin(
        {
          nome: payload.nome,
          email: payload.email,
          cpf: payload.cpf,
          senha: payload.senha,
          telefone: payload.telefone || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Administrador cadastrado.");
            invalidate();
            setCreateOpen(false);
          },
          onError: (error) => toast.error(getMutationErrorMessage(error)),
        },
      );
      return;
    }

    if (!payload.matricula || !payload.titulacao || !payload.departamento) {
      toast.error("Informe matrícula, titulação e departamento do professor.");
      return;
    }

    createProfessor(
      {
        nome: payload.nome,
        email: payload.email,
        cpf: payload.cpf,
        senha: payload.senha,
        telefone: payload.telefone || undefined,
        matricula: payload.matricula,
        titulacao: payload.titulacao,
        departamento: payload.departamento,
      },
      {
        onSuccess: () => {
          toast.success("Professor cadastrado.");
          invalidate();
          setCreateOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const onEdit = editForm.handleSubmit((payload) => {
    if (!editingUser) {
      return;
    }

    const professor = professorPorUserId.get(editingUser.id);
    const finish = () => {
      toast.success(`Cadastro de ${payload.nome} atualizado com sucesso.`);
      invalidate();
      setEditingUser(null);
    };

    updateUser(
      {
        id: editingUser.id,
        data: {
          nome: payload.nome,
          email: payload.email,
          cpf: payload.cpf,
          telefone: payload.telefone.length > 0 ? payload.telefone : null,
          ativo: payload.ativo === "true",
          ...(payload.senha.length > 0 ? {senha: payload.senha} : {}),
        },
      },
      {
        onSuccess: () => {
          if (!professor) {
            finish();
            return;
          }

          if (!payload.titulacao || !payload.departamento) {
            toast.error("Informe titulação e departamento do professor.");
            return;
          }

          updateProfessor(
            {
              id: professor.id,
              data: {
                titulacao: payload.titulacao,
                departamento: payload.departamento,
              },
            },
            {
              onSuccess: finish,
              onError: (error) => toast.error(getMutationErrorMessage(error)),
            },
          );
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  const onConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.id === currentUserId) {
      toast.error("Operação bloqueada: o administrador não pode excluir a própria conta ativa.");
      setPendingDelete(null);
      return;
    }

    const user = pendingDelete;

    deleteUser(user.id, {
      onSuccess: () => {
        toast.success(`Usuário ${user.nome} removido.`);
        invalidate();
        setPendingDelete(null);
      },
      onError: (error) => {
        if (isConflictError(error)) {
          setPendingDelete(null);
          setConflict({
            entityName: user.nome,
            message: getMutationErrorMessage(error),
          });
          return;
        }

        toast.error(getMutationErrorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusCircle />
            Novo admin ou professor
          </Button>
        }
        description="Cadastro de administradores da secretaria, professores, alunos e responsáveis legais."
        eyebrow="Gestão de acessos e identidades"
        title="Usuários e pessoas"
      />

      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <AdminSearchField
            onValueChange={setSearchTerm}
            placeholder="Buscar por nome, e-mail institucional ou CPF..."
            value={searchTerm}
          />
          <div className="w-full md:w-56">
            <AdminSelect
              items={[
                {value: "ALL", label: "Todos os papéis"},
                {value: "ADMIN", label: "Administradores (Secretaria)"},
                {value: "PROFESSOR", label: "Professores (Corpo docente)"},
                {value: "ALUNO", label: "Alunos"},
                {value: "RESPONSAVEL", label: "Responsáveis legais"},
              ]}
              onValueChange={setRoleFilter}
              value={roleFilter}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {listaUsers.length === 0 ? (
            <AdminEmptyState
              description="Nenhum usuário retornado pela API."
              icon={Users}
              title="Sem usuários"
            />
          ) : filtrados.length === 0 ? (
            <AdminEmptyState
              description="Ajuste o termo de pesquisa ou o filtro de perfil selecionado."
              icon={Users}
              title="Nenhum usuário encontrado"
            />
          ) : (
            <>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Nome completo
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      E-mail institucional
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      CPF
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Telefone
                    </TableHead>
                    <TableHead className="px-4 text-[10px] font-medium tracking-wider uppercase">
                      Perfil de acesso
                    </TableHead>
                    <TableHead className="px-4 text-center text-[10px] font-medium tracking-wider uppercase">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-right text-[10px] font-medium tracking-wider uppercase">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map((user) => {
                    const isCurrent = user.id === currentUserId;
                    const professor = professorPorUserId.get(user.id);
                    const aluno = alunoPorUserId.get(user.id);

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="px-4 whitespace-normal">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span>{user.nome}</span>
                            {isCurrent ? (
                              <span className="rounded bg-primary/10 px-1.5 font-mono text-[10px] font-medium text-primary">
                                Você
                              </span>
                            ) : null}
                          </div>
                          {professor ? (
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {professor.titulacao} · {professor.matricula} ({professor.departamento})
                            </div>
                          ) : null}
                          {aluno ? (
                            <div className="font-mono text-[10px] text-muted-foreground">
                              RA {aluno.ra}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="px-4 font-mono text-[11px]">{user.email}</TableCell>
                        <TableCell className="px-4 font-mono text-[11px] text-muted-foreground">
                          {user.cpf}
                        </TableCell>
                        <TableCell className="px-4 font-mono text-[11px] text-muted-foreground">
                          {user.telefone || "—"}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant={roleBadgeVariant(user.role)}>
                            {ROLE_LABEL[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          {user.ativo ? (
                            <span className="text-[11px] font-medium text-success-foreground">
                              Ativo
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-muted-foreground">
                              Inativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button onClick={() => openEdit(user)} size="sm" variant="outline">
                              <Pencil className="text-primary" />
                              Editar
                            </Button>
                            <Button
                              aria-label={
                                isCurrent
                                  ? "Não é permitido excluir a própria conta"
                                  : `Excluir ${user.nome}`
                              }
                              disabled={isCurrent || isDeleting}
                              onClick={() => setPendingDelete(user)}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <AdminTablePagination
                className="px-4"
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo usuário interno</DialogTitle>
            <DialogDescription>
              Cadastro de administrador ou professor. CPF no formato 000.000.000-00.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={onCreate}>
              <FormField
                control={createForm.control}
                name="tipo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={[
                          {value: "ADMIN", label: "Administrador"},
                          {value: "PROFESSOR", label: "Professor"},
                        ]}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
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
              </div>
              <FormField
                control={createForm.control}
                name="telefone"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Telefone / contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(81) 90000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="senha"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Senha provisória</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {tipo === "PROFESSOR" ? (
                <>
                  <FormField
                    control={createForm.control}
                    name="matricula"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Matrícula funcional</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={createForm.control}
                      name="titulacao"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Titulação</FormLabel>
                          <FormControl>
                            <Input placeholder="Mestre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="departamento"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : null}
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreatingAdmin || isCreatingProfessor} type="submit">
                  <PendingButtonLabel
                    isPending={isCreatingAdmin || isCreatingProfessor}
                    label="Cadastrar"
                    pendingLabel="Cadastrando..."
                  />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
        open={editingUser !== null}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar cadastro: {editingUser?.nome}</DialogTitle>
            <DialogDescription>
              Dados da conta de acesso. O perfil não muda nesta tela; cadastros específicos por papel
              entram numa etapa seguinte.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4" onSubmit={onEdit}>
              <div className="grid gap-2">
                <Label>Perfil de acesso</Label>
                <Input
                  disabled
                  readOnly
                  value={editingUser ? ROLE_LABEL[editingUser.role] : ""}
                />
              </div>
              {editingProfessor ? (
                <div className="grid gap-2">
                  <Label>Matrícula funcional</Label>
                  <Input disabled readOnly value={editingProfessor.matricula} />
                  <p className="text-sm text-muted-foreground">
                    Identificador do docente. Não é alterado neste cadastro unificado.
                  </p>
                </div>
              ) : null}
              {editingAluno ? (
                <>
                  <div className="grid gap-2">
                    <Label>Registro acadêmico (RA)</Label>
                    <Input disabled readOnly value={editingAluno.ra} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de nascimento</Label>
                    <Input disabled readOnly value={formatDateBr(editingAluno.dataNascimento)} />
                  </div>
                </>
              ) : null}
              <FormField
                control={editForm.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>E-mail institucional</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
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
              </div>
              <FormField
                control={editForm.control}
                name="telefone"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Telefone / contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(81) 90000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="senha"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Deixe em branco para manter a senha atual.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="ativo"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Status da conta</FormLabel>
                    <FormControl>
                      <AdminSelect
                        items={[
                          {value: "true", label: "Conta ativa (acesso permitido)"},
                          {value: "false", label: "Conta bloqueada (acesso suspenso)"},
                        ]}
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editingProfessor ? (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={editForm.control}
                    name="titulacao"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Titulação</FormLabel>
                        <FormControl>
                          <Input placeholder="Mestre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="departamento"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}
              <DialogFooter>
                <Button onClick={() => setEditingUser(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isUpdating || isUpdatingProfessor} type="submit">
                  <PendingButtonLabel
                    isPending={isUpdating || isUpdatingProfessor}
                    label="Salvar alterações"
                    pendingLabel="Salvando..."
                  />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        description={
          pendingDelete
            ? `Excluir o cadastro de ${pendingDelete.nome} (${ROLE_LABEL[pendingDelete.role]})? Esta ação não pode ser desfeita.`
            : ""
        }
        isPending={isDeleting}
        onConfirm={onConfirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        open={pendingDelete !== null}
        title={pendingDelete ? `Remover ${pendingDelete.nome}?` : "Remover usuário"}
      />

      <ConflictDialog
        dependencyMessage={conflict?.message ?? ""}
        entityName={conflict?.entityName ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setConflict(null);
          }
        }}
        open={conflict !== null}
        recommendedAction="Transfira as turmas sob a regência deste professor antes de excluir o cadastro."
      />
    </div>
  );
};
