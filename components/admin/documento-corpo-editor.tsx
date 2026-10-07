"use client";

import {AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {Separator} from "@/components/ui/separator";
import {Toggle} from "@/components/ui/toggle";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {corpoParaHtml} from "@/lib/documento/html";

type Alinhamento = "left" | "center" | "right" | "justify";

interface DocumentoCorpoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const COMANDO_ALINHAMENTO: Record<Alinhamento, string> = {
  left: "justifyLeft",
  center: "justifyCenter",
  right: "justifyRight",
  justify: "justifyFull",
};

export const DocumentoCorpoEditor = ({value, onChange, onBlur}: DocumentoCorpoEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const ultimoValor = useRef(value);
  const [negrito, setNegrito] = useState(false);
  const [alinhamento, setAlinhamento] = useState<Alinhamento[]>(["justify"]);

  const sincronizarBarra = () => {
    setNegrito(document.queryCommandState("bold"));

    if (document.queryCommandState("justifyCenter")) {
      setAlinhamento(["center"]);
      return;
    }

    if (document.queryCommandState("justifyRight")) {
      setAlinhamento(["right"]);
      return;
    }

    if (document.queryCommandState("justifyFull")) {
      setAlinhamento(["justify"]);
      return;
    }

    setAlinhamento(["left"]);
  };

  const emitirHtml = () => {
    const html = editorRef.current?.innerHTML ?? "";
    ultimoValor.current = html;
    onChange(html);
    sincronizarBarra();
  };

  const aplicar = (comando: string) => {
    editorRef.current?.focus();
    document.execCommand(comando, false);
    emitirHtml();
  };

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (value === ultimoValor.current && editorRef.current.innerHTML.length > 0) {
      return;
    }

    editorRef.current.innerHTML = corpoParaHtml(value);
    ultimoValor.current = editorRef.current.innerHTML;
  }, [value]);

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background">
      <div
        className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 p-2"
        onMouseDown={(event) => event.preventDefault()}
      >
        <Toggle
          aria-label="Negrito"
          onPressedChange={() => aplicar("bold")}
          pressed={negrito}
          size="sm"
          variant="outline"
        >
          <Bold />
        </Toggle>
        <Separator className="h-6" orientation="vertical" />
        <ToggleGroup
          onValueChange={(proximo) => {
            const escolhido = proximo[0] as Alinhamento | undefined;
            if (!escolhido) {
              return;
            }

            aplicar(COMANDO_ALINHAMENTO[escolhido]);
          }}
          size="sm"
          spacing={0}
          value={alinhamento}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Alinhar à esquerda" value="left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Centralizar" value="center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Justificar" value="justify">
            <AlignJustify />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Alinhar à direita" value="right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        className="min-h-40 px-3 py-2 text-sm leading-relaxed text-foreground outline-none [&_p]:mb-3 [&_p:last-child]:mb-0"
        contentEditable
        onBlur={onBlur}
        onInput={emitirHtml}
        onKeyUp={sincronizarBarra}
        onMouseUp={sincronizarBarra}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />
    </div>
  );
};
