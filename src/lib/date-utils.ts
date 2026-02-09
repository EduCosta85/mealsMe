export const toDateKey = (date: Date): string =>
  date.toISOString().slice(0, 10)

export const today = (): Date => new Date()

export const todayKey = (): string => toDateKey(today())

export const getWeekDates = (referenceDate: Date): Date[] => {
  const day = referenceDate.getDay()
  const sunday = new Date(referenceDate)
  sunday.setDate(referenceDate.getDate() - day)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })
}

export const isSameDay = (a: Date, b: Date): boolean =>
  toDateKey(a) === toDateKey(b)
