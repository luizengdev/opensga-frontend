import {ComunicadosView} from "@/components/admin/comunicados-view";
import {getComunicados} from "@/lib/api/fetch-generated";
import {requireAdminSession} from "@/lib/auth/require-admin-session";

const ComunicadosAdminPage = async () => {
  const session = await requireAdminSession();
  const comunicados = await getComunicados();

  return <ComunicadosView canManage={session.role === "ADMIN"} initialComunicados={comunicados} />;
};

export default ComunicadosAdminPage;
