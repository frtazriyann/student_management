import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [batch, setBatch] = useState('');
  const [batches, setBatches] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/students?limit=200').then(({ data }) => {
      setStudents(data.students);
      const uniqueBatches = [...new Set(data.students.map((s) => s.batch))];
      setBatches(uniqueBatches);
      if (uniqueBatches.length > 0) setBatch(uniqueBatches[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!batch || !date) return;
    api.get('/attendance', { params: { batch, date } }).then(({ data }) => {
      const map = {};
      data.attendance?.forEach((a) => {
        map[a.student?._id || a.student] = a.status;
      });
      setAttendance(map);
    }).catch(() => {});
  }, [batch, date]);

  const filteredStudents = students.filter((s) => s.batch === batch);

  const toggleAttendance = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = filteredStudents.map((s) => ({
        student: s._id,
        date,
        status: attendance[s._id] || 'absent',
        batch,
      }));
      await api.post('/attendance/mark', { records });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch</label>
          <select value={batch} onChange={(e) => setBatch(e.target.value)} className="input-field">
            {batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 sm:mt-0 self-end">
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {batch} - {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-600">Present: {Object.values(attendance).filter((v) => v === 'present').length}</span>
            <span className="text-red-600">Absent: {filteredStudents.length - Object.values(attendance).filter((v) => v === 'present' || v === 'late').length}</span>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No students in this batch</p>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['present', 'absent', 'late'].map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleAttendance(s._id, status)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        attendance[s._id] === status
                          ? status === 'present' ? 'bg-emerald-600 text-white'
                            : status === 'late' ? 'bg-amber-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
