import type {LucideIcon} from "lucide-react";

interface AlunoEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const AlunoEmptyState = ({icon: Icon, title, description}: AlunoEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-xs">
      <Icon className="size-8 text-muted-foreground" />
      <p className="font-heading text-base font-bold text-foreground">{title}</p>
      <p className="max-w-md text-xs font-medium text-muted-foreground">{description}</p>
    </div>
  );
};
