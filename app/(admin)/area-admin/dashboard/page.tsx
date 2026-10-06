import {DashboardAdminView} from "@/components/admin/dashboard-admin-view";
import {DashboardProfessorView} from "@/components/admin/dashboard-professor-view";
import {getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {
  getAuditoriaMec,
  getCampi,
  getComunicados,
  getDashboardAdmin,
  getDashboardProfessor,
  getDiarios,
  getFaturas,
  getMatrizes,
  getMe,
  getTurmas,
} from "@/lib/api/fetch-generated";
import {requireAdminSession} from "@/lib/auth/require-admin-session";

const DashboardAdminPage = async () => {
  const session = await requireAdminSession();
  const periodo = getPeriodoLetivoAtual();

  if (session.role === "PROFESSOR") {
    const [dashboard, turmas, diarios, me, comunicados] = await Promise.all([
      getDashboardProfessor(periodo),
      getTurmas(periodo),
      getDiarios(),
      getMe(),
      getComunicados(),
    ]);

    return (
      <DashboardProfessorView
        initialComunicados={comunicados}
        initialDashboard={dashboard}
        initialDiarios={diarios}
        initialTurmas={turmas}
        nome={me.nome}
      />
    );
  }

  const [dashboard, turmas, faturas, comunicados, campi, matrizes] = await Promise.all([
    getDashboardAdmin(periodo),
    getTurmas(periodo),
    getFaturas(),
    getComunicados({publicoAlvo: "ADMIN"}),
    getCampi(),
    getMatrizes(),
  ]);

  const auditorias = (
    await Promise.allSettled(
      matrizes.filter((matriz) => matriz.ativo).map((matriz) => getAuditoriaMec(matriz.id)),
    )
  )
    .filter((resultado) => resultado.status === "fulfilled")
    .map((resultado) => resultado.value);

  return (
    <DashboardAdminView
      initialAuditorias={auditorias}
      initialCampi={campi}
      initialComunicados={comunicados}
      initialDashboard={dashboard}
      initialFaturas={faturas}
      initialTurmas={turmas}
    />
  );
};

export default DashboardAdminPage;
