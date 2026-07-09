export type AppStep =
  | 'home'
  | 'quiz'
  | 'revelation_intro'
  | 'revelation_collage'
  | 'details_registration'
  | 'convince_mom'
  | 'ticket'
  | 'game';

export interface QuizOption {
  text: string;
  icon?: string;
  isDifferent?: boolean; // triggers the specific logic of "Fazendo algo totalmente diferente"
}

export interface QuizQuestion {
  id: number;
  text: string;
  image: string;
  options: QuizOption[];
}

export interface RegistrationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  rg?: string;
  parentName?: string;
  parentPhone?: string;
  foodRestriction?: string;
  ticketCode: string;
  registrationDate: string;
  status: 'pending' | 'confirmed';
  patronId?: string; // Selected patron saint intercessor from elements branding
}

export interface GameScore {
  name: string;
  score: number;
  height: number;
  tercos: number;
  date: string;
  isPlayer?: boolean;
}

export interface SaintQuote {
  quote: string;
  saint: string;
  avatarId: string; // carlo_acutis, jp2, dulce_dos_pobres, frassati, chiara_badano, etc.
}

