import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import PatientSidebar from '../components/PatientSidebar';
import CliroChat from '../components/CliroChat';
import RightPanel from '../components/RightPanel';
import { sessionsApi } from '../services';

interface PatientData {
  id: string;
  full_name: string;
  age: number | null;
  sex: string | null;
  allergies: string[];
  conditions: string[];
  medications: any[];
  mrn: string | null;
}

interface SessionData {
  id: string;
  status: string;
  chief_complaint: string;
  soap_note: any;
  soap_status: any;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  patient: PatientData;
}

export const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || id === 'new') return;
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const data = await sessionsApi.get(id!);
      setSession(data);
    } catch (e) {
      setError('Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!session || session.status !== 'active') return;
    if (!window.confirm('End this session?')) return;
    try {
      await sessionsApi.end(session.id);
      navigate('/');
    } catch {}
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>
        <p className="text-[14px] text-[hsl(var(--muted-foreground))]">{error || 'Session not found'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>Back to dashboard</Button>
      </div>
    );
  }

  const patient = session.patient;
  const initials = patient?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>

      {/* Header */}
      <header className="h-11 flex items-center justify-between px-4 glass-strong border-b border-white/30 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-[14px] font-semibold tracking-tight">
            <span>Ask</span>
            <span className="text-[hsl(var(--primary))]">Cliro</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
          {session.status === 'active' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-medium text-[11px]">Session active</span>
            </>
          ) : (
            <span className="text-[11px] font-medium">Session completed</span>
          )}
          <span className="opacity-30 text-xs mx-1">&middot;</span>
          <span className="text-[11px]">Dr. Okafor</span>
          <span className="opacity-30 text-xs mx-1">&middot;</span>
          <span className="text-[11px]">Patient: {patient?.full_name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export SOAP</Button>
          {session.status === 'active' && (
            <Button variant="outline" size="sm" onClick={handleEndSession}>End session</Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        <PatientSidebar
          patientName={patient?.full_name}
          patientInitials={initials}
        />
        <CliroChat patient={patient} session={session} />
        <RightPanel />
      </main>
    </div>
  );
};

export default SessionPage;
