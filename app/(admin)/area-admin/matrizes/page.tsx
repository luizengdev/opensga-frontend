import {MatrizesView} from "@/components/admin/matrizes-view";
import {
  getAuditoriaMec,
  getComponentesMatriz,
  getCursos,
  getDisciplinas,
  getMatrizes,
} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const MatrizesAdminPage = async () => {
  await requireSecretariaSession();
  const [matrizes, cursos, disciplinas] = await Promise.all([
    getMatrizes(),
    getCursos(),
    getDisciplinas(),
  ]);

  const primeira = matrizes[0];
  const [auditoria, componentes] = primeira
    ? await Promise.all([getAuditoriaMec(primeira.id), getComponentesMatriz(primeira.id)])
    : [null, []];

  return (
    <MatrizesView
      initialAuditoria={auditoria}
      initialComponentes={componentes}
      initialCursos={cursos}
      initialDisciplinas={disciplinas}
      initialMatrizes={matrizes}
    />
  );
};

export default MatrizesAdminPage;
