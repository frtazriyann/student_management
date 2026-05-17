import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Routines() {
  const [routines, setRoutines] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ batch: '', day: 'Saturday', subject: '', startTime: '', endTime: '', room: '', type: 'regular', notice: '' });

  const fetchRoutines = async () => {
    try {
      const params = {};
      if (selectedBatch) params.batch = selectedBatch;
      const { data } = await api.get('/routines', { params });
      setRoutines(data);
    } catch (err) {
      toast.error('Failed to fetch routines');
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/subjects'),
      api.get('/students?limit=200'),
    ]).then(([{ data: subs }, { data: studs }]) => {
      setSubjects(subs);
      const b = [...new Set(studs.students.map((s) => s.batch))];
      setBatches(b);
      if (b.length > 0) setSelectedBatch(b[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (selectedBatch) fetchRoutines(); }, [selectedBatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/routines/${editing._id}`, form);
        toast.success('Routine updated');
      } else {
        await api.post('/routines', form);
        toast.success('Routine created');
      }
      setShowModal(false);
      fetchRoutines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this routine entry?')) return;
    try {
      await api.delete(`/routines/${id}`);
      toast.success('Deleted');
      fetchRoutines();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ batch: r.batch, day: r.day, subject: r.subject?._id || '', startTime: r.startTime, endTime: r.endTime, room: r.room || '', type: r.type, notice: r.notice || '' });
    setShowModal(true);
  };

  const routinesByDay = DAYS.reduce((acc, day) => {
    acc[day] = routines.filter((r) => r.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const typeColor = (t) => ({ regular: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', special: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }[t] || '');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="input-field w-auto">
          {batches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <button onClick={() => { setEditing(null); setForm({ batch: selectedBatch, day: 'Saturday', subject: '', startTime: '', endTime: '', room: '', type: 'regular', notice: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Class
        </button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="card">
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">{day}</h3>
            {routinesByDay[day].length === 0 ? (
              <p className="text-sm text-gray-400">No classes scheduled</p>
            ) : (
              <div className="space-y-2">
                {routinesByDay[day].map((r) => (
                  <div key={r._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400 w-28">{r.startTime} - {r.endTime}</div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.subject?.name}</span>
                      <span className={`badge text-xs ${typeColor(r.type)}`}>{r.type}</span>
                      {r.room && <span className="text-xs text-gray-500">Room: {r.room}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800 dark:text-red-400"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Routine' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch</label>
              <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} className="input-field" required>
                {batches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="input-field" required>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" required>
              <option value="">Select Subject</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
              <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="regular">Regular</option>
                <option value="special">Special</option>
                <option value="exam">Exam</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notice</label>
            <textarea value={form.notice} onChange={(e) => setForm({ ...form, notice: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
