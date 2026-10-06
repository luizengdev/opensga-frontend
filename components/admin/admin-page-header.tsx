import type {ReactNode} from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export const AdminPageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {eyebrow}
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
