import React, { useState } from 'react';
import { Mic } from 'lucide-react';

/* ── Types ── */
export interface TranscriptEntry {
  id: string;
  role: string;
  text: string;
  time: string;
}

export interface DiagnosisEntry {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  symptoms: string;
  tests: string;
  pubmed?: string;
}

interface RightPanelProps {
  transcript?: TranscriptEntry[];
  diagnoses?: DiagnosisEntry[];
  sessionTime?: string;
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

/* ── Transcript Tab ── */
const TranscriptContent: React.FC<{ entries: TranscriptEntry[] }> = ({ entries }) => (
  <div className="flex-1 overflow-y-auto">
    {entries.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Mic className="h-5 w-5 text-[hsl(var(--muted-foreground))]/30 mb-2" />
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No transcript yet</p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-0.5">Start recording to capture the conversation</p>
      </div>
    ) : (
      entries.map((entry) => {
        const isDoc = entry.role.startsWith('Dr.');
        return (
          <div key={entry.id} className="px-3.5 py-2 border-b border-[hsl(var(--border))]/30">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDoc ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {entry.role}
              </span>
              <span className="text-[8px] text-[hsl(var(--muted-foreground))]/70 font-mono">{entry.time}</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-[hsl(var(--foreground))]">{entry.text}</p>
          </div>
        );
      })
    )}
  </div>
);

/* ── Diagnoses Tab ── */
const DiagnosesContent: React.FC<{ diagnoses: DiagnosisEntry[] }> = ({ diagnoses }) => {
  const sevColor = (s: string) =>
    s === 'High' ? 'text-red-500 bg-red-500/8' :
    s === 'Medium' ? 'text-amber-500 bg-amber-500/8' :
    'text-emerald-500 bg-emerald-500/8';

  return (
    <div className="flex-1 overflow-y-auto">
      {diagnoses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[hsl(var(--muted-foreground))]/30 mb-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
          </svg>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No diagnoses yet</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-0.5">Differentials will appear as symptoms are discussed</p>
        </div>
      ) : (
        <>
          <div className="px-3.5 py-2 flex items-center justify-between border-b border-[hsl(var(--border))]/30">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Differential Diagnoses</span>
            <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{diagnoses.length} suggested</span>
          </div>
          {diagnoses.map((dx) => (
            <div key={dx.id} className="px-3.5 py-3 border-b border-[hsl(var(--border))]/30">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-[13px] font-semibold text-[hsl(var(--foreground))] leading-tight pr-3">{dx.title}</h3>
                <span className={`text-[9px] font-bold uppercase tracking-wide shrink-0 px-1.5 py-0.5 rounded ${sevColor(dx.severity)}`}>
                  {dx.severity}
                </span>
              </div>
              <p className="text-[11.5px] text-[hsl(var(--muted-foreground))] leading-relaxed mb-2">{dx.symptoms}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[hsl(var(--primary))] font-medium cursor-pointer hover:underline">&rarr; {dx.tests}</span>
                {dx.pubmed && <span className="text-[hsl(var(--muted-foreground))]/70 text-[9px]">PubMed: {dx.pubmed}</span>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

/* ── Main Panel ── */
const RightPanel: React.FC<RightPanelProps> = ({
  transcript = [],
  diagnoses = [],
  sessionTime = '00:00',
  isRecording = false,
  onToggleRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'diagnoses'>('transcript');

  return (
    <div className="w-[35%] shrink-0 flex flex-col bg-[hsl(var(--muted))]/40 border-l border-[hsl(var(--border))]/50">

      {/* Tab bar */}
      <div className="h-9 flex shrink-0 border-b border-[hsl(var(--border))]/50">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 text-[11px] font-semibold transition-colors relative ${
            activeTab === 'transcript'
              ? 'text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Transcript
          {activeTab === 'transcript' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[hsl(var(--primary))]"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('diagnoses')}
          className={`flex-1 text-[11px] font-semibold transition-colors relative ${
            activeTab === 'diagnoses'
              ? 'text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Diagnoses
          {activeTab === 'diagnoses' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[hsl(var(--primary))]"></span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'transcript' ? (
        <TranscriptContent entries={transcript} />
      ) : (
        <DiagnosesContent diagnoses={diagnoses} />
      )}

      {/* Pinned footer */}
      <div className="h-12 flex items-center justify-between px-3.5 border-t border-[hsl(var(--border))]/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleRecording}
            className={`h-8 w-8 flex items-center justify-center rounded-full shadow-sm transition-colors ${
              isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-[2px] h-5">
            {isRecording ? (
              [2,4,3,5,6,4,3,2,4,5,3,2,3,4,6,5,3,2].map((h, i) => (
                <div key={i} style={{ height: `${h * 2.5}px` }} className="w-[2px] bg-[hsl(var(--primary))] opacity-50 rounded-full"></div>
              ))
            ) : (
              [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map((_, i) => (
                <div key={i} className="w-[2px] h-[2px] bg-[hsl(var(--muted-foreground))] opacity-20 rounded-full"></div>
              ))
            )}
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium text-[hsl(var(--muted-foreground))]">{sessionTime}</span>
      </div>
    </div>
  );
};

export default RightPanel;
