import React from 'react';
import { Mic, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VoiceState, IntentResult } from '../../../types/voice';

interface VoiceAssistantOverlayProps {
  state: VoiceState;
  transcript: string;
  intentResult: IntentResult | null;
  onClose: () => void;
  onConfirmNavigation?: (route: string) => void;
  isSupported: boolean;
}

export const VoiceAssistantOverlay: React.FC<VoiceAssistantOverlayProps> = ({
  state,
  transcript,
  intentResult,
  onClose,
  onConfirmNavigation,
  isSupported
}) => {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';

  if (state === 'IDLE') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Mic size={16} className="text-brand-primary" />
            </div>
            <span className="text-sm font-black text-gray-900 tracking-tight uppercase">KrishiMitra Voice Assistant</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[250px] text-center">
          
          {!isSupported ? (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle size={48} className="text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">Browser Not Supported</h3>
              <p className="text-sm text-gray-500">
                Voice recognition isn't supported in this browser. Please try Chrome or Edge, or use manual navigation.
              </p>
            </div>
          ) : state === 'REQUESTING_PERMISSION' ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                <Mic size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Allow Microphone Access</h3>
              <p className="text-sm text-gray-500">
                Please click "Allow" in your browser to use voice commands.
              </p>
            </div>
          ) : state === 'LISTENING' ? (
            <div className="flex flex-col items-center space-y-6 w-full">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping scale-150"></div>
                <div className="relative w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30">
                  <Mic size={32} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-bold text-gray-900 animate-pulse">Listening...</h3>
                <div className="min-h-[60px] bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-center w-full">
                  <p className="text-sm font-medium text-gray-700 italic">
                    {transcript ? `"${transcript}"` : (isMarathi ? "तुम्हाला काय करायचे आहे ते सांगा..." : "Say what you want to do...")}
                  </p>
                </div>
              </div>
              
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className={!isMarathi ? 'text-brand-primary' : ''}>English</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className={isMarathi ? 'text-brand-primary' : ''}>मराठी</span>
              </div>
            </div>
          ) : state === 'PROCESSING' ? (
            <div className="flex flex-col items-center space-y-6">
              <Loader2 size={40} className="text-brand-primary animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Understanding...</h3>
                <p className="text-sm text-gray-500 font-medium italic">"{transcript}"</p>
              </div>
            </div>
          ) : state === 'SUCCESS' && intentResult ? (
            <div className="flex flex-col items-center space-y-5 w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle2 size={32} />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest">
                  {intentResult.confidenceLevel === 'HIGH' ? 'High Confidence Match' : 'Matched Intent'}
                </p>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {intentResult.intent.replace(/_/g, ' ')}
                </h3>
              </div>
              
              {intentResult.confidenceLevel === 'HIGH' ? (
                <p className="text-sm font-medium text-gray-600">
                  Opening destination...
                </p>
              ) : (
                <div className="w-full space-y-4">
                  <p className="text-sm font-medium text-gray-600">Did you mean to open this page?</p>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                    >
                      No, Cancel
                    </button>
                    <button 
                      onClick={() => intentResult.route && onConfirmNavigation?.(intentResult.route)}
                      className="flex-1 py-3 px-4 bg-brand-primary hover:bg-brand-deep text-white font-bold rounded-xl shadow-md transition-colors text-sm"
                    >
                      Yes, Open
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : state === 'ERROR' ? (
            <div className="flex flex-col items-center space-y-5">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-2">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">I didn't understand</h3>
                <p className="text-sm text-gray-500">
                  Try saying something like:<br/>
                  <strong className="text-gray-700">"Show market prices"</strong> or <strong className="text-gray-700">"मला बाजार भाव दाखवा"</strong>
                </p>
              </div>
              
              <button 
                onClick={onClose}
                className="mt-4 py-2 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
              >
                Close
              </button>
            </div>
          ) : null}
          
        </div>
        
        {/* Footer actions for Listening state */}
        {state === 'LISTENING' && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
            <button 
              onClick={onClose}
              className="py-2.5 px-8 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl shadow-sm transition-all text-sm"
            >
              Stop Listening
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
