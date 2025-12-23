
import React, { useState } from 'react';
import { StudyTask } from '../types';
import { Search, Filter, CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react';

interface Props {
  tasks: StudyTask[];
  onToggle: (id: string) => void;
}

const TaskTracker: React.FC<Props> = ({ tasks, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && !task.isCompleted) || 
                      (activeTab === 'completed' && task.isCompleted);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Study Tasks</h2>
          <p className="text-slate-500">Manage your daily preparation load</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search subjects or topics..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        {(['all', 'pending', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`flex items-center p-5 rounded-3xl border transition-all cursor-pointer group ${
              task.isCompleted 
                ? 'bg-slate-50 border-slate-100 opacity-70' 
                : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
            }`}
          >
            <div className="mr-4">
              {task.isCompleted ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : (
                <Circle className="text-slate-300 group-hover:text-indigo-400" size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-slate-900 truncate ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                {task.topic}
              </h4>
              <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                <span className="font-semibold text-indigo-600">{task.subject}</span>
                <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(task.dueDate).toDateString()}</span>
              </div>
            </div>
            <div className={`hidden md:block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 
              task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {task.priority} Priority
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTracker;
