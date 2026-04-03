import React, { useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { CliroInput } from './ui/cliro-input';

/* ── SOAP Card embedded in chat ── */
interface SOAPData {
  subjective: { text: string; status: 'Done' | 'Updating' | 'Pending' };
  objective: { text: string; status: 'Done' | 'Updating' | 'Pending' };
  assessment: { text: string; status: 'Done' | 'Updating' | 'Pending' };
  plan: { text: string; status: 'Done' | 'Updating' | 'Pending' };
}

const SOAPCard: React.FC<{ data: SOAPData }> = ({ data }) => {
  const sections = [
    { key: 'S', label: 'SUBJECTIVE', ...data.subjective },
    { key: 'O', label: 'OBJECTIVE', ...data.objective },
    { key: 'A', label: 'ASSESSMENT', ...data.assessment },
    { key: 'P', label: 'PLAN', ...data.plan },
  ];

  const variantMap = { Done: 'success' as const, Updating: 'warning' as const, Pending: 'secondary' as const };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))]/60 overflow-hidden">
      <div className="px-4 py-2 border-b border-[hsl(var(--border))]/40 flex items-center justify-between bg-[hsl(var(--muted))]/30">
        <span className="text-[11px] font-semibold text-[hsl(var(--foreground))]">SOAP Note</span>
        <span className="text-[9px] text-[hsl(var(--primary))] font-medium">Auto-generated</span>
      </div>
      <div className="grid grid-cols-2">
        {sections.map((s, i) => (
          <div key={s.key} className={`px-4 py-3 ${i < 2 ? 'border-b border-[hsl(var(--border))]/30' : ''} ${i % 2 === 0 ? 'border-r border-[hsl(var(--border))]/30' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--foreground))]">{s.key} — {s.label}</span>
              <Badge variant={variantMap[s.status]} className="text-[8px] px-1.5 py-0">{s.status}</Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]">
              {s.text || <span className="italic opacity-50">Waiting for data...</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Message types ── */
export type ChatMessage =
  | { from: 'cliro'; type: 'text'; text: string }
  | { from: 'cliro'; type: 'soap'; data: SOAPData }
  | { from: 'doctor'; type: 'text'; text: string };

const CliroChat: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string, mode: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'doctor', type: 'text', text }]);
    // TODO: send to backend, receive Cliro response
  };

  return (
    <div className="flex-[65] flex flex-col min-w-0 bg-white">

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[hsl(var(--primary))]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-[hsl(var(--foreground))] mb-1">Cliro is ready</h3>
              <p className="text-[13px] text-[hsl(var(--muted-foreground))] max-w-sm">
                Start the session and I'll listen in real time. I'll update your SOAP note and surface differentials as the conversation progresses.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.from === 'doctor') {
              return (
                <div key={i} className="mb-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[9px] font-bold text-white shrink-0">DO</div>
                    <span className="text-[13px] font-semibold text-[hsl(var(--foreground))]">Dr. Okafor</span>
                  </div>
                  <div className="pl-8 text-[14px] leading-[1.7] text-[hsl(var(--foreground))]">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="mb-5">
                {(i === 0 || messages[i - 1].from !== 'cliro') && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[hsl(var(--primary))]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-semibold text-[hsl(var(--foreground))]">Cliro</span>
                  </div>
                )}
                <div className="pl-8">
                  {msg.type === 'text' && (
                    <p className="text-[14px] leading-[1.7] text-[hsl(var(--foreground))]/85">{msg.text}</p>
                  )}
                  {msg.type === 'soap' && (
                    <div className="my-2"><SOAPCard data={msg.data} /></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[hsl(var(--border))]/40 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <CliroInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default CliroChat;
