import React from 'react';
import { User, DocumentType } from '../types';
import { FileText, DollarSign, Utensils, Clock, ArrowRight, Plus } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  
  const tiles = [
    {
      title: 'New Activity Proposal',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => onNavigate('generate', { type: DocumentType.ACTIVITY_PROPOSAL })
    },
    {
      title: 'Draft Resolution',
      icon: FileText,
      color: 'bg-emerald-600',
      action: () => onNavigate('generate', { type: DocumentType.RESOLUTION })
    },
    {
      title: 'Budget Calculator',
      icon: DollarSign,
      color: 'bg-amber-500',
      action: () => onNavigate('budget')
    },
    {
      title: 'Official Letter',
      icon: FileText,
      color: 'bg-purple-500',
      action: () => onNavigate('generate', { type: DocumentType.OFFICIAL_LETTER })
    },
    {
      title: 'Meal Planner',
      icon: Utensils,
      color: 'bg-rose-500',
      action: () => onNavigate('meal-planner')
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user.role} • {user.organization}
          </p>
        </div>
        <button 
           onClick={() => onNavigate('generate')}
           className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create Document
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            onClick={tile.action}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition text-left group border border-gray-100 dark:border-gray-700"
          >
            <div className={`w-12 h-12 ${tile.color} rounded-lg flex items-center justify-center mb-4 text-white shadow-lg`}>
              <tile.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              {tile.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              Start now <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>
        ))}
      </div>

      {/* Recent Activity (Mock) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Recent Documents
          </h2>
          <button onClick={() => onNavigate('documents')} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all</button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded text-blue-600 dark:text-blue-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">General Assembly Proposal V{i}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Edited {i} hour(s) ago</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Draft
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
