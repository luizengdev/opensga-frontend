import {Badge} from "@/components/ui/badge";
import {STATUS_DISCIPLINA_LABEL} from "@/lib/aluno/labels";
import {
  STATUS_FATURA_LABEL,
  STATUS_MATRICULA_LABEL,
  STATUS_RECLAMACAO_LABEL,
} from "@/lib/admin/labels";
import type {
  StatusDisciplina,
  StatusFatura,
  StatusMatricula,
  StatusReclamacao,
} from "@/lib/api/fetch-generated";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";

const MATRICULA_VARIANT: Record<StatusMatricula, BadgeVariant> = {
  ATIVO: "success",
  PRE_MATRICULADO: "info",
  TRANCADO: "warning",
  FORMADO: "secondary",
  TRANSFERIDO: "secondary",
  CANCELADO: "destructive",
  EVADIDO: "destructive",
};

const DISCIPLINA_VARIANT: Record<StatusDisciplina, BadgeVariant> = {
  EM_ABERTO: "warning",
  APROVADO: "success",
  RF: "destructive",
  RN: "destructive",
};

const FATURA_VARIANT: Record<StatusFatura, BadgeVariant> = {
  PAGA: "success",
  PENDENTE: "warning",
  ATRASADA: "destructive",
  CANCELADA: "secondary",
};

const RECLAMACAO_VARIANT: Record<StatusReclamacao, BadgeVariant> = {
  ABERTO: "info",
  EM_ANALISE: "warning",
  RESPONDIDO: "success",
  FECHADO: "secondary",
};

interface AlunoStatusBadgeProps {
  kind: "matricula" | "disciplina" | "fatura" | "reclamacao";
  status: StatusMatricula | StatusDisciplina | StatusFatura | StatusReclamacao;
}

export const AlunoStatusBadge = ({kind, status}: AlunoStatusBadgeProps) => {
  if (kind === "matricula") {
    const value = status as StatusMatricula;
    return <Badge variant={MATRICULA_VARIANT[value]}>{STATUS_MATRICULA_LABEL[value]}</Badge>;
  }

  if (kind === "disciplina") {
    const value = status as StatusDisciplina;
    return <Badge variant={DISCIPLINA_VARIANT[value]}>{STATUS_DISCIPLINA_LABEL[value]}</Badge>;
  }

  if (kind === "fatura") {
    const value = status as StatusFatura;
    return <Badge variant={FATURA_VARIANT[value]}>{STATUS_FATURA_LABEL[value]}</Badge>;
  }

  const value = status as StatusReclamacao;
  return <Badge variant={RECLAMACAO_VARIANT[value]}>{STATUS_RECLAMACAO_LABEL[value]}</Badge>;
};
