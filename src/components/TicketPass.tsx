import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Download, Copy, Check, Ticket, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { RegistrationData } from '../types';
import { EVENT_INFO } from '../data';
import { LogoShalom, LogoPJJ, PATRONS } from './BrandingAssets';

interface TicketPassProps {
  registration: RegistrationData;
  onReset: () => void;
}

export default function TicketPass({ registration, onReset }: TicketPassProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const chosenPatron = PATRONS.find((p) => p.id === registration.patronId) || PATRONS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(registration.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Ingresso salvo na sua galeria! Apresente este QR Code no credenciamento do acampamento.');
    }, 1500);
  };

  // Generate a realistic QR Code visual using SVG
  const generateMockQRCodePath = () => {
    // Return a random-looking but stable SVG grid path based on ticket code
    const seed = registration.ticketCode.charCodeAt(3) || 7;
    let paths = '';
    for (let x = 0; x < 21; x++) {
      for (let y = 0; y < 21; y++) {
        // Create finder patterns (corners)
        const isCorner =
          (x < 7 && y < 7) || // Top-left
          (x > 13 && y < 7) || // Top-right
          (x < 7 && y > 13); // Bottom-left
        
        if (isCorner) {
          // Inner/outer corner shapes handled separately in SVG markup
          continue;
        }

        // Generate pseudorandom points for the middle
        const hash = (x * 17 + y * seed) % 9;
        if (hash === 0 || hash === 3 || hash === 5 || hash === 7) {
          paths += `M${x + 2},${y + 2}h1v1h-1z `;
        }
      }
    }
    return paths;
  };

  return (
    <div className="px-5 py-4 text-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.6 } }}
        className="w-full max-w-sm bg-[#254b8c] rounded-none shadow-2xl border-2 border-[#2e5aa8] relative overflow-visible"
      >
        {/* Glow behind ticket */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#dd681f]/10 to-transparent blur-xl pointer-events-none"></div>

        {/* Header Pass */}
        <div className="p-5 text-center relative border-b-2 border-dashed border-[#2e5aa8]">
          <div className="absolute top-4 left-4 bg-[#dd681f]/10 text-[#dd681f] border-2 border-[#dd681f]/20 text-[9px] font-black px-2 py-0.5 rounded-none flex items-center gap-1 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dd681f] animate-pulse"></span>
            CONFIRMADO
          </div>
          <div className="text-[#dd681f] text-[10px] font-black tracking-[0.3em] uppercase mt-4">
            INGRESSO INDIVIDUAL
          </div>
          <h2 className="text-xl font-black tracking-tighter mt-1 flex items-center justify-center gap-1.5 uppercase">
            <Ticket className="w-5 h-5 text-[#dd681f]" />
            ACAMP'S WINTER
          </h2>
          <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wider uppercase">APRESENTE O QR CODE NA PORTARIA</p>
        </div>

        {/* Ticket Circle Cutouts matching screen dark background */}
        <div className="absolute top-[120px] -left-3 w-6 h-6 bg-[#254b8c] rounded-full z-10 border-r-2 border-[#2e5aa8]"></div>
        <div className="absolute top-[120px] -right-3 w-6 h-6 bg-[#254b8c] rounded-full z-10 border-l-2 border-[#2e5aa8]"></div>

        {/* Ticket Details */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <span className="text-[9px] text-[#F5F5F5] opacity-50 uppercase font-black tracking-widest block">Participante</span>
              <span className="text-xs font-black text-white block mt-0.5 truncate uppercase font-mono">{registration.fullName}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#F5F5F5] opacity-50 uppercase font-black tracking-widest block">Código Pass</span>
              <span className="text-xs font-mono font-black text-[#dd681f] block mt-0.5 uppercase">{registration.ticketCode}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 border-t-2 border-[#2e5aa8] pt-3">
            <div>
              <span className="text-[9px] text-[#F5F5F5] opacity-50 uppercase font-black tracking-widest block">Idade</span>
              <span className="text-xs font-black text-white block mt-0.5 font-mono">{registration.age} ANOS</span>
            </div>
            <div>
              <span className="text-[9px] text-[#F5F5F5] opacity-50 uppercase font-black tracking-widest block">RG do Jovem</span>
              <span className="text-xs font-black text-white block mt-0.5 font-mono">{registration.rg}</span>
            </div>
          </div>

          <div className="border-t-2 border-[#2e5aa8] pt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#dd681f] shrink-0" />
              <span className="font-bold">{EVENT_INFO.dates.toUpperCase()}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-300 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#dd681f] shrink-0 mt-0.5" />
              <span className="text-[10px] leading-tight text-gray-400 font-bold uppercase tracking-wider">
                {EVENT_INFO.address.toUpperCase()}
              </span>
            </div>
          </div>

          {/* QR Code Graphic Section */}
          <div className="flex flex-col items-center justify-center pt-3 pb-1 border-t-2 border-[#2e5aa8]">
            <div className="bg-white p-3 rounded-none relative flex items-center justify-center w-36 h-36 border-4 border-[#2e5aa8]">
              <svg viewBox="0 0 25 25" className="w-full h-full text-slate-900" shapeRendering="crispEdges">
                {/* 3 Corner Finder Patterns */}
                {/* Top-left */}
                <path d="M0,0h7v7h-7z M1,1h5v5h-5z M2,2h3v3h-3z" fill="currentColor" />
                {/* Top-right */}
                <path d="M18,0h7v7h-7z M19,1h5v5h-5z M20,2h3v3h-3z" fill="currentColor" />
                {/* Bottom-left */}
                <path d="M0,18h7v7h-7z M1,19h5v5h-5z M2,20h3v3h-3z" fill="currentColor" />
                
                {/* Randomly generated code dots */}
                <path d={generateMockQRCodePath()} fill="currentColor" />
              </svg>
              {/* Logo badge in center of QR */}
              <div className="absolute w-8 h-8 bg-[#254b8c] rounded-none border-2 border-[#dd681f] flex items-center justify-center shadow-lg">
                <span className="text-[9px] font-black tracking-tighter text-[#dd681f]">A'W</span>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-mono tracking-[0.2em] mt-2">
              #{registration.id.toUpperCase()}
            </span>
          </div>

          {/* Barcode Section at very bottom */}
          <div className="pt-2 border-t border-[#2e5aa8] flex flex-col items-center">
            <div className="h-7 flex gap-0.5 items-stretch w-44">
              {[1,3,1,2,4,1,2,1,3,2,1,1,4,2,1,3,1,2,1,1,3,2,4,1,2,1,1].map((width, idx) => (
                <div
                  key={idx}
                  className="bg-gray-600"
                  style={{ flexGrow: width }}
                ></div>
              ))}
            </div>
            <span className="text-[8px] font-mono text-gray-500 mt-1">
              * {registration.ticketCode} *
            </span>
          </div>

          {/* Official Logos from branding footer */}
          <div className="pt-3 border-t border-[#2e5aa8] flex items-center justify-center gap-6 text-gray-500 opacity-60">
            <LogoPJJ className="h-5" />
            <LogoShalom className="h-5" />
          </div>
        </div>

        {/* Absolute floating Patron Sticker from branding elements sticker sheet */}
        {chosenPatron && (
          <div className="absolute -bottom-4 -right-4 w-20 h-20 z-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] rotate-[10deg] transform hover:scale-110 hover:rotate-[14deg] transition-all duration-300">
            {chosenPatron.avatar}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-none border border-[#2e5aa8] uppercase whitespace-nowrap">
              {chosenPatron.nickname}
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm mt-5 space-y-2 px-1">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="bg-transparent border-2 border-[#2e5aa8] hover:border-[#dd681f] text-white font-black py-3 px-3 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-400" />
                COPIAR CÓDIGO
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white border-2 border-transparent hover:border-[#dd681f] font-black py-3 px-3 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'BAIXANDO...' : 'SALVAR PASSE'}
          </motion.button>
        </div>

        <button
          onClick={onReset}
          className="w-full text-center text-xs text-[#F5F5F5] opacity-60 hover:opacity-100 transition-opacity py-3 bg-transparent rounded-none border-2 border-[#2e5aa8] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          FAZER OUTRA SIMULAÇÃO
        </button>

        <div className="bg-[#254b8c] p-3 rounded-none border-2 border-[#2e5aa8] flex items-start gap-2 text-[10px] text-gray-400 mt-2">
          <ShieldCheck className="w-4 h-4 text-[#dd681f] shrink-0 mt-0.5" />
          <p className="leading-normal">
            Sua inscrição foi confirmada e salva localmente. Apresente o código <strong className="text-white font-mono">{registration.ticketCode}</strong> para confirmação imediata.
          </p>
        </div>
      </div>
    </div>
  );
}
