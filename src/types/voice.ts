export type VoiceState = 
  | 'IDLE' 
  | 'REQUESTING_PERMISSION' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'SUCCESS' 
  | 'ERROR' 
  | 'UNSUPPORTED';

export type Intent = 
  | 'DASHBOARD' 
  | 'MY_LOTS' 
  | 'MARKET_INTELLIGENCE' 
  | 'MY_DECISIONS' 
  | 'OFFERS' 
  | 'TRANSACTIONS' 
  | 'ISSUES_GRIEVANCES' 
  | 'PROFILE' 
  | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface IntentResult {
  intent: Intent;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  language: string;
  transcript: string;
  route: string | null;
  matchedTerms: string[];
}
