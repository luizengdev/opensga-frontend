import {GraduationCap} from "lucide-react";
import Link from "next/link";

import {cn} from "@/lib/utils";

interface NexaUniversityMarkProps {
  compact?: boolean;
  linked?: boolean;
  tone?: "default" | "inverse" | "on-primary";
}

export const NexaUniversityMark = ({
  compact = false,
  linked = true,
  tone = "default",
}: NexaUniversityMarkProps) => {
  const isInverse = tone === "inverse";
  const isOnPrimary = tone === "on-primary";
  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[calc(var(--radius)-2px)] shadow-xs",
          compact ? "size-8" : "size-9",
          isOnPrimary
            ? "bg-primary-foreground text-primary"
            : isInverse
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
          isOnPrimary
            ? "text-primary-foreground"
            : isInverse
              ? "text-sidebar-foreground"
              : "text-foreground",
        )}
      >
        Nexa{" "}
        <span
          className={cn(
            "font-medium",
            isOnPrimary
              ? "text-primary-foreground/70"
              : isInverse
                ? "text-sidebar-foreground/70"
                : "text-muted-foreground",
          )}
        >
          University
        </span>
      </span>
    </>
  );

  if (linked) {
    return (
      <Link className="flex min-w-0 items-center gap-2.5" href="/">
        {content}
      </Link>
    );
  }

  return <span className="flex min-w-0 items-center gap-2.5">{content}</span>;
};
