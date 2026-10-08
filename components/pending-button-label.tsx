import type {ReactNode} from "react";

import {Spinner} from "@/components/ui/spinner";

interface PendingButtonLabelProps {
  icon?: ReactNode;
  isPending: boolean;
  label: string;
  pendingLabel?: string;
}

export const PendingButtonLabel = ({
  icon,
  isPending,
  label,
  pendingLabel,
}: PendingButtonLabelProps) => {
  return (
    <>
      {isPending ? <Spinner data-icon="inline-start" /> : icon}
      {isPending ? (pendingLabel ?? label) : label}
    </>
  );
};
