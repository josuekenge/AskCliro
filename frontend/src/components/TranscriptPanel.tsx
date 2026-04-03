import React from 'react';

interface TranscriptPanelProps {
  transcript: string;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript }) => {
  return (
    <div className="flex-1 border-r border-gray-300 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Live Transcript</h2>
      <div className="text-sm text-gray-700">
        {transcript || 'Waiting for conversation...'}
      </div>
    </div>
  );
};
