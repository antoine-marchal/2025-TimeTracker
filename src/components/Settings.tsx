import React, { useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  darkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, darkMode }) => {
  const [formState, setFormState] = useState<AppSettings>({ ...settings });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    
    // Show success message
    const successMessage = document.getElementById('settings-success');
    if (successMessage) {
      successMessage.classList.remove('opacity-0');
      setTimeout(() => {
        successMessage.classList.add('opacity-0');
      }, 3000);
    }
  };
  
  const minutesToSeconds = (minutes: number): number => {
    const parsed = parseInt(String(minutes), 10);
    return isNaN(parsed) ? 0 : parsed * 60;
  };

  const secondsToMinutes = (seconds: number): number => {
    const minutes = Math.floor(seconds / 60);
    return isNaN(minutes) ? 0 : minutes;
  };

  const inputClasses = `w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
    darkMode 
      ? 'bg-dark-border border-dark-border text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    darkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <SettingsIcon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} mr-2`} />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div id="settings-success" className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded transition-opacity duration-300 opacity-0">
          Settings saved successfully!
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-dark-hover' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Timer Durations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="workDuration" className={labelClasses}>
                Work Session (minutes)
              </label>
              <input
                type="number"
                id="workDuration"
                name="workDuration"
                min="1"
                max="120"
                value={secondsToMinutes(formState.workDuration) || ''}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value, 10);
                  setFormState(prev => ({
                    ...prev,
                    workDuration: minutesToSeconds(minutes),
                  }));
                }}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label htmlFor="breakDuration" className={labelClasses}>
                Break Duration (minutes)
              </label>
              <input
                type="number"
                id="breakDuration"
                name="breakDuration"
                min="1"
                max="60"
                value={secondsToMinutes(formState.breakDuration) || ''}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value, 10);
                  setFormState(prev => ({
                    ...prev,
                    breakDuration: minutesToSeconds(minutes),
                  }));
                }}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-dark-hover' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Automation</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoStartBreaks"
                name="autoStartBreaks"
                checked={formState.autoStartBreaks}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="autoStartBreaks" className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Auto-start breaks
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoStartWork"
                name="autoStartWork"
                checked={formState.autoStartWork}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="autoStartWork" className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Auto-start work sessions after breaks
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={formState.notifications}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Enable notifications
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;