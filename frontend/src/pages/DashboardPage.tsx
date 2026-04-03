import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mic, Settings, Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar } from '../components/ui/avatar';
import { sessionsApi } from '../services';

interface SessionData {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  chief_complaint: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  patient: {
    id: string;
    full_name: string;
    age: number | null;
    sex: string | null;
  };
}

const navItems = [
  { icon: Users, label: 'Patients', active: true },
  { icon: Mic, label: 'Sessions', active: false },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (d.toDateString() === today) return `Today, ${time}`;
  if (d.toDateString() === yesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const mins = Math.round(seconds / 60);
  return `${mins}m`;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionsApi.list();
      setSessions(data.sessions || []);
    } catch (e) {
      setError('Failed to load sessions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalPatients = new Set(sessions.map((s) => s.patient?.id)).size;
  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const todayStr = new Date().toDateString();
  const completedToday = sessions.filter((s) => s.status === 'completed' && s.ended_at && new Date(s.ended_at).toDateString() === todayStr).length;
  const completedSessions = sessions.filter((s) => s.duration_seconds);
  const avgDuration = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completedSessions.length / 60)
    : 0;

  const stats = [
    { label: 'Total Patients', value: String(totalPatients), change: '', trend: 'neutral' as const, sub: 'All time patient records' },
    { label: 'Active Sessions', value: String(activeSessions), change: '', trend: activeSessions > 0 ? 'up' as const : 'neutral' as const, sub: 'Currently in progress' },
    { label: 'Completed Today', value: String(completedToday), change: '', trend: 'neutral' as const, sub: 'Sessions closed today' },
    { label: 'Avg. Duration', value: avgDuration > 0 ? `${avgDuration}m` : '—', change: '', trend: 'neutral' as const, sub: 'Per session overall' },
  ];

  const handleNewSession = async () => {
    // Check if active session exists
    try {
      const active = await sessionsApi.getActive();
      if (active && active.id) {
        if (window.confirm('You have an active session. Resume it?')) {
          navigate(`/session/${active.id}`);
          return;
        }
        return;
      }
    } catch {}
    navigate('/session/new');
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>

      {/* Sidebar */}
      <aside className="w-[200px] flex flex-col bg-[hsl(var(--muted))]/40 border-r border-[hsl(var(--border))]/50 shrink-0">
        <div className="h-12 flex items-center px-5 border-b border-[hsl(var(--border))]/50 shrink-0">
          <span className="text-[15px] font-semibold tracking-tight">
            <span className="text-[hsl(var(--foreground))]">Ask</span>
            <span className="text-[hsl(var(--primary))]">Cliro</span>
          </span>
        </div>
        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  item.active ? 'bg-white/60 text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/40 hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
        <div className="p-3 border-t border-[hsl(var(--border))]/50">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[hsl(var(--muted-foreground))] hover:bg-white/40 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-12 flex items-center justify-between px-6 glass-strong border-b border-white/30 shrink-0">
          <h1 className="text-[14px] font-semibold text-[hsl(var(--foreground))]">Patients</h1>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleNewSession}>
              <Plus className="h-3.5 w-3.5" />
              New Session
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l border-white/30">
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Dr. Okafor</span>
              <Avatar initials="DO" size="sm" className="bg-[hsl(var(--primary))] text-white" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-3 px-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{stat.label}</span>
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{stat.value}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sessions Table */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 px-5 py-3.5 border-b border-white/20">
              <CardTitle>Recent Sessions</CardTitle>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{sessions.length} total</span>
            </CardHeader>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-[12px] text-red-500">{error}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-[hsl(var(--primary))]" onClick={loadSessions}>
                  Retry
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-6 w-6 text-[hsl(var(--muted-foreground))]/30 mb-2" />
                <p className="text-[12px] text-[hsl(var(--muted-foreground))]">No sessions yet</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-0.5">Start a new session to see it here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Patient</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow
                      key={session.id}
                      onClick={() => navigate(`/session/${session.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={session.patient?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'} />
                          <div>
                            <span className="text-[12.5px] font-medium block leading-tight">{session.patient?.full_name}</span>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              {session.patient?.age || '—'}{session.patient?.sex || ''}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))]">{session.chief_complaint}</TableCell>
                      <TableCell>
                        {session.status === 'active' ? (
                          <Badge variant="success" className="font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--muted-foreground))]/40"></span>
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {formatDate(session.started_at)}
                      </TableCell>
                      <TableCell className="text-right text-[11px] text-[hsl(var(--muted-foreground))]">
                        {formatDuration(session.duration_seconds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
