// Type declarations for browser SpeechRecognition API
// Fallback types so we don't need a huge @types package if not present.
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new(): ISpeechRecognition };
    webkitSpeechRecognition?: { new(): ISpeechRecognition };
  }
}

export interface SpeechServiceCallbacks {
  onStart: () => void;
  onResult: (interimTranscript: string, finalTranscript: string) => void;
  onError: (errorType: string) => void;
  onEnd: () => void;
}

class SpeechRecognitionService {
  private recognition: ISpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        // Defer instantiation until startListening to avoid browser autoplay/permission blocks on load
      }
    } catch (e) {
      console.error("Error checking speech recognition support:", e);
      this.isSupported = false;
    }
  }

  public checkIsSupported(): boolean {
    return this.isSupported;
  }

  public startListening(language: string, callbacks: SpeechServiceCallbacks) {
    if (!this.isSupported) {
      callbacks.onError('unsupported');
      return;
    }

    if (!this.recognition) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
        }
      } catch (e) {
        console.error("Error creating SpeechRecognition instance:", e);
        callbacks.onError('unsupported');
        return;
      }
    }

    if (!this.recognition) {
      callbacks.onError('unsupported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = language;

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      callbacks.onResult(interimTranscript, finalTranscript);
      
      // Stop automatically on final result for navigation commands
      if (finalTranscript.trim().length > 0) {
        this.stopListening();
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      callbacks.onError('start-failed');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  public abortListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.error('Error aborting recognition', e);
      }
      this.isListening = false;
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
