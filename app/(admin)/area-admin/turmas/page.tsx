import {TurmasListView} from "@/components/admin/turmas-list-view";
import {getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {
  getCampi,
  getCursos,
  getMatrizes,
  getProfessores,
  getTurmas,
} from "@/lib/api/fetch-generated";
import {requireAdminSession} from "@/lib/auth/require-admin-session";

const TurmasAdminPage = async () => {
  const session = await requireAdminSession();
  const periodo = getPeriodoLetivoAtual();
  const isAdmin = session.role === "ADMIN";

  const [turmas, campi, cursos, matrizes, professores] = await Promise.all([
    getTurmas(periodo),
    isAdmin ? getCampi() : Promise.resolve([]),
    isAdmin ? getCursos() : Promise.resolve([]),
    isAdmin ? getMatrizes() : Promise.resolve([]),
    isAdmin ? getProfessores() : Promise.resolve([]),
  ]);

  return (
    <TurmasListView
      anoLetivo={periodo.anoLetivo}
      initialCampi={campi}
      initialCursos={cursos}
      initialMatrizes={matrizes}
      initialProfessores={professores}
      initialTurmas={turmas}
      isAdmin={isAdmin}
      semestreLetivo={periodo.semestreLetivo}
    />
  );
};

export default TurmasAdminPage;
