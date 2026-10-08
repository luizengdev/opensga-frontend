import {redirect} from "next/navigation";

import {TermoAberturaView} from "@/components/admin/termo-abertura-view";
import {getPeriodoLetivoAtual} from "@/lib/academic/periodo-letivo";
import {getParametrizacoes, getTermos, getTermosTurmas} from "@/lib/api/fetch-generated";
import {requireAdminSession} from "@/lib/auth/require-admin-session";

const TermoAberturaPage = async () => {
  const session = await requireAdminSession();

  if (session.role !== "PROFESSOR") {
    redirect("/area-admin/aprovacao-termos");
  }

  const parametros = await getParametrizacoes();
  const periodo = getPeriodoLetivoAtual(parametros);
  const [turmas, termos] = await Promise.all([getTermosTurmas(periodo), getTermos()]);

  return (
    <TermoAberturaView
      anoLetivo={periodo.anoLetivo}
      initialTermos={termos}
      initialTurmas={turmas}
      semestreLetivo={periodo.semestreLetivo}
    />
  );
};

export default TermoAberturaPage;
