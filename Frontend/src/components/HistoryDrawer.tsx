import React from 'react';
import { X, Trash2, ExternalLink, Calendar, Swords, Trophy } from 'lucide-react';
import type { BattleRecord } from '../types';


interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: BattleRecord[];
  onSelectRecord: (record: BattleRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FFFDF5] border-l-4 border-black h-full flex flex-col shadow-brutal-xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#FFE600] border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 stroke-[2.5]" />
            <h3 className="text-xl font-black uppercase text-black">BATTLE HISTORY</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black text-white hover:bg-slate-800 border-2 border-black active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-black/60">
              <Trophy className="w-12 h-12 mb-3 stroke-1" />
              <p className="font-mono text-sm font-bold uppercase">No Saved Battles Yet</p>
              <p className="text-xs font-mono mt-1 text-black/50">
                Run your first prompt in the arena to record a battle!
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRecord(item);
                  onClose();
                }}
                className="bg-white border-3 border-black p-4 shadow-brutal hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-black/60 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-black" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {(() => {
                    const isTie =
                      item.data.judge.winner === 'Tie' ||
                      item.data.judge.winner === "IT'S A TIE" ||
                      item.data.judge.winner === 'DRAW';
                    const winnerLabel = isTie
                      ? 'Tie 🤝'
                      : item.data.judge.winner === 'Solution-1'
                      ? 'Mistral'
                      : item.data.judge.winner === 'Solution-2'
                      ? 'Command-A'
                      : item.data.judge.winner;
                    return (
                      <span className="bg-[#00E5FF] text-black px-1.5 py-0.5 border border-black font-black uppercase text-[10px]">
                        Result: {winnerLabel}
                      </span>
                    );
                  })()}
                </div>

                <p className="font-black text-sm text-black line-clamp-2 uppercase group-hover:text-[#FF007A] transition-colors">
                  "{item.userPrompt}"
                </p>

                <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t-2 border-black/10">
                  <span className="text-black/70">
                    S1: {item.data.judge.solution_1_score ?? '-'} | S2: {item.data.judge.solution_2_score ?? '-'}
                  </span>
                  <span className="font-bold text-black flex items-center gap-1 group-hover:underline">
                    VIEW BATTLE <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t-4 border-black bg-white">
            <button
              onClick={onClearHistory}
              className="w-full bg-[#FF007A] hover:bg-pink-600 text-white font-black text-xs py-2.5 border-3 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>CLEAR ALL HISTORY</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
