import { useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

interface IPaginatedProps<T> {
  data: T[];
  paginatedSingle: React.FC<{ singleEntry: T }>;
  gridClassName?: string;
  itemsPerPage?: number;
  getItemKey?: (item: T) => string | number;
}

const Paginated = <T,>({
  data,
  paginatedSingle: PaginatedSingle,
  gridClassName,
  itemsPerPage = 8,
  getItemKey,
}: IPaginatedProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = data.length ? Math.ceil(data.length / itemsPerPage) : 0;

  const currentPageData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (totalPages === 0) {
    return null;
  }

  if (!data) return null;

  return (
    <div className="h-full">
      <ul className={gridClassName}>
        {currentPageData.map((item, index) => (
          <li className="h-full xl:mb-4" key={getItemKey ? getItemKey(item) : index}>
            <PaginatedSingle singleEntry={item} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <nav className="mt-4 flex w-full items-center justify-center" aria-label="Paginacija">
          <div className="flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white p-1.5 shadow-sm">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f9ff] text-blue-dark transition-colors hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              aria-label="Prethodna stranica"
            >
              <BiChevronLeft fontSize={24} />
            </button>

            <span className="min-w-20 px-3 text-center text-sm font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-blue text-white shadow-sm shadow-blue/20 transition-colors hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              aria-label="Sljedeća stranica"
            >
              <BiChevronRight fontSize={24} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Paginated;
