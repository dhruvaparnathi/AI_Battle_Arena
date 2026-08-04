import React from 'react';
import { Swords, History, Server } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  serverStatus: 'idle' | 'warming' | 'online' | 'error';
  onOpenHistory: () => void;
  onOpenServerInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  serverStatus,
  onOpenHistory,
  onOpenServerInfo,
}) => {
  return (
    <header className="border-b-4 border-black bg-[#FFE600] overflow-hidden sticky top-0 z-40">
      {/* Top Ticker Marquee */}
      <div className="bg-black text-[#FFE600] font-mono text-xs font-black py-1 overflow-hidden border-b-2 border-black flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
          <span>⚡ AI BATTLE ARENA v1.0</span>
          <span>•</span>
          <span>MISTRAL AI vs COHERE COMMAND</span>
          <span>•</span>
          <span>JUDGED AUTONOMOUSLY BY GOOGLE GEMINI</span>
          <span>•</span>
          <span>REAL-TIME LANGGRAPH AGENT WORKFLOW</span>
          <span>•</span>
          <span>⚡ AI BATTLE ARENA v1.0</span>
          <span>•</span>
          <span>MISTRAL AI vs COHERE COMMAND</span>
          <span>•</span>
          <span>JUDGED AUTONOMOUSLY BY GOOGLE GEMINI</span>
          <span>•</span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#FF007A] text-white p-3 border-4 border-black shadow-brutal transform -rotate-2 hover:rotate-0 transition-transform">
            <Swords className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase leading-none">
                AI BATTLE <span className="bg-black text-[#00E5FF] px-2 py-0.5 shadow-brutal-sm inline-block">ARENA</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-black/80 mt-1 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full border border-black ${
                serverStatus === 'online' ? 'bg-[#7CFF00] animate-ping' : serverStatus === 'warming' ? 'bg-[#FFE600] animate-bounce' : 'bg-[#FF007A]'
              }`}></span>
              {serverStatus === 'online' ? 'Live Multi-Model Showdown' : serverStatus === 'warming' ? 'Waking Up Backend Server...' : 'Backend Server Offline / Idle'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Server Status Indicator Badge */}
          <div
            onClick={onOpenServerInfo}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border-3 border-black shadow-brutal-sm font-mono text-xs font-extrabold uppercase cursor-pointer ${
              serverStatus === 'online'
                ? 'bg-[#7CFF00] text-black'
                : serverStatus === 'warming'
                ? 'bg-[#00E5FF] text-black animate-pulse'
                : 'bg-[#FF007A] text-white'
            }`}
            title="Click for Render server details"
          >
            <Server className="w-4 h-4 stroke-[2.5]" />
            <span>
              {serverStatus === 'online'
                ? 'SERVER ONLINE ⚡'
                : serverStatus === 'warming'
                ? 'WARMING BACKEND ⏳'
                : 'SERVER IDLE 💤'}
            </span>
          </div>

          <button
            onClick={onOpenServerInfo}
            id="server-info-btn"
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 border-3 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer font-mono"
            title="Render Server Status Info"
          >
            <Server className="w-4 h-4 text-[#FF007A] stroke-[2.5]" />
            <span>INFO</span>
          </button>

          <button
            onClick={onOpenHistory}
            id="history-btn"
            className="flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00cce6] text-black font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 border-3 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer font-mono"
          >
            <History className="w-4 h-4 stroke-[3]" />
            <span>BATTLES</span>
            <span className="bg-black text-white px-2 py-0.5 text-xs font-mono font-bold rounded-none border border-black">
              {historyCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
