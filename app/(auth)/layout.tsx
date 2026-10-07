import type { ReactNode } from "react";

import { QueryProvider } from "@/components/query-provider";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <QueryProvider>
      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </QueryProvider>
  );
};

export default AuthLayout;
