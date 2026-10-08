import {Spinner} from "@/components/ui/spinner";

interface PageLoadingProps {
  label?: string;
}

export const PageLoading = ({label = "Carregando…"}: PageLoadingProps) => {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3"
      role="status"
    >
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
};
