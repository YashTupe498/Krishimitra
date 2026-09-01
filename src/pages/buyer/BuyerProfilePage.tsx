import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { 
  UserCircle, MapPin, ShieldCheck, Camera, CheckCircle2,
  Info, Briefcase, Activity, ShieldAlert, UploadCloud, ChevronRight, X, Clock, FileText, IndianRupee
} from 'lucide-react';
import buyerDefaultAvatar from '../../assets/buyer-default-avatar.png';
import { buyerMarketplaceApi } from '../../services/buyerMarketplaceApi';
import { verificationDemoService, type VerificationProgress } from '../../services/verificationDemoService';
import { BuyerVerificationBadge } from '../../components/buyer/BuyerVerificationBadge';
import { transactionDemoService } from '../../services/transactionDemoService';
import type { DemoTransaction } from '../../types/transaction';

// Premium styling constants
const baseCard = "shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_4px_24px_rgba(40,35,20,0.04)] rounded-[20px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_12px_40px_rgba(23,77,56,0.12)] relative group";
const cardHero = `${baseCard} bg-gradient-to-br from-[#FFFEFA] to-[#F4F9F5] border border-[#EBE7DD] hover:border-brand-primary/50`;
const cardPersonalInfo = `${baseCard} bg-gradient-to-br from-white to-[#F9FAF9] border border-[#EBE7DD] hover:border-brand-primary/50`;
const cardBusinessInfo = `${baseCard} bg-gradient-to-br from-[#FFFDF9] to-[#FDF9F2] border border-[#FDEBC8] hover:border-amber-400/60`;
const cardVerification = `${baseCard} bg-gradient-to-br from-[#F4F9F5] to-white border border-[#C3D9CB] hover:border-brand-primary`;
const cardTrust = `${baseCard} bg-gradient-to-br from-[#F6F8FB] to-[#F9F9FC] border border-[#DCE4F0] hover:border-blue-400/60`;
const cardHistory = `${baseCard} bg-white border border-[#EBE7DD] hover:border-brand-primary/40`;
const premiumHeader = "text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-[#EBE7DD]/50 pb-4";
const inputClass = "w-full appearance-none pl-4 pr-4 py-3 bg-white border border-[#EBE7DD] hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5";

interface LocalProfileOverrides {
  full_name?: string;
  phone?: string;
  organization_name?: string;
  avatar_url?: string;
  avatar_type?: 'default' | 'uploaded';
}

