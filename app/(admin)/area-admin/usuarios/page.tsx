import {UsuariosView} from "@/components/admin/usuarios-view";
import {getAlunos, getProfessores, getUsers} from "@/lib/api/fetch-generated";
import {requireSecretariaSession} from "@/lib/auth/require-admin-session";

const UsuariosAdminPage = async () => {
  const session = await requireSecretariaSession();
  const [users, professores, alunos] = await Promise.all([
    getUsers(),
    getProfessores(),
    getAlunos(),
  ]);

  return (
    <UsuariosView
      currentUserId={session.sub}
      initialAlunos={alunos}
      initialProfessores={professores}
      initialUsers={users}
    />
  );
};

export default UsuariosAdminPage;
