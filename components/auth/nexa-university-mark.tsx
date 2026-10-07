import {GraduationCap} from "lucide-react";
import Link from "next/link";

import {cn} from "@/lib/utils";

interface NexaUniversityMarkProps {
  tone?: "default" | "inverse";
}

export const NexaUniversityMark = ({
  tone = "default",
}: NexaUniversityMarkProps) => {
  const isInverse = tone === "inverse";

  return (
    <Link className="flex items-center gap-2.5" href="/">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-[calc(var(--radius)-2px)] shadow-xs",
          isInverse
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <GraduationCap className="size-5" />
      </span>
      <span
        className={cn(
          "font-heading text-lg font-semibold tracking-tight",
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
