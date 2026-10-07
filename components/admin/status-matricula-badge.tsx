import {Badge} from "@/components/ui/badge";
import {STATUS_MATRICULA_LABEL} from "@/lib/admin/labels";
import type {StatusMatricula} from "@/lib/api/fetch-generated";

const VARIANT: Record<
  StatusMatricula,
  "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"
> = {
  ATIVO: "success",
  PRE_MATRICULADO: "info",
  TRANCADO: "warning",
  FORMADO: "secondary",
  TRANSFERIDO: "secondary",
  CANCELADO: "destructive",
  EVADIDO: "destructive",
};

interface StatusMatriculaBadgeProps {
  status: StatusMatricula;
}

export const StatusMatriculaBadge = ({status}: StatusMatriculaBadgeProps) => {
  return <Badge variant={VARIANT[status]}>{STATUS_MATRICULA_LABEL[status]}</Badge>;
};
