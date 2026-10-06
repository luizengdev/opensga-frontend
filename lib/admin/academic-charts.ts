import type {Campus, Fatura, StatusMatricula, Turma} from "@/lib/api/fetch-generated";

export const countByStatus = (
  items: {status: StatusMatricula; quantidade: number}[],
  status: StatusMatricula,
) => {
  return items.find((item) => item.status === status)?.quantidade ?? 0;
};

export const toPercent = (part: number, total: number) => {
  return total > 0 ? Math.round((part / total) * 100) : 0;
};

export const buildOcupacaoPorCampus = (turmas: Turma[] = [], campi: Campus[] = []) => {
  const listaTurmas = Array.isArray(turmas) ? turmas : [];
  const listaCampi = Array.isArray(campi) ? campi : [];

  return listaCampi
    .map((campus) => {
      const doCampus = listaTurmas.filter((turma) => turma.campusId === campus.id);
      const capacidade = doCampus.reduce((acc, turma) => acc + turma.capacidade, 0);
      const inscritos = doCampus.reduce(
        (acc, turma) => acc + (turma.quantidadeDiarios ?? 0),
        0,
      );
      const percentual = capacidade > 0 ? Math.round((inscritos / capacidade) * 100) : 0;

      return {
        id: campus.id,
        nome: campus.nome,
        codigoPolo: campus.codigoPolo,
        capacidade,
        inscritos,
        percentual,
        vagasLivres: Math.max(capacidade - inscritos, 0),
      };
    })
    .filter((polo) => polo.capacidade > 0);
};

export const buildVolumeFinanceiro = (faturas: Fatura[] = []) => {
  const listaFaturas = Array.isArray(faturas) ? faturas : [];
  const liquidado = listaFaturas
    .filter((fatura) => fatura.status === "PAGA")
    .reduce((acc, fatura) => acc + fatura.valor, 0);
  const aVencer = listaFaturas
    .filter((fatura) => fatura.status === "PENDENTE")
    .reduce((acc, fatura) => acc + fatura.valor, 0);
  const inadimplencia = listaFaturas
    .filter((fatura) => fatura.status === "ATRASADA")
    .reduce((acc, fatura) => acc + fatura.valor, 0);
  const total = liquidado + aVencer + inadimplencia;

  return {
    liquidado,
    aVencer,
    inadimplencia,
    total,
    pctLiquidado: toPercent(liquidado, total),
    pctAVencer: toPercent(aVencer, total),
    pctInadimplencia: toPercent(inadimplencia, total),
  };
};

export const scaleExtensaoBar = (percentual: number) => {
  return Math.min(percentual * 6, 100);
};
