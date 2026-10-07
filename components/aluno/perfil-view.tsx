"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import Image from "next/image";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import {useChangePassword} from "@/lib/api/rc-generated";
import type {PortalContexto} from "@/lib/api/fetch-generated";

const schema = z
  .object({
    senhaAtual: z.string().min(6),
    senhaNova: z.string().min(8).max(72),
    confirmacao: z.string().min(8),
  })
  .refine((values) => values.senhaNova === values.confirmacao, {
    message: "A confirmação não coincide com a nova senha.",
    path: ["confirmacao"],
  });

type FormValues = z.infer<typeof schema>;

interface PerfilViewProps {
  initialData: PortalContexto;
}

export const PerfilView = ({initialData}: PerfilViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {profile, matricula} = contexto;
  const {mutate: alterarSenha, isPending} = useChangePassword();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senhaAtual: "",
      senhaNova: "",
      confirmacao: "",
    },
  });

  const onSubmit = form.handleSubmit((payload) => {
    alterarSenha(
      {senhaAtual: payload.senhaAtual, senhaNova: payload.senhaNova},
      {
        onSuccess: () => {
          toast.success("Senha atualizada com sucesso.");
          form.reset();
        },
        onError: (error) => {
          toast.error(getMutationErrorMessage(error));
        },
      },
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={<Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>}
        description="Dados cadastrais em leitura e troca de senha do primeiro acesso."
        eyebrow="CONTA DE ACESSO · DADOS CADASTRAIS E SEGURANÇA"
        title="Meu perfil e senha"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-heading text-xl font-bold text-foreground">
              {profile.avatarUrl ? (
                <Image alt={profile.nome} className="object-cover" fill sizes="56px" src={profile.avatarUrl} unoptimized />
              ) : (
                profile.nome.charAt(0)
              )}
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-foreground">{profile.nome}</p>
              <p className="font-mono text-xs font-semibold text-muted-foreground">
                {matricula ? `RA ${matricula.ra}` : profile.aluno?.ra ? `RA ${profile.aluno.ra}` : profile.email}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">E-mail</dt>
              <dd className="font-medium text-foreground">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">CPF</dt>
              <dd className="font-mono font-medium text-foreground">{profile.cpf}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Situação da conta</dt>
              <dd className="font-medium text-foreground">{profile.ativo ? "Ativa" : "Inativa"}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">Trocar senha</h3>
            <p className="text-xs font-medium text-muted-foreground">
              Use a senha provisória do e-mail de matrícula e defina uma nova com no mínimo 8 caracteres.
            </p>
          </div>
          <Form {...form}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="senhaAtual"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Senha atual</FormLabel>
                    <FormControl>
                      <Input autoComplete="current-password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senhaNova"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input autoComplete="new-password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmacao"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input autoComplete="new-password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit">
                Atualizar senha
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
