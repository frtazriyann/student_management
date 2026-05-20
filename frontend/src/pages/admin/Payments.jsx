import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import StatCard from '../../components/ui/StatCard';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ student: '', month: '', year: new Date().getFullYear(), amount: 0, notes: '' });
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterMonth) params.month = filterMonth;
      if (filterStatus) params.status = filterStatus;
      const [{ data }, { data: statsData }] = await Promise.all([
        api.get('/payments', { params }),
        api.get('/payments/stats', { params: { year: new Date().getFullYear(), ...(filterMonth && { month: filterMonth }) } }),
      ]);
      setPayments(data.payments);
      setPages(data.pages);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [page, filterMonth, filterStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { api.get('/students?limit=200').then(({ data }) => setStudents(data.students)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount), year: Number(form.year) };
      if (editing) {
        await api.put(`/payments/${editing._id}`, payload);
        toast.success('Payment updated');
      } else {
        await api.post('/payments', payload);
        toast.success('Payment recorded');
      }
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ student: p.student?._id, month: p.month, year: p.year, amount: p.amount, notes: p.notes || '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'student', label: 'Student', render: (r) => (
      <div>
        <p className="font-medium">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.batch}</p>
      </div>
    )},
    { key: 'month', label: 'Month', render: (r) => `${r.month} ${r.year}` },
    { key: 'amount', label: 'Paid', render: (r) => `$${r.amount}` },
    { key: 'dueAmount', label: 'Due', render: (r) => <span className={r.dueAmount > 0 ? 'text-red-600 font-semibold' : ''}>${r.dueAmount}</span> },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`badge ${r.status === 'paid' ? 'badge-success' : r.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span>
    )},
    { key: 'actions', label: 'Actions', render: (r) => (
      <button onClick={() => openEdit(r)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><FiEdit2 size={16} /></button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value={`$${stats.totalCollected || 0}`} icon={FiDollarSign} color="green" />
        <StatCard title="Total Due" value={`$${stats.totalDue || 0}`} icon={FiDollarSign} color="red" />
        <StatCard title="Paid" value={stats.paidCount || 0} icon={FiDollarSign} color="blue" />
        <StatCard title="Unpaid" value={stats.unpaidCount || 0} icon={FiDollarSign} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Months</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <button onClick={() => { setEditing(null); setForm({ student: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), amount: 0, notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Record Payment
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payment records" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Update Payment' : 'Record Payment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
              <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="input-field" required>
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.batch})</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month *</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="input-field" required>
                <option value="">Select</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} />
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
