import React from 'react';
import { motion } from 'motion/react';
import { Wifi, Battery, ShieldAlert as Signal } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  // Get current time or display 18:12
  const [time, setTime] = React.useState('18:12');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full min-h-screen md:min-h-0 md:max-w-[390px] md:h-[780px] bg-[#254b8c] md:rounded-[50px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] md:p-3 md:border-4 md:border-[#262626] flex flex-col overflow-hidden select-none">
      {/* Phone Ear Speaker and Camera Notch (Dynamic Island Style) - Hidden on real mobile */}
      <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 w-[110px] h-6 bg-black rounded-full z-50 items-center justify-between px-3 border border-[#111]">
        <div className="w-3 h-3 bg-[#111] rounded-full border border-[#222]"></div>
        <div className="w-12 h-1.5 bg-[#2e5aa8] rounded-full"></div>
        <div className="w-2.5 h-2.5 bg-[#05051a] rounded-full border border-[#111]"></div>
      </div>

      {/* Side Buttons Visuals - Hidden on real mobile */}
      <div className="hidden md:block absolute -left-1.5 top-28 w-1 h-14 bg-[#1f1f1f] rounded-r"></div>
      <div className="hidden md:block absolute -left-1.5 top-48 w-1 h-12 bg-[#1f1f1f] rounded-r"></div>
      <div className="hidden md:block absolute -left-1.5 top-64 w-1 h-12 bg-[#1f1f1f] rounded-r"></div>
      <div className="hidden md:block absolute -right-1.5 top-40 w-1 h-16 bg-[#1f1f1f] rounded-l"></div>

      {/* Screen Container */}
      <div className="w-full h-full flex-1 bg-[#254b8c] md:rounded-[42px] overflow-hidden relative flex flex-col md:border border-transparent md:border-[#2e5aa8]">
        
        {/* Status Bar - Hidden on real mobile to allow native bar */}
        <div className="hidden md:flex h-10 px-6 items-center justify-between text-xs text-white/90 font-medium z-40 bg-gradient-to-b from-[#254b8c] to-transparent shrink-0">
          <span>{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 rotate-180 text-white/95" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen Content */}
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar flex flex-col">
          {children}
        </div>

        {/* Bottom Home Bar - Hidden on real mobile */}
        <div className="hidden md:flex h-5 items-center justify-center bg-transparent shrink-0 z-40">
          <div className="w-32 h-1 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
