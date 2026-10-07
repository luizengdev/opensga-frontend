import {NotasView} from "@/components/aluno/notas-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface NotasAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const NotasAlunoPage = async ({searchParams}: NotasAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <NotasView initialData={contexto} />;
};

export default NotasAlunoPage;
