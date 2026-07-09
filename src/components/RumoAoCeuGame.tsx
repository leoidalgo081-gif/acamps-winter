import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { GameScore, SaintQuote } from '../types';

interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  cost: number;
  unlocked: boolean;
  jumpBoost: number; // multiplier
  speedBoost: number; // multiplier
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'moving' | 'breakable' | 'boost';
  direction: number; // for moving platforms
  broken: boolean;
  hasCollectible: 'none' | 'terco' | 'frase';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'star' | 'cross' | 'dust';
}

const SAINT_QUOTES: SaintQuote[] = [
  { quote: "A Eucaristia é a minha rodovia para o Céu.", saint: "Beato Carlo Acutis", avatarId: "carlo_acutis" },
  { quote: "Não se turbe o vosso coração, não vos assuste nada. Tudo passa, Deus não muda.", saint: "Santa Teresa d'Ávila", avatarId: "chiara_badano" },
  { quote: "A minha vocação é o amor!", saint: "Santa Teresinha do Menino Jesus", avatarId: "chiara_badano" },
  { quote: "Não tenhais medo de ser santos!", saint: "São João Paulo II", avatarId: "jp2" },
  { quote: "Se fores aquilo que Deus quer, colocarás fogo no mundo.", saint: "Santa Catarina de Sena", avatarId: "chiara_badano" },
  { quote: "Para quem ama, nada é difícil.", saint: "São João Bosco", avatarId: "frassati" },
  { quote: "Não se contente com as coisas pequenas. Deus quer coisas grandes!", saint: "São Francisco de Assis", avatarId: "frassati" },
  { quote: "O amor supera tudo, e a caridade é o que nos assemelha a Deus.", saint: "Santa Dulce dos Pobres", avatarId: "dulce_dos_pobres" },
  { quote: "Sempre rumo ao alto! (Verso l'alto).", saint: "Beato Pier Giorgio Frassati", avatarId: "frassati" },
  { quote: "A santidade consiste em estar sempre alegres no Senhor.", saint: "São Domingos Sávio", avatarId: "carlo_acutis" }
];

const INITIAL_CHARACTERS: Character[] = [
  { id: 'boneco_1', name: 'Mascote Azul', avatar: '/novo_boneco_1.png', description: 'Jovem alegre e pronto para o acampamento.', cost: 0, unlocked: true, jumpBoost: 1.0, speedBoost: 1.0 },
  { id: 'boneco_2', name: 'Mascote Laranja', avatar: '/novo_boneco_2.png', description: 'Super ágil, desliza mais rápido pelo cenário.', cost: 0, unlocked: true, jumpBoost: 1.0, speedBoost: 1.25 },
  { id: 'boneco_3', name: 'Mascote Roxo', avatar: '/novo_boneco_3.png', description: 'Equilibrado e focado nas amizades do acampamento.', cost: 0, unlocked: true, jumpBoost: 1.0, speedBoost: 1.0 },
  { id: 'carlo_acutis', name: 'Carlo Acutis', avatar: '/novo_boneco_4.png', description: 'Padroeiro da Internet. Pula um pouco mais alto.', cost: 10, unlocked: false, jumpBoost: 1.15, speedBoost: 1.1 },
  { id: 'frassati', name: 'Pier Giorgio', avatar: '/boneco_2.png', description: 'O jovem alpinista. Pulos muito altos!', cost: 20, unlocked: false, jumpBoost: 1.25, speedBoost: 1.0 },
  { id: 'chiara_badano', name: 'Chiara Luce', avatar: '/boneco_3.png', description: 'Sorriso luminoso. Ganha 1.5x mais pontos por terços.', cost: 30, unlocked: false, jumpBoost: 1.05, speedBoost: 1.15 },
  { id: 'jp2', name: 'João Paulo II', avatar: '/boneco_4.png', description: 'Papa dos Jovens. Super salto celestial!', cost: 40, unlocked: false, jumpBoost: 1.3, speedBoost: 0.95 },
  { id: 'dulce_dos_pobres', name: 'Irmã Dulce', avatar: '/boneco_5.png', description: 'Anjo Bom da Bahia. Imune ao primeiro tombo!', cost: 50, unlocked: false, jumpBoost: 1.0, speedBoost: 1.1 }
];

const MOCK_LEADERBOARD: GameScore[] = [
  { name: 'Carlo Acutis', score: 15200, height: 1250, tercos: 27, date: '08/07/2026' },
  { name: 'Pe. Jonas Shalom', score: 9800, height: 820, tercos: 16, date: '08/07/2026' },
  { name: 'Mariana PJJ', score: 7400, height: 610, tercos: 13, date: '08/07/2026' },
  { name: 'Lucas Vocacionado', score: 5200, height: 450, tercos: 7, date: '07/07/2026' },
  { name: 'Duda Acampista', score: 3100, height: 280, tercos: 3, date: '06/07/2026' }
];

