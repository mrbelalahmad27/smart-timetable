import React from 'react';
import { X, Clock, CheckCircle2, FileText, Calendar, Trash2 } from 'lucide-react';
import { getRandomQuote } from '../utils/quotes';

const AssignmentView = ({ tasks = [], onUpdateTask, onBack, onEditTask }) => {
    if (!tasks) return null;

    // Split tasks into Active and Completed
    const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

    const handleToggleComplete = (task) => {
        onUpdateTask({ ...task, completed: !task.completed });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };

    const calculateTimeRemaining = (deadline) => {
        if (!deadline) return { text: 'No Deadline', isOverdue: false };
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;

        if (diff < 0) return { text: 'Overdue', isOverdue: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return { text: `${days} Day${days > 1 ? 's' : ''} Left`, isOverdue: false };
        if (hours > 0) return { text: `${hours} Hour${hours > 1 ? 's' : ''} Left`, isOverdue: false };
        return { text: 'Due Soon', isOverdue: false };
    };

    const calculateProgress = (task) => {
        if (task.completed) return 100;
        if (!task.deadline) return 0;

        // Mock start date as 7 days before deadline if not present, or use current time relative to deadline
        const end = new Date(task.deadline).getTime();
        const now = new Date().getTime();
        // Assuming a standard 7-day assignment window if no start date is tracked
        // Ideally we would track 'createdAt' or 'startDate' in the task object
        const start = task.startDate ? new Date(task.startDate).getTime() : end - (7 * 24 * 60 * 60 * 1000);

        const total = end - start;
        const elapsed = now - start;

        let percent = Math.round((elapsed / total) * 100);
        return Math.min(Math.max(percent, 0), 100);
    };

    const TaskCard = ({ task, isCompleted }) => {
        const { text: timeText, isOverdue } = calculateTimeRemaining(task.deadline);
        const progress = calculateProgress(task);

        if (isCompleted) {
            return (
                <div
                    onClick={() => onEditTask && onEditTask(task)}
                    className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-4 relative overflow-hidden shadow-md mb-3 group cursor-pointer transition-all hover:bg-white/5 active:scale-[0.99] opacity-60 hover:opacity-100 flex items-center justify-between"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: task.color || '#ef5350' }}></div>

                    <div className="pl-3 flex-1">
                        <h3 className="text-base font-bold text-white line-through text-white/50">{task.subject}</h3>
                        <p className="text-[10px] text-success font-bold uppercase tracking-wider">Completed</p>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task);
                        }}
                        className="p-2 rounded-full bg-success text-black shadow-lg shadow-success/20 transition-transform hover:scale-110 active:scale-90"
                    >
                        <CheckCircle2 size={18} className="fill-current" />
                    </button>
                </div>
            );
        }

        return (
            <div
                onClick={() => onEditTask && onEditTask(task)}
                className={`bg-[#1E1E1E] border border-white/5 rounded-2xl p-4 relative overflow-hidden shadow-lg mb-3 group cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.99]`}
            >
                {/* Left Color Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: task.color || '#ef5350' }}></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-1 pl-2">
                    <div>
                        <h3 className={`text-lg font-bold text-white`}>{task.subject}</h3>
                        <p className="text-textMuted text-xs">Assignment Details</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task);
                        }}
                        className={`p-1.5 rounded-lg transition-all bg-white/5 text-white/20 hover:bg-white/10 hover:text-white`}
                    >
                        <CheckCircle2 size={20} />
                    </button>
                </div>

                {/* Badge */}
                <div className="pl-2 mb-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isOverdue ? 'bg-error/10 text-error border-error/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                        {isOverdue ? 'OVERDUE' : 'IN PROGRESS'}
                    </span>
                </div>

                {/* Date Section */}
                <div className="mx-1 bg-black/40 rounded-lg p-3 mb-3 flex justify-between items-center border border-white/5">
                    <div>
                        <p className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-0.5">START</p>
                        <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                            <Calendar size={12} className="text-accent" />
                            <span>{formatDate(new Date().toISOString())}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-0.5">DUE</p>
                        <div className="flex items-center gap-1.5 text-white text-xs font-bold justify-end">
                            <Clock size={12} className={isOverdue ? 'text-error' : 'text-accent'} />
                            <span>{formatDate(task.deadline)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mx-1 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-textMuted">Time Remaining</span>
                        <span className={isOverdue ? 'text-error' : 'text-success'}>{timeText}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-error' : 'bg-success'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    const [quote, setQuote] = React.useState('');

    React.useEffect(() => {
        setQuote(getRandomQuote('productivity'));
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-background animate-slide-in pb-24 no-scrollbar overscroll-y-none">
            {/* Sticky Header */}
            <div className="p-4 pb-2 sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-textMuted hover:text-white transition-colors active:scale-95">
                        <X size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Assignments</h2>
                </div>
            </div>

            <div className="px-4 pb-2">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{getGreeting()}</h1>
                    <p className="text-textMuted text-sm">{quote}</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center shadow-md">
                        <span className="text-xl font-black text-accent">{activeTasks.length}</span>
                        <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Pending</span>
                    </div>
                    <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center shadow-md">
                        <span className="text-xl font-black text-error">{tasks.filter(t => !t.completed && new Date(t.deadline) - new Date() < 172800000).length}</span>
                        <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Due Soon</span>
                    </div>
                    <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center shadow-md">
                        <span className="text-xl font-black text-success">{completedTasks.length}</span>
                        <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Done</span>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Active Assignments */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 pl-2">To Do ({activeTasks.length})</h3>
                    <div className="space-y-1">
                        {activeTasks.length > 0 ? (
                            activeTasks.map(task => (
                                <TaskCard key={task.id} task={task} isCompleted={false} />
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <FileText size={32} className="text-textMuted mx-auto mb-3 opacity-50" />
                                <p className="text-textMuted text-sm font-medium">No active assignments</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Assignments */}
                {completedTasks.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 pl-2">Completed ({completedTasks.length})</h3>
                        <div className="space-y-1">
                            {completedTasks.map(task => (
                                <TaskCard key={task.id} task={task} isCompleted={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentView;
