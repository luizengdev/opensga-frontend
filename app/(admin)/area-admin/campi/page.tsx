import {CampiView} from "@/components/admin/campi-view";
import {getCampi, getCursos} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const CampiAdminPage = async () => {
  await requireSecretariaSession();
  const [campi, cursos] = await Promise.all([getCampi(), getCursos()]);

  return <CampiView initialCampi={campi} initialCursos={cursos} />;
};

export default CampiAdminPage;