export const BuyerProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoDocInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<LocalProfileOverrides>({});
  
  // Verification State
  const [verificationProgress, setVerificationProgress] = useState<VerificationProgress | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'SELECT' | 'IDENTITY' | 'BUSINESS' | 'REVIEW' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [demoDocumentName, setDemoDocumentName] = useState<string | null>(null);

  // Activity & Trust stats
  const [activity, setActivity] = useState({ reqs: 0, offers: 0, completedTxs: 0, pendingPayments: 0 });
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  
  // Form State
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    organization_name: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load data
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`buyer_profile_overrides_${user.id}`);
      if (stored) {
        try { setLocalOverrides(JSON.parse(stored)); } catch (e) { console.error("Parse error", e); }
      }
      setVerificationProgress(verificationDemoService.getVerificationProgress(user.id));
    }
  }, [user?.id]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reqs, offers] = await Promise.all([
          buyerMarketplaceApi.getRequirements(),
          buyerMarketplaceApi.getOffersByFarmer()
        ]);
        
        // In a real app we'd fetch buyer-specific transactions here.
        // For the demo we fetch all and mock a few for the buyer if they don't exist
        const allTxs = await transactionDemoService.getAll('demo-farmer-id'); 
        
        let completed = 0;
        let pending = 0;
        allTxs.forEach(tx => {
          if (tx.status === 'COMPLETED' || tx.status === 'PAYMENT_RECEIVED') completed++;
          if (tx.payment?.status === 'PENDING') pending++;
        });

        setTransactions(allTxs.slice(0, 5)); // Show recent 5
        setActivity({
          reqs: reqs.length,
          offers: offers.length,
          completedTxs: completed || 3, // Mock fallback
          pendingPayments: pending || 1  // Mock fallback
        });
      } catch (e) {
        console.warn('Failed to load stats', e);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchStats();
  }, []);

  // Derived values for display
  const displayData = {
    full_name: localOverrides.full_name ?? profile?.full_name ?? 'Buyer',
    phone: localOverrides.phone ?? profile?.phone ?? 'Not provided',
    email: user?.email ?? 'Not provided',
    organization: localOverrides.organization_name ?? profile?.organization_name ?? 'No Organization',
    location: profile?.district && profile?.state ? `${profile.district}, ${profile.state}` : 'Location unavailable',
    role: profile?.buyer_type ?? 'Standard Buyer',
    avatar_url: localOverrides.avatar_type === 'uploaded' && localOverrides.avatar_url ? localOverrides.avatar_url : buyerDefaultAvatar,
    avatar_type: localOverrides.avatar_type ?? 'default',
  };

  // Sync form when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditForm({
        full_name: displayData.full_name,
        phone: displayData.phone,
        organization_name: displayData.organization
      });
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editForm.full_name.trim()) return alert('Name cannot be empty');
    setIsSaving(true);
    setTimeout(() => {
      const newOverrides = { ...localOverrides, full_name: editForm.full_name, phone: editForm.phone, organization_name: editForm.organization_name };
      localStorage.setItem(`buyer_profile_overrides_${user?.id}`, JSON.stringify(newOverrides));
      setLocalOverrides(newOverrides);
      setIsEditing(false);
      setIsSaving(false);
      showToast('Profile updated successfully.');
    }, 600);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) return alert("Image must be JPG, PNG or WEBP.");
    if (file.size > 5 * 1024 * 1024) return alert("Image size must be less than 5 MB.");

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const newOverrides = { ...localOverrides, avatar_url: result, avatar_type: 'uploaded' as const };
      localStorage.setItem(`buyer_profile_overrides_${user?.id}`, JSON.stringify(newOverrides));
      setLocalOverrides(newOverrides);
      showToast("Profile photo updated successfully.");
    };
    reader.readAsDataURL(file);
  };

  // Verification Handlers
  const handleVerifyIdentity = () => {
    if (!user?.id) return;
    verificationDemoService.submitIdentityVerification(user.id, { hasDocument: !!demoDocumentName });
    setVerificationProgress(verificationDemoService.getVerificationProgress(user.id));
    setDemoDocumentName(null);
    setVerificationStep('REVIEW');
  };

  const handleVerifyBusiness = () => {
    if (!user?.id) return;
    verificationDemoService.submitBusinessVerification(user.id, { hasDocument: !!demoDocumentName });
    setVerificationProgress(verificationDemoService.getVerificationProgress(user.id));
    setDemoDocumentName(null);
    setVerificationStep('REVIEW');
  };

  const handleFinalSubmit = () => {
    if (!user?.id) return;
    setVerificationStep('PROCESSING');
    setTimeout(() => {
      verificationDemoService.submitFinalVerification(user.id);
      setVerificationProgress(verificationDemoService.getVerificationProgress(user.id));
      setVerificationStep('SUCCESS');
    }, 2000);
  };

  // --------------------------------------------------------
  // MODAL RENDERERS
  // --------------------------------------------------------
  const renderVerificationModalContent = () => {
    if (verificationStep === 'SELECT') {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Buyer Verification Center</h2>
          <p className="text-sm text-gray-500 mb-6">Verification helps farmers identify reliable buyers and builds trust on the platform.</p>
          
          <button 
            onClick={() => setVerificationStep('IDENTITY')}
            disabled={verificationProgress?.identitySubmitted}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-[#F4F9F5] transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${verificationProgress?.identitySubmitted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {verificationProgress?.identitySubmitted ? <CheckCircle2 size={20} /> : <UserCircle size={20} />}
              </div>
              <div>
                <p className="font-bold text-gray-900">Identity Verification</p>
                <p className="text-xs text-gray-500">Provide personal identity details</p>
              </div>
            </div>
            {!verificationProgress?.identitySubmitted && <ChevronRight size={20} className="text-gray-400 group-hover:text-brand-primary" />}
          </button>

          <button 
            onClick={() => setVerificationStep('BUSINESS')}
            disabled={verificationProgress?.businessSubmitted}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-[#F4F9F5] transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${verificationProgress?.businessSubmitted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {verificationProgress?.businessSubmitted ? <CheckCircle2 size={20} /> : <Briefcase size={20} />}
              </div>
              <div>
                <p className="font-bold text-gray-900">Business Verification</p>
                <p className="text-xs text-gray-500">Provide organization registration details</p>
              </div>
            </div>
            {!verificationProgress?.businessSubmitted && <ChevronRight size={20} className="text-gray-400 group-hover:text-brand-primary" />}
          </button>

          {(verificationProgress?.identitySubmitted || verificationProgress?.businessSubmitted) && verificationProgress?.status !== 'DEMO_VERIFIED' && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Button onClick={() => setVerificationStep('REVIEW')} className="w-full">Proceed to Review</Button>
            </div>
          )}
        </div>
      );
    }

    if (verificationStep === 'IDENTITY') {
      return (
        <div className="space-y-5">
          <button onClick={() => setVerificationStep('SELECT')} className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verification</h2>
          
          <div className="bg-[#FFF9E5] border border-[#FDE08B] p-3 rounded-lg text-xs text-[#8A6A00] font-medium flex items-start gap-2 mb-4">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p><strong className="uppercase block mb-0.5">Demo Mode</strong>This is a simulated verification workflow. Do not upload actual government IDs or sensitive information.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
              <input type="text" readOnly value={displayData.full_name} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Document Type (Demo)</label>
              <select className="w-full p-2 bg-white border border-gray-200 rounded text-sm text-gray-900 outline-none">
                <option>Aadhaar (Simulated)</option>
                <option>PAN (Simulated)</option>
                <option>Driving Licence (Simulated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Demo Document Reference</label>
              <input type="text" readOnly value="DEMO-ID-8492" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none font-mono" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Upload Demo Document</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-primary/50 transition-colors"
                onClick={() => demoDocInputRef.current?.click()}
              >
                <UploadCloud size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-700">{demoDocumentName ? demoDocumentName : 'Click to select demo file'}</span>
                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
              </div>
              <input type="file" ref={demoDocInputRef} className="hidden" onChange={(e) => setDemoDocumentName(e.target.files?.[0]?.name || null)} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setVerificationStep('SELECT')}>Cancel</Button>
            <Button onClick={handleVerifyIdentity}>Save Identity Info</Button>
          </div>
        </div>
      );
    }

    if (verificationStep === 'BUSINESS') {
      return (
        <div className="space-y-5">
          <button onClick={() => setVerificationStep('SELECT')} className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Verification</h2>
          
          <div className="bg-[#FFF9E5] border border-[#FDE08B] p-3 rounded-lg text-xs text-[#8A6A00] font-medium flex items-start gap-2 mb-4">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p><strong className="uppercase block mb-0.5">Demo Mode</strong>This is a simulated workflow. Do not use real GST or tax numbers.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Organization Name</label>
              <input type="text" readOnly value={displayData.organization} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Operating Location</label>
              <input type="text" readOnly value={displayData.location} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Demo GST/Business ID</label>
              <input type="text" readOnly value="DEMO-GST-29304XZ" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none font-mono" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Upload Demo Business Document</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-primary/50 transition-colors"
                onClick={() => demoDocInputRef.current?.click()}
              >
                <UploadCloud size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-700">{demoDocumentName ? demoDocumentName : 'Click to select demo certificate'}</span>
              </div>
              <input type="file" ref={demoDocInputRef} className="hidden" onChange={(e) => setDemoDocumentName(e.target.files?.[0]?.name || null)} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setVerificationStep('SELECT')}>Cancel</Button>
            <Button onClick={handleVerifyBusiness}>Save Business Info</Button>
          </div>
        </div>
      );
    }

    if (verificationStep === 'REVIEW') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Review</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><UserCircle size={16}/> Identity</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Information provided</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Demo document attached</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Briefcase size={16}/> Business</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Organization details provided</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Demo business document attached</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between bg-[#EAF6EF] border border-[#C3D9CB] p-3 rounded-lg text-sm text-green-900 font-bold">
              <span>Verification Type</span>
              <span className="uppercase tracking-widest text-[10px] bg-green-200 px-2 py-1 rounded">Demo Verification</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setVerificationStep('SELECT')}>Back</Button>
            <Button onClick={handleFinalSubmit}>Submit Verification</Button>
          </div>
        </div>
      );
    }

    if (verificationStep === 'PROCESSING') {
      return (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-600 animate-pulse">Submitting verification documents...</p>
        </div>
      );
    }

    if (verificationStep === 'SUCCESS') {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verification Submitted</h2>
          <p className="text-sm text-gray-500">Your documents have been submitted for demo verification.</p>
          
          <div className="bg-[#F4F9F5] border border-green-200 p-4 rounded-xl inline-block mt-4 text-left w-full max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 font-black text-green-700 uppercase tracking-widest text-xs mb-3">
              <ShieldCheck size={16} /> DEMO VERIFIED
            </div>
            <ul className="space-y-2 text-xs text-green-800 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600"/> Identity information submitted</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600"/> Business information submitted</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600"/> Verification completed for demonstration</li>
            </ul>
          </div>
          
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">This does not represent government or legal verification.</p>

          <div className="pt-6 mt-2">
            <Button onClick={() => setIsVerificationModalOpen(false)} className="w-full">Done</Button>
          </div>
        </div>
      );
    }

    return null;
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-2rem)] bg-gradient-to-b from-[#F5F8F5] to-white -m-4 md:-m-8 p-4 md:p-8 animate-in fade-in duration-500 font-sans tracking-tight text-gray-900 relative overflow-hidden z-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 size={18} className="text-green-500" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Center</span>
              <button onClick={() => setIsVerificationModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {renderVerificationModalContent()}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto pb-24 flex flex-col space-y-6 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 mb-2">
          <div>
            <h1 className="text-3xl font-black text-[#14532D] tracking-tight mb-1">Buyer Profile</h1>
            <p className="text-sm text-gray-500 font-semibold tracking-normal">Manage your buyer identity, verification status, and platform activity.</p>
          </div>
          <div className="shrink-0">
            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </header>

        {/* HERO SECTION */}
        <section className={`${cardHero} overflow-visible`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-[#F5F8F5] border-4 border-white shadow-lg relative">
                <img src={displayData.avatar_url} alt="Buyer profile" className="w-full h-full object-cover" />
                {displayData.avatar_type === 'default' && (
                  <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-sm py-1 flex justify-center">
                    <span className="text-[9px] text-white font-bold tracking-widest uppercase">Default</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <Camera className="text-white w-6 h-6 mb-1" />
                   <span className="text-[9px] text-white font-bold tracking-widest uppercase">Upload</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg, image/png, image/webp" className="hidden" />
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{displayData.full_name}</h2>
                {user?.id && <BuyerVerificationBadge buyerId={user.id} />}
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm font-semibold text-gray-600 mb-6 mt-1">
                <span className="bg-[#EAF6EF] text-brand-deep px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border border-brand-primary/20">
                  {displayData.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} className="text-gray-400" />
                  {displayData.organization}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  {displayData.location}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PERSONAL & BUSINESS INFO */}
          <div className="flex flex-col gap-6">
            <section className={cardPersonalInfo}>
              <h3 className={premiumHeader}><UserCircle size={16} className="text-brand-primary" /> Personal Information</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  {isEditing ? (
                    <input type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className={inputClass} />
                  ) : <p className="text-base font-bold text-gray-900">{displayData.full_name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  {isEditing ? (
                    <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className={inputClass} />
                  ) : <p className="text-base font-bold text-gray-900">{displayData.phone}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <p className="text-base font-bold text-gray-500">{displayData.email}</p>
                </div>
              </div>
            </section>

            <section className={cardBusinessInfo}>
              <h3 className={premiumHeader}><Briefcase size={16} className="text-amber-500" /> Business Information</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Organization Name</label>
                  {isEditing ? (
                    <input type="text" value={editForm.organization_name} onChange={e => setEditForm({...editForm, organization_name: e.target.value})} className={inputClass} />
                  ) : <p className="text-base font-bold text-gray-900">{displayData.organization}</p>}
                </div>
                <div>
                  <label className={labelClass}>Operating Location</label>
                  <p className="text-base font-bold text-gray-900">{displayData.location}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            {/* INTERACTIVE VERIFICATION STATUS */}
            <section className={cardVerification}>
              <h3 className={premiumHeader}><ShieldCheck size={16} className="text-brand-primary" /> Verification Center</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${verificationProgress?.status === 'DEMO_VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {verificationProgress?.status === 'DEMO_VERIFIED' ? 'Demo Verified' : 'Buyer Not Verified'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {verificationProgress?.status === 'DEMO_VERIFIED' ? 'Verification completed for demonstration.' : 'Complete verification to build trust with farmers.'}
                      </p>
                    </div>
                  </div>
                  {verificationProgress?.status !== 'DEMO_VERIFIED' && (
                    <Button variant="secondary" onClick={() => { setVerificationStep('SELECT'); setIsVerificationModalOpen(true); }} className="text-xs py-1.5 px-3 h-auto">
                      Complete Verification
                    </Button>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={14} className="text-green-500" /> Account created
                  </div>
                  
                  {/* Interactive Identity Row */}
                  <div 
                    onClick={() => { if (!verificationProgress?.identitySubmitted) { setVerificationStep('IDENTITY'); setIsVerificationModalOpen(true); } }}
                    className={`flex items-center gap-2 text-xs font-semibold transition-colors ${verificationProgress?.identitySubmitted ? 'text-green-700 cursor-default' : 'text-gray-500 hover:text-brand-primary cursor-pointer'}`}
                  >
                    {verificationProgress?.identitySubmitted ? (
                      <CheckCircle2 size={14} className="text-green-500" /> 
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 ml-[1px] hover:border-brand-primary transition-colors"></div> 
                    )}
                    {verificationProgress?.identitySubmitted ? 'Identity information submitted' : 'Identity not verified'}
                  </div>

                  {/* Interactive Business Row */}
                  <div 
                    onClick={() => { if (!verificationProgress?.businessSubmitted) { setVerificationStep('BUSINESS'); setIsVerificationModalOpen(true); } }}
                    className={`flex items-center gap-2 text-xs font-semibold transition-colors ${verificationProgress?.businessSubmitted ? 'text-green-700 cursor-default' : 'text-gray-500 hover:text-brand-primary cursor-pointer'}`}
                  >
                    {verificationProgress?.businessSubmitted ? (
                      <CheckCircle2 size={14} className="text-green-500" /> 
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 ml-[1px] hover:border-brand-primary transition-colors"></div> 
                    )}
                    {verificationProgress?.businessSubmitted ? 'Business information submitted' : 'Business details not verified'}
                  </div>
                </div>
              </div>
            </section>
            
            {/* BUYER TRUST METRICS */}
            <section className={cardTrust}>
              <h3 className={premiumHeader}><Activity size={16} className="text-blue-500" /> Platform Trust & Activity</h3>
              
              {loadingActivity ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                  <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-2xl font-black text-gray-900">{activity.reqs}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Requirements</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-2xl font-black text-gray-900">{activity.offers}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Offers Sent</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8FBFA] border border-[#E3EFE8] rounded-xl p-4">
                    <h4 className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-3">Payment Reliability</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-sm font-bold text-gray-900">{activity.completedTxs} Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-sm font-bold text-gray-900">{activity.pendingPayments} Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* PLATFORM TRANSACTION HISTORY */}
        <section className={cardHistory}>
          <div className="flex justify-between items-center mb-6 border-b border-[#EBE7DD]/50 pb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 m-0"><FileText size={16} className="text-brand-primary" /> Platform Transaction History</h3>
          </div>
          
          {loadingActivity ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-12 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-bold">Transaction ID</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Crop & Qty</th>
                    <th className="pb-3 font-bold">Price</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-gray-900">{tx.id}</span>
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-1 bg-amber-50 px-1.5 py-0.5 rounded w-max">DEMO</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-medium text-gray-600">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{tx.crop || 'Crop'}</span>
                          <span className="text-xs text-gray-500">{tx.quantityKg?.toLocaleString() || 0} kg</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                          <IndianRupee size={12} className="text-gray-400" />
                          {tx.agreedPricePerQ?.toLocaleString() || 0}/q
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {tx.status}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${tx.payment?.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {tx.payment?.status === 'RECEIVED' ? 'PAYMENT RECEIVED' : 'PAYMENT PENDING'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldAlert size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">No transaction history available.</p>
              <p className="text-xs text-gray-400 mt-1">Complete trades on the platform to build your transaction record.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
