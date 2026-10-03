import { requireAdminSession } from "@/lib/auth/require-admin-session";

const DashboardAdminPage = async () => {
  await requireAdminSession();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Dashboard administrativo
      </h1>
      <p className="text-muted-foreground">
        Home da área administrativa e do professor.
      </p>
    </div>
  );
};

export default DashboardAdminPage;
