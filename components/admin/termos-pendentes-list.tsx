"use client";

import {useQueryClient} from "@tanstack/react-query";
import {Check, Inbox, X} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {ConfirmDialog} from "@/components/admin/confirm-dialog";
import {TermoTipoBadge} from "@/components/admin/termo-tipo-badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatDateTimeBr} from "@/lib/admin/format";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import {describeTermoAlteracao, describeTermoAlvo, describeTermoCurso} from "@/lib/admin/termos";
import type {TermoAbertura} from "@/lib/api/fetch-generated";
import {
  getGetTermosQueryKey,
  useAprovarTermo,
  useGetTermos,
  useRecusarTermo,
} from "@/lib/api/rc-generated";

interface TermosPendentesListProps {
  initialPendentes: TermoAbertura[];
}

export const TermosPendentesList = ({initialPendentes}: TermosPendentesListProps) => {
  const queryClient = useQueryClient();
  const {data: pendentes} = useGetTermos({
    query: {status: "PENDENTE"},
    initialData: initialPendentes,
  });
  const {mutate: aprovar, isPending: isAprovando} = useAprovarTermo();
  const {mutate: recusar, isPending: isRecusando} = useRecusarTermo();
  const [alvo, setAlvo] = useState<{id: string; acao: "aprovar" | "recusar"} | null>(null);
  const lista = pendentes ?? initialPendentes;
  const isPending = isAprovando || isRecusando;

  const invalidate = () => {
    void queryClient.invalidateQueries({queryKey: ["/api/v1/termos"]});
    void queryClient.invalidateQueries({queryKey: getGetTermosQueryKey({status: "PENDENTE"})});
  };

  const onConfirm = () => {
    if (!alvo) {
      return;
    }

    const mutate = alvo.acao === "aprovar" ? aprovar : recusar;
    mutate(alvo.id, {
      onSuccess: () => {
        toast.success(
          alvo.acao === "aprovar" ? "Termo aprovado e aplicado no diário." : "Solicitação recusada.",
        );
        setAlvo(null);
        invalidate();
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  };

  if (lista.length === 0) {
    return (
      <Card>
        <CardContent>
          <AdminEmptyState
            description="Quando um professor solicitar reabertura de turma ou alteração de AV, AVS, AV3 ou faltas, a fila aparece aqui."
            icon={Inbox}
            title="Nenhuma solicitação pendente"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((termo) => (
                <TableRow key={termo.id}>
                  <TableCell>
                    <TermoTipoBadge tipo={termo.tipo} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{termo.professor.nome}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {termo.professor.matricula}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{describeTermoAlvo(termo)}</TableCell>
                  <TableCell>{describeTermoCurso(termo)}</TableCell>
                  <TableCell className="text-xs">{describeTermoAlteracao(termo)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDateTimeBr(termo.criadoEm)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={isPending}
                        onClick={() => setAlvo({id: termo.id, acao: "aprovar"})}
                        size="sm"
                        variant="outline"
                      >
                        <Check />
                        Aprovar
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={() => setAlvo({id: termo.id, acao: "recusar"})}
                        size="sm"
                        variant="destructive"
                      >
                        <X />
                        Recusar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        confirmLabel={alvo?.acao === "aprovar" ? "Aprovar" : "Recusar"}
        description={
          alvo?.acao === "aprovar"
            ? "A abertura da turma reabre os diários fechados. A alteração individual grava AV, AVS, AV3 ou faltas e recalcula a situação se o semestre continuar fechado."
            : "A solicitação será recusada e nenhuma nota, falta ou reabertura será aplicada."
        }
        icon={alvo?.acao === "aprovar" ? Check : X}
        isPending={isPending}
        onConfirm={onConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setAlvo(null);
          }
        }}
        open={Boolean(alvo)}
        title={alvo?.acao === "aprovar" ? "Aprovar termo de abertura?" : "Recusar solicitação?"}
      />
    </>
  );
};
