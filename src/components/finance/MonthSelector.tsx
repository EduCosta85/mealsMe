interface MonthSelectorProps {
  currentMonth: Date;
  onChange: (date: Date) => void;
}

/**
 * MonthSelector Component
 * 
 * Provides navigation controls for selecting months with Portuguese month names.
 * Features:
 * - Previous/Next month navigation
 * - Current month display in Portuguese
 * - 48px minimum touch targets for accessibility
 * - Mobile-first responsive design
 * - Orange theme (#f97316)
 */
export function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  // Portuguese month names
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="flex items-center justify-between gap-4 w-full max-w-md mx-auto">
      {/* Previous Month Button */}
      <button
        onClick={handlePreviousMonth}
        className="flex items-center justify-center min-w-[48px] min-h-[48px] rounded-lg border-2 border-orange-500 bg-white text-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label="Mês anterior"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Current Month Display */}
      <div className="flex-1 text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
          {monthName} {year}
        </h2>
      </div>

      {/* Next Month Button */}
      <button
        onClick={handleNextMonth}
        className="flex items-center justify-center min-w-[48px] min-h-[48px] rounded-lg border-2 border-orange-500 bg-white text-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label="Próximo mês"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
