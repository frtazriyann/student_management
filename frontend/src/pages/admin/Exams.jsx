import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', subjectName: '', batch: '', date: '', totalMarks: 100, passingMarks: 40, description: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/exams', { params: { page, limit: 10 } });
      setExams(data.exams);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks) };
      delete payload.subject;
      if (editing) {
        await api.put(`/exams/${editing._id}`, payload);
        toast.success('Exam updated');
      } else {
        await api.post('/exams', payload);
        toast.success('Exam created');
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam? All related results will also be deleted.')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (ex) => {
    setEditing(ex);
    setForm({ name: ex.name, subjectName: ex.subject?.name || '', batch: ex.batch || '', date: ex.date?.substring(0, 10) || '', totalMarks: ex.totalMarks, passingMarks: ex.passingMarks, description: ex.description || '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Exam Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'subject', label: 'Subject', render: (r) => r.subject?.name || '-' },
    { key: 'batch', label: 'Batch', render: (r) => r.batch || '-' },
    { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '-' },
    { key: 'totalMarks', label: 'Total Marks' },
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
        <button onClick={() => { setEditing(null); setForm({ name: '', subjectName: '', batch: '', date: '', totalMarks: 100, passingMarks: 40, description: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Create Exam
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={exams} loading={loading} emptyMessage="No exams found" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Exam' : 'Create Exam'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <input type="text" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} className="input-field" placeholder="e.g. Mathematics" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch</label>
              <input type="text" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks *</label>
              <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} className="input-field" required min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Marks</label>
              <input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} className="input-field" min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
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
