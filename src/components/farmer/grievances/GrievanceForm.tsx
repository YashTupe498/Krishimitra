import React, { useState } from 'react';
import { ChevronLeft, Mic, Upload, Bot, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { GrievanceCategory, GrievancePriority } from '../../../types/grievance';
import { IssueCategories } from './IssueCategories';
import { grievanceDemoService } from '../../../services/grievanceDemoService';

interface GrievanceFormProps {
  onCancel: () => void;
  onSuccess: (grievanceId: string) => void;
  userId: string;
}

export const GrievanceForm: React.FC<GrievanceFormProps> = ({ onCancel, onSuccess, userId }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [category, setCategory] = useState<GrievanceCategory | null>(null);
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<File[]>([]);
  
  // AI State
  const [priority, setPriority] = useState<GrievancePriority>('LOW');
  const [classificationSummary, setClassificationSummary] = useState('');
  const [classificationReasons, setClassificationReasons] = useState<string[]>([]);
  
  const handleCategorySelect = (selected: GrievanceCategory) => {
    setCategory(selected);
    setStep(2);
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => {
    if (step === 1) onCancel();
    else setStep(s => s - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEvidence(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  // Simulate AI Assessment
  const runAssessment = () => {
    setStep(5);
    
    // Deterministic simulation
    if (category === 'BUYER' || category === 'PAYMENT') {
      setPriority('HIGH');
      setClassificationSummary('Payment remains pending or buyer dispute reported.');
      setClassificationReasons([
        'Payment/Buyer dispute identified',
        'Transaction amount requires protection',
        'Impacts immediate farmer liquidity'
      ]);
    } else if (category === 'LOGISTICS' || category === 'GOVERNMENT_SCHEME') {
      setPriority('MEDIUM');
      setClassificationSummary('Administrative delay or logistics issue reported.');
      setClassificationReasons([
        'Service delay confirmed',
        'Does not pose immediate crop loss risk'
      ]);
    } else if (category === 'CROP' || category === 'PEST_DISEASE') {
      setPriority('HIGH');
      setClassificationSummary('Crop damage or disease reported requiring urgent action.');
      setClassificationReasons([
        'Immediate risk to yield',
        'Time-sensitive intervention required'
      ]);
    } else {
      setPriority('LOW');
      setClassificationSummary('General information or minor issue reported.');
      setClassificationReasons([
        'No immediate financial risk identified',
        'Standard processing timeline applies'
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!category) return;
    setIsSubmitting(true);
    
    try {
      const newGrievance = await grievanceDemoService.createGrievance({
        category,
        title: `${formatCategory(category)} Issue`,
        description,
        priority,
        status: 'SUBMITTED',
        farmerId: userId,
        location: 'Nashik District, Maharashtra', // Demo hardcode
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evidence: evidence.map(f => f.name),
        classificationSummary,
        classificationReasons,
        details,
        timeline: [
          {
            status: 'SUBMITTED',
            title: 'Submitted',
            description: 'Grievance has been submitted to KrishiMitra Demo.',
            timestamp: new Date().toISOString(),
            state: 'CURRENT'
          },
          {
            status: 'REGISTERED',
            title: 'Registered',
            description: 'Pending registration.',
            timestamp: '',
            state: 'PENDING'
          }
        ],
        resolutionGuidance: {
          whatHappened: `You reported a ${formatCategory(category)} issue.`,
          why: "Our system has received the initial report and is organizing the data.",
          whatToDo: "Keep any physical evidence securely stored.",
          recommendedAction: "Wait for the grievance to be registered and assigned.",
        }
      }, userId);
      
      setStep(7); // Success step
      // Auto redirect after showing success
      setTimeout(() => {
        onSuccess(newGrievance.id);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       {step < 7 && (
         <div className="flex items-center gap-4 mb-8">
           <Button variant="ghost" onClick={handleBack} className="text-gray-500 hover:bg-gray-100 p-2">
             <ChevronLeft size={20} />
           </Button>
           <div className="flex-1">
             <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
               <span>Step {step} of 6</span>
               <span>{step === 1 ? 'Category' : step === 2 ? 'Description' : step === 3 ? 'Details' : step === 4 ? 'Evidence' : step === 5 ? 'Assessment' : 'Review'}</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-1.5">
               <div className="bg-green-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }}></div>
             </div>
           </div>
         </div>
       )}

       {/* STEP 1 */}
       {step === 1 && (
         <IssueCategories onSelectCategory={handleCategorySelect} />
       )}

       {/* STEP 2 */}
       {step === 2 && (
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <h2 className="text-xl font-bold text-gray-900 mb-2">Tell us what happened.</h2>
           <p className="text-sm text-gray-500 mb-6">Describe your problem in your own words. The more detail you provide, the better we can help.</p>
           
           <textarea 
             className="w-full border border-gray-200 rounded-xl p-4 min-h-[150px] focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 mb-4 text-sm resize-none"
             placeholder="Describe your problem in your own words..."
             value={description}
             onChange={e => setDescription(e.target.value)}
           ></textarea>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <Button variant="secondary" className="w-full sm:w-auto border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2" onClick={() => alert('Voice assistance is currently unavailable in demo')}>
               <Mic size={16} /> Speak instead
             </Button>
             <Button className="w-full sm:w-auto bg-[#194D2E] hover:bg-[#143d24] text-white px-8" onClick={handleNext} disabled={!description.trim()}>
               Continue
             </Button>
           </div>
         </div>
       )}

       {/* STEP 3 */}
       {step === 3 && (
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Information</h2>
           <p className="text-sm text-gray-500 mb-6">Please provide a few more details to help us classify your {formatCategory(category!)} issue.</p>
           
           <div className="space-y-4">
              {getDynamicFields(category!).map(field => (
                <div key={field.id}>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{field.label}</label>
                  <input 
                    type={field.type || 'text'}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder={field.placeholder}
                    value={details[field.id] || ''}
                    onChange={e => setDetails({ ...details, [field.id]: e.target.value })}
                  />
                </div>
              ))}
           </div>

           <div className="mt-8 flex justify-end">
             <Button className="w-full sm:w-auto bg-[#194D2E] hover:bg-[#143d24] text-white px-8" onClick={handleNext}>
               Continue
             </Button>
           </div>
         </div>
       )}

       {/* STEP 4 */}
       {step === 4 && (
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <h2 className="text-xl font-bold text-gray-900 mb-2">Add supporting evidence</h2>
           <p className="text-sm text-gray-500 mb-6">Upload invoices, receipts, photos, or documents to support your grievance.</p>
           
           <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
              <Upload size={32} className="text-gray-300 mb-4" />
              <p className="text-sm font-bold text-gray-900 mb-1">Drag & drop or browse</p>
              <p className="text-xs text-gray-500 mb-4">JPG, PNG, PDF</p>
              
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <Button variant="secondary" className="border-gray-200" onClick={() => document.getElementById('file-upload')?.click()}>
                Choose File
              </Button>
           </div>

           {evidence.length > 0 && (
             <div className="mt-6 space-y-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Attached Files</span>
               {evidence.map((file, idx) => (
                 <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <FileText size={16} className="text-gray-400 shrink-0" />
                       <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button className="text-red-500 text-xs font-bold hover:underline" onClick={() => removeFile(idx)}>Remove</button>
                 </div>
               ))}
             </div>
           )}

           <div className="mt-8 flex justify-end">
             <Button className="w-full sm:w-auto bg-[#194D2E] hover:bg-[#143d24] text-white px-8" onClick={runAssessment}>
               Generate AI Assessment
             </Button>
           </div>
         </div>
       )}

       {/* STEP 5 */}
       {step === 5 && (
         <div className="bg-[#F4F9F5] rounded-2xl p-6 md:p-8 shadow-sm border border-[#C3D9CB] animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#D8E2DB] shadow-sm">
               <Bot size={20} className="text-[#194D2E]" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900">AI-Assisted Assessment</h2>
               <span className="text-xs font-bold text-green-700 uppercase tracking-widest block mt-1">Classification Complete</span>
             </div>
           </div>

           <div className="bg-white rounded-xl p-6 border border-[#D8E2DB] mb-6 space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</span>
                   <span className="text-sm font-bold text-gray-900">{formatCategory(category!)}</span>
                 </div>
                 <div className="text-right">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Priority</span>
                   <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                     priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                     priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                     'bg-gray-50 text-gray-700 border-gray-200'
                   }`}>
                     {priority === 'HIGH' && <AlertTriangle size={12} />} {priority}
                   </span>
                 </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Issue Summary</span>
                 <p className="text-sm text-gray-700 font-medium">{classificationSummary}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-green-600" />
                 <span className="text-sm font-bold text-green-700">Information appears complete</span>
              </div>
           </div>

           <div className="flex justify-end">
             <Button className="w-full sm:w-auto bg-[#194D2E] hover:bg-[#143d24] text-white px-8" onClick={handleNext}>
               Review Grievance
             </Button>
           </div>
         </div>
       )}

       {/* STEP 6 */}
       {step === 6 && (
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <h2 className="text-xl font-bold text-gray-900 mb-6">Review your grievance</h2>
           
           <div className="space-y-6">
              <div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Description</span>
                 <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</span>
                   <span className="text-sm font-medium text-gray-900">{formatCategory(category!)}</span>
                 </div>
                 <div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Priority</span>
                   <span className="text-sm font-bold text-orange-600">{priority}</span>
                 </div>
                 
                 {Object.entries(details).map(([key, value]) => (
                    value ? (
                      <div key={key}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{formatKey(key)}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ) : null
                 ))}
                 
                 <div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Location</span>
                   <span className="text-sm font-medium text-gray-900">Nashik District, Maharashtra</span>
                 </div>
                 
                 <div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Evidence</span>
                   <span className="text-sm font-medium text-gray-900">{evidence.length > 0 ? `${evidence.length} files attached` : 'None'}</span>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
             <span className="text-xs text-gray-500">By submitting, you agree to register this grievance in the system.</span>
             <Button className="w-full sm:w-auto bg-[#194D2E] hover:bg-[#143d24] text-white px-8" onClick={handleSubmit} disabled={isSubmitting}>
               {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
             </Button>
           </div>
         </div>
       )}

       {/* STEP 7 - SUCCESS */}
       {step === 7 && (
         <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center animate-in zoom-in-95 duration-300">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 size={40} className="text-green-600" />
           </div>
           <h2 className="text-3xl font-black text-gray-900 mb-2">Grievance Registered</h2>
           <p className="text-gray-500 mb-8">Your issue has been recorded in KrishiMitra Demo.</p>
           
           <div className="inline-flex flex-col items-center justify-center bg-gray-50 px-8 py-4 rounded-xl border border-gray-100">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grievance ID</span>
             <span className="text-2xl font-black text-gray-900">Generating...</span>
           </div>
           
           <p className="text-sm text-gray-400 mt-8">Redirecting to details...</p>
         </div>
       )}

    </div>
  );
};

// Helpers

const formatCategory = (cat: string) => {
  return cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const formatKey = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};

const getDynamicFields = (category: GrievanceCategory) => {
  switch (category) {
    case 'BUYER':
    case 'PAYMENT':
      return [
        { id: 'buyerName', label: 'Buyer Name', placeholder: 'e.g., Maharashtra Agro Traders' },
        { id: 'pendingAmount', label: 'Pending Amount (₹)', type: 'number', placeholder: 'e.g., 42500' },
        { id: 'transactionDate', label: 'Transaction Date', type: 'date' },
        { id: 'referenceNumber', label: 'Transaction / Reference Number', placeholder: 'e.g., MAT-9921' }
      ];
    case 'MARKET':
      return [
        { id: 'marketName', label: 'Market / APMC', placeholder: 'e.g., Pimpalgaon APMC' },
        { id: 'crop', label: 'Crop', placeholder: 'e.g., Onion' },
        { id: 'expectedPrice', label: 'Expected Price', type: 'number' },
        { id: 'observedPrice', label: 'Observed Price', type: 'number' }
      ];
    case 'CROP':
    case 'PEST_DISEASE':
      return [
        { id: 'crop', label: 'Affected Crop', placeholder: 'e.g., Onion' },
        { id: 'dateStarted', label: 'When did it start?', type: 'date' },
        { id: 'affectedArea', label: 'Affected Area (Acres)', type: 'number', placeholder: 'e.g., 2.5' }
      ];
    case 'GOVERNMENT_SCHEME':
      return [
        { id: 'schemeName', label: 'Scheme Name', placeholder: 'e.g., PM-KISAN' },
        { id: 'applicationNumber', label: 'Application Number', placeholder: 'e.g., PMK-123456' },
        { id: 'expectedBenefit', label: 'Expected Benefit', placeholder: 'e.g., ₹2000' }
      ];
    case 'LOGISTICS':
      return [
        { id: 'pickupLocation', label: 'Pickup Location', placeholder: 'e.g., Farm, Niphad' },
        { id: 'destination', label: 'Destination', placeholder: 'e.g., Pimpalgaon APMC' },
        { id: 'expectedDelivery', label: 'Expected Delivery Date', type: 'date' }
      ];
    default:
      return [
        { id: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any other relevant details...' }
      ];
  }
};
