import {Badge} from "@/components/ui/badge";
import {STATUS_FATURA_LABEL} from "@/lib/admin/labels";
import type {StatusFatura} from "@/lib/api/fetch-generated";

const VARIANT: Record<
  StatusFatura,
  "default" | "secondary" | "outline" | "destructive" | "success" | "warning"
> = {
  PAGA: "success",
  PENDENTE: "warning",
  ATRASADA: "destructive",
  CANCELADA: "secondary",
};

interface StatusFaturaBadgeProps {
  status: StatusFatura;
}

export const StatusFaturaBadge = ({status}: StatusFaturaBadgeProps) => {
  return <Badge variant={VARIANT[status]}>{STATUS_FATURA_LABEL[status]}</Badge>;
};
