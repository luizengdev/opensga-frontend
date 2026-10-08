import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";
import {formatCorteNota, formatPercentualRegra, REGULAMENTO_PADRAO} from "@/lib/academic/regulamento";

export const previewLancamento = ({
  notaAv,
  notaAvs,
  notaAv3,
  totalFaltas,
  chTotal,
  corteAprovacaoDireta = REGULAMENTO_PADRAO.corteAprovacaoDireta,
  limiteFaltasPercentual = REGULAMENTO_PADRAO.limiteFaltasPercentual,
}: {
  notaAv: number | undefined;
  notaAvs: number | undefined;
  notaAv3: number | undefined;
  totalFaltas: number;
  chTotal: number;
  corteAprovacaoDireta?: number;
  limiteFaltasPercentual?: number;
}) => {
  const limiteFaltas = limiteFaltasDaDisciplina(chTotal, limiteFaltasPercentual);
  const avValida = notaAv !== undefined && !Number.isNaN(notaAv);
  const avsValida = notaAvs !== undefined && !Number.isNaN(notaAvs);
  const riscoRf = chTotal > 0 && totalFaltas > limiteFaltas;
  const corteLabel = formatCorteNota(corteAprovacaoDireta);
  const faltasLabel = formatPercentualRegra(limiteFaltasPercentual);

  if (!avValida && !avsValida) {
    return {
      ns: "—",
      mf: "—",
      habilitaAv3: false,
      riscoRf,
      status: riscoRf
        ? `Lançamento parcial · risco de RF no fechamento (faltas > ${faltasLabel} da CH)`
        : "Lançamento parcial · NS e resultado só consolidam no fechamento",
    };
  }

  const ns = Math.max(avValida ? notaAv : Number.NEGATIVE_INFINITY, avsValida ? notaAvs : Number.NEGATIVE_INFINITY);

  if (riscoRf) {
    return {
      ns: ns.toFixed(1),
      mf: "—",
      habilitaAv3: false,
      riscoRf: true,
      status: `Risco de RF no fechamento. Faltas > ${faltasLabel} da CH tornam as notas irrelevantes.`,
    };
  }

  if (ns >= corteAprovacaoDireta) {
    return {
      ns: ns.toFixed(1),
      mf: "—",
      habilitaAv3: false,
      riscoRf: false,
      status: `NS ≥ ${corteLabel} · aprovação e CH só entram no fechamento do semestre`,
    };
  }

  if (notaAv3 === undefined || Number.isNaN(notaAv3)) {
    return {
      ns: ns.toFixed(1),
      mf: "Aguardando AV3",
      habilitaAv3: true,
      riscoRf: false,
      status: "Elegível para AV3. Média final e status só no fechamento.",
    };
  }

  const mf = (ns + notaAv3) / 2;

  return {
    ns: ns.toFixed(1),
    mf: mf.toFixed(1),
    habilitaAv3: true,
    riscoRf: false,
    status: "Prévia de MF · resultado oficial só no fechamento do semestre",
  };
};
