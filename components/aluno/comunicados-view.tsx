"use client";

import {useState} from "react";
import {Bell, ChevronDown, ChevronUp} from "lucide-react";

import {AlunoEmptyState} from "@/components/aluno/aluno-empty-state";
import {AlunoPageHeader} from "@/components/aluno/aluno-page-header";
import {Button} from "@/components/ui/button";
import {formatDateBr} from "@/lib/admin/format";
import {ROLE_LABEL} from "@/lib/admin/labels";
import {resumoTexto} from "@/lib/aluno/labels";
import {usePortalAluno} from "@/lib/aluno/use-portal-contexto";
import type {AuthRole, PortalContexto} from "@/lib/api/fetch-generated";

interface ComunicadosViewProps {
  initialData: PortalContexto;
}

const destinatariosDoComunicado = (publicoAlvo: AuthRole[]) => {
  return publicoAlvo.map((papel) => ROLE_LABEL[papel]).join(" · ");
};

export const ComunicadosView = ({initialData}: ComunicadosViewProps) => {
  const {contexto} = usePortalAluno(initialData);
  const {comunicados} = contexto;
  const [abertoId, setAbertoId] = useState<string | null>(comunicados[0]?.id ?? null);
  const [filtroPublico, setFiltroPublico] = useState<string>("todos");
  const publicos = Array.from(new Set(comunicados.flatMap((comunicado) => comunicado.publicoAlvo))).sort();
  const comunicadosFiltrados = comunicados.filter((comunicado) => {
    if (filtroPublico === "todos") {
      return true;
    }

    return comunicado.publicoAlvo.includes(filtroPublico as AuthRole);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AlunoPageHeader
        actions={
          comunicados.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted p-1.5">
              <Button
                onClick={() => setFiltroPublico("todos")}
                size="xs"
                variant={filtroPublico === "todos" ? "secondary" : "ghost"}
              >
                Todos
              </Button>
              {publicos.map((papel) => (
                <Button
                  key={papel}
                  onClick={() => setFiltroPublico(papel)}
                  size="xs"
                  variant={filtroPublico === papel ? "secondary" : "ghost"}
                >
                  {ROLE_LABEL[papel]}
                </Button>
              ))}
            </div>
          ) : null
        }
        description="Informes acadêmicos, prazos de provas, orientações de matrícula e eventos."
        eyebrow="MURAL INSTITUCIONAL · CANAL OFICIAL DA IES"
        title="Comunicados & Avisos"
      />

      {comunicadosFiltrados.length === 0 ? (
        <AlunoEmptyState
          description="Não há comunicados recentes para o público selecionado. Você está em dia com as notícias da faculdade."
          icon={Bell}
          title="Nenhum aviso encontrado"
        />
      ) : (
        <div className="space-y-4">
          {comunicadosFiltrados.map((comunicado) => {
            const aberto = abertoId === comunicado.id;

            return (
              <div
                className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
                key={comunicado.id}
              >
                <Button
                  className="h-auto w-full items-start justify-between gap-4 rounded-none p-5 text-left hover:bg-muted/40"
                  onClick={() => setAbertoId(aberto ? null : comunicado.id)}
                  variant="ghost"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {formatDateBr(comunicado.criadoEm)}
                      </span>
                      <span aria-hidden="true" className="text-muted-foreground">
                        ·
                      </span>
                      {comunicado.publicoAlvo.map((papel) => (
                        <span
                          className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-bold text-foreground"
                          key={papel}
                        >
                          {ROLE_LABEL[papel]}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{comunicado.titulo}</h3>
                    {!aberto ? (
                      <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
                        {resumoTexto(comunicado.conteudo)}
                      </p>
                    ) : null}
                  </div>
                  {aberto ? (
                    <ChevronUp className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  )}
                </Button>
                {aberto ? (
                  <div className="space-y-3 border-t border-border bg-muted/60 px-5 pt-3 pb-5 text-xs leading-relaxed font-medium text-foreground">
                    <p className="whitespace-pre-wrap">{comunicado.conteudo}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 font-mono text-xs font-semibold text-muted-foreground">
                      <span>Destinatários: {destinatariosDoComunicado(comunicado.publicoAlvo)}</span>
                      <span>Canal Oficial OpenSGA</span>
                    </div>
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
