
import React from 'react';
import { StudySettings, SubjectType } from '../types';
import { Clock, Calendar, BookOpen, Star, ArrowRight, CalendarDays } from 'lucide-react';

interface Props {
  settings: StudySettings;
  onUpdate: (s: StudySettings) => void;
  onNext: () => void;
}

const subjects: SubjectType[] = ['Math', 'Physics', 'Chemistry', 'Economics', 'Biology', 'English', 'Spanish', 'Computer Science'];

const PlanSetup: React.FC<Props> = ({ settings, onUpdate, onNext }) => {
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

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900">Plan Your Success</h2>
        <p className="text-slate-500 mt-2 text-lg">Customize your preparation strategy to fit your lifestyle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-indigo-600" /> Study Intensity
          </h3>
          
          <div className="space-y-4">
            <ConfigSlider 
              label="Days per week" 
              value={settings.daysPerWeek} 
              min={1} max={7} 
              onChange={v => onUpdate({...settings, daysPerWeek: v})}
            />
            <ConfigSlider 
              label="Hours per day" 
              value={settings.hoursPerDay} 
              min={1} max={16} 
              onChange={v => onUpdate({...settings, hoursPerDay: v})}
            />
            <ConfigSlider 
              label="Subjects per day" 
              value={settings.subjectsPerDay} 
              min={1} max={8} 
              onChange={v => onUpdate({...settings, subjectsPerDay: v})}
            />
            <ConfigSlider 
              label="Completion Window (Days)" 
              value={settings.completionDays} 
              min={7} max={180} 
              onChange={v => onUpdate({...settings, completionDays: v})}
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
              <CalendarDays size={16} className="text-indigo-600" /> When do you want to start?
            </h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setStartDatePreset('today')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settings.startDate === today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setStartDatePreset('tomorrow')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settings.startDate === tomorrow ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Tomorrow
              </button>
              <input 
                type="date" 
                value={settings.startDate}
                onChange={e => onUpdate({...settings, startDate: e.target.value})}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-amber-500" /> Subject Importance
          </h3>
          <p className="text-sm text-slate-400">Rate subjects by how much focus they need (Multiple can have the same grade).</p>
          
          <div className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map(subj => (
              <div key={subj} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                <span className="font-semibold text-slate-700">{subj}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => updateImportance(subj, star)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        settings.subjectImportance[subj] >= star ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border border-slate-200'
                      }`}
                    >
                      <Star size={12} fill={settings.subjectImportance[subj] >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={onNext}
          className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          Next: Import Syllabus <ArrowRight />
        </button>
      </div>
    </div>
  );
};

const ConfigSlider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-indigo-600 font-black">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

export default PlanSetup;
