import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ recipient: '', type: 'general', title: '', message: '', channel: 'in-app', broadcast: false });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
      setNotifications(data.notifications);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { api.get('/students?limit=200').then(({ data }) => setStudents(data.students)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', form);
      toast.success('Notification sent');
      setShowModal(false);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-warning', sent: 'badge-success', failed: 'badge-danger', read: 'badge-info' };
    return map[s] || 'badge-info';
  };

  const columns = [
    { key: 'title', label: 'Title', render: (r) => (
      <div>
        <p className="font-medium">{r.title}</p>
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{r.message}</p>
      </div>
    )},
    { key: 'recipient', label: 'Recipient', render: (r) => r.broadcast ? 'All Students' : r.recipient?.name || '-' },
    { key: 'type', label: 'Type', render: (r) => <span className="badge badge-info capitalize">{r.type?.replace('_', ' ')}</span> },
    { key: 'channel', label: 'Channel', render: (r) => <span className="capitalize">{r.channel}</span> },
    { key: 'status', label: 'Status', render: (r) => <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span> },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm({ recipient: '', type: 'general', title: '', message: '', channel: 'in-app', broadcast: false }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Send Notification
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={notifications} loading={loading} emptyMessage="No notifications" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field" required>
                <option value="general">General</option>
                <option value="fee_reminder">Fee Reminder</option>
                <option value="class_reminder">Class Reminder</option>
                <option value="exam_reminder">Exam Reminder</option>
                <option value="task_deadline">Task Deadline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel *</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="input-field" required>
                <option value="in-app">In-App</option>
                <option value="sms">SMS (Twilio)</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.broadcast} onChange={(e) => setForm({ ...form, broadcast: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Broadcast to all students</span>
          </label>

          {!form.broadcast && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient *</label>
              <select value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="input-field" required={!form.broadcast}>
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" rows={3} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Send</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
