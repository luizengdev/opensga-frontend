import {FaturasView} from "@/components/aluno/faturas-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface FaturasAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const FaturasAlunoPage = async ({searchParams}: FaturasAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <FaturasView initialData={contexto} />;
};

export default FaturasAlunoPage;
