import { useState } from 'react';
import UserCard, { IUser } from '../UserCard';
import Button from '../Button';

const ITEMS_PER_PAGE = 6;

interface IPaginatedProps {
  data: IUser[];
}

const Paginated = ({ data }: IPaginatedProps) => {
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
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPageData.map((item: IUser, index: number) => (
          <li className="h-full" key={index}>
            <UserCard user={item} />
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
