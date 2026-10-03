import { requireAlunoSession } from "@/lib/auth/require-aluno-session";

const DashboardAlunoPage = async () => {
  await requireAlunoSession();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Dashboard do aluno
      </h1>
      <p className="text-muted-foreground">
        Home da área do aluno.
      </p>
    </div>
  );
};

export default DashboardAlunoPage;
