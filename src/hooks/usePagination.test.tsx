import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderNumbers, usePagination } from "./usePagination";
import { act, fireEvent, render, screen } from "@testing-library/react";



describe('renderNumbers',()=>{
    const handlePageChange = vi.fn()
    beforeEach(()=>{
        vi.clearAllMocks()
    })
    it("should render all page numbers and call the page change handler",()=>{
        const totalPages = 10
        const currentPage = 1
        const {getAllByRole} = render(
            <>
                {renderNumbers({
                    totalPages,
                    handlePageChange,
                    currentPage
                })}
            </>
        )
        const btns = getAllByRole('button')

        btns.map((val,ind)=>{
            const index = ind+1
            if(index === currentPage){
                expect(val).toHaveClass('bg-(--primary-color) text-white')
            }else{
                expect(val).toHaveClass('bg-gray-50 text-black hover:bg-gray-100')
            }
            expect(val).toHaveTextContent(`${index}`)
        })
        expect(btns).toHaveLength(totalPages)
        
        const btn5 = btns[4]
        fireEvent.click(btn5)

        expect(handlePageChange).toHaveBeenCalledTimes(1)
        expect(handlePageChange).toHaveBeenCalledWith(5)
    })
    it("should render no page numbers when there are no pages",()=>{
        const totalPages = 0
        const currentPage = 1
        const {queryAllByRole} = render(
            <>
                {renderNumbers({
                    totalPages,
                    handlePageChange,
                    currentPage
                })}
            </>
        )
        const btns = queryAllByRole('button')

        expect(btns).toHaveLength(0)
       
    })
})

describe("usePagination",()=>{
    const callBack = vi.fn()
    const values = Array.from({ length: 13 }, (_, index) => index + 1)
    const MockPage = () => {
        const { Pagination, items, currentPage, totalPages } = usePagination({
            callBack,
            items:values,
            itemsPerPage:5,
            initialPage:1
        })
        return (
            <>
                <output data-testid="items">{items.join(',')}</output>
                <output data-testid="current-page">{currentPage}</output>
                <output data-testid="total-pages">{totalPages}</output>
                <Pagination />
            </>
        )
    }

    it("should paginate items and change page through the pagination controls",()=>{
        render(<MockPage />)

        expect(screen.getByTestId('items')).toHaveTextContent('1,2,3,4,5')
        expect(screen.getByTestId('current-page')).toHaveTextContent('1')
        expect(screen.getByTestId('total-pages')).toHaveTextContent('3')
        expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()

        fireEvent.click(screen.getByRole('button', { name: 'Ir para página 2' }))

        expect(screen.getByTestId('items')).toHaveTextContent('6,7,8,9,10')
        expect(screen.getByTestId('current-page')).toHaveTextContent('2')
        expect(callBack).toHaveBeenCalledTimes(1)
        expect(callBack).toHaveBeenCalledWith(2)

        fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

        expect(screen.getByTestId('items')).toHaveTextContent('11,12,13')
        expect(screen.getByTestId('current-page')).toHaveTextContent('3')
        expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
    })

    it("should not render Pagination when there are fewer than 12 items",()=>{
        const SmallPage = () => {
            const { Pagination } = usePagination({
                callBack,
                items: values.slice(0, 11),
                itemsPerPage: 5,
                initialPage: 1
            })

            return <Pagination />
        }

        render(<SmallPage />)

        expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it("should disable navigation buttons at the first and last pages",()=>{
        render(<MockPage />)

        const previousButton = screen.getByRole('button', { name: 'Página anterior' })
        const nextButton = screen.getByRole('button', { name: 'Próxima página' })

        expect(previousButton).toBeDisabled()
        expect(nextButton).not.toBeDisabled()

        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Ir para página 3' }))
        })

        expect(screen.getByRole('button', { name: 'Página anterior' })).not.toBeDisabled()
        expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
    })
    
})