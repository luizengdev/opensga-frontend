"use client";

import {Check, CheckCircle2, MessageCircle} from "lucide-react";

import {StatusReclamacaoBadge} from "@/components/admin/status-reclamacao-badge";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {formatDateBr, formatProtocoloOuvidoria} from "@/lib/admin/format";
import {ROLE_LABEL, TIPO_RECLAMACAO_LABEL} from "@/lib/admin/labels";
import type {Reclamacao} from "@/lib/api/fetch-generated";

interface ReclamacaoProtocoloCardProps {
  isFechando?: boolean;
  onFechar: () => void;
  onResponder: () => void;
  reclamacao: Reclamacao;
}

export const ReclamacaoProtocoloCard = ({
  isFechando = false,
  onFechar,
  onResponder,
  reclamacao,
}: ReclamacaoProtocoloCardProps) => {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-col justify-between gap-2 border-b border-border pb-2 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">
                {formatProtocoloOuvidoria(reclamacao.id)}
              </span>
              <Badge className="font-mono text-[10px]" variant="outline">
                {TIPO_RECLAMACAO_LABEL[reclamacao.tipo]}
              </Badge>
              <StatusReclamacaoBadge status={reclamacao.status} />
            </div>
            <h2 className="mt-1 text-sm font-semibold tracking-tight text-foreground">
              {reclamacao.assunto}
            </h2>
          </div>
          <div className="text-left text-xs text-muted-foreground sm:text-right">
            <div className="font-medium text-foreground">{reclamacao.usuario.nome}</div>
            <div className="font-mono text-[10px]">
              Perfil: {ROLE_LABEL[reclamacao.usuario.role]} · {formatDateBr(reclamacao.criadoEm)}
            </div>
          </div>
        </div>

        <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/30 p-3 text-xs text-foreground/90">
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">Relato do solicitante:</p>
          <p className="leading-relaxed whitespace-pre-line">{reclamacao.descricao}</p>
        </div>

        {reclamacao.resposta ? (
          <Alert className="border-success/30 bg-success/10 text-foreground">
            <CheckCircle2 className="text-success" />
            <AlertTitle className="text-[11px] font-semibold text-success-foreground">
              Resposta oficial da ouvidoria
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed whitespace-pre-line text-foreground/90">
              {reclamacao.resposta}
            </AlertDescription>
          </Alert>
        ) : null}

        {reclamacao.status !== "FECHADO" ? (
          <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
            <Button onClick={onResponder} size="sm" variant="outline">
              <MessageCircle className="text-primary" />
              {reclamacao.resposta ? "Editar resposta" : "Registrar resposta"}
            </Button>
            {reclamacao.status === "RESPONDIDO" ? (
              <Button disabled={isFechando} onClick={onFechar} size="sm" variant="secondary">
                <Check />
                Encerrar protocolo
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
