import React, { useState, useEffect } from 'react';
import { User, DocumentType, DocumentTypeIcon, DocumentTypeColor, GeneratedDocument } from '../types';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  user: User;
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [recentDocs, setRecentDocs] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDocs = async () => {
      if (!user?.id) return;
      
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            profiles:user_id (full_name, avatar_url)
          `)
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const mappedDocs: GeneratedDocument[] = (data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          type: d.type as DocumentType,
          content: d.content,
          status: d.status,
          createdAt: new Date(d.created_at),
          updatedAt: new Date(d.updated_at),
          versions: d.versions || [],
          visibility: d.visibility,
          department: d.department,
          user_id: d.user_id,
          author_name: d.profiles?.full_name,
          author_avatar: d.profiles?.avatar_url,
          template_index: d.template_index
        }));

        setRecentDocs(mappedDocs);
      } catch (err) {
        console.error('Error fetching recent documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDocs();
  }, [user?.id]);

  const tiles = [
    {
      title: 'New Activity Proposal',
      icon: DocumentTypeIcon[DocumentType.ACTIVITY_PROPOSAL],
      color: DocumentTypeColor[DocumentType.ACTIVITY_PROPOSAL],
      docType: DocumentType.ACTIVITY_PROPOSAL,
      action: () => onNavigate('generate', { type: DocumentType.ACTIVITY_PROPOSAL }),
      enabled: user.permissions?.activity_proposal === 'edit'
    },
    {
      title: 'Official Letter',
      icon: DocumentTypeIcon[DocumentType.OFFICIAL_LETTER],
      color: DocumentTypeColor[DocumentType.OFFICIAL_LETTER],
      docType: DocumentType.OFFICIAL_LETTER,
      action: () => onNavigate('generate', { type: DocumentType.OFFICIAL_LETTER }),
      enabled: user.permissions?.official_letter === 'edit'
    },
    {
      title: 'Constitution & By-Laws',
      icon: DocumentTypeIcon[DocumentType.CONSTITUTION],
      color: DocumentTypeColor[DocumentType.CONSTITUTION],
      docType: DocumentType.CONSTITUTION,
      action: () => onNavigate('generate', { type: DocumentType.CONSTITUTION }),
      enabled: user.permissions?.constitution === 'edit'
    }
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto space-y-8 md:space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-950 dark:text-white tracking-tight">
          Welcome, {user.full_name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg">
          {user.specific_role || user.user_type} • {user.department}
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500 p-6 md:p-8 flex flex-col items-center text-center group relative overflow-hidden h-[320px] md:h-[400px]"
          >
            {/* Top Section with Dot Pattern or Dotted Circle */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="relative mb-6 md:mb-8">
                {/* Dotted Outer Circle */}
                <div className="absolute inset-[-10px] md:inset-[-12px] rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800/50 group-hover:rotate-45 transition-transform duration-1000"></div>

                {/* Icon Container */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${tile.color} flex items-center justify-center text-white shadow-2xl relative z-10 transform group-hover:scale-110 transition-transform duration-500`}>
                  <tile.icon className="w-10 h-10 md:w-12 md:h-12" />
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {tile.title}
              </h3>
              <p className="hidden md:block text-gray-500 dark:text-gray-400 text-base">
                {tile.title === 'New Activity Proposal' && 'Start drafting a new proposal.'}
                {tile.title === 'Official Letter' && 'Create an official letter.'}
                {tile.title === 'Constitution & By-Laws' && 'Draft or revise by-laws.'}
              </p>
            </div>

            {/* Bottom Button */}
            <button
              onClick={tile.enabled ? tile.action : () => onNavigate('documents', { initialTab: 'shared', initialType: tile.docType })}
              className={`
                w-full py-3 md:py-4 px-6 rounded-full font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn mt-auto
              `}
            >
              {tile.enabled ? 'Start draft' : 'View Documents'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        ))}
      </div>
      {/* Recent Documents Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Recent Documents
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
              Last 7 days
            </span>
          </h2>
          <button 
            onClick={() => onNavigate('documents')}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
          >
            View all
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentDocs.length > 0 ? (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate('generate', { type: doc.type, doc: doc })}
                className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group relative overflow-hidden"
              >
                <div className={`p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {React.createElement(DocumentTypeIcon[doc.type as DocumentType] || Clock, { className: "w-6 h-6" })}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      {doc.type}
                    </p>
                  </div>
                  <h4 className="text-gray-900 dark:text-white font-bold truncate text-lg leading-tight" title={doc.title}>
                    {doc.title}
                  </h4>
                </div>

                <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{doc.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold">No recent documents</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Documents you create will appear here for 7 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};