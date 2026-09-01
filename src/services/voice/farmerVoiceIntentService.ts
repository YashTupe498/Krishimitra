import type { IntentResult, ConfidenceLevel, Intent } from '../../types/voice';
import { farmerIntents } from '../../data/farmerVoiceCommands';
import type { IntentDefinition } from '../../data/farmerVoiceCommands';

class FarmerVoiceIntentService {
  
  public detectIntent(transcript: string, language: string): IntentResult {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Normalize punctuation
    const cleanTranscript = normalizedTranscript.replace(/[.,!?]/g, '').trim();

    if (!cleanTranscript) {
      return this.createUnknownResult(language, cleanTranscript);
    }

    let bestMatch: { intentDef: IntentDefinition; score: number; matchedTerms: string[] } | null = null;
    let highestScore = 0;

    for (const intentDef of farmerIntents) {
      const { score, matchedTerms } = this.calculateScore(cleanTranscript, language, intentDef);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { intentDef, score, matchedTerms };
      }
    }

    // Determine confidence based on score
    if (!bestMatch || highestScore === 0) {
      return this.createUnknownResult(language, cleanTranscript);
    }

    let confidenceLevel: ConfidenceLevel = 'LOW';
    // Score > 1.5 usually means a phrase match or multiple keywords
    if (highestScore > 1.5) {
      confidenceLevel = 'HIGH';
    } else if (highestScore > 0.5) {
      confidenceLevel = 'MEDIUM';
    }

    // Handle ambiguities (e.g. issue with transaction should prefer issue)
    // If we have an issue keyword but it resolved to transactions due to keyword overlap,
    // we can override it if needed. The scoring weights phrase > keyword.
    
    return {
      intent: bestMatch.intentDef.intent,
      confidenceLevel,
      confidenceScore: highestScore,
      language,
      transcript: cleanTranscript,
      route: bestMatch.intentDef.route,
      matchedTerms: bestMatch.matchedTerms
    };
  }

  private calculateScore(transcript: string, language: string, intentDef: IntentDefinition): { score: number, matchedTerms: string[] } {
    let score = 0;
    const matchedTerms: string[] = [];

    const isMarathi = language.startsWith('mr');
    const phrases = isMarathi ? intentDef.mrPhrases : intentDef.enPhrases;
    const keywords = isMarathi ? intentDef.mrKeywords : intentDef.enKeywords;

    // 1. Phrase match (Highest priority)
    for (const phrase of phrases) {
      if (transcript.includes(phrase.toLowerCase())) {
        score += 2.0; // Exact/partial phrase match is very strong
        matchedTerms.push(phrase);
        break; // Max 1 phrase match counted to avoid inflation
      }
    }

    // 2. Keyword match (Secondary priority)
    const words = transcript.split(/\s+/);
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      // Check if the exact keyword exists as a whole word, or if it's a prominent part of the transcript
      if (words.includes(normalizedKeyword) || transcript.includes(normalizedKeyword)) {
        score += 1.0;
        matchedTerms.push(keyword);
      }
    }

    return { score, matchedTerms };
  }

  private createUnknownResult(language: string, transcript: string): IntentResult {
    return {
      intent: 'UNKNOWN',
      confidenceLevel: 'LOW',
      confidenceScore: 0,
      language,
      transcript,
      route: null,
      matchedTerms: []
    };
  }
}

export const farmerVoiceIntentService = new FarmerVoiceIntentService();
