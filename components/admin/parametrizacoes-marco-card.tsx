import {Scale} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export const ParametrizacoesMarcoCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4 text-muted-foreground" />
          Marco regulatório (somente leitura)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p>
          Os pisos de multimodalidade do Decreto nº 12.456/2026 não são editáveis: presencial ≥ 70%;
          semipresencial ≥ 30% presencial e ≥ 20% síncrona (assíncrona ≤ 50%); EAD ≥ 10% presencial e
          ≥ 10% síncrona. A identidade de carga (CH total = presencial + síncrona + assíncrona) também
          permanece fixa.
        </p>
        <p>
          A fórmula acadêmica NS = MAX(AV, AVS) e a escala 0,0–10,0 são estruturais do diário. O que a
          Secretaria altera em Parametrizações são os cortes, o limite de faltas, o período vigente e a
          meta institucional de extensão (sempre ≥ 10%).
        </p>
      </CardContent>
    </Card>
  );
};
