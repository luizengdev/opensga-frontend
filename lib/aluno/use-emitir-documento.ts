"use client";

import {useState} from "react";
import {toast} from "sonner";

import {getMutationErrorMessage} from "@/lib/admin/mutation-error";
import type {DocumentoEmitido, EmitirDocumentoInput} from "@/lib/api/fetch-generated";
import {useEmitirPortalDocumento} from "@/lib/api/rc-generated";

export const useEmitirDocumento = () => {
  const [documento, setDocumento] = useState<DocumentoEmitido | null>(null);
  const {mutate: emitirDocumento, isPending, variables} = useEmitirPortalDocumento();

  const emitir = (payload: EmitirDocumentoInput) => {
    emitirDocumento(payload, {
      onSuccess: (data) => {
        setDocumento(data);
        toast.success("Documento emitido com autenticação interna.");
      },
      onError: (error) => toast.error(getMutationErrorMessage(error)),
    });
  };

  return {
    documento,
    emitir,
    fechar: () => setDocumento(null),
    isPending,
    tipoPendente: isPending ? variables?.tipo : undefined,
  };
};
