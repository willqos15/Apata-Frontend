import { useMemo, useState } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

export type PageInfo={
  currentPage:number,
  totalPages:number,
}

type CallBackChangePage = (page:number)=>void
type RenderNumbers = PageInfo&{
  handlePageChange:CallBackChangePage
}

export const renderNumbers = ({
  totalPages,
  currentPage,
  handlePageChange,
}: RenderNumbers) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(
      <button
        data-testid="pagination"
        key={i}
        onClick={() => handlePageChange(i)}
        aria-label={`Ir para página ${i}`}
        aria-current={i === currentPage ? "page" : undefined}
        className={`
          px-2.5
          py-2.5
          mx-1.5
          cursor-pointer
          border
          border-gray-300
          rounded-md
          transition-colors
          ${
            i === currentPage
              ? "bg-(--primary-color) text-white"
              : "bg-gray-50 text-black hover:bg-gray-100"
          }
        `}
      >
        {i}
      </button>
    );
  }

  return pageNumbers;
};

type UsePaginationProps<T> = {
  items: T[];
  itemsPerPage: number;
  initialPage?: number;
  callBack:(page:number)=>void;
};

export const usePagination = <T,>({
  items,
  itemsPerPage,
  initialPage = 1,
  callBack
}: UsePaginationProps<T>) =>  {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems/itemsPerPage)
  

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages)return;
    
        if (newPage === currentPage) return;
    
        setCurrentPage(newPage);
        callBack(newPage)
    };

  const Pagination = () => {
    if(totalItems <=12)return;
    return (
      <div className="my-5 flex basis-full justify-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Página anterior"
          disabled={currentPage === 1}
          className="mx-1.5 cursor-pointer text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          <FiChevronLeft />
        </button>
        {renderNumbers({
          totalPages,
          currentPage,
          handlePageChange,
        })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Próxima página"
          disabled={currentPage === totalPages}
          className="mx-1.5 cursor-pointer text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };

  return {
    items: paginatedItems,
    currentPage,
    totalItems,
    totalPages,
    handlePageChange,
    Pagination,
  };
};