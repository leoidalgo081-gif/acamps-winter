import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { AppStep, QuizQuestion, RegistrationData } from './types';
import { QUESTIONS, IMAGINE_SWAPS, REVELATION_COLLAGE, EVENT_INFO, MOMS_QUESTIONS } from './data';
import PhoneMockup from './components/PhoneMockup';
import RegistrationForm from './components/RegistrationForm';
import TicketPass from './components/TicketPass';
import { LogoAcamps, LogoShalom, LogoPJJ, PATRONS, InteractiveCharacters } from './components/BrandingAssets';
import RumoAoCeuGame from './components/RumoAoCeuGame';


// Snowflakes Background Component for ambient winter theme
const Snowflakes = ({ inside = false }: { inside?: boolean }) => {
  const [flakes, setFlakes] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    // Generate snowflakes once on mount to avoid hydration mismatches
    const count = inside ? 30 : 45;
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * (inside ? 5 : 10),
      duration: inside ? (3 + Math.random() * 4) : (6 + Math.random() * 8),
      size: inside ? (0.6 + Math.random() * 0.8) : (0.8 + Math.random() * 1.4),
    }));
    setFlakes(generated);
  }, [inside]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${inside ? 'z-[1] h-full' : 'z-0 h-screen'}`}>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className={inside ? "snowflake-inside" : "snowflake"}
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}rem`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

// Generic Icon Renderer utilizing direct indexing of lucide-react exports
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.Sparkles className={className} />;
  return <IconComponent className={className} />;
};

const getAnimationProps = (id: number) => {
  const step = (id - 1) % 6;
  switch (step) {
    case 0: // 3D Book Flip
      return {
        initial: { opacity: 0, scale: 0.8, rotateY: 70, rotateZ: -5, y: 30 },
        animate: { opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, y: 0 },
        exit: { opacity: 0, scale: 0.8, rotateY: -70, rotateZ: 5, y: -30 },
        transition: { type: "spring", stiffness: 180, damping: 16 }
      };
    case 1: // Slide Left Stretch
      return {
        initial: { opacity: 0, x: -200, scale: 0.9 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 200, scale: 0.9 },
        transition: { type: "spring", stiffness: 200, damping: 18 }
      };
    case 2: // Vertical Flip
      return {
        initial: { opacity: 0, rotateX: 85, y: -50 },
        animate: { opacity: 1, rotateX: 0, y: 0 },
        exit: { opacity: 0, rotateX: -85, y: 50 },
        transition: { type: "spring", stiffness: 170, damping: 14 }
      };
    case 3: // Spring Zoom & Bounce
      return {
        initial: { opacity: 0, scale: 0.4 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.4 },
        transition: { type: "spring", stiffness: 220, damping: 17 }
      };
    case 4: // Swirl & Spiral
      return {
        initial: { opacity: 0, scale: 0.6, rotate: 120, x: 80 },
        animate: { opacity: 1, scale: 1, rotate: 0, x: 0 },
        exit: { opacity: 0, scale: 0.6, rotate: -120, x: -80 },
        transition: { type: "spring", stiffness: 190, damping: 16 }
      };
    case 5: // Slide Right & Tilt
    default:
      return {
        initial: { opacity: 0, x: 200, rotate: 10 },
        animate: { opacity: 1, x: 0, rotate: 0 },
        exit: { opacity: 0, x: -200, rotate: -10 },
        transition: { type: "spring", stiffness: 180, damping: 16 }
      };
  }
};

const getStickerPositionClass = (id: number) => {
  const step = (id - 1) % 6;
  switch (step) {
    case 0:
      return "absolute bottom-16 right-4 w-16 h-16 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Bottom-right corner
    case 1:
      return "absolute top-[60px] left-3 w-14 h-14 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Top-left card area (safe from text)
    case 2:
      return "absolute bottom-16 left-4 w-16 h-16 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Bottom-left corner
    case 3:
      return "absolute top-[60px] right-3 w-14 h-14 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Top-right card area (safe from text)
    case 4:
      return "absolute bottom-20 right-4 w-16 h-16 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Bottom-right slightly higher
    case 5:
    default:
      return "absolute top-[120px] left-3 w-14 h-14 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"; // Left middle card area
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const cardImageVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -6 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 120, damping: 10 }
  }
};

const TitleAnimator = ({ text, className, delayOffset = 0 }: { text: string; className?: string; delayOffset?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                stiffness: 120, 
                damping: 10,
                delay: delayOffset + (i * 0.08)
              } 
            }
          }}
          animate={{
            y: [0, -2.5, 0],
            transition: {
              y: {
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
                delay: delayOffset + (i * 0.15)
              }
            }
          }}
          className="inline-block mr-1.5"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const MOMS_SWAPS = [
  { text: 'Aventura radical com 100% de segurança e credibilidade.', icon: 'ShieldAlert' },
  { text: 'Celulares e telas trocados por amizades reais e saudáveis.', icon: 'Smartphone' },
  { text: 'Alojamentos confortáveis com quartos separados por gênero.', icon: 'Home' },
  { text: 'Alimentação completa inclusa de altíssimo nível (5 refeições/dia).', icon: 'Utensils' },
  { text: 'Um encontro pessoal transformador com o Amor de Deus.', icon: 'Flame' },
];

