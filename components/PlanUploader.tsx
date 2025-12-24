
import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle, Sparkles, AlertCircle, ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import { generateWeeklyPlan } from '../services/geminiService';
import { StudyTask, StudySettings } from '../types';

interface Props {
  settings: StudySettings;
  onAddTasks: (tasks: StudyTask[]) => void;
  onBack: () => void;
}

const PlanUploader: React.FC<Props> = ({ settings, onAddTasks, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (input: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklyPlan(input, settings);
      onAddTasks(result);
    } catch (err: any) {
      setError(err.message === "API_KEY_MISSING" ? "Vercel API Key Missing" : "Failed to generate plan. Try clearer text.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleProcess({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-indigo-600 font-bold transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Settings
      </button>

      <header className="text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Sparkles size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-900">Feed the Syllabus</h2>
        <p className="text-slate-500 mt-2 text-lg">AI will transform your raw documents into a logical schedule.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group">
          <input 
            type="file" accept="image/*" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            disabled={loading}
          />
          <div className="h-full border-2 border-dashed border-slate-200 bg-white rounded-[40px] p-10 flex flex-col items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all text-center">
            <ImageIcon size={48} className="text-slate-300 mb-4" />
            <p className="font-black text-slate-700">Upload Screenshot</p>
            <p className="text-xs text-slate-400 mt-2">Syllabus PDF or photo of notes</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <FileText size={20} />
            <span className="font-black uppercase text-xs tracking-widest">Manual Entry</span>
          </div>
          <textarea 
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste syllabus text here..."
            className="w-full h-40 bg-slate-50 rounded-2xl p-4 outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-100"
          />
          <button 
            onClick={() => handleProcess(pastedText)}
            disabled={loading || !pastedText.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
            Generate Study Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center gap-2 font-bold animate-shake">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-10">
          <Loader2 className="animate-spin text-indigo-600 mb-6" size={60} />
          <h3 className="text-3xl font-black text-slate-900">Architecting Your Success...</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Gemini is analyzing syllabus difficulty, subject importance, and scheduling tasks across your {settings.completionDays}-day window.</p>
        </div>
      )}
    </div>
  );
};

export default PlanUploader;
