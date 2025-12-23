
import React, { useMemo } from 'react';
import { StudyTask } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  tasks: StudyTask[];
}

const Stats: React.FC<Props> = ({ tasks }) => {
  // Real calculation for weekly graph
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return last7Days.map(dateStr => {
      const date = new Date(dateStr);
      const count = tasks.filter(t => 
        t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === dateStr
      ).length;
      
      return {
        name: dayNames[date.getDay()],
        completed: count,
        fullDate: dateStr
      };
    });
  }, [tasks]);

  // Real data for Summary Metrics
  const summary = useMemo(() => {
    const completedTasks = tasks.filter(t => t.isCompleted);
    const totalCount = tasks.length;
    
    // Average tasks per day
    let avg = 0;
    if (tasks.length > 0) {
      const createdDates = tasks.map(t => t.id.split('-')[1]).filter(id => id).map(Number);
      const startTimestamp = createdDates.length > 0 ? Math.min(...createdDates) : Date.now();
      const daysDiff = Math.max(1, Math.ceil((Date.now() - startTimestamp) / 86400000));
      avg = Math.round((completedTasks.length / daysDiff) * 10) / 10;
    }

    // Consistency (last 7 days)
    const activeDaysCount = chartData.filter(d => d.completed > 0).length;
    const consistency = Math.round((activeDaysCount / 7) * 100);

    // Best Subject
    const subjects: Record<string, { total: number; done: number }> = {};
    tasks.forEach(t => {
      if (!subjects[t.subject]) subjects[t.subject] = { total: 0, done: 0 };
      subjects[t.subject].total++;
      if (t.isCompleted) subjects[t.subject].done++;
    });

    let bestSub = 'None';
    let maxPct = -1;
    Object.entries(subjects).forEach(([name, stats]) => {
      const pct = stats.done / stats.total;
      if (pct > maxPct) {
        maxPct = pct;
        bestSub = name;
      }
    });

    // Focus Grade
    const overallPct = totalCount > 0 ? (completedTasks.length / totalCount) * 100 : 0;
    let grade = 'Focusing...';
    if (overallPct > 90) grade = 'A*';
    else if (overallPct > 75) grade = 'A';
    else if (overallPct > 60) grade = 'B';
    else if (overallPct > 45) grade = 'C';

    return { avg, consistency, bestSub, grade };
  }, [tasks, chartData]);

  const subjectData = useMemo(() => {
    const counts = tasks.reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.name === curr.subject);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: curr.subject, value: 1 });
      }
      return acc;
    }, []);
    return counts;
  }, [tasks]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Performance Insights</h2>
        <p className="text-slate-500">Real-time analysis of your study habits</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Syllabus Balance</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {subjectData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                <span className="text-[10px] text-slate-500 font-medium truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryItem label="Avg Tasks/Day" value={summary.avg.toString()} />
        <SummaryItem label="Study Consistency" value={`${summary.consistency}%`} />
        <SummaryItem label="Best Subject" value={summary.bestSub} />
        <SummaryItem label="Focus Grade" value={summary.grade} />
      </div>
    </div>
  );
};

const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-xl font-bold text-slate-900 truncate px-2">{value}</p>
  </div>
);

export default Stats;
