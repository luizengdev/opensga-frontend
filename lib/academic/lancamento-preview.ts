import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";

export const previewLancamento = ({
  notaAv,
  notaAvs,
  notaAv3,
  totalFaltas,
  chTotal,
}: {
  notaAv: number | undefined;
  notaAvs: number | undefined;
  notaAv3: number | undefined;
  totalFaltas: number;
  chTotal: number;
}) => {
  const limiteFaltas = limiteFaltasDaDisciplina(chTotal);
  const avValida = notaAv !== undefined && !Number.isNaN(notaAv);
  const avsValida = notaAvs !== undefined && !Number.isNaN(notaAvs);
  const riscoRf = chTotal > 0 && totalFaltas > limiteFaltas;

  if (!avValida && !avsValida) {
    return {
      ns: "—",
      mf: "—",
      habilitaAv3: false,
      riscoRf,
      status: riscoRf
        ? "Lançamento parcial · risco de RF no fechamento (faltas > 25% da CH)"
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
      status: "Risco de RF no fechamento. Faltas > 25% da CH tornam as notas irrelevantes.",
    };
  }

  if (ns >= 6) {
    return {
      ns: ns.toFixed(1),
      mf: "—",
      habilitaAv3: false,
      riscoRf: false,
      status: "NS ≥ 6,0 · aprovação e CH só entram no fechamento do semestre",
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
