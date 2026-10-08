"use client";

import {useEffect, useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound} from "lucide-react";
import Image from "next/image";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";
import {useChangePassword} from "@/lib/api/rc-generated";

const schema = z
  .object({
    senhaAtual: z.string().min(6, "Informe a senha utilizada no login."),
    senhaNova: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres.").max(72),
    confirmacao: z.string().min(8, "Repita a nova senha."),
  })
  .refine((values) => values.senhaNova === values.confirmacao, {
    message: "A confirmação não coincide com a nova senha digitada.",
    path: ["confirmacao"],
  });

type FormValues = z.infer<typeof schema>;

interface PerfilViewProps {
  initialData: PortalContexto;
}

export const PerfilView = ({initialData}: PerfilViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {profile} = contexto;
  const {mutate: alterarSenha, isPending} = useChangePassword();
  const [showSenhas, setShowSenhas] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const senhaType = showSenhas ? "text" : "password";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senhaAtual: "",
      senhaNova: "",
      confirmacao: "",
    },
  });

  useEffect(() => {
    if (!senhaAlterada) {
      return;
    }

    const timer = setTimeout(() => {
      setSenhaAlterada(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [senhaAlterada]);

  const onSubmit = form.handleSubmit((payload) => {
    setErroSenha(null);
    setSenhaAlterada(false);
    alterarSenha(
      {senhaAtual: payload.senhaAtual, senhaNova: payload.senhaNova},
      {
        onSuccess: () => {
          form.reset();
          setSenhaAlterada(true);
        },
        onError: (error) => {
          setErroSenha(getMutationErrorMessage(error));
        },
      },
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={<Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>}
        description="Informações cadastrais protegidas e gerenciamento de credenciais de acesso ao OpenSGA."
        eyebrow="CONTA DE ACESSO · DADOS CADASTRAIS & SEGURANÇA"
        title="Meu Perfil & Senha"
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
              <h3 className="font-heading text-lg font-bold text-foreground">{profile.nome}</h3>
              <p className="mt-0.5 font-mono text-xs font-semibold text-muted-foreground">
                {profile.ativo ? "Vínculo Ativo perante a IES" : "Conta inativa"}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-medium text-muted-foreground">E-mail Institucional</span>
                <p className="truncate font-bold text-foreground">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-muted-foreground">Documento CPF</span>
                <p className="font-mono font-bold text-foreground">{profile.cpf}</p>
              </div>
            </div>

            {profile.role === "ALUNO" && profile.aluno ? (
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-2">
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Registro Acadêmico (RA)</span>
                  <p className="font-mono text-sm font-bold text-foreground">{profile.aluno.ra}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Código de Matrícula</span>
                  <p className="font-mono font-semibold break-all text-muted-foreground">{profile.aluno.id}</p>
                </div>
              </div>
            ) : null}

            <div className="border-t border-border pt-2 text-xs leading-relaxed font-medium text-muted-foreground">
              * Para atualização de dados civis (nome social, retificação de CPF ou endereço), procure o atendimento
              presencial do seu polo com os documentos comprobatórios originais.
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 shrink-0 text-foreground" />
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Alterar Senha de Acesso</h3>
                <p className="text-xs font-medium text-muted-foreground">
                  Atualize sua credencial para manter sua conta protegida.
                </p>
              </div>
            </div>
            <Button
              className="h-auto shrink-0 gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              onClick={() => setShowSenhas((atual) => !atual)}
              type="button"
              variant="ghost"
            >
              {showSenhas ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showSenhas ? "Ocultar" : "Exibir"}
            </Button>
          </div>

          {senhaAlterada ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3.5 text-xs font-bold text-success">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Sua senha foi redefinida com sucesso no OpenSGA!</span>
            </div>
          ) : null}

          {erroSenha ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-bold text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{erroSenha}</span>
            </div>
          ) : null}

          <Form {...form}>
            <form className="space-y-4 text-xs" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="senhaAtual"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Senha Atual</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="current-password"
                        className="h-auto py-2 text-xs font-medium"
                        placeholder="Digite a senha utilizada no login"
                        type={senhaType}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senhaNova"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="new-password"
                        className="h-auto py-2 text-xs font-medium"
                        placeholder="Mínimo de 8 caracteres"
                        type={senhaType}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmacao"
                render={({field}) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-xs font-bold text-foreground">Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="new-password"
                        className="h-auto py-2 text-xs font-medium"
                        placeholder="Repita a nova senha"
                        type={senhaType}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="mt-2 h-auto w-full py-2.5 text-xs font-bold" disabled={isPending} type="submit">
                Salvar Nova Senha
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
