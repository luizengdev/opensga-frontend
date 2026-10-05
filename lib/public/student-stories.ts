export interface StudentStory {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  year: string;
  quote: string;
  initials: string;
  avatarBg: string;
  impactMetric: string;
  badge: string;
}

export const STUDENT_STORIES: StudentStory[] = [
  {
    id: "1",
    name: "Beatriz Meneghetti",
    role: "Software Engineer",
    company: "Nubank Global",
    course: "Ciência da Computação & IA",
    year: "Formada em 2025",
    quote:
      "A vivência nos laboratórios da Nexa desde o 1º semestre me colocou anos à frente na compreensão de microsserviços e sistemas de alta escala. O processo seletivo foi natural.",
    initials: "BM",
    avatarBg: "from-blue-600 to-indigo-700",
    impactMetric: "Contratada no 7º semestre",
    badge: "Tech & sistemas distribuídos",
  },
  {
    id: "2",
    name: "Rodrigo Castanho",
    role: "Equity Research Analyst",
    company: "Itaú BBA / Private Equity",
    course: "Economia & Finanças Quantitativas",
    year: "Formado em 2024",
    quote:
      "Operar no trading room com terminais reais e ter aulas com diretores de fundos me deu a segurança necessária para modelar ativos de bilhões de reais logo no primeiro ano.",
    initials: "RC",
    avatarBg: "from-emerald-600 to-teal-800",
    impactMetric: "Certificado CFA Level 1",
    badge: "Mercado de capitais",
  },
  {
    id: "3",
    name: "Mariana Silveira",
    role: "Founder & CEO",
    company: "Nexus Logistics",
    course: "Administração & Estratégia",
    year: "Turma de 2025",
    quote:
      "O Nexa Venture Lab investiu na nossa ideia quando ela era apenas um projeto acadêmico. Hoje faturamos R$ 4M/ano e empregamos mais de 30 pessoas.",
    initials: "MS",
    avatarBg: "from-purple-600 to-violet-800",
    impactMetric: "R$ 1.8M em aporte seed",
    badge: "Empreendedorismo",
  },
  {
    id: "4",
    name: "Gabriel Siqueira",
    role: "AI Research Lead",
    company: "Google Cloud Partner",
    course: "Engenharia de Software",
    year: "Formado em 2024",
    quote:
      "A matriz de competências da Nexa foca no que realmente importa: resolução de problemas complexos e domínio de arquiteturas modernas sem burocracia.",
    initials: "GS",
    avatarBg: "from-amber-600 to-orange-700",
    impactMetric: "3 patentes publicadas",
    badge: "Inteligência artificial",
  },
];
