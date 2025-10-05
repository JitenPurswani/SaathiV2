import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, Trash2, AlertCircle, Plus } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Reminder, Priority } from '../types';
import { format } from '../lib/dateUtils';

export function RemindersView() {
  const { reminders, updateReminder, deleteReminder } = useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const upcomingReminders = reminders.filter(
    r => !r.isCompleted && r.dueDate && new Date(r.dueDate) > new Date()
  );

  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date();
      upcomingReminders.forEach(reminder => {
        if (reminder.dueDate) {
          const timeDiff = new Date(reminder.dueDate).getTime() - now.getTime();
          const minutesUntil = Math.floor(timeDiff / 1000 / 60);

          if (minutesUntil <= 15 && minutesUntil > 0) {
            if (Notification.permission === 'granted') {
              new Notification('Reminder', {
                body: reminder.title,
                icon: '/icon.png',
              });
            }
          }
        }
      });
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [upcomingReminders]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const isOverdue = (reminder: Reminder) => {
    if (!reminder.dueDate || reminder.isCompleted) return false;
    return new Date(reminder.dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Reminders</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No reminders found</p>
            <p className="text-sm text-gray-500 mt-1">Use voice input to add a reminder</p>
          </div>
        ) : (
          sortedReminders.map(reminder => (
            <div
              key={reminder.id}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${reminder.isCompleted
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : 'bg-white border-gray-200 hover:shadow-md'
                }
                ${isOverdue(reminder) ? 'border-red-300 bg-red-50' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateReminder(reminder.id, { isCompleted: !reminder.isCompleted })}
                  className="flex-shrink-0 mt-1"
                >
                  {reminder.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          reminder.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}
                      >
                        {reminder.title}
                      </h3>
                      {reminder.notes && (
                        <p className="text-sm text-gray-600 mt-1">{reminder.notes}</p>
                      )}
                      {reminder.originalVoiceInput && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{reminder.originalVoiceInput}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${getPriorityColor(reminder.priority)}
                      `}
                    >
                      {reminder.priority}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {reminder.reminderType}
                    </span>

                    {reminder.dueDate && (
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border
                          ${isOverdue(reminder)
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                          }
                        `}
                      >
                        {isOverdue(reminder) && <AlertCircle className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        {format(reminder.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
