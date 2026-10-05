export type CourseCategory = "tech" | "business" | "eng";

export interface PublicCourse {
  id: string;
  name: string;
  category: CourseCategory;
  categoryLabel: string;
  duration: string;
  modality: string;
  salaryAvg: string;
  mecScore: string;
  description: string;
  highlights: string[];
}

export const PUBLIC_COURSES: PublicCourse[] = [
  {
    id: "cc",
    name: "Ciência da Computação & IA",
    category: "tech",
    categoryLabel: "Tecnologia & Dados",
    duration: "8 Semestres (4 anos)",
    modality: "Presencial / Laboratórios imersivos",
    salaryAvg: "R$ 8.900/mês",
    mecScore: "Nota 5 MEC",
    description:
      "Formação aprofundada em arquitetura de software, machine learning, computação em nuvem e sistemas distribuídos de alta escala.",
    highlights: [
      "Laboratório de IA generativa",
      "Projetos reais com empresas de tecnologia",
      "Certificações AWS e Google inclusas",
    ],
  },
  {
    id: "es",
    name: "Engenharia de Software",
    category: "tech",
    categoryLabel: "Tecnologia & Dados",
    duration: "8 Semestres (4 anos)",
    modality: "Presencial / Projetos ágeis",
    salaryAvg: "R$ 9.400/mês",
    mecScore: "Nota 5 MEC",
    description:
      "Foco na engenharia de sistemas modernos, microsserviços, DevOps, segurança cibernética e liderança de times técnicos.",
    highlights: [
      "Capstones orientados a produtos reais",
      "Mentoria com tech leads de mercado",
      "Imersão em Clean Code e TDD",
    ],
  },
  {
    id: "adm",
    name: "Administração & Estratégia",
    category: "business",
    categoryLabel: "Negócios & Liderança",
    duration: "8 Semestres (4 anos)",
    modality: "Presencial executivo",
    salaryAvg: "R$ 8.100/mês",
    mecScore: "Nota 5 MEC",
    description:
      "Currículo centrado em gestão orientada a dados, venture capital e liderança executiva, com estudos de caso reais.",
    highlights: [
      "Estudos de caso reais de M&A",
      "Consultoria júnior internacional",
      "Aceleração de negócios no Nexa Hub",
    ],
  },
  {
    id: "fin",
    name: "Economia & Finanças Quantitativas",
    category: "business",
    categoryLabel: "Negócios & Liderança",
    duration: "8 Semestres (4 anos)",
    modality: "Presencial / Trading room",
    salaryAvg: "R$ 9.800/mês",
    mecScore: "Nota 5 MEC",
    description:
      "Domínio de modelagem econométrica, finanças estruturadas, Python para finanças quantitativas e mercado de capitais.",
    highlights: [
      "Terminal Bloomberg dedicado",
      "Preparatório para certificação CFA",
      "Parceria com bancos de investimento",
    ],
  },
  {
    id: "ep",
    name: "Engenharia de Produção & Tech",
    category: "eng",
    categoryLabel: "Engenharias",
    duration: "10 Semestres (5 anos)",
    modality: "Presencial / Indústria 4.0",
    salaryAvg: "R$ 8.700/mês",
    mecScore: "Nota 5 MEC",
    description:
      "Integração de manufatura inteligente, supply chain automatizado, lean six sigma e sustentabilidade industrial.",
    highlights: [
      "Fábrica digital simulada",
      "Certificação Green Belt integrada",
      "Parcerias com multinacionais industriais",
    ],
  },
];

export const getPublicCourseById = (id: string) => {
  return PUBLIC_COURSES.find((course) => course.id === id);
};
