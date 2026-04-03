import React from 'react';
import { Plus, Search, MessageSquare, MoreHorizontal } from 'lucide-react';

interface ChatHistoryItem {
  id: string;
  title: string;
  time: string;
  active?: boolean;
}

interface ChatHistorySection {
  section: string;
  chats: ChatHistoryItem[];
}

interface PatientSidebarProps {
  patientName?: string;
  patientInitials?: string;
  chatHistory?: ChatHistorySection[];
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({
  patientName = '',
  patientInitials = '',
  chatHistory = [],
  onNewChat,
  onSelectChat,
}) => {
  return (
    <div className="w-[220px] shrink-0 flex flex-col bg-[hsl(var(--muted))]/40 border-r border-[hsl(var(--border))]/50 overflow-hidden">

      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 shrink-0 border-b border-[hsl(var(--border))]/50">
        <div className="flex items-center gap-1.5 min-w-0">
          {patientInitials && (
            <div className="h-5 w-5 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[8px] font-bold text-[hsl(var(--primary))] shrink-0">
              {patientInitials}
            </div>
          )}
          <span className="text-[12px] font-semibold text-[hsl(var(--foreground))] truncate">
            {patientName || 'No patient selected'}
          </span>
        </div>
        <button
          onClick={onNewChat}
          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-[hsl(var(--border))]/50 text-[hsl(var(--muted-foreground))] transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[hsl(var(--border))]/50 shrink-0">
        <div className="flex items-center gap-1.5 bg-white/60 rounded-md px-2 py-1.5 border border-[hsl(var(--border))]/50">
          <Search className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-[11px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
          />
        </div>
      </div>

      {/* Chat list — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="h-5 w-5 text-[hsl(var(--muted-foreground))]/40 mb-2" />
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No chat history yet</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-0.5">Start a session to begin</p>
          </div>
        ) : (
          chatHistory.map((section) => (
            <div key={section.section} className="mb-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] px-2 pt-2 pb-1">
                {section.section}
              </p>
              {section.chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors group ${
                    chat.active ? 'bg-white/70 shadow-sm' : 'hover:bg-white/40'
                  }`}
                >
                  <MessageSquare className={`h-3 w-3 shrink-0 ${chat.active ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  <span className={`text-[11px] truncate flex-1 ${chat.active ? 'font-medium text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                    {chat.title}
                  </span>
                  <MoreHorizontal className="h-3 w-3 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientSidebar;
