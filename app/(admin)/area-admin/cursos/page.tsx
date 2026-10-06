import {CursosView} from "@/components/admin/cursos-view";
import {getCampi, getCursos} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const CursosAdminPage = async () => {
  await requireSecretariaSession();
  const [cursos, campi] = await Promise.all([getCursos(), getCampi()]);

  return <CursosView initialCampi={campi} initialCursos={cursos} />;
};

export default CursosAdminPage;
