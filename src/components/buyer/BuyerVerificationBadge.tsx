import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { verificationDemoService, type VerificationProgress } from '../../services/verificationDemoService';


export const BuyerVerificationBadge: React.FC<{
  buyerId: string;
  className?: string;
  showText?: boolean;
}> = ({ buyerId, className = '', showText = true }) => {
  const [progress, setProgress] = useState<VerificationProgress>(verificationDemoService.getVerificationProgress(buyerId));

  useEffect(() => {
    // Initial fetch
    setProgress(verificationDemoService.getVerificationProgress(buyerId));

    // Listen for cross-component updates (e.g. after verifying on profile page)
    const handleUpdate = () => {
      setProgress(verificationDemoService.getVerificationProgress(buyerId));
    };

    window.addEventListener('krishimitra_verification_updated', handleUpdate);
    return () => window.removeEventListener('krishimitra_verification_updated', handleUpdate);
  }, [buyerId]);

  if (progress.isBackendVerified) {
    return (
      <div className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-green-200 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider ${className}`}>
        <ShieldCheck size={12} />
        {showText && <span>Verified</span>}
      </div>
    );
  }

  if (progress.status === 'DEMO_VERIFIED') {
    return (
      <div className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-green-300 bg-[#F4F9F5] text-green-700 text-[10px] font-bold uppercase tracking-wider cursor-help ${className}`}>
        <ShieldCheck size={12} className="text-green-600" />
        {showText && <span>Demo Verified</span>}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none">
          Demo verification — not government verified
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  if (progress.status === 'SUBMITTED' || progress.identitySubmitted || progress.businessSubmitted) {
    return (
      <div className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider cursor-help ${className}`}>
        <Shield size={12} />
        {showText && <span>Pending</span>}
      </div>
    );
  }

  return (
    <div className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider cursor-help ${className}`}>
      <ShieldAlert size={12} />
      {showText && <span>Unverified</span>}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none">
        This buyer has not completed platform verification.
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};
