'use client'

interface AlertProps {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  open: boolean
}

export default function Alert({ title, description, confirmLabel, cancelLabel, onConfirm, onCancel, open }: AlertProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-200">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-white p-0 m-0 max-w-62.5 max-h-75 rounded-t-2xl">
        <div>
          <h3 className="rounded-t-xl bg-(--primary-color) text-(--text-color) text-0.8 m-0 py-1 font-extrabold">{title}</h3>
          <p className="text-xs p-2.5 m-0 text-(--text-color) max-w-52">{description}</p>
        </div>

        <div className="flex flex-row justify-center gap-2 p-2">
          <button
            className="w-full bg-(--primary-color) text-(--text-color) border-0 rounded-md font-bold transition duration-500 py-1 px-2 my-1 text-[20pt] hover:bg-(--text-color) hover:text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            className="w-full bg-(--primary-color) text-(--text-color) border-0 rounded-md font-bold transition duration-500 py-1 px-2 my-1 text-[20pt] hover:bg-(--text-color) hover:text-white"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
