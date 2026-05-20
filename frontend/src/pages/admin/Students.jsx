import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

const emptyForm = {
  name: '', email: '', password: '', phone: '', guardianPhone: '',
  batch: '', address: '', monthlyFee: '', subjectNames: '', admissionDate: '',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: { search, page, limit: 10 } });
      setStudents(data.students);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.name, email: student.email, password: '', phone: student.phone,
      guardianPhone: student.guardianPhone || '', batch: student.batch,
      address: student.address || '', monthlyFee: student.monthlyFee,
      subjectNames: student.subjects?.map((s) => s.name).join(', ') || '',
      admissionDate: student.admissionDate ? student.admissionDate.substring(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
          ...form,
          monthlyFee: Number(form.monthlyFee),
          subjectNames: form.subjectNames ? form.subjectNames.split(',').map((s) => s.trim()).filter(Boolean) : [],
        };
        if (!payload.password) delete payload.password;
      if (editing) {
        await api.put(`/students/${editing._id}`, payload);
        toast.success('Student updated');
      } else {
        await api.post('/students', payload);
        toast.success('Student created');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          {r.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-gray-500">{r.email}</p>
        </div>
      </div>
    )},
    { key: 'phone', label: 'Phone' },
    { key: 'batch', label: 'Batch', render: (r) => <span className="badge badge-info">{r.batch}</span> },
    { key: 'monthlyFee', label: 'Fee', render: (r) => `$${r.monthlyFee}` },
    { key: 'subjects', label: 'Subjects', render: (r) => r.subjects?.map((s) => s.name).join(', ') || '-' },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><FiEdit2 size={16} /></button>
          <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800 dark:text-red-400"><FiTrash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Student
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={students} loading={loading} emptyMessage="No students found" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{editing ? 'New Password' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" {...(!editing && { required: true })} minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guardian Phone</label>
              <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch *</label>
              <input type="text" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Fee *</label>
              <input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} className="input-field" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Date</label>
              <input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects (comma-separated)</label>
            <input type="text" value={form.subjectNames} onChange={(e) => setForm({ ...form, subjectNames: e.target.value })} className="input-field" placeholder="e.g. Mathematics, Physics, Chemistry" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} />
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
