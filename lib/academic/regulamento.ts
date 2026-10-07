export const REGULAMENTO_PADRAO = {
  corteAprovacaoDireta: 6,
  corteMediaFinal: 5,
  limiteFaltasPercentual: 25,
  percentualMinimoExtensao: 10,
};

export const formatCorteNota = (valor: number) => {
  return valor.toFixed(1).replace(".", ",");
};

export const formatPercentualRegra = (valor: number) => {
  return `${valor.toFixed(0)}%`;
};
