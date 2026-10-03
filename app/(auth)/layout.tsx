import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
