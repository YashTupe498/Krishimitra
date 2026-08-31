import React from 'react';
import { FileText, Search, MessageCircle, Mic, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';

interface GrievanceAssistantProps {
  onReport: () => void;
  onTrack: () => void;
}

export const GrievanceAssistant: React.FC<GrievanceAssistantProps> = ({ onReport, onTrack }) => {
  return (
    <div className="bg-[#081810] text-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl border border-[#1b3d28]">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3 animate-orb-float"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#a3e635] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none -translate-x-1/3 translate-y-1/3 animate-orb-float-delayed"></div>
      
      {/* Decorative SVG Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none animate-pattern-drift" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
        <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <div className="text-[#a3e635]">
             <Sparkles size={14} fill="currentColor" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d1fae5]">KrishiMitra AI Assistant</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-5 text-white">
          Namaste! How can I help you today?
        </h2>
        <p className="text-[#a7f3d0] text-lg mb-10 max-w-md mx-auto md:mx-0 leading-relaxed font-medium">
          Tell me what happened and I'll help you find the exact next step to resolve your issue.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          <Button onClick={onReport} className="bg-[#10b981] text-[#042f1c] hover:bg-[#34d399] font-black px-4 py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-[#34d399] h-auto flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 group w-full">
             <div className="bg-[#042f1c]/10 p-2 rounded-lg group-hover:bg-[#042f1c]/20 transition-colors">
               <FileText size={20} className="text-[#042f1c]" />
             </div>
             <span className="text-[14px] sm:text-[15px] tracking-wide">Report an Issue</span>
          </Button>

          <Button onClick={onTrack} variant="secondary" className="bg-[#0f3420] hover:bg-[#14472c] text-white border border-[#1f5939] font-bold px-4 py-4 rounded-xl shadow-lg h-auto flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 w-full">
             <div className="bg-[#1f5939] p-2 rounded-lg">
               <Search size={20} className="text-[#86efac]" />
             </div>
             <span className="text-[14px] sm:text-[15px] tracking-wide text-[#f0fdf4]">Track Grievance</span>
          </Button>

          <Button variant="secondary" className="bg-[#0f3420] hover:bg-[#14472c] text-white border border-[#1f5939] font-bold px-4 py-4 rounded-xl shadow-lg h-auto flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 w-full" onClick={() => alert('Ask for Help module coming soon in demo')}>
             <div className="bg-[#1f5939] p-2 rounded-lg">
               <MessageCircle size={20} className="text-[#86efac]" />
             </div>
             <span className="text-[14px] sm:text-[15px] tracking-wide text-[#f0fdf4]">Ask for Help</span>
          </Button>

          <Button variant="secondary" className="bg-[#0f3420] hover:bg-[#14472c] text-white border border-[#1f5939] font-bold px-4 py-4 rounded-xl shadow-lg h-auto flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 w-full" onClick={() => alert('Voice assistance is currently unavailable in demo')}>
             <div className="bg-[#1f5939] p-2 rounded-lg">
               <Mic size={20} className="text-[#86efac]" />
             </div>
             <span className="text-[14px] sm:text-[15px] tracking-wide text-[#f0fdf4]">Voice Assistance</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

