import React, { useState, useMemo } from 'react';
import { BarChart2, Clock, Calendar, TrendingUp, Coffee, FileText, ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { TimeEntry, DailyStats, WeeklyStats } from '../types';
import { formatTime, formatDate, getWeekNumber } from '../utils/timeUtils';

interface StatisticsProps {
  timeEntries: TimeEntry[];
  darkMode: boolean;
  onClearStatistics: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ timeEntries, darkMode, onClearStatistics }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [activeTab, setActiveTab] = useState<'summary' | 'sessions'>('summary');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [showBreaks, setShowBreaks] = useState(false);

  // Export statistics to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Start Time', 'End Time', 'Duration (minutes)', 'Type', 'Notes'];
    const csvData = timeEntries.map(entry => [
      formatDate(new Date(entry.startTime)),
      new Date(entry.startTime).toLocaleTimeString(),
      entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : '',
      Math.round(entry.duration / 60),
      entry.type,
      entry.notes.replace(/,/g, ';') // Replace commas with semicolons to prevent CSV issues
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `time-tracker-export-${formatDate(new Date())}.csv`);
  };

  // Calculate statistics based on time entries
  const stats = useMemo(() => {
    // Filter entries based on selected time range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let filteredEntries = [...timeEntries];
    
    if (timeRange === 'today') {
      filteredEntries = timeEntries.filter(entry => 
        new Date(entry.startTime).getTime() >= today.getTime()
      );
    } else if (timeRange === 'week') {
      filteredEntries = timeEntries.filter(entry => 
        new Date(entry.startTime).getTime() >= startOfWeek.getTime()
      );
    } else if (timeRange === 'month') {
      filteredEntries = timeEntries.filter(entry => 
        new Date(entry.startTime).getTime() >= startOfMonth.getTime()
      );
    }

    // Filter entries based on showBreaks setting
    const displayedEntries = showBreaks 
      ? filteredEntries 
      : filteredEntries.filter(entry => entry.type === 'work');
    
    // Calculate total work and break time
    const totalWorkTime = filteredEntries
      .filter(entry => entry.type === 'work')
      .reduce((total, entry) => total + entry.duration, 0);
    
    const totalBreakTime = filteredEntries
      .filter(entry => entry.type === 'shortBreak' || entry.type === 'longBreak')
      .reduce((total, entry) => total + entry.duration, 0);
    
    const workSessions = filteredEntries.filter(entry => entry.type === 'work').length;
    const shortBreaks = filteredEntries.filter(entry => entry.type === 'shortBreak').length;
    const longBreaks = filteredEntries.filter(entry => entry.type === 'longBreak').length;
    
    // Group by day for daily stats
    const entriesByDay = displayedEntries.reduce((acc, entry) => {
      const date = formatDate(new Date(entry.startTime));
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);
    
    const dailyStats: DailyStats[] = Object.keys(entriesByDay).map(date => {
      const entries = entriesByDay[date];
      const workTime = entries
        .filter(entry => entry.type === 'work')
        .reduce((total, entry) => total + entry.duration, 0);
      
      const breakTime = entries
        .filter(entry => entry.type === 'shortBreak' || entry.type === 'longBreak')
        .reduce((total, entry) => total + entry.duration, 0);
      
      return {
        date,
        totalWorkTime: workTime,
        totalBreakTime: breakTime,
        sessions: entries.filter(entry => entry.type === 'work').length,
      };
    });
    
    // Sort daily stats by date (newest first)
    dailyStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      totalWorkTime,
      totalBreakTime,
      workSessions,
      shortBreaks,
      longBreaks,
      dailyStats,
      filteredEntries: displayedEntries,
      mostProductiveDay: dailyStats.length > 0 
        ? dailyStats.reduce((prev, current) => 
            prev.totalWorkTime > current.totalWorkTime ? prev : current
          )
        : null,
    };
  }, [timeEntries, timeRange, showBreaks]);
  
  // Calculate productivity score (0-100)
  const productivityScore = useMemo(() => {
    if (stats.totalWorkTime === 0 && stats.totalBreakTime === 0) return 0;
    
    // Base score on work-to-break ratio (ideal is around 5:1)
    const workBreakRatio = stats.totalBreakTime > 0 
      ? stats.totalWorkTime / stats.totalBreakTime 
      : stats.totalWorkTime > 0 ? 100 : 0;
    
    // Adjust score based on how close to ideal ratio
    let score = 0;
    if (workBreakRatio >= 4 && workBreakRatio <= 6) {
      score = 100; // Ideal ratio
    } else if (workBreakRatio > 6) {
      score = 100 - Math.min(((workBreakRatio - 6) / 4) * 100, 50); // Too much work
    } else if (workBreakRatio < 4 && workBreakRatio > 0) {
      score = Math.max((workBreakRatio / 4) * 100, 50); // Too many breaks
    }
    
    return Math.round(score);
  }, [stats.totalWorkTime, stats.totalBreakTime]);

  // Format date and time for session display
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle session expansion
  const toggleSessionExpansion = (id: number) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <BarChart2 className={`h-6 w-6 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          Statistics
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={exportToCSV}
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>

          <button
            onClick={onClearStatistics}
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${
              darkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showBreaks}
              onChange={(e) => setShowBreaks(e.target.checked)}
              className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
            />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Show Breaks
            </span>
          </label>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === 'today' 
                  ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === 'week'
                  ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === 'month'
                  ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === 'all'
                  ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'summary'
              ? darkMode
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-purple-600 border-b-2 border-purple-600'
              : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'sessions'
              ? darkMode
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-purple-600 border-b-2 border-purple-600'
              : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sessions
        </button>
      </div>
      
      {activeTab === 'summary' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-lg shadow p-6 border-l-4 border-purple-500 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Total Work Time</p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>{formatTime(stats.totalWorkTime)}</p>
                </div>
                <Clock className={`h-8 w-8 ${
                  darkMode ? 'text-purple-400' : 'text-purple-500'
                }`} />
              </div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mt-2`}>
                {stats.workSessions} work {stats.workSessions === 1 ? 'session' : 'sessions'}
              </p>
            </div>
            
            <div className={`rounded-lg shadow p-6 border-l-4 border-green-500 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Total Break Time</p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>{formatTime(stats.totalBreakTime)}</p>
                </div>
                <Coffee className={`h-8 w-8 ${
                  darkMode ? 'text-green-400' : 'text-green-500'
                }`} />
              </div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mt-2`}>
                {stats.shortBreaks} short, {stats.longBreaks} long breaks
              </p>
            </div>
            
            <div className={`rounded-lg shadow p-6 border-l-4 border-blue-500 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Productivity Score</p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>{productivityScore}/100</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${
                  darkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
              <div className={`w-full rounded-full h-2.5 mt-3 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-2.5 rounded-full ${
                    productivityScore >= 80 ? 'bg-green-500' : 
                    productivityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${productivityScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Daily Stats */}
          {stats.dailyStats.length > 0 ? (
            <div className={`rounded-lg shadow overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Date
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Work Time
                      </th>
                      {showBreaks && (
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Break Time
                        </th>
                      )}
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Sessions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {stats.dailyStats.map((day) => (
                      <tr key={`daily-stats-${day.date}`} className={day.date === stats.mostProductiveDay?.date 
                        ? darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'
                        : ''
                      }>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          darkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {day.date}
                          {day.date === stats.mostProductiveDay?.date && (
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              darkMode
                                ? 'bg-purple-900 text-purple-200'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              Most Productive
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {formatTime(day.totalWorkTime)}
                        </td>
                        {showBreaks && (
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {formatTime(day.totalBreakTime)}
                          </td>
                        )}
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {day.sessions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={`rounded-lg shadow p-8 text-center ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Calendar className={`h-12 w-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>No data available</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Start tracking your work time to see statistics for this period.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'sessions' && (
        <div className={`rounded-lg shadow overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <FileText className={`h-5 w-5 mr-2 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              {showBreaks ? 'All Sessions' : 'Work Sessions'} with Notes
            </h3>
          </div>
          
          {stats.filteredEntries.length > 0 ? (
            <div className={`divide-y ${
              darkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {stats.filteredEntries
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map((session, index) => (
                  <div key={`${session.id}-${session.type}-${index}`} className={`p-4 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSessionExpansion(session.id)}
                    >
                      <div>
                        <div className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatDateTime(new Date(session.startTime))}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.type === 'work'
                              ? darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                              : session.type === 'shortBreak'
                                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.type === 'work' ? 'Work' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                          </span>
                        </div>
                        <div className={`text-sm mt-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Duration: {formatTime(session.duration)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {session.notes && (
                          <span className={`mr-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            darkMode
                              ? 'bg-purple-900 text-purple-200'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            Has Notes
                          </span>
                        )}
                        {expandedSession === session.id ? (
                          <ChevronUp className={`h-5 w-5 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        ) : (
                          <ChevronDown className={`h-5 w-5 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        )}
                      </div>
                    </div>
                    
                    {expandedSession === session.id && (
                      <div className={`mt-4 p-4 rounded-md ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <h4 className={`text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Notes:</h4>
                        {session.notes ? (
                          <p className={`whitespace-pre-wrap ${
                            darkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>{session.notes}</p>
                        ) : (
                          <p className={`italic ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>No notes for this session.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className={`h-12 w-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>No sessions found</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Start tracking your time to see your sessions here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;