import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Coffee } from 'lucide-react';
import { TimeEntry, AppSettings } from '../types';
import { formatTime } from '../utils/timeUtils';

interface TimerProps {
  isRunning: boolean;
  elapsedTime: number;
  currentSession: TimeEntry | null;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  startBreak: () => void;
  addNoteToCurrentSession: (note: string) => void;
  darkMode: boolean;
  settings: AppSettings;
  timeEntries: TimeEntry[];
}

const Timer: React.FC<TimerProps> = ({
  isRunning,
  elapsedTime,
  currentSession,
  startTimer,
  pauseTimer,
  stopTimer,
  resetTimer,
  startBreak,
  addNoteToCurrentSession,
  darkMode,
  settings,
  timeEntries,
}) => {
  const [notes, setNotes] = useState('');

  // Request notification permission when component mounts
  useEffect(() => {
    if (settings.notifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.notifications]);

  // Check for timer completion and handle notifications/autostart
  useEffect(() => {
    if (!currentSession || !isRunning) return;

    const targetDuration = currentSession.type === 'work' 
      ? settings.workDuration 
      : settings.breakDuration;

    if (elapsedTime >= targetDuration) {
      // Send notification if enabled and permission granted
      if (settings.notifications && Notification.permission === 'granted') {
        const title = 'Time\'s Up!';
        const message = currentSession.type === 'work'
          ? 'Work session completed! Time for a break.'
          : 'Break time is over! Ready to work?';

        // Create and show the notification
        const notification = new Notification(title, {
          body: message,
          icon: '/vite.svg',
          requireInteraction: true,
          silent: false
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Handle auto-start based on settings
      if (currentSession.type === 'work' && settings.autoStartBreaks) {
        stopTimer();
        startBreak();
      } else if (currentSession.type === 'break' && settings.autoStartWork) {
        stopTimer();
        startTimer();
      } else {
        stopTimer();
      }
    }
  }, [elapsedTime, currentSession, isRunning, settings, timeEntries, stopTimer, startBreak, startTimer]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    addNoteToCurrentSession(e.target.value);
  };

  const getSessionTypeLabel = () => {
    if (!currentSession) return 'Not Started';
    return currentSession.type === 'work' ? 'Work Session' : 'Break';
  };

  const getSessionTypeColor = () => {
    if (!currentSession) return darkMode ? 'bg-dark-border text-gray-300' : 'bg-gray-200';
    
    return currentSession.type === 'work'
      ? darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
      : darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Session Type Badge */}
      <div className={`px-4 py-1 rounded-full text-sm font-medium mb-4 ${getSessionTypeColor()}`}>
        {getSessionTypeLabel()}
      </div>
      
      {/* Timer Display */}
      <div className={`text-7xl font-bold mb-8 font-mono ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        {formatTime(elapsedTime)}
      </div>
      
      {/* Timer Controls */}
      <div className="flex space-x-4 mb-8">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all"
            aria-label="Start Timer"
          >
            <Play className="h-8 w-8" />
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg transition-all"
            aria-label="Pause Timer"
          >
            <Pause className="h-8 w-8" />
          </button>
        )}
        
        <button
          onClick={stopTimer}
          className={`${
            !currentSession 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600'
          } text-white rounded-full p-4 shadow-lg transition-all`}
          aria-label="Stop Timer"
          disabled={!currentSession}
        >
          <Square className="h-8 w-8" />
        </button>
        
        <button
          onClick={resetTimer}
          className={`${
            (!currentSession && elapsedTime === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white rounded-full p-4 shadow-lg transition-all`}
          aria-label="Reset Timer"
          disabled={!currentSession && elapsedTime === 0}
        >
          <RotateCcw className="h-8 w-8" />
        </button>
      </div>
      
      {/* Break Control */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={startBreak}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow flex items-center"
        >
          <Coffee className="h-5 w-5 mr-2" />
          Take a Break
        </button>
      </div>
      
      {/* Notes Section */}
      <div className="w-full max-w-md mt-4">
        <label htmlFor="notes" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Session Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            darkMode 
              ? 'bg-dark-border border-dark-border text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } ${!currentSession ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Add notes about what you're working on..."
          value={notes}
          onChange={handleNotesChange}
          disabled={!currentSession}
        ></textarea>
      </div>
    </div>
  );
};

export default Timer;