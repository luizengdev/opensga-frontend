"use client";

import {CreditCard, GraduationCap, LayoutDashboard, Menu} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

import {Button} from "@/components/ui/button";
import {withAlunoQuery} from "@/lib/aluno/nav";

interface AlunoMobileNavProps {
  onOpenMore: () => void;
  selectedAlunoId: string | null;
}

export const AlunoMobileNav = ({onOpenMore, selectedAlunoId}: AlunoMobileNavProps) => {
  const pathname = usePathname();

  const items = [
    {href: "/area-aluno/dashboard", label: "Início", icon: LayoutDashboard},
    {href: "/area-aluno/notas", label: "Notas", icon: GraduationCap},
    {href: "/area-aluno/faturas", label: "Faturas", icon: CreditCard},
  ] as const;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 grid h-16 grid-cols-4 items-center border-t border-border bg-card/95 px-2 shadow-lg backdrop-blur-md md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Button
            className={`h-auto flex-col gap-1 py-1 ${
              isActive ? "font-bold text-foreground" : "text-muted-foreground"
            }`}
            key={item.href}
            nativeButton={false}
            render={<Link href={withAlunoQuery(item.href, selectedAlunoId)} />}
            variant="ghost"
          >
            <Icon className="mb-1 size-5" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Button>
        );
      })}
      <Button className="h-auto flex-col gap-1 py-1 text-muted-foreground" onClick={onOpenMore} variant="ghost">
        <Menu className="mb-1 size-5" />
        <span className="text-[10px] font-bold">Mais</span>
      </Button>
    </nav>
  );
};
