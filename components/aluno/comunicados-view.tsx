"use client";

import {useState} from "react";
import {Bell} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {Button} from "@/components/ui/button";
import {formatDateTimeBr} from "@/lib/admin/format";
import {resumoTexto} from "@/lib/aluno/labels";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {PortalContexto} from "@/lib/api/fetch-generated";

interface ComunicadosViewProps {
  initialData: PortalContexto;
}

export const ComunicadosView = ({initialData}: ComunicadosViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {comunicados} = contexto;
  const [abertoId, setAbertoId] = useState<string | null>(comunicados[0]?.id ?? null);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        description="Mural de leitura. Comunicados filtrados para o seu papel (aluno ou responsável)."
        eyebrow="MURAL INSTITUCIONAL"
        title="Comunicados"
      />
      {comunicados.length === 0 ? (
        <AlunoEmptyState
          description="Quando a secretaria publicar avisos para o seu perfil, eles aparecem aqui."
          icon={Bell}
          title="Nenhum comunicado no momento"
        />
      ) : (
        <div className="space-y-3">
          {comunicados.map((comunicado) => {
            const aberto = abertoId === comunicado.id;

            return (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs" key={comunicado.id}>
                <Button
                  className="h-auto w-full items-start justify-between gap-4 rounded-none p-5 text-left"
                  onClick={() => setAbertoId(aberto ? null : comunicado.id)}
                  variant="ghost"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-[11px] font-semibold text-muted-foreground">
                      {formatDateTimeBr(comunicado.criadoEm)}
                    </p>
                    <h3 className="font-heading text-base font-bold text-foreground">{comunicado.titulo}</h3>
                    {!aberto ? (
                      <p className="text-xs font-medium text-muted-foreground">{resumoTexto(comunicado.conteudo)}</p>
                    ) : null}
                  </div>
                </Button>
                {aberto ? (
                  <div className="border-t border-border bg-muted/60 p-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {comunicado.conteudo}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
