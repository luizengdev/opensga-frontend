import {Badge} from "@/components/ui/badge";
import {STATUS_TERMO_ABERTURA_LABEL} from "@/lib/admin/labels";
import type {StatusTermoAbertura} from "@/lib/api/fetch-generated";

const VARIANT: Record<StatusTermoAbertura, "warning" | "success" | "destructive"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  RECUSADO: "destructive",
};

interface TermoStatusBadgeProps {
  status: StatusTermoAbertura;
}

export const TermoStatusBadge = ({status}: TermoStatusBadgeProps) => {
  return <Badge variant={VARIANT[status]}>{STATUS_TERMO_ABERTURA_LABEL[status]}</Badge>;
};
