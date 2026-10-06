"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {PlusCircle, Trash2, Users} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {Aluno, Professor, User} from "@/lib/api/fetch-generated";
import {
  getGetProfessoresQueryKey,
  getGetUsersQueryKey,
  useCreateAdminUser,
  useCreateProfessor,
  useDeleteUser,
  useGetAlunos,
  useGetProfessores,
  useGetUsers,
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

type PessoaFormValues = z.infer<typeof pessoaSchema>;

interface UsuariosViewProps {
  initialAlunos: Aluno[];
  initialProfessores: Professor[];
  initialUsers: User[];
}

export const UsuariosView = ({
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
  const {mutate: deleteUser, isPending: isDeleting} = useDeleteUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const listaUsers = users ?? initialUsers;
  const listaProfessores = professores ?? initialProfessores;
  const listaAlunos = alunos ?? initialAlunos;

  const form = useForm<PessoaFormValues>({
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

  const tipo = form.watch("tipo");

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: getGetUsersQueryKey()});
    void queryClient.invalidateQueries({queryKey: getGetProfessoresQueryKey()});
    void queryClient.invalidateQueries({queryKey: ["/api/v1/users/alunos"]});
  };

  const onSubmit = form.handleSubmit((payload) => {
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
            setDialogOpen(false);
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
          setDialogOpen(false);
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusCircle />
            Novo admin ou professor
          </Button>
        }
        description="Administradores e professores podem ser criados aqui. Alunos entram pela matrícula ou inscrição pública."
        eyebrow="Secretaria e pessoas"
        title="Gestão de pessoas"
      />

      <Card>
        <CardContent>
          {listaUsers.length === 0 ? (
            <AdminEmptyState
              description="Nenhum usuário retornado pela API."
              icon={Users}
              title="Sem usuários"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell className="font-mono text-xs">{user.email}</TableCell>
                    <TableCell className="font-mono text-xs">{user.cpf}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABEL[user.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.ativo ? "default" : "secondary"}>
                        {user.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Excluir ${user.nome}`}
                        disabled={isDeleting}
                        onClick={() =>
                          deleteUser(user.id, {
                            onSuccess: () => {
                              toast.success("Usuário removido.");
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold">Professores</h2>
          {listaProfessores.map((professor) => (
            <div
              className="flex items-center justify-between rounded-[calc(var(--radius)-4px)] border border-border p-3 text-xs"
              key={professor.id}
            >
              <div>
                <p className="font-medium text-foreground">{professor.user.nome}</p>
                <p className="font-mono text-muted-foreground">
                  {professor.matricula} · {professor.titulacao} · {professor.departamento}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold">Alunos (somente leitura)</h2>
          {listaAlunos.map((aluno) => (
            <div
              className="flex items-center justify-between rounded-[calc(var(--radius)-4px)] border border-border p-3 text-xs"
              key={aluno.id}
            >
              <div>
                <p className="font-medium text-foreground">{aluno.user.nome}</p>
                <p className="font-mono text-muted-foreground">
                  RA {aluno.ra} · {aluno.user.email}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo usuário interno</DialogTitle>
            <DialogDescription>
              Cadastro de administrador ou professor. CPF no formato 000.000.000-00.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
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
                control={form.control}
                name="nome"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
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
              </div>
              <FormField
                control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isCreatingAdmin || isCreatingProfessor} type="submit">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
