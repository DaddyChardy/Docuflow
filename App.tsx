import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentGenerator } from './components/DocumentGenerator';
import { BudgetCalculator } from './components/BudgetCalculator';
import { MealPlanner } from './components/MealPlanner';
import { DocumentList } from './components/DocumentList';
import { Layout } from './components/Layout';
import { User, DocumentType, UserRole } from './types';
import { Settings, Construction } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) setViewParams(params);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.role === UserRole.ADMIN) {
        setCurrentView('admin-dashboard');
    } else {
        setCurrentView('dashboard');
    }
  };

  const getBackRoute = () => {
      if (user?.role === UserRole.ADMIN) {
          return 'admin-dashboard';
      }
      return 'dashboard';
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  let content;
  switch (currentView) {
    case 'dashboard':
      content = <Dashboard user={user} onNavigate={handleNavigate} />;
      break;
    case 'admin-dashboard':
      content = <AdminDashboard onNavigate={handleNavigate} />;
      break;
    case 'generate':
      content = (
        <DocumentGenerator 
          initialType={viewParams.type || DocumentType.ACTIVITY_PROPOSAL}
          onBack={() => handleNavigate(getBackRoute())} 
        />
      );
      break;
    case 'budget':
      content = <BudgetCalculator onBack={() => handleNavigate(getBackRoute())} />;
      break;
    case 'documents':
      content = <DocumentList />;
      break;
    case 'meal-planner':
      content = <MealPlanner onBack={() => handleNavigate(getBackRoute())} />;
      break;
    case 'settings':
      content = (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 m-6 p-12">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
             <Construction className="w-12 h-12 text-blue-500" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Settings</h2>
           <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
             This module is currently under development. Check back later for system configuration options.
           </p>
        </div>
      );
      break;
    default:
      content = (
        <div className="flex items-center justify-center h-full text-gray-500">
          Work in progress or Page not found.
        </div>
      );
  }

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onNavigate={handleNavigate}
      onLogout={() => setUser(null)}
    >
      {content}
    </Layout>
  );
};

export default App;