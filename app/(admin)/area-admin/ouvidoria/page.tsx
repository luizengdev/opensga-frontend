import {OuvidoriaView} from "@/components/admin/ouvidoria-view";
import {getReclamacoes} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const OuvidoriaAdminPage = async () => {
  await requireSecretariaSession();
  const reclamacoes = await getReclamacoes();

  return <OuvidoriaView initialReclamacoes={reclamacoes} />;
};

export default OuvidoriaAdminPage;
