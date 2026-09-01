export type VerificationStatus = 'NOT_STARTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DEMO_VERIFIED' | 'VERIFIED' | 'REJECTED';

export interface VerificationProgress {
  identitySubmitted: boolean;
  businessSubmitted: boolean;
  documentsAttached: boolean;
  status: VerificationStatus;
  submittedAt?: string;
  isBackendVerified?: boolean;
}

const getStorageKey = (buyerId: string) => `krishimitra_buyer_verification_${buyerId}`;

export const verificationDemoService = {
  getVerificationProgress: (buyerId: string): VerificationProgress => {
    // 1. Check real backend verification logic here if available in future
    // e.g., if (backendStatus === 'VERIFIED') return { ...isBackendVerified: true, status: 'VERIFIED' }

    // 2. Fall back to demo local storage
    const stored = localStorage.getItem(getStorageKey(buyerId));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse verification status", e);
      }
    }
    
    // 3. Default empty state
    return {
      identitySubmitted: false,
      businessSubmitted: false,
      documentsAttached: false,
      status: 'NOT_STARTED',
      isBackendVerified: false
    };
  },

  submitIdentityVerification: async (buyerId: string, data: any): Promise<void> => {
    const current = verificationDemoService.getVerificationProgress(buyerId);
    const updated = {
      ...current,
      identitySubmitted: true,
      documentsAttached: data.hasDocument ? true : current.documentsAttached
    };
    localStorage.setItem(getStorageKey(buyerId), JSON.stringify(updated));
  },

  submitBusinessVerification: async (buyerId: string, data: any): Promise<void> => {
    const current = verificationDemoService.getVerificationProgress(buyerId);
    const updated = {
      ...current,
      businessSubmitted: true,
      documentsAttached: data.hasDocument ? true : current.documentsAttached
    };
    localStorage.setItem(getStorageKey(buyerId), JSON.stringify(updated));
  },

  submitFinalVerification: async (buyerId: string): Promise<void> => {
    const current = verificationDemoService.getVerificationProgress(buyerId);
    const updated = {
      ...current,
      status: 'DEMO_VERIFIED' as VerificationStatus,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey(buyerId), JSON.stringify(updated));
    // Dispatch event so other components (like Trust Badges) can immediately re-render
    window.dispatchEvent(new Event('krishimitra_verification_updated'));
  }
};
