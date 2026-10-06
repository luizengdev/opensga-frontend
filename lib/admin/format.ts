import dayjs from "dayjs";

export const formatCurrencyBrl = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDateBr = (value: string) => {
  return dayjs(value).format("DD/MM/YYYY");
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(1).replace(".", ",")}%`;
};
