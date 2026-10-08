"use client";

import {useQueryClient} from "@tanstack/react-query";
import {ClipboardList} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminSelect} from "@/components/admin/admin-select";
import {PendingButtonLabel} from "@/components/pending-button-label";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatPeriodoLetivo,
  listPeriodosRecentes,
  parsePeriodoLetivo,
} from "@/lib/academic/periodo-letivo";
import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {TermoTurmaDisponivel} from "@/lib/api/fetch-generated";
import {
  getGetTermosTurmasQueryKey,
  useCreateTermosTurma,
  useGetTermosTurmas,
} from "@/lib/api/rc-generated";

interface TermoAberturaTurmaSectionProps {
  anoLetivo: number;
  semestreLetivo: number;
  initialTurmas: TermoTurmaDisponivel[];
}

export const TermoAberturaTurmaSection = ({
  anoLetivo: anoInicial,
  semestreLetivo: semestreInicial,
  initialTurmas,
}: TermoAberturaTurmaSectionProps) => {
  const queryClient = useQueryClient();
  const [anoLetivo, setAnoLetivo] = useState(anoInicial);
  const [semestreLetivo, setSemestreLetivo] = useState(semestreInicial);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const periodoAtual = {anoLetivo, semestreLetivo};
  const isPeriodoInicial = anoLetivo === anoInicial && semestreLetivo === semestreInicial;
  const {data: turmas, isFetching} = useGetTermosTurmas({
    query: periodoAtual,
    initialData: isPeriodoInicial ? initialTurmas : undefined,
  });
  const {mutate: solicitar, isPending} = useCreateTermosTurma();
  const lista = turmas ?? [];
  const periodos = listPeriodosRecentes({anoLetivo: anoInicial, semestreLetivo: semestreInicial});
  const todasSelecionadas = lista.length > 0 && lista.every((turma) => selecionadas.includes(turma.id));

  const toggleTurma = (turmaId: string, checked: boolean) => {
    setSelecionadas((atual) => {
      if (checked) {
        return atual.includes(turmaId) ? atual : [...atual, turmaId];
      }

      return atual.filter((id) => id !== turmaId);
    });
  };

  const onSolicitar = () => {
    solicitar(
      {turmaIds: selecionadas},
      {
        onSuccess: () => {
          toast.success("Solicitação de abertura enviada para a Secretaria.");
          setSelecionadas([]);
          void queryClient.invalidateQueries({queryKey: ["/api/v1/termos"]});
          void queryClient.invalidateQueries({queryKey: getGetTermosTurmasQueryKey(periodoAtual)});
        },
        onError: (error) => toast.error(getMutationErrorMessage(error)),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitação por turma completa</CardTitle>
        <CardDescription>
          Selecione turmas com semestre já fechado. A reabertura só ocorre após aprovação da
          Secretaria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full sm:max-w-56">
          <AdminSelect
            items={periodos.map((periodo) => ({
              value: formatPeriodoLetivo(periodo),
              label: formatPeriodoLetivo(periodo),
            }))}
            onValueChange={(value) => {
              const proximo = parsePeriodoLetivo(value);
              setAnoLetivo(proximo.anoLetivo);
              setSemestreLetivo(proximo.semestreLetivo);
              setSelecionadas([]);
            }}
            placeholder="Período letivo"
            value={formatPeriodoLetivo(periodoAtual)}
          />
        </div>
        {lista.length === 0 ? (
          <AdminEmptyState
            description={
              isFetching
                ? "Carregando turmas do período selecionado."
                : "Não há turmas com semestre fechado neste período."
            }
            icon={ClipboardList}
            title="Nenhuma turma disponível"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Selecionar todas as turmas"
                    checked={todasSelecionadas}
                    onCheckedChange={(checked) => {
                      setSelecionadas(checked ? lista.map((turma) => turma.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-right">Diários fechados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((turma) => (
                <TableRow key={turma.id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Selecionar turma ${turma.codigo}`}
                      checked={selecionadas.includes(turma.id)}
                      onCheckedChange={(checked) => toggleTurma(turma.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{turma.codigo}</TableCell>
                  <TableCell>{turma.curso.nome}</TableCell>
                  <TableCell>
                    {turma.disciplina.codigo} · {turma.disciplina.nome}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {turma.diariosFechados}/{turma.diariosTotal}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button disabled={selecionadas.length === 0 || isPending} onClick={onSolicitar} size="sm">
          <PendingButtonLabel
            isPending={isPending}
            label="Solicitar abertura"
            pendingLabel="Enviando..."
          />
        </Button>
      </CardContent>
    </Card>
  );
};
