import React from 'react';
import { User, DocumentType } from '../types';
import { FileText, ArrowRight, Scale, Mail } from 'lucide-react';

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
      title: 'Official Letter',
      icon: Mail,
      color: 'bg-purple-500',
      action: () => onNavigate('generate', { type: DocumentType.OFFICIAL_LETTER })
    },
    {
      title: 'Constitution & By-Laws',
      icon: Scale,
      color: 'bg-amber-500',
      action: () => onNavigate('generate', { type: DocumentType.CONSTITUTION })
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
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            onClick={tile.action}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition text-left group border border-gray-100 dark:border-gray-700 h-40 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start w-full">
              <div className={`w-12 h-12 ${tile.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                <tile.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tile.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Start now <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
