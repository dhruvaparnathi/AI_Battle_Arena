import React, { useEffect } from 'react';
import { Gavel, Sparkles, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { JudgeResult } from '../types';


interface RefereeVerdictProps {
  judge: JudgeResult;
  model1Name: string;
  model2Name: string;
}

export const RefereeVerdict: React.FC<RefereeVerdictProps> = ({
  judge,
  model1Name,
  model2Name,
}) => {
  useEffect(() => {
    // Trigger confetti celebration when referee verdict renders
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFE600', '#FF007A', '#00E5FF', '#7CFF00'],
      });
    } catch (e) {
      // ignore if confetti fails
    }
  }, [judge]);

  const winnerTitle =
    judge.winner === 'Solution-1'
      ? model1Name
      : judge.winner === 'Solution-2'
      ? model2Name
      : judge.winner;

  return (
    <div className="bg-[#FFE600] border-4 border-black p-6 shadow-brutal-xl my-8 relative overflow-hidden">
      {/* Decorative Corner Badge */}
      <div className="absolute -top-3 -right-3 bg-black text-[#FFE600] border-3 border-black px-4 py-1 font-mono font-black text-xs uppercase shadow-brutal-sm transform rotate-3">
        OFFICIAL VERDICT
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b-4 border-black pb-6 mb-6">
        {/* Left: Judge Title & Winner */}
        <div className="flex items-start gap-4">
          <div className="bg-black text-[#00E5FF] p-4 border-3 border-black shadow-brutal flex-shrink-0">
            <Gavel className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-2 py-0.5 font-mono text-xs font-black uppercase">
                REFEREE & JUDGE
              </span>
              <span className="bg-[#FF007A] text-white px-2 py-0.5 font-mono text-xs font-black uppercase border border-black">
                Google Gemini
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight mt-1 flex items-center gap-2">
              WINNER: <span className="underline decoration-[#FF007A] decoration-4">{winnerTitle}</span>
            </h2>
          </div>
        </div>

        {/* Right: Score Comparison Box */}
        <div className="bg-white border-3 border-black p-4 shadow-brutal self-stretch md:self-auto min-w-[260px]">
          <div className="text-xs font-mono font-black uppercase text-black/70 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4 text-black" />
              FINAL SCORECARD
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* Fighter 1 Score */}
            <div
              className={`p-2 border-2 border-black ${
                judge.winner === 'Solution-1' ? 'bg-[#7CFF00]' : 'bg-slate-100'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase truncate">{model1Name}</div>
              <div className="text-2xl font-black leading-none mt-1">
                {judge.solution_1_score !== undefined ? judge.solution_1_score : '-'}
                <span className="text-xs font-normal">/10</span>
              </div>
            </div>

            {/* Fighter 2 Score */}
            <div
              className={`p-2 border-2 border-black ${
                judge.winner === 'Solution-2' ? 'bg-[#7CFF00]' : 'bg-slate-100'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase truncate">{model2Name}</div>
              <div className="text-2xl font-black leading-none mt-1">
                {judge.solution_2_score !== undefined ? judge.solution_2_score : '-'}
                <span className="text-xs font-normal">/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Section */}
      <div className="bg-white border-3 border-black p-5 shadow-brutal">
        <h4 className="font-black text-sm uppercase tracking-wider text-black mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF007A]" />
          JUDGE'S REASONING & EVALUATION
        </h4>
        <p className="font-mono text-sm leading-relaxed text-black/90 whitespace-pre-wrap">
          {judge.reasoning}
        </p>
      </div>
    </div>
  );
};
