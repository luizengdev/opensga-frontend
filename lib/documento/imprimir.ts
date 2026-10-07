const PRINT_SHEET_ID = "documento-print-sheet";

export const imprimirFolhaDocumento = ({
  folha,
  titulo,
}: {
  folha: HTMLElement;
  titulo: string;
}) => {
  document.getElementById(PRINT_SHEET_ID)?.remove();

  const folhaImpressao = folha.cloneNode(true) as HTMLElement;
  folhaImpressao.id = PRINT_SHEET_ID;
  folhaImpressao.removeAttribute("aria-hidden");
  document.body.appendChild(folhaImpressao);

  const tituloAnterior = document.title;
  document.title = `${titulo} · Nexa University`;

  const limpar = () => {
    folhaImpressao.remove();
    document.title = tituloAnterior;
    window.removeEventListener("afterprint", limpar);
  };

  window.addEventListener("afterprint", limpar);
  window.print();
};
