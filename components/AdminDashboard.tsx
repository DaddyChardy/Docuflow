import React, { useState } from 'react';
import { Users, FileText, Folder, Activity, HelpCircle, Plus, Database, History, X, Pencil, Trash2, CloudUpload } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [isUpdateTemplateOpen, setIsUpdateTemplateOpen] = useState(false);
  const [isUpdateDatasetsOpen, setIsUpdateDatasetsOpen] = useState(false);
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(false);

  // Mock Data for User Management
  const userStats = [
    { role: 'Administrator', count: 1, percentage: 14 },
    { role: 'College Secretary', count: 1, percentage: 14 },
    { role: 'Student', count: 5, percentage: 71 },
  ];

  const usersList = [
    { email: 'admin@university.edu', role: 'Administrator' },
    { email: 'secretary@CTE.edu', role: 'College Secretary' },
    { email: 'student.council@nemsu.edu.ph', role: 'Student' },
    { email: 'class.mayor@nemsu.edu.ph', role: 'Student' },
  ];

  // Mock Data for Recent Activity
  const recentActivities = [
    { action: 'Created new template: Letter Format', user: 'admin@university.edu', time: '2 hours ago' },
    { action: 'Generated Activity Proposal document', user: 'secretary@CTE.edu', time: '3 hours ago' },
    { action: 'Accessed By-Laws template', user: 'Jimshindreck@student.edu', time: '5 hours ago' },
    { action: 'Generated Letter document', user: 'Wilson@student.edu', time: '1 day ago' },
    { action: 'Updated user permissions', user: 'admin@university.edu', time: '1 day ago' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-8 relative">
      
      {/* Manage User Modal */}
      {isManageUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h2>
              <button 
                onClick={() => setIsManageUserOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Section 1: Distribution */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">User Role Distribution</h3>
                <div className="space-y-5">
                  {userStats.map((stat) => (
                    <div key={stat.role}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{stat.role}</span>
                        <span className="text-gray-500">{stat.count} ({stat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Manage User Table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Manage User</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative min-h-[250px] flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs font-bold text-gray-900 dark:text-white uppercase bg-transparent border-b border-gray-100 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {usersList.map((u, i) => (
                          <tr key={i} className="hover:bg-white dark:hover:bg-gray-800 transition">
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-3">
                              <button className="text-gray-500 hover:text-black dark:hover:text-white transition">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button className="text-gray-500 hover:text-red-500 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Floating Add Button */}
                  <div className="absolute bottom-5 right-5">
                    <button className="h-10 w-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Template Modal */}
      {isUpdateTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CloudUpload className="w-5 h-5" /> Upload Activity Templates
              </h2>
              <button 
                onClick={() => setIsUpdateTemplateOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
               <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                 Only <span className="font-bold">.doc</span> and <span className="font-bold">.docx</span> files are allowed.
               </p>

               <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drag and drop files here</h3>
                  <p className="text-sm text-gray-500">or click to select .doc/.docx files</p>
                  <input type="file" className="hidden" accept=".doc,.docx" />
               </div>
            </div>
            <div className="h-6"></div>
          </div>
        </div>
      )}

      {/* Update Datasets Modal */}
      {isUpdateDatasetsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CloudUpload className="w-5 h-5" /> Update Datasets
              </h2>
              <button 
                onClick={() => setIsUpdateDatasetsOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
               <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                 Only <span className="font-bold">.pdf</span> files are allowed.
               </p>

               <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drag and drop PDF files</h3>
                  <p className="text-sm text-gray-500">or click to select .pdf files</p>
                  <input type="file" className="hidden" accept=".pdf" />
               </div>
            </div>
            <div className="h-6"></div>
          </div>
        </div>
      )}

      {/* Recent Activity Modal */}
      {isRecentActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-white dark:bg-gray-800 sticky top-0 z-10">
              <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest system events and user actions</p>
              </div>
              <button 
                onClick={() => setIsRecentActivityOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
               <div className="space-y-6">
                 {recentActivities.map((activity, index) => (
                   <div key={index} className="group">
                     <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 flex-shrink-0 text-gray-700 dark:text-gray-300">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                             {activity.action}
                           </h4>
                           <p className="text-xs text-gray-500 dark:text-gray-400">
                             {activity.user} • {activity.time}
                           </p>
                        </div>
                     </div>
                     {/* Separator Line (except for last item) */}
                     {index < recentActivities.length - 1 && (
                       <div className="ml-5 border-l border-gray-100 dark:border-gray-700 h-6 my-1"></div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
            <div className="h-4"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        </div>
        <div className="flex gap-3 items-center">
             <button 
               onClick={() => onNavigate('generate')}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Create Document
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-400 dark:border-blue-600 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Users</p>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">247</h2>
                        <p className="text-xs text-gray-500 mt-1">+12 from last month</p>
                    </div>
                </div>
                <div className="p-2 bg-white rounded-lg text-blue-500 border border-blue-200 shadow-sm">
                    <Users className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Documents Generated */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-400 dark:border-blue-600 shadow-sm">
            <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Documents Generated</p>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">1,432</h2>
                        <p className="text-xs text-gray-500 mt-1">+23% from last month</p>
                    </div>
                </div>
                 <div className="p-2 bg-white rounded-lg text-blue-500 border border-blue-200 shadow-sm">
                    <FileText className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Active Templates */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-400 dark:border-blue-600 shadow-sm">
            <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Active Templates</p>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">18</h2>
                        <p className="text-xs text-gray-500 mt-1">3 templates</p>
                    </div>
                </div>
                 <div className="p-2 bg-white rounded-lg text-blue-500 border border-blue-200 shadow-sm">
                    <Folder className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* System Activity */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-400 dark:border-blue-600 shadow-sm">
            <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">System Activity</p>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">98.5%</h2>
                        <p className="text-xs text-gray-500 mt-1">Uptime this month</p>
                    </div>
                </div>
                 <div className="p-2 bg-white rounded-lg text-blue-500 border border-blue-200 shadow-sm">
                    <Activity className="w-5 h-5" />
                </div>
            </div>
        </div>
      </div>

      {/* Quick Actions Container */}
      <div className="border border-blue-400 dark:border-blue-600 rounded-xl p-6 md:p-8 bg-white dark:bg-gray-800">
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Quick Actions</h3>
            <p className="text-sm text-gray-500">Common administrative tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Manage User */}
            <button 
              onClick={() => setIsManageUserOpen(true)}
              className="flex items-center p-4 border border-blue-400 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group text-left min-h-[96px]"
            >
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-blue-500 mr-4 border border-blue-100 dark:border-gray-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Manage User</h4>
                    <p className="text-xs text-gray-500 mt-1">Manage user accounts</p>
                </div>
            </button>

            {/* Update Template */}
             <button 
               onClick={() => setIsUpdateTemplateOpen(true)}
               className="flex items-center p-4 border border-blue-400 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group text-left min-h-[96px]"
             >
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-blue-500 mr-4 border border-blue-100 dark:border-gray-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Folder className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Update Template</h4>
                    <p className="text-xs text-gray-500 mt-1">Modify system templates</p>
                </div>
            </button>

            {/* Update Datasets */}
             <button 
               onClick={() => setIsUpdateDatasetsOpen(true)}
               className="flex items-center p-4 border border-blue-400 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group text-left min-h-[96px]"
             >
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-blue-500 mr-4 border border-blue-100 dark:border-gray-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Database className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Update Datasets</h4>
                    <p className="text-xs text-gray-500 mt-1">Modify system datasets</p>
                </div>
            </button>

             {/* Recent Activity */}
             <button 
                onClick={() => setIsRecentActivityOpen(true)}
                className="flex items-center p-4 border border-blue-400 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group text-left min-h-[96px]"
             >
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-blue-500 mr-4 border border-blue-100 dark:border-gray-600 group-hover:scale-110 transition-transform shadow-sm">
                    <History className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Recent Activity</h4>
                    <p className="text-xs text-gray-500 mt-1">View system activity logs</p>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};