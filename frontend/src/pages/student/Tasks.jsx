import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitText, setSubmitText] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks/my-tasks');
      setTasks(data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}/submit`, { text: submitText });
      toast.success('Task submitted');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const statusColor = (s) => {
    const map = { pending: 'badge-warning', 'in-progress': 'badge-info', submitted: 'badge-info', completed: 'badge-success', overdue: 'badge-danger' };
    return map[s] || 'badge-info';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Tasks & Assignments</h3>

      {tasks.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No tasks assigned yet</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <span className={`badge ${statusColor(task.status)}`}>{task.status}</span>
                  </div>
                  {task.description && <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</span>
                    {task.submission?.submittedAt && (
                      <span className="text-emerald-600">Submitted: {new Date(task.submission.submittedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {task.feedback && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">Feedback: {task.feedback}</p>
                  )}
                </div>
                {task.status !== 'completed' && task.status !== 'submitted' && (
                  <button
                    onClick={() => { setSelectedTask(task); setSubmitText(task.submission?.text || ''); setShowModal(true); }}
                    className="btn-primary text-sm"
                  >
                    Submit Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="font-medium text-sm">{selectedTask?.title}</p>
            <p className="text-xs text-gray-500 mt-1">Deadline: {selectedTask?.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Submission *</label>
            <textarea value={submitText} onChange={(e) => setSubmitText(e.target.value)} className="input-field" rows={4} placeholder="Write your answer or notes here..." required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
