import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiDollarSign, FiClipboard, FiCalendar,
  FiBookOpen, FiBarChart2, FiFile, FiCheckSquare, FiBell,
  FiLogOut, FiX, FiSun, FiMoon
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const adminLinks = [
  { to: '/admin', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
  { to: '/admin/tasks', icon: FiClipboard, label: 'Tasks' },
  { to: '/admin/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/admin/routines', icon: FiCalendar, label: 'Routines' },
  { to: '/admin/exams', icon: FiBookOpen, label: 'Exams' },
  { to: '/admin/results', icon: FiBarChart2, label: 'Results' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/documents', icon: FiFile, label: 'Documents' },
  { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/admin/subjects', icon: FiBookOpen, label: 'Subjects' },
];

const studentLinks = [
  { to: '/student', icon: FiHome, label: 'Dashboard' },
  { to: '/student/tasks', icon: FiClipboard, label: 'Tasks' },
  { to: '/student/results', icon: FiBarChart2, label: 'Results' },
  { to: '/student/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/student/resources', icon: FiFile, label: 'Resources' },
  { to: '/student/routine', icon: FiCalendar, label: 'Routine' },
  { to: '/student/notifications', icon: FiBell, label: 'Notifications' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            CoachPro
          </h1>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/student'}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="sidebar-link w-full"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
