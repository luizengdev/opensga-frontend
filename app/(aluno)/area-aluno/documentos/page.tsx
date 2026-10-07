import {DocumentosView} from "@/components/aluno/documentos-view";
import {getPortalContexto} from "@/lib/api/fetch-generated";
import {requireAlunoSession} from "@/lib/auth/require-aluno-session";

interface DocumentosAlunoPageProps {
  searchParams: Promise<{alunoId?: string}>;
}

const DocumentosAlunoPage = async ({searchParams}: DocumentosAlunoPageProps) => {
  await requireAlunoSession();
  const {alunoId} = await searchParams;
  const contexto = await getPortalContexto(alunoId);

  return <DocumentosView initialData={contexto} />;
};

export default DocumentosAlunoPage;
