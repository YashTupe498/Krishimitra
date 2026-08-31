import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { 
  UserCircle, MapPin, ShieldCheck, Camera, Image as ImageIcon, CheckCircle2,
  BadgeCheck, Info
} from 'lucide-react';
import farmerDefaultAvatar from '../../assets/farmer-default-avatar.png';
import { profileApi } from '../../services/profileApi';

// Premium styling constants from previous pages for visual consistency
const premiumCard = "bg-gradient-to-br from-[#FFFEFA] to-[#F9F8F3] border border-[#EBE7DD] shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_4px_24px_rgba(40,35,20,0.04)] rounded-[20px] p-6 md:p-8 transition-all duration-500 hover:border-brand-primary/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_12px_40px_rgba(23,77,56,0.08)] relative";
const premiumHeader = "text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-[#EBE7DD]/50 pb-4";
const inputClass = "w-full appearance-none pl-4 pr-4 py-3 bg-white border border-[#EBE7DD] hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5";

interface LocalProfileOverrides {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  avatar_type?: 'default' | 'uploaded';
}

export const FarmerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<LocalProfileOverrides>({});
  
  // Form State
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: ''
  });

  // Persisted profile values are owned by the API, not browser storage.
  useEffect(() => {
    if (user?.id) {
      profileApi.getMine()
        .then((saved) => setLocalOverrides({ full_name: saved.full_name, phone: saved.phone ?? undefined, avatar_url: saved.avatar_url ?? undefined, avatar_type: saved.avatar_url ? 'uploaded' : 'default' }))
        .catch(() => setLocalOverrides({}));
    }
  }, [user?.id]);

  // Sync form with merged data when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditForm({
        full_name: localOverrides.full_name ?? profile?.full_name ?? '',
        phone: localOverrides.phone ?? profile?.phone ?? ''
      });
    }
  }, [isEditing, profile, localOverrides]);

  // Derived values for display
  const displayData = {
    full_name: localOverrides.full_name ?? profile?.full_name ?? t('profile.farmer'),
    phone: localOverrides.phone ?? profile?.phone ?? t('profile.notProvided'),
    email: user?.email ?? t("profilePage.notProvided"),
    location: profile?.district && profile?.state ? `${profile.district}, ${profile.state}` : t("profilePage.notProvided"),
    role: profile?.account_type === 'FPO' ? t('profile.fpoMember') : t('profile.farmer'),
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : t('profile.unknown'),
    avatar_url: localOverrides.avatar_type === 'uploaded' && localOverrides.avatar_url ? localOverrides.avatar_url : farmerDefaultAvatar,
    avatar_type: localOverrides.avatar_type ?? 'default'
  };

  const handleSave = async () => {
    if (!editForm.full_name.trim()) {
      alert(t('profile.notProvided'));
      return;
    }
    
    setIsSaving(true);
    try {
      const saved = await profileApi.updateMine({ full_name: editForm.full_name, phone: editForm.phone });
      const newOverrides = { ...localOverrides, full_name: saved.full_name, phone: saved.phone ?? undefined };
      setLocalOverrides(newOverrides);
      setIsEditing(false);
      setToastMessage(t('profile.saveChanges'));
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : t('profile.notProvided'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(t("profilePage.invalidImage"));
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t("profilePage.imageTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      try {
        const saved = await profileApi.updateMine({ avatar_url: result });
        setLocalOverrides({ ...localOverrides, avatar_url: saved.avatar_url ?? undefined, avatar_type: 'uploaded' });
        setToastMessage(t("profilePage.photoUpdated"));
        setTimeout(() => setToastMessage(null), 3000);
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : t("profilePage.invalidImage"));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseDefaultAvatar = async () => {
    try {
      await profileApi.updateMine({ avatar_url: null });
      setLocalOverrides({ ...localOverrides, avatar_url: undefined, avatar_type: 'default' });
      setToastMessage(t("profilePage.restoredDefault"));
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : t("profilePage.invalidImage"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-[#F5F8F5] -m-4 md:-m-8 p-4 md:p-8 animate-in fade-in duration-500 font-sans text-gray-900 relative overflow-hidden z-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 size={18} className="text-brand-primary" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto pb-24 flex flex-col space-y-6 relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 mb-2">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">{t('profile.title')}</h1>
            <p className="text-sm text-gray-500 font-medium">{t('profile.subtitle')}</p>
          </div>
          <div className="shrink-0">
            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>{t('profile.cancel')}</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? t('profile.saving') : t('profile.saveChanges')}</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>{t('profile.editProfile')}</Button>
            )}
          </div>
        </header>

        {/* HERO SECTION */}
        <section className={`${premiumCard} overflow-visible`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar container */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-[#F5F8F5] border-4 border-white shadow-lg relative">
                <img 
                  src={displayData.avatar_url} 
                  alt="Farmer profile" 
                  className="w-full h-full object-cover"
                />
                
                {/* Subtle label for default avatar */}
                {displayData.avatar_type === 'default' && (
                  <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-sm py-1 flex justify-center">
                    <span className="text-[9px] text-white font-bold tracking-widest uppercase">{t('profile.default')}</span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <Camera className="text-white w-6 h-6 mb-1" />
                   <span className="text-[9px] text-white font-bold tracking-widest uppercase">{t('profile.upload')}</span>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
              />
            </div>
            
            {/* Details */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 flex-1">
              <div className="flex items-center gap-2 mb-1 relative">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{displayData.full_name}</h2>
                
                {/* Badge & Tooltip Wrapper */}
                <div className="relative group cursor-help flex items-center">
                  <div className="bg-blue-50 text-blue-600 rounded-full p-1 flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <BadgeCheck size={20} className="fill-blue-100 text-blue-600" />
                  </div>
                  
                  {/* Verified Badge Tooltip */}
                  <div className="absolute left-1/2 md:left-0 top-full mt-2 -translate-x-1/2 md:translate-x-0 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-gray-700">
                    <div className="flex items-start gap-2 mb-1.5">
                      <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                      <span className="font-bold text-sm">{t('profile.verifiedTooltip')}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{t('profile.verifiedDesc')}</p>
                    
                    {/* Tooltip Triangle */}
                    <div className="absolute top-[-4px] left-1/2 md:left-4 -translate-x-1/2 w-2 h-2 bg-gray-900 border-t border-l border-gray-700 rotate-45"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm font-semibold text-gray-600 mb-6 mt-1">
                <span className="bg-[#EAF6EF] text-brand-deep px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border border-brand-primary/20">
                  {displayData.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  {displayData.location}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="bg-white hover:bg-gray-50 border-gray-200 py-1.5 px-3 text-sm h-auto">
                  <ImageIcon size={14} className="mr-2 text-gray-500" /> {t('profile.changePhoto')}
                </Button>
                {displayData.avatar_type === 'uploaded' && (
                  <Button variant="secondary" onClick={handleUseDefaultAvatar} className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 py-1.5 px-3 text-sm h-auto">
                    <UserCircle size={14} className="mr-2 text-gray-400" /> {t('profile.useDefaultAvatar')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* INFO CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PERSONAL INFO */}
          <section className={premiumCard}>
            <h3 className={premiumHeader}><UserCircle size={16} className="text-brand-primary" /> {t('profile.personalInformation')}</h3>
            
            <div className="space-y-6">
              <div>
                <label className={labelClass}>{t('profile.fullName')}</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.full_name}
                    onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                    className={inputClass}
                    placeholder={t("profilePage.enterFullName")}
                  />
                ) : (
                  <p className="text-base font-bold text-gray-900">{displayData.full_name}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>{t('profile.phoneNumber')}</label>
                {isEditing ? (
                  <input 
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className={inputClass}
                    placeholder={t("profilePage.enterPhone")}
                  />
                ) : (
                  <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                    {displayData.phone}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>{t('profile.emailAddress')}</label>
                <div className="relative">
                  <p className="text-base font-bold text-gray-500 flex items-center gap-2">
                    {displayData.email}
                  </p>
                  {isEditing && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t('profile.emailCannotBeChanged')}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            {/* FARM INFORMATION */}
            <section className={premiumCard}>
              <h3 className={premiumHeader}><MapPin size={16} className="text-brand-primary" /> {t('profile.farmInformation')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>{t('profile.location')}</label>
                  <p className="text-base font-bold text-gray-900">{displayData.location}</p>
                  {isEditing && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t('profile.contactSupport')}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ACCOUNT INFORMATION */}
            <section className={premiumCard}>
              <h3 className={premiumHeader}><ShieldCheck size={16} className="text-brand-primary" /> {t('profile.accountInformation')}</h3>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>{t('profile.accountType')}</label>
                  <p className="text-sm font-bold text-gray-900">{displayData.role}</p>
                </div>
                <div>
                  <label className={labelClass}>{t('profile.memberSince')}</label>
                  <p className="text-sm font-bold text-gray-900">{displayData.memberSince}</p>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('profile.accountStatus')}</label>
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile.active')}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
};
