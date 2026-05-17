import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentRoutine() {
  const { user } = useAuthStore();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/routines', { params: { batch: user?.batch } })
      .then(({ data }) => setRoutines(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner size="lg" />;

  const routinesByDay = DAYS.reduce((acc, day) => {
    acc[day] = routines.filter((r) => r.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const typeColor = (t) => ({
    regular: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    special: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[t] || '');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Weekly Class Routine — {user?.batch}
      </h3>

      {routines.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No routine scheduled for your batch</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="card">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">{day}</h4>
              {routinesByDay[day].length === 0 ? (
                <p className="text-sm text-gray-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {routinesByDay[day].map((r) => (
                    <div key={r._id} className="flex items-center gap-4 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400 w-28">
                        {r.startTime} - {r.endTime}
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.subject?.name}</span>
                      <span className={`badge text-xs ${typeColor(r.type)}`}>{r.type}</span>
                      {r.room && <span className="text-xs text-gray-500">Room: {r.room}</span>}
                      {r.notice && <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">{r.notice}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
