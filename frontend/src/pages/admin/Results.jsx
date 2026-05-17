import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ student: '', examName: '', subjectName: '', totalMarks: 100, marksObtained: '', remarks: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/results', { params: { page, limit: 10 } });
      setResults(data.results);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);
  useEffect(() => {
    api.get('/students?limit=200').then(({ data: s }) => {
      setStudents(s.students);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, marksObtained: Number(form.marksObtained) };
      if (editing) {
        await api.put(`/results/${editing._id}`, payload);
        toast.success('Result updated');
      } else {
        await api.post('/results', payload);
        toast.success('Result created');
      }
      setShowModal(false);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await api.delete(`/results/${id}`);
      toast.success('Deleted');
      fetchResults();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ student: r.student?._id || '', examName: r.exam?.name || '', subjectName: r.exam?.subject?.name || '', totalMarks: r.exam?.totalMarks || 100, marksObtained: r.marksObtained, remarks: r.remarks || '', exam: r.exam?._id || '' });
    setShowModal(true);
  };

  const gradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'badge-success';
    if (g === 'B+' || g === 'B') return 'badge-info';
    if (g === 'C' || g === 'D') return 'badge-warning';
    return 'badge-danger';
  };

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.student?.name || '-' },
    { key: 'exam', label: 'Exam', render: (r) => r.exam?.name || '-' },
    { key: 'subject', label: 'Subject', render: (r) => r.exam?.subject?.name || '-' },
    { key: 'marks', label: 'Marks', render: (r) => `${r.marksObtained}/${r.exam?.totalMarks || '-'}` },
    { key: 'percentage', label: '%', render: (r) => r.percentage != null ? `${r.percentage}%` : '-' },
    { key: 'grade', label: 'Grade', render: (r) => <span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><FiEdit2 size={16} /></button>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800 dark:text-red-400"><FiTrash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setForm({ student: '', examName: '', subjectName: '', totalMarks: 100, marksObtained: '', remarks: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Result
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={results} loading={loading} emptyMessage="No results found" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Result' : 'Add Result'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
            <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="input-field" required disabled={!!editing}>
              <option value="">Select Student</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.batch})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Name *</label>
              <input type="text" value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} className="input-field" placeholder="e.g. Midterm, Final, Quiz 1" required disabled={!!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <input type="text" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} className="input-field" placeholder="e.g. Mathematics, Physics" required disabled={!!editing} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks *</label>
              <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} className="input-field" required min="1" disabled={!!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks Obtained *</label>
              <input type="number" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} className="input-field" required min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
