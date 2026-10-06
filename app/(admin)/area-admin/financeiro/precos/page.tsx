import {PrecosView} from "@/components/admin/precos-view";
import {getCursos, getPrecos} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const PrecosAdminPage = async () => {
  await requireSecretariaSession();
  const [precos, cursos] = await Promise.all([getPrecos(), getCursos()]);

  return <PrecosView initialCursos={cursos} initialPrecos={precos} />;
};

export default PrecosAdminPage;
