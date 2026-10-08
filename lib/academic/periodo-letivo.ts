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

export const parsePeriodoLetivo = (value: string) => {
  const [ano, semestre] = value.split(".");
  const anoLetivo = Number(ano);
  const semestreLetivo = Number(semestre) === 2 ? 2 : 1;

  return {anoLetivo, semestreLetivo};
};

export const listPeriodosRecentes = ({
  anoLetivo,
  semestreLetivo,
  quantidade = 6,
}: {
  anoLetivo: number;
  semestreLetivo: number;
  quantidade?: number;
}) => {
  const cursor = anoLetivo * 2 + (semestreLetivo - 1);

  return Array.from({length: quantidade}, (_, index) => {
    const total = cursor - index;
    const ano = Math.floor(total / 2);
    const semestre = ((total % 2) + 1) as 1 | 2;

    return {anoLetivo: ano, semestreLetivo: semestre};
  });
};
