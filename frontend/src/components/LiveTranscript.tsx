import React from 'react';
import { Mic } from 'lucide-react';

const messages = [
  { id: 0, role: 'Dr. Okafor', text: "Good morning, what brings you in today?", time: '0:00' },
  { id: 1, role: 'Patient', text: "I've had this chest pain for about 3 days now. It gets worse when I breathe in deeply.", time: '0:12' },
  { id: 2, role: 'Dr. Okafor', text: "Can you describe the pain — is it sharp, dull, pressure-like?", time: '0:45' },
  { id: 3, role: 'Patient', text: "Sharp. Mostly on the left side. I also had a fever two days ago around 38.5.", time: '1:22' },
  { id: 4, role: 'Dr. Okafor', text: "Any shortness of breath or cough?", time: '2:08' },
  { id: 5, role: 'Patient', text: "Yes, a dry cough started yesterday...", time: '2:35' },
  { id: 6, role: 'Dr. Okafor', text: "When did the cough start exactly? Is it productive or dry?", time: '3:01' },
  { id: 7, role: 'Patient', text: "It started yesterday afternoon. Completely dry, no phlegm.", time: '3:18' },
  { id: 8, role: 'Dr. Okafor', text: "Have you traveled recently or been immobile for extended periods?", time: '3:45' },
  { id: 9, role: 'Patient', text: "No, I've been working from home. Normal activity level.", time: '4:02' },
];

const LiveTranscript: React.FC = () => {
  return (
    <div className="w-[30%] shrink-0 flex flex-col glass-subtle">

      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3.5 border-b border-white/30 shrink-0 bg-white/20">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Transcript</h2>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-medium text-emerald-600">Live</span>
        </div>
      </div>

      {/* Messages — plain text log */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => {
          const isDoc = msg.role.startsWith('Dr.');
          return (
            <div key={msg.id} className="px-3.5 py-2 border-b border-white/15">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isDoc ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                  {msg.role}
                </span>
                <span className="text-[8px] text-[hsl(var(--muted-foreground))]/70 font-mono">{msg.time}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-[hsl(var(--foreground))]">{msg.text}</p>
            </div>
          );
        })}
      </div>

      {/* Footer — mic + waveform + timer */}
      <div className="h-12 flex items-center justify-between px-3.5 border-t border-white/30 shrink-0 bg-white/20">
        <div className="flex items-center gap-2.5">
          <button className="h-7 w-7 flex items-center justify-center bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors">
            <Mic className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-[2px] h-5">
            {[2,4,3,5,6,4,3,2,4,5,3,2,3,4,6,5,3,2].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h * 2.5}px` }}
                className="w-[2px] bg-[hsl(var(--primary))] opacity-50 rounded-full"
              ></div>
            ))}
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium text-[hsl(var(--muted-foreground))]">04:22</span>
      </div>
    </div>
  );
};

export default LiveTranscript;
