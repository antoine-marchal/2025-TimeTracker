import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, BarChart2 } from 'lucide-react';
import Timer from './components/Timer';
import Statistics from './components/Statistics';
import SettingsComponent from './components/Settings';
import { TimeEntry, AppSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [activeTab, setActiveTab] = useState<'timer' | 'statistics' | 'settings'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);
  const [userId, setUserId] = useState<string>(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId || uuidv4();
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem(`timeEntries_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`settings_${userId}`);
    return saved ? JSON.parse(saved) : {
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
      autoStartBreaks: false,
      autoStartWork: false,
      notifications: true,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      userId,
    };
  });

  // Initialize userId in localStorage
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`timeEntries_${userId}`, JSON.stringify(timeEntries));
  }, [timeEntries, userId]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`settings_${userId}`, JSON.stringify(settings));
    
    // Update dark mode class on document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, userId]);

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      if (!currentSession) {
        const newSession: TimeEntry = {
          id: Date.now(),
          startTime: new Date(),
          endTime: null,
          duration: 0,
          type: 'work',
          notes: '',
          userId,
        };
        setCurrentSession(newSession);
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (currentSession) {
      const endTime = new Date();
      const updatedSession: TimeEntry = {
        ...currentSession,
        endTime,
        duration: elapsedTime,
      };
      
      setTimeEntries(prev => [...prev, updatedSession]);
      setCurrentSession(null);
      setElapsedTime(0);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setCurrentSession(null);
  };

  const startBreak = () => {
    stopTimer();
    
    const newBreak: TimeEntry = {
      id: Date.now(),
      startTime: new Date(),
      endTime: null,
      duration: 0,
      type: 'break',
      notes: '',
      userId,
    };
    
    setCurrentSession(newBreak);
    setElapsedTime(0);
    setIsRunning(true);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings({ ...newSettings, userId });
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const addNoteToCurrentSession = (note: string) => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        notes: note,
      });
    }
  };

  const clearStatistics = () => {
    if (window.confirm('Are you sure you want to erase all statistics? This action cannot be undone.')) {
      setTimeEntries([]);
      localStorage.setItem(`timeEntries_${userId}`, JSON.stringify([]));
    }
  };

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-800'} flex flex-col`}>
      {/* Header */}
      <header className={`${settings.darkMode ? 'bg-dark-surface border-dark-border' : 'bg-white'} shadow-md py-4 border-b`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Clock className={`h-6 w-6 ${settings.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
              ant1mcl
              <span className={`text-sm ml-2 font-normal ${settings.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Time Tracker
              </span>
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              settings.darkMode 
                ? 'hover:bg-dark-hover active:bg-dark-active' 
                : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            aria-label="Toggle dark mode"
          >
            {settings.darkMode ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`${settings.darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md p-1 flex`}>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                activeTab === 'timer' 
                  ? settings.darkMode 
                    ? 'bg-dark-active text-purple-400' 
                    : 'bg-purple-100 text-purple-700'
                  : settings.darkMode
                    ? 'text-dark-text-secondary hover:bg-dark-hover'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5 mr-2" />
              Timer
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                activeTab === 'statistics'
                  ? settings.darkMode
                    ? 'bg-dark-active text-purple-400'
                    : 'bg-purple-100 text-purple-700'
                  : settings.darkMode
                    ? 'text-gray-200 hover:bg-dark-hover'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                activeTab === 'settings'
                  ? settings.darkMode
                    ? 'bg-dark-active text-purple-400'
                    : 'bg-purple-100 text-purple-700'
                  : settings.darkMode
                    ? 'text-dark-text-secondary hover:bg-dark-hover'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${settings.darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {activeTab === 'timer' && (
            <Timer
              isRunning={isRunning}
              elapsedTime={elapsedTime}
              currentSession={currentSession}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              stopTimer={stopTimer}
              resetTimer={resetTimer}
              startBreak={startBreak}
              addNoteToCurrentSession={addNoteToCurrentSession}
              darkMode={settings.darkMode}
              settings={settings}
              timeEntries={timeEntries}
            />
          )}
          
          {activeTab === 'statistics' && (
            <Statistics 
              timeEntries={timeEntries.filter(entry => entry.userId === userId)}
              darkMode={settings.darkMode}
              onClearStatistics={clearStatistics}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsComponent 
              settings={settings} 
              updateSettings={updateSettings}
              darkMode={settings.darkMode}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${settings.darkMode ? 'bg-dark-surface border-dark-border' : 'bg-white'} py-4 shadow-inner border-t`}>
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} ant1mcl - Time Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;