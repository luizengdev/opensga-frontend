import dayjs from "dayjs";

export const getPeriodoLetivoCalendario = () => {
  const hoje = dayjs();
  const anoLetivo = hoje.year();
  const semestreLetivo = hoje.month() < 6 ? 1 : 2;

  return {anoLetivo, semestreLetivo};
};

export const getPeriodoLetivoAtual = (institucional?: {
  anoLetivo: number;
  semestreLetivo: number;
} | null) => {
  if (institucional) {
    return {
      anoLetivo: institucional.anoLetivo,
      semestreLetivo: institucional.semestreLetivo,
    };
  }

  return getPeriodoLetivoCalendario();
};

export const formatPeriodoLetivo = ({
  anoLetivo,
  semestreLetivo,
}: {
  anoLetivo: number;
  semestreLetivo: number;
}) => {
  return `${anoLetivo}.${semestreLetivo}`;
};
