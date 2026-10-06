import {InscricaoCatalog} from "@/components/public/inscricao-catalog";
import {InscricaoSuccess} from "@/components/public/inscricao-success";
import {getCatalogoCursos} from "@/lib/api/fetch-generated";

interface InscricaoPageProps {
  searchParams: Promise<{curso?: string; checkout?: string}>;
}

const InscricaoPage = async ({searchParams}: InscricaoPageProps) => {
  const params = await searchParams;
  const catalogo = await getCatalogoCursos();
  const checkoutOutcome =
    params.checkout === "isento"
      ? "isento"
      : params.checkout === "success"
        ? "pagamento"
        : null;

  return (
    <div className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {params.checkout === "cancel" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            O checkout foi cancelado. Escolha o curso novamente quando quiser
            concluir a matrícula.
          </p>
        ) : null}
        {checkoutOutcome ? (
          <InscricaoSuccess variant={checkoutOutcome} />
        ) : (
          <InscricaoCatalog
            catalogo={catalogo}
            initialCourseHint={params.curso}
          />
        )}
      </div>
    </div>
  );
};

export default InscricaoPage;
