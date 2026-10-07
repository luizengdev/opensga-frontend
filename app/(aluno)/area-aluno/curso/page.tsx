import {CursoView} from "@/components/aluno/curso-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface CursoAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const CursoAlunoPage = async ({searchParams}: CursoAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <CursoView initialData={contexto} />;
};

export default CursoAlunoPage;
