interface FloatingAddButtonProps {
  readonly onClick: () => void
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl transition-transform active:scale-95 hover:shadow-2xl"
      aria-label="Adicionar despesa"
    >
      {/* Plus Icon SVG */}
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
