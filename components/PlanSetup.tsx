
import React, { useRef } from 'react';
import { StudySettings, SubjectType, StudyTask } from '../types';
import { Clock, Star, ArrowRight, CalendarDays, Download, Upload as UploadIcon, ShieldCheck } from 'lucide-react';

interface Props {
  settings: StudySettings;
  tasks: StudyTask[];
  onUpdate: (s: StudySettings) => void;
  onUpdateTasks: (t: StudyTask[]) => void;
  onNext: () => void;
}

const subjects: SubjectType[] = ['Math', 'Physics', 'Chemistry', 'Economics', 'Biology', 'English', 'Spanish', 'Computer Science'];

const PlanSetup: React.FC<Props> = ({ settings, tasks, onUpdate, onUpdateTasks, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImportance = (subj: string, val: number) => {
    onUpdate({
      ...settings,
      subjectImportance: { ...settings.subjectImportance, [subj]: val }
    });
  };

  const setStartDatePreset = (preset: 'today' | 'tomorrow') => {
    const d = new Date();
    if (preset === 'tomorrow') d.setDate(d.getDate() + 1);
    onUpdate({ ...settings, startDate: d.toISOString().split('T')[0] });
  };

  const handleExport = () => {
    const data = JSON.stringify({ settings, tasks });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cambridge-ace-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings && data.tasks) {
          onUpdate(data.settings);
          onUpdateTasks(data.tasks);
          alert("Backup loaded successfully!");
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Plan Your Success</h2>
        <p className="text-slate-500 mt-2 text-base md:text-lg">Your study engine is ready. Adjust the gears below.</p>
      </div>

      {/* Portability Suite: Added for Vercel persistence across devices */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 leading-tight">Data Portability</h4>
            <p className="text-xs text-slate-500 mt-0.5">Move your study plan between devices manually.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export Backup
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
          >
            <UploadIcon size={14} /> Load Backup
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".json" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} /> Study Intensity
          </h3>
          
          <div className="space-y-4">
            <ConfigSlider label="Days per week" value={settings.daysPerWeek} min={1} max={7} onChange={v => onUpdate({...settings, daysPerWeek: v})} />
            <ConfigSlider label="Hours per day" value={settings.hoursPerDay} min={1} max={16} onChange={v => onUpdate({...settings, hoursPerDay: v})} />
            <ConfigSlider label="Subjects per day" value={settings.subjectsPerDay} min={1} max={8} onChange={v => onUpdate({...settings, subjectsPerDay: v})} />
            <ConfigSlider label="Completion Window (Days)" value={settings.completionDays} min={7} max={180} onChange={v => onUpdate({...settings, completionDays: v})} />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
              <CalendarDays size={16} className="text-indigo-600" /> Start Date
            </h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setStartDatePreset('today')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settings.startDate === today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setStartDatePreset('tomorrow')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settings.startDate === tomorrow ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}
              >
                Tomorrow
              </button>
              <input 
                type="date" 
                value={settings.startDate}
                onChange={e => onUpdate({...settings, startDate: e.target.value})}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 outline-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-amber-500" size={20} /> Focus Weights
          </h3>
          <p className="text-xs text-slate-400">Rate subjects by priority. High stars = More topics scheduled.</p>
          
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map(subj => (
              <div key={subj} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                <span className="font-semibold text-slate-700 text-sm">{subj}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => updateImportance(subj, star)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        settings.subjectImportance[subj] >= star ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border border-slate-200'
                      }`}
                    >
                      <Star size={10} fill={settings.subjectImportance[subj] >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onNext}
          className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          {tasks.length > 0 ? "Re-import Syllabus" : "Next: Import Syllabus"} <ArrowRight />
        </button>
      </div>
    </div>
  );
};

const ConfigSlider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className="text-indigo-600 font-black text-sm">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

export default PlanSetup;
