const TAGS_PERMITIDAS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "DIV", "SPAN"]);
const ALINHAMENTOS = new Set(["left", "center", "right", "justify", "start", "end"]);

export const corpoTemHtml = (corpo: string) => {
  return /<[a-z][\s\S]*>/i.test(corpo);
};

const escaparHtml = (valor: string) => {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

export const corpoParaHtml = (valor: string) => {
  if (corpoTemHtml(valor)) {
    return valor;
  }

  return valor
    .split(/\n+/)
    .map((paragrafo) => paragrafo.trim())
    .filter((paragrafo) => paragrafo.length > 0)
    .map((paragrafo) => `<p>${escaparHtml(paragrafo)}</p>`)
    .join("");
};

const limparNo = (no: Node) => {
  Array.from(no.childNodes).forEach((filho) => {
    if (filho.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const elemento = filho as HTMLElement;

    if (!TAGS_PERMITIDAS.has(elemento.tagName)) {
      elemento.replaceWith(document.createTextNode(elemento.textContent ?? ""));
      return;
    }

    const alinhamento = elemento.style.textAlign || elemento.getAttribute("align") || "";
    Array.from(elemento.attributes).forEach((atributo) => {
      elemento.removeAttribute(atributo.name);
    });

    if (ALINHAMENTOS.has(alinhamento)) {
      elemento.style.textAlign = alinhamento;
    }

    limparNo(elemento);
  });
};

export const sanitizeDocumentoHtml = (html: string) => {
  if (typeof window === "undefined") {
    return html;
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  limparNo(template.content);
  return template.innerHTML;
};
