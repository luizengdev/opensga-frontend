import {limiteFaltasDaDisciplina} from "@/lib/academic/carga-horaria";
import type {PortalDisciplina} from "@/lib/api/fetch-generated";

export const notaSemestralVisivel = (disciplina: PortalDisciplina) => {
  if (disciplina.notaSemestral !== null) {
    return disciplina.notaSemestral;
  }

  const valores = [disciplina.notaAv, disciplina.notaAvs].filter((nota): nota is number => nota !== null);

  if (valores.length === 0) {
    return null;
  }

  return Math.max(...valores);
};

export const frequenciaPercentual = ({
  totalFaltas,
  chTotal,
}: {
  totalFaltas: number;
  chTotal: number;
}) => {
  if (chTotal <= 0) {
    return 100;
  }

  return Math.max(0, Math.round(((chTotal - totalFaltas) / chTotal) * 100));
};

export const isRfPorFalta = ({
  totalFaltas,
  chTotal,
  limiteFaltasPercentual,
}: {
  totalFaltas: number;
  chTotal: number;
  limiteFaltasPercentual?: number;
}) => {
  return totalFaltas > limiteFaltasDaDisciplina(chTotal, limiteFaltasPercentual);
};

export const isRiscoRf = ({
  totalFaltas,
  chTotal,
  limiteFaltasPercentual,
}: {
  totalFaltas: number;
  chTotal: number;
  limiteFaltasPercentual?: number;
}) => {
  const limite = limiteFaltasDaDisciplina(chTotal, limiteFaltasPercentual);
  return totalFaltas > limite || totalFaltas >= Math.max(0, limite - 2);
};

export const formatNota = (nota: number | null) => {
  if (nota === null) {
    return "—";
  }

  return nota.toFixed(1).replace(".", ",");
};
