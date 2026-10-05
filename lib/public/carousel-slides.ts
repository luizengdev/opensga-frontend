export interface CarouselSlide {
  tag: string;
  title: string;
  desc: string;
  highlight: string;
}

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    tag: "Inovação científica",
    title: "Hub de Tecnologia e Negócios da Nexa",
    desc: "Estrutura física inspirada nos principais centros de ensino norte-americanos, pronta para impulsionar suas competências práticas com laboratórios de última geração.",
    highlight: "12 laboratórios especializados",
  },
  {
    tag: "Mercado financeiro",
    title: "Trading Room e simulação de ativos globais",
    desc: "Espaço com 40 terminais integrados a dados em tempo real dos maiores mercados mundiais, preparando economistas e gestores para decisões sob pressão.",
    highlight: "Terminais Bloomberg e FactSet",
  },
  {
    tag: "Empreendedorismo e parcerias",
    title: "Nexa Venture Lab e dupla titulação",
    desc: "Conexão direta com fundos de capital de risco e intercâmbio com universidades na Califórnia e em Lisboa para programas de titulação conjunta.",
    highlight: "Mais de 120 empresas parceiras",
  },
];
