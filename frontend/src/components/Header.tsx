import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-12 flex items-center justify-between px-5 bg-[hsl(var(--card))] border-b shrink-0">
      <div className="flex items-center gap-4">
        <div className="text-base font-semibold tracking-tight">
          <span className="text-[hsl(var(--foreground))]">Ask</span>
          <span className="text-[hsl(var(--primary))]">Cliro</span>
        </div>

        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] border-l pl-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-600 font-medium text-[11px]">Session active</span>
          <span className="opacity-30 text-xs">&middot;</span>
          <span className="text-[11px]">Dr. Okafor</span>
          <span className="opacity-30 text-xs">&middot;</span>
          <span className="text-[11px]">Patient: J. Martinez</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="h-7 px-3 text-[11px] font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border rounded-md hover:bg-[hsl(var(--muted))] transition-colors">
          Export SOAP
        </button>
        <button className="h-7 px-3 text-[11px] font-medium text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-md hover:opacity-90 transition-opacity">
          End session
        </button>
        <button className="h-7 w-7 flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
