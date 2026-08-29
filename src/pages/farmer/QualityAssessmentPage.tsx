import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Upload, CheckCircle2, 
  X, Info, ArrowRight, ShieldCheck, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ImageViewer } from '../../components/ui/ImageViewer';
import { mockLots, lotStore } from '../../data/mockLots';
import type { QualityAssessmentResponse } from '../../types/lot';
import { useAuth } from '../../app/providers/AuthProvider';
import { qualityService } from '../../services/supabase/quality';

type Mode = 'UPLOAD' | 'ASSESSING' | 'RESULT' | 'UNKNOWN';

export const QualityAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const lot = id ? mockLots[id] : null;

  const [mode, setMode] = useState<Mode>('UPLOAD');
  const [images, setImages] = useState<(File | null)[]>([null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null]);
  const [result, setResult] = useState<QualityAssessmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ImageViewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerGrade, setViewerGrade] = useState<'A' | 'B' | 'C'>('A');

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(p => {
        if (p) URL.revokeObjectURL(p);
      });
    };
  }, []); // Intentionally empty to just clean on unmount, but let's be careful. Actually, it's safer to just handle it in removeImage.

  if (!lot) {
    return <div className="p-8 text-center text-gray-500">Lot not found</div>;
  }

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
      
      const newPreviews = [...previews];
      if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
      newPreviews[index] = URL.createObjectURL(file);
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    
    const newPreviews = [...previews];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newPreviews[index] = null;
    setPreviews(newPreviews);
    
    // Reset file input
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = '';
    }
  };

  const assessImages = async () => {
    const uploadedFiles = images.filter(img => img !== null) as File[];
    if (uploadedFiles.length === 0) return;
    
    setMode('ASSESSING');
    setError(null);

    try {
      const assessmentResult = await qualityService.assessProduce(
        user?.id || 'unknown-farmer',
        lot.id,
        lot.crop,
        uploadedFiles
      );

      setResult(assessmentResult);
      lotStore.update(lot.id, {
        qualityGrade: assessmentResult.grade,
        status: 'MARKET_ANALYSIS_READY',
        qualityAssessment: assessmentResult
      });
      setMode('RESULT');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setMode('UPLOAD');
    }
  };

  const openReference = (grade: 'A' | 'B' | 'C', index: number) => {
    setViewerGrade(grade);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const resetFlow = () => {
    setMode('UPLOAD');
    setImages([null, null]);
    const oldPreviews = [...previews];
    setPreviews([null, null]);
    oldPreviews.forEach(p => { if (p) URL.revokeObjectURL(p); });
    setResult(null);
  };

  const currentCrop = lot?.crop.toLowerCase() || 'onion';

  const qualityReferences: Record<string, Record<'A'|'B'|'C', { src: string, alt: string, title: string }[]>> = {
    onion: {
      A: [
        { src: '/assets/quality/onion/grade-a/onion-grade-a-01.jpg', alt: 'Grade A Onion Reference 1', title: 'Grade A Reference — Image 1' },
        { src: '/assets/quality/onion/grade-a/onion-grade-a-02.jpg', alt: 'Grade A Onion Reference 2', title: 'Grade A Reference — Image 2' }
      ],
      B: [
        { src: '/assets/quality/onion/grade-b/onion-grade-b-01.jpg', alt: 'Grade B Onion Reference 1', title: 'Grade B Reference — Image 1' },
        { src: '/assets/quality/onion/grade-b/onion-grade-b-02.jpg', alt: 'Grade B Onion Reference 2', title: 'Grade B Reference — Image 2' }
      ],
      C: [
        { src: '/assets/quality/onion/grade-c/onion-grade-c-01.jpg', alt: 'Grade C Onion Reference 1', title: 'Grade C Reference — Image 1' },
        { src: '/assets/quality/onion/grade-c/onion-grade-c-02.jpg', alt: 'Grade C Onion Reference 2', title: 'Grade C Reference — Image 2' }
      ]
    },
    potato: {
      A: [
        { src: '/assets/quality/potato/grade-a/potato-grade-a-01.jpg', alt: 'Grade A Potato Reference 1', title: 'Grade A Potato Reference — Image 1' },
        { src: '/assets/quality/potato/grade-a/potato-grade-a-02.jpg', alt: 'Grade A Potato Reference 2', title: 'Grade A Potato Reference — Image 2' }
      ],
      B: [
        { src: '/assets/quality/potato/grade-b/potato-grade-b-01.jpg', alt: 'Grade B Potato Reference 1', title: 'Grade B Potato Reference — Image 1' },
        { src: '/assets/quality/potato/grade-b/potato-grade-b-02.jpg', alt: 'Grade B Potato Reference 2', title: 'Grade B Potato Reference — Image 2' }
      ],
      C: [
        { src: '/assets/quality/potato/grade-c/potato-grade-c-01.jpg', alt: 'Grade C Potato Reference 1', title: 'Grade C Potato Reference — Image 1' },
        { src: '/assets/quality/potato/grade-c/potato-grade-c-02.jpg', alt: 'Grade C Potato Reference 2', title: 'Grade C Potato Reference — Image 2' }
      ]
    }
  };

  const cropDescriptions: Record<string, Record<'A'|'B'|'C', string>> = {
    onion: {
      A: "Better overall appearance, relatively uniform size, minimal visible defects.",
      B: "Standard acceptable quality, with some size variation or minor visible defects.",
      C: "Higher visible defects or quality issues that may limit some selling opportunities."
    },
    potato: {
      A: "Better overall appearance, relatively uniform size and shape, with minimal visible defects.",
      B: "Generally acceptable quality, with moderate variation in size/shape and some minor visible defects.",
      C: "More prominent visible defects, greater variation, and quality issues that may reduce suitable selling opportunities."
    }
  };

  const activeViewerImages = qualityReferences[currentCrop]?.[viewerGrade as 'A'|'B'|'C'] || [];

  const hasAnyImage = images.some(img => img !== null);

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      
      <ImageViewer 
        images={activeViewerImages}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        initialIndex={viewerIndex}
      />

      <div className="mb-6">
        <button 
          onClick={() => navigate(`/farmer/lots/${lot.id}`)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} />
          {t('quality.backToLot', 'Back to Lot Details')}
        </button>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{t('quality.headerTag', 'Quality Assessment')}</h1>
          <p className="text-gray-500 font-medium mt-1">
            {t(`data.crops.${lot.crop}`, lot.crop)} • {lot.quantity} {lot.unit} • {lot.location}
          </p>
        </div>
      </div>

      {lot.status !== 'DRAFT' && mode === 'UPLOAD' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3 mb-8">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">
              {lot.qualityGrade ? `${t('quality.currentGrade', 'Current Grade')}: Grade ${lot.qualityGrade}` : 'ℹ Quality not assessed'}
            </p>
            {!lot.qualityGrade && (
              <p className="text-xs text-blue-800/80 leading-relaxed max-w-2xl">
                Upload produce photos to begin assessment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* PRIMARY UPLOAD / ASSESS FLOW */}
      <Card className="p-6 md:p-8 bg-white border border-gray-200 shadow-sm mb-10">
        
        {mode === 'UPLOAD' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
              {t('quality.uploadPhotosTitle', 'Upload Produce Photos')}
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-6">
              {t('quality.uploadPhotosDesc', 'Add 1–2 clear photos of your produce for assessment.')}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[0, 1].map(index => (
                <div key={index} className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Photo {index + 1} {index === 1 && '(Optional)'}
                  </span>
                  
                  {previews[index] ? (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img src={previews[index]!} alt={`Produce ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button variant="secondary" className="bg-white/90 hover:bg-white text-gray-900 px-4 shadow-sm" onClick={() => fileInputRefs[index].current?.click()}>
                          {t('common.replace', 'Replace')}
                        </Button>
                        <button 
                          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center shadow-sm" 
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary/50 bg-gray-50 hover:bg-brand-primary/5 transition-colors flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-brand-primary group"
                      onClick={() => fileInputRefs[index].current?.click()}
                    >
                      <Upload size={32} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                      <span className="font-bold">{t('quality.addPhoto', 'Add Photo')}</span>
                    </button>
                  )}
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRefs[index]} 
                    onChange={(e) => handleImageUpload(index, e)} 
                  />
                </div>
              ))}
            </div>

            <Button 
              variant="primary" 
              className="w-full md:w-auto px-10 py-3.5 text-base font-bold shadow-sm flex items-center justify-center mx-auto"
              disabled={!hasAnyImage}
              onClick={assessImages}
            >
              {t('quality.assessProduce', 'Assess Produce')}
            </Button>
          </div>
        )}

        {mode === 'ASSESSING' && (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <Loader2 size={48} className="text-brand-primary animate-spin mb-6" />
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
              {t('quality.assessing', 'Assessing your produce...')}
            </h2>
            <p className="text-gray-500 font-medium">
              {t('quality.assessingDesc', 'Checking the configured reference examples')}
            </p>
          </div>
        )}

        {mode === 'UNKNOWN' && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Reference Match Found</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
              {t('quality.unknownImageDesc', 'Prototype assessment is currently available for configured reference examples.')}
            </p>
            <Button variant="primary" onClick={resetFlow} className="font-bold px-8">
              {t('quality.tryAnother', 'Try Another Photo')}
            </Button>
          </div>
        )}

        {mode === 'RESULT' && result && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
            
            <div className="border border-green-500 bg-white rounded-2xl shadow-md overflow-hidden relative">
              <div className="bg-green-50 p-4 border-b border-green-100 flex items-center justify-center gap-2 text-green-800">
                <CheckCircle2 size={20} />
                <span className="font-bold text-sm tracking-wide uppercase">Assessment Complete</span>
              </div>
              
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <h2 className="text-5xl font-display font-black text-gray-900 mb-3">GRADE {result.grade}</h2>
                <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                  Prototype Reference Category
                </div>
              </div>
            </div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Why This Grade?</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              {currentCrop === 'potato' && result.grade === 'A' ? (
                <div className="mb-6 text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-800 font-medium mb-3">
                    Your potatoes appear suitable for Grade A because they have:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 font-medium">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Relatively uniform size and shape
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Good overall appearance
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Clean-looking surface
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Limited visible damage or defects
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      No major visible rot or severe blemishes in the reference view
                    </li>
                  </ul>
                </div>
              ) : currentCrop === 'potato' && result.grade === 'B' ? (
                <div className="mb-6 text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-800 font-medium mb-3">
                    These potatoes are suitable for Grade B because they generally have an acceptable appearance, but show some visible variation in size, shape and surface condition.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 font-medium mt-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Moderate variation in size and shape
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Some soil marks or surface blemishes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Minor scuffs or marks
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Generally intact potatoes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      No widespread severe damage visible in the reference images
                    </li>
                  </ul>
                </div>
              ) : currentCrop === 'potato' && result.grade === 'C' ? (
                <div className="mb-6 text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-800 font-medium mb-3">
                    These potatoes fall closer to Grade C because the images show more visible surface defects and greater variation in appearance. Some potatoes may have damage or quality issues that can reduce suitable selling opportunities.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 font-medium mt-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Significant variation in size and shape
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      More visible surface blemishes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Dark spots, scarring or rough patches
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Cracks or damaged areas on some potatoes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Some greenish/discolored areas may be visible
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Greater overall variation compared with Grade A and Grade B
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                      Some produce may require sorting before sale
                    </li>
                  </ul>
                </div>
              ) : (
                <p className="text-base text-gray-800 font-medium leading-relaxed mb-6">
                  Your image matches one of the Grade {result.grade} reference examples currently configured for this prototype.
                </p>
              )}

              {previews.some(p => p !== null) && (
                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="text-center w-full max-w-[220px]">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Photo</p>
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white">
                        <img src={previews.find(p => p !== null)!} alt="Your uploaded crop" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    <div className="text-gray-300 flex-shrink-0">
                      <ArrowRight size={32} className="hidden md:block" />
                      <ArrowDownIcon className="md:hidden w-8 h-8" />
                    </div>
                    
                    <div className="text-center w-full max-w-[220px]">
                      <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={14}/> Reference Match
                      </p>
                      <button 
                        onClick={() => openReference(result.grade as 'A'|'B'|'C', 0)}
                        className="w-full aspect-square rounded-xl overflow-hidden border-2 border-brand-primary/50 hover:border-brand-primary shadow-sm relative group transition-colors block cursor-pointer"
                        title="Click to view reference image"
                      >
                        <img 
                          src={qualityReferences[currentCrop]?.[result.grade as 'A'|'B'|'C']?.[0]?.src || ''} 
                          alt={`Grade ${result.grade} Reference`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-colors flex items-center justify-center">
                          <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm">
                            Tap to view
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-3">
              <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Assessment Mode: Prototype Reference Assessment</p>
                <p className="text-xs text-blue-800/80 leading-relaxed max-w-2xl">
                  This prototype currently uses configured reference examples for demonstration. A future production version can connect this interface to a trained quality-assessment model.
                </p>
              </div>
            </section>

            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
              <Button variant="ghost" onClick={resetFlow} className="w-full md:w-auto font-bold">
                Assess Again
              </Button>
              <Button variant="primary" className="w-full md:w-auto px-8 font-bold shadow-sm flex items-center justify-center gap-2" onClick={() => navigate(`/farmer/lots/${lot.id}`)}>
                {t('quality.continueToMarket', 'Continue to Market Analysis')} <ArrowRight size={18} />
              </Button>
            </div>
            
          </div>
        )}
      </Card>

      {/* REFERENCE GRADES SECTION */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-6 font-display">{t('quality.understandGrades', 'Understand the Grades')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Grade A */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm hover:border-brand-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center shrink-0">A</div>
              <h3 className="font-bold text-gray-900 text-lg">GRADE A</h3>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
              {cropDescriptions[currentCrop]?.A || cropDescriptions.onion.A}
            </p>
            
            <div className="bg-gray-50 -mx-6 -mb-6 p-6 border-t border-gray-100">
              {qualityReferences[currentCrop]?.A?.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Compare your produce</p>
                  <div className="flex gap-3 mb-3">
                    <button 
                      onClick={() => openReference('A', 0)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].A[0].src} alt={qualityReferences[currentCrop].A[0].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                    <button 
                      onClick={() => openReference('A', 1)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].A[1].src} alt={qualityReferences[currentCrop].A[1].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-center">Tap images to zoom & compare</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[140px] text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Reference images<br/>coming soon
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Grade B */}
          <Card className={`p-6 bg-white border border-gray-200 shadow-sm transition-colors ${qualityReferences[currentCrop]?.B?.length > 0 ? 'hover:border-brand-primary/30' : 'opacity-90'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center shrink-0">B</div>
              <h3 className="font-bold text-gray-900 text-lg">GRADE B</h3>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
              {cropDescriptions[currentCrop]?.B || cropDescriptions.onion.B}
            </p>
            
            <div className="bg-gray-50 -mx-6 -mb-6 p-6 border-t border-gray-100">
              {qualityReferences[currentCrop]?.B?.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Compare your produce</p>
                  <div className="flex gap-3 mb-3">
                    <button 
                      onClick={() => openReference('B', 0)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].B[0].src} alt={qualityReferences[currentCrop].B[0].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                    <button 
                      onClick={() => openReference('B', 1)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].B[1].src} alt={qualityReferences[currentCrop].B[1].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-center">Tap images to zoom & compare</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[140px] text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Reference images<br/>coming soon
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Grade C */}
          <Card className={`p-6 bg-white border border-gray-200 shadow-sm transition-colors ${qualityReferences[currentCrop]?.C?.length > 0 ? 'hover:border-brand-primary/30 opacity-100' : 'opacity-90'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center shrink-0">C</div>
              <h3 className="font-bold text-gray-900 text-lg">GRADE C</h3>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
              {cropDescriptions[currentCrop]?.C || cropDescriptions.onion.C}
            </p>
            
            <div className="bg-gray-50 -mx-6 -mb-6 p-6 border-t border-gray-100">
              {qualityReferences[currentCrop]?.C?.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Compare your produce</p>
                  <div className="flex gap-3 mb-3">
                    <button 
                      onClick={() => openReference('C', 0)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].C[0].src} alt={qualityReferences[currentCrop].C[0].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                    <button 
                      onClick={() => openReference('C', 1)}
                      className="w-1/2 aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary relative group"
                    >
                      <img src={qualityReferences[currentCrop].C[1].src} alt={qualityReferences[currentCrop].C[1].alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-center">Tap images to zoom & compare</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[140px] text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Reference images<br/>coming soon
                  </p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </section>

    </div>
  );
};

// Helper component
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
