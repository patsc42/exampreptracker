
import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle, Sparkles, AlertCircle, Info } from 'lucide-react';
import { parseStudyPlan } from '../services/geminiService';
import { StudyTask } from '../types';

interface Props {
  onAddTasks: (tasks: StudyTask[]) => void;
}

const PlanUploader: React.FC<Props> = ({ onAddTasks }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; sub?: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleError = (err: any) => {
    console.error("PlanUploader Error:", err);
    if (!process.env.API_KEY) {
      setError({ 
        message: "API Key Not Configured", 
        sub: "You need to add the API_KEY environment variable in your Vercel project settings." 
      });
    } else {
      setError({ 
        message: "AI Processing Failed", 
        sub: "The model had trouble reading that. Try simplifying the text format." 
      });
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
          const result = await parseStudyPlan({ 
            data: base64, 
            mimeType: file.type 
          });
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
    } else {
      setError({ message: "No tasks identified", sub: "The AI couldn't find a clear study plan in that input." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Import Study Plan</h2>
        <p className="text-slate-500 mt-2">Let our AI build your schedule. Upload a photo of your handwritten plan or paste your syllabus list.</p>
      </header>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Success!</h3>
          <p className="text-emerald-700">Your study plan has been successfully imported and added to your tracker.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold shadow-md hover:bg-emerald-700 transition-colors"
          >
            Import Another
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* File Upload Area */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={loading}
            />
            <div className={`
              border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all
              ${loading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30'}
            `}>
              {loading ? (
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
              ) : (
                <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <Upload size={32} />
                </div>
              )}
              <p className="text-lg font-bold text-slate-700">{loading ? "Analyzing Plan..." : "Upload Photo or PDF"}</p>
              <p className="text-slate-400 text-sm mt-1">Handwritten schedules, syllabus lists, or timetables</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">or paste text</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Text Area */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm focus-within:border-indigo-400 transition-all">
            <textarea 
              placeholder="Example: &#10;Physics - Chapter 4 Waves - Tuesday&#10;Maths - Differentiation - Next Friday..." 
              className="w-full h-40 resize-none outline-none text-slate-900 bg-white caret-indigo-600 text-lg leading-relaxed placeholder:text-slate-300"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={loading}
              spellCheck={false}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-slate-400 text-xs italic">
                <Info size={14} className="mr-1" /> AI will structure this into tasks
              </div>
              <button 
                onClick={handleTextParse}
                disabled={loading || !pastedText.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                <span>Generate with AI</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-3 text-rose-600 bg-rose-50 p-5 rounded-3xl border border-rose-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle size={24} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm">{error.message}</p>
                {error.sub && <p className="text-xs text-rose-500 mt-1 leading-relaxed">{error.sub}</p>}
                {!process.env.API_KEY && (
                  <div className="mt-3 p-3 bg-white/50 rounded-xl text-[10px] font-mono text-rose-900 break-all border border-rose-200/50">
                    Missing 'API_KEY' in Environment Variables
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanUploader;
