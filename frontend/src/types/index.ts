// TypeScript type definitions for AskCliro Frontend

export interface Session {
  id: string;
  created_at: string;
  patient_name: string;
  transcript: string;
  soap_note: SOAPNote;
  diagnoses: Diagnosis[];
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Diagnosis {
  name: string;
  likelihood: 'High' | 'Medium' | 'Low';
  symptoms: string[];
  next_step: string;
  is_urgent: boolean;
  citations: Citation[];
}

export interface Citation {
  title: string;
  pmid: string;
  url: string;
}
