import {ComunicadosView} from "@/components/aluno/comunicados-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface ComunicadosAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const ComunicadosAlunoPage = async ({searchParams}: ComunicadosAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <ComunicadosView initialData={contexto} />;
};

export default ComunicadosAlunoPage;
