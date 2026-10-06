import dayjs from "dayjs";

export const getPeriodoLetivoAtual = () => {
  const hoje = dayjs();
  const anoLetivo = hoje.year();
  const semestreLetivo = hoje.month() < 6 ? 1 : 2;

  return {anoLetivo, semestreLetivo};
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
