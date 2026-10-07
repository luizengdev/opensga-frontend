"use client";

import {FileText} from "lucide-react";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {ModeloDocumentoForm} from "@/components/admin/modelo-documento-form";
import {Card} from "@/components/ui/card";
import type {ModeloDocumento} from "@/lib/api/fetch-generated";
import {useGetModelosDocumento} from "@/lib/api/rc-generated";

interface EmissaoDocumentosViewProps {
  initialModelos: ModeloDocumento[];
}

export const EmissaoDocumentosView = ({initialModelos}: EmissaoDocumentosViewProps) => {
  const {data: modelos} = useGetModelosDocumento({initialData: initialModelos});
  const lista = modelos ?? initialModelos;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description="Libere ou oculte cada certidão no portal e edite o texto oficial interpolado na emissão."
        eyebrow="Secretaria & registro acadêmico"
        title="Emissão de documentos"
      />
      {lista.length === 0 ? (
        <Card>
          <AdminEmptyState
            description="Não há modelos cadastrados. Rode o seed da API para criar declaração, histórico, quitação e carteirinha."
            icon={FileText}
            title="Nenhum modelo de documento"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {lista.map((modelo) => (
            <ModeloDocumentoForm key={modelo.id} modelo={modelo} />
          ))}
        </div>
      )}
    </div>
  );
};
