import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, RotateCcw, Brain, Volume2, VolumeX } from 'lucide-react';
import { playNotificationSound } from '../utils/sound';
import { notificationManager } from '../services/notificationManager';
import { toast } from 'react-hot-toast';

const TIMER_MODES = {
    focus: { label: 'Focus', minutes: 25 },
    shortBreak: { label: 'Short Break', minutes: 5 },
    longBreak: { label: 'Long Break', minutes: 15 }
};

const QUOTES = {
    focus: ['Pure Focus', 'Deep Work', 'Lock In', 'Stay Hard', 'No Distractions', 'Zone In'],
    shortBreak: ['Breathe', 'Hydrate', 'Stretch', 'Relax', 'Reset', 'Eyes Off'],
    longBreak: ['Recharge', 'Go Walk', 'Unplug', 'Rest Up', 'Refuel', 'Disconnect']
};

const PomodoroView = ({ preferences, onBack }) => {
    const [timerMode, setTimerMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(QUOTES.focus[0]);
    const [cycleCount, setCycleCount] = useState(0); // 0 to 4

    const timerRef = useRef(null);

    useEffect(() => {
        // Set random quote on mount
        setCurrentQuote(QUOTES[timerMode][Math.floor(Math.random() * QUOTES[timerMode].length)]);
    }, []);

    const handleTimerComplete = () => {
        setIsActive(false);

        // Play sound
        if (!isMuted) {
            playNotificationSound(preferences?.clutchTone || 'bell');
        }

        let nextMode = 'focus';
        let nextCycle = cycleCount;
        let notificationMessage = '';

        if (timerMode === 'focus') {
            const newCycleCount = cycleCount + 1;
            setCycleCount(newCycleCount);
            nextCycle = newCycleCount;

            if (newCycleCount >= 4) {
                nextMode = 'longBreak';
                notificationMessage = "Focus session complete! Take a long break. 🌴";
            } else {
                nextMode = 'shortBreak';
                notificationMessage = "Focus session complete! Time for a short break. ☕";
            }
        } else if (timerMode === 'shortBreak') {
            nextMode = 'focus';
            notificationMessage = "Break over! Back to focus. 🧠";
        } else if (timerMode === 'longBreak') {
            // Reset after long break
            nextMode = 'focus';
            setCycleCount(0);
            nextCycle = 0;
            notificationMessage = "Long break over! Ready to start a new cycle? 🚀";
            // Don't auto-start after long break, let user decide
            setTimeLeft(TIMER_MODES[nextMode].minutes * 60);
            setTimerMode(nextMode);
            setCurrentQuote(QUOTES[nextMode][Math.floor(Math.random() * QUOTES[nextMode].length)]);

            // Send notification but return early to avoid auto-start
            notificationManager.schedule(
                'pomodoro-complete',
                'Cycle Complete',
                notificationMessage,
                new Date(),
                preferences?.clutchTone
            );
            return;
        }

        // Send Notification
        notificationManager.schedule(
            'pomodoro-timer',
            'Timer Complete',
            notificationMessage,
            new Date(),
            preferences?.clutchTone
        );

        // Switch Mode and Auto-Start
        setTimerMode(nextMode);
        setTimeLeft(TIMER_MODES[nextMode].minutes * 60);
        setCurrentQuote(QUOTES[nextMode][Math.floor(Math.random() * QUOTES[nextMode].length)]);
        setIsActive(true); // Auto-start next timer
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) { // Only trigger if it was active
            handleTimerComplete();
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, isMuted, preferences, timerMode, cycleCount]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(TIMER_MODES[timerMode].minutes * 60);
    };

    const handleModeChange = (key) => {
        setTimerMode(key);
        setTimeLeft(TIMER_MODES[key].minutes * 60);
        setIsActive(false);
        // Reset cycle if manually changing to focus (optional, but keeps logic clean)
        if (key === 'focus' && timerMode === 'longBreak') {
            setCycleCount(0);
        }
        // Set new random quote for the mode
        setCurrentQuote(QUOTES[key][Math.floor(Math.random() * QUOTES[key].length)]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for SVG circle
    const totalTime = TIMER_MODES[timerMode].minutes * 60;
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - timeLeft / totalTime);

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-white font-sans animate-fade-in relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="w-full max-w-5xl mx-auto p-6 z-10 flex flex-col md:grid md:grid-cols-3 items-center gap-4">
                {/* Left: Back Button */}
                <div className="w-full md:w-auto flex justify-start">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold p-2 hover:bg-white/5 rounded-lg"
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>
                </div>

                {/* Center: Mode Switcher */}
                <div className="flex bg-[#1e293b] rounded-full p-1 border border-white/5 w-auto shadow-2xl shadow-black/20 justify-self-center gap-1 mx-auto">
                    {Object.entries(TIMER_MODES).map(([key, mode]) => (
                        <button
                            key={key}
                            onClick={() => handleModeChange(key)}
                            className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 whitespace-nowrap ${timerMode === key
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                {/* Right: Spacer for centering */}
                <div className="hidden md:block"></div>
            </div>

            {/* Main Timer Area */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-10">
                <div className="relative mb-12">
                    {/* Timer Circle */}
                    <div className="w-72 h-72 relative flex items-center justify-center">
                        {/* SVG Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                            {/* Background Track */}
                            <circle
                                cx="144"
                                cy="144"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-white/5"
                            />
                            {/* Progress Indicator */}
                            <circle
                                cx="144"
                                cy="144"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className={`text-accent transition-all duration-1000 ease-linear ${isActive ? 'drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]' : ''}`}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="flex flex-col items-center z-10">
                            <Brain size={32} className="text-accent mb-4 opacity-80" />
                            <div className="text-7xl font-black tracking-tighter tabular-nums leading-none mb-2">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">
                                {isActive ? 'Running' : 'Paused'}
                            </div>
                            <div className="text-sm text-accent/80 font-medium italic opacity-80 animate-fade-in">
                                {currentQuote}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Indicators */}
                <div className="flex items-center gap-4 mb-12">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Session</span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i <= cycleCount
                                        ? 'bg-accent shadow-[0_0_8px_rgba(var(--accent),0.5)] scale-110'
                                        : 'bg-[#1e293b] border border-white/5'
                                    }`}
                            ></div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">#{cycleCount}/4</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all active:scale-95 active:rotate-180 duration-500"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-[#0f172a] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isActive ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all active:scale-95 ${isMuted ? 'text-white/20' : 'text-white/60 hover:text-white'}`}
                    >
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PomodoroView;
