import React from 'react';
import { SOAPNote } from '../types';

interface SOAPNotePanelProps {
  soapNote: SOAPNote;
}

export const SOAPNotePanel: React.FC<SOAPNotePanelProps> = ({ soapNote }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">SOAP Note</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Subjective</h3>
        <p className="text-sm text-gray-700">{soapNote.subjective || '-'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Objective</h3>
        <p className="text-sm text-gray-700">{soapNote.objective || '-'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Assessment</h3>
        <p className="text-sm text-gray-700">{soapNote.assessment || '-'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Plan</h3>
        <p className="text-sm text-gray-700">{soapNote.plan || '-'}</p>
      </div>
    </div>
  );
};
