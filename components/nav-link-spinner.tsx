"use client";

import {useLinkStatus} from "next/link";

import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";

interface NavLinkSpinnerProps {
  className?: string;
}

export const NavLinkSpinner = ({className}: NavLinkSpinnerProps) => {
  const {pending} = useLinkStatus();

  if (!pending) {
    return null;
  }

  return <Spinner className={cn("size-3.5 shrink-0", className)} />;
};
