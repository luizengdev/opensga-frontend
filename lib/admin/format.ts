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

export const formatDateTimeBr = (value: string) => {
  return dayjs(value).format("DD/MM/YYYY [às] HH:mm");
};

export const formatProtocoloOuvidoria = (id: string) => {
  return `#${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(1).replace(".", ",")}%`;
};
