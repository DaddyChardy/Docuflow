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
      color: 'bg-blue-600',
      docType: DocumentType.ACTIVITY_PROPOSAL,
      action: () => onNavigate('generate', { type: DocumentType.ACTIVITY_PROPOSAL }),
      enabled: user.permissions?.activity_proposal === 'edit'
    },
    {
      title: 'Official Letter',
      icon: Mail,
      color: 'bg-purple-600',
      docType: DocumentType.OFFICIAL_LETTER,
      action: () => onNavigate('generate', { type: DocumentType.OFFICIAL_LETTER }),
      enabled: user.permissions?.official_letter === 'edit'
    },
    {
      title: 'Constitution & By-Laws',
      icon: Scale,
      color: 'bg-amber-500',
      docType: DocumentType.CONSTITUTION,
      action: () => onNavigate('generate', { type: DocumentType.CONSTITUTION }),
      enabled: user.permissions?.constitution === 'edit'
    }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome, {user.full_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user.specific_role || user.user_type} • {user.department}
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            onClick={tile.enabled ? tile.action : () => onNavigate('documents', { initialTab: 'shared', initialType: tile.docType })}
            className={`
              relative overflow-hidden p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-72 text-left group
              ${tile.enabled
                ? 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 border-gray-200 dark:border-gray-700 cursor-pointer'
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
              }
            `}
          >
            {/* Decorative Background Blob - Only show if enabled */}
            {tile.enabled && (
              <div className={`absolute -right-8 -top-8 w-40 h-40 ${tile.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>
            )}

            <div className="flex justify-between items-start w-full z-10">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 ${tile.enabled ? `${tile.color} group-hover:scale-110` : 'bg-gray-400 dark:bg-gray-700'}`}>
                <tile.icon className="w-10 h-10" />
              </div>
            </div>

            <div className="z-10 mt-6">
              <h3 className={`text-2xl font-bold mb-3 transition-colors ${tile.enabled ? 'text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {tile.title}
              </h3>
              <p className={`text-lg flex items-center transition-colors ${tile.enabled ? 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'text-gray-500 dark:text-gray-500'}`}>
                {tile.enabled ? (
                  <>Start drafting <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <span className="flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">View Generated Documents <ArrowRight className="w-4 h-4 ml-2" /></span>
                )}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};