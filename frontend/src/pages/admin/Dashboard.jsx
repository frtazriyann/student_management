import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiClipboard, FiBookOpen, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await api.get('/dashboard/admin');
        setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const revenueData = MONTHS.map((m) => {
    const found = data?.monthlyRevenue?.find((r) => r._id === m);
    return { month: m.substring(0, 3), amount: found?.total || 0 };
  });

  const paymentPieData = [
    { name: 'Paid', value: data?.totalCollected || 0 },
    { name: 'Due', value: data?.totalDue || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data?.totalStudents || 0} icon={FiUsers} color="indigo" subtitle={`${data?.activeStudents || 0} active`} />
        <StatCard title="Fees Collected" value={`$${data?.totalCollected || 0}`} icon={FiDollarSign} color="green" subtitle="This month" />
        <StatCard title="Total Due" value={`$${data?.totalDue || 0}`} icon={FiDollarSign} color="red" subtitle="Pending fees" />
        <StatCard title="Pending Tasks" value={data?.pendingTasks || 0} icon={FiClipboard} color="yellow" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Upcoming Exams" value={data?.upcomingExams || 0} icon={FiBookOpen} color="purple" />
        <StatCard title="Today's Attendance" value={data?.todayAttendance || 0} icon={FiCheckSquare} color="blue" subtitle="Present today" />
        <StatCard title="Active Students" value={data?.activeStudents || 0} icon={FiTrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {paymentPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Payments</h3>
        {data?.recentPayments?.length > 0 ? (
          <div className="space-y-3">
            {data.recentPayments.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.student?.name}</p>
                  <p className="text-xs text-gray-500">{p.month} {p.year} - {p.student?.batch}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${p.amount}</p>
                  <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent payments</p>
        )}
      </div>
    </div>
  );
}
