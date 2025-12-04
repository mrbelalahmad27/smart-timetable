import React, { useState, useRef } from 'react';
import { X, ChevronRight, Bell, Trash2, Link as LinkIcon, Plus, PenTool, Type, Eraser, Undo, Redo } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { toast } from 'react-hot-toast';

const COLORS = [
    '#ef5350', // Red
    '#ec407a', // Pink
    '#ab47bc', // Purple
    '#7e57c2', // Deep Purple
    '#5c6bc0', // Indigo
    '#42a5f5', // Blue
    '#29b6f6', // Light Blue
    '#26c6da', // Cyan
    '#26a69a', // Teal (Default)
    '#66bb6a', // Green
    '#9ccc65', // Light Green
    '#d4e157', // Lime
    '#ffee58', // Yellow
    '#ffca28', // Amber
    '#ffa726', // Orange
    '#ff7043'  // Deep Orange
];

const REPEAT_OPTIONS = ['Never', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_COLORS = {
    event: '#26a69a', // Teal
    task: '#42a5f5', // Blue
    habit: '#ab47bc' // Purple
};

const AddEventView = ({ onAdd, onDelete, currentDate, initialData, onBack }) => {
    const initialCategory = initialData?.category || 'event';

    const [category, setCategory] = useState(initialCategory);
    const [formData, setFormData] = useState({
        category: initialCategory,
        subject: '',
        type: '',
        building: '',
        room: '',
        teacher: '',
        repeat: 'Weekly',
        repeatDay: currentDate ? DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1] : 'Monday',
        startTime: '08:30',
        endTime: '09:15',
        duration: 60,
        deadline: '',
        priority: 'Medium',
        preferredWindow: '09:00',
        flexible: true,
        color: DEFAULT_COLORS[initialCategory] || DEFAULT_COLORS.event,
        reminders: [],
        links: [],
        notes: { text: '', drawing: null },
        date: initialData?.date || (currentDate ? currentDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        ...initialData
    });

    const [showRepeatOptions, setShowRepeatOptions] = useState(false);
    const [showReminderInput, setShowReminderInput] = useState(false);
    const [newReminderText, setNewReminderText] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newLinkText, setNewLinkText] = useState('');
    const [noteMode, setNoteMode] = useState('text'); // 'text' | 'draw'
    const canvasRef = useRef(null);
    const deadlineInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'links' | 'notes'

    const handleAddReminder = () => {
        if (!newReminderText || isNaN(newReminderText)) {
            toast.error('Please enter a valid number');
            return;
        }
        setFormData(prev => ({
            ...prev,
            reminders: [...prev.reminders, { label: `${newReminderText} min before`, time: parseInt(newReminderText) }]
        }));
        setNewReminderText('');
        setShowReminderInput(false);
    };

    const removeReminder = (index) => {
        setFormData(prev => ({
            ...prev,
            reminders: prev.reminders.filter((_, i) => i !== index)
        }));
    };

    const handleAddLink = () => {
        if (!newLinkText) return;
        setFormData(prev => ({
            ...prev,
            links: [...prev.links, newLinkText]
        }));
        setNewLinkText('');
        setShowLinkInput(false);
    };

    const handleNoteChange = (value) => {
        setFormData(prev => ({
            ...prev,
            notes: { ...prev.notes, text: value }
        }));
    };

    const handleDrawingChange = async () => {
        if (canvasRef.current) {
            const paths = await canvasRef.current.exportPaths();
            setFormData(prev => ({
                ...prev,
                notes: { ...prev.notes, drawing: paths }
            }));
        }
    };

    const handleDelete = () => {
        if (initialData && onDelete) {
            onDelete(initialData.id);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }
        // Pass ID if editing
        onAdd(formData, initialData?.id);
    };

    return (
        <div className="flex flex-col h-full bg-background animate-slide-in">
            {/* Header */}
            <div className="flex flex-col bg-background/95 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-textMuted hover:text-white transition-colors active:scale-95"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {initialData ? 'Edit' : 'New'} {category === 'task' ? 'Assignment' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </h2>
                    </div>
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors active:scale-95"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex px-6 pb-4 gap-4">
                    {['details', 'links', 'notes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-95 ${activeTab === tab
                                ? 'bg-white/10 text-white'
                                : 'bg-transparent text-textMuted hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {tab === 'links' ? `Links (${formData.links.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Selector - Only show in Details tab and if new */}
            {!initialData && activeTab === 'details' && (
                <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-white/[0.02]">
                    {[
                        { id: 'event', label: 'Event' },
                        { id: 'task', label: 'Assignment' },
                        { id: 'habit', label: 'Habit' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategory(cat.id);
                                setFormData(prev => ({ ...prev, category: cat.id, color: DEFAULT_COLORS[cat.id] }));
                            }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${category === cat.id
                                ? 'bg-accent text-black shadow-lg shadow-accent/20 scale-105'
                                : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {activeTab === 'details' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Subject Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">
                                {category === 'habit' ? 'Habit Name' : 'Subject'}
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-card border border-white/10 rounded-2xl p-5 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-xl font-bold shadow-sm"
                                autoFocus
                            />
                        </div>

                        {/* Dynamic Fields based on Category */}
                        {category === 'event' && (
                            <>
                                {/* Date Input - Only for non-recurring events */}
                                {formData.repeat === 'Never' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Start Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">End Time</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Location</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="building"
                                            value={formData.building}
                                            onChange={handleChange}
                                            placeholder="Building"
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors"
                                        />
                                        <input
                                            type="text"
                                            name="room"
                                            value={formData.room}
                                            onChange={handleChange}
                                            placeholder="Room"
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Details</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="teacher"
                                            value={formData.teacher}
                                            onChange={handleChange}
                                            placeholder="Teacher"
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors"
                                        />
                                        <input
                                            type="text"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            placeholder="Type (e.g. Lecture)"
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Redesigned Repeat Section */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-lg font-bold text-white">Repeat</h3>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Frequency</label>
                                        <div className="flex flex-wrap gap-2">
                                            {REPEAT_OPTIONS.map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, repeat: option }))}
                                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${formData.repeat === option
                                                        ? 'bg-accent text-black shadow-lg shadow-accent/20'
                                                        : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white border border-white/5'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.repeat === 'Weekly' && (
                                        <div className="space-y-3 animate-fade-in">
                                            <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Day</label>
                                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                                {DAYS.map(day => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, repeatDay: day }))}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-95 ${formData.repeatDay === day
                                                            ? 'bg-accent text-black shadow-lg shadow-accent/20 scale-110'
                                                            : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white border border-white/5'
                                                            }`}
                                                    >
                                                        {day.charAt(0)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {category === 'task' && (
                            <>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Deadline</label>
                                    <input
                                        ref={deadlineInputRef}
                                        type="datetime-local"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        onClick={() => deadlineInputRef.current?.showPicker()}
                                        className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Priority</label>
                                    <div className="flex gap-2">
                                        {['Low', 'Medium', 'High'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${formData.priority === p
                                                    ? p === 'High' ? 'bg-error text-white shadow-lg shadow-error/20' : p === 'Medium' ? 'bg-warning text-black shadow-lg shadow-warning/20' : 'bg-success text-black shadow-lg shadow-success/20'
                                                    : 'bg-white/5 text-textMuted hover:bg-white/10'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {category === 'habit' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date || ''}
                                            onChange={handleChange}
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Duration (Minutes)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="5"
                                            max="120"
                                            step="5"
                                            value={formData.duration}
                                            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                            className="flex-1 accent-accent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="w-16 text-center font-bold text-white bg-white/5 py-2 rounded-lg border border-white/10">
                                            {formData.duration}m
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Frequency</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowRepeatOptions(!showRepeatOptions)}
                                            className="text-accent text-xs font-bold uppercase tracking-wider hover:text-white transition-colors active:scale-95"
                                        >
                                            {formData.repeat}
                                        </button>
                                    </div>
                                    {showRepeatOptions && (
                                        <div className="grid grid-cols-3 gap-2 mt-2 animate-fade-in">
                                            {['Daily', 'Weekly', 'Weekdays', 'Weekends'].map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, repeat: option }));
                                                        setShowRepeatOptions(false);
                                                    }}
                                                    className={`p-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${formData.repeat === option
                                                        ? 'bg-accent text-black shadow-lg shadow-accent/10'
                                                        : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Reminders Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Reminders</label>
                                <button
                                    type="button"
                                    onClick={() => setShowReminderInput(true)}
                                    className="text-accent text-xs font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1 active:scale-95"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            {showReminderInput && (
                                <div className="flex gap-2 animate-fade-in">
                                    <input
                                        type="number"
                                        value={newReminderText}
                                        onChange={(e) => setNewReminderText(e.target.value)}
                                        placeholder="Minutes before"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleAddReminder}
                                        className="px-4 py-2 bg-accent text-black rounded-xl font-bold text-sm active:scale-95 transition-transform"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            {/* Quick Suggestions for Tasks */}
                            {category === 'task' && showReminderInput && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {[
                                        { label: '4 hr before', time: 240 },
                                        { label: '3 days before', time: 4320 },
                                        { label: '7 days before', time: 10080 }
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion.label}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    reminders: [...prev.reminders, { label: suggestion.label, time: suggestion.time }]
                                                }));
                                                setShowReminderInput(false);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-textMuted hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
                                        >
                                            {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {formData.reminders.map((reminder, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                        <Bell size={12} className="text-textMuted" />
                                        <span className="text-sm text-white font-medium">{reminder.label}</span>
                                        <button
                                            onClick={() => removeReminder(index)}
                                            className="text-textMuted hover:text-error transition-colors ml-1 active:scale-95"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Color</label>
                                <button
                                    type="button"
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg transition-transform active:scale-95 hover:scale-105"
                                    style={{ backgroundColor: formData.color }}
                                />
                            </div>

                            {showColorPicker && (
                                <div className="grid grid-cols-8 gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, color }));
                                                setShowColorPicker(false);
                                            }}
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 ${formData.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-accent text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            {initialData ? 'Save Changes' : 'Create ' + (category === 'task' ? 'Assignment' : category.charAt(0).toUpperCase() + category.slice(1))}
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>

                        <div className="h-20" /> {/* Spacer for bottom nav */}
                    </div>
                )}

                {/* Links Tab */}
                {activeTab === 'links' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Links & Resources</h3>
                            <button
                                onClick={() => setShowLinkInput(true)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors active:scale-95"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {showLinkInput && (
                            <div className="flex gap-2 animate-fade-in">
                                <input
                                    type="text"
                                    value={newLinkText}
                                    onChange={(e) => setNewLinkText(e.target.value)}
                                    placeholder="Paste link here..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddLink}
                                    className="px-4 py-2 bg-accent text-black rounded-xl font-bold text-sm active:scale-95 transition-transform"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            {formData.links.map((link, index) => (
                                <div key={index} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="p-2 rounded-full bg-white/5 text-accent">
                                        <LinkIcon size={16} />
                                    </div>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-white font-medium truncate hover:underline">
                                        {link}
                                    </a>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }))}
                                        className="p-2 text-textMuted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {formData.links.length === 0 && !showLinkInput && (
                                <div className="text-center py-10 text-textMuted text-sm">
                                    No links added yet
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="space-y-4 animate-fade-in h-full flex flex-col">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-textMuted uppercase tracking-wider ml-1">Notes</label>
                            <div className="flex bg-white/5 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setNoteMode('text')}
                                    className={`p-1.5 rounded-md transition-all active:scale-95 ${noteMode === 'text' ? 'bg-white text-black shadow-sm' : 'text-textMuted hover:text-white'}`}
                                >
                                    <Type size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNoteMode('draw')}
                                    className={`p-1.5 rounded-md transition-all active:scale-95 ${noteMode === 'draw' ? 'bg-white text-black shadow-sm' : 'text-textMuted hover:text-white'}`}
                                >
                                    <PenTool size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden flex-1 shadow-inner min-h-[400px]">
                            {noteMode === 'text' ? (
                                <ReactQuill
                                    theme="snow"
                                    value={formData.notes.text}
                                    onChange={handleNoteChange}
                                    className="text-white h-full"
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['clean']
                                        ]
                                    }}
                                />
                            ) : (
                                <div className="relative h-full bg-white min-h-[400px]">
                                    <ReactSketchCanvas
                                        ref={canvasRef}
                                        strokeWidth={4}
                                        strokeColor="black"
                                        canvasColor="transparent"
                                        onChange={handleDrawingChange}
                                        className="h-full"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => canvasRef.current?.undo()}
                                            className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100 active:scale-95 transition-transform"
                                        >
                                            <Undo size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => canvasRef.current?.redo()}
                                            className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100 active:scale-95 transition-transform"
                                        >
                                            <Redo size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => canvasRef.current?.clearCanvas()}
                                            className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100 active:scale-95 transition-transform"
                                        >
                                            <Eraser size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEventView;
