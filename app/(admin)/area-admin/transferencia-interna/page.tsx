import {TransferenciaInternaView} from "@/components/admin/transferencia-interna-view";
import {getCampi, getCursos, getMatriculas, getMatrizes} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const TransferenciaInternaPage = async () => {
  await requireSecretariaSession();
  const [matriculas, cursos, matrizes, campi] = await Promise.all([
    getMatriculas(),
    getCursos(),
    getMatrizes(),
    getCampi(),
  ]);

  return (
    <TransferenciaInternaView
      initialCampi={campi}
      initialCursos={cursos}
      initialMatriculas={matriculas}
      initialMatrizes={matrizes}
    />
  );
};

export default TransferenciaInternaPage;
