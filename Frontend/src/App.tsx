import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FighterCard } from './components/FighterCard';
import { RefereeVerdict } from './components/RefereeVerdict';
import { HistoryDrawer } from './components/HistoryDrawer';
import { RenderNoticeModal } from './components/RenderNoticeModal';
import type { GraphResponse, BattleRecord, ModelMetadata } from './types';
import { Send, Zap, AlertCircle, RefreshCw, Flame, Code2, BrainCircuit, Server } from 'lucide-react';

const MISTRAL_META: ModelMetadata = {
  name: 'Mistral Medium',
  provider: 'Mistral AI',
  badgeColor: 'bg-[#FF007A] text-white',
  avatarBg: 'bg-[#FFE600]',
  textColor: 'text-[#FF007A]',
  description: 'Fast, efficient European open-weights powerhouse.',
};

const COHERE_META: ModelMetadata = {
  name: 'Command-A',
  provider: 'Cohere',
  badgeColor: 'bg-[#00E5FF] text-black',
  avatarBg: 'bg-[#7CFF00]',
  textColor: 'text-[#00E5FF]',
  description: 'Enterprise reasoning and detailed instruction following.',
};

const SAMPLE_PROMPTS = [
  "Write a high-performance LRU Cache in TypeScript with O(1) ops",
  "Explain Quantum Entanglement simply with an everyday analogy",
  "Design a scalable microservices architecture for real-time payments",
  "Compare PostgreSQL vs MongoDB for a high-traffic AI app",
];

