import { useState, useEffect } from 'react';
import { FiDollarSign, FiClipboard, FiCheckSquare, FiBookOpen } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student')
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const attendanceMap = {};
  data?.attendanceStats?.forEach((a) => { attendanceMap[a._id] = a.count; });
  const totalAtt = Object.values(attendanceMap).reduce((a, b) => a + b, 0);
  const presentCount = attendanceMap.present || 0;
  const attPercentage = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

  const resultChartData = data?.recentResults?.map((r) => ({
    exam: r.exam?.name?.substring(0, 15) || 'Exam',
    percentage: r.percentage || 0,
    subject: r.exam?.subject?.name || '',
  })) || [];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {data?.student?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{data?.student?.name}</h2>
            <p className="text-sm text-gray-500">{data?.student?.email} | Batch: {data?.student?.batch}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {data?.student?.subjects?.map((s) => (
                <span key={s._id} className="badge badge-info text-xs">{s.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Payment Status"
          value={data?.currentPayment?.status === 'paid' ? 'Paid' : 'Due'}
          icon={FiDollarSign}
          color={data?.currentPayment?.status === 'paid' ? 'green' : 'red'}
          subtitle={`$${data?.totalDue || 0} total due`}
        />
        <StatCard title="Pending Tasks" value={data?.pendingTasks || 0} icon={FiClipboard} color="yellow" />
        <StatCard title="Attendance" value={`${attPercentage}%`} icon={FiCheckSquare} color="blue" subtitle={`${presentCount}/${totalAtt} days`} />
        <StatCard title="Recent Exams" value={data?.recentResults?.length || 0} icon={FiBookOpen} color="purple" />
      </div>

      {resultChartData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Exam Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resultChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data?.currentPayment && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Month Payment</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{data.currentPayment.month} {data.currentPayment.year}</p>
              <p className="text-lg font-semibold">Paid: ${data.currentPayment.amount}</p>
            </div>
            <div className="text-right">
              {data.currentPayment.dueAmount > 0 && (
                <p className="text-lg font-semibold text-red-600">Due: ${data.currentPayment.dueAmount}</p>
              )}
              <span className={`badge ${data.currentPayment.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                {data.currentPayment.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
