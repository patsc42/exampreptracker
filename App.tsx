
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
  Trash2,
  PieChart
} from 'lucide-react';
import { StudyTask, ViewType, StudySettings, SubjectType } from './types';
import PlanSetup from './components/PlanSetup';
import PlanUploader from './components/PlanUploader';
import Timetable from './components/Timetable';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';

const App: React.FC = () => {
  // Lazy initialization prevents the "Empty state overwrite" bug on refresh
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('ca-settings');
    return saved ? JSON.parse(saved) : {
      daysPerWeek: 7,
      hoursPerDay: 8,
      subjectsPerDay: 3,
      completionDays: 45,
      startDate: new Date().toISOString().split('T')[0],
      subjectImportance: {
        'Math': 3, 'Physics': 3, 'Chemistry': 3, 'Economics': 3, 
        'Biology': 3, 'English': 3, 'Spanish': 3, 'Computer Science': 3
      }
    };
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('ca-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<ViewType>(() => {
    // Auto-route to planner/dashboard if data exists
    const savedTasks = localStorage.getItem('ca-tasks');
    if (savedTasks && JSON.parse(savedTasks).length > 0) return 'timetable';
    return 'setup';
  });

  // Sync to localStorage whenever tasks or settings change
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      {/* Responsive Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Trophy size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-none">Cambridge Ace</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Grade 9</p>
            </div>
          </div>

          {/* Improved Mobile Navigation: Now always visible and scrollable */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-hide">
              <NavButton 
                active={activeView === 'setup'} 
                onClick={() => setActiveView('setup')} 
                icon={<SettingsIcon size={14} />} 
                label="Config" 
              />
              <NavButton 
                active={activeView === 'upload'} 
                onClick={() => setActiveView('upload')} 
                icon={<Upload size={14} />} 
                label="Import" 
              />
              <NavButton 
                active={activeView === 'timetable'} 
                onClick={() => setActiveView('timetable')} 
                icon={<Calendar size={14} />} 
                label="Planner" 
              />
              {tasks.length > 0 && (
                <>
                  <NavButton 
                    active={activeView === 'stats'} 
                    onClick={() => setActiveView('stats')} 
                    icon={<PieChart size={14} />} 
                    label="Stats" 
                  />
                  <NavButton 
                    active={activeView === 'tasks'} 
                    onClick={() => setActiveView('tasks')} 
                    icon={<LayoutDashboard size={14} />} 
                    label="Today" 
                  />
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-2 shrink-0">
            {tasks.length > 0 && (
              <button 
                onClick={clearPlan}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Clear current plan"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="h-7 w-7 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {activeView === 'setup' && (
          <PlanSetup 
            settings={settings} 
            tasks={tasks}
            onUpdate={setSettings} 
            onUpdateTasks={setTasks}
            onNext={() => setActiveView('upload')} 
          />
        )}
        {activeView === 'upload' && (
          <PlanUploader 
            settings={settings} 
            onAddTasks={handleGeneratedTasks} 
            onBack={() => setActiveView('setup')} 
          />
        )}
        {activeView === 'timetable' && (
          <Timetable tasks={tasks} onToggle={toggleTask} settings={settings} />
        )}
        {activeView === 'stats' && (
          <Stats tasks={tasks} />
        )}
        {activeView === 'tasks' && (
          <Dashboard tasks={tasks} onToggle={toggleTask} onNavigate={setActiveView} />
        )}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
  >
    {icon}
    <span className={active ? 'inline' : 'hidden sm:inline'}>{label}</span>
  </button>
);

export default App;