export function App() {
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [battleData, setBattleData] = useState<GraphResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRenderNoticeOpen, setIsRenderNoticeOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'idle' | 'warming' | 'online' | 'error'>('warming');

  // Load history, check notice, & warm up Render backend in background on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_battle_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }

      const noticeSeen = localStorage.getItem('ai_battle_render_notice_seen');
      if (!noticeSeen) {
        setIsRenderNoticeOpen(true);
      }
    } catch (e) {
      console.error('Failed to initialize app state from localStorage', e);
    }

    // Immediately ping backend to trigger Render spin-up in background
    const warmupBackend = async () => {
      try {
        setServerStatus('warming');
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/ai/health`, { method: 'GET' });
        if (res.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        console.warn('Background server warmup ping initiated (Render instance waking up)...', err);
        setServerStatus('error');
      }
    };

    warmupBackend();
  }, []);

  const handleCloseRenderNotice = () => {
    setIsRenderNoticeOpen(false);
    try {
      localStorage.setItem('ai_battle_render_notice_seen', 'true');
    } catch (e) {
      console.error('Failed to set notice state in localStorage', e);
    }
  };

  const saveBattleRecord = (prompt: string, data: GraphResponse) => {
    const record: BattleRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userPrompt: prompt,
      data,
    };
    const updated = [record, ...history.slice(0, 19)];
    setHistory(updated);
    try {
      localStorage.setItem('ai_battle_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_battle_history');
  };

  const handleFight = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setBattleData(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/ai/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 504) {
          throw new Error('504 Gateway Timeout: Response took over 30s. Prompt max output tokens have been tuned for faster generation.');
        }
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setBattleData(result.data);
        setServerStatus('online');
        saveBattleRecord(userPrompt, result.data);
      } else {
        throw new Error(result.message || 'Failed to generate battle response');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || 'Error connecting to backend server. Make sure the backend service is running on Render.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isTie =
    battleData?.judge?.winner === 'Tie' ||
    battleData?.judge?.winner === "IT'S A TIE" ||
    battleData?.judge?.winner === 'DRAW' ||
    (battleData?.judge?.solution_1_score !== undefined &&
      battleData?.judge?.solution_2_score !== undefined &&
      battleData?.judge?.solution_1_score === battleData?.judge?.solution_2_score);

  const isMistralWinner = !isTie && battleData?.judge?.winner === 'Solution-1';
  const isCohereWinner = !isTie && battleData?.judge?.winner === 'Solution-2';

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <Header
        historyCount={history.length}
        serverStatus={serverStatus}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenServerInfo={() => setIsRenderNoticeOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Battle Arena Hero Banner */}
        <section className="bg-[#00E5FF] border-4 border-black p-6 sm:p-8 shadow-brutal relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-black font-black text-9xl font-mono select-none">
            VS
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-white font-mono text-xs font-bold px-3 py-1 mb-3 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
                Autonomous Model Arena
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-black tracking-tight leading-tight">
                Prompt The Contenders. <br />
                <span className="bg-black text-[#FFE600] px-2 py-0.5 inline-block shadow-brutal-sm">
                  Crown The Champion.
                </span>
              </h2>
            </div>

            <div className="bg-white border-3 border-black p-4 shadow-brutal-sm max-w-xs text-xs font-mono font-bold leading-relaxed text-black">
              ⚡ Multi-agent pipeline via LangGraph orchestrates response generation & autonomous evaluation in parallel.
            </div>
          </div>
        </section>

        {/* Input Form Section */}
        <section className="bg-white border-4 border-black p-6 shadow-brutal">
          <form onSubmit={handleFight} className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="user-prompt-input" className="block text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF007A] fill-[#FF007A]" />
                Enter Challenge / Problem Prompt:
              </label>
              <span className="text-xs font-mono font-bold text-black/60">
                Markdown & Code supported
              </span>
            </div>

            <div className="relative">
              <textarea
                id="user-prompt-input"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Write an optimized Dijkstra shortest path algorithm in Python with detailed complexity analysis..."
                rows={3}
                className="w-full bg-[#FFFDF5] border-3 border-black p-4 text-black font-mono text-sm placeholder:text-black/40 focus:outline-none focus:ring-4 focus:ring-[#FFE600] shadow-inner font-medium resize-none"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono font-bold uppercase text-black/70 mr-1">Quick Prompts:</span>
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserPrompt(prompt)}
                  className="text-xs font-mono bg-[#FFFDF5] hover:bg-[#FFE600] text-black font-bold px-2.5 py-1 border-2 border-black shadow-brutal-xs transition-colors cursor-pointer text-left truncate max-w-[280px]"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Render Free Tier Info Notice Line */}
            <div className="bg-[#FFE600]/30 border-2 border-black p-2.5 flex items-center justify-between text-xs font-mono font-bold text-black">
              <span className="flex items-center gap-2 truncate">
                <Server className="w-4 h-4 text-[#FF007A] shrink-0" />
                <span className="truncate">Note: Initial prompt may take ~50s while Render free backend instance spins up.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsRenderNoticeOpen(true)}
                className="underline font-black text-black hover:text-[#FF007A] ml-2 shrink-0 cursor-pointer"
              >
                INFO
              </button>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-black/60 font-bold">
                <span className="flex items-center gap-1">
                  <BrainCircuit className="w-4 h-4 text-[#FF007A]" /> 2 AI Models
                </span>
                <span>+</span>
                <span className="flex items-center gap-1">
                  <Code2 className="w-4 h-4 text-[#00E5FF]" /> 1 AI Referee
                </span>
              </div>

              <button
                type="submit"
                disabled={!userPrompt.trim() || isLoading}
                className={`ml-auto flex items-center justify-center gap-2 font-black text-base uppercase px-8 py-3.5 border-4 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                  !userPrompt.trim() || isLoading
                    ? 'bg-slate-200 text-black/40 border-black/40 cursor-not-allowed shadow-none'
                    : 'bg-[#FF007A] hover:bg-pink-600 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>FIGHTING IN ARENA...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>BATTLE NOW! ⚔️</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-[#FF007A] text-white border-4 border-black p-4 shadow-brutal flex items-start gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 stroke-[2.5]" />
            <div>
              <h4 className="font-black uppercase text-base">Backend Connection Error</h4>
              <p className="font-mono text-xs mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Referee Verdict Display */}
        {battleData?.judge && (
          <RefereeVerdict
            judge={battleData.judge}
            model1Name={MISTRAL_META.name}
            model2Name={COHERE_META.name}
          />
        )}

        {/* Fighter Cards Arena Display */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FighterCard
            id="solution_1"
            title="FIGHTER 1"
            modelMeta={MISTRAL_META}
            solutionText={battleData?.solution_1 || ''}
            score={battleData?.judge?.solution_1_score}
            isWinner={isMistralWinner}
            isLoading={isLoading}
          />

          <FighterCard
            id="solution_2"
            title="FIGHTER 2"
            modelMeta={COHERE_META}
            solutionText={battleData?.solution_2 || ''}
            score={battleData?.judge?.solution_2_score}
            isWinner={isCohereWinner}
            isLoading={isLoading}
          />
        </section>

      </main>

      {/* History Drawer Component */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRecord={(rec) => {
          setUserPrompt(rec.userPrompt);
          setBattleData(rec.data);
        }}
        onClearHistory={handleClearHistory}
      />

      {/* Render Server Info Notice Modal */}
      <RenderNoticeModal
        isOpen={isRenderNoticeOpen}
        onClose={handleCloseRenderNotice}
      />

      {/* Brutalist Footer */}
      <footer className="border-t-4 border-black bg-black text-white mt-16 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFE600] text-black px-2 py-0.5 font-black">AI BATTLE ARENA</span>
            <span>Powered by LangGraph & Multi-LLM Orchestration</span>
          </div>
          <p className="text-white/60">Mistral AI • Cohere Command • Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
