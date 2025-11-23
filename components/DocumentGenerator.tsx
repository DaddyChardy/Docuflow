import React, { useState, useEffect, useRef } from 'react';
import { DocumentType } from '../types';
import { generateDocument, LiveSession } from '../services/geminiService';
import { Bot, ArrowLeft, Sparkles, FormInput, Mic, PhoneOff, MicOff } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface DocumentGeneratorProps {
  initialType?: DocumentType;
  onBack: () => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ initialType = DocumentType.ACTIVITY_PROPOSAL, onBack }) => {
  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // Mode Toggle: 'form' or 'chat' (Voice Agent)
  const [inputMode, setInputMode] = useState<'form' | 'chat'>('form');

  // Form State
  const [formData, setFormData] = useState({
    orgName: '',
    title: '',
    venue: '',
    date: '',
    proponent: '',
    budget: '',
    source: '',
    objectives: '',
    senderName: '',
    senderPosition: '',
    recipientName: '',
    subject: '',
    details: '',
    resNum: '',
    topic: '',
    whereas: '',
    resolved: ''
  });

  // Live Agent State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<LiveSession | null>(null);

  useEffect(() => {
    // Cleanup live session on unmount
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const text = await generateDocument(docType, formData);
      setResult(text);
    } catch (e) {
      alert("Failed to generate document. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveAgent = async () => {
    if (isLiveActive) {
      // Disconnect
      liveSessionRef.current?.disconnect();
      setIsLiveActive(false);
      liveSessionRef.current = null;
    } else {
      // Connect
      try {
        setIsLiveActive(true);
        liveSessionRef.current = new LiveSession((html) => {
          setResult(html);
        });
        await liveSessionRef.current.connect();
      } catch (e) {
        console.error("Failed to connect live agent", e);
        setIsLiveActive(false);
        alert("Could not access microphone or connect to AI Agent.");
      }
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-screen flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* Left Panel: Controls - Fixed height with scroll */}
      <div className="w-full lg:w-[450px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Generator</h2>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
              <button 
                onClick={() => setInputMode('form')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${inputMode === 'form' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-300' : 'text-gray-500'}`}
              >
                  <FormInput className="w-4 h-4" /> Form Input
              </button>
              <button 
                onClick={() => {
                    setInputMode('chat');
                    if(docType !== DocumentType.ACTIVITY_PROPOSAL) setDocType(DocumentType.ACTIVITY_PROPOSAL);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${inputMode === 'chat' ? 'bg-white dark:bg-gray-600 shadow text-purple-700 dark:text-purple-300' : 'text-gray-500'}`}
              >
                  <Mic className="w-4 h-4" /> Voice Agent
              </button>
          </div>
        </div>
        
        {inputMode === 'form' ? (
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Document Type</label>
                <select 
                value={docType} 
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                >
                {Object.values(DocumentType).map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
                </select>
            </div>

            {/* Dynamic Fields based on Type */}
            {docType === DocumentType.ACTIVITY_PROPOSAL && (
                <>
                <input name="orgName" placeholder="Organization Name" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="title" placeholder="Activity Title" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                
                <div className="grid grid-cols-2 gap-2">
                    <input name="venue" placeholder="Venue" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input type="date" name="date" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                
                <input name="proponent" placeholder="Proponent (Your Name)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <div className="grid grid-cols-2 gap-2">
                    <input name="budget" placeholder="Est. Budget (e.g. 5,000)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="source" placeholder="Source (e.g. STF)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>

                <textarea name="objectives" placeholder="Objectives (List them)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 h-32" />
                </>
            )}

            {docType === DocumentType.OFFICIAL_LETTER && (
                <>
                <input name="senderName" placeholder="Your Name" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="senderPosition" placeholder="Your Position" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="recipientName" placeholder="Recipient Name" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="subject" placeholder="Subject" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <textarea name="details" placeholder="Key details to include in the body..." onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 h-32" />
                </>
            )}

            {docType === DocumentType.RESOLUTION && (
                <>
                <input name="orgName" placeholder="Organization Name" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="resNum" placeholder="Resolution No. (e.g. 001-2024)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input name="topic" placeholder="Topic/Subject" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <textarea name="whereas" placeholder="Whereas clauses (Context)..." onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 h-24" />
                <textarea name="resolved" placeholder="Resolved clause (Action)..." onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 h-24" />
                </>
            )}
            
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                <>
                    <Bot className="w-5 h-5 animate-spin" /> Generating...
                </>
                ) : (
                <><Bot className="w-5 h-5" /> Generate Document</>
                )}
            </button>
            </div>
        ) : (
            // Voice Agent Interface
            <div className="flex flex-col flex-1 h-full bg-gray-50 dark:bg-gray-900/50 p-6 items-center justify-center text-center">
                <div className={`
                    w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-all duration-500 relative
                    ${isLiveActive 
                        ? 'bg-purple-100 text-purple-600 scale-110 shadow-[0_0_60px_rgba(147,51,234,0.3)]' 
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}
                `}>
                    {isLiveActive && (
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping opacity-50"></div>
                    )}
                    <Mic className={`w-20 h-20 ${isLiveActive ? 'animate-pulse' : ''}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                    {isLiveActive ? "Agent is Listening..." : "NEMSU AI Agent"}
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs">
                    {isLiveActive 
                        ? "Discuss your event details. When you're ready, the agent will generate the document." 
                        : "Start a call to discuss your proposal with the AI Coordinator."}
                </p>

                <button
                    onClick={toggleLiveAgent}
                    className={`
                        px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl
                        ${isLiveActive 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white'}
                    `}
                >
                    {isLiveActive ? (
                        <><PhoneOff className="w-6 h-6" /> End Call</>
                    ) : (
                        <><Mic className="w-6 h-6" /> Start Interview</>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Right Panel: Editor */}
      <div className="flex-1 h-full flex flex-col">
        {loading && !result ? (
          <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
             <Bot className="w-16 h-16 mb-4 text-emerald-500 animate-bounce" />
             <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Drafting your document...</p>
             <p className="text-sm">This uses the 2.5 Flash model for speed.</p>
          </div>
        ) : (
          <RichTextEditor initialContent={result} />
        )}
      </div>
    </div>
  );
};