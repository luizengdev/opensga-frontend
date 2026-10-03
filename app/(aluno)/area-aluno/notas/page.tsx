import { requireAlunoSession } from "@/lib/auth/require-aluno-session";

const NotasAlunoPage = async () => {
  await requireAlunoSession();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Notas e frequência
      </h1>
      <p className="text-muted-foreground">
        Acompanhamento acadêmico do aluno.
      </p>
    </div>
  );
};

export default NotasAlunoPage;
