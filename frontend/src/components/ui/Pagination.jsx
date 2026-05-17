import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
        >
          <FiChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
        >
          Next <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
