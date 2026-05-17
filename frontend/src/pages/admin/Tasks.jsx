import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', status: 'pending' });
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { api.get('/students?limit=200').then(({ data }) => setStudents(data.students)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/tasks/${editing._id}`, form);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created');
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '', assignedTo: t.assignedTo?._id || '',
      deadline: t.deadline ? t.deadline.substring(0, 10) : '', status: t.status,
    });
    setShowModal(true);
  };

  const statusColor = (s) => {
    const map = { pending: 'badge-warning', 'in-progress': 'badge-info', submitted: 'badge-info', completed: 'badge-success', overdue: 'badge-danger' };
    return map[s] || 'badge-info';
  };

  const columns = [
    { key: 'title', label: 'Title', render: (r) => <p className="font-medium max-w-[200px] truncate">{r.title}</p> },
    { key: 'assignedTo', label: 'Assigned To', render: (r) => r.assignedTo?.name || '-' },
    { key: 'deadline', label: 'Deadline', render: (r) => r.deadline ? new Date(r.deadline).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (r) => <span className={`badge ${statusColor(r.status)}`}>{r.status}</span> },
    { key: 'submission', label: 'Submitted', render: (r) => r.submission?.submittedAt ? new Date(r.submission.submittedAt).toLocaleDateString() : '-' },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><FiEdit2 size={16} /></button>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800 dark:text-red-400"><FiTrash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', assignedTo: '', deadline: '', status: 'pending' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Create Task
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={tasks} loading={loading} emptyMessage="No tasks found" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Task' : 'Create Task'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To *</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input-field" required>
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.batch})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline *</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" required />
            </div>
          </div>
          {editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
