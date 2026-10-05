"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowLeft, ArrowRight, CheckCircle, FileText, Sparkles} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import Link from "next/link";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import dayjs from "dayjs";

import {Badge} from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {getPublicCourseById, PUBLIC_COURSES} from "@/lib/public/courses";

const inscricaoSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  email: z.email("Informe um e-mail válido."),
  cpf: z.string().min(11, "Informe um CPF válido."),
  curso: z.string().min(1, "Selecione um curso."),
  modalidadeIngresso: z.enum(["enem", "vestibular"]),
  notaEnem: z.string(),
  telefone: z.string().min(10, "Informe um telefone válido."),
  documentUploaded: z.boolean(),
});

type InscricaoValues = z.infer<typeof inscricaoSchema>;

const STEP_FIELDS: Array<Array<keyof InscricaoValues>> = [
  ["nome", "email", "cpf", "curso"],
  ["modalidadeIngresso", "notaEnem", "telefone"],
  ["documentUploaded"],
];

interface InscricaoFormProps {
  initialCourseId?: string;
}

export const InscricaoForm = ({initialCourseId}: InscricaoFormProps) => {
  const defaultCourse =
    getPublicCourseById(initialCourseId ?? "")?.id ?? PUBLIC_COURSES[0]?.id ?? "cc";
  const [step, setStep] = useState(1);
  const [protocol, setProtocol] = useState<string | null>(null);

  const form = useForm<InscricaoValues>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      curso: defaultCourse,
      modalidadeIngresso: "enem",
      notaEnem: "780",
      telefone: "",
      documentUploaded: false,
    },
  });

  const values = form.watch();
  const selectedCourse = getPublicCourseById(values.curso);
  const notaEnem = Number(values.notaEnem);

  const goToNextStep = async () => {
    const fields = STEP_FIELDS[step - 1];

    if (!fields) {
      return;
    }

    const isValid = await form.trigger(fields);

    if (!isValid) {
      return;
    }

    if (step === 2 && form.getValues("modalidadeIngresso") === "enem") {
      const nota = Number(form.getValues("notaEnem"));

      if (!Number.isFinite(nota) || nota < 400 || nota > 1000) {
        form.setError("notaEnem", {
          message: "Informe a média do ENEM entre 400 e 1000.",
        });
        return;
      }
    }

    if (step === 3 && !form.getValues("documentUploaded")) {
      form.setError("documentUploaded", {
        message: "Simule o envio do documento de identificação.",
      });
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setProtocol(`NX-${dayjs().format("YYYY-HHmmss")}`);
  };

  const goToPreviousStep = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const formHeader = (
    <div className="space-y-1 bg-slate-950 p-6 text-white sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Ficha de Inscrição
        </h1>
        <Badge
          variant="outline"
          className="h-auto rounded border-blue-800/60 bg-blue-950/80 px-2.5 py-1 text-xs font-medium text-blue-400 shadow-none hover:bg-blue-950/80 hover:text-blue-400 focus-visible:border-blue-800/60 focus-visible:ring-0"
        >
          {`Etapa ${step} de 3`}
        </Badge>
      </div>
      <p className="text-sm text-slate-400">
        Preencha os campos abaixo para iniciar seu processo de admissão.
      </p>
    </div>
  );

  if (protocol) {
    return (
      <>
        {formHeader}
      <motion.div
        className="space-y-6 p-8 text-center"
        initial={{opacity: 0, scale: 0.96}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.35, ease: "easeOut"}}
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Inscrição registrada
          </h2>
          <p className="mx-auto max-w-sm text-sm text-slate-500">
            Seus dados foram recebidos pela esteira de admissões. O protocolo
            provisório é:
          </p>
          <p className="mt-2 inline-block rounded-lg bg-slate-50 px-4 py-2 font-mono text-base font-medium tracking-wider text-slate-900">
            {protocol}
          </p>
        </div>
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-500">
          <p className="font-medium text-slate-900">Próximos passos</p>
          <p>
            1. Enviaremos a confirmação para{" "}
            <strong className="text-slate-900">{values.email}</strong>.
          </p>
          <p>
            2. Use o login do aluno para acompanhar o processo quando a conta
            for liberada.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            nativeButton={false}
            render={<Link href="/login-aluno" />}
          >
            Acessar área do aluno
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Voltar para home
          </Button>
        </div>
      </motion.div>
      </>
    );
  }

  return (
    <>
      {formHeader}
    <Form {...form}>
      <form
        className="space-y-4 p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          void goToNextStep();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.22, ease: "easeOut"}}
          >
        {step === 1 ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Nome completo
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gabriel Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
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
                    <FormLabel className="text-xs tracking-wider uppercase">
                      CPF
                    </FormLabel>
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
              name="curso"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Curso de interesse
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PUBLIC_COURSES.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="modalidadeIngresso"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Forma de ingresso
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={field.value === "enem" ? "secondary" : "outline"}
                      className="h-auto flex-col items-start p-3"
                      onClick={() => field.onChange("enem")}
                    >
                      <span className="text-xs font-medium">Nota do ENEM</span>
                      <span className="text-[11px] text-slate-500">
                        Aproveitamento imediato
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant={
                        field.value === "vestibular" ? "secondary" : "outline"
                      }
                      className="h-auto flex-col items-start p-3"
                      onClick={() => field.onChange("vestibular")}
                    >
                      <span className="text-xs font-medium">
                        Vestibular online
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Prova de lógica e redação
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {values.modalidadeIngresso === "enem" ? (
              <FormField
                control={form.control}
                name="notaEnem"
                render={({field}) => (
                  <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <FormLabel>Sua média geral no ENEM</FormLabel>
                    <FormControl>
                      <Input type="number" min="400" max="1000" {...field} />
                    </FormControl>
                    <p className="text-[11px] text-slate-500">
                      {notaEnem >= 750 ? (
                        <span className="flex items-center gap-1 font-medium text-slate-900">
                          <Sparkles className="size-3" />
                          Você é elegível para análise de bolsa de mérito.
                        </span>
                      ) : (
                        "Notas acima de 700 possuem análise prioritária de bolsa."
                      )}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="telefone"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Telefone / WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="documentUploaded"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Upload de identificação
                  </FormLabel>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto w-full flex-col rounded-xl border-dashed p-6"
                      onClick={() => field.onChange(true)}
                    >
                      {field.value ? (
                        <>
                          <CheckCircle className="size-8 text-emerald-600" />
                          <span className="text-xs font-medium">
                            documento_identificacao.pdf anexado
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Clique para substituir se necessário
                          </span>
                        </>
                      ) : (
                        <>
                          <FileText className="size-8 text-slate-400" />
                          <span className="text-xs font-medium">
                            Clique para simular o upload de documento
                          </span>
                          <span className="text-[11px] text-slate-500">
                            PDF, PNG ou JPG até 10MB
                          </span>
                        </>
                      )}
                    </Button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-900">Resumo da inscrição</p>
              <p>
                Candidato:{" "}
                <span className="font-medium text-slate-900">
                  {values.nome || "—"}
                </span>
              </p>
              <p>
                Curso escolhido:{" "}
                <span className="font-medium text-slate-900">
                  {selectedCourse?.name ?? "—"}
                </span>
              </p>
              <p>
                Entrada:{" "}
                <span className="font-medium text-slate-900">
                  {`1º semestre letivo ${dayjs().format("YYYY")}.2`}
                </span>
              </p>
            </div>
          </div>
        ) : null}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-3 pt-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Voltar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft />
              Portal
            </Button>
          )}
          <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
            {step < 3 ? "Avançar no processo seletivo" : "Confirmar inscrição"}
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
};
