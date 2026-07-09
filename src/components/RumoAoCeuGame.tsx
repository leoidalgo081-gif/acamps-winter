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
  hasCollectible: 'none' | 'terco' | 'frase' | 'agua_benta' | 'hostia' | 'cruz';
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
  type: 'star' | 'cross' | 'dust' | 'bubble';
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
  { quote: "A santidade consiste in estar sempre alegres no Senhor.", saint: "São Domingos Sávio", avatarId: "carlo_acutis" }
];

const INITIAL_CHARACTERS: Character[] = [
  { id: 'frassati', name: 'Pier Giorgio Frassati', avatar: '/novo_boneco_1.png', description: 'O jovem alpinista. Pulos muito altos!', cost: 0, unlocked: true, jumpBoost: 1.25, speedBoost: 1.0 },
  { id: 'chiara_badano', name: 'Chiara Luce Badano', avatar: '/novo_boneco_2.png', description: 'Sorriso luminoso. Ganha 1.5x mais pontos por terços.', cost: 15, unlocked: false, jumpBoost: 1.05, speedBoost: 1.15 },
  { id: 'jp2', name: 'São João Paulo II', avatar: '/novo_boneco_3.png', description: 'Papa dos Jovens. Super salto celestial e imunidade a quedas!', cost: 30, unlocked: false, jumpBoost: 1.3, speedBoost: 0.95 },
  { id: 'carlo_acutis', name: 'Beato Carlo Acutis', avatar: '/novo_boneco_4.png', description: 'Padroeiro da Internet. Pula e corre mais rápido.', cost: 50, unlocked: false, jumpBoost: 1.15, speedBoost: 1.1 }
];

