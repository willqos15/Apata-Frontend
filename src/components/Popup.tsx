'use client'

import type { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'

interface PopupProps {
  title: string
  content: ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Popup({ title, content, open, setOpen }: PopupProps) {
  return (
    <div className={open ? 'bg-[rgba(0,0,0,0.8)] fixed flex items-center inset-0 z-200' : 'hidden'}>
      <div className="bg-white max-w-screen mx-auto">
        <div className="flex items-center w-full gap-2 p-1 bg-(--primary-color) font-bold text-(--text-color) text-xl relative">
          <h1 className="w-full text-center">{title}</h1>
          <IoClose
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-md font-bold text-white bg-red-600 transition-all duration-300 hover:bg-red-800"
          />
        </div>

        <span className="text-[#21285C] w-full">{content}</span>
      </div>
    </div>
  )
}
