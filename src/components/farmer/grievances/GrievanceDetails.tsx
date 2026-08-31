import React from 'react';
import { ChevronLeft, FileText, Bot, Clock, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { Grievance } from '../../../types/grievance';
import { PriorityBadge, StatusBadge } from './GrievanceList';

interface GrievanceDetailsProps {
  grievance: Grievance;
  onBack: () => void;
}

export const GrievanceDetails: React.FC<GrievanceDetailsProps> = ({ grievance, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2">
          <ChevronLeft size={20} />
        </Button>
        <div>
           <h2 className="text-xl font-bold text-gray-900">Grievance {grievance.id}</h2>
           <span className="text-sm text-gray-500">{grievance.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status & Priority</h3>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={grievance.status} />
                    <PriorityBadge priority={grievance.priority} />
                  </div>
               </div>
               <div className="text-right">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Reported</h3>
                  <span className="text-sm font-bold text-gray-900">{new Date(grievance.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
               </div>
             </div>

             <div className="mb-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={14}/> Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {grievance.description}
                </p>
             </div>

             {grievance.details && Object.keys(grievance.details).length > 0 && (
               <div className="mb-8">
                 <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Provided Details</h3>
                 <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {Object.entries(grievance.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{formatKey(key)}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             <div className="mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={14}/> Evidence</h3>
                {grievance.evidence.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {grievance.evidence.map(file => (
                      <div key={file} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                         <FileText size={14} className="text-gray-400" />
                         <span className="text-xs font-medium text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">No supporting evidence attached</span>
                )}
             </div>
           </div>

           <div className="bg-[#F4F9F5] rounded-2xl p-6 md:p-8 shadow-sm border border-[#C3D9CB]">
              <h3 className="text-[10px] font-bold text-[#194D2E] uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Bot size={14}/> AI-Assisted Assessment
              </h3>
              
              <div className="bg-white p-5 rounded-xl border border-[#D8E2DB] mb-6">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Issue Summary</span>
                 <p className="text-sm text-gray-900 font-medium">{grievance.classificationSummary}</p>
              </div>

              <div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Why {grievance.priority}?</span>
                 <ul className="space-y-2">
                   {grievance.classificationReasons.map((reason, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                       <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
                       {reason}
                     </li>
                   ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* Sidebar: Timeline & Guidance */}
        <div className="space-y-6">
           <ResolutionGuidance guidance={grievance.resolutionGuidance} />
           
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14} /> Grievance Timeline
              </h3>
              
              <div className="relative border-l border-gray-100 ml-3 space-y-6 pb-2">
                 {grievance.timeline.map((event, idx) => (
                   <div key={idx} className="relative pl-6">
                     {/* Node */}
                     <div className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white ${
                       event.state === 'COMPLETED' ? 'bg-green-500' :
                       event.state === 'CURRENT' ? 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]' :
                       'bg-gray-200'
                     }`}></div>
                     
                     <div className="flex flex-col">
                       <span className={`text-sm font-bold ${event.state === 'PENDING' ? 'text-gray-400' : 'text-gray-900'}`}>{event.title}</span>
                       <span className="text-xs text-gray-500 mt-1">{event.description}</span>
                       {event.timestamp && (
                         <span className="text-[10px] font-medium text-gray-400 mt-2">{new Date(event.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ResolutionGuidance = ({ guidance }: { guidance: Grievance['resolutionGuidance'] }) => {
  return (
    <div className="bg-[#FFF9F2] rounded-2xl p-6 shadow-sm border border-[#FCECD8]">
       <h3 className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Navigation size={14} /> Resolution Guidance
       </h3>

       <div className="space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest mb-1.5">What Happened?</h4>
            <p className="text-sm text-gray-900 font-medium">{guidance.whatHappened}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest mb-1.5">Why?</h4>
            <p className="text-sm text-gray-700">{guidance.why}</p>
          </div>
          <div className="pt-4 border-t border-orange-200/50">
            <h4 className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest mb-1.5">What should you do?</h4>
            <p className="text-sm text-gray-700 mb-4">{guidance.whatToDo}</p>
            
            <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
               <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended Next Step</h4>
               <p className="text-sm font-bold text-gray-900 leading-snug">{guidance.recommendedAction}</p>
            </div>
          </div>

          {guidance.resolutionChannel && (
            <div className="mt-4 text-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Recommended resolution channel</span>
              <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block">
                {guidance.resolutionChannel}
              </span>
            </div>
          )}
       </div>
    </div>
  );
};

const formatKey = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};
