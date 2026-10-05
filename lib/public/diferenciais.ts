export interface Diferencial {
  title: string;
  description: string;
  footnote: string;
  icon: "trophy" | "target" | "compass" | "briefcase" | "sparkles" | "shield";
  iconClassName: string;
  footnoteClassName: string;
}

export const DIFERENCIAIS: Diferencial[] = [
  {
    icon: "trophy",
    iconClassName: "bg-blue-50 text-blue-600",
    footnoteClassName: "text-blue-600",
    title: "Empregabilidade executiva",
    description:
      "Parcerias estratégicas com empresas multinacionais, conectando alunos ao mercado corporativo. 94% dos formados empregados em 6 meses.",
    footnote: "Empresas parceiras",
  },
  {
    icon: "target",
    iconClassName: "bg-emerald-50 text-emerald-600",
    footnoteClassName: "text-emerald-600",
    title: "Matriz de competências",
    description:
      "Grades curriculares atualizadas anualmente, focadas no desenvolvimento técnico real e na liderança prática de cada aluno.",
    footnote: "Metodologia baseada em projetos",
  },
  {
    icon: "compass",
    iconClassName: "bg-purple-50 text-purple-600",
    footnoteClassName: "text-purple-600",
    title: "Dupla titulação internacional",
    description:
      "Convênios com instituições nos Estados Unidos e na Europa. Conclua o curso com diploma reconhecido globalmente.",
    footnote: "Programas de intercâmbio",
  },
  {
    icon: "briefcase",
    iconClassName: "bg-amber-50 text-amber-600",
    footnoteClassName: "text-amber-600",
    title: "Corpo docente executivo",
    description:
      "Aulas com mestres, doutores e líderes de mercado, com vivência diária dos desafios de tecnologia, gestão e investimentos.",
    footnote: "Conheça os professores",
  },
  {
    icon: "sparkles",
    iconClassName: "bg-sky-50 text-sky-600",
    footnoteClassName: "text-sky-600",
    title: "Nexa Venture Lab",
    description:
      "Incubadora e aceleradora interna com aporte semente para ideias promissoras criadas nos projetos integradores, ligando alunos a investidores-anjo.",
    footnote: "Portfólio de startups",
  },
  {
    icon: "shield",
    iconClassName: "bg-rose-50 text-rose-600",
    footnoteClassName: "text-rose-600",
    title: "Certificações de mercado",
    description:
      "Currículo desenhado para microcertificações internacionais (cloud, Scrum, ESG e financial modeling) sem custo adicional.",
    footnote: "Credenciais inclusas",
  },
];