export default function RumoAoCeuGame({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'shop'>('menu');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [selectedCharId, setSelectedCharId] = useState<string>('frassati');
  const [tercosWallet, setTercosWallet] = useState<number>(0);
  
  // Leaderboard global state (from Express backend database)
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([]);
  const [newHighScore, setNewHighScore] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Game stats
  const [score, setScore] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [tercosCollected, setTercosCollected] = useState(0);
  
  // Power-up active states (for UI rendering)
  const [activePowerUps, setActivePowerUps] = useState<{ name: string; timeLeft: number; icon: string }[]>([]);
  
  // Saint Quote Toast State
  const [activeQuote, setActiveQuote] = useState<SaintQuote | null>(null);
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Controls settings
  const [controlType, setControlType] = useState<'mouse' | 'touch' | 'keyboard' | 'tilt'>('mouse');
  const [tiltSupported, setTiltSupported] = useState(false);
  
  // Canvas & loop refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // REFS TO PREVENT CLOSURE BUGS IN GAMELOOP
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover' | 'shop'>('menu');
  const controlTypeRef = useRef<'mouse' | 'touch' | 'keyboard' | 'tilt'>('mouse');
  
  // Synchronize refs with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    controlTypeRef.current = controlType;
  }, [controlType]);
  
  // Physics engine states
  const playerRef = useRef({
    x: 180,
    y: 400,
    width: 38,
    height: 48,
    vx: 0,
    vy: 0,
    targetX: 180,
    jumpStrength: -8.3, // Shorter jump strength
    speed: 4.2, // Slower horizontal speed
    hasShield: false,
    usedShield: false,
    
    // Active power-up timers
    holyWaterTime: 0,
    doublePointsTime: 0
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraScrollRef = useRef<number>(0);
  const currentHeightRef = useRef<number>(0);
  const tercosInRunRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  
  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];
  
  // Fetch leaderboard scores from DB
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error fetching global database leaderboard:', err);
    }
  };

  // Load saved data from localStorage & fetch DB leaderboard
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
    
    const savedCharId = localStorage.getItem('rumoaoceu_selected_char');
    if (savedCharId) {
      setSelectedCharId(savedCharId);
    }
    
    // Check tilt support
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      setTiltSupported(true);
      setControlType('touch');
    } else {
      setControlType('mouse');
    }
    
    fetchLeaderboard();
  }, []);
  
  // Handle controls setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
      if (gameStateRef.current === 'playing' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd')) {
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
  }, []);
  
  // Handle Tilt Event
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (gameStateRef.current !== 'playing' || controlTypeRef.current !== 'tilt') return;
      if (e.gamma !== null) {
        const sensitivity = 0.7;
        const speed = e.gamma * sensitivity;
        playerRef.current.vx = speed;
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);
  
  // Load Character Sprites
  const charImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  useEffect(() => {
    INITIAL_CHARACTERS.forEach(char => {
      const img = new Image();
      img.src = char.avatar;
      charImagesRef.current[char.id] = img;
    });
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
    gameStateRef.current = 'playing';
    setGameState('playing');
    setScore(0);
    setMaxHeight(0);
    setTercosCollected(0);
    setActivePowerUps([]);
    setNewHighScore(false);
    
    const char = characters.find(c => c.id === selectedCharId) || characters[0];
    
    // Reset positions
    playerRef.current = {
      x: 160,
      y: 400,
      width: 38,
      height: 48,
      vx: 0,
      vy: 0,
      targetX: 160,
      jumpStrength: -8.3 * char.jumpBoost, // Slower jump strength
      speed: 4.2 * char.speedBoost, // Less frantic speed
      hasShield: char.id === 'jp2', // JPII starts with shield
      usedShield: false,
      holyWaterTime: 0,
      doublePointsTime: 0
    };
    
    cameraScrollRef.current = 0;
    currentHeightRef.current = 0;
    tercosInRunRef.current = 0;
    scoreRef.current = 0;
    
    // Setup initial platforms - Easy spacing at start
    const initialPlatforms: Platform[] = [];
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
      currentY -= 48 + Math.random() * 20; // Short gaps to match shorter jumps
    }
    
    platformsRef.current = initialPlatforms;
    particlesRef.current = [];
    
    // Start animation loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Procedural platform generator - Progressively harder
  const generatePlatformAtY = (y: number): Platform => {
    const heightIndex = Math.abs(y);
    
    // Platform width: starts wide (90px) and gets narrower (down to 40px)
    const width = Math.max(38, 90 - (heightIndex / 150));
    const x = Math.random() * (360 - width - 20) + 10;
    
    // Platform types distribution based on height
    let type: Platform['type'] = 'normal';
    const r = Math.random();
    
    if (heightIndex > 1000) {
      if (r < 0.12) type = 'moving';
      else if (r < 0.18) type = 'breakable';
      else if (r < 0.22) type = 'boost';
    }
    if (heightIndex > 5000) {
      if (r < 0.30) type = 'moving';
      else if (r < 0.45) type = 'breakable';
      else if (r < 0.52) type = 'boost';
    }
    
    // Collectibles distribution
    let hasCollectible: Platform['hasCollectible'] = 'none';
    const collRand = Math.random();
    
    if (type !== 'breakable') {
      if (collRand < 0.08) {
        hasCollectible = 'terco';
      } else if (collRand < 0.11) {
        hasCollectible = 'frase';
      } else if (collRand < 0.13) {
        hasCollectible = 'agua_benta';
      } else if (collRand < 0.15) {
        hasCollectible = 'hostia';
      } else if (collRand < 0.17) {
        hasCollectible = 'cruz';
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
  
  // Longer Vertical Zones
  const getZoneInfo = (height: number) => {
    if (height < 3500) {
      return {
        name: 'Terra',
        gradientStart: '#1b3b73',
        gradientEnd: '#254b8c',
        platformColor: '#4d8231',
        description: 'Partindo rumo ao alto!',
        textColor: '#e2f0d9'
      };
    } else if (height < 7500) {
      return {
        name: 'Infância',
        gradientStart: '#254b8c',
        gradientEnd: '#90422c',
        platformColor: '#e07a5f',
        description: 'Como crianças no colo do Pai.',
        textColor: '#fceade'
      };
    } else if (height < 12000) {
      return {
        name: 'Juventude',
        gradientStart: '#90422c',
        gradientEnd: '#43196c',
        platformColor: '#d66a22',
        description: 'O vigor de quem consagra seus dias.',
        textColor: '#ffebdb'
      };
    } else if (height < 17000) {
      return {
        name: 'Vocação',
        gradientStart: '#43196c',
        gradientEnd: '#28114f',
        platformColor: '#dfb12f',
        description: 'Escutando o chamado de amor.',
        textColor: '#fdf3d1'
      };
    } else if (height < 23000) {
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
    if (gameStateRef.current !== 'playing') {
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
      const speed = 1 + Math.random() * 2.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: type === 'cross' ? 4 + Math.random() * 4 : type === 'bubble' ? 3 + Math.random() * 3 : 2 + Math.random() * 3,
        color,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        type
      });
    }
  };
  
  const updatePhysics = () => {
    const player = playerRef.current;
    
    // Decrement power-up timers
    if (player.holyWaterTime > 0) player.holyWaterTime = Math.max(0, player.holyWaterTime - 1 / 60);
    if (player.doublePointsTime > 0) player.doublePointsTime = Math.max(0, player.doublePointsTime - 1 / 60);
    
    // Sync powerups state to React state
    const list: typeof activePowerUps = [];
    if (player.holyWaterTime > 0) {
      list.push({ name: 'Água Benta (Pulo 1.35x)', timeLeft: player.holyWaterTime, icon: '💧' });
    }
    if (player.doublePointsTime > 0) {
      list.push({ name: 'Bíblia (Pontos 2x)', timeLeft: player.doublePointsTime, icon: '📖' });
    }
    if (player.hasShield) {
      list.push({ name: 'Escudo Santo', timeLeft: 999, icon: '🛡️' });
    }
    setActivePowerUps(list);
    
    // Less frantic gravity
    player.vy += 0.30;
    
    // Apply horizontal controls
    if (controlTypeRef.current === 'keyboard') {
      const accel = 0.5;
      const maxVx = player.speed;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a']) {
        player.vx = Math.max(-maxVx, player.vx - accel);
      } else if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d']) {
        player.vx = Math.min(maxVx, player.vx + accel);
      } else {
        player.vx *= 0.85;
      }
    } else if (controlTypeRef.current === 'mouse' || controlTypeRef.current === 'touch') {
      const ease = 0.14; // smoother mouse easing
      player.x += (player.targetX - player.x - player.width / 2) * ease;
    } else if (controlTypeRef.current === 'tilt') {
      player.vx = Math.max(-player.speed * 1.4, Math.min(player.speed * 1.4, player.vx));
    }
    
    if (controlTypeRef.current === 'keyboard' || controlTypeRef.current === 'tilt') {
      player.x += player.vx;
    }
    
    player.y += player.vy;
    
    // Screen wrapping
    if (player.x + player.width < 0) {
      player.x = 360;
      if (controlTypeRef.current === 'mouse' || controlTypeRef.current === 'touch') player.targetX = 360;
    } else if (player.x > 360) {
      player.x = -player.width;
      if (controlTypeRef.current === 'mouse' || controlTypeRef.current === 'touch') player.targetX = 0;
    }
    
    // Calculate vertical climbing height
    const currentHeight = Math.floor(Math.max(0, 400 - player.y));
    if (currentHeight > currentHeightRef.current) {
      currentHeightRef.current = currentHeight;
      if (currentHeight > maxHeight) {
        setMaxHeight(currentHeight);
      }
    }
    
    // Calculate Score (Height + 100 * Terços)
    const pointsMultiplier = activeChar.id === 'chiara_badano' ? 1.5 : 1.0;
    const doubleMultiplier = player.doublePointsTime > 0 ? 2.0 : 1.0;
    const currentScore = currentHeightRef.current + Math.floor(tercosInRunRef.current * 100 * pointsMultiplier * doubleMultiplier);
    scoreRef.current = currentScore;
    setScore(currentScore);
    
    // Camera Scroll following player upward
    if (player.y - cameraScrollRef.current < 250) {
      const diff = 250 - (player.y - cameraScrollRef.current);
      cameraScrollRef.current -= diff;
    }
    
    // Check collisions with platforms
    if (player.vy > 0) {
      for (let i = 0; i < platformsRef.current.length; i++) {
        const plat = platformsRef.current[i];
        
        if (
          player.x + player.width - 5 >= plat.x &&
          player.x + 5 <= plat.x + plat.width &&
          player.y + player.height >= plat.y &&
          player.y + player.height - player.vy <= plat.y + 12
        ) {
          const activeJumpMultiplier = player.holyWaterTime > 0 ? 1.35 : 1.0;
          
          if (plat.type === 'breakable') {
            plat.broken = true;
            createExplosion(plat.x + plat.width / 2, plat.y + 6, '#b45309', 15, 'dust');
            player.vy = -3;
          } else if (plat.type === 'boost') {
            player.vy = player.jumpStrength * 1.8 * activeJumpMultiplier;
            createExplosion(player.x + player.width / 2, player.y + player.height, '#fbbf24', 25, 'star');
          } else {
            player.vy = player.jumpStrength * activeJumpMultiplier;
            createExplosion(player.x + player.width / 2, player.y + player.height, '#ffffff', 8, 'dust');
          }
          break;
        }
      }
    }
    
    // Check item/power-up collection
    for (let i = 0; i < platformsRef.current.length; i++) {
      const plat = platformsRef.current[i];
      if (plat.hasCollectible !== 'none') {
        const itemX = plat.x + plat.width / 2;
        const itemY = plat.y - 15;
        
        const dist = Math.hypot(
          (player.x + player.width / 2) - itemX,
          (player.y + player.height / 2) - itemY
        );
        
        if (dist < 28) {
          const type = plat.hasCollectible;
          plat.hasCollectible = 'none';
          
          if (type === 'terco') {
            tercosInRunRef.current += 1;
            setTercosCollected(tercosInRunRef.current);
            createExplosion(itemX, itemY, '#facc15', 18, 'cross');
          } else if (type === 'frase') {
            createExplosion(itemX, itemY, '#38bdf8', 20, 'star');
            triggerSaintQuote();
          } else if (type === 'agua_benta') {
            player.holyWaterTime = 8.0;
            createExplosion(itemX, itemY, '#60a5fa', 22, 'bubble');
          } else if (type === 'hostia') {
            player.vy = -16; // Propels a bit lower to match new speed
            createExplosion(itemX, itemY, '#ffffff', 35, 'star');
          } else if (type === 'cruz') {
            player.hasShield = true;
            createExplosion(itemX, itemY, '#ef4444', 25, 'cross');
          }
        }
      }
    }
    
    // Moving platforms horizontal animation
    platformsRef.current.forEach(plat => {
      if (plat.type === 'moving') {
        plat.x += plat.direction * 1.2; // slightly slower moving platforms
        if (plat.x + plat.width > 350) {
          plat.x = 350 - plat.width;
          plat.direction = -1;
        } else if (plat.x < 10) {
          plat.x = 10;
          plat.direction = 1;
        }
      }
    });
    
    // Shorter gap settings to match shorter jump strength
    const heightIndex = Math.abs(player.y);
    const gap = 48 + Math.min(32, heightIndex / 150); // scales from 48px to 80px max
    
    // Clean up old platforms off screen
    const viewBottom = cameraScrollRef.current + 580;
    platformsRef.current = platformsRef.current.filter(plat => plat.y < viewBottom + 50 && !plat.broken);
    
    // Spawn new platforms
    let highestY = 580;
    platformsRef.current.forEach(plat => {
      if (plat.y < highestY) highestY = plat.y;
    });
    
    const viewTop = cameraScrollRef.current;
    while (highestY > viewTop - 600) {
      const newY = highestY - (gap + Math.random() * 15);
      platformsRef.current.push(generatePlatformAtY(newY));
      highestY = newY;
    }
    
    // Update particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.vy += 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
    
    // Game Over check
    if (player.y > viewBottom) {
      if (player.hasShield) {
        player.hasShield = false;
        player.usedShield = true;
        player.vy = -12;
        
        let nearestPlat = platformsRef.current[0] || { x: 130, y: 300, width: 100 };
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
        endGame();
      }
    }
  };
  
  const triggerSaintQuote = () => {
    const randQuote = SAINT_QUOTES[Math.floor(Math.random() * SAINT_QUOTES.length)];
    setActiveQuote(randQuote);
    
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    quoteTimeoutRef.current = setTimeout(() => {
      setActiveQuote(null);
    }, 5500);
  };
  
  const endGame = () => {
    gameStateRef.current = 'gameover';
    setGameState('gameover');
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Update permanently saved Terços
    const currentWallet = tercosWallet + tercosInRunRef.current;
    setTercosWallet(currentWallet);
    localStorage.setItem('rumoaoceu_tercos', currentWallet.toString());
    
    // Check if score fits global leaderboard
    const finalScore = scoreRef.current;
    const qualifies = finalScore > 0 && (leaderboard.length < 10 || finalScore > leaderboard[leaderboard.length - 1].score);
    setNewHighScore(qualifies);
    
    fetchLeaderboard();
  };

  const submitScore = async () => {
    if (!playerName.trim()) return;
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          score: scoreRef.current,
          height: currentHeightRef.current,
          tercos: tercosInRunRef.current
        })
      });
      if (res.ok) {
        const data = await res.json();
        const finalScore = scoreRef.current;
        const marked = data.map((item: GameScore) => ({
          ...item,
          isPlayer: item.score === finalScore && item.name === playerName.trim()
        }));
        setLeaderboard(marked);
        setNewHighScore(false);
        setPlayerName('');
      }
    } catch (err) {
      console.error('Error submitting score to database:', err);
      setNewHighScore(false);
    }
  };
  
  const selectCharacter = (id: string) => {
    setSelectedCharId(id);
    localStorage.setItem('rumoaoceu_selected_char', id);
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
      alert(`Você precisa de 📿 ${char.cost} terços! Suba mais no jogo para coletar.`);
    }
  };
  
  // Render Graphics using HTML5 Canvas 2D
  const renderGraphics = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Dynamic Gradient Background
    const zone = getZoneInfo(currentHeightRef.current);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, zone.gradientStart);
    grad.addColorStop(1, zone.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(0, -cameraScrollRef.current);
    
    // Draw platforms
    platformsRef.current.forEach(plat => {
      // Platform shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(plat.x + 3, plat.y + 4, plat.width, plat.height);
      
      // Platform color
      ctx.fillStyle = zone.platformColor;
      
      if (plat.type === 'normal') {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
      } else if (plat.type === 'moving') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(plat.x + 4, plat.y + 3, plat.width - 8, 2);
      } else if (plat.type === 'boost') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        ctx.fillStyle = '#ffffff';
        const midX = plat.x + plat.width / 2;
        ctx.beginPath();
        ctx.moveTo(midX, plat.y + 9);
        ctx.lineTo(midX - 5, plat.y + 9);
        ctx.lineTo(midX, plat.y + 3);
        ctx.lineTo(midX + 5, plat.y + 9);
        ctx.fill();
      } else if (plat.type === 'breakable') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plat.x + 10, plat.y);
        ctx.lineTo(plat.x + 15, plat.y + 12);
        ctx.moveTo(plat.x + plat.width - 15, plat.y);
        ctx.lineTo(plat.x + plat.width - 25, plat.y + 12);
        ctx.stroke();
      }
      
      // Draw Collectibles
      if (plat.hasCollectible !== 'none') {
        const itemX = plat.x + plat.width / 2;
        const itemY = plat.y - 12;
        
        if (plat.hasCollectible === 'terco') {
          ctx.beginPath();
          ctx.arc(itemX, itemY - 3, 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(itemX, itemY + 2);
          ctx.lineTo(itemX, itemY + 8);
          ctx.moveTo(itemX - 3, itemY + 4);
          ctx.lineTo(itemX + 3, itemY + 4);
          ctx.stroke();
        } else if (plat.hasCollectible === 'frase') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(itemX - 5, itemY - 6, 10, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(itemX - 3, itemY - 4, 6, 8);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(itemX - 1, itemY - 3, 2, 6);
          ctx.fillRect(itemX - 2, itemY - 2, 4, 2);
        } else if (plat.hasCollectible === 'agua_benta') {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(itemX, itemY - 7);
          ctx.quadraticCurveTo(itemX - 5, itemY + 1, itemX - 5, itemY + 3);
          ctx.arc(itemX, itemY + 3, 5, Math.PI, 0, true);
          ctx.quadraticCurveTo(itemX + 5, itemY + 1, itemX, itemY - 7);
          ctx.closePath();
          ctx.fill();
        } else if (plat.hasCollectible === 'hostia') {
          ctx.beginPath();
          ctx.arc(itemX, itemY, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.fillStyle = '#d97706';
          ctx.fillRect(itemX - 1, itemY - 4, 2, 8);
          ctx.fillRect(itemX - 3, itemY - 2, 6, 2);
        } else if (plat.hasCollectible === 'cruz') {
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(itemX, itemY - 7);
          ctx.lineTo(itemX + 6, itemY - 4);
          ctx.lineTo(itemX + 6, itemY + 2);
          ctx.quadraticCurveTo(itemX, itemY + 8, itemX - 6, itemY + 2);
          ctx.lineTo(itemX - 6, itemY - 4);
          ctx.closePath();
          ctx.fill();
          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(itemX - 1.5, itemY - 4, 3, 8);
          ctx.fillRect(itemX - 4, itemY - 1.5, 8, 3);
        }
      }
    });
    
    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      
      if (p.type === 'cross') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.moveTo(p.x - p.size * 0.7, p.y - p.size * 0.2);
        ctx.lineTo(p.x + p.size * 0.7, p.y - p.size * 0.2);
        ctx.stroke();
      } else if (p.type === 'star') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;
    });
    
    // Draw Player
    const player = playerRef.current;
    
    if (player.hasShield || player.holyWaterTime > 0) {
      ctx.strokeStyle = player.holyWaterTime > 0 ? 'rgba(96, 165, 250, 0.7)' : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = player.holyWaterTime > 0 ? '#60a5fa' : '#ef4444';
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, Math.max(player.width, player.height) / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    const charImg = charImagesRef.current[selectedCharId];
    if (charImg && charImg.complete && charImg.naturalWidth !== 0) {
      ctx.drawImage(charImg, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = '#dd681f';
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    ctx.restore();
    
    // HUD Layout
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, 42);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px font-sans, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`ALTURA: ${currentHeightRef.current}m`, 12, 18);
    ctx.fillText(`PONTOS: ${scoreRef.current}`, 12, 33);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`📿 x ${tercosInRunRef.current}`, canvas.width - 12, 18);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Nível: ${zone.name.toUpperCase()}`, canvas.width - 12, 33);
  };
  
  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return;
    setControlType('touch');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    playerRef.current.targetX = (touchX / rect.width) * canvas.width;
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    playerRef.current.targetX = (touchX / rect.width) * canvas.width;
  };
  
  // Mouse Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return;
    if (controlTypeRef.current !== 'mouse') setControlType('mouse');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    playerRef.current.targetX = (mouseX / rect.width) * canvas.width;
  };
  
  return (
    <div className="flex-1 flex flex-col justify-start relative h-full text-white overflow-hidden font-sans">
      
      {/* PLAYING GAMEPLAY SCREEN */}
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
        
        {/* Active Power-up indicators overlays */}
        {gameState === 'playing' && activePowerUps.length > 0 && (
          <div className="absolute top-12 left-3 space-y-1.5 pointer-events-none z-30 select-none">
            {activePowerUps.map((p, idx) => (
              <div key={idx} className="bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[8.5px] font-mono text-white flex items-center gap-1">
                <span>{p.icon}</span>
                <span>{p.name}</span>
                {p.timeLeft < 900 && (
                  <span className="text-yellow-400 font-bold ml-1">{p.timeLeft.toFixed(1)}s</span>
                )}
              </div>
            ))}
          </div>
        )}
        
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
              Controle: {controlType === 'mouse' && 'MOUSE'} {controlType === 'keyboard' && 'TECLADO (← →)'} {controlType === 'touch' && 'TOQUE'} {controlType === 'tilt' && 'INCLINAÇÃO'}
            </span>
          </div>
        )}
        
        {/* Dynamic Zone level notifications overlay */}
        <AnimatePresence>
          {gameState === 'playing' && (
            <div className="absolute top-16 left-0 right-0 text-center pointer-events-none z-30 select-none">
              <LevelChangeNotification height={currentHeightRef.current} />
            </div>
          )}
        </AnimatePresence>
        
        {/* MENU OVERLAY */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b3b73]/95 to-[#122340]/95 z-40 flex flex-col justify-between p-5 text-center overflow-y-auto no-scrollbar">
            
            {/* Title */}
            <div className="pt-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-8 rounded-full border-2 border-yellow-300/40 blur-[1px] rotate-[-5deg] animate-pulse"></div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                Rumo ao Céu!
              </h1>
              <span className="text-[10px] text-[#dd681f] font-mono tracking-[0.35em] uppercase font-black block mt-1">
                A Jornada Espiritual
              </span>
            </div>
            
            {/* Character select Carousel */}
            <div className="my-auto py-2 space-y-3">
              <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase font-black block">
                Escolha seu Santo Intercessor:
              </span>
              
              <div className="flex items-center justify-center gap-4">
                <div className="bg-[#254b8c]/50 border-2 border-[#2e5aa8] p-4 w-52 rounded-2xl relative shadow-lg flex flex-col items-center">
                  <div className="h-28 flex items-center justify-center mb-2">
                    <motion.img
                      key={activeChar.id}
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1.0, rotate: 0 }}
                      src={activeChar.avatar}
                      alt={activeChar.name}
                      className="w-20 h-24 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider leading-none">
                    {activeChar.name}
                  </h3>
                  <p className="text-[8.5px] text-gray-400 mt-2 h-8 leading-snug font-sans uppercase font-medium">
                    {activeChar.description}
                  </p>
                  
                  {/* Status buffs */}
                  <div className="flex gap-2.5 mt-2.5 pt-2.5 border-t border-[#2e5aa8]/40 w-full justify-center text-[8px] font-mono uppercase text-gray-300">
                    <span>🏃 {Math.round(activeChar.speedBoost * 100)}% Vel</span>
                    <span>🦘 {Math.round(activeChar.jumpBoost * 100)}% Pulo</span>
                  </div>
                </div>
              </div>
              
              {/* Character selection pills */}
              <div className="flex justify-center flex-wrap gap-1.5 max-w-[280px] mx-auto">
                {characters.map(char => {
                  const isSelected = char.id === selectedCharId;
                  return (
                    <button
                      key={char.id}
                      onClick={() => selectCharacter(char.id)}
                      className={`px-2.5 py-1 text-[8px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#dd681f] border-[#dd681f] text-white font-black'
                          : char.unlocked
                          ? 'bg-[#1b3b73] border-[#2e5aa8] text-gray-300 hover:border-[#dd681f]'
                          : 'bg-black/40 border-dashed border-gray-600 text-gray-500 hover:border-[#dd681f]/60'
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
            <div className="space-y-3 pb-4">
              <div className="flex justify-center items-center gap-1.5 text-xs text-yellow-400 font-mono tracking-widest uppercase font-bold">
                <span>SUA CARTEIRA:</span>
                <span className="text-sm font-black">📿 {tercosWallet}</span>
              </div>
              
              {activeChar.unlocked ? (
                <button
                  onClick={startGame}
                  className="w-full bg-[#dd681f] hover:bg-white hover:text-[#1b3b73] text-white font-black py-3.5 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(221,104,31,0.5)] border border-[#dd681f]/40 cursor-pointer"
                >
                  COMEÇAR JOGO
                </button>
              ) : (
                <button
                  onClick={() => unlockCharacter(activeChar)}
                  disabled={tercosWallet < activeChar.cost}
                  className="w-full bg-yellow-400 hover:bg-white text-black font-black py-3.5 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                >
                  <span>DESBLOQUEAR</span>
                  <span>📿 {activeChar.cost}</span>
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGameState('shop')}
                  className="bg-[#254b8c] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white font-bold py-2 px-3 text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Icons.ShoppingBag className="w-3.5 h-3.5" />
                  SANTUÁRIO (LOJA)
                </button>
                
                <button
                  onClick={onBack}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-2 px-3 text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Icons.ArrowLeft className="w-3.5 h-3.5" />
                  VOLTAR AO SITE
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* SHOP MODAL / VIEW (Lojinha de novos santos) */}
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
                      <span className="text-[11px] font-black text-white uppercase block leading-none">
                        {char.name}
                      </span>
                      <span className="text-[8px] text-gray-400 mt-1 block leading-normal font-sans uppercase font-medium">
                        {char.description}
                      </span>
                      <div className="flex gap-2 mt-1.5 text-[7px] font-mono text-gray-300 uppercase">
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
                          className={`px-3 py-1.5 text-[8px] font-mono uppercase font-black tracking-wider transition-all border ${
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
                          className="px-2.5 py-1.5 bg-[#facc15] hover:bg-white text-black font-black text-[8px] font-mono uppercase tracking-wider flex flex-col items-center gap-0.5 border border-[#facc15] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
        
        {/* GAMEOVER SCREEN OVERLAY - Global ranking is back! */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 to-[#122340]/95 z-40 flex flex-col justify-between p-5 text-center overflow-y-auto no-scrollbar">
            <div className="space-y-4 pt-4">
              <span className="text-red-500 text-[10px] font-mono tracking-[0.35em] uppercase font-black block">
                FIM DE JOGO 🪽
              </span>
              <h2 className="text-2xl font-black uppercase text-white tracking-tighter leading-none">
                SEU CORPO CANSOU!
              </h2>
              <p className="text-[9px] text-gray-400 font-sans uppercase font-medium">
                Mas sua alma subiu rumo ao alto! Veja suas estatísticas de fé:
              </p>
              
              {/* Stats Card */}
              <div className="bg-[#254b8c]/40 border border-[#2e5aa8]/40 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center shadow-lg">
                <div>
                  <span className="text-[7.5px] text-[#dd681f] font-black uppercase tracking-wider block">SCORE TOTAL</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">{score}</span>
                </div>
                <div className="border-x border-[#2e5aa8]/30">
                  <span className="text-[7.5px] text-[#dd681f] font-black uppercase tracking-wider block">ALTURA MAX</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">{maxHeight}m</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-[#dd681f] font-black uppercase tracking-wider block">TERÇOS</span>
                  <span className="text-lg font-black text-yellow-400 font-mono mt-1 block">📿 {tercosCollected}</span>
                </div>
              </div>

              {/* DB Global High Score input */}
              {newHighScore ? (
                <div className="bg-[#dd681f]/10 border-2 border-dashed border-[#dd681f]/40 p-3 rounded-2xl space-y-2">
                  <span className="text-[#facc15] font-black text-[8.5px] tracking-widest font-mono uppercase block animate-pulse">
                    ⭐ NOVO RECORDE GLOBAL DA SEMANA! ⭐
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Seu nome / Shalom"
                      className="flex-1 bg-[#1b3b73]/60 border-2 border-[#2e5aa8]/60 py-2 px-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#dd681f] font-mono uppercase font-bold"
                    />
                    <button
                      onClick={submitScore}
                      disabled={!playerName.trim()}
                      className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-3 font-black text-[10px] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Gravar
                    </button>
                  </div>
                </div>
              ) : (
                /* Dynamic scoreboard leaderboard from Database */
                <div className="bg-black/40 border border-[#2e5aa8]/20 p-3 rounded-2xl space-y-2 text-left">
                  <span className="text-[8.5px] text-[#dd681f] font-black tracking-widest font-mono uppercase block text-center mb-1">
                    🏆 RANKING GLOBAL DOS SANTOS 🏆
                  </span>
                  
                  <div className="space-y-1 max-h-[160px] overflow-y-auto no-scrollbar">
                    {leaderboard.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between items-center text-[9.5px] font-mono px-2 py-1 ${
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
                    {leaderboard.length === 0 && (
                      <span className="text-[8.5px] text-gray-500 italic block text-center py-2">
                        Carregando ranking global...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="space-y-2.5 pb-2">
              <button
                onClick={startGame}
                className="w-full bg-[#dd681f] hover:bg-white hover:text-[#122340] text-white font-black py-3 px-4 rounded-xl tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-md"
              >
                <Icons.RotateCcw className="w-4 h-4" />
                TENTAR NOVAMENTE
              </button>
              
              <button
                onClick={() => {
                  gameStateRef.current = 'menu';
                  setGameState('menu');
                }}
                className="w-full bg-[#1b3b73] hover:bg-[#2e5aa8] border border-[#2e5aa8] text-white font-black py-2 px-4 rounded-xl text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Icons.Play className="w-4 h-4" />
                IR PARA O MENU
              </button>
            </div>
          </div>
        )}
        
        {/* Floating Saint Quote Toast Notification (Doesn't pause gameplay) */}
        <AnimatePresence>
          {activeQuote && (
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 15 }}
              className="absolute bottom-4 left-3 right-3 bg-slate-955/90 border border-yellow-500/40 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 z-50 backdrop-blur-md"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500/20 to-yellow-300/20 border border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 text-lg shrink-0 select-none shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                👼
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[8px] text-yellow-400 font-mono tracking-widest uppercase font-black block leading-none mb-1">
                  Frase de {activeQuote.saint}
                </span>
                <p className="text-white text-[10px] font-serif font-bold italic leading-snug uppercase">
                  "{activeQuote.quote}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Level change text notification
function LevelChangeNotification({ height }: { height: number }) {
  const [lastLevel, setLastLevel] = useState('Terra');
  const [show, setShow] = useState(false);
  
  const currentLevelName = height < 3500 ? 'Terra'
                         : height < 7500 ? 'Infância'
                         : height < 12000 ? 'Juventude'
                         : height < 17000 ? 'Vocação'
                         : height < 23000 ? 'Santidade'
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
      CHEGANDO NA {currentLevelName.toUpperCase()}! 😇
    </motion.div>
  );
}
