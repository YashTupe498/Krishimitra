import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GrievanceAssistant } from '../../components/farmer/grievances/GrievanceAssistant';
import { GrievanceList } from '../../components/farmer/grievances/GrievanceList';
import { IssueCategories } from '../../components/farmer/grievances/IssueCategories';
import { GrievanceForm } from '../../components/farmer/grievances/GrievanceForm';
import { GrievanceDetails } from '../../components/farmer/grievances/GrievanceDetails';
import { grievanceDemoService } from '../../services/grievanceDemoService';
import type { Grievance } from '../../types/grievance';
import { useAuth } from '../../app/providers/AuthProvider';

export const IssuesGrievancesPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'demo-farmer-id';

  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [view, setView] = useState<'dashboard' | 'report' | 'details' | 'track'>('dashboard');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const fetchGrievances = async () => {
    setLoading(true);
    const data = await grievanceDemoService.getGrievances(userId);
    setGrievances(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGrievances();
  }, [userId]);

  const handleReportIssue = () => {
    setView('report');
  };

  const handleViewDetails = (id: string) => {
    setSelectedGrievanceId(id);
    setView('details');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedGrievanceId(null);
    fetchGrievances(); // Refresh list when going back to dashboard
  };

  const selectedGrievance = grievances.find(g => g.id === selectedGrievanceId);

  return (
    <div className="min-h-screen bg-[#F4F6F4] -m-4 md:-m-8 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Issues & Grievances</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Get help with farming, market, buyer, payment and government-related issues.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={fetchGrievances} disabled={loading} className="bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 h-10 px-4 flex items-center shadow-sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6">
            <GrievanceAssistant onReport={handleReportIssue} onTrack={() => setView('track')} />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                 <IssueCategories onSelectCategory={handleReportIssue} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Your Recent Grievances
              </div>
              <GrievanceList grievances={grievances} onViewDetails={handleViewDetails} loading={loading} />
            </div>
          </div>
        )}

        {view === 'report' && (
          <GrievanceForm onCancel={handleBackToDashboard} onSuccess={(id) => handleViewDetails(id)} userId={userId} />
        )}

        {view === 'details' && selectedGrievance && (
          <GrievanceDetails grievance={selectedGrievance} onBack={handleBackToDashboard} />
        )}

        {view === 'track' && (
          <div className="bg-white rounded-2xl p-8 max-w-xl mx-auto mt-12 text-center shadow-sm border border-gray-100">
             <Activity size={48} className="text-gray-300 mx-auto mb-6" />
             <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Grievance</h2>
             <p className="text-sm text-gray-500 mb-8">Enter your Grievance ID to check the current status.</p>
             <div className="flex gap-2">
               <input type="text" placeholder="e.g., KM-2026-004281" className="flex-1 border border-gray-200 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
               <Button className="bg-[#194D2E] hover:bg-[#143d24] text-white">Track</Button>
             </div>
             <Button variant="ghost" onClick={handleBackToDashboard} className="mt-6 text-gray-500">Back to Dashboard</Button>
          </div>
        )}

      </div>
    </div>
  );
};
