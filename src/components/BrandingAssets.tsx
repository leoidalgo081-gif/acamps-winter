import React from 'react';
import { motion } from 'motion/react';

// Comunidade Católica Shalom logo with peace dove in 'O'
export const LogoShalom: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  return (
    <svg
      viewBox="0 0 320 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SHALOM Lettering */}
      <text
        x="10"
        y="58"
        fill="currentColor"
        fontSize="36"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2"
      >
        SHAL
      </text>
      {/* Custom O with Dove inside */}
      <g transform="translate(136, 18)">
        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="8" fill="none" />
        {/* Dove path inside O */}
        <path
          d="M18 24C18 24 23 21 28 24C33 27 38 23 38 23C38 23 33 29 28 29C23 29 18 24 18 24Z"
          fill="currentColor"
        />
        <path
          d="M28 24C31 20 34 16 34 16C34 16 31 18 28 21C25 18 22 16 22 16C22 16 25 20 28 24Z"
          fill="currentColor"
        />
      </g>
      {/* letter M */}
      <text
        x="204"
        y="58"
        fill="currentColor"
        fontSize="36"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2"
      >
        M
      </text>
      {/* Comunidade Católica small text */}
      <text
        x="12"
        y="22"
        fill="currentColor"
        fontSize="8"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
        className="opacity-80"
      >
        COMUNIDADE CATÓLICA
      </text>
    </svg>
  );
};

// Projeto Juventude para Jesus (PJJ) logo
export const LogoPJJ: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  return (
    <svg
      viewBox="0 0 280 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield symbol containing stylized j */}
      <g transform="translate(5, 5)">
        <path
          d="M5 5H45C45 5 45 45 25 65C5 45 5 5 5 5Z"
          fill="white"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* stylized nested 'j' */}
        <path
          d="M18 18H28V36C28 42 24 45 18 45C14 45 12 43 12 43"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* small dot for the j */}
        <circle cx="23" cy="11" r="3.5" fill="currentColor" />
      </g>
      {/* PJJ Text */}
      <g transform="translate(65, 0)">
        <text
          x="5"
          y="30"
          fill="currentColor"
          fontSize="10"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.5"
          className="opacity-70"
        >
          PROJETO
        </text>
        <text
          x="5"
          y="52"
          fill="currentColor"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          juventude
        </text>
        <text
          x="5"
          y="68"
          fill="currentColor"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="3"
        >
          para jesus
        </text>
      </g>
    </svg>
  );
};

export const InteractiveCharacters: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const images = [1, 2, 3, 4];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ rotate: [-12, 12, -12, 0], y: [0, -6, 6, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 1.0, ease: "easeInOut" }}
      whileTap={{ scale: 1.2, rotate: 10 }}
    >
      <img src={`/novo_boneco_${images[currentIndex]}.png`} alt="Personagem" className="w-24 h-24 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,1)] hover:drop-shadow-[0_25px_45px_rgba(0,0,0,1)] transition-all" />
    </motion.div>
  );
};

export const LogoAcamps: React.FC<{ className?: string; hideWinter?: boolean }> = ({
  className = 'w-full',
  hideWinter = false,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <img src="/titulo.png" alt="Acamp's Winter" className="w-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] brightness-110 saturate-150 scale-[1.25]" />
      {/* Sticker right under the C */}
      <div className="absolute top-[50%] -left-[5%] z-20 pointer-events-none">
         <InteractiveCharacters className="pointer-events-auto scale-100" />
      </div>
    </div>
  );
};

// Interface for Patron Saint definitions
export interface Patron {
  id: string;
  name: string;
  nickname: string;
  tagline: string;
  description: string;
  color: string; // Theme color (e.g., orange, blue)
  avatar: React.ReactNode;
}

