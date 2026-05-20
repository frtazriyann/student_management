import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Analytics() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/students?limit=200').then(({ data }) => setStudents(data.students)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    setLoading(true);
    api.get(`/results/analytics/${selectedStudent}`)
      .then(({ data }) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStudent]);

  const subjectChartData = analytics?.subjectAverages
    ? Object.entries(analytics.subjectAverages).map(([name, avg]) => ({ name, average: avg }))
    : [];

  const performanceData = analytics?.subjectPerformance
    ? Object.entries(analytics.subjectPerformance).flatMap(([subject, scores]) =>
        scores.map((s, i) => ({ exam: `Exam ${i + 1}`, subject, percentage: Math.round(s.percentage) }))
      )
    : [];

  const radarData = subjectChartData.map((s) => ({ subject: s.name, score: s.average, fullMark: 100 }));

  const trendColor = { improving: 'text-emerald-600', declining: 'text-red-600', stable: 'text-amber-600', insufficient_data: 'text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Performance Analytics</h3>
            <p className="text-sm text-gray-500">AI-powered student performance analysis</p>
          </div>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input-field w-auto min-w-[200px]"
          >
            <option value="">Select a student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.batch})</option>)}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" />}

      {analytics && !loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Average</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.overallAverage}%</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Performance Trend</p>
              <p className={`text-xl font-bold capitalize ${trendColor[analytics.trend]}`}>{analytics.trend?.replace('_', ' ')}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Prediction</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 capitalize">{analytics.predictedPerformance?.replace('_', ' ')}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Weak Subjects</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{analytics.weakSubjects?.length || 0}</p>
            </div>
          </div>

          {analytics.weakSubjects?.length > 0 && (
            <div className="card border-l-4 border-l-red-500">
              <h3 className="text-md font-semibold text-red-600 dark:text-red-400 mb-2">Weak Subjects & Suggestions</h3>
              <ul className="space-y-2">
                {analytics.suggestions?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">&#9679;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject-wise Average</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {performanceData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {!selectedStudent && !loading && (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Select a student to view performance analytics</p>
        </div>
      )}
    </div>
  );
}
