import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/my-notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      // silent fail
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const typeIcon = {
    fee_reminder: '💰', class_reminder: '📚', exam_reminder: '📝',
    task_deadline: '📋', general: '📢',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>

      {notifications.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <FiBell className="mx-auto mb-2" size={32} />
          No notifications
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => n.status !== 'read' && markAsRead(n._id)}
              className={`card cursor-pointer transition-colors ${n.status !== 'read' ? 'border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{typeIcon[n.type] || '📢'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{n.title}</h4>
                    {n.status !== 'read' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
