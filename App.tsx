import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { DocumentGenerator } from './components/DocumentGenerator';
import { BudgetCalculator } from './components/BudgetCalculator';
import { MealPlanner } from './components/MealPlanner';
import { DocumentList } from './components/DocumentList';
import { Layout } from './components/Layout';
import { User, DocumentType } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) setViewParams(params);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  let content;
  switch (currentView) {
    case 'dashboard':
      content = <Dashboard user={user} onNavigate={handleNavigate} />;
      break;
    case 'generate':
      content = (
        <DocumentGenerator 
          initialType={viewParams.type || DocumentType.ACTIVITY_PROPOSAL}
          onBack={() => handleNavigate('dashboard')} 
        />
      );
      break;
    case 'budget':
      content = <BudgetCalculator onBack={() => handleNavigate('dashboard')} />;
      break;
    case 'documents':
      content = <DocumentList />;
      break;
    case 'meal-planner':
      content = <MealPlanner onBack={() => handleNavigate('dashboard')} />;
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
