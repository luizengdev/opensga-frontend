import {notFound} from "next/navigation";

import {InscricaoOffer} from "@/components/public/inscricao-offer";
import {getCatalogoCursos} from "@/lib/api/fetch-generated";
import {resolveCatalogCourseId} from "@/lib/public/catalog";

interface InscricaoCursoPageProps {
  params: Promise<{cursoId: string}>;
}

const InscricaoCursoPage = async ({params}: InscricaoCursoPageProps) => {
  const {cursoId} = await params;
  const catalogo = await getCatalogoCursos();
  const resolvedId = resolveCatalogCourseId(catalogo, cursoId) || cursoId;
  const curso = catalogo.find((item) => item.cursoId === resolvedId);

  if (!curso) {
    notFound();
  }

  return <InscricaoOffer catalogo={catalogo} curso={curso} />;
};

export default InscricaoCursoPage;
