interface ConsultaAcademicaInfoFieldProps {
  label: string;
  value: string;
}

export const ConsultaAcademicaInfoField = ({label, value}: ConsultaAcademicaInfoFieldProps) => {
  return (
    <div className="space-y-0.5 rounded-[calc(var(--radius)-4px)] bg-muted/40 p-2.5">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
};
