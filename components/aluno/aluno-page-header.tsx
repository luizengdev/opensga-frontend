import type {ReactNode} from "react";

interface AlunoPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export const AlunoPageHeader = ({eyebrow, title, description, actions}: AlunoPageHeaderProps) => {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-3 md:flex-row md:items-end">
      <div>
        <div className="mb-1.5 font-mono text-xs font-semibold text-muted-foreground">{eyebrow}</div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
