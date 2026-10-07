import {REGULAMENTO_PADRAO} from "@/lib/academic/regulamento";
import type {ModalidadeCurso} from "@/lib/api/fetch-generated";

export const limiteFaltasDaDisciplina = (
  chTotal: number,
  percentual = REGULAMENTO_PADRAO.limiteFaltasPercentual,
) => {
  return Math.max(0, Math.floor(chTotal * (percentual / 100)));
};

export const splitCargaHoraria = (chTotal: number, modalidade: ModalidadeCurso) => {
  if (chTotal <= 0) {
    return {chPresencial: 0, chSincrona: 0, chAssincrona: 0};
  }

  if (modalidade === "EAD") {
    const chPresencial = Math.max(1, Math.round(chTotal * 0.1));
    const chSincrona = Math.max(1, Math.round(chTotal * 0.1));
    return {
      chPresencial,
      chSincrona,
      chAssincrona: Math.max(0, chTotal - chPresencial - chSincrona),
    };
  }

  if (modalidade === "SEMIPRESENCIAL") {
    const chPresencial = Math.max(1, Math.round(chTotal * 0.3));
    const chSincrona = Math.max(1, Math.round(chTotal * 0.2));
    return {
      chPresencial,
      chSincrona,
      chAssincrona: Math.max(0, chTotal - chPresencial - chSincrona),
    };
  }

  return {chPresencial: chTotal, chSincrona: 0, chAssincrona: 0};
};

export const chExtensaoDaAuditoria = (auditoria: {
  chExtensaoPorTipo?: number;
  chExtensaoTotal: number;
}) => {
  return auditoria.chExtensaoPorTipo ?? auditoria.chExtensaoTotal;
};
