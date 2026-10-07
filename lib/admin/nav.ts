import type {SessionRole} from "@/lib/auth/roles";

export interface AdminNavItem {
  label: string;
  href: string;
}

export interface AdminNavGroup {
  group: string;
  items: AdminNavItem[];
}

const adminNavGroups: AdminNavGroup[] = [
  {
    group: "Visão Geral",
    items: [{label: "Painel Geral", href: "/area-admin/dashboard"}],
  },
  {
    group: "Acadêmico & Regulação",
    items: [
      {label: "Turmas Semestrais", href: "/area-admin/turmas"},
      {label: "Matrizes & Auditoria MEC", href: "/area-admin/matrizes"},
      {label: "Disciplinas Globais", href: "/area-admin/disciplinas"},
      {label: "Cursos Ofertados", href: "/area-admin/cursos"},
      {label: "Campi e Polos", href: "/area-admin/campi"},
      {label: "Parametrizações", href: "/area-admin/parametrizacoes"},
    ],
  },
  {
    group: "Secretaria & Alunos",
    items: [
      {label: "Matrículas & RA", href: "/area-admin/matriculas"},
      {label: "Transferência Interna", href: "/area-admin/transferencia-interna"},
      {label: "Emissão de Documentos", href: "/area-admin/emissao-documentos"},
      {label: "Gestão de Pessoas", href: "/area-admin/usuarios"},
    ],
  },
  {
    group: "Financeiro (Stripe)",
    items: [
      {label: "Tabela de Preços", href: "/area-admin/financeiro/precos"},
      {label: "Faturas Acadêmicas", href: "/area-admin/financeiro/faturas"},
    ],
  },
  {
    group: "Institucional",
    items: [
      {label: "Comunicados", href: "/area-admin/comunicados"},
      {label: "Ouvidoria Geral", href: "/area-admin/ouvidoria"},
    ],
  },
];

const professorNavGroups: AdminNavGroup[] = [
  {
    group: "Espaço do Docente",
    items: [
      {label: "Meu Dashboard", href: "/area-admin/dashboard"},
      {label: "Minhas Turmas", href: "/area-admin/turmas"},
      {label: "Comunicados", href: "/area-admin/comunicados"},
    ],
  },
];

export const getAdminNavGroups = (role: SessionRole) => {
  return role === "PROFESSOR" ? professorNavGroups : adminNavGroups;
};

export const getAdminBreadcrumb = (pathname: string, role: SessionRole) => {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1];

  if (!section || section === "dashboard") {
    return role === "ADMIN" ? "Dashboard Geral" : "Dashboard Docente";
  }

  switch (section) {
    case "turmas":
      return parts[2] ? `Turmas / ${parts[2]}` : "Turmas Semestrais";
    case "diario":
      return parts[2] ? `Diário Eletrônico / ${parts[2]}` : "Diário de Classe";
    case "matriculas":
      return "Matrículas & RA";
    case "transferencia-interna":
      return "Transferência Interna";
    case "emissao-documentos":
      return "Emissão de Documentos";
    case "matrizes":
      return "Matrizes Curriculares & Auditoria MEC";
    case "disciplinas":
      return "Catálogo Global de Disciplinas";
    case "cursos":
      return "Cursos de Graduação";
    case "campi":
      return "Campi e Polos";
    case "parametrizacoes":
      return "Parametrizações";
    case "usuarios":
      return "Gestão de Usuários";
    case "financeiro":
      return parts[2] === "precos" ? "Financeiro / Preços" : "Financeiro / Faturas";
    case "comunicados":
      return "Comunicação / Comunicados";
    case "ouvidoria":
      return "Comunicação / Ouvidoria";
    default:
      return section;
  }
};
