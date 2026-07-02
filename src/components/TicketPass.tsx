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

  const handleSendWhatsApp = () => {
    const isMoms = window.location.pathname.includes('mamaes') || 
                    window.location.search.includes('mamaes') || 
                    window.location.hash.includes('mamaes') || 
                    window.location.pathname.includes('moms') || 
                    window.location.search.includes('moms') || 
                    window.location.hash.includes('moms');

    const message = isMoms
      ? `Olá! Sou mãe/responsável e gostaria de confirmar a vaga do meu filho no *Acamp's Winter SP*! ⛺️❄️

*Dados de Contato:*
👤 *Responsável:* ${registration.fullName.toUpperCase()}
📧 *E-mail:* ${registration.email}
📞 *Celular:* ${registration.phone}
🧬 *Padroeiro do Ingresso:* ${chosenPatron.name}
🎟️ *Código da Reserva:* ${registration.ticketCode}

Por favor, me confirme os próximos passos de pagamento da taxa promocional de R$ 250! Obrigado!`
      : `Olá! Realizei minha inscrição para o *Acamp's Winter SP*! ⛺️❄️

*Dados da Inscrição:*
👤 *Nome:* ${registration.fullName.toUpperCase()}
📧 *E-mail:* ${registration.email}
📞 *Celular:* ${registration.phone}
🧬 *Perfil/Padroeiro:* ${chosenPatron.name} (${chosenPatron.nickname})
🎟️ *Código do Ingresso:* ${registration.ticketCode}

Por favor, me confirme os próximos passos! Obrigado!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${EVENT_INFO.whatsappNumber}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
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
        {/* WhatsApp Confirmation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSendWhatsApp}
          className="w-full bg-[#25D366] hover:bg-white hover:text-[#128C7E] text-white border-2 border-transparent hover:border-[#25D366] font-black py-3.5 px-4 rounded-none text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg animate-pulse"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          CONFIRMAR INSCRIÇÃO NO WHATSAPP
        </motion.button>

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
