import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  Upload, 
  Plus, 
  Bell, 
  Settings,
  Menu,
  X,
  Sparkles,
  Trophy,
  BookOpen,
  CalendarDays,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Key
} from 'lucide-react';
import { StudyTask, ViewType, StudyPlan } from './types';
import Dashboard from './components/Dashboard';
import TaskTracker from './components/TaskTracker';
import Stats from './components/Stats';
import PlanUploader from './components/PlanUploader';

// Fix: Define AIStudio interface to resolve "Subsequent property declarations must have the same type" error
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(!!process.env.API_KEY);

  // Load state from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('cambridge-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('cambridge-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const checkKey = async () => {
    if (process.env.API_KEY) {
      setApiKeyReady(true);
      return;
    }
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeyReady(hasKey);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeyReady(true);
    }
  };

  const daysRemaining = useMemo(() => {
    const examDate = new Date('2026-03-01');
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.isCompleted;
        return { 
          ...t, 
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const handleAddTasks = (newTasks: StudyTask[]) => {
    setTasks(prev => [...prev, ...newTasks]);
    setActiveView('tasks');
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const preparationProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const NavItem: React.FC<{ view: ViewType; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  // API Key Gate UI
  if (!apiKeyReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-2">
            <Key size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Connection Required</h1>
            <p className="text-slate-500 mt-2 leading-relaxed">
              To use AI features like study plan extraction, the app needs a Gemini API Key.
            </p>
          </div>
          
          {window.aistudio ? (
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center space-x-2"
            >
              <Sparkles size={20} />
              <span>Connect Gemini API</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vercel Setup Guide</p>
                <ol className="text-sm text-slate-600 space-y-3 font-medium">
                  <li className="flex items-start"><span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] mr-2 shrink-0 mt-0.5">1</span> Open project settings in Vercel</li>
                  <li className="flex items-start"><span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] mr-2 shrink-0 mt-0.5">2</span> Add <code className="bg-white px-1 py-0.5 border border-slate-200 rounded text-indigo-600">API_KEY</code> variable</li>
                  <li className="flex items-start"><span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] mr-2 shrink-0 mt-0.5">3</span> Paste your key & Redeploy</li>
                </ol>
              </div>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="inline-flex items-center text-xs text-indigo-600 font-bold hover:underline"
              >
                Get a Paid API Key <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          )}
          
          <button 
            onClick={() => setApiKeyReady(true)}
            className="text-slate-400 text-xs hover:text-slate-600 transition-colors underline"
          >
            Continue without AI features
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Trophy size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-indigo-950">Cambridge Ace</h1>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem view="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem view="tasks" icon={<CheckSquare size={20} />} label="Task List" />
            <NavItem view="stats" icon={<BarChart3 size={20} />} label="Analytics" />
            <NavItem view="upload" icon={<Upload size={20} />} label="Import Plan" />
          </nav>

          <div className="mt-auto p-5 bg-indigo-50 rounded-3xl border border-indigo-100 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform duration-500">
              <CalendarDays size={80} />
            </div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-3">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Target: March 2026</span>
            </div>
            <div className="mb-4">
              <div className="text-3xl font-black text-indigo-950 leading-none">{daysRemaining}</div>
              <div className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-tighter">Days until Exams</div>
            </div>
            <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000" 
                style={{ width: `${preparationProgress}%` }} 
              />
            </div>
            <p className="text-[10px] text-indigo-600 mt-2 font-bold flex justify-between">
              <span>Progress</span>
              <span>{preparationProgress}%</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-50 ring-offset-2">
              K
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {activeView === 'dashboard' && (
              <Dashboard 
                tasks={tasks} 
                onToggle={toggleTask} 
                onNavigate={(v) => setActiveView(v)}
              />
            )}
            {activeView === 'tasks' && (
              <TaskTracker tasks={tasks} onToggle={toggleTask} />
            )}
            {activeView === 'stats' && (
              <Stats tasks={tasks} />
            )}
            {activeView === 'upload' && (
              <PlanUploader onAddTasks={handleAddTasks} />
            )}
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <nav className="lg:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 sticky bottom-0 z-30 shadow-lg">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`p-2 rounded-lg flex flex-col items-center space-y-1 ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            onClick={() => setActiveView('tasks')}
            className={`p-2 rounded-lg flex flex-col items-center space-y-1 ${activeView === 'tasks' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <CheckSquare size={20} />
            <span className="text-[10px] font-medium">Tasks</span>
          </button>
          <button 
            onClick={() => setActiveView('stats')}
            className={`p-2 rounded-lg flex flex-col items-center space-y-1 ${activeView === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <BarChart3 size={20} />
            <span className="text-[10px] font-medium">Stats</span>
          </button>
          <button 
            onClick={() => setActiveView('upload')}
            className={`p-2 rounded-lg flex flex-col items-center space-y-1 ${activeView === 'upload' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Upload size={20} />
            <span className="text-[10px] font-medium">Upload</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;