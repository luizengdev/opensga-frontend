import {Info} from "lucide-react";
import Link from "next/link";

import {Alert, AlertAction, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";

interface TermoTurmaEmAbertoAlertProps {
  turmaId: string;
}

export const TermoTurmaEmAbertoAlert = ({turmaId}: TermoTurmaEmAbertoAlertProps) => {
  return (
    <Alert className="border-warning/40 bg-warning/10 text-warning">
      <Info />
      <AlertTitle className="text-warning">Turma ainda não encerrada</AlertTitle>
      <AlertDescription className="text-warning">
        O termo de abertura só vale para turma já fechada. Enquanto o semestre estiver em aberto,
        altere AV, AVS, AV3 e faltas no diário regular desta turma.
      </AlertDescription>
      <AlertAction>
        <Button
          nativeButton={false}
          render={<Link href={`/area-admin/turmas/${turmaId}`} />}
          size="sm"
          variant="outline"
        >
          Abrir diário
        </Button>
      </AlertAction>
    </Alert>
  );
};
