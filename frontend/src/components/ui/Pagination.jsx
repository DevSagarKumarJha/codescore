export const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-4 py-1 text-white">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
