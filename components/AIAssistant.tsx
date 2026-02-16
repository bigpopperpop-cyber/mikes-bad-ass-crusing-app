
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, Loader2, Bot } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a helpful travel assistant for a family going on a cruise in Summer 2028. 
        Context: It's a high school graduation trip. 
        User Query: ${prompt}`,
        config: {
          systemInstruction: 'Provide concise, practical cruise travel advice. Focus on packing tips, itinerary planning, or saving money on cruises. Use bullet points where appropriate.',
        },
      });

      setResponse(result.text || 'No response received.');
    } catch (error) {
      console.error('Error querying Gemini:', error);
      setResponse('Sorry, I encountered an error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col h-[400px]">
      <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 p-1.5 rounded-lg"><Bot className="w-5 h-5 text-purple-600" /></div>
          <h3 className="font-bold text-slate-800">Cruise Assistant</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-widest">
          <Sparkles className="w-3 h-3" /> Powered by Gemini
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
        {response ? (
          <div className="prose prose-sm max-w-none text-slate-700 font-medium whitespace-pre-line">
            {response}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Generating Travel Wisdom...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center px-4">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-bold text-slate-400">Ask me for packing tips, cruise secrets, or 2028 travel trends!</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t-2 border-slate-100 rounded-b-2xl">
        <div className="relative">
          <input 
            className="w-full bg-slate-100 border-2 border-transparent focus:border-purple-500 rounded-xl px-4 py-3 pr-12 outline-none transition-all font-medium text-sm"
            placeholder="e.g. What should I pack for a 7-day Caribbean cruise?"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
          />
          <button 
            onClick={askAI}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md shadow-purple-200"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
