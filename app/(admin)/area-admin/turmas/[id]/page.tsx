import {notFound} from "next/navigation";

import {TurmaDetailView} from "@/components/admin/turma-detail-view";
import type {DiarioClasse, Matricula, Turma} from "@/lib/api/fetch-generated";
import {getDiarios, getMatriculas, getTurma} from "@/lib/api/fetch-generated";
import {ApiRequestError} from "@/lib/api/request";
import {requireAdminSession} from "@/lib/auth/require-admin-session";

interface TurmaDetailPageProps {
  params: Promise<{id: string}>;
}

const TurmaDetailPage = async ({params}: TurmaDetailPageProps) => {
  const session = await requireAdminSession();
  const {id} = await params;
  const isAdmin = session.role === "ADMIN";

  let turma: Turma;
  let diarios: DiarioClasse[];
  let matriculas: Matricula[];

  try {
    const [turmaResult, diariosResult, matriculasResult] = await Promise.all([
      getTurma(id),
      getDiarios({turmaId: id}),
      isAdmin ? getMatriculas("ATIVO") : Promise.resolve([]),
    ]);
    turma = turmaResult;
    diarios = diariosResult;
    matriculas = matriculasResult;
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 403)) {
      notFound();
    }

    throw error;
  }

  return (
    <TurmaDetailView
      initialDiarios={diarios}
      initialMatriculas={matriculas}
      initialTurma={turma}
      isAdmin={isAdmin}
    />
  );
};

export default TurmaDetailPage;
