interface AdminSectionPlaceholderProps {
  description: string;
  title: string;
}

export const AdminSectionPlaceholder = ({
  description,
  title,
}: AdminSectionPlaceholderProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        Portal administrativo
      </span>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
