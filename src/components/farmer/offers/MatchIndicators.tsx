import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { MatchScoreDetails } from '../../../services/offerDemoService';

export const MatchIndicators: React.FC<{ score: MatchScoreDetails }> = ({ score }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Match Analysis</span>
        <span className={`text-sm font-black ${score.overallScore >= 80 ? 'text-green-600' : score.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
          {score.overallScore}% MATCH
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          {score.cropMatch ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />}
          <span className={score.cropMatch ? 'text-gray-900 font-medium' : 'text-gray-500'}>Crop</span>
        </div>
        <div className="flex items-center gap-1.5">
          {score.gradeMatch ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />}
          <span className={score.gradeMatch ? 'text-gray-900 font-medium' : 'text-gray-500'}>Grade</span>
        </div>
        <div className="flex items-center gap-1.5">
          {score.quantityMatch ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-amber-400" />}
          <span className={score.quantityMatch ? 'text-gray-900 font-medium' : 'text-gray-500'}>Quantity</span>
        </div>
        <div className="flex items-center gap-1.5">
          {score.locationMatch ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-amber-400" />}
          <span className={score.locationMatch ? 'text-gray-900 font-medium' : 'text-gray-500'}>Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          {score.timingMatch ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-amber-400" />}
          <span className={score.timingMatch ? 'text-gray-900 font-medium' : 'text-gray-500'}>Timing</span>
        </div>
      </div>
    </div>
  );
};
