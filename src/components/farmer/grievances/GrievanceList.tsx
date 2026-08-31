import React from 'react';
import { RefreshCw, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Grievance, GrievancePriority, GrievanceStatus } from '../../../types/grievance';

interface GrievanceListProps {
  grievances: Grievance[];
  onViewDetails: (id: string) => void;
  loading: boolean;
}

export const GrievanceList: React.FC<GrievanceListProps> = ({ grievances, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (grievances.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="text-gray-400" size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No grievances yet</h3>
        <p className="text-sm text-gray-500 max-w-sm">When you report an issue, your grievance tracking information will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 font-bold">Grievance ID</th>
              <th className="p-4 font-bold">Category</th>
              <th className="p-4 font-bold">Priority</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold hidden md:table-cell">Last Updated</th>
              <th className="p-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grievances.map((grievance) => (
              <tr 
                key={grievance.id} 
                className="hover:bg-green-50/30 transition-colors cursor-pointer group"
                onClick={() => onViewDetails(grievance.id)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-900">{grievance.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-gray-700">{formatCategory(grievance.category)}</span>
                </td>
                <td className="p-4">
                  <PriorityBadge priority={grievance.priority} />
                </td>
                <td className="p-4">
                  <StatusBadge status={grievance.status} />
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-xs text-gray-500">
                    {new Date(grievance.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-green-700 font-bold text-xs flex items-center justify-end w-full group-hover:translate-x-1 transition-transform">
                    View <ChevronRight size={14} className="ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PriorityBadge = ({ priority }: { priority: GrievancePriority }) => {
  const styles = {
    HIGH: 'bg-rose-100 text-rose-800 border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.1)]',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200 shadow-[0_0_10px_rgba(217,119,6,0.1)]',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider border ${styles[priority]}`}>
      {priority === 'HIGH' && <AlertTriangle size={12} strokeWidth={3} />}
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: GrievanceStatus }) => {
  const styles = {
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    REGISTERED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
    IN_PROGRESS: 'bg-teal-100 text-teal-800 border-teal-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const labels = {
    SUBMITTED: 'Submitted',
    REGISTERED: 'Registered',
    UNDER_REVIEW: 'Under Review',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const formatCategory = (cat: string) => {
  return cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};
