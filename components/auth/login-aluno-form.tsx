"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {useForm} from "react-hook-form";

import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useLogin} from "@/lib/api/rc-generated";
import {loginSchema, type LoginFormValues} from "@/lib/auth/login-schema";
import {isAlunoRole} from "@/lib/auth/roles";
import {setAuthTokenCookie} from "@/lib/auth/set-auth-cookie";

export const LoginAlunoForm = () => {
  const {mutate: login, isPending: isLoggingIn} = useLogin();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identificador: "",
      senha: "",
    },
  });

  const onSubmit = form.handleSubmit((payload) => {
    setSubmitError(null);
    login(payload, {
      onSuccess: (result) => {
        if (!isAlunoRole(result.user.role)) {
          setSubmitError("Esta área é exclusiva para alunos e responsáveis.");
          return;
        }

        void setAuthTokenCookie(result.token)
          .then(() => {
            window.location.assign("/area-aluno/dashboard");
          })
          .catch(() => {
            setSubmitError("Não foi possível gravar a sessão. Tente novamente.");
          });
      },
      onError: (error) => {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Erro ao processar requisição.",
        );
      },
    });
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="identificador"
          render={({field}) => (
            <FormItem>
              <FormLabel>E-mail, CPF ou RA</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  className="h-10"
                  placeholder="aluno@opensga.dev"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({field}) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  autoComplete="current-password"
                  className="h-10"
                  type="password"
                  placeholder="Digite sua senha"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError ? (
          <p className="text-sm text-destructive">{submitError}</p>
        ) : null}
        <Button className="mt-1 w-full" disabled={isLoggingIn} size="lg" type="submit">
          {isLoggingIn ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
};
