
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings as SettingsIcon, 
  Upload, 
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { StudyTask, ViewType, StudySettings, SubjectType } from './types';
import PlanSetup from './components/PlanSetup';
import PlanUploader from './components/PlanUploader';
import Timetable from './components/Timetable';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('setup');
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [settings, setSettings] = useState<StudySettings>({
    daysPerWeek: 7,
    hoursPerDay: 8,
    subjectsPerDay: 3,
    completionDays: 45,
    startDate: new Date().toISOString().split('T')[0],
    subjectImportance: {
      'Math': 3, 'Physics': 3, 'Chemistry': 3, 'Economics': 3, 
      'Biology': 3, 'English': 3, 'Spanish': 3, 'Computer Science': 3
    }
  });

  // Persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('ca-tasks');
    const savedSettings = localStorage.getItem('ca-settings');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('ca-tasks', JSON.stringify(tasks));
    localStorage.setItem('ca-settings', JSON.stringify(settings));
  }, [tasks, settings]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      isCompleted: !t.isCompleted,
      completedAt: !t.isCompleted ? new Date().toISOString() : undefined 
    } : t));
  };

  const handleGeneratedTasks = (newTasks: StudyTask[]) => {
    // Completely overwrite existing tasks when a new syllabus is uploaded
    setTasks(newTasks);
    setActiveView('timetable');
  };

  const clearPlan = () => {
    if (window.confirm("Are you sure you want to clear your entire plan? This cannot be undone.")) {
      setTasks([]);
      setActiveView('setup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Cambridge Ace</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Grade 9 Prep</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveView('setup')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeView === 'setup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Config
            </button>
            <button 
              onClick={() => setActiveView('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeView === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Import
            </button>
            <button 
              onClick={() => setActiveView('timetable')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeView === 'timetable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Planner
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            {tasks.length > 0 && (
              <button 
                onClick={clearPlan}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Clear current plan"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeView === 'setup' && (
          <PlanSetup settings={settings} onUpdate={setSettings} onNext={() => setActiveView('upload')} />
        )}
        {activeView === 'upload' && (
          <PlanUploader settings={settings} onAddTasks={handleGeneratedTasks} onBack={() => setActiveView('setup')} />
        )}
        {activeView === 'timetable' && (
          <Timetable tasks={tasks} onToggle={toggleTask} settings={settings} />
        )}
      </main>
    </div>
  );
};

export default App;
