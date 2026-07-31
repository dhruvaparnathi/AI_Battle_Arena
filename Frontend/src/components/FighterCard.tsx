import React, { useState } from 'react';
import { Copy, Check, Crown, Bot, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ModelMetadata } from '../types';

interface FighterCardProps {
  id: 'solution_1' | 'solution_2';
  title: string;
  modelMeta: ModelMetadata;
  solutionText: string;
  score?: number;
  isWinner: boolean;
  isLoading: boolean;
}

export const FighterCard: React.FC<FighterCardProps> = ({
  id,
  title,
  modelMeta,
  solutionText,
  score,
  isWinner,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(solutionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = solutionText ? solutionText.trim().split(/\s+/).length : 0;
  const charCount = solutionText ? solutionText.length : 0;

  return (
    <div
      className={`relative flex flex-col border-4 border-black transition-all bg-white ${
        isWinner
          ? 'shadow-brutal-xl ring-4 ring-[#FFE600] ring-offset-4 ring-offset-[#FFFDF5]'
          : 'shadow-brutal-lg'
      }`}
    >
      {/* Winner Ribbon */}
      {isWinner && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20 bg-[#FFE600] text-black border-3 border-black font-black text-sm px-4 py-1 shadow-brutal-sm flex items-center gap-1.5 uppercase tracking-wider animate-bounce">
          <Crown className="w-5 h-5 fill-black stroke-black" />
          <span>MATCH WINNER</span>
        </div>
      )}

      {/* Card Header */}
      <div className={`p-4 border-b-4 border-black ${modelMeta.avatarBg} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black text-white border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-xl">
            {id === 'solution_1' ? '⚡' : '🚀'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase px-2 py-0.5 bg-black text-white">
                {title}
              </span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 border-2 border-black ${modelMeta.badgeColor}`}>
                {modelMeta.provider}
              </span>
            </div>
            <h3 className="text-xl font-black uppercase text-black tracking-tight mt-0.5">
              {modelMeta.name}
            </h3>
          </div>
        </div>

        {/* Score Badge */}
        {score !== undefined && (
          <div className="bg-black text-white border-3 border-black p-2.5 text-center min-w-[70px] shadow-brutal-sm">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E5FF]">SCORE</div>
            <div className="text-2xl font-black text-[#FFE600] leading-none">{score}/10</div>
          </div>
        )}
      </div>

      {/* Score Meter Bar */}
      {score !== undefined && (
        <div className="w-full bg-black h-3 border-b-2 border-black overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ${
              isWinner ? 'bg-[#7CFF00]' : 'bg-[#00E5FF]'
            }`}
            style={{ width: `${(score / 10) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4 min-h-[360px] bg-slate-50">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 border-4 border-black border-t-[#FF007A] rounded-full animate-spin"></div>
            <p className="font-mono text-sm font-bold animate-pulse text-black">
              Generating Fighter Solution...
            </p>
          </div>
        ) : solutionText ? (
          <div className="relative group flex-1 flex flex-col">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 z-20 bg-black hover:bg-slate-800 text-white p-2 border-2 border-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              title="Copy solution"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#7CFF00]" />
                  <span className="text-[#7CFF00]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>

            {/* Rendered Markdown Box */}
            <div className="bg-white border-3 border-black p-5 text-sm text-black overflow-y-auto max-h-[550px] leading-relaxed shadow-inner font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-black uppercase text-black border-b-3 border-black pb-1.5 my-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-black uppercase text-black border-b-2 border-black pb-1 my-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-black uppercase text-black my-2.5">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-black font-sans font-medium text-sm">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-black text-black bg-[#FFE600] px-1 border border-black/40">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1.5 mb-4 font-medium pl-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 mb-4 font-medium pl-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed font-sans">{children}</li>
                  ),
                  code: ({ className, children }) => {

                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-black text-[#FFE600] font-mono text-xs px-1.5 py-0.5 border border-black font-bold">
                        {children}
                      </code>
                    ) : (
                      <code className="font-mono text-xs text-[#FFE600]">{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-black text-[#FFE600] p-4 border-3 border-black shadow-brutal-sm overflow-x-auto font-mono text-xs my-4 leading-relaxed">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border-3 border-black shadow-brutal-sm">
                      <table className="w-full text-left border-collapse font-sans text-xs">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-[#FFE600] text-black border-b-3 border-black font-black uppercase text-xs">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y-2 divide-black bg-white">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-yellow-50 transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="p-2.5 border-r-2 border-black font-black uppercase tracking-wider">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="p-2.5 border-r-2 border-black font-medium">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-black bg-[#00E5FF]/20 p-3 italic my-3 font-mono text-xs font-semibold">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {solutionText}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-black/50 border-3 border-dashed border-black/30 bg-white">
            <Bot className="w-12 h-12 mb-2 stroke-1" />
            <p className="font-mono text-xs font-bold uppercase">Awaiting Prompt Execution</p>
          </div>
        )}

        {/* Footer Meta */}
        {solutionText && !isLoading && (
          <div className="flex items-center justify-between border-t-3 border-black pt-3 text-xs font-mono font-bold text-black/70">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-black" />
              {wordCount} words
            </span>
            <span>{charCount} chars</span>
          </div>
        )}
      </div>
    </div>
  );
};
