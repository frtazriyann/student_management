import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiDownload, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'notes', student: '', subject: '', description: '', isPublic: false });
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterType) params.type = filterType;
      const { data } = await api.get('/documents', { params });
      setDocuments(data.documents);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);
  useEffect(() => {
    Promise.all([
      api.get('/students?limit=200'),
      api.get('/subjects'),
    ]).then(([{ data: s }, { data: sub }]) => {
      setStudents(s.students);
      setSubjects(sub);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => formData.append(k, form[k]));
      formData.append('file', file);
      await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded');
      setShowModal(false);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Deleted');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const typeIcon = { answer_sheet: '📝', notes: '📖', exam_paper: '📋', material: '📚', other: '📄' };

  const columns = [
    { key: 'title', label: 'Document', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-lg">{typeIcon[r.type] || '📄'}</span>
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-gray-500">{r.type?.replace('_', ' ')}</p>
        </div>
      </div>
    )},
    { key: 'student', label: 'Student', render: (r) => r.student?.name || 'Public' },
    { key: 'subject', label: 'Subject', render: (r) => r.subject?.name || '-' },
    { key: 'createdAt', label: 'Uploaded', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          <FiDownload size={16} />
        </a>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800 dark:text-red-400"><FiTrash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Types</option>
          <option value="answer_sheet">Answer Sheets</option>
          <option value="notes">Notes</option>
          <option value="exam_paper">Exam Papers</option>
          <option value="material">Materials</option>
          <option value="other">Other</option>
        </select>
        <button onClick={() => { setForm({ title: '', type: 'notes', student: '', subject: '', description: '', isPublic: false }); setFile(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Upload Document
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={documents} loading={loading} emptyMessage="No documents found" />
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Document" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field" required>
                <option value="notes">Notes</option>
                <option value="answer_sheet">Answer Sheet</option>
                <option value="exam_paper">Exam Paper</option>
                <option value="material">Study Material</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field">
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student (optional)</label>
            <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="input-field">
              <option value="">General (All Students)</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File *</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <FiFile className="mx-auto text-gray-400 mb-2" size={24} />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Make publicly accessible to all students</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Upload</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
