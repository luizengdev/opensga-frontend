import {GraduationCap} from "lucide-react";
import Link from "next/link";

import {cn} from "@/lib/utils";

interface NexaUniversityMarkProps {
  compact?: boolean;
  tone?: "default" | "inverse";
}

export const NexaUniversityMark = ({
  compact = false,
  tone = "default",
}: NexaUniversityMarkProps) => {
  const isInverse = tone === "inverse";

  return (
    <Link className="flex min-w-0 items-center gap-2.5" href="/">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[calc(var(--radius)-2px)] shadow-xs",
          compact ? "size-8" : "size-9",
          isInverse
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <GraduationCap className={compact ? "size-4" : "size-5"} />
      </span>
      <span
        className={cn(
          "font-heading font-semibold tracking-tight",
          compact ? "text-base" : "text-lg",
          isInverse ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        Nexa{" "}
        <span
          className={cn(
            "font-medium",
            isInverse ? "text-sidebar-foreground/70" : "text-muted-foreground",
          )}
        >
          University
        </span>
      </span>
    </Link>
  );
};
