import React, { useState } from 'react';
import { Users, FileText, Folder, Activity, HelpCircle, Plus, Database, History, X, Settings, CheckCircle, ChevronRight, Search, Bell } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  // State for modals
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [isUpdateTemplateOpen, setIsUpdateTemplateOpen] = useState(false);
  const [isUpdateDatasetsOpen, setIsUpdateDatasetsOpen] = useState(false);
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(false);

  // Stats Data - Updated with Dark Mode classes
  const stats = [
    { 
      label: 'Total Users', 
      value: '247', 
      trend: '+12 this month', 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' 
    },
    { 
      label: 'Documents', 
      value: '1,432', 
      trend: '+23% vs last mo', 
      icon: FileText, 
      color: 'text-sky-600 dark:text-sky-400', 
      bg: 'bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800' 
    },
    { 
      label: 'Templates', 
      value: '18', 
      trend: 'All systems active', 
      icon: Folder, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' 
    },
    { 
      label: 'System Health', 
      value: '98.5%', 
      trend: 'Optimal performance', 
      icon: Activity, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' 
    },
  ];

  const recentActivities = [
    { action: 'Template Created', detail: 'Letter Format v2', user: 'Admin System', time: '2h ago', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    { action: 'Document Generated', detail: 'Activity Proposal - CITE Days', user: 'Secretary', time: '3h ago', icon: Activity, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/40' },
    { action: 'Dataset Updated', detail: 'Student Handbook 2024', user: 'Admin System', time: '1d ago', icon: Database, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    { action: 'New User', detail: 'Registered: Student Council', user: 'System', time: '1d ago', icon: Users, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  ];

  const quickActions = [
    { title: 'Manage Users', desc: 'Add, remove, or edit user roles', icon: Users, action: () => setIsManageUserOpen(true), color: 'blue' },
    { title: 'Update Templates', desc: 'Modify generation templates', icon: Folder, action: () => setIsUpdateTemplateOpen(true), color: 'indigo' },
    { title: 'Update Datasets', desc: 'Manage knowledge base', icon: Database, action: () => setIsUpdateDatasetsOpen(true), color: 'sky' },
    { title: 'View Logs', desc: 'Audit system activity', icon: History, action: () => setIsRecentActivityOpen(true), color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Admin Dashboard <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">v2.0</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">System Overview & Management Console</p>
          </div>
          <div className="flex gap-3">
              <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition shadow-sm active:scale-95 duration-200">
                  <Bell className="w-5 h-5" />
              </button>
              <button className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 font-medium transition shadow-sm flex items-center gap-2 active:scale-95 duration-200">
                  <HelpCircle className="w-4 h-4" /> Support
              </button>
              <button 
                onClick={() => onNavigate('generate')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 dark:shadow-blue-900/20 transition-all hover:-translate-y-0.5 font-medium active:scale-95 duration-200"
              >
                <Plus className="w-4 h-4" /> Create Document
              </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-700 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.label === 'System Health' && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> OK
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1">
                   {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions Area */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, idx) => (
                    <button 
                      key={idx}
                      onClick={action.action}
                      className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all text-left group active:scale-95 duration-200"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform bg-gradient-to-br from-${action.color}-500 to-${action.color}-700`}>
                        <action.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 ml-auto group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Approval Workflow Panel */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md dark:shadow-gray-950/50">
                <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Approvals</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Documents awaiting review</p>
                  </div>
                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-medium">Document</th>
                        <th className="px-4 py-3 font-medium">Submitted By</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">SSC Activity Proposal - Intramurals</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Student Leader</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Oct 24, 2024</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition font-medium text-xs">Review</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Budget Request - Office Supplies</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Treasurer</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Oct 23, 2024</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition font-medium text-xs">Review</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md dark:shadow-gray-950/50 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recent Activity
            </h3>
            <div className="space-y-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700"></div>
                
                {recentActivities.map((act, i) => (
                  <div key={i} className="relative pl-10 group">
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 ${act.bg} flex items-center justify-center z-10 shadow-sm`}>
                        <act.icon className={`w-3 h-3 ${act.color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{act.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{act.detail}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span>{act.user}</span>
                          <span>•</span>
                          <span>{act.time}</span>
                        </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-2.5 mt-4 text-sm font-medium text-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent rounded-xl transition">
                  View Full Audit Log
                </button>
            </div>
          </div>
        </div>

        {/* Modals with Enhanced Animation */}
        {(isManageUserOpen || isUpdateTemplateOpen || isUpdateDatasetsOpen || isRecentActivityOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-scale-in border border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => {
                      setIsManageUserOpen(false);
                      setIsUpdateTemplateOpen(false);
                      setIsUpdateDatasetsOpen(false);
                      setIsRecentActivityOpen(false);
                  }}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-blue-50 dark:ring-blue-900/20">
                      <Settings className="w-10 h-10 animate-spin-slow" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feature Module</h3>
                  <p className="text-gray-500 dark:text-gray-400 px-8 leading-relaxed">
                      This admin module is currently under development. In the production version, this would contain the full management interface.
                  </p>
                  <button 
                    onClick={() => {
                      setIsManageUserOpen(false);
                      setIsUpdateTemplateOpen(false);
                      setIsUpdateDatasetsOpen(false);
                      setIsRecentActivityOpen(false);
                    }}
                    className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-200 dark:shadow-blue-900/40 active:scale-95 duration-200"
                  >
                      Return to Dashboard
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};