import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/results/my-results'),
      api.get('/results/analytics'),
    ]).then(([{ data: res }, { data: ana }]) => {
      setResults(res);
      setAnalytics(ana);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const subjectChartData = analytics?.subjectAverages
    ? Object.entries(analytics.subjectAverages).map(([name, avg]) => ({ name, average: avg }))
    : [];

  const radarData = subjectChartData.map((s) => ({ subject: s.name, score: s.average, fullMark: 100 }));

  const gradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'badge-success';
    if (g === 'B+' || g === 'B') return 'badge-info';
    if (g === 'C' || g === 'D') return 'badge-warning';
    return 'badge-danger';
  };

  const trendColor = { improving: 'text-emerald-600', declining: 'text-red-600', stable: 'text-amber-600', insufficient_data: 'text-gray-500' };

  return (
    <div className="space-y-6">
      {analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Average</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.overallAverage}%</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
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
              <h3 className="text-md font-semibold text-red-600 dark:text-red-400 mb-2">Areas for Improvement</h3>
              <ul className="space-y-1">
                {analytics.suggestions?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">&#9679;</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject Performance</h3>
              <ResponsiveContainer width="100%" height={280}>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skill Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">All Results</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results available yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">Exam</th>
                  <th className="table-header px-4 py-3">Subject</th>
                  <th className="table-header px-4 py-3">Marks</th>
                  <th className="table-header px-4 py-3">%</th>
                  <th className="table-header px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium">{r.exam?.name}</td>
                    <td className="px-4 py-3 text-sm">{r.exam?.subject?.name}</td>
                    <td className="px-4 py-3 text-sm">{r.marksObtained}/{r.exam?.totalMarks}</td>
                    <td className="px-4 py-3 text-sm">{r.percentage}%</td>
                    <td className="px-4 py-3"><span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
