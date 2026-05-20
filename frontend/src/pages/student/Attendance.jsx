import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my-attendance')
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const presentCount = data?.records?.filter((r) => r.status === 'present').length || 0;
  const absentCount = data?.records?.filter((r) => r.status === 'absent').length || 0;
  const lateCount = data?.records?.filter((r) => r.status === 'late').length || 0;

  const pieData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
    { name: 'Late', value: lateCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data?.totalDays || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
          <p className="text-3xl font-bold text-emerald-600">{presentCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
          <p className="text-3xl font-bold text-red-600">{absentCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance %</p>
          <p className={`text-3xl font-bold ${data?.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
            {data?.percentage || 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Attendance Overview</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No attendance data yet</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Attendance</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data?.records?.slice(0, 20).map((r) => (
              <div key={r._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                  {r.status}
                </span>
              </div>
            ))}
            {(!data?.records || data.records.length === 0) && (
              <p className="text-center text-gray-500 py-4">No records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
