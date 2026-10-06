"use client";

import {AlertTriangle, ShieldAlert} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConflictDialogProps {
  dependencyMessage: string;
  entityName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export const ConflictDialog = ({
  dependencyMessage,
  entityName,
  onOpenChange,
  open,
}: ConflictDialogProps) => {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="border-destructive/30 sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-destructive/15 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <span className="font-mono text-[11px] font-semibold tracking-wider text-destructive uppercase">
                HTTP 409 Conflict · Integridade Relacional
              </span>
              <DialogTitle className="mt-0.5 tracking-tight">
                Exclusão Bloqueada: {entityName}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-muted/50 p-3.5 text-xs leading-relaxed text-foreground/90">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">Regra ON DELETE RESTRICT</p>
              <p className="mt-1 text-muted-foreground">{dependencyMessage}</p>
            </div>
          </div>
        </div>

        <DialogDescription className="text-[11px] text-muted-foreground">
          <strong className="text-foreground">Ação recomendada:</strong> Para prosseguir com o
          cancelamento desta entidade, transfira os registros dependentes ou remova-os
          individualmente na Secretaria.
        </DialogDescription>

        <DialogFooter className="-mx-0 -mb-0 border-0 bg-transparent p-0">
          <Button onClick={() => onOpenChange(false)} size="sm" type="button" variant="outline">
            Entendido, Manter Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
