import {Badge} from "@/components/ui/badge";
import {STATUS_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import type {StatusReclamacao} from "@/lib/api/fetch-generated";

const VARIANT: Record<
  StatusReclamacao,
  "default" | "secondary" | "outline" | "ghost" | "success" | "warning" | "info"
> = {
  ABERTO: "warning",
  EM_ANALISE: "info",
  RESPONDIDO: "success",
  FECHADO: "secondary",
};

interface StatusReclamacaoBadgeProps {
  status: StatusReclamacao;
}

export const StatusReclamacaoBadge = ({status}: StatusReclamacaoBadgeProps) => {
  return <Badge variant={VARIANT[status]}>{STATUS_RECLAMACAO_LABEL[status]}</Badge>;
};
