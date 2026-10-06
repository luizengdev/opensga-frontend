import {DisciplinasView} from "@/components/admin/disciplinas-view";
import {getDisciplinas} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const DisciplinasAdminPage = async () => {
  await requireSecretariaSession();
  const disciplinas = await getDisciplinas();

  return <DisciplinasView initialDisciplinas={disciplinas} />;
};

export default DisciplinasAdminPage;
