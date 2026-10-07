import {EmissaoDocumentosView} from "@/components/admin/emissao-documentos-view";
import {getModelosDocumento} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const EmissaoDocumentosPage = async () => {
  await requireSecretariaSession();
  const modelos = await getModelosDocumento();

  return <EmissaoDocumentosView initialModelos={modelos} />;
};

export default EmissaoDocumentosPage;
