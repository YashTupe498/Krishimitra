import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, MapPin, Package, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Lot } from '../../types/lot';
import { useAuth } from '../../app/providers/AuthProvider';
import { farmerLotsApi } from '../../services/farmerLotsApi';

type Step = 1 | 2 | 3;

interface DraftLot {
  crop: string;
  quantity: string;
  unit: string;
  availabilityDate: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  paymentRequirement: string;
  transportCapability: string;
  storageCapability: string;
}

const defaultDraft: DraftLot = {
  crop: '',
  quantity: '',
  unit: 'kg',
  availabilityDate: new Date().toISOString().split('T')[0],
  village: 'Nashik',
  taluka: 'Nashik Taluka',
  district: 'Nashik District',
  state: 'Maharashtra',
  paymentRequirement: 'Within 7 days',
  transportCapability: 'Can arrange transport',
  storageCapability: 'Can store produce'
};

interface CreateLotPageProps {
  mode?: 'create' | 'edit';
}

export const CreateLotPage: React.FC<CreateLotPageProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { session } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<DraftLot>(defaultDraft);
  const [initialDraft, setInitialDraft] = useState<DraftLot>(defaultDraft);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const token = session?.access_token;
      if (!token) return;
      farmerLotsApi.get(token, id).then((existingLot) => {
        const loadedDraft: DraftLot = {
          crop: existingLot.crop,
          quantity: existingLot.quantity.replace(/,/g, ''),
          unit: existingLot.unit,
          availabilityDate: existingLot.createdAt.split('T')[0],
          village: existingLot.village || '',
          taluka: existingLot.taluka || '',
          district: existingLot.district || '',
          state: existingLot.state || '',
          paymentRequirement: existingLot.constraints.paymentRequirement,
          transportCapability: existingLot.constraints.transportCapability,
          storageCapability: existingLot.constraints.storageCapability
        };
        setDraft(loadedDraft);
        setInitialDraft(loadedDraft);
      }).catch(() => navigate('/farmer/lots'));
    } else {
      const saved = localStorage.getItem('krishimitra_lot_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDraft({ ...defaultDraft, ...parsed.draft });
          setStep(parsed.step || 1);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [mode, id, navigate, session?.access_token]);

  const saveDraft = (currentDraft: DraftLot, currentStep: Step) => {
    if (mode === 'create') {
      localStorage.setItem('krishimitra_lot_draft', JSON.stringify({ draft: currentDraft, step: currentStep }));
    }
  };

  const updateDraft = (updates: Partial<DraftLot>) => {
    const newDraft = { ...draft, ...updates };
    setDraft(newDraft);
    saveDraft(newDraft, step);
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(draft) !== JSON.stringify(initialDraft);
  };

  const handleNext = () => {
    if (step < 3) {
      const nextStep = (step + 1) as Step;
      setStep(nextStep);
      saveDraft(draft, nextStep);
    } else {
      finishCreation();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = (step - 1) as Step;
      setStep(prevStep);
      saveDraft(draft, prevStep);
    } else {
      if (mode === 'edit' && hasUnsavedChanges()) {
        if (window.confirm('You have unsaved changes. Discard?')) {
          navigate(`/farmer/lots/${id}`);
        }
      } else if (mode === 'create') {
        handleSaveAndExit();
      } else {
        navigate(`/farmer/lots/${id}`);
      }
    }
  };

  const saveToBackend = async (lot: Lot, changes?: Partial<Lot>) => {
    const token = session?.access_token;
    if (!token) throw new Error('Your session has expired. Please sign in again.');
    const payload = {
      id: lot.id,
      crop: changes?.crop ?? lot.crop,
      quantity: changes?.quantity ?? lot.quantity,
      unit: changes?.unit ?? lot.unit,
      location: changes?.location ?? lot.location,
      village: changes?.village ?? lot.village,
      taluka: changes?.taluka ?? lot.taluka,
      district: changes?.district ?? lot.district,
      state: changes?.state ?? lot.state,
      status: changes?.status ?? lot.status,
      quality_grade: changes?.qualityGrade ?? lot.qualityGrade,
      constraints: changes?.constraints ?? lot.constraints,
    };
    if (changes) return farmerLotsApi.update(token, lot.id, payload);
    return farmerLotsApi.create(token, payload);
  };

  const handleSaveAndExit = async () => {
    if (mode === 'edit') {
      if (hasUnsavedChanges()) {
        if (window.confirm('You have unsaved changes. Discard?')) {
          navigate(`/farmer/lots/${id}`);
        }
      } else {
        navigate(`/farmer/lots/${id}`);
      }
    } else {
      // In create mode, if they started filling it out, save it as a DRAFT lot
      if (draft.crop || draft.quantity) {
        const newLot: Lot = {
          id: `lot-${Date.now()}`,
          farmerId: 'farmer-current',
          crop: draft.crop || 'Unknown',
          quantity: draft.quantity || '0',
          unit: draft.unit,
          location: `${draft.village}, ${draft.state}`,
          village: draft.village,
          taluka: draft.taluka,
          district: draft.district,
          state: draft.state,
          status: 'DRAFT',
          qualityGrade: null,
          qualityAssessment: null,
          constraints: {
            paymentRequirement: draft.paymentRequirement,
            transportCapability: draft.transportCapability,
            storageCapability: draft.storageCapability
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await saveToBackend(newLot);
        } catch (error) {
          window.alert(error instanceof Error ? error.message : 'The draft could not be saved.');
          return;
        }
        localStorage.removeItem('krishimitra_lot_draft');
      }
      navigate('/farmer/lots');
    }
  };

  const finishCreation = async () => {
    if (mode === 'edit' && id) {
      const token = session?.access_token;
      if (!token) {
        window.alert('Your session has expired. Please sign in again.');
        return;
      }
      const updates: Partial<Lot> = {
        crop: draft.crop,
        quantity: draft.quantity,
        unit: draft.unit,
        location: `${draft.village}, ${draft.state}`,
        village: draft.village,
        taluka: draft.taluka,
        district: draft.district,
        state: draft.state,
        status: 'QUALITY_PENDING',
        constraints: {
          paymentRequirement: draft.paymentRequirement,
          transportCapability: draft.transportCapability,
          storageCapability: draft.storageCapability
        }
      };
      try {
        await farmerLotsApi.update(token, id, {
          crop: updates.crop,
          quantity: updates.quantity,
          unit: updates.unit,
          location: updates.location,
          village: updates.village,
          taluka: updates.taluka,
          district: updates.district,
          state: updates.state,
          status: updates.status,
          constraints: updates.constraints,
        });
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'The lot could not be saved.');
        return;
      }
      // Small toast or notification could go here
      navigate(`/farmer/lots/${id}`);
    } else {
      const newLot: Lot = {
        id: `lot-${Date.now()}`,
        farmerId: 'farmer-current',
        crop: draft.crop,
        quantity: draft.quantity,
        unit: draft.unit,
        location: `${draft.village}, ${draft.state}`,
        village: draft.village,
        taluka: draft.taluka,
        district: draft.district,
        state: draft.state,
        status: 'QUALITY_PENDING',
        qualityGrade: null,
        qualityAssessment: null,
        constraints: {
          paymentRequirement: draft.paymentRequirement,
          transportCapability: draft.transportCapability,
          storageCapability: draft.storageCapability
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        const savedLot = await saveToBackend(newLot);
        localStorage.removeItem('krishimitra_lot_draft');
        navigate(`/farmer/lots/${savedLot.id}`);
        return;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'The lot could not be saved.');
        return;
      }
      localStorage.removeItem('krishimitra_lot_draft');
      navigate(`/farmer/lots/${newLot.id}`);
    }
  };

  const canProceedStep1 = draft.crop !== '' && draft.quantity !== '';

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} />
          {t('common.back', 'Back')}
        </button>
        <button
          onClick={handleSaveAndExit}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Save size={16} />
          {mode === 'edit' ? t('common.cancel', 'Cancel') : t('createLot.saveExit', 'Save & Exit')}
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          {mode === 'edit' ? t('createLot.editTitle', 'Edit Produce Lot') : t('createLot.title', 'Create a New Produce Lot')}
        </h1>
        <p className="text-gray-500 text-lg">Tell us about the produce you want to sell.</p>
      </div>

      {/* STEPPER */}
      <div className="mb-4">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Step {step} of 4</span>
      </div>
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="absolute left-0 top-1/2 h-0.5 bg-brand-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${(step - 1) * 33.33}%` }}></div>

        <div className="flex flex-col items-center gap-2 bg-gray-50/80 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-brand-primary text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
            <Package size={18} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Produce</span>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50/80 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-brand-primary text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
            <MapPin size={18} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Location</span>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50/80 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-brand-primary text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
            <Settings size={18} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Reqs</span>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50/80 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors bg-white border-2 border-gray-200 text-gray-400`}>
            <ShieldCheck size={18} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider text-gray-400`}>Quality</span>
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden">

        {/* STEP 1: PRODUCE */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('createLot.step1Title', 'What are you selling?')}</h2>
              <p className="text-gray-500">Select the crop you want to create a lot for.</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Crop</label>
                <select
                  className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-white"
                  value={draft.crop}
                  onChange={(e) => updateDraft({ crop: e.target.value })}
                >
                  <option value="" disabled>Select crop...</option>
                  <option value="Onion">Onion</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">How much produce do you have available?</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 5000"
                      className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium"
                      value={draft.quantity}
                      onChange={(e) => updateDraft({ quantity: e.target.value })}
                    />
                  </div>
                  <div className="sm:w-1/3">
                    <select
                      className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-white"
                      value={draft.unit}
                      onChange={(e) => updateDraft({ unit: e.target.value })}
                    >
                      <option value="kg">KG</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">When will this produce be available?</h3>
                <p className="text-sm text-gray-500 mb-3">This helps us find buyers and opportunities that match your timing.</p>
                <input
                  type="date"
                  className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium"
                  value={draft.availabilityDate}
                  onChange={(e) => updateDraft({ availabilityDate: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button variant="primary" className="w-full sm:w-auto px-8 font-bold flex items-center justify-center gap-2" onClick={handleNext} disabled={!canProceedStep1}>
                {t('common.continueLocation', 'Continue to Location')} <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('createLot.step2Title', 'Where is your produce?')}</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">Pre-filled from your farmer profile.</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Village / City</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-gray-50"
                    value={draft.village}
                    onChange={(e) => updateDraft({ village: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Taluka</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-gray-50"
                    value={draft.taluka}
                    onChange={(e) => updateDraft({ taluka: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">District</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-gray-50"
                    value={draft.district}
                    onChange={(e) => updateDraft({ district: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium bg-gray-50"
                    value={draft.state}
                    onChange={(e) => updateDraft({ state: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-4">
                <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  Buyers and logistics partners will use this location to calculate feasibility and transport costs.
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="secondary" className="px-6 font-bold flex items-center gap-2" onClick={handleBack}>
                <ArrowLeft size={18} /> {t('common.back', 'Back')}
              </Button>
              <Button variant="primary" className="px-8 font-bold flex items-center gap-2" onClick={handleNext}>
                {t('common.continue', 'Continue')} <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: REQUIREMENTS */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('createLot.step3Title', 'Your Selling Requirements')}</h2>

            <div className="space-y-8">

              {/* Payment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Payment Requirement</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Immediately', 'Within 3 days', 'Within 7 days', 'I can wait'].map(opt => (
                    <button
                      key={opt}
                      className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors ${draft.paymentRequirement === opt ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      onClick={() => updateDraft({ paymentRequirement: opt })}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${draft.paymentRequirement === opt ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                        {draft.paymentRequirement === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`font-medium ${draft.paymentRequirement === opt ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Transport Capability</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Can arrange transport', 'Need transport assistance', 'Cannot arrange transport'].map(opt => (
                    <button
                      key={opt}
                      className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-colors ${draft.transportCapability === opt ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      onClick={() => updateDraft({ transportCapability: opt })}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${draft.transportCapability === opt ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                        {draft.transportCapability === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`font-medium text-sm ${draft.transportCapability === opt ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Storage Capability</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Can store produce', 'Cannot store produce'].map(opt => (
                    <button
                      key={opt}
                      className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors ${draft.storageCapability === opt ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      onClick={() => updateDraft({ storageCapability: opt })}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${draft.storageCapability === opt ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                        {draft.storageCapability === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`font-medium ${draft.storageCapability === opt ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between">
              <Button variant="secondary" className="px-6 font-bold flex items-center gap-2" onClick={handleBack}>
                <ArrowLeft size={18} /> {t('common.back', 'Back')}
              </Button>
              <Button variant="primary" className="px-8 font-bold flex items-center gap-2" onClick={handleNext}>
                {mode === 'edit' ? t('common.saveChanges', 'Save Changes') : t('createLot.finish', 'Save Lot')} <CheckCircle2 size={18} />
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
};
