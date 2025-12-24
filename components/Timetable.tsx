
import React, { useState, useMemo } from 'react';
import { StudyTask, StudySettings, SubjectType } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle, X, Target, CalendarDays, BookOpen } from 'lucide-react';

interface Props {
  tasks: StudyTask[];
  onToggle: (id: string) => void;
  settings: StudySettings;
}

const Timetable: React.FC<Props> = ({ tasks, onToggle, settings }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);

  const maxWeeks = useMemo(() => Math.max(...tasks.map(t => t.week), 1), [tasks]);
  
  const weekTasks = useMemo(() => 
    tasks.filter(t => t.week === currentWeek), 
  [tasks, currentWeek]);

  const getSubjectColor = (subj: SubjectType) => {
    const colors: Record<string, string> = {
      'Math': 'bg-blue-100 text-blue-700 border-blue-200',
      'Physics': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Chemistry': 'bg-teal-100 text-teal-700 border-teal-200',
      'Economics': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Biology': 'bg-rose-100 text-rose-700 border-rose-200',
      'English': 'bg-amber-100 text-amber-700 border-amber-200',
      'Spanish': 'bg-orange-100 text-orange-700 border-orange-200',
      'Computer Science': 'bg-violet-100 text-violet-700 border-violet-200',
    };
    return colors[subj] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Improved date logic to correctly map day names to dates
  const getDayInfo = (dayIndex: number) => {
    const start = new Date(settings.startDate);
    // Add dayIndex days to start date
    const offset = (currentWeek - 1) * 7 + dayIndex;
    const current = new Date(start.getTime() + offset * 86400000);
    
    return {
      dateStr: current.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      dayName: current.toLocaleDateString('en-GB', { weekday: 'long' }),
      fullDate: current.toISOString().split('T')[0]
    };
  };

  const completedTotal = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTotal / tasks.length) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center max-w-2xl mx-auto">
        <CalendarDays size={48} className="text-slate-200 mb-4" />
        <p className="text-slate-400 font-bold">Your journey hasn't started yet.</p>
        <p className="text-slate-300 text-sm mt-1">Import your syllabus to generate a custom timetable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Integrated Dashboard Row: Compact and higher up */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Navigation & Progress Block */}
        <div className="md:col-span-8 bg-white p-3 md:p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
              disabled={currentWeek === 1}
              className="p-2 hover:bg-slate-50 rounded-xl disabled:opacity-20 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[100px]">
              <h2 className="text-lg font-black text-slate-900 leading-tight">Week {currentWeek}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syllabus Flow</p>
            </div>
            <button 
              onClick={() => setCurrentWeek(w => Math.min(maxWeeks, w + 1))}
              disabled={currentWeek === maxWeeks}
              className="p-2 hover:bg-slate-50 rounded-xl disabled:opacity-20 transition-all text-slate-500"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-4 border-l border-slate-100">
             <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Progress</span>
                <span className="text-[10px] font-bold text-slate-400">{progressPercent}%</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
          </div>
        </div>

        {/* Stats Summary Block */}
        <div className="md:col-span-4 bg-indigo-600 p-3 md:p-4 rounded-[24px] shadow-lg shadow-indigo-100 flex items-center justify-around text-white">
           <div className="text-center">
             <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">Completed</p>
             <p className="text-lg font-black">{completedTotal}</p>
           </div>
           <div className="w-px h-8 bg-white/20" />
           <div className="text-center">
             <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">Remaining</p>
             <p className="text-lg font-black">{tasks.length - completedTotal}</p>
           </div>
           <div className="w-px h-8 bg-white/20" />
           <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
             <Target size={20} />
           </div>
        </div>
      </div>

      {/* Timetable Grid: Tighter padding and optimized layout */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-4 text-left border-b border-slate-100 w-44 font-black text-slate-400 uppercase text-[9px] tracking-widest">Date & Day</th>
              {Array.from({ length: settings.subjectsPerDay }).map((_, i) => (
                <th key={i} className="p-4 text-left border-b border-slate-100 font-black text-slate-400 uppercase text-[9px] tracking-widest">
                  Subject Slot {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
              const info = getDayInfo(dayIndex);
              const dayTasks = weekTasks.filter(t => t.day === dayIndex);
              return (
                <tr key={dayIndex} className="group hover:bg-slate-50/30 transition-colors">
                  <td 
                    className="p-4 border-b border-slate-100 cursor-pointer"
                    onClick={() => setSelectedDayIndex(dayIndex)}
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">{info.dayName}</span>
                      <span className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-tighter">{info.dateStr}</span>
                    </div>
                  </td>
                  {Array.from({ length: settings.subjectsPerDay }).map((_, i) => {
                    const task = dayTasks[i];
                    return (
                      <td key={i} className="p-2 md:p-3 border-b border-slate-100">
                        {task ? (
                          <div 
                            onClick={() => setSelectedTask(task)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 flex flex-col items-center justify-center text-center h-16 ${getSubjectColor(task.subject)} ${task.isCompleted ? 'opacity-30 grayscale' : 'shadow-sm'}`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">{task.subject}</span>
                            {task.isCompleted && <CheckCircle size={12} className="mt-1" />}
                          </div>
                        ) : (
                          <div className="h-16 rounded-xl bg-slate-50/30 border border-dashed border-slate-100" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1"><CheckCircle size={12} /> Auto-saving active</span>
        <span>•</span>
        <span>Target Batch: March 2026</span>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal onClose={() => setSelectedTask(null)}>
          <div className="space-y-5">
            <div className="flex justify-between items-start">
               <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getSubjectColor(selectedTask.subject)}`}>
                {selectedTask.subject}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Week {selectedTask.week}
              </div>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <BookOpen size={10} /> Learning Objective
              </h4>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedTask.topic}</h3>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scheduled For</p>
                <p className="font-bold text-indigo-600">{getDayInfo(selectedTask.day).dayName}, {getDayInfo(selectedTask.day).dateStr}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Effort Level</p>
                <p className="font-bold text-slate-700">{selectedTask.priority === 'high' ? '🔥 High' : '⚡ Moderate'}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                onToggle(selectedTask.id);
                setSelectedTask(null);
              }}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${selectedTask.isCompleted ? 'bg-slate-300' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700'}`}
            >
              {selectedTask.isCompleted ? 'Move to Pending' : 'Mark as Mastered'}
            </button>
          </div>
        </Modal>
      )}

      {/* Day Agenda Modal */}
      {selectedDayIndex !== null && (
        <Modal onClose={() => setSelectedDayIndex(null)}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{getDayInfo(selectedDayIndex).dayName}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getDayInfo(selectedDayIndex).dateStr}</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {weekTasks.filter(t => t.day === selectedDayIndex).length > 0 ? (
              weekTasks.filter(t => t.day === selectedDayIndex).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => onToggle(t.id)}
                  className={`flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer group ${getSubjectColor(t.subject)} ${t.isCompleted ? 'opacity-30 grayscale' : 'hover:scale-[1.01] shadow-sm'}`}
                >
                  <div className="mr-3 mt-1">
                    {t.isCompleted ? <CheckCircle className="text-emerald-600" size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-0.5">{t.subject}</p>
                    <p className="font-bold text-base leading-snug">{t.topic}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-300 font-bold uppercase text-xs tracking-widest">
                Relax. No study tasks today.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

export default Timetable;
