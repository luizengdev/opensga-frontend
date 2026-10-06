import {MatriculasView} from "@/components/admin/matriculas-view";
import {getCursos, getMatriculas, getMatrizes} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const MatriculasAdminPage = async () => {
  await requireSecretariaSession();
  const [matriculas, cursos, matrizes] = await Promise.all([
    getMatriculas(),
    getCursos(),
    getMatrizes(),
  ]);

  return (
    <MatriculasView
      initialCursos={cursos}
      initialMatriculas={matriculas}
      initialMatrizes={matrizes}
    />
  );
};

export default MatriculasAdminPage;
