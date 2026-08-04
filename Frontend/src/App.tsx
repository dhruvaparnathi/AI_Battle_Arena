import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FighterCard } from './components/FighterCard';
import { RefereeVerdict } from './components/RefereeVerdict';
import { HistoryDrawer } from './components/HistoryDrawer';
import type { GraphResponse, BattleRecord, ModelMetadata } from './types';
import { Send, Zap, AlertCircle, RefreshCw, Flame, Code2, BrainCircuit } from 'lucide-react';


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

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_battle_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load battle history', e);
    }
  }, []);

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
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setBattleData(result.data);
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

  const isMistralWinner = battleData?.judge?.winner === 'Solution-1';
  const isCohereWinner = battleData?.judge?.winner === 'Solution-2';

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <Header historyCount={history.length} onOpenHistory={() => setIsHistoryOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Battle Arena Hero Banner */}
        <section className="bg-white border-4 border-black p-6 shadow-brutal-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FF007A] text-white px-4 py-1 font-mono font-black text-xs uppercase border-b-3 border-l-3 border-black shadow-brutal-sm">
            LANGGRAPH WORKFLOW
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#FFE600] text-black px-3 py-1 border-2 border-black text-xs font-black uppercase mb-3 shadow-brutal-sm">
              <Flame className="w-4 h-4 fill-black" />
              LLM HEAVYWEIGHT BATTLE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none mb-3">
              MISTRAL vs COHERE
            </h2>
            <p className="text-sm sm:text-base font-mono font-medium text-black/80 leading-relaxed">
              Submit any challenge, question, or code task. Both models generate solutions in parallel via LangGraph. <span className="bg-[#00E5FF] px-1 font-bold">Google Gemini</span> acts as ring referee to score and crown the victor!
            </p>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleFight} className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter prompt for the battle arena... (e.g. Write a TypeScript solution for LRU Cache)"
                rows={3}
                className="w-full bg-[#FFFDF5] border-4 border-black p-4 font-mono text-base font-medium text-black focus:outline-none focus:ring-4 focus:ring-[#FFE600] shadow-brutal placeholder:text-black/40 resize-y"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-black/60 mr-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#FF007A]" /> QUICK PROMPTS:
              </span>
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserPrompt(prompt)}
                  className="text-xs font-mono font-bold bg-slate-100 hover:bg-[#FFE600] text-black px-3 py-1.5 border-2 border-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-left truncate max-w-[280px] cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
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
