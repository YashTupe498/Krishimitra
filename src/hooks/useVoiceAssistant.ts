import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { VoiceState, IntentResult } from '../types/voice';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { farmerVoiceIntentService } from '../services/voice/farmerVoiceIntentService';

export const useVoiceAssistant = () => {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  // Handle unmount cleanup
  useEffect(() => {
    return () => {
      speechRecognitionService.stopListening();
    };
  }, []);

  const getActiveLanguageCode = () => {
    // Mapping app languages to speech recognition locales
    const lang = i18n.language || 'en';
    if (lang === 'mr') return 'mr-IN';
    if (lang === 'hi') return 'hi-IN'; // Fallback to hindi if selected, though we mainly focus on mr/en
    return 'en-IN';
  };

  const startListening = useCallback(() => {
    if (!speechRecognitionService.checkIsSupported()) {
      setState('UNSUPPORTED');
      return;
    }

    setState('REQUESTING_PERMISSION');
    setTranscript('');
    setInterimTranscript('');
    setIntentResult(null);

    const langCode = getActiveLanguageCode();

    speechRecognitionService.startListening(langCode, {
      onStart: () => {
        setState('LISTENING');
      },
      onResult: (interim, final) => {
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          processTranscript(final, langCode);
        }
      },
      onError: (errorType) => {
        if (errorType === 'not-allowed') {
          setState('REQUESTING_PERMISSION'); // or a specific permission denied state
          // For simplicity we use ERROR but with specific messaging in UI
        }
        setState('ERROR');
        console.warn('Speech recognition error:', errorType);
      },
      onEnd: () => {
        // If we were just listening and it ended without final result (e.g. user stopped speaking)
        // and we aren't already processing...
        setState((prev) => {
          if (prev === 'LISTENING') return 'IDLE'; // Or handle no-speech
          return prev;
        });
      }
    });
  }, [i18n.language]);

  const stopListening = useCallback(() => {
    speechRecognitionService.stopListening();
    setState('IDLE');
  }, []);

  const processTranscript = (text: string, language: string) => {
    setState('PROCESSING');
    
    // Slight delay for UI feedback (Processing...)
    setTimeout(() => {
      const result = farmerVoiceIntentService.detectIntent(text, language);
      setIntentResult(result);
      
      if (result.confidenceLevel === 'HIGH' && result.route) {
        setState('SUCCESS');
        // Delay navigation slightly so user sees the success state
        setTimeout(() => {
          navigate(result.route as string);
          setState('IDLE');
        }, 1500);
      } else if (result.confidenceLevel === 'MEDIUM') {
        setState('SUCCESS'); // But we wait for user confirmation in UI
      } else {
        setState('ERROR'); // Low confidence / unknown
      }
    }, 600);
  };

  // Allow manual text processing as fallback
  const processTextCommand = (text: string) => {
    setTranscript(text);
    processTranscript(text, getActiveLanguageCode());
  };

  return {
    state,
    transcript: transcript || interimTranscript,
    intentResult,
    isSupported: speechRecognitionService.checkIsSupported(),
    startListening,
    stopListening,
    processTextCommand,
    setState // Expose for resetting from UI
  };
};
