import { useState } from 'react';
import Button from '../Button';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

interface IPaginatedProps<T> {
  data: T[];
  paginatedSingle: React.FC<{ singleEntry: T }>;
  gridClassName?: string;
  itemsPerPage?: number;
}

const Paginated = <T,>({
  data,
  paginatedSingle: PaginatedSingle,
  gridClassName,
  itemsPerPage = 8,
}: IPaginatedProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

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

  return (
    <div className="h-full mt-4">
      <ul className={gridClassName}>
        {currentPageData.map((item, index) => (
          <li className="h-full xl:mb-4" key={index}>
            <PaginatedSingle singleEntry={item} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex justify-center items-center w-full p-4 gap-4">
          <Button
            className="flex items-center"
            type="tertiary"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <BiChevronLeft fontSize={20} />
          </Button>

          <Button
            className="flex items-center"
            type="tertiary"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <BiChevronRight fontSize={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Paginated;
