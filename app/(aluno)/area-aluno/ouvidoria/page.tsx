import {OuvidoriaView} from "@/components/aluno/ouvidoria-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface OuvidoriaAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const OuvidoriaAlunoPage = async ({searchParams}: OuvidoriaAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <OuvidoriaView initialData={contexto} />;
};

export default OuvidoriaAlunoPage;
