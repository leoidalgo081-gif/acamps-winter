import { QuizQuestion } from './types';

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Vai começar as férias. O que você pretende fazer com esses dias?',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600',
    options: [
      { text: 'Dormir bastante', icon: 'Bed' },
      { text: 'Ficar em casa no celular', icon: 'Smartphone' },
      { text: 'Sair com os amigos', icon: 'Users' },
      { text: 'Ainda nem pensei', icon: 'MessageSquare' },
    ],
  },
  {
    id: 2,
    text: 'Quando foi a última vez que você viveu algo realmente inesquecível?',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=600',
    options: [
      { text: 'Essa semana', icon: 'Calendar' },
      { text: 'Faz alguns meses', icon: 'Clock' },
      { text: 'Nem lembro', icon: 'HelpCircle' },
    ],
  },
  {
    id: 3,
    text: 'Quando foi a última vez que você passou um dia inteiro sem se preocupar com mensagens, curtidas ou notificações?',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600',
    options: [
      { text: 'Essa semana', icon: 'Calendar' },
      { text: 'Faz meses', icon: 'Clock' },
      { text: 'Não lembro', icon: 'HelpCircle' },
    ],
  },
  {
    id: 4,
    text: 'Você sente que tem pessoas com quem pode ser totalmente você?',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600',
    options: [
      { text: 'Sim', icon: 'Smile' },
      { text: 'Mais ou menos', icon: 'Meh' },
      { text: 'Não', icon: 'Frown' },
    ],
  },
  {
    id: 5,
    text: 'Você conversa todos os dias com muitas pessoas. Mas quantas realmente conhecem você?',
    image: 'https://images.unsplash.com/photo-1484712401471-05c7215a69eb?q=80&w=600',
    options: [
      { text: 'Tenho amizades verdadeiras.', icon: 'Users' },
      { text: 'Tenho poucos amigos.', icon: 'Meh' },
      { text: 'Às vezes me sinto sozinho.', icon: 'Frown' },
    ],
  },
  {
    id: 6,
    text: 'Se você pudesse escolher como terminar estas férias... Como terminaria?',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
    options: [
      { text: 'Igual aos outros anos', icon: 'RefreshCw' },
      { text: 'Fazendo algo totalmente diferente', icon: 'Star', isDifferent: true },
    ],
  },
];

export const IMAGINE_SWAPS = [
  { text: 'o celular por conversas de verdade.', icon: 'Smartphone' },
  { text: 'o cansaço por aventura.', icon: 'Compass' },
  { text: 'desconhecidos por amizades.', icon: 'Users' },
  { text: 'a rotina por histórias que você vai lembrar por muito tempo.', icon: 'Sparkles' },
  { text: 'um fim de semana comum por um encontro com Deus.', icon: 'Heart' },
];

export const REVELATION_COLLAGE = [
  {
    url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=300',
    alt: 'Diversão',
  },
  {
    url: '/festas.png',
    alt: 'Festas',
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300',
    alt: 'Natureza',
  },
  {
    url: '/fogueira.png',
    alt: 'Relações',
  },
];

export const EVENT_INFO = {
  title: "ACAMP'S WINTER",
  subtitle: 'A EXPERIÊNCIA DA SUA VIDA',
  dates: '24 A 26 DE JULHO',
  targetAge: 'PARA JOVENS DE 14 A 17 ANOS',
  location: 'Embu das Artes - SP',
  address: 'Alameda Fernando Batista Medina, 770, Embu das Artes - SP',
  features: [
    { label: 'HOSPEDAGEM INCLUSA', description: 'Estrutura completa para os 3 dias', icon: 'Home' },
    { label: 'ALIMENTAÇÃO COMPLETA', description: 'Todas as refeições inclusas no pacote', icon: 'Utensils' },
    { label: 'FESTAS TEMÁTICAS', description: 'Noites inesquecíveis, som e muita luz', icon: 'Sparkles' },
    { label: 'AVENTURA E GINCANAS', description: 'Desafios insanos e provas em equipe', icon: 'Compass' },
    { label: 'ENCONTRO COM DEUS', description: 'Espiritualidade transformadora e adoração', icon: 'Flame' },
  ],
  website: 'acamps.com.br/inscricao',
};
