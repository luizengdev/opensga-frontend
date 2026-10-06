"use client";

import {Trash2} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {formatDateTimeBr} from "@/lib/admin/format";
import {ROLE_LABEL} from "@/lib/admin/labels";
import type {Comunicado} from "@/lib/api/fetch-generated";

interface ComunicadoMuralCardProps {
  canManage?: boolean;
  comunicado: Comunicado;
  isDeleting?: boolean;
  onDelete?: () => void;
}

export const ComunicadoMuralCard = ({
  canManage = false,
  comunicado,
  isDeleting = false,
  onDelete,
}: ComunicadoMuralCardProps) => {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-col justify-between gap-2 border-b border-border pb-2 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{comunicado.titulo}</h2>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Emitido por: Secretaria Geral</span>
              <span>·</span>
              <span className="font-mono">{formatDateTimeBr(comunicado.criadoEm)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] text-muted-foreground">Destinatários:</span>
            {comunicado.publicoAlvo.map((papel) => (
              <Badge className="text-[10px]" key={papel} variant="outline">
                {ROLE_LABEL[papel]}
              </Badge>
            ))}
            {canManage && onDelete ? (
              <Button
                aria-label={`Excluir ${comunicado.titulo}`}
                disabled={isDeleting}
                onClick={onDelete}
                size="icon-sm"
                variant="ghost"
              >
                <Trash2 />
              </Button>
            ) : null}
          </div>
        </div>
        <p className="text-xs leading-relaxed whitespace-pre-line text-foreground/90">{comunicado.conteudo}</p>
      </CardContent>
    </Card>
  );
};
