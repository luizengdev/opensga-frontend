"use client";

import {Inbox} from "lucide-react";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {TermoStatusBadge} from "@/components/admin/termo-status-badge";
import {TermoTipoBadge} from "@/components/admin/termo-tipo-badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatDateTimeBr} from "@/lib/admin/format";
import {describeTermoAlteracao, describeTermoAlvo} from "@/lib/admin/termos";
import type {TermoAbertura} from "@/lib/api/fetch-generated";
import {useGetTermos} from "@/lib/api/rc-generated";

interface TermoAberturaSolicitacoesProps {
  initialTermos: TermoAbertura[];
}

export const TermoAberturaSolicitacoes = ({initialTermos}: TermoAberturaSolicitacoesProps) => {
  const {data: termos} = useGetTermos({initialData: initialTermos});
  const lista = termos ?? initialTermos;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações enviadas</CardTitle>
        <CardDescription>
          Acompanhe o andamento na Secretaria. Pendentes aguardam aprovação ou recusa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lista.length === 0 ? (
          <AdminEmptyState
            description="As solicitações de abertura de turma e de alteração individual aparecerão aqui."
            icon={Inbox}
            title="Nenhuma solicitação registrada"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((termo) => (
                <TableRow key={termo.id}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
