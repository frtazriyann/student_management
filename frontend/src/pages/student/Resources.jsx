import { useState, useEffect } from 'react';
import { FiDownload, FiFile } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentResources() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    api.get('/documents/my-documents')
      .then(({ data }) => setDocuments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = filterType ? documents.filter((d) => d.type === filterType) : documents;
  const typeIcon = { answer_sheet: '📝', notes: '📖', exam_paper: '📋', material: '📚', other: '📄' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resources & Documents</h3>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-auto">
          <option value="">All Types</option>
          <option value="answer_sheet">Answer Sheets</option>
          <option value="notes">Notes</option>
          <option value="exam_paper">Exam Papers</option>
          <option value="material">Materials</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No resources available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcon[doc.type] || '📄'}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{doc.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{doc.type?.replace('_', ' ')}</p>
                    {doc.subject && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{doc.subject.name}</p>}
                    {doc.description && <p className="text-sm text-gray-500 mt-1">{doc.description}</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 p-1">
                  <FiDownload size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
