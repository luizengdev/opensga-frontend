import {MatriculaView} from "@/components/aluno/matricula-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface MatriculaAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const MatriculaAlunoPage = async ({searchParams}: MatriculaAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <MatriculaView initialData={contexto} />;
};

export default MatriculaAlunoPage;
