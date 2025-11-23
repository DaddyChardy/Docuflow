import React, { useState } from 'react';
import { generateMealPlan } from '../services/geminiService';
import { ArrowLeft, Utensils, Bot, Loader2 } from 'lucide-react';

interface MealPlannerProps {
  onBack: () => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({ onBack }) => {
  const [preferences, setPreferences] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!preferences) return;
    setLoading(true);
    const result = await generateMealPlan(preferences);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="w-6 h-6 text-rose-500" /> Student Meal Planner
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg">Preferences</h3>
          <div className="space-y-4">
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full h-40 p-4 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="e.g., Budget is 150 PHP per day, allergic to shrimp, prefer chicken, need high protein."
            ></textarea>
            <button
              onClick={handleGenerate}
              disabled={loading || !preferences}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Bot className="w-5 h-5" />}
              Generate Plan
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <h3 className="font-semibold mb-4 text-lg">Your Plan</h3>
          <div className="flex-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-rose-100">
             {plan || "Enter your budget and preferences to get a custom daily meal plan."}
          </div>
        </div>
      </div>
    </div>
  );
};
