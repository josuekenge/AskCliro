import React, { useRef, useEffect, useMemo } from 'react';
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

interface PatientInfo {
  full_name: string;
  age: number | null;
  sex: string | null;
  allergies: string[];
  conditions: string[];
  medications: any[];
  mrn: string | null;
}

interface SessionInfo {
  id: string;
  status: string;
  chief_complaint: string;
}

interface CliroChatProps {
  patient?: PatientInfo;
  session?: SessionInfo;
}

function buildWelcomeMessage(patient?: PatientInfo, session?: SessionInfo): string {
  if (!patient || !session) return "Session ready. I'll assist you in real time.";

  const parts: string[] = [];
  const demo = [patient.full_name, patient.age ? `${patient.age}` : null, patient.sex].filter(Boolean).join(', ');
  parts.push(`Session started for **${demo}**.`);

  if (session.chief_complaint) {
    parts.push(`Chief complaint: ${session.chief_complaint}.`);
  }

  const alerts: string[] = [];
  if (patient.allergies?.length > 0) {
    alerts.push(`Allergies: ${patient.allergies.join(', ')}`);
  }
  if (patient.conditions?.length > 0) {
    alerts.push(`Conditions: ${patient.conditions.join(', ')}`);
  }
  if (patient.medications?.length > 0) {
    const meds = patient.medications.map((m: any) => typeof m === 'string' ? m : m.name).filter(Boolean);
    if (meds.length > 0) alerts.push(`Medications: ${meds.join(', ')}`);
  }

  if (alerts.length > 0) {
    parts.push(`\n\nPatient context I have:\n${alerts.map(a => `• ${a}`).join('\n')}`);
  }

  parts.push("\n\nI'll be listening and updating your SOAP note and differentials as the conversation progresses. Ask me anything.");

  return parts.join(' ');
}

const CliroChat: React.FC<CliroChatProps> = ({ patient, session }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Generate welcome message from patient context
  const welcomeMessage = useMemo(() => buildWelcomeMessage(patient, session), [patient, session]);

  // Add welcome message on mount
  useEffect(() => {
    if (patient && session && messages.length === 0) {
      setMessages([{ from: 'cliro', type: 'text', text: welcomeMessage }]);
    }
  }, [patient, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string, mode: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'doctor', type: 'text', text }]);
    // TODO: POST to /sessions/:id/chat → get Cliro response (Feature 04)
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
                Start the session and I'll listen in real time.
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
                    <div className="text-[14px] leading-[1.7] text-[hsl(var(--foreground))]/85 whitespace-pre-line">
                      {msg.text.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                    </div>
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
