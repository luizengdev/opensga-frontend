import {ParametrizacoesView} from "@/components/admin/parametrizacoes-view";
import {getParametrizacoes} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const ParametrizacoesAdminPage = async () => {
  await requireSecretariaSession();
  const parametros = await getParametrizacoes();

  return <ParametrizacoesView initialParametrizacoes={parametros} />;
};

export default ParametrizacoesAdminPage;
