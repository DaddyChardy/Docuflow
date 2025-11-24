
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentGenerator } from './components/DocumentGenerator';
import { BudgetCalculator } from './components/BudgetCalculator';
import { MealPlanner } from './components/MealPlanner';
import { DocumentList } from './components/DocumentList';
import { Layout } from './components/Layout';
import { User, DocumentType, UserRole } from './types';
import { Settings, Moon, Sun, Sparkles, CheckCircle, Save, X } from 'lucide-react';

interface SettingsModalProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ theme, toggleTheme, onClose }) => {
  const [aiSettings, setAiSettings] = useState({ tone: 'Formal', length: 'Standard' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nemsu_ai_settings');
    if (saved) {
      try {
        setAiSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveAISettings = () => {
    localStorage.setItem('nemsu_ai_settings', JSON.stringify(aiSettings));
    setSaveStatus('Preferences Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-scale-in border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center pt-4 pb-2">
             <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-blue-50 dark:ring-blue-900/20">
                  <Settings className="w-10 h-10 animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-8 mb-8 leading-relaxed">
                  Customize your interface appearance and AI generation preferences.
              </p>
          </div>

          <div className="space-y-6 text-left">
             {/* Appearance Section */}
             <section>
                <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-wider flex items-center gap-2">
                    <Sun className="w-3 h-3" /> Appearance
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 transition hover:border-gray-200 dark:hover:border-gray-500">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-amber-100 text-amber-600'}`}>
                            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
             </section>

             {/* AI Configuration Section */}
             <section>
                <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI Preferences
                </h3>
                
                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 space-y-5">
                   {/* Tone Selector */}
                   <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Tone of Voice</label>
                      <div className="grid grid-cols-2 gap-2">
                          {['Formal', 'Academic', 'Professional', 'Direct'].map((tone) => (
                              <button
                                  key={tone}
                                  onClick={() => setAiSettings({...aiSettings, tone})}
                                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                      aiSettings.tone === tone 
                                      ? 'bg-white dark:bg-gray-600 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 shadow-sm' 
                                      : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                              >
                                  {tone}
                              </button>
                          ))}
                      </div>
                   </div>

                   {/* Length Selector */}
                   <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Response Length</label>
                      <div className="grid grid-cols-3 gap-2">
                          {['Concise', 'Standard', 'Detailed'].map((len) => (
                              <button
                                  key={len}
                                  onClick={() => setAiSettings({...aiSettings, length: len})}
                                  className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                                      aiSettings.length === len 
                                      ? 'bg-white dark:bg-gray-600 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 shadow-sm' 
                                      : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                              >
                                  {len}
                              </button>
                          ))}
                      </div>
                   </div>

                   <button 
                      onClick={saveAISettings}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2 active:scale-95"
                  >
                      {saveStatus ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saveStatus || 'Save Preferences'}
                  </button>
                </div>
             </section>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
             <button 
                onClick={onClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
             >
                Return to Dashboard
             </button>
          </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'settings') {
        setIsSettingsOpen(true);
        return;
    }
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
    default:
      content = (
        <div className="flex items-center justify-center h-full text-gray-500">
          Page not found.
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
      {isSettingsOpen && (
        <SettingsModal 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </Layout>
  );
};

export default App;
