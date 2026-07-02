import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { AppStep, QuizQuestion, RegistrationData } from './types';
import { QUESTIONS, IMAGINE_SWAPS, REVELATION_COLLAGE, EVENT_INFO } from './data';
import PhoneMockup from './components/PhoneMockup';
import RegistrationForm from './components/RegistrationForm';
import TicketPass from './components/TicketPass';
import { LogoAcamps, LogoShalom, LogoPJJ, PATRONS, InteractiveCharacters } from './components/BrandingAssets';

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

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [showInscricaoForm, setShowInscricaoForm] = useState(false);
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

    if (currentStep === 'quiz') {
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

  // Handler for answer selection
  const handleSelectAnswer = (questionId: number, answerText: string, isDifferent?: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerText }));

    // Proceed to next step
    if (currentQuestionIdx < QUESTIONS.length - 1) {
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

  const activeQuestion = QUESTIONS[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-[#254b8c] md:bg-[#254b8c] flex flex-col items-center justify-start md:justify-center p-0 md:py-8 overflow-x-hidden relative font-sans">
      <Snowflakes />

      {/* Subtle mood lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#dd681f]/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Center-aligned mobile-first container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <PhoneMockup>
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
                      PERGUNTA {activeQuestion.id} / {QUESTIONS.length}
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
                      <span>{activeQuestion.id} / {QUESTIONS.length}</span>
                    </div>
                    <div className="w-full bg-[#2e5aa8] h-2 rounded-none overflow-hidden border border-[#222]">
                      <div
                        className="bg-[#dd681f] h-full transition-all duration-300"
                        style={{ width: `${(activeQuestion.id / QUESTIONS.length) * 100}%` }}
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
                        REVELAÇÃO INTERATIVA
                      </span>
                      <h2 className="text-xl font-black uppercase tracking-tighter text-white mt-1">
                        Imagine Trocar...
                      </h2>
                    </div>

                    {/* Swaps list rendered with motion delays */}
                    <div className="space-y-3 pt-2">
                      {IMAGINE_SWAPS.map((swap, index) => {
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
                      DESCOBRIR COMO
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
                      if (registration) {
                        setCurrentStep('ticket');
                      } else {
                        setCurrentStep('details_registration');
                      }
                    }}
                    className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                  >
                    FAZER MINHA INSCRIÇÃO
                    <Icons.ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
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
                  {!showInscricaoForm ? (
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

                      <div className="pt-2 pb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowInscricaoForm(true)}
                          className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300"
                        >
                          QUERO ME INSCREVER
                          <Icons.ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <RegistrationForm
                      onSubmit={handleRegistrationSubmit}
                      onBack={() => setShowInscricaoForm(false)}
                    />
                  )}
                </motion.div>
              )}

              {/* STEP 6: DIGITAL TICKET PASS */}
              {currentStep === 'ticket' && registration && (
                <motion.div
                  key="ticket"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-start relative h-full text-white overflow-y-auto no-scrollbar"
                >
                  <TicketPass registration={registration} onReset={handleReset} />
                </motion.div>
              )}

            </AnimatePresence>
          </PhoneMockup>
        </div>
    </div>
  );
}
