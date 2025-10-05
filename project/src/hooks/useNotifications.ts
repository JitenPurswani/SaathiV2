import { useEffect } from 'react';
import { useData } from '../contexts/DataContext';

export function useNotifications() {
  const { reminders } = useData();

  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();

      reminders.forEach(reminder => {
        if (reminder.isCompleted || !reminder.dueDate) return;

        const timeDiff = new Date(reminder.dueDate).getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / 1000 / 60);

        if (minutesUntil === 15 || minutesUntil === 5 || minutesUntil === 0) {
          sendNotification(reminder.title, {
            body: `Due ${minutesUntil === 0 ? 'now' : `in ${minutesUntil} minutes`}`,
            tag: reminder.id,
          });
        }

        if (minutesUntil < 0 && minutesUntil > -60) {
          const hoursOverdue = Math.floor(Math.abs(timeDiff) / 1000 / 60 / 60);
          if (hoursOverdue === 0 && Math.abs(minutesUntil) % 15 === 0) {
            sendNotification('Overdue Reminder', {
              body: reminder.title,
              tag: reminder.id,
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders]);
}

function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}
