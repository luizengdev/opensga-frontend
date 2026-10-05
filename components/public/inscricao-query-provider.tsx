"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {type ReactNode, useState} from "react";

interface InscricaoQueryProviderProps {
  children: ReactNode;
}

export const InscricaoQueryProvider = ({
  children,
}: InscricaoQueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
