import React from 'react';
import { Badge } from './ui/badge';

const diagnoses = [
  { id: 1, title: 'Pleuritis (pleurisy)', severity: 'High' as const, description: 'Sharp pleuritic chest pain, fever 38.5°C, dry cough — classic presentation. Left-sided localization consistent.', tests: 'Chest X-ray, CBC, CRP', pubmed: '34821053' },
  { id: 2, title: 'Community-acquired pneumonia', severity: 'High' as const, description: 'Fever, productive-onset cough, pleuritic pain. Consider if auscultation reveals crackles or reduced breath sounds.', tests: 'Chest X-ray, sputum culture', pubmed: '31573350' },
  { id: 3, title: 'Pericarditis', severity: 'Medium' as const, description: 'Sharp chest pain worse on inspiration, fever. Rule out if pain improves leaning forward. ECG recommended.', tests: 'ECG, troponin, echo', pubmed: '29941987' },
  { id: 4, title: 'Pulmonary embolism', severity: 'Low' as const, description: 'Pleuritic pain and cough present, but low-grade fever more suggestive of infection. Assess Wells score — ask about recent travel or immobility.', tests: 'Wells score, D-dimer if indicated', pubmed: '30020270' },
];

const soapSections = [
  { key: 'subjective', label: 'S — SUBJECTIVE', status: 'DONE', variant: 'success' as const, content: 'Patient is a male presenting with 3-day history of sharp, left-sided chest pain, pleuritic in nature (worsens with deep inspiration). Associated dry cough onset yesterday. Fever reported 2 days ago (38.5°C). No reported dyspnea at rest.' },
  { key: 'objective', label: 'O — OBJECTIVE', status: 'UPDATING', variant: 'warning' as const, content: 'Vitals pending. Physical exam in progress.' },
  { key: 'assessment', label: 'A — ASSESSMENT', status: 'UPDATING', variant: 'warning' as const, content: 'Pleuritic chest pain with fever and dry cough. Differential includes pleuritis, pneumonia, pericarditis.' },
  { key: 'plan', label: 'P — PLAN', status: 'PENDING', variant: 'secondary' as const, content: 'Awaiting assessment completion...' },
];

const ClinicalPanel: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">

      {/* SOAP Note */}
      <div className="flex flex-col border-b border-white/20 h-[55%] shrink-0">
        <div className="h-9 flex items-center justify-between px-4 border-b border-white/20 glass-strong shrink-0">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">SOAP Note</h2>
          <Badge variant="default" className="text-[9px]">Auto-generating</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3 glass-subtle">
          <div className="grid grid-cols-2 gap-2.5">
            {soapSections.map((section) => (
              <div key={section.key} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/40">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--foreground))]">
                    {section.label}
                  </h3>
                  <Badge variant={section.variant} className="text-[8px] font-bold">
                    {section.status}
                  </Badge>
                </div>
                <p className="text-[11.5px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-9 flex items-center justify-between px-4 border-b border-white/20 glass-strong shrink-0">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Differential Diagnoses</h2>
          <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{diagnoses.length} suggested</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 glass-subtle">
          <div className="space-y-2">
            {diagnoses.map((dx) => {
              const severityStyle =
                dx.severity === 'High' ? 'text-red-500' :
                dx.severity === 'Medium' ? 'text-amber-500' :
                'text-emerald-500';

              return (
                <div key={dx.id} className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/40 hover:bg-white/60 transition-all duration-200">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-[13px] font-semibold text-[hsl(var(--foreground))] leading-tight pr-2">
                      {dx.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${severityStyle}`}>
                      {dx.severity}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
                    {dx.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[hsl(var(--primary))] font-medium cursor-pointer hover:underline">
                      &rarr; {dx.tests}
                    </span>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      PubMed: {dx.pubmed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalPanel;
