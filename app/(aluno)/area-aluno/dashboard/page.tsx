import {DashboardView} from "@/components/aluno/dashboard-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface DashboardAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const DashboardAlunoPage = async ({searchParams}: DashboardAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <DashboardView initialData={contexto} />;
};

export default DashboardAlunoPage;
