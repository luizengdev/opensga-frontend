"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Check} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import dayjs from "dayjs";

import {InscricaoIngressoOptions} from "@/components/public/inscricao-ingresso-options";
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
import type {CatalogoCurso, InscricaoAcesso} from "@/lib/api/fetch-generated";
import {useCreateInscricao} from "@/lib/api/rc-generated";
import {
  formatCpf,
  formatTelefone,
  getModalidadeLabel,
  getTipoGraduacaoLabel,
} from "@/lib/public/catalog";

const inscricaoSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  email: z.email("Informe um e-mail válido."),
  telefone: z.string().min(14, "Informe um celular com DDD."),
  cpf: z.string().length(14, "Informe um CPF no formato 000.000.000-00."),
  aceitePrivacidade: z.boolean().refine((value) => value, {
    message: "É necessário aceitar a política de privacidade.",
  }),
  dataNascimento: z.iso.date("Informe a data de nascimento."),
  formaIngresso: z.enum(["VESTIBULAR", "ENEM", "DIPLOMA", "TRANSFERENCIA"], {
    error: "Selecione a forma de ingresso.",
  }),
});

type InscricaoValues = z.infer<typeof inscricaoSchema>;

interface InscricaoFormProps {
  curso: CatalogoCurso;
  onBack: () => void;
  onCompleted: (acesso: InscricaoAcesso) => void;
}

export const InscricaoForm = ({curso, onBack, onCompleted}: InscricaoFormProps) => {
  const {mutate: createInscricao, isPending: isCreating} = useCreateInscricao();
  const [section, setSection] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<InscricaoValues>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      aceitePrivacidade: false,
      dataNascimento: "",
      formaIngresso: undefined,
    },
  });

  const goToNextSection = async () => {
    const isValid = await form.trigger([
      "nome",
      "email",
      "telefone",
      "cpf",
      "aceitePrivacidade",
    ]);

    if (!isValid) {
      return;
    }

    setSection(2);
  };

  const onSubmit = form.handleSubmit((values) => {
    const birthDate = dayjs(values.dataNascimento);

    if (!birthDate.isValid() || !birthDate.isBefore(dayjs(), "day")) {
      form.setError("dataNascimento", {
        message: "Informe uma data de nascimento válida.",
      });
      return;
    }

    setSubmitError(null);
    createInscricao(
      {
        nome: values.nome,
        email: values.email,
        cpf: values.cpf,
        telefone: values.telefone,
        dataNascimento: values.dataNascimento,
        cursoModalidadeId: curso.cursoId,
      },
      {
        onSuccess: (checkout) => {
          if (checkout.url) {
            window.location.assign(checkout.url);
            return;
          }

          if (checkout.acesso) {
            onCompleted(checkout.acesso);
            return;
          }

          window.location.assign("/inscricao?checkout=isento");
        },
        onError: (error) => {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Erro ao processar requisição.",
          );
        },
      },
    );
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-medium text-blue-900">Curso selecionado</p>
          <p>
            {`${curso.nome} · ${getModalidadeLabel(curso.modalidade)} · ${getTipoGraduacaoLabel(curso.tipoGraduacao)}`}
          </p>
          <p>{`${curso.campus.nome} · ${curso.campus.cidade}/${curso.campus.estado}`}</p>
        </div>
        {section === 1 ? (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900">
                Complete seu cadastro
              </h2>
              <p className="text-sm text-slate-500">Leva menos de 1 minuto!</p>
            </div>
            <FormField
              control={form.control}
              name="nome"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
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
                  <FormLabel>E-mail principal</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seuemail@exemplo.com.br"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Celular com DDD</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(event) => {
                        field.onChange(formatTelefone(event.target.value));
                      }}
                    />
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
                    <Input
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      {...field}
                      onChange={(event) => {
                        field.onChange(formatCpf(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aceitePrivacidade"
              render={({field}) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={
                        field.value
                          ? "size-5 rounded border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                          : "size-5 rounded"
                      }
                      onClick={() => field.onChange(!field.value)}
                    >
                      {field.value ? <Check className="size-3" /> : null}
                    </Button>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Li e aceito a política de privacidade. Autorizo a coleta e
                      o tratamento dos dados para matrícula na Nexa University.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900">
                Continue sua inscrição
              </h2>
            </div>
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
              name="formaIngresso"
              render={({field}) => (
                <FormItem>
                  <InscricaoIngressoOptions
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitError ? (
              <p className="text-xs text-red-600">{submitError}</p>
            ) : null}
          </div>
        )}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={section === 1 ? onBack : () => setSection(1)}
            disabled={isCreating}
          >
            Voltar
          </Button>
          {section === 1 ? (
            <Button
              type="button"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                void goToNextSection();
              }}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? "Enviando inscrição..." : "Concluir inscrição"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
