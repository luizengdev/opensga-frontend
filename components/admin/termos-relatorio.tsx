"use client";

import {ClipboardList} from "lucide-react";
import {useMemo, useState} from "react";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminSelect} from "@/components/admin/admin-select";
import {AdminTablePagination} from "@/components/admin/admin-table-pagination";
import {TermoStatusBadge} from "@/components/admin/termo-status-badge";
import {TermoTipoBadge} from "@/components/admin/termo-tipo-badge";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatDateTimeBr} from "@/lib/admin/format";
import {STATUS_TERMO_ABERTURA_LABEL} from "@/lib/admin/labels";
import {countTermosPorStatus, describeTermoAlteracao, describeTermoAlvo} from "@/lib/admin/termos";
import {useClientPagination} from "@/lib/admin/use-client-pagination";
import type {ListTermosQuery, Professor, StatusTermoAbertura, TermoAbertura} from "@/lib/api/fetch-generated";
import {useGetTermos} from "@/lib/api/rc-generated";

interface TermosRelatorioProps {
  initialProfessores: Professor[];
  initialTermos: TermoAbertura[];
}

export const TermosRelatorio = ({initialProfessores, initialTermos}: TermosRelatorioProps) => {
  const [status, setStatus] = useState("ALL");
  const [professorId, setProfessorId] = useState("ALL");
  const [criadoDe, setCriadoDe] = useState("");
  const [criadoAte, setCriadoAte] = useState("");
  const query: ListTermosQuery = {
    ...(status !== "ALL" ? {status: status as StatusTermoAbertura} : {}),
    ...(professorId !== "ALL" ? {professorId} : {}),
    ...(criadoDe ? {criadoDe} : {}),
    ...(criadoAte ? {criadoAte} : {}),
  };
  const isFiltroInicial =
    status === "ALL" && professorId === "ALL" && criadoDe === "" && criadoAte === "";
  const {data: termos} = useGetTermos({
    query,
    initialData: isFiltroInicial ? initialTermos : undefined,
  });
  const lista = termos ?? [];
  const totais = useMemo(() => countTermosPorStatus(termos ?? []), [termos]);
  const pagination = useClientPagination({
    items: lista,
    resetKey: `${status}-${professorId}-${criadoDe}-${criadoAte}`,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Solicitações no filtro</p>
            <p className="font-heading text-2xl font-semibold">{lista.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="font-heading text-2xl font-semibold text-warning">{totais.PENDENTE}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Aprovadas</p>
            <p className="font-heading text-2xl font-semibold text-success">{totais.APROVADO}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Recusadas</p>
            <p className="font-heading text-2xl font-semibold text-destructive">{totais.RECUSADO}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <div className="w-full md:w-44">
            <Input onChange={(event) => setCriadoDe(event.target.value)} type="date" value={criadoDe} />
          </div>
          <div className="w-full md:w-44">
            <Input onChange={(event) => setCriadoAte(event.target.value)} type="date" value={criadoAte} />
          </div>
          <div className="w-full md:w-56">
            <AdminSelect
              items={[
                {value: "ALL", label: "Todos os professores"},
                ...initialProfessores.map((professor) => ({
                  value: professor.id,
                  label: professor.user.nome,
                })),
              ]}
              onValueChange={setProfessorId}
              value={professorId}
            />
          </div>
          <div className="w-full md:w-48">
            <AdminSelect
              items={[
                {value: "ALL", label: "Todos os status"},
                ...(["PENDENTE", "APROVADO", "RECUSADO"] as StatusTermoAbertura[]).map((item) => ({
                  value: item,
                  label: STATUS_TERMO_ABERTURA_LABEL[item],
                })),
              ]}
              onValueChange={setStatus}
              value={status}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-0">
          {lista.length === 0 ? (
            <AdminEmptyState
              description="Ajuste o período, o professor ou o status para localizar solicitações."
              icon={ClipboardList}
              title="Nenhum termo no filtro"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alvo</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Decisão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map((termo) => (
                    <TableRow key={termo.id}>
                      <TableCell>{termo.professor.nome}</TableCell>
                      <TableCell>
                        <TermoTipoBadge tipo={termo.tipo} />
                      </TableCell>
                      <TableCell>{describeTermoAlvo(termo)}</TableCell>
                      <TableCell className="text-xs">{describeTermoAlteracao(termo)}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDateTimeBr(termo.criadoEm)}
                      </TableCell>
                      <TableCell>
                        <TermoStatusBadge status={termo.status} />
                      </TableCell>
                      <TableCell className="text-xs">
                        {termo.decididoPor
                          ? `${termo.decididoPor.nome}${termo.decididoEm ? ` · ${formatDateTimeBr(termo.decididoEm)}` : ""}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4">
                <AdminTablePagination
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                  page={pagination.page}
                  pageCount={pagination.pageCount}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
