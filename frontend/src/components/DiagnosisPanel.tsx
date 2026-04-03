import React from 'react';
import { Diagnosis } from '../types';

interface DiagnosisPanelProps {
  diagnoses: Diagnosis[];
}

export const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({ diagnoses }) => {
  return (
    <div className="p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Clinical Suggestions</h2>
      
      {diagnoses.length === 0 ? (
        <p className="text-sm text-gray-700">No suggestions yet...</p>
      ) : (
        <div className="space-y-4">
          {diagnoses.map((diagnosis, index) => (
            <div key={index} className="border border-gray-200 rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{diagnosis.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  diagnosis.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                  diagnosis.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {diagnosis.likelihood}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{diagnosis.next_step}</p>
              {diagnosis.is_urgent && (
                <p className="text-xs text-red-600 font-semibold">⚠️ Consider urgent evaluation</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