export default function RumoAoCeuGame({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'shop'>('menu');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [selectedCharId, setSelectedCharId] = useState<string>('boneco_1');
  const [tercosWallet, setTercosWallet] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<GameScore[]>(MOCK_LEADERBOARD);
  
  // Game stats
  const [score, setScore] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [tercosCollected, setTercosCollected] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Saint Quote Modal
  const [activeQuote, setActiveQuote] = useState<SaintQuote | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  // Controls settings
  const [controlType, setControlType] = useState<'mouse' | 'touch' | 'keyboard' | 'tilt'>('mouse');
  const [tiltSupported, setTiltSupported] = useState(false);
  
  // Canvas & loop refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Physics engine states (stored in refs to avoid React lag in requestAnimationFrame)
  const playerRef = useRef({
    x: 180,
    y: 400,
    width: 38,
    height: 48,
    vx: 0,
    vy: 0,
    targetX: 180,
    jumpStrength: -9.5,
    speed: 5,
    hasShield: false, // For Irma Dulce immunity
    usedShield: false
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraScrollRef = useRef<number>(0);
  const currentHeightRef = useRef<number>(0); // how high player climbed
  const tercosInRunRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  
  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];
  
  // Load saved data from localStorage
  useEffect(() => {
    const savedTercos = localStorage.getItem('rumoaoceu_tercos');
    if (savedTercos) {
      setTercosWallet(parseInt(savedTercos));
    }
    
    const savedChars = localStorage.getItem('rumoaoceu_unlocked_chars');
    if (savedChars) {
      try {
        const unlockedIds = JSON.parse(savedChars) as string[];
        setCharacters(prev => prev.map(c => ({
          ...c,
          unlocked: unlockedIds.includes(c.id) || c.cost === 0
        })));
      } catch (e) {
        console.error(e);
      }
    }
    
    const savedScores = localStorage.getItem('rumoaoceu_scores');
    if (savedScores) {
      try {
        setLeaderboard(JSON.parse(savedScores));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('rumoaoceu_scores', JSON.stringify(MOCK_LEADERBOARD));
    }
    
    const savedCharId = localStorage.getItem('rumoaoceu_selected_char');
    if (savedCharId) {
      setSelectedCharId(savedCharId);
    }
    
    // Check tilt support
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      setTiltSupported(true);
      setControlType('touch'); // Default mobile to touch
    } else {
      setControlType('mouse'); // Default desktop to mouse
    }
  }, []);
  
  // Handle controls setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
      if (gameState === 'playing' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd')) {
        setControlType('keyboard');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);
  
  // Handle Tilt Event
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (gameState !== 'playing' || controlType !== 'tilt') return;
      // Gamma is left/right tilt in degrees (-90 to 90)
      if (e.gamma !== null) {
        // Map tilt angle to target horizontal offset
        const sensitivity = 0.8;
        const speed = e.gamma * sensitivity;
        playerRef.current.vx = speed;
      }
    };
    
    if (controlType === 'tilt') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [controlType, gameState]);
  
  // Load Character Sprites
  const charImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  useEffect(() => {
    // Preload character images
    characters.forEach(char => {
      const img = new Image();
      img.src = char.avatar;
      charImagesRef.current[char.id] = img;
    });
  }, [characters]);
  
  // Load UI icons (Terço, Pergaminho)
  const uiImagesRef = useRef<{ terco: HTMLImageElement | null; scroll: HTMLImageElement | null }>({
    terco: null,
    scroll: null
  });
  useEffect(() => {
    // Generate simple icons if images fail, but let's try creating beautiful canvas drawings first.
  }, []);
  
  // Request device orientation permissions (iOS)
  const requestTiltPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (window as any).DeviceOrientationEvent !== 'undefined' &&
      typeof (window as any).DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permissionState = await (window as any).DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setControlType('tilt');
        } else {
          alert('Permissão negada. Use os controles de toque.');
          setControlType('touch');
        }
      } catch (error) {
        console.error(error);
        setControlType('touch');
      }
    } else {
      setControlType('tilt');
    }
  };
  
  // Main physics & rendering game loop
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMaxHeight(0);
    setTercosCollected(0);
    setNewHighScore(false);
    
    // Reset positions
    playerRef.current = {
      x: 160,
      y: 400,
      width: 38,
      height: 48,
      vx: 0,
      vy: 0,
      targetX: 160,
      jumpStrength: -9.5 * activeChar.jumpBoost,
      speed: 5 * activeChar.speedBoost,
      hasShield: activeChar.id === 'dulce_dos_pobres',
      usedShield: false
    };
    
    cameraScrollRef.current = 0;
    currentHeightRef.current = 0;
    tercosInRunRef.current = 0;
    scoreRef.current = 0;
    
    // Setup initial platforms
    const initialPlatforms: Platform[] = [];
    // Base platform
    initialPlatforms.push({
      x: 130,
      y: 530,
      width: 100,
      height: 12,
      type: 'normal',
      direction: 1,
      broken: false,
      hasCollectible: 'none'
    });
    
    // Spawn a chain of reachable platforms up to top of screen
    let currentY = 480;
    while (currentY > -1000) {
      initialPlatforms.push(generatePlatformAtY(currentY));
      currentY -= 65 + Math.random() * 45;
    }
    
    platformsRef.current = initialPlatforms;
    particlesRef.current = [];
    
    // Start animation loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  const generatePlatformAtY = (y: number): Platform => {
    const width = 60 - Math.min(25, y / -200); // gets narrower as we rise
    const x = Math.random() * (360 - width - 20) + 10;
    
    // Platform types distribution based on height (y gets highly negative as we rise)
    const heightIndex = Math.abs(y);
    let type: Platform['type'] = 'normal';
    
    const r = Math.random();
    if (heightIndex > 500) {
      if (r < 0.15) type = 'moving';
      else if (r < 0.22) type = 'breakable';
      else if (r < 0.27) type = 'boost';
    }
    if (heightIndex > 2000) {
      if (r < 0.3) type = 'moving';
      else if (r < 0.42) type = 'breakable';
      else if (r < 0.5) type = 'boost';
    }
    
    // Collectibles distribution
    let hasCollectible: Platform['hasCollectible'] = 'none';
    const collRand = Math.random();
    if (type !== 'breakable') {
      if (collRand < 0.08) {
        hasCollectible = 'terco';
      } else if (collRand < 0.11) {
        hasCollectible = 'frase';
      }
    }
    
    return {
      x,
      y,
      width,
      height: 12,
      type,
      direction: Math.random() > 0.5 ? 1 : -1,
      broken: false,
      hasCollectible
    };
  };
  
  const getZoneInfo = (height: number) => {
    if (height < 1000) {
      return {
        name: 'Terra',
        gradientStart: '#1b3b73',
        gradientEnd: '#254b8c',
        platformColor: '#4d8231',
        description: 'Partindo rumo ao alto!',
        textColor: '#e2f0d9'
      };
    } else if (height < 2000) {
      return {
        name: 'Infância',
        gradientStart: '#254b8c',
        gradientEnd: '#90422c',
        platformColor: '#e07a5f',
        description: 'Como crianças no colo do Pai.',
        textColor: '#fceade'
      };
    } else if (height < 3000) {
      return {
        name: 'Juventude',
        gradientStart: '#90422c',
        gradientEnd: '#43196c',
        platformColor: '#d66a22',
        description: 'O vigor de quem consagra seus dias.',
        textColor: '#ffebdb'
      };
    } else if (height < 4500) {
      return {
        name: 'Vocação',
        gradientStart: '#43196c',
        gradientEnd: '#28114f',
        platformColor: '#dfb12f',
        description: 'Escutando o chamado de amor.',
        textColor: '#fdf3d1'
      };
    } else if (height < 6000) {
      return {
        name: 'Santidade',
        gradientStart: '#28114f',
        gradientEnd: '#876915',
        platformColor: '#faf0a3',
        description: 'Faça-se em mim a Tua vontade.',
        textColor: '#fffbf2'
      };
    } else {
      return {
        name: 'Céu',
        gradientStart: '#876915',
        gradientEnd: '#eadea6',
        platformColor: '#f7f4e9',
        description: 'A alegria eterna nos espera!',
        textColor: '#ffffff'
      };
    }
  };
  
  // Game Loop
  const gameLoop = () => {
    if (gameState === 'gameover' || showQuoteModal) {
      // Pause animation loop if modal is open or game over
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // 1. UPDATE PHYSICS
    updatePhysics();
    
    // 2. RENDER GRAPHICS
    renderGraphics(ctx);
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  const createExplosion = (x: number, y: number, color: string, count = 12, type: Particle['type'] = 'dust') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: type === 'cross' ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
        color,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        type
      });
    }
  };
  
  const updatePhysics = () => {
    const player = playerRef.current;
    
    // Apply gravity
    player.vy += 0.35;
    
    // Apply horizontal controls
    if (controlType === 'keyboard') {
      const accel = 0.6;
      const maxVx = player.speed;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a']) {
        player.vx = Math.max(-maxVx, player.vx - accel);
      } else if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d']) {
        player.vx = Math.min(maxVx, player.vx + accel);
      } else {
        player.vx *= 0.85; // friction
      }
    } else if (controlType === 'mouse' || controlType === 'touch') {
      // Interpolate x towards targetX
      const ease = 0.16;
      player.x += (player.targetX - player.x - player.width / 2) * ease;
    } else if (controlType === 'tilt') {
      // vx is already set in deviceorientation event, apply decay/friction
      player.vx = Math.max(-player.speed * 1.5, Math.min(player.speed * 1.5, player.vx));
    }
    
    // Apply vx to x for keys/tilt
    if (controlType === 'keyboard' || controlType === 'tilt') {
      player.x += player.vx;
    }
    
    // Apply velocity y to y
    player.y += player.vy;
    
    // Screen wrapping (Left/Right margins)
    if (player.x + player.width < 0) {
      player.x = 360;
      if (controlType === 'mouse' || controlType === 'touch') player.targetX = 360;
    } else if (player.x > 360) {
      player.x = -player.width;
      if (controlType === 'mouse' || controlType === 'touch') player.targetX = 0;
    }
    
    // Calculate current vertical climbing height
    const currentHeight = Math.floor(Math.max(0, 400 - player.y));
    if (currentHeight > currentHeightRef.current) {
      currentHeightRef.current = currentHeight;
      // Height record
      if (currentHeight > maxHeight) {
        setMaxHeight(currentHeight);
      }
    }
    
    // Calculate Score (Height + 100 * Terços)
    const pointsMultiplier = activeChar.id === 'chiara_badano' ? 1.5 : 1.0;
    const currentScore = currentHeightRef.current + Math.floor(tercosInRunRef.current * 100 * pointsMultiplier);
    scoreRef.current = currentScore;
    setScore(currentScore);
    
    // Camera Scroll following player upward
    if (player.y - cameraScrollRef.current < 250) {
      const diff = 250 - (player.y - cameraScrollRef.current);
      cameraScrollRef.current -= diff;
    }
    
    // Check collisions with platforms (Only when falling down!)
    if (player.vy > 0) {
      for (let i = 0; i < platformsRef.current.length; i++) {
        const plat = platformsRef.current[i];
        
        // Collide feet area with platform top bounding box
        if (
          player.x + player.width - 5 >= plat.x &&
          player.x + 5 <= plat.x + plat.width &&
          player.y + player.height >= plat.y &&
          player.y + player.height - player.vy <= plat.y + 12
        ) {
          // Bounce!
          if (plat.type === 'breakable') {
            plat.broken = true;
            createExplosion(plat.x + plat.width / 2, plat.y + 6, '#b45309', 15, 'dust');
            // Give a tiny bounce but it breaks
            player.vy = -3;
          } else if (plat.type === 'boost') {
            player.vy = player.jumpStrength * 1.8;
            createExplosion(player.x + player.width / 2, player.y + player.height, '#fbbf24', 25, 'star');
          } else {
            player.vy = player.jumpStrength;
            createExplosion(player.x + player.width / 2, player.y + player.height, '#ffffff', 8, 'dust');
          }
          break;
        }
      }
    }
    
    // Check item collection
    for (let i = 0; i < platformsRef.current.length; i++) {
      const plat = platformsRef.current[i];
      if (plat.hasCollectible !== 'none') {
        const itemX = plat.x + plat.width / 2;
        const itemY = plat.y - 15;
        
        // Collision circle check
        const dist = Math.hypot(
          (player.x + player.width / 2) - itemX,
          (player.y + player.height / 2) - itemY
        );
        
        if (dist < 28) {
          if (plat.hasCollectible === 'terco') {
            // Collect Rosary
            tercosInRunRef.current += 1;
            setTercosCollected(tercosInRunRef.current);
            createExplosion(itemX, itemY, '#facc15', 18, 'cross');
          } else if (plat.hasCollectible === 'frase') {
            // Collect Saint scroll
            createExplosion(itemX, itemY, '#38bdf8', 20, 'star');
            triggerSaintQuote();
          }
          plat.hasCollectible = 'none';
        }
      }
    }
    
    // Moving platforms animation & boundary check
    platformsRef.current.forEach(plat => {
      if (plat.type === 'moving') {
        plat.x += plat.direction * 1.5;
        if (plat.x + plat.width > 350) {
          plat.x = 350 - plat.width;
          plat.direction = -1;
        } else if (plat.x < 10) {
          plat.x = 10;
          plat.direction = 1;
        }
      }
    });
    
    // Clean up platforms off screen bottom and spawn new ones on top
    const viewBottom = cameraScrollRef.current + 580;
    // Keep platforms that are not too far down
    platformsRef.current = platformsRef.current.filter(plat => plat.y < viewBottom + 50 && !plat.broken);
    
    // Spawn new platforms at the top if highest platform is below screen top
    let highestY = 580;
    platformsRef.current.forEach(plat => {
      if (plat.y < highestY) highestY = plat.y;
    });
    
    const viewTop = cameraScrollRef.current;
    while (highestY > viewTop - 600) {
      const newY = highestY - (60 + Math.random() * 45);
      platformsRef.current.push(generatePlatformAtY(newY));
      highestY = newY;
    }
    
    // Update particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.vy += 0.05; // tiny particle gravity
    });
    particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
    
    // Game Over check: Player falls below screen view bottom
    if (player.y > viewBottom) {
      if (player.hasShield && !player.usedShield) {
        // Irmã Dulce first fall immunity! Teleport player up to nearest platform
        player.usedShield = true;
        player.hasShield = false;
        player.vy = -12; // super jump recovery
        
        // Find nearest platform above
        let nearestPlat = platformsRef.current[0];
        let minDist = 99999;
        platformsRef.current.forEach(plat => {
          const dist = Math.abs(plat.y - player.y);
          if (plat.y < player.y && dist < minDist) {
            minDist = dist;
            nearestPlat = plat;
          }
        });
        
        player.x = nearestPlat.x + nearestPlat.width / 2 - player.width / 2;
        player.y = nearestPlat.y - 100;
        createExplosion(player.x + player.width / 2, player.y + player.height, '#38bdf8', 30, 'star');
      } else {
        // Game Over!
        endGame();
      }
    }
  };
  
  const triggerSaintQuote = () => {
    // Select random saint quote
    const randQuote = SAINT_QUOTES[Math.floor(Math.random() * SAINT_QUOTES.length)];
    setActiveQuote(randQuote);
    setShowQuoteModal(true);
    
    // Cancel animation loop frame to pause physics
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };
  
  const dismissQuoteModal = () => {
    setShowQuoteModal(false);
    setActiveQuote(null);
    // Resume loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  const endGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Update permanently saved Terços
    const currentWallet = tercosWallet + tercosInRunRef.current;
    setTercosWallet(currentWallet);
    localStorage.setItem('rumoaoceu_tercos', currentWallet.toString());
    
    // Check high score
    const finalScore = scoreRef.current;
    const isNewHigh = leaderboard.length < 5 || finalScore > leaderboard[leaderboard.length - 1].score;
    setNewHighScore(isNewHigh);
    
    setGameState('gameover');
  };
  
  const submitScore = () => {
    if (!playerName.trim()) return;
    
    const finalScore = scoreRef.current;
    const finalHeight = currentHeightRef.current;
    const finalTercos = tercosInRunRef.current;
    
    const newEntry: GameScore = {
      name: playerName.trim(),
      score: finalScore,
      height: finalHeight,
      tercos: finalTercos,
      date: new Date().toLocaleDateString('pt-BR'),
      isPlayer: true
    };
    
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Keep top 5
      
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('rumoaoceu_scores', JSON.stringify(updatedLeaderboard));
    setNewHighScore(false);
  };
  
  const unlockCharacter = (char: Character) => {
    if (tercosWallet >= char.cost) {
      const newWallet = tercosWallet - char.cost;
      setTercosWallet(newWallet);
      localStorage.setItem('rumoaoceu_tercos', newWallet.toString());
      
      const updatedChars = characters.map(c => {
        if (c.id === char.id) return { ...c, unlocked: true };
        return c;
      });
      setCharacters(updatedChars);
      
      // Save unlocked character list
      const unlockedIds = updatedChars.filter(c => c.unlocked).map(c => c.id);
      localStorage.setItem('rumoaoceu_unlocked_chars', JSON.stringify(unlockedIds));
    } else {
      alert('Você não tem terços suficientes! Suba mais no jogo para coletar.');
    }
  };
  
  const selectCharacter = (id: string) => {
    setSelectedCharId(id);
    localStorage.setItem('rumoaoceu_selected_char', id);
  };
  
  // Render Graphics using HTML5 Canvas 2D
  const renderGraphics = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Dynamic Gradient Background based on current height
    const zone = getZoneInfo(currentHeightRef.current);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, zone.gradientStart);
    grad.addColorStop(1, zone.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply camera transformation (scroll offset)
    ctx.save();
    ctx.translate(0, -cameraScrollRef.current);
    
    // Draw platforms
    platformsRef.current.forEach(plat => {
      // Platform border/shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(plat.x + 3, plat.y + 4, plat.width, plat.height);
      
      // Select platform body color
      ctx.fillStyle = zone.platformColor;
      
      // Draw platform
      if (plat.type === 'normal') {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        // Grass top/details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
      } else if (plat.type === 'moving') {
        // Double horizontal lines for moving platforms
        ctx.fillStyle = '#38bdf8'; // neon blue for moving
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(plat.x + 4, plat.y + 3, plat.width - 8, 2);
      } else if (plat.type === 'boost') {
        // Golden platform with golden arrows
        ctx.fillStyle = '#f59e0b'; // Gold
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        ctx.fillStyle = '#ffffff';
        // Draw little arrow in the middle
        const midX = plat.x + plat.width / 2;
        ctx.beginPath();
        ctx.moveTo(midX, plat.y + 9);
        ctx.lineTo(midX - 5, plat.y + 9);
        ctx.lineTo(midX, plat.y + 3);
        ctx.lineTo(midX + 5, plat.y + 9);
        ctx.fill();
      } else if (plat.type === 'breakable') {
        // Wood style
        ctx.fillStyle = '#78350f';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        // Draw cracks
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plat.x + 10, plat.y);
        ctx.lineTo(plat.x + 15, plat.y + 12);
        ctx.moveTo(plat.x + plat.width - 15, plat.y);
        ctx.lineTo(plat.x + plat.width - 25, plat.y + 12);
        ctx.stroke();
      }
      
      // Draw Collectibles on platforms
      if (plat.hasCollectible !== 'none') {
        const itemX = plat.x + plat.width / 2;
        const itemY = plat.y - 12;
        
        if (plat.hasCollectible === 'terco') {
          // Draw Terço (golden circle with small cross at the bottom)
          ctx.beginPath();
          ctx.arc(itemX, itemY - 3, 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          
          // Draw cross
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(itemX, itemY + 2);
          ctx.lineTo(itemX, itemY + 8); // vertical bar
          ctx.moveTo(itemX - 3, itemY + 4);
          ctx.lineTo(itemX + 3, itemY + 4); // horizontal bar
          ctx.stroke();
        } else if (plat.hasCollectible === 'frase') {
          // Draw scroll / holy book
          ctx.fillStyle = '#38bdf8'; // glowing cyan
          ctx.fillRect(itemX - 5, itemY - 6, 10, 12);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(itemX - 3, itemY - 4, 6, 8);
          // Little cross on book cover
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(itemX - 1, itemY - 3, 2, 6);
          ctx.fillRect(itemX - 2, itemY - 2, 4, 2);
        }
      }
    });
    
    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      
      if (p.type === 'cross') {
        // Draw cross particle
        ctx.lineWidth = 2;
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.moveTo(p.x - p.size * 0.7, p.y - p.size * 0.2);
        ctx.lineTo(p.x + p.size * 0.7, p.y - p.size * 0.2);
        ctx.stroke();
      } else if (p.type === 'star') {
        // Draw star particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;
    });
    
    // Draw Player (Character Sticker)
    const player = playerRef.current;
    
    // Optional character shield/halo indicator (Irmã Dulce immunity)
    if (player.hasShield) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, Math.max(player.width, player.height) / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
    
    // Get preloaded image
    const charImg = charImagesRef.current[selectedCharId];
    if (charImg && charImg.complete && charImg.naturalWidth !== 0) {
      // Draw image
      ctx.drawImage(charImg, player.x, player.y, player.width, player.height);
    } else {
      // Fallback block character
      ctx.fillStyle = '#dd681f';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + 8, player.y + 8, 8, 8);
      ctx.fillRect(player.x + 22, player.y + 8, 8, 8);
    }
    
    ctx.restore();
    
    // 3. DRAW SCREEN DETAILS (Fixed elements)
    
    // Score & Height HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, 42);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px font-sans, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`ALTURA: ${currentHeightRef.current}m`, 12, 18);
    ctx.fillText(`PONTOS: ${scoreRef.current}`, 12, 33);
    
    // Terços HUD
    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`📿 x ${tercosInRunRef.current}`, canvas.width - 12, 18);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Nível: ${zone.name.toUpperCase()}`, canvas.width - 12, 33);
  };
  
  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    setControlType('touch');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    // scale touch coordinate to match internal canvas coordinates
    playerRef.current.targetX = (touchX / rect.width) * canvas.width;
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    playerRef.current.targetX = (touchX / rect.width) * canvas.width;
  };
  
  // Mouse Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    if (controlType !== 'mouse') setControlType('mouse');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    playerRef.current.targetX = (mouseX / rect.width) * canvas.width;
  };
  
  return (
    <div className="flex-1 flex flex-col justify-start relative h-full text-white overflow-hidden font-sans">
      
      {/* 1. PLAYING GAMEPLAY SCREEN */}
      <div className="relative w-full h-[580px] bg-[#122340] shrink-0 border-b border-[#2e5aa8]/40">
        <canvas
          ref={canvasRef}
          width={360}
          height={580}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
          className="w-full h-full bg-[#1b3b73] cursor-crosshair block"
        />
        
        {/* Tilt permission overlay for mobile */}
        {gameState === 'playing' && tiltSupported && controlType !== 'tilt' && (
          <button
            onClick={requestTiltPermission}
            className="absolute bottom-4 right-4 z-40 bg-black/60 border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white hover:bg-[#dd681f] flex items-center gap-1 shadow-lg active:scale-95 transition-all"
          >
            <Icons.Smartphone className="w-3 h-3" />
            Ativar Giroscópio 📱
          </button>
        )}
        
        {/* Controls indicator HUD overlay */}
        {gameState === 'playing' && (
          <div className="absolute top-12 left-0 right-0 text-center pointer-events-none z-30 select-none">
            <span className="inline-block bg-black/40 text-gray-400 px-2 py-0.5 text-[7px] font-mono uppercase tracking-widest rounded-full border border-white/5">
              Controle: {controlType === 'mouse' && 'MOUSE'} {controlType === 'keyboard' && 'TECLADO (← →)'} {controlType === 'touch' && 'TOQUE (DESLIZAR)'} {controlType === 'tilt' && 'INCLINAÇÃO'}
            </span>
          </div>
        )}
        
        {/* Dynamic Zone level notifications overlay */}
        <AnimatePresence>
          {gameState === 'playing' && (
            <div className="absolute top-16 left-0 right-0 text-center pointer-events-none z-30 select-none">
              {/* Trigger notification when level changes */}
              <LevelChangeNotification height={currentHeightRef.current} />
            </div>
          )}
        </AnimatePresence>
        
        {/* MENU OVERLAY */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b3b73]/95 to-[#122340]/95 z-40 flex flex-col justify-between p-5 text-center overflow-y-auto no-scrollbar">
            
            {/* Title */}
            <div className="pt-6 relative">
              {/* Halos effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-8 rounded-full border-2 border-yellow-300/40 blur-[1px] rotate-[-5deg] animate-pulse"></div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                Rumo ao Céu!
              </h1>
              <span className="text-[10px] text-[#dd681f] font-mono tracking-[0.35em] uppercase font-black block mt-1">
                A Jornada Espiritual
              </span>
            </div>
            
            {/* Character select Carousel */}
            <div className="my-auto py-4 space-y-4">
              <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase font-black block">
                Escolha seu Personagem:
              </span>
              
              <div className="flex items-center justify-center gap-4">
                {/* Character preview */}
                <div className="bg-[#254b8c]/50 border-2 border-[#2e5aa8] p-4 w-52 rounded-2xl relative shadow-lg flex flex-col items-center">
                  <div className="h-28 flex items-center justify-center mb-3">
                    <motion.img
                      key={activeChar.id}
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1.0, rotate: 0 }}
                      src={activeChar.avatar}
                      alt={activeChar.name}
                      className="w-20 h-24 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider leading-none">
                    {activeChar.name}
                  </h3>
                  <p className="text-[9px] text-gray-400 mt-2 h-8 leading-snug font-sans uppercase font-medium">
                    {activeChar.description}
                  </p>
                  
                  {/* Status buffs */}
                  <div className="flex gap-2.5 mt-3 pt-2.5 border-t border-[#2e5aa8]/40 w-full justify-center text-[8.5px] font-mono uppercase text-gray-300">
                    <span>🏃 {Math.round(activeChar.speedBoost * 100)}% Vel</span>
                    <span>🦘 {Math.round(activeChar.jumpBoost * 100)}% Pulo</span>
                  </div>
                </div>
              </div>
              
              {/* Horizontal selection pills */}
              <div className="flex justify-center flex-wrap gap-1.5 max-w-[280px] mx-auto">
                {characters.map(char => {
                  const isSelected = char.id === selectedCharId;
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        if (char.unlocked) selectCharacter(char.id);
                        else unlockCharacter(char);
                      }}
                      className={`px-2.5 py-1 text-[8.5px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#dd681f] border-[#dd681f] text-white font-black'
                          : char.unlocked
                          ? 'bg-[#1b3b73] border-[#2e5aa8] text-gray-300'
                          : 'bg-black/40 border-dashed border-gray-600 text-gray-500 hover:border-[#dd681f]/60 hover:text-white'
                      }`}
                    >
                      {char.name.split(' ')[0]}
                      {!char.unlocked && <span className="text-yellow-400">📿{char.cost}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3.5 pb-6">
              <div className="flex justify-center items-center gap-1.5 text-xs text-yellow-400 font-mono tracking-widest uppercase font-bold">
                <span>SUA CARTEIRA:</span>
                <span className="text-sm font-black">📿 {tercosWallet}</span>
              </div>
              
              <button
                onClick={startGame}
                className="w-full bg-[#dd681f] hover:bg-white hover:text-[#1b3b73] text-white font-black py-4 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(221,104,31,0.5)] border border-[#dd681f]/40 cursor-pointer"
              >
                JOGAR
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGameState('shop')}
                  className="bg-[#254b8c] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white font-bold py-2.5 px-3 text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Icons.ShoppingBag className="w-3.5 h-3.5" />
                  LOJA DE SANTOS
                </button>
                <button
                  onClick={onBack}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-2.5 px-3 text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Icons.ArrowLeft className="w-3.5 h-3.5" />
                  VOLTAR AO SITE
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* SHOP MODAL / VIEW */}
        {gameState === 'shop' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b3b73]/95 to-[#122340]/95 z-40 flex flex-col justify-between p-5 text-center overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2e5aa8]/40 pb-3">
                <button
                  onClick={() => setGameState('menu')}
                  className="text-gray-400 hover:text-white text-[10px] uppercase font-black tracking-widest flex items-center gap-0.5 cursor-pointer"
                >
                  <Icons.ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <span className="text-xs text-[#dd681f] font-black tracking-wider uppercase font-mono">
                  SANTUÁRIO DE STICKERS
                </span>
                <span className="text-yellow-400 font-mono text-xs font-black">
                  📿 {tercosWallet}
                </span>
              </div>
              
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans uppercase font-medium">
                Colete terços durante as subidas rumo ao céu e use-os para invocar o auxílio de santos e beatos intercessores!
              </p>
              
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar pt-2">
                {characters.map(char => (
                  <div
                    key={char.id}
                    className={`flex items-center gap-3 p-3 bg-gradient-to-r ${
                      char.unlocked ? 'from-[#254b8c]/50 to-[#254b8c]/20' : 'from-black/40 to-black/10'
                    } border border-[#2e5aa8]/40 rounded-xl relative text-left`}
                  >
                    <img
                      src={char.avatar}
                      alt={char.name}
                      className="w-12 h-14 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11.5px] font-black text-white uppercase block leading-none">
                        {char.name}
                      </span>
                      <span className="text-[8.5px] text-gray-400 mt-1.5 block leading-normal font-sans uppercase font-medium">
                        {char.description}
                      </span>
                      <div className="flex gap-2 mt-1.5 text-[7.5px] font-mono text-gray-300 uppercase">
                        <span>🏃 Vel: {Math.round(char.speedBoost * 100)}%</span>
                        <span>🦘 Pulo: {Math.round(char.jumpBoost * 100)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      {char.unlocked ? (
                        <button
                          onClick={() => {
                            selectCharacter(char.id);
                            setGameState('menu');
                          }}
                          className={`px-3 py-1.5 text-[8.5px] font-mono uppercase font-black tracking-wider transition-all border ${
                            selectedCharId === char.id
                              ? 'bg-[#dd681f] border-[#dd681f] text-white'
                              : 'bg-transparent border-[#dd681f]/40 text-[#dd681f] hover:bg-[#dd681f] hover:text-white'
                          }`}
                        >
                          {selectedCharId === char.id ? 'ATIVO' : 'USAR'}
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockCharacter(char)}
                          disabled={tercosWallet < char.cost}
                          className="px-2.5 py-1.5 bg-[#facc15] hover:bg-white text-black font-black text-[9px] font-mono uppercase tracking-wider flex flex-col items-center gap-0.5 border border-[#facc15] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span>DESBLOQUEAR</span>
                          <span>📿 {char.cost}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 pb-2">
              <button
                onClick={() => setGameState('menu')}
                className="w-full bg-[#1b3b73] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white font-black py-3 text-xs tracking-wider uppercase cursor-pointer transition-all"
              >
                FECHAR LOJA
              </button>
            </div>
          </div>
        )}
        
        {/* GAMEOVER SCREEN OVERLAY */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 to-[#122340]/95 z-40 flex flex-col justify-between p-5 text-center overflow-y-auto no-scrollbar">
            <div className="space-y-4 pt-6">
              <span className="text-red-500 text-[10px] font-mono tracking-[0.35em] uppercase font-black block">
                FIM DE JOGO 🪽
              </span>
              <h2 className="text-2xl font-black uppercase text-white tracking-tighter leading-none">
                SEU CORPO CANSOU!
              </h2>
              <p className="text-[10px] text-gray-400 font-sans uppercase font-medium">
                Mas sua alma subiu rumo ao alto! Veja suas estatísticas de fé:
              </p>
              
              {/* Stats Card */}
              <div className="bg-[#254b8c]/40 border border-[#2e5aa8]/40 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center shadow-lg">
                <div>
                  <span className="text-[8px] text-[#dd681f] font-black uppercase tracking-wider block">SCORE TOTAL</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">{score}</span>
                </div>
                <div className="border-x border-[#2e5aa8]/30">
                  <span className="text-[8px] text-[#dd681f] font-black uppercase tracking-wider block">ALTURA MAX</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">{maxHeight}m</span>
                </div>
                <div>
                  <span className="text-[8px] text-[#dd681f] font-black uppercase tracking-wider block">TERÇOS</span>
                  <span className="text-lg font-black text-yellow-400 font-mono mt-1 block">📿 {tercosCollected}</span>
                </div>
              </div>
              
              {/* High Score input */}
              {newHighScore ? (
                <div className="bg-[#dd681f]/10 border-2 border-dashed border-[#dd681f]/40 p-4 space-y-3">
                  <span className="text-[#facc15] font-black text-[9px] tracking-widest font-mono uppercase block animate-pulse">
                    ⭐ NOVO RECORDE GLOBAL DA SEMANA! ⭐
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Seu nome / Shalom"
                      className="flex-1 bg-[#1b3b73]/60 border-2 border-[#2e5aa8] py-2 px-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#dd681f] font-mono uppercase font-bold"
                    />
                    <button
                      onClick={submitScore}
                      disabled={!playerName.trim()}
                      className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-4 font-black text-xs uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Gravar
                    </button>
                  </div>
                </div>
              ) : (
                /* Dynamic scoreboard leaderboard */
                <div className="bg-black/30 border border-[#2e5aa8]/30 p-3 space-y-2 text-left">
                  <span className="text-[8.5px] text-[#dd681f] font-black tracking-widest font-mono uppercase block text-center mb-1.5">
                    🏆 RANKING RUMO AO CÉU 🏆
                  </span>
                  
                  <div className="space-y-1.5">
                    {leaderboard.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between items-center text-[10px] font-mono px-2 py-1 ${
                          item.isPlayer ? 'bg-[#dd681f]/20 border border-[#dd681f]/40 text-yellow-300' : 'text-gray-300'
                        }`}
                      >
                        <span className="font-bold flex gap-1.5">
                          <span>{idx + 1}.</span>
                          <span className="uppercase">{item.name}</span>
                        </span>
                        <span className="font-black text-white">{item.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="space-y-2.5 pb-4">
              <button
                onClick={startGame}
                className="w-full bg-[#dd681f] hover:bg-white hover:text-[#122340] text-white font-black py-3.5 px-4 rounded-xl tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-md"
              >
                <Icons.RotateCcw className="w-4 h-4" />
                TENTAR NOVAMENTE
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="w-full bg-[#1b3b73] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Icons.Play className="w-4 h-4" />
                IR PARA O MENU
              </button>
            </div>
          </div>
        )}
        
        {/* SAINT QUOTE GLASSMORPHIC POPUP MODAL */}
        <AnimatePresence>
          {showQuoteModal && activeQuote && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-5">
              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1.0, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                className="w-full max-w-[280px] bg-slate-900/90 border-2 border-yellow-500/40 p-5 rounded-3xl relative text-center shadow-2xl flex flex-col items-center"
              >
                {/* Glowing halo indicator */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full border border-yellow-300/60 blur-[0.5px] rotate-[-5deg] animate-pulse bg-yellow-300/10"></div>
                
                {/* Saint Avatar placeholder / representation */}
                <div className="w-14 h-14 bg-gradient-to-tr from-yellow-500/20 to-yellow-300/20 border border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 text-2xl font-black mb-3 shadow-[0_0_12px_rgba(234,179,8,0.3)] select-none">
                  👼
                </div>
                
                {/* Quote details */}
                <span className="text-[8px] text-yellow-500 font-mono tracking-[0.25em] uppercase font-black block mb-2">
                  Palavra de Santidade
                </span>
                
                <p className="text-white text-xs font-serif font-bold italic leading-relaxed uppercase max-h-[140px] overflow-y-auto no-scrollbar px-1 py-1">
                  "{activeQuote.quote}"
                </p>
                
                <div className="w-8 h-[1.5px] bg-[#dd681f] my-3 rounded-full"></div>
                
                <span className="text-[10px] text-gray-300 font-black tracking-wider uppercase font-sans">
                  {activeQuote.saint}
                </span>
                
                {/* Dismiss button */}
                <button
                  onClick={dismissQuoteModal}
                  className="w-full bg-[#dd681f] hover:bg-[#c25410] text-white font-black py-2.5 px-4 rounded-xl text-[10.5px] tracking-widest uppercase mt-4.5 cursor-pointer shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  Amém! 🙏
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Bouncing / Level change text notification
function LevelChangeNotification({ height }: { height: number }) {
  const [lastLevel, setLastLevel] = useState('Terra');
  const [show, setShow] = useState(false);
  
  const currentLevelName = height < 1000 ? 'Terra'
                         : height < 2000 ? 'Infância'
                         : height < 3000 ? 'Juventude'
                         : height < 4500 ? 'Vocação'
                         : height < 6000 ? 'Santidade'
                         : 'Céu';
  
  useEffect(() => {
    if (currentLevelName !== lastLevel) {
      setLastLevel(currentLevelName);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [currentLevelName, lastLevel]);
  
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.5, y: -20, opacity: 0 }}
      animate={{ scale: [1.2, 1.0], y: 0, opacity: 1 }}
      exit={{ scale: 1.5, y: -30, opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="inline-block bg-[#dd681f] border-2 border-white/80 px-4 py-2 text-white font-black text-xs uppercase tracking-widest shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-yellow-400 animate-ping opacity-25 rounded-none pointer-events-none"></div>
      CHEGANDO NA {currentLevelName}! 😇
    </motion.div>
  );
}
