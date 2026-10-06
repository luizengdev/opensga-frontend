import {ComunicadosView} from "@/components/admin/comunicados-view";
import {getComunicados} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const ComunicadosAdminPage = async () => {
  await requireSecretariaSession();
  const comunicados = await getComunicados();

  return <ComunicadosView initialComunicados={comunicados} />;
};

export default ComunicadosAdminPage;
