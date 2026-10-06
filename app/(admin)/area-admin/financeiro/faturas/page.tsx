import {FaturasView} from "@/components/admin/faturas-view";
import {getAlunos, getFaturas} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const FaturasAdminPage = async () => {
  await requireSecretariaSession();
  const [faturas, alunos] = await Promise.all([getFaturas(), getAlunos()]);

  return <FaturasView initialAlunos={alunos} initialFaturas={faturas} />;
};

export default FaturasAdminPage;
