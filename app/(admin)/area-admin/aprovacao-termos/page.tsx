import {AprovacaoTermosView} from "@/components/admin/aprovacao-termos-view";
import {getProfessores, getTermos} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const AprovacaoTermosPage = async () => {
  await requireSecretariaSession();
  const [pendentes, termos, professores] = await Promise.all([
    getTermos({status: "PENDENTE"}),
    getTermos(),
    getProfessores(),
  ]);

  return (
    <AprovacaoTermosView
      initialPendentes={pendentes}
      initialProfessores={professores}
      initialTermos={termos}
    />
  );
};

export default AprovacaoTermosPage;
