import {z} from "zod";

export const loginSchema = z.object({
  identificador: z.string().min(3, "Informe e-mail, CPF ou matrícula."),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
