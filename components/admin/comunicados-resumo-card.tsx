"use client";

import dayjs from "dayjs";
import {Megaphone} from "lucide-react";
import Link from "next/link";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatDateBr, formatDateTimeBr} from "@/lib/admin/format";
import {ROLE_LABEL} from "@/lib/admin/labels";
import type {Comunicado} from "@/lib/api/fetch-generated";

interface ComunicadosResumoCardProps {
  actionLabel: string;
  comunicados: Comunicado[];
  description: string;
  emptyText: string;
  href: string;
  title: string;
}

const isPublicadoHoje = (criadoEm: string) => {
  return dayjs(criadoEm).isSame(dayjs(), "day");
};

export const ComunicadosResumoCard = ({
  actionLabel,
  comunicados,
  description,
  emptyText,
  href,
  title,
}: ComunicadosResumoCardProps) => {
  const vigentes = comunicados.slice(0, 2);
  const [destaque, ...anteriores] = vigentes;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-info/15 text-info">
            <Megaphone className="size-4" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Button
          className="text-xs"
          nativeButton={false}
          render={<Link href={href} />}
          size="sm"
          variant="ghost"
        >
          {actionLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {destaque ? (
          <>
            <Alert className="border-info/40 border-l-info bg-info/10 text-foreground">
              <Megaphone className="text-info" />
              <AlertTitle className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">{destaque.titulo}</span>
                <Badge variant="info">{isPublicadoHoje(destaque.criadoEm) ? "Hoje" : "Em destaque"}</Badge>
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="line-clamp-3 text-xs leading-relaxed text-foreground/80">{destaque.conteudo}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] text-info">{formatDateTimeBr(destaque.criadoEm)}</span>
                  {destaque.publicoAlvo.map((papel) => (
                    <Badge className="text-[10px]" key={papel} variant="outline">
                      {ROLE_LABEL[papel]}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
            {anteriores.map((comunicado) => (
              <Alert className="border-primary/25 bg-primary/5 text-foreground" key={comunicado.id}>
                <AlertTitle className="text-sm">{comunicado.titulo}</AlertTitle>
                <AlertDescription className="space-y-1.5">
                  <p className="line-clamp-2 text-xs">{comunicado.conteudo}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatDateBr(comunicado.criadoEm)}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-4">
            <Megaphone className="size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{emptyText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
