export interface AlunoNavItem {
  label: string;
  href: string;
}

export const ALUNO_NAV_ITEMS: AlunoNavItem[] = [
  {label: "Início", href: "/area-aluno/dashboard"},
  {label: "Notas e frequência", href: "/area-aluno/notas"},
  {label: "Meu curso", href: "/area-aluno/curso"},
  {label: "Minha matrícula", href: "/area-aluno/matricula"},
  {label: "Faturas & Pagamentos", href: "/area-aluno/faturas"},
  {label: "Emissão de documentos", href: "/area-aluno/documentos"},
  {label: "Comunicados", href: "/area-aluno/comunicados"},
  {label: "Ouvidoria", href: "/area-aluno/ouvidoria"},
  {label: "Perfil", href: "/area-aluno/perfil"},
];

export const withAlunoQuery = (href: string, alunoId?: string | null) => {
  if (!alunoId) {
    return href;
  }

  return `${href}?alunoId=${alunoId}`;
};

export const getAlunoBreadcrumb = (pathname: string) => {
  const item = ALUNO_NAV_ITEMS.find((nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`));
  return item?.label ?? "Início";
};
