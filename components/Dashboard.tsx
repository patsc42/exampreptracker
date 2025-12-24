
import React, { useState, useEffect, useMemo } from 'react';
import { StudyTask, ViewType } from '../types';
import { CheckCircle2, Circle, Clock, Flame, BrainCircuit, Target, ArrowRight } from 'lucide-react';
import { getStudyMotivation } from '../services/geminiService';

interface Props {
  tasks: StudyTask[];
  onToggle: (id: string) => void;
  onNavigate: (v: ViewType) => void;
}

const Dashboard: React.FC<Props> = ({ tasks, onToggle, onNavigate }) => {
  const [motivation, setMotivation] = useState("Your journey to 9 A*s starts with today's tasks.");
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    const fetchMotivation = async () => {
      if (tasks.length > 0) {
        setLoadingMotivation(true);
        try {
          const msg = await getStudyMotivation(tasks);
          setMotivation(msg);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMotivation(false);
        }
      }
    };
    fetchMotivation();
  }, [tasks.length]);

  const streak = useMemo(() => {
    // Explicitly type completedDates as string[] to ensure correct inference later
    const completedDates: string[] = tasks
      .filter(t => t.isCompleted && t.completedAt)
      .map(t => new Date(t.completedAt!).toDateString());
    
    // Explicitly type uniqueDates as string[] to fix "unknown" type error in the subsequent map
    const uniqueDates: string[] = Array.from(new Set(completedDates));
    if (uniqueDates.length === 0) return 0;

    // Fixed the error where d was inferred as unknown by ensuring uniqueDates is string[]
    const sortedDates = uniqueDates.map(d => new Date(d).getTime()).sort((a, b) => b - a);
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const latestDate = new Date(sortedDates[0]).toDateString();
    if (latestDate !== today && latestDate !== yesterday) return 0;

    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff = (sortedDates[i] - sortedDates[i+1]) / 86400000;
      if (diff <= 1.1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [tasks]);

  const subjectStats = useMemo(() => {
    const stats: Record<string, { total: number; done: number }> = {};
    tasks.forEach(task => {
      if (!stats[task.subject]) stats[task.subject] = { total: 0, done: 0 };
      stats[task.subject].total++;
      if (task.isCompleted) stats[task.subject].done++;
    });

    return Object.entries(stats).map(([name, s]) => ({
      name,
      percent: Math.round((s.done / s.total) * 100)
    })).sort((a, b) => b.percent - a.percent);
  }, [tasks]);

  const completedToday = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;
  
  const upcomingTasks = tasks
    .filter(t => !t.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500'];

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Kyra! 👋</h2>
        <p className="text-slate-500">Ready to crush your Grade 9 Cambridge exams?</p>
      </header>

      {/* Motivation Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <BrainCircuit className="text-indigo-200" size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">AI Tutor Insight</span>
          </div>
          <p className="text-lg md:text-xl font-medium leading-relaxed italic">
            "{loadingMotivation ? "Thinking of something inspiring..." : motivation}"
          </p>
        </div>
        <SparkleBg />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Target className="text-rose-600" />} 
          title="Overall Progress" 
          value={`${progressPercent}%`} 
          subtitle="Completion Rate"
          color="rose"
        />
        <StatCard 
          icon={<Flame className="text-orange-600" />} 
          title="Current Streak" 
          value={`${streak} ${streak === 1 ? 'Day' : 'Days'}`} 
          subtitle={streak > 0 ? "You're on fire!" : "Start your streak today!"}
          color="orange"
        />
        <StatCard 
          icon={<Clock className="text-emerald-600" />} 
          title="Daily Goal" 
          value={`${completedToday}/${Math.max(5, Math.ceil(totalTasks/30))}`} 
          subtitle="Today's Target"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Priority Tasks</h3>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-indigo-600 text-sm font-semibold flex items-center hover:translate-x-1 transition-transform"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
                onClick={() => onToggle(task.id)}
              >
                <div className="mr-4">
                  <Circle className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{task.topic}</p>
                  <p className="text-xs text-slate-500">{task.subject} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                  task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                  task.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {task.priority}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <p>No upcoming tasks. Good job!</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Subject Focus</h3>
          <div className="space-y-6">
            {subjectStats.length > 0 ? subjectStats.slice(0, 5).map((subject, idx) => (
              <SubjectProgress 
                key={subject.name} 
                label={subject.name} 
                percent={subject.percent} 
                color={colors[idx % colors.length]} 
              />
            )) : (
              <div className="text-center py-10 text-slate-400">
                <p>No subjects tracked yet.</p>
                <button 
                  onClick={() => onNavigate('upload')}
                  className="mt-2 text-indigo-600 text-sm font-bold"
                >
                  Import a study plan →
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtitle: string; color: string }> = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start space-x-4">
    <div className={`p-3 rounded-2xl bg-${color}-50`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 my-0.5">{value}</h4>
      <p className="text-slate-400 text-xs">{subtitle}</p>
    </div>
  </div>
);

const SubjectProgress: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-semibold">
      <span className="text-slate-700">{label}</span>
      <span className="text-slate-500">{percent}%</span>
    </div>
    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const SparkleBg = () => (
  <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10 pointer-events-none">
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="100" fill="white" />
    </svg>
  </div>
);

export default Dashboard;
