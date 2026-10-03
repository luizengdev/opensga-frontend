import { requireAdminSession } from "@/lib/auth/require-admin-session";

const TurmasAdminPage = async () => {
  await requireAdminSession();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Turmas
      </h1>
      <p className="text-muted-foreground">
        Gerenciamento de turmas e diário de classe.
      </p>
    </div>
  );
};

export default TurmasAdminPage;
