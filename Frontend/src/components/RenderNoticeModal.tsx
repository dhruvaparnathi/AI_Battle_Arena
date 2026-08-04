import React from 'react';
import { Server, Clock, Zap, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RenderNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderNoticeModal: React.FC<RenderNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="bg-[#FFFDF5] border-4 border-black max-w-lg w-full p-6 shadow-brutal-2xl relative font-['Space_Grotesk',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black hover:bg-zinc-800 text-white p-1.5 border-2 border-black shadow-brutal-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-3 border-black pb-4 mb-4">
          <div className="bg-[#FFE600] p-3 border-3 border-black shadow-brutal-sm text-black">
            <Server className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-black text-[#00E5FF]">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight leading-none mt-1">
              Render Backend Notice ⚡
            </h2>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="bg-[#FFE600]/30 border-3 border-black p-3.5 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-black shrink-0 mt-0.5 stroke-[2.5]" />
          <p className="text-xs font-bold text-black leading-relaxed font-mono uppercase">
            Initial requests may take ~40-60 seconds while Render free instance wakes up!
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-3 text-sm text-black font-medium mb-6 leading-relaxed">
          <div className="flex items-start gap-3 bg-white p-3 border-2 border-black shadow-brutal-xs">
            <Clock className="w-5 h-5 text-[#FF007A] shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="font-extrabold uppercase text-xs font-mono text-black">Free Tier Cold Start</h4>
              <p className="text-xs text-zinc-700 mt-0.5">
                Our Express AI Agent service is deployed on Render free tier, which goes into sleep mode when idle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 border-2 border-black shadow-brutal-xs">
            <Zap className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="font-extrabold uppercase text-xs font-mono text-black">First Battle Delay (~50s)</h4>
              <p className="text-xs text-zinc-700 mt-0.5">
                If you are sending the first request after a gap, please allow up to 1 minute for the backend instance to spin up.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 border-2 border-black shadow-brutal-xs">
            <CheckCircle2 className="w-5 h-5 text-[#7CFF00] shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="font-extrabold uppercase text-xs font-mono text-black">Instant Subsequent Responses</h4>
              <p className="text-xs text-zinc-700 mt-0.5">
                Once awake, the server stays active and subsequent model battle prompts will respond immediately!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#FFE600] hover:bg-[#ffd900] text-black font-black text-sm uppercase tracking-wider py-3 px-4 border-3 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>GOT IT, LET'S BATTLE! 🥊</span>
        </button>
      </div>
    </div>
  );
};
