import {ConsultaAcademicaView} from "@/components/admin/consulta-academica-view";
import {
  getAlunos,
  getCampi,
  getCursos,
  getDiarios,
  getFaturas,
  getMatriculas,
  getTurmas,
} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const ConsultaAcademicaAdminPage = async () => {
  await requireSecretariaSession();
  const [matriculas, alunos, cursos, campi, turmas, diarios, faturas] = await Promise.all([
    getMatriculas(),
    getAlunos(),
    getCursos(),
    getCampi(),
    getTurmas(),
    getDiarios(),
    getFaturas(),
  ]);

  return (
    <ConsultaAcademicaView
      initialAlunos={alunos}
      initialCampi={campi}
      initialCursos={cursos}
      initialDiarios={diarios}
      initialFaturas={faturas}
      initialMatriculas={matriculas}
      initialTurmas={turmas}
    />
  );
};

export default ConsultaAcademicaAdminPage;
