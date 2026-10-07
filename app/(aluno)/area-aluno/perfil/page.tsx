import {PerfilView} from "@/components/aluno/perfil-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface PerfilAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const PerfilAlunoPage = async ({searchParams}: PerfilAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <PerfilView initialData={contexto} />;
};

export default PerfilAlunoPage;