// Patrons list styled with pop-art comic-book vectors matching Image 4
export const PATRONS: Patron[] = [
  {
    id: 'carlo_acutis',
    name: 'Beato Carlo Acutis',
    nickname: 'Carlo Acutis',
    tagline: 'O Padroeiro da Internet e do videogame',
    description: 'Jovem moderno, amava computadores e tecnologia. Viveu intensamente sua amizade com Jesus, mostrando que a santidade é possível de óculos escuros e calça jeans.',
    color: '#dd681f', // Vibrant Orange
    avatar: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background base circle */}
        <circle cx="50" cy="50" r="46" fill="#dd681f" stroke="white" strokeWidth="3" />
        {/* Hair block */}
        <path d="M26 42C23 28 35 15 50 14C65 13 77 26 74 40C78 43 78 49 74 52C70 55 68 52 68 52C68 52 50 48 32 52C32 52 28 54 26 50C24 46 25 43 26 42Z" fill="#2D1E18" stroke="#1A0D07" strokeWidth="2" />
        <circle cx="34" cy="28" r="8" fill="#2D1E18" />
        <circle cx="66" cy="28" r="8" fill="#2D1E18" />
        <circle cx="50" cy="22" r="9" fill="#2D1E18" />
        {/* Ears */}
        <circle cx="24" cy="48" r="6" fill="#FCE1D4" stroke="#2D1E18" strokeWidth="2" />
        <circle cx="76" cy="48" r="6" fill="#FCE1D4" stroke="#2D1E18" strokeWidth="2" />
        {/* Face */}
        <path d="M28 45C28 35 34 32 50 32C66 32 72 35 72 45C72 65 65 76 50 76C35 76 28 65 28 45Z" fill="#FCE1D4" stroke="#2D1E18" strokeWidth="2" />
        {/* Curly hair details on forehead */}
        <path d="M32 35C35 28 44 28 46 34" stroke="#2D1E18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M54 34C56 28 65 28 68 35" stroke="#2D1E18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Eyes / Cool black sunglasses */}
        <path d="M30 44H46C48 44 49 46 48 48C46 52 42 54 38 54C34 54 31 52 30 48C29 46 30 44 30 44Z" fill="#111111" stroke="#FF5500" strokeWidth="1.5" />
        <path d="M54 44H70C70 44 71 46 70 48C69 52 66 54 62 54C58 54 55 52 54 48C53 46 54 44 54 44Z" fill="#111111" stroke="#FF5500" strokeWidth="1.5" />
        <line x1="46" y1="46" x2="54" y2="46" stroke="#FF5500" strokeWidth="2" />
        {/* Nose */}
        <path d="M48 55C48 55 50 58 52 58C54 58 54 55 54 55" stroke="#2D1E18" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Smile */}
        <path d="M38 63C42 67 58 67 62 63" stroke="#2D1E18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M38 63C40 70 60 70 62 63" fill="white" stroke="#2D1E18" strokeWidth="2" />
        {/* Cheeks blush */}
        <ellipse cx="33" cy="58" rx="4" ry="2.5" fill="#FFAAA6" />
        <ellipse cx="67" cy="58" rx="4" ry="2.5" fill="#FFAAA6" />
        {/* Polo Collar */}
        <path d="M32 75L40 88L50 80L60 88L68 75" fill="white" stroke="#2D1E18" strokeWidth="2" />
        <path d="M50 80V94" stroke="#2D1E18" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'frassati',
    name: 'Beato Pier Giorgio Frassati',
    nickname: 'Pier Giorgio',
    tagline: 'O Jovem das Bem-Aventuranças e Alpinista',
    description: 'Amava esportes, montanhismo e servir silenciosamente aos mais pobres. Sempre sorridente, conhecido pela icônica foto com seu cachimbo, provou que a alegria de Deus move montanhas.',
    color: '#2e5aa8', // Royal Blue
    avatar: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background base circle */}
        <circle cx="50" cy="50" r="46" fill="#2e5aa8" stroke="white" strokeWidth="3" />
        {/* Hair */}
        <path d="M26 38C26 25 36 18 50 18C64 18 74 25 74 38C74 41 72 43 72 43C72 43 65 34 50 34C35 34 28 43 28 43C28 43 26 41 26 38Z" fill="#3D291F" stroke="#22140C" strokeWidth="2" />
        {/* Ears */}
        <circle cx="23" cy="48" r="6.5" fill="#FCE1D4" stroke="#22140C" strokeWidth="2" />
        <circle cx="77" cy="48" r="6.5" fill="#FCE1D4" stroke="#22140C" strokeWidth="2" />
        {/* Face */}
        <path d="M28 45C28 35 34 32 50 32C66 32 72 35 72 45C72 65 65 76 50 76C35 76 28 65 28 45Z" fill="#FCE1D4" stroke="#22140C" strokeWidth="2" />
        {/* Eyes */}
        <ellipse cx="40" cy="46" rx="3.5" ry="2.5" fill="#22140C" />
        <ellipse cx="60" cy="46" rx="3.5" ry="2.5" fill="#22140C" />
        <path d="M35 40C37 38 43 39 44 41" stroke="#22140C" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M65 40C63 38 57 39 56 41" stroke="#22140C" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M49 50V56H52" stroke="#22140C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mouth with pipe */}
        <path d="M40 62C44 65 56 65 60 62" stroke="#22140C" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Cachimbo (Pipe) - Sticker highlight */}
        <g transform="translate(56, 56)">
          {/* Stem of pipe */}
          <line x1="0" y1="6" x2="16" y2="12" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" />
          {/* Bowl of pipe */}
          <path d="M14 8L18 4H24V14H18L14 8Z" fill="#8B4513" stroke="#22140C" strokeWidth="1.5" />
          {/* Little smoke puff */}
          <circle cx="26" cy="1" r="3" fill="white" className="opacity-80" />
        </g>
        {/* Shirt Collar */}
        <path d="M30 75L42 86L50 79L58 86L70 75" fill="white" stroke="#22140C" strokeWidth="2" />
        <line x1="50" y1="79" x2="50" y2="92" stroke="#22140C" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'chiara_badano',
    name: 'Beata Chiara Luce Badano',
    nickname: 'Chiara Luce',
    tagline: 'A Jovem de Sorriso Luminoso',
    description: 'Menina dinâmica, gostava de tênis, natação e música. Enfrentou uma grave doença com enorme alegria e paz, dizendo: "Se Tu queres, Jesus, eu também quero!" Espalhou luz para todos.',
    color: '#dd681f', // Vibrant Orange
    avatar: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="46" fill="#dd681f" stroke="white" strokeWidth="3" />
        {/* Hair back */}
        <path d="M20 50C20 30 30 18 50 18C70 18 80 30 80 50C80 65 75 75 75 75L68 70C68 70 65 55 50 55C35 55 32 70 32 70L25 75C25 75 20 65 20 50Z" fill="#5C4033" stroke="#1A0D07" strokeWidth="2" />
        {/* Ears */}
        <circle cx="24" cy="50" r="5.5" fill="#FCE1D4" stroke="#1A0D07" strokeWidth="1.5" />
        <circle cx="76" cy="50" r="5.5" fill="#FCE1D4" stroke="#1A0D07" strokeWidth="1.5" />
        {/* Face */}
        <path d="M28 46C28 36 34 33 50 33C66 33 72 36 72 46C72 65 65 74 50 74C35 74 28 65 28 46Z" fill="#FCE1D4" stroke="#1A0D07" strokeWidth="2" />
        {/* Hair front strands */}
        <path d="M26 38C30 28 40 28 45 34" stroke="#5C4033" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M74 38C70 28 60 28 55 34" stroke="#5C4033" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Eyes (warm and bright brown eyes) */}
        <circle cx="41" cy="46" r="3.5" fill="#3D291F" />
        <circle cx="59" cy="46" r="3.5" fill="#3D291F" />
        <circle cx="42" cy="45" r="1" fill="white" />
        <circle cx="60" cy="45" r="1" fill="white" />
        <path d="M37 41C39 39 44 40 45 42" stroke="#1A0D07" strokeWidth="1.5" fill="none" />
        <path d="M63 41C61 39 56 40 55 42" stroke="#1A0D07" strokeWidth="1.5" fill="none" />
        {/* Nose */}
        <path d="M49 51C49 53 51 54 52 54C53 54 53 51 53 51" stroke="#1A0D07" strokeWidth="1.5" fill="none" />
        {/* Smiling Mouth */}
        <path d="M38 60C43 65 57 65 62 60" stroke="#1A0D07" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M38 60C40 68 60 68 62 60Z" fill="white" stroke="#1A0D07" strokeWidth="2" />
        {/* Cheeks blush */}
        <ellipse cx="33" cy="57" rx="4.5" ry="3" fill="#FFAAA6" />
        <ellipse cx="67" cy="57" rx="4.5" ry="3" fill="#FFAAA6" />
        {/* Clothes (orange top with white collar) */}
        <path d="M28 73C28 73 35 88 50 88C65 88 72 73 72 73V92H28V73Z" fill="#FF7F50" stroke="#1A0D07" strokeWidth="2" />
        <circle cx="50" cy="81" r="3" fill="white" />
      </svg>
    ),
  },
  {
    id: 'jp2',
    name: 'São João Paulo II',
    nickname: 'João Paulo II',
    tagline: 'O Papa da Juventude',
    description: 'Grande criador das Jornadas Mundiais da Juventude (JMJ), pastor amoroso e entusiasmado. Desafiou os jovens: "Não tenhais medo de ser santos!" e amava a vida e o esporte.',
    color: '#2e5aa8', // Royal Blue
    avatar: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="46" fill="#2e5aa8" stroke="white" strokeWidth="3" />
        {/* Red cloak back/hood */}
        <path d="M22 45C22 25 32 15 50 15C68 15 78 25 78 45C78 65 72 80 50 82C28 80 22 65 22 45Z" fill="#C02026" stroke="#50080B" strokeWidth="2" />
        {/* White collar of pope habit */}
        <path d="M30 45C30 35 34 32 50 32C66 32 70 35 70 45C70 65 64 74 50 74C36 74 30 65 30 45Z" fill="#FCE1D4" stroke="#50080B" strokeWidth="2" />
        {/* White Hair */}
        <path d="M30 40C30 32 35 25 50 25C65 25 70 32 70 40C70 42 66 40 50 40C34 40 30 42 30 40Z" fill="#EEEEEE" stroke="#A9A9A9" strokeWidth="1.5" />
        {/* Ears */}
        <circle cx="28" cy="48" r="5" fill="#FCE1D4" stroke="#50080B" strokeWidth="1.5" />
        <circle cx="72" cy="48" r="5" fill="#FCE1D4" stroke="#50080B" strokeWidth="1.5" />
        {/* Skull cap (Zucchetto) */}
        <path d="M38 27C38 27 42 22 50 22C58 22 62 27 62 27" fill="white" stroke="#A9A9A9" strokeWidth="1.5" />
        {/* Eyes (kind and wise blue/gray eyes) */}
        <ellipse cx="42" cy="46" rx="3" ry="2" fill="#50080B" />
        <ellipse cx="58" cy="46" rx="3" ry="2" fill="#50080B" />
        <path d="M37 42C39 41 44 42 45 44" stroke="#50080B" strokeWidth="1.5" fill="none" />
        <path d="M63 42C61 41 56 42 55 44" stroke="#50080B" strokeWidth="1.5" fill="none" />
        {/* Happy smile wrinkles */}
        <path d="M36 49C35 52 35 55 37 57" stroke="#E2A690" strokeWidth="1.5" fill="none" />
        <path d="M64 49C65 52 65 55 63 57" stroke="#E2A690" strokeWidth="1.5" fill="none" />
        {/* Nose */}
        <path d="M48 51C48 54 50 56 52 56C54 56 54 51 54 51" stroke="#50080B" strokeWidth="1.5" fill="none" />
        {/* Warm smile */}
        <path d="M39 61C43 64 57 64 61 61" stroke="#50080B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Pope cape / Red clothes at bottom */}
        <path d="M22 75L36 82L50 78L64 82L78 75V94H22V75Z" fill="#C02026" stroke="#50080B" strokeWidth="2" />
        <path d="M50 78V94" stroke="#EEEEEE" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'dulce_dos_pobres',
    name: 'Santa Dulce dos Pobres',
    nickname: 'Irmã Dulce',
    tagline: 'O Anjo Bom da Bahia',
    description: 'Frágil na saúde, mas gigante na caridade. Dedicou sua vida inteira a cuidar dos enfermos, órfãos e abandonados, mostrando que o amor de Deus se traduz em atos concretos de acolhimento.',
    color: '#dd681f', // Vibrant Orange
    avatar: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="46" fill="#dd681f" stroke="white" strokeWidth="3" />
        {/* Blue and white veil outline */}
        <path d="M18 55C18 30 25 15 50 15C75 15 82 30 82 55C82 72 74 84 74 84L68 80C68 80 62 60 50 60C38 60 32 80 32 80L26 84C26 84 18 72 18 55Z" fill="#2e5aa8" stroke="#113275" strokeWidth="2" />
        {/* Inner white veil */}
        <path d="M22 55C22 35 28 20 50 20C72 20 78 35 78 55C78 68 70 76 50 76C30 76 22 68 22 55Z" fill="white" stroke="#113275" strokeWidth="1.5" />
        {/* Face */}
        <path d="M30 46C30 38 34 35 50 35C66 35 70 38 70 46C70 65 64 71 50 71C36 71 30 65 30 46Z" fill="#FCE1D4" stroke="#113275" strokeWidth="2" />
        {/* Eyes (sweet and squinting with kindness) */}
        <path d="M38 48C40 45 44 46 45 49" stroke="#113275" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M62 48C60 45 56 46 55 49" stroke="#113275" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M49 52C49 54 51 55 52 55C53 55 53 52 53 52" stroke="#113275" strokeWidth="1.5" fill="none" />
        {/* Soft kind smile */}
        <path d="M41 59C44 63 56 63 59 59" stroke="#113275" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Cheeks */}
        <ellipse cx="35" cy="56" rx="3.5" ry="2" fill="#FFAAA6" />
        <ellipse cx="65" cy="56" rx="3.5" ry="2" fill="#FFAAA6" />
        {/* Habit (blue habit vest) */}
        <path d="M26 76C26 76 34 88 50 88C66 88 74 76 74 76V94H26V76Z" fill="white" stroke="#113275" strokeWidth="2" />
        <path d="M35 84H65V94H35V84Z" fill="#2e5aa8" stroke="#113275" strokeWidth="1.5" />
      </svg>
    ),
  },
];