const PriceSection = () => {
  const [isClipped, setIsClipped] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClipped(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#2e5aa8]/30 border-2 border-dashed border-[#dd681f]/40 rounded-2xl relative overflow-hidden my-3 w-full">
      <span className="text-[10px] text-gray-400 tracking-[0.2em] font-mono uppercase">TUDO ISSO POR APENAS:</span>
      
      <div className="flex items-center gap-4 mt-2">
        {/* Original Price 450 */}
        <div className="relative">
          <span className="text-gray-500 font-black text-xl font-mono relative flex flex-col items-center">
            <span className="opacity-75">R$ 450,00</span>
            {isClipped && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "110%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute top-1/2 -left-1 w-full h-[3px] bg-red-600 -rotate-12"
              />
            )}
          </span>
        </div>

        {/* Arrow icon */}
        {isClipped && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#dd681f] font-black text-xl"
          >
            ➔
          </motion.span>
        )}

        {/* Special Price 280 */}
        <div className="relative">
          <AnimatePresence>
            {isClipped && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [1.3, 1.0], opacity: 1 }}
                className="text-white font-black text-3xl font-mono tracking-tighter flex flex-col items-center"
              >
                <span className="text-[#25D366] drop-shadow-[0_0_15px_rgba(37,211,102,0.4)]">R$ 280,00</span>
                <span className="text-[9px] text-[#25D366]/90 font-sans tracking-wider leading-none mt-1">+ R$ 19,32 TAXA</span>
                <span className="text-[8px] text-[#25D366] tracking-widest font-sans font-black uppercase mt-1">PROMOÇÃO EXCLUSIVA</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isClipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3.5 pt-3 border-t border-[#2e5aa8]/40 w-full text-[10px] space-y-2.5 text-gray-300 font-medium"
        >
          {/* Card Option 1 */}
          <div className="flex flex-col gap-0.5 bg-[#254b8c]/40 p-2 border border-[#2e5aa8]/20">
            <span className="font-mono font-black text-white text-[9px]">💳 EM ATÉ 10X NO CARTÃO (com acréscimo)</span>
            <div className="flex justify-between items-center mt-1">
              <span className="line-through text-gray-500 font-mono text-[9px]">R$ 450,00</span>
              <span className="font-black text-[#25D366] font-mono text-[10.5px]">R$ 280,00 (+ R$ 19,32 taxa)</span>
            </div>
          </div>

          {/* Card Option 2 */}
          <div className="flex flex-col gap-0.5 bg-[#254b8c]/40 p-2 border border-[#2e5aa8]/20">
            <span className="font-mono font-black text-white text-[9px]">⚡ À VISTA VIA PIX</span>
            <div className="flex justify-between items-center mt-1">
              <span className="line-through text-gray-500 font-mono text-[9px]">R$ 450,00</span>
              <span className="font-black text-[#25D366] font-mono text-[10.5px]">R$ 280,00 (+ R$ 19,32 taxa)</span>
            </div>
          </div>

          {/* Card Option 3 */}
          <div className="flex flex-col gap-0.5 bg-[#254b8c]/40 p-2 border border-[#2e5aa8]/20">
            <span className="font-mono font-black text-white text-[9px]">📄 EM ATÉ 10X NO BOLETO</span>
            <div className="flex justify-between items-center mt-1">
              <span className="line-through text-gray-500 font-mono text-[9px]">R$ 450,00</span>
              <span className="font-black text-[#25D366] font-mono text-[10.5px]">R$ 280,00 (+ R$ 19,32 taxa)</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const REGISTRATION_URL = "https://www.e-inscricao.com/comunidade-catlica-shalom-so-paulo/acampswintersp?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAdGRleASzs-RwZG9mAmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9rCSn3vmfHJTv62neLVOWA9FR4P8htDKJw45V6UJ2o6DIvlCqjgrNU-_C4Z_aem_YtXIOg2BP5n4I4xM6k28IQ#payment-information-section";

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [isMomsMode, setIsMomsMode] = useState(false);
  const [isFeminine, setIsFeminine] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<{
    visitsYouth: number;
    visitsMoms: number;
    clicksYouth: number;
    clicksMoms: number;
    clicksAskMom: number;
  } | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const fetchAdminStats = async () => {
    setIsAdminLoading(true);
    try {
      const getVal = async (key: string): Promise<number> => {
        try {
          const res = await fetch(`https://abacus.jasoncameron.dev/get/acampswintersp2026/${key}`);
          const data = await res.json();
          return data.value || 0;
        } catch {
          return 0;
        }
      };

      const [visitsYouth, visitsMoms, clicksYouth, clicksMoms, clicksAskMom] = await Promise.all([
        getVal('visits_youth'),
        getVal('visits_moms'),
        getVal('clicks_register_youth'),
        getVal('clicks_register_moms'),
        getVal('clicks_ask_mom')
      ]);

      setAdminStats({
        visitsYouth,
        visitsMoms,
        clicksYouth,
        clicksMoms,
        clicksAskMom
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    
    const isMoms = path.includes('mamaes') || path.includes('moms') || 
                   search.includes('mamaes') || search.includes('moms') || 
                   hash.includes('mamaes') || hash.includes('moms');
    
    const isSecretAdmin = path.includes('admin') || search.includes('admin') || hash.includes('admin');
    
    const isGame = path.includes('jogar') || path.includes('game') || 
                   search.includes('jogar') || search.includes('game') || 
                   hash.includes('jogar') || hash.includes('game');
    
    if (isMoms) {
      setIsMomsMode(true);
    }
    
    if (isSecretAdmin) {
      setIsAdmin(true);
    } else if (isGame) {
      setCurrentStep('game');
    } else {
      // Record visit only once per session
      if (!sessionStorage.getItem('counted_visit')) {
        sessionStorage.setItem('counted_visit', 'true');
        const key = isMoms ? 'visits_moms' : 'visits_youth';
        fetch(`https://abacus.jasoncameron.dev/hit/acampswintersp2026/${key}`).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isMomsMode) return;
    const interval = setInterval(() => {
      setIsFeminine((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, [isMomsMode]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [showInscricaoForm, setShowInscricaoForm] = useState(false);
  const [momName, setMomName] = useState('Mãe');
  const [momPhone, setMomPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isZoomingCabana, setIsZoomingCabana] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount and setup autoplay listeners
  useEffect(() => {
    const audio = new Audio('/acampswinter.mp3');
    audio.loop = false; // Play first audio only once
    audio.volume = 0.15; // Soft background volume
    audioRef.current = audio;

    const handleAudioEnded = () => {
      if (audioRef.current) {
        audioRef.current.src = '/acampswinter3.mp3';
        audioRef.current.loop = true; // Second audio in loop
        audioRef.current.play().catch((err) => console.log('Erro ao tocar áudio em loop:', err));
      }
    };

    audio.addEventListener('ended', handleAudioEnded);

    // Try to autoplay on user interaction
    const startAutoplay = () => {
      audio.play()
        .then(() => {
          setIsMusicPlaying(true);
          window.removeEventListener('click', startAutoplay);
          window.removeEventListener('touchstart', startAutoplay);
        })
        .catch((err) => {
          console.log('Autoplay blocked, waiting for interaction...');
        });
    };

    window.addEventListener('click', startAutoplay);
    window.addEventListener('touchstart', startAutoplay);

    // Initial check
    startAutoplay();

    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
      window.removeEventListener('click', startAutoplay);
      window.removeEventListener('touchstart', startAutoplay);
      audio.pause();
    };
  }, []);

  // Listen to step transitions to adjust audio tracks automatically
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentStep === 'quiz' || currentStep === 'game') {
      // Force switch to acampswinter3.mp3 on loop
      if (!audioRef.current.src.endsWith('/acampswinter3.mp3')) {
        audioRef.current.pause();
        audioRef.current.src = '/acampswinter3.mp3';
        audioRef.current.loop = true;
        if (isMusicPlaying) {
          audioRef.current.play().catch((err) => console.log('Erro ao tocar áudio 2:', err));
        }
      }
    }
  }, [currentStep, isMusicPlaying]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.log('Erro ao tocar áudio:', err));
      setIsMusicPlaying(true);
    }
  };

  const startMusicOnInteract = () => {
    if (audioRef.current && !isMusicPlaying) {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => console.log('Autoplay bloqueado pelo navegador:', err));
    }
  };

  // Load existing registration from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('acamps_winter_registration');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRegistration(parsed);
      } catch (e) {
        console.error('Erro ao carregar inscrição do cache', e);
      }
    }
  }, []);

  // Select active question list based on mode
  const questionsList = isMomsMode ? MOMS_QUESTIONS : QUESTIONS;

  // Handler for answer selection
  const handleSelectAnswer = (questionId: number, answerText: string, isDifferent?: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerText }));

    // Proceed to next step
    if (currentQuestionIdx < questionsList.length - 1) {
      // Trigger smooth slider transition to next question
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => prev + 1);
      }, 150);
    } else {
      // Last question completed!
      // If they chose "Fazendo algo totalmente diferente" or if we want to follow the narrative:
      setTimeout(() => {
        setCurrentStep('revelation_intro');
      }, 200);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('acamps_winter_registration');
    setRegistration(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowInscricaoForm(false);

    // Reset audio back to track 1
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '/acampswinter.mp3';
      audioRef.current.loop = false;
      if (isMusicPlaying) {
        audioRef.current.play().catch((err) => console.log(err));
      }
    }

    setCurrentStep('home');
  };

  const handleRegistrationSubmit = (data: RegistrationData) => {
    setRegistration(data);
    setCurrentStep('ticket');
    setShowInscricaoForm(false);
  };

  const activeQuestion = questionsList[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-[#254b8c] md:bg-[#254b8c] flex flex-col items-center justify-start md:justify-center p-0 md:py-8 overflow-x-hidden relative font-sans">
      <Snowflakes />

      {/* Subtle mood lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#dd681f]/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Center-aligned mobile-first container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <PhoneMockup>
          {isAdmin ? (
            <div className="flex-1 flex flex-col justify-start relative h-full text-white overflow-y-auto no-scrollbar p-5 space-y-4 text-left z-25">
              {/* Header */}
              <div className="text-center space-y-1">
                <span className="text-[#25D366] text-[9px] font-black tracking-[0.3em] uppercase block">
                  PAINEL DE ANÁLISE 📊
                </span>
                <h2 className="text-xl font-black tracking-tighter text-white uppercase block leading-none">
                  ADMINISTRADOR
                </h2>
                <div className="inline-block bg-[#25D366]/10 text-[#25D366] text-[9px] font-black px-2.5 py-1 rounded-none border-2 border-[#25D366]/15 tracking-widest uppercase mt-1">
                  ESTATÍSTICAS EM TEMPO REAL
                </div>
              </div>

              {/* Stats Card */}
              {isAdminLoading || !adminStats ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-t-[#25D366] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Carregando dados...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visitas */}
                  <div className="bg-[#254b8c] border-2 border-[#2e5aa8] p-3.5 space-y-3">
                    <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block">
                      VISITAS ÚNICAS (ACESSOS)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#1b3b73]/60 p-2.5 border border-[#2e5aa8]/40">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-mono">👦 JOVENS</span>
                        <span className="text-lg font-black text-white font-mono mt-0.5 block">{adminStats.visitsYouth}</span>
                      </div>
                      <div className="bg-[#1b3b73]/60 p-2.5 border border-[#2e5aa8]/40">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-mono">👩 MÃES</span>
                        <span className="text-lg font-black text-white font-mono mt-0.5 block">{adminStats.visitsMoms}</span>
                      </div>
                    </div>
                    <div className="bg-[#122340] p-2.5 border border-[#2e5aa8]/40 flex justify-between items-center text-xs">
                      <span className="text-gray-400 uppercase tracking-wider font-mono text-[9px]">🌍 TOTAL DE ACESSOS:</span>
                      <span className="text-xl font-black text-white font-mono">{adminStats.visitsYouth + adminStats.visitsMoms}</span>
                    </div>
                  </div>

                  {/* Cliques de Inscrição */}
                  <div className="bg-[#254b8c] border-2 border-[#2e5aa8] p-3.5 space-y-3">
                    <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block">
                      CLIQUES EM "ME INSCREVER"
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#1b3b73]/60 p-2.5 border border-[#2e5aa8]/40">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-mono">👦 JOVENS</span>
                        <span className="text-lg font-black text-[#25D366] font-mono mt-0.5 block">{adminStats.clicksYouth}</span>
                      </div>
                      <div className="bg-[#1b3b73]/60 p-2.5 border border-[#2e5aa8]/40">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-mono">👩 MÃES</span>
                        <span className="text-lg font-black text-[#25D366] font-mono mt-0.5 block">{adminStats.clicksMoms}</span>
                      </div>
                    </div>
                    <div className="bg-[#122340] p-2.5 border border-[#2e5aa8]/40 flex justify-between items-center text-xs">
                      <span className="text-gray-400 uppercase tracking-wider font-mono text-[9px]">⚡ TOTAL DE CLIQUES:</span>
                      <span className="text-xl font-black text-[#25D366] font-mono">{adminStats.clicksYouth + adminStats.clicksMoms}</span>
                    </div>
                  </div>

                  {/* Engajamento */}
                  <div className="bg-[#254b8c] border-2 border-[#2e5aa8] p-3.5 space-y-2 text-xs">
                    <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block">
                      OUTRAS AÇÕES
                    </span>
                    <div className="bg-[#1b3b73]/60 p-2.5 border border-[#2e5aa8]/40 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block uppercase tracking-wide text-[10px]">💬 PEDIR PARA A MÃE:</span>
                        <span className="text-[8.5px] text-gray-400 block font-mono mt-0.5">CLIQUES NO BOTÃO DE WHATSAPP DO JOVEM</span>
                      </div>
                      <span className="text-lg font-black text-white font-mono">{adminStats.clicksAskMom}</span>
                    </div>
                  </div>

                  {/* Conversão */}
                  <div className="bg-[#254b8c] border-2 border-[#2e5aa8] p-3.5 space-y-3 text-xs">
                    <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block">
                      TAXAS DE CONVERSÃO 📈
                    </span>
                    
                    {/* Jovens conversion */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono uppercase text-gray-300">
                        <span>👦 CONVERSÃO JOVENS</span>
                        <span className="font-bold text-white">
                          {adminStats.visitsYouth > 0 ? ((adminStats.clicksYouth / adminStats.visitsYouth) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#1b3b73] border border-[#2e5aa8]/40">
                        <div
                          className="h-full bg-[#dd681f]"
                          style={{ width: `${Math.min(100, adminStats.visitsYouth > 0 ? (adminStats.clicksYouth / adminStats.visitsYouth) * 100 : 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mães conversion */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[9px] font-mono uppercase text-gray-300">
                        <span>👩 CONVERSÃO MÃES</span>
                        <span className="font-bold text-white">
                          {adminStats.visitsMoms > 0 ? ((adminStats.clicksMoms / adminStats.visitsMoms) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#1b3b73] border border-[#2e5aa8]/40">
                        <div
                          className="h-full bg-[#25D366]"
                          style={{ width: `${Math.min(100, adminStats.visitsMoms > 0 ? (adminStats.clicksMoms / adminStats.visitsMoms) * 100 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 pb-4">
                <button
                  onClick={fetchAdminStats}
                  disabled={isAdminLoading}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-3 px-4 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                >
                  <Icons.RefreshCw className={`w-4 h-4 ${isAdminLoading ? 'animate-spin' : ''}`} />
                  ATUALIZAR DADOS
                </button>

                <button
                  onClick={() => {
                    setIsAdmin(false);
                    window.history.pushState({}, '', '/');
                    setCurrentStep('home');
                  }}
                  className="w-full bg-[#1b3b73] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white py-2.5 px-4 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                >
                  <Icons.X className="w-4 h-4" />
                  FECHAR PAINEL DE ADMIN
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Floating speaker mute/unmute control inside cellphone */}
              <button
                onClick={toggleMusic}
            className="absolute top-12 right-4 z-50 p-2.5 bg-[#254b8c]/50 border border-[#2e5aa8]/40 text-white rounded-full hover:bg-[#dd681f] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 flex items-center gap-1.5 overflow-hidden"
            title={isMusicPlaying ? 'Mutar Música' : 'Tocar Música'}
          >
            {/* Glowing pulse ring around button if playing */}
            {isMusicPlaying && (
              <span className="absolute inset-0 rounded-full border border-[#dd681f]/80 animate-ping opacity-60 pointer-events-none" />
            )}

            {isMusicPlaying ? (
              <Icons.Volume2 className="w-3.5 h-3.5 text-[#dd681f] shrink-0" />
            ) : (
              <Icons.VolumeX className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}

            {/* Micro-equalizer bars indicating sound waves / vibrations */}
            <div className="flex items-end gap-[1.5px] h-2.5 shrink-0 pl-0.5">
              <motion.div
                animate={isMusicPlaying ? { height: [2, 8, 2] } : { height: 2 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                className={`w-[2px] rounded-full transition-colors ${isMusicPlaying ? 'bg-[#dd681f]' : 'bg-gray-400'}`}
              />
              <motion.div
                animate={isMusicPlaying ? { height: [1.5, 10, 1.5] } : { height: 1.5 }}
                transition={{ repeat: Infinity, duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                className={`w-[2px] rounded-full transition-colors ${isMusicPlaying ? 'bg-[#dd681f]' : 'bg-gray-400'}`}
              />
              <motion.div
                animate={isMusicPlaying ? { height: [2, 6, 2] } : { height: 2 }}
                transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut", delay: 0.2 }}
                className={`w-[2px] rounded-full transition-colors ${isMusicPlaying ? 'bg-[#dd681f]' : 'bg-gray-400'}`}
              />
            </div>
          </button>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: HOME */}
            {currentStep === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-between p-4 pb-6 pt-2 text-center relative h-full overflow-hidden"
              >
                {/* Snowing inside the cellphone screen */}
                <Snowflakes inside={true} />

                {/* 1. Header / Logo Title (Top) */}
                <motion.div 
                  animate={isZoomingCabana ? { opacity: 0, scale: 0.9, y: -20, filter: "blur(4px)" } : { opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="space-y-1 pt-1 w-full px-1 flex flex-col items-center relative z-10"
                >
                  <div className="flex justify-center mb-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dd681f]/10 border border-[#dd681f]/30 text-[9px] text-[#dd681f] font-black uppercase tracking-[0.25em] rounded-full shadow-[0_0_15px_rgba(221,104,31,0.2)]">
                      <Icons.Tent className="w-3 h-3" />
                      Inscrições de Inverno Abertas
                    </span>
                  </div>
                  {/* Official branding logo */}
                  <LogoAcamps className="w-full max-w-[210px] mx-auto pt-0 pb-0" />
                </motion.div>
                  
                {/* 2. Reference Photo Text (Center) */}
                <motion.div 
                  animate={isZoomingCabana ? { opacity: 0, scale: 0.9, y: -10, filter: "blur(4px)" } : { opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full max-w-[300px] mx-auto space-y-4 text-center px-2 py-1 relative z-10"
                >
                  {isMomsMode ? (
                    <>
                      <p className="text-white text-[25px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-black tracking-wide flex justify-center items-center gap-1.5 flex-wrap">
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.1 }} className="transform -rotate-2 inline-block">MÃE...</motion.span>
                        <span className="w-full h-0 block"></span>
                        <span className="text-gray-300 uppercase inline-block">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isFeminine ? 'suafilha' : 'seufilho'}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.25 }}
                              className="inline-block"
                            >
                              {isFeminine ? 'SUA FILHA' : 'SEU FILHO'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <span className="w-full h-0 block"></span>
                        <motion.span 
                          animate={{ rotate: [3, -1, 3], scale: [1.1, 1.15, 1.1] }} 
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                          className="text-[#dd681f] font-black drop-shadow-[0_0_10px_rgba(221,104,31,0.5)] ml-0.5 inline-block text-[32px] uppercase"
                        >
                          QUER IR!
                        </motion.span>
                      </p>
                      <div className="w-12 h-[2.5px] bg-gradient-to-r from-transparent via-[#dd681f]/80 to-transparent mx-auto rounded-full"></div>
                      <div className="text-gray-200 text-[14px] leading-relaxed drop-shadow-[0_2px_5_rgba(0,0,0,0.9)] font-bold uppercase tracking-wider flex justify-center items-center gap-1 flex-wrap">
                        <span>AJUDE</span>
                        <span className="inline-block text-white font-black bg-[#dd681f]/10 border border-[#dd681f]/20 px-1.5 py-0.5 rounded">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isFeminine ? 'suafilha_lbl' : 'seufilho_lbl'}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block"
                            >
                              {isFeminine ? 'SUA FILHA' : 'SEU FILHO'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <span>A TER A</span>
                        <span className="text-[#dd681f] font-black">MELHOR EXPERIÊNCIA</span>
                        <span>DE FÉRIAS DA VIDA</span>
                        <span className="inline-block text-white font-black bg-[#dd681f]/10 border border-[#dd681f]/20 px-1.5 py-0.5 rounded">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isFeminine ? 'dela_lbl' : 'dele_lbl'}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block font-mono"
                            >
                              {isFeminine ? 'DELA!' : 'DELE!'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-[21px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold tracking-wide flex justify-center items-center gap-1.5 flex-wrap">
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.1 }} className="transform -rotate-2 inline-block">Não</motion.span>
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.3 }} className="transform rotate-2 text-gray-300 inline-block">existem</motion.span>
                        <span className="w-full h-0 block"></span>
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }} className="transform -rotate-1 inline-block">respostas</motion.span>
                        <motion.span 
                          animate={{ rotate: [3, -1, 3], scale: [1.1, 1.15, 1.1] }} 
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                          className="text-[#dd681f] font-black drop-shadow-[0_0_10px_rgba(221,104,31,0.5)] ml-0.5 inline-block text-[25px]"
                        >
                          certas.
                        </motion.span>
                      </p>
                      <div className="w-12 h-[2.5px] bg-gradient-to-r from-transparent via-[#dd681f]/80 to-transparent mx-auto rounded-full"></div>
                      <p className="text-gray-200 text-[16px] leading-relaxed drop-shadow-[0_2px_5_rgba(0,0,0,0.9)] font-medium flex justify-center items-center gap-0.5 flex-wrap">
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.2 }} className="transform rotate-1 inline-block">Apenas</motion.span>
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.4 }} className="transform -rotate-2 inline-block">responda</motion.span>
                        <motion.span animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.6 }} className="transform rotate-1 text-[#dd681f] inline-block">o que</motion.span>
                        <span className="w-full h-0 block"></span>
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.8 }} className="transform -rotate-1 inline-block">realmente</motion.span>
                        <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 1.0 }} className="transform rotate-2 inline-block">está no</motion.span>
                        <span className="w-full h-0 block mt-0.5"></span>
                        <motion.span 
                          animate={{ 
                            scale: [1.05, 1.1, 1.05],
                            rotate: [-3, -1, -3],
                            filter: ["drop-shadow(0 0 4px rgba(255,255,255,0.2))", "drop-shadow(0 0 10px rgba(255,255,255,0.5))", "drop-shadow(0 0 4px rgba(255,255,255,0.2))"]
                          }} 
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          className="text-white font-black italic tracking-widest text-[25px] mt-1 inline-block"
                        >
                          SEU CORAÇÃO
                        </motion.span>
                      </p>
                    </>
                  )}
                </motion.div>
 
                {/* 3. Tent Icon & Button (Bottom) */}
                <div className="w-full max-w-[280px] mx-auto flex flex-col items-center space-y-4 pb-2 relative z-10">
                  <motion.img 
                    src="/cabana.png" 
                    alt="Cabana" 
                    animate={isZoomingCabana ? {
                      scale: [1, 2, 75],
                      y: [0, -30, -180],
                      rotate: [0, -5, 5, 0],
                      opacity: [1, 1, 1, 0],
                      filter: ["brightness(1) contrast(1)", "brightness(1.8) contrast(1.2)", "brightness(0) contrast(2)"]
                    } : {}}
                    transition={isZoomingCabana ? {
                      duration: 0.95,
                      ease: [0.6, 0.01, 0.35, 1]
                    } : {}}
                    className="w-10 h-10 object-contain opacity-95 drop-shadow-lg relative z-[999]" 
                  />
                  
                  <motion.button
                    animate={isZoomingCabana ? { opacity: 0, y: 30, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startMusicOnInteract();
                      setIsZoomingCabana(true);
                      setTimeout(() => {
                        setCurrentStep('quiz');
                        setIsZoomingCabana(false);
                      }, 900);
                    }}
                    className="w-full bg-[#dd681f] text-white font-black text-[15px] py-4 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(221,104,31,0.6)] hover:shadow-[0_0_35px_rgba(221,104,31,0.9)] border border-[#dd681f]/50 cursor-pointer"
                  >
                    COMEÇAR
                  </motion.button>

                  <motion.button
                    animate={isZoomingCabana ? { opacity: 0, y: 30, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startMusicOnInteract();
                      setCurrentStep('game');
                    }}
                    className="w-full bg-[#2e5aa8] hover:bg-[#254b8c] text-white font-black text-[14px] py-3.5 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all duration-300 border-2 border-[#2e5aa8] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Icons.Gamepad2 className="w-4.5 h-4.5" />
                    JOGAR: RUMO AO CÉU! 🎮
                  </motion.button>
                </div>

              </motion.div>
            )}

            {/* STEP 2: QUIZ */}
            {currentStep === 'quiz' && activeQuestion && (
              <motion.div
                key={`quiz-${activeQuestion.id}`}
                {...getAnimationProps(activeQuestion.id)}
                className="flex-1 flex flex-col justify-between p-5 relative h-full text-white overflow-hidden"
                style={{ 
                  perspective: 1000,
                  backgroundImage: `linear-gradient(to bottom, rgba(37, 75, 140, 0.88), rgba(15, 32, 67, 0.94)), url(${activeQuestion.id % 2 === 1 ? '/fundo1.jpg' : '/fundo2.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="space-y-4 relative z-10">
                  {/* Question Header & ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#dd681f] font-black tracking-[0.25em] uppercase">
                      PERGUNTA {activeQuestion.id} / {questionsList.length}
                    </span>
                    {currentQuestionIdx > 0 && (
                      <button
                        onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                        className="text-gray-400 hover:text-[#dd681f] text-[10px] uppercase font-black tracking-widest flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <Icons.ChevronLeft className="w-3.5 h-3.5" />
                        Voltar
                      </button>
                    )}
                  </div>

                  {/* Question Card Frame (Sharp Cornered Brutalist) */}
                  <div className="rounded-none overflow-hidden border-2 border-[#2e5aa8] bg-[#254b8c] relative shadow-lg mb-4">
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={activeQuestion.image}
                        alt={activeQuestion.text}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale-[30%] hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                    </div>
                    <div className="p-4 border-t border-[#2e5aa8]">
                      <p className="text-xs leading-normal font-black uppercase tracking-wider text-white">
                        {activeQuestion.text}
                      </p>
                    </div>

                  </div>

                    {/* Options list */}
                    <div className="space-y-2.5 pt-1">
                      {activeQuestion.options.map((option, idx) => {
                        const isSelected = selectedAnswers[activeQuestion.id] === option.text;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() =>
                              handleSelectAnswer(activeQuestion.id, option.text, option.isDifferent)
                            }
                            className={`w-full text-left py-3 px-4 rounded-none text-xs flex items-center justify-between transition-all border-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#dd681f] border-[#dd681f] text-white font-black tracking-wider uppercase'
                                : 'bg-[#254b8c] border-[#2e5aa8] hover:border-[#dd681f] text-gray-300 uppercase font-mono'
                            }`}
                          >
                            <span>{option.text}</span>
                            <div className="flex items-center gap-2">
                              {option.icon && (
                                <IconRenderer
                                  name={option.icon}
                                  className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-500'}`}
                                />
                              )}
                              <div
                                className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                                  isSelected ? 'border-white bg-white' : 'border-gray-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 bg-[#dd681f]"></div>}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="pt-4 pb-1 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono tracking-widest uppercase font-black">
                      <span>PROGRESSO</span>
                      <span>{activeQuestion.id} / {questionsList.length}</span>
                    </div>
                    <div className="w-full bg-[#2e5aa8] h-2 rounded-none overflow-hidden border border-[#222]">
                      <div
                        className="bg-[#dd681f] h-full transition-all duration-300"
                        style={{ width: `${(activeQuestion.id / questionsList.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Floating character sticker at different safe places based on question ID */}
                  <motion.div
                    key={`sticker-${activeQuestion.id}`}
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: [4, -4, 4] }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 180, damping: 10, delay: 0.1 },
                      rotate: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                    }}
                    className={getStickerPositionClass(activeQuestion.id)}
                  >
                    <img
                      src={`/novo_boneco_${((activeQuestion.id - 1) % 4) + 1}.png`}
                      alt="Mascote da Pergunta"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* STEP 3: REVELATION - IMAGINE TROCAR */}
              {currentStep === 'revelation_intro' && (
                <motion.div
                  key="revelation_intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-between p-5 relative h-full text-white"
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-[#dd681f] text-[10px] font-black tracking-[0.25em] uppercase block">
                        {isMomsMode ? 'MENSAGEM PARA AS MAMÃES' : 'REVELAÇÃO INTERATIVA'}
                      </span>
                      <h2 className="text-xl font-black uppercase tracking-tighter text-white mt-1">
                        {isMomsMode ? 'MANHEEEEE, EU QUERO IR!' : 'Imagine Trocar...'}
                      </h2>
                    </div>

                    {/* Swaps list rendered with motion delays */}
                    <div className="space-y-3 pt-2">
                      {(isMomsMode ? MOMS_SWAPS : IMAGINE_SWAPS).map((swap, index) => {
                        const isEven = index % 2 === 0;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isEven ? -100 : 100, rotate: isEven ? -4 : 4 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              rotate: 0,
                              transition: { delay: index * 0.15, type: 'spring', stiffness: 100, damping: 12 },
                            }}
                            whileHover={{ scale: 1.03, rotate: isEven ? 0.5 : -0.5 }}
                            className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-[#254b8c] to-[#254b8c]/50 border-2 border-[#2e5aa8] rounded-2xl relative overflow-hidden shadow-lg transition-all"
                          >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#dd681f]"></div>
                            <div className="w-8 h-8 bg-[#dd681f]/10 flex items-center justify-center text-[#dd681f] shrink-0 border border-[#dd681f]/30 rounded-xl">
                              <IconRenderer name={swap.icon} className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] text-gray-200 font-bold uppercase tracking-wider font-mono leading-relaxed">
                              {swap.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 pb-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep('revelation_collage')}
                      className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                    >
                      {isMomsMode ? 'VER DETALHES DO ACAMPAMENTO' : 'DESCOBRIR COMO'}
                      <Icons.ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

            {/* STEP 4: REVELATION COLLAGE */}
            {currentStep === 'revelation_collage' && (
              <motion.div
                key="revelation_collage"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="flex-1 flex flex-col justify-between p-4 relative h-full text-white"
              >
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {/* 1. Header */}
                  <motion.div className="text-center flex flex-col items-center justify-center" variants={itemVariants}>
                    {isMomsMode ? (
                      <>
                        <span className="text-[#dd681f] text-[9px] font-black tracking-[0.25em] uppercase block mb-1">
                          CONFIRMAÇÃO DO ACAMPAMENTO
                        </span>
                        <h3 className="text-xs font-black tracking-tight uppercase text-white leading-tight">
                          <TitleAnimator text="É uma confirmação:" delayOffset={0.1} />
                        </h3>
                        <h4 className="text-[12px] font-bold uppercase text-gray-300 leading-tight mt-0.5">
                          <TitleAnimator text="Teremos tudo isso!" delayOffset={0.3} />
                        </h4>
                        <h2 className="text-[#dd681f] text-sm font-black uppercase tracking-widest leading-none mt-1">
                          <TitleAnimator text="Monitores, alimentação e Deus." delayOffset={0.5} />
                        </h2>
                      </>
                    ) : (
                      <>
                        <span className="text-[#dd681f] text-[9px] font-black tracking-[0.25em] uppercase block mb-1">
                          O QUE VOCÊ PROCURA...
                        </span>
                        <h3 className="text-sm font-black tracking-tight uppercase text-white leading-tight">
                          <TitleAnimator text="Não seja apenas um lugar" delayOffset={0.1} />
                        </h3>
                        <h4 className="text-[12px] font-bold uppercase text-gray-300 leading-tight mt-0.5">
                          <TitleAnimator text="seja uma" delayOffset={0.3} />
                        </h4>
                        <h2 className="text-[#dd681f] text-lg font-black uppercase tracking-widest leading-none mt-1">
                          <TitleAnimator text="Experiência." delayOffset={0.5} />
                        </h2>
                      </>
                    )}
                  </motion.div>

                  {/* 2. Vertical List of Camp Memories with background images */}
                  <motion.div className="space-y-2 max-w-[280px] mx-auto w-full" variants={containerVariants}>
                    {REVELATION_COLLAGE.map((img, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="h-18 rounded-2xl overflow-hidden border border-[#2e5aa8]/60 relative shadow-lg transition-all flex items-center justify-center group"
                      >
                        {/* Background Image filling the card */}
                        <img
                          src={img.url}
                          alt={img.alt}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover grayscale-[15%] group-hover:scale-105 transition-transform duration-500 z-0"
                        />
                        {/* Gradient Overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/75 group-hover:from-black/60 group-hover:to-black/60 transition-colors z-10" />

                        {/* Title text centered on top */}
                        <span className="relative z-20 text-[14px] font-black uppercase text-white tracking-[0.25em] font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {img.alt}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Stamp Container with Floating Cabana */}
                  <div className="relative max-w-[280px] mx-auto mt-2">
                    {/* Stamp card entry (stamped down tilted) */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, scale: 3.0, rotate: -25 },
                        visible: { 
                          opacity: 1, 
                          scale: 1, 
                          rotate: -2, 
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 15, 
                            delay: 2.5 
                          } 
                        }
                      }}
                      className="relative z-10"
                    >
                      <img 
                        src="/as_melhores_ferias.png" 
                        alt="As Melhores Férias da Sua Vida" 
                        className="w-full object-contain block brightness-110 saturate-[1.1]" 
                      />
                    </motion.div>

                    {/* Floating cabana.png near the stamp, swaying gently (Enlarged) */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: 45 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -5, 0],
                        rotate: [-2, 4, -4, -2]
                      }}
                      transition={{
                        opacity: { delay: 2.9 },
                        scale: { type: "spring", stiffness: 150, damping: 10, delay: 2.9 },
                        y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                        rotate: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
                      }}
                      className="absolute -top-9 -right-9 w-22 h-22 z-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-none"
                    >
                      <img src="/cabana.png" alt="Cabana" className="w-full h-full object-contain" />
                    </motion.div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 3.2, type: "spring", stiffness: 100, damping: 12 }
                  }}
                  className="pt-4 pb-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentStep('details_registration');
                    }}
                    className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                  >
                    {isMomsMode ? (
                      <>
                        QUERO LEVAR{' '}
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={isFeminine ? 'minhafilha_btn4' : 'meufilho_btn4'}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="inline-block"
                          >
                            {isFeminine ? 'MINHA FILHA' : 'MEU FILHO'}
                          </motion.span>
                        </AnimatePresence>
                        <Icons.Heart className="w-4 h-4 fill-current ml-1.5" />
                      </>
                    ) : (
                      <>
                        FAZER MINHA INSCRIÇÃO
                        <Icons.ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 'convince_mom' && (
                <motion.div
                  key="convince_mom"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-start relative h-full text-white overflow-y-auto no-scrollbar p-5 space-y-4 text-left"
                >
                  <div className="text-center space-y-1">
                    <span className="text-[#25D366] text-[9px] font-black tracking-[0.3em] uppercase block">
                      OPERAÇÃO MÃE 🤫
                    </span>
                    <h2 className="text-xl font-black tracking-tighter text-white uppercase block leading-none">
                      CONVENÇA SUA MÃE!
                    </h2>
                    <div className="inline-block bg-[#25D366]/10 text-[#25D366] text-[9px] font-black px-2.5 py-1 rounded-none border-2 border-[#25D366]/15 tracking-widest uppercase mt-1">
                      DICAS INFALÍVEIS + MENSAGEM
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="bg-[#254b8c] border-2 border-[#2e5aa8] rounded-none p-3.5 space-y-2.5 text-[11px] text-gray-200">
                    <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block">
                      DICAS DE OURO:
                    </span>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#dd681f]/20 border border-[#dd681f] text-[#dd681f] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                      <div>
                        <strong>Mostre a Segurança:</strong> Diga que o Acamps tem segurança 24h e monitores dedicados cuidando de tudo.
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#dd681f]/20 border border-[#dd681f] text-[#dd681f] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                      <div>
                        <strong>Comida e Quarto Inclusos:</strong> Alojamento com quartos totalmente separados por gênero e 5 refeições caprichadas por dia inclusas!
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#dd681f]/20 border border-[#dd681f] text-[#dd681f] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                      <div>
                        <strong>O Link das Mães:</strong> Envie o link feito sob medida para ela: <code className="text-[#25D366] bg-black/40 px-1 py-0.5 rounded">acampswintersp.up.railway.app/mamaes</code>
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#dd681f]/20 border border-[#dd681f] text-[#dd681f] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</div>
                      <div>
                        <strong>O Acordo Sagrado:</strong> Prometa manter o quarto limpo e ajudar nas tarefas de casa por um mês inteiro. 😜
                      </div>
                    </div>
                  </div>

                  {/* Form section */}
                  <div className="bg-[#254b8c]/30 border-2 border-dashed border-[#2e5aa8] p-4 space-y-3.5 text-left">
                    <span className="text-[9px] text-gray-400 tracking-[0.2em] font-mono uppercase block text-center">PERSONALIZAR MENSAGEM</span>
                    
                    {/* Mother's Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#dd681f] tracking-wide uppercase block">COMO VOCÊ CHAMA SUA MÃE?</label>
                      <div className="relative">
                        <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={momName}
                          onChange={(e) => setMomName(e.target.value)}
                          placeholder="Mãe, Mamãe, Mãezinha..."
                          className="w-full bg-[#1b3b73]/60 border-2 border-[#2e5aa8] py-2 px-3 pl-10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#dd681f]"
                        />
                      </div>
                    </div>

                    {/* Mother's Phone Input (Optional) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#dd681f] tracking-wide uppercase block">TELEFONE DA SUA MÃE (OPCIONAL)</label>
                      <div className="relative">
                        <Icons.Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={momPhone}
                          onChange={(e) => setMomPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-[#1b3b73]/60 border-2 border-[#2e5aa8] py-2 px-3 pl-10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#dd681f]"
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 italic block">Se não colocar o telefone, você poderá selecionar o contato direto no WhatsApp.</span>
                    </div>

                    {/* Message Preview */}
                    <div className="bg-[#122340] border border-[#2e5aa8] p-3 text-[10.5px] font-mono text-gray-300 rounded relative mt-2">
                      <span className="absolute -top-2 left-3 bg-[#122340] px-1.5 text-[8px] text-[#25D366] font-bold tracking-widest uppercase">PRÉVIA DA MENSAGEM</span>
                      <p className="whitespace-pre-wrap leading-relaxed mt-1">
                        {`Oi ${momName || 'Mãe'}! Tudo bem? Olha que incrível esse acampamento de férias que a Comunidade Shalom está organizando. É o Acamps Winter! Vai ter gincana, festas, alojamentos seguros divididos por gênero, alimentação completa com 5 refeições por dia e monitores 24h acompanhando. Eles têm até um site com informações exclusivas para mães, dá uma olhada: https://acampswintersp.up.railway.app/mamaes. Eu quero muito ir, você deixa? ❤️`}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2 pt-1.5">
                      <button
                        onClick={() => {
                          const messageText = `Oi ${momName || 'Mãe'}! Tudo bem? Olha que incrível esse acampamento de férias que a Comunidade Shalom está organizando. É o Acamps Winter! Vai ter gincana, festas, alojamentos seguros divididos por gênero, alimentação completa com 5 refeições por dia e monitores 24h acompanhando. Eles têm até um site com informações exclusivas para mães, dá uma olhada: https://acampswintersp.up.railway.app/mamaes. Eu quero muito ir, você deixa? ❤️`;
                          const cleanPhone = momPhone.replace(/\D/g, '');
                          
                          let url = '';
                          if (cleanPhone) {
                            const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                            url = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(messageText)}`;
                          } else {
                            url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
                          }
                          window.open(url, '_blank');
                        }}
                        className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-3 px-4 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        <Icons.Send className="w-4 h-4" />
                        ENVIAR PARA ELA
                      </button>

                      <button
                        onClick={() => {
                          const messageText = `Oi ${momName || 'Mãe'}! Tudo bem? Olha que incrível esse acampamento de férias que a Comunidade Shalom está organizando. É o Acamps Winter! Vai ter gincana, festas, alojamentos seguros divididos por gênero, alimentação completa com 5 refeições por dia e monitores 24h acompanhando. Eles têm até um site com informações exclusivas para mães, dá uma olhada: https://acampswintersp.up.railway.app/mamaes. Eu quero muito ir, você deixa? ❤️`;
                          navigator.clipboard.writeText(messageText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="w-full bg-[#1b3b73] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white py-2.5 px-4 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                      >
                        {copied ? <Icons.Check className="w-4 h-4 text-green-400" /> : <Icons.Copy className="w-4 h-4" />}
                        {copied ? 'MENSAGEM COPIADA!' : 'COPIAR TEXTO DA MENSAGEM'}
                      </button>
                    </div>
                  </div>

                  {/* Back button */}
                  <div className="pt-1 pb-4">
                    <button
                      onClick={() => setCurrentStep('details_registration')}
                      className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-2.5 px-4 text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                    >
                      <Icons.ArrowLeft className="w-4 h-4" />
                      VOLTAR PARA DETALHES
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: DETAILS AND REGISTRATION FORM */}
              {currentStep === 'details_registration' && (
                <motion.div
                  key="details_registration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-start relative h-full text-white overflow-y-auto no-scrollbar"
                >
                  {isMomsMode ? (
                    <div className="p-5 space-y-4">
                      {/* Logo and Event Details Summary */}
                      <div className="text-center space-y-1">
                        <span className="text-[#dd681f] text-[9px] font-black tracking-[0.3em] uppercase block">
                          PROPOSTA PARA MAMÃES
                        </span>
                        <h2 className="text-xl font-black tracking-tighter text-white uppercase block leading-none">
                          ACAMP'S WINTER SP
                        </h2>
                        <div className="inline-block bg-[#dd681f]/10 text-[#dd681f] text-[9px] font-black px-2.5 py-1 rounded-none border-2 border-[#dd681f]/15 tracking-widest uppercase mt-1">
                          A ESTRUTURA MAIS SEGURA PARA SEU FILHO
                        </div>
                      </div>

                      {/* Info highlights card */}
                      <div className="bg-[#254b8c] border-2 border-[#2e5aa8] rounded-none p-3.5 space-y-3.5 leading-relaxed text-[11px] text-gray-200">
                        <div className="flex items-start gap-2.5">
                          <Icons.Shield className="w-4 h-4 text-[#dd681f] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block uppercase tracking-wide">QUARTOS E MORADIA SEGURA:</strong>
                            Alojamentos confortáveis com quartos 100% separados por gênero e segurança monitorada por monitores responsáveis 24h por dia.
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t-2 border-[#2e5aa8] pt-2.5">
                          <Icons.Utensils className="w-4 h-4 text-[#dd681f] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block uppercase tracking-wide">ALIMENTAÇÃO COMPLETA (5 REFEIÇÕES/DIA):</strong>
                            Cardápio delicioso preparado com carinho para os 3 dias inclusos:
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider pl-1">
                              <span>🍳 CAFÉ DA MANHÃ</span>
                              <span>🍲 ALMOÇO</span>
                              <span>🍰 LANCHE DA TARDE</span>
                              <span>🍕 JANTAR</span>
                              <span className="col-span-2">🥪 LANCHE DA NOITE</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 border-t-2 border-[#2e5aa8] pt-2.5">
                          <Icons.Award className="w-4 h-4 text-[#dd681f] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block uppercase tracking-wide">CREDIBILIDADE COMPROVADA:</strong>
                            A Comunidade Shalom é reconhecida nacionalmente com mais de 40 anos de experiência na formação de jovens em convivência comunitária, brincadeiras e espiritualidade com Deus.
                          </div>
                        </div>
                      </div>

                      {/* Animated Price Countdown */}
                      <PriceSection />

                      <div className="text-center py-1">
                        <p className="text-[12px] font-black text-white uppercase tracking-wide leading-tight">
                          Gostaria de inscrever{' '}
                          <span className="inline-block font-black text-[#dd681f]">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={isFeminine ? 'suafilha_form' : 'seufilho_form'}
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                transition={{ duration: 0.2 }}
                                className="inline-block"
                              >
                                {isFeminine ? 'SUA FILHA' : 'SEU FILHO'}
                              </motion.span>
                            </AnimatePresence>
                          </span>{' '}
                          nesta experiência?
                        </p>
                      </div>

                      <div className="pt-1 pb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            fetch('https://abacus.jasoncameron.dev/hit/acampswintersp2026/clicks_register_moms').catch(() => {});
                            window.open(REGISTRATION_URL, '_blank');
                          }}
                          className="w-full bg-[#25D366] hover:bg-white hover:text-[#128C7E] text-white border-2 border-transparent hover:border-[#25D366] font-black py-4 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(37,211,102,0.4)] animate-pulse"
                        >
                          <Icons.Sparkles className="w-4 h-4" />
                          SIM, INSCREVER{' '}
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isFeminine ? 'minhafilha_btn' : 'meufilho_btn'}
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -3 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block"
                            >
                              {isFeminine ? 'MINHA FILHA!' : 'MEU FILHO!'}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 space-y-4">
                      {/* Logo and Event Details Summary */}
                      <div className="text-center space-y-1">
                        <span className="text-[#dd681f] text-[9px] font-black tracking-[0.3em] uppercase block">
                          INFORMAÇÕES GERAIS
                        </span>
                        <h2 className="text-xl font-black tracking-tighter text-white uppercase block leading-none">
                          ACAMP'S WINTER
                        </h2>
                        <div className="inline-block bg-[#dd681f]/10 text-[#dd681f] text-[9px] font-black px-2.5 py-1 rounded-none border-2 border-[#dd681f]/15 tracking-widest uppercase mt-1">
                          {EVENT_INFO.targetAge.toUpperCase()}
                        </div>
                      </div>

                      {/* Info highlights card (Sharp Corners, stark borders) */}
                      <div className="bg-[#254b8c] border-2 border-[#2e5aa8] rounded-none p-3.5 space-y-3.5">
                        <div className="flex items-center gap-2.5 text-xs">
                          <Icons.Calendar className="w-4 h-4 text-[#dd681f] shrink-0" />
                          <div>
                            <span className="text-[9px] text-[#dd681f] block font-black uppercase tracking-widest">DATAS</span>
                            <span className="font-bold text-white block mt-0.5 font-mono uppercase">{EVENT_INFO.dates.toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs border-t-2 border-[#2e5aa8] pt-2.5">
                          <Icons.MapPin className="w-4 h-4 text-[#dd681f] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] text-[#dd681f] block font-black uppercase tracking-widest">LOCAL</span>
                            <span className="font-bold text-white block mt-0.5 uppercase tracking-wide">{EVENT_INFO.location.toUpperCase()}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5 leading-snug font-mono uppercase">{EVENT_INFO.address.toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs border-t-2 border-[#2e5aa8] pt-2.5">
                          <Icons.Utensils className="w-4 h-4 text-[#dd681f] shrink-0" />
                          <div>
                            <span className="text-[9px] text-[#dd681f] block font-black uppercase tracking-widest">HOSPEDAGEM & ALIMENTAÇÃO</span>
                            <span className="font-bold text-white block mt-0.5 uppercase tracking-wide">100% INCLUSO PARA OS 3 DIAS</span>
                          </div>
                        </div>
                      </div>

                      {/* Core Highlights List */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-[#dd681f] font-black tracking-[0.25em] uppercase block pl-1">
                          O QUE ESTÁ INCLUSO:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {EVENT_INFO.features.map((f, idx) => (
                            <div key={idx} className="flex gap-2.5 p-2 bg-[#254b8c]/50 border-2 border-[#2e5aa8] rounded-none items-center">
                              <div className="w-6 h-6 bg-neutral-900 flex items-center justify-center text-[#dd681f] shrink-0 border border-[#2e5aa8]">
                                <IconRenderer name={f.icon} className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-white block leading-none uppercase tracking-wide">{f.label.toUpperCase()}</span>
                                <span className="text-[9px] text-gray-500 block mt-1 uppercase tracking-wider font-mono">{f.description.toUpperCase()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <PriceSection />

                      <div className="pt-2 pb-4 space-y-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            fetch('https://abacus.jasoncameron.dev/hit/acampswintersp2026/clicks_register_youth').catch(() => {});
                            window.open(REGISTRATION_URL, '_blank');
                          }}
                          className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                        >
                          QUERO ME INSCREVER
                          <Icons.ChevronRight className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            fetch('https://abacus.jasoncameron.dev/hit/acampswintersp2026/clicks_ask_mom').catch(() => {});
                            setCurrentStep('convince_mom');
                          }}
                          className="w-full bg-[#25D366] hover:bg-white hover:text-[#128C7E] text-white border-2 border-transparent hover:border-[#25D366] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.3)] animate-pulse"
                        >
                          <Icons.MessageCircle className="w-4.5 h-4.5 fill-current" />
                          QUERO IR! (PEDIR PRA MAMÃE)
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 6: RUMO AO CEU GAME */}
              {currentStep === 'game' && (
                <motion.div
                  key="game"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full overflow-hidden"
                >
                  <RumoAoCeuGame onBack={() => setCurrentStep('home')} />
                </motion.div>
              )}

            </AnimatePresence>
          </>
          )}
          </PhoneMockup>
        </div>
    </div>
  );
}
