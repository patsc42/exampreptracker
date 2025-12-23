
import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle, Sparkles, AlertCircle, ExternalLink, Key } from 'lucide-react';
import { parseStudyPlan } from '../services/geminiService';
import { StudyTask } from '../types';

interface Props {
  onAddTasks: (tasks: StudyTask[]) => void;
}

const PlanUploader: React.FC<Props> = ({ onAddTasks }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isKeyIssue?: boolean } | null>(null);
  const [success, setSuccess] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleError = (err: any) => {
    if (err.message === "API_KEY_MISSING") {
      setError({ 
        message: "API Key Required", 
        isKeyIssue: true 
      });
    } else {
      setError({ message: "AI Analysis Failed. Please try a clearer text format." });
    }
  };

  const processResults = (rawTasks: any[]) => {
    const formatted: StudyTask[] = rawTasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      subject: t.subject || 'General',
      topic: t.topic || 'New Topic',
      dueDate: t.dueDate || new Date().toISOString(),
      isCompleted: false,
      priority: (t.priority?.toLowerCase() as any) || 'medium'
    }));
    
    if (formatted.length > 0) {
      onAddTasks(formatted);
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleTextParse = async () => {
    if (!pastedText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await parseStudyPlan(pastedText);
      processResults(result);
    } catch (err) {
      handleError(err);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await parseStudyPlan({ data: base64, mimeType: file.type });
          processResults(result);
        } catch (err) {
          handleError(err);
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      handleError(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <header className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Import Study Plan</h2>
        <p className="text-slate-500 mt-2">Let AI build your schedule from notes or text.</p>
      </header>

      {success ? (
        <div className="bg-emerald-50 p-8 rounded-[40px] text-center space-y-4 border border-emerald-100">
          <CheckCircle size={48} className="text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold text-emerald-900">Imported Successfully!</h3>
          <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold">Import More</button>
        </div>
      ) : (
        <div className="space-y-6">
          {error?.isKeyIssue && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[32px] space-y-3">
              <div className="flex items-center space-x-2 text-amber-700 font-bold">
                <Key size={20} />
                <span>Vercel Configuration Needed</span>
              </div>
              <p className="text-sm text-amber-600 leading-relaxed">
                To use AI extraction on Vercel, you must add your Gemini API Key in your project settings.
              </p>
              <div className="flex space-x-4 pt-2">
                <a 
                  href="https://vercel.com/docs/projects/environment-variables" 
                  target="_blank" 
                  className="text-xs font-bold text-indigo-600 flex items-center hover:underline"
                >
                  Vercel Docs <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            </div>
          )}

          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={loading} />
            <div className="border-2 border-dashed border-slate-200 bg-white rounded-[40px] p-12 flex flex-col items-center group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all">
              {loading ? <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} /> : <Upload size={40} className="text-slate-300 mb-4" />}
              <p className="font-bold text-slate-700">Upload Plan Photo</p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
            <textarea 
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste syllabus details or list of topics here..."
              className="w-full h-40 resize-none outline-none text-lg text-slate-800 placeholder:text-slate-300"
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleTextParse}
                disabled={loading || !pastedText.trim()}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                <span>Generate Tasks</span>
              </button>
            </div>
          </div>
          
          {error && !error.isKeyIssue && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-center text-sm font-medium border border-rose-100 flex items-center justify-center space-x-2">
              <AlertCircle size={18} />
              <span>{error.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanUploader;
