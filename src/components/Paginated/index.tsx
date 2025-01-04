import { useState } from 'react';
import Button from '../Button';

const ITEMS_PER_PAGE = 6;

interface IPaginatedProps<T> {
  data: T[];
  paginatedSingle: React.FC<{ singleEntry: T }>;
  gridClassName?: string;
}

const Paginated = <T,>({
  data,
  paginatedSingle: PaginatedSingle,
  gridClassName,
}: IPaginatedProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const currentPageData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  return (
    <div className="h-full">
      <ul className={gridClassName}>
        {currentPageData.map((item, index) => (
          <li className="h-full" key={index}>
            <PaginatedSingle singleEntry={item} />
          </li>
        ))}
      </ul>
      <div className="flex justify-center items-center w-full p-4 gap-4">
        <Button type="tertiary" onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button type="tertiary" onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Paginated;
