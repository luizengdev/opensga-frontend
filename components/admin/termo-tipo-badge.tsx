import {Badge} from "@/components/ui/badge";
import {TIPO_TERMO_ABERTURA_LABEL} from "@/lib/admin/labels";
import type {TipoTermoAbertura} from "@/lib/api/fetch-generated";

interface TermoTipoBadgeProps {
  tipo: TipoTermoAbertura;
}

export const TermoTipoBadge = ({tipo}: TermoTipoBadgeProps) => {
  return (
    <Badge variant={tipo === "TURMA" ? "info" : "secondary"}>
      {TIPO_TERMO_ABERTURA_LABEL[tipo]}
    </Badge>
  );
};
