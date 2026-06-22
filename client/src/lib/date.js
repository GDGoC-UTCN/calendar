export function pad(number) {
  return String(number).padStart(2, '0');
}

export function toDateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function prettyDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getMonthCells(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayFirstOffset = (firstDay + 6) % 7;
  const cells = [];

  for (let i = 0; i < mondayFirstOffset; i += 1) {
    cells.push({ type: 'empty', key: `empty-start-${year}-${monthIndex}-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay();
    const dateKey = toDateKey(year, monthIndex, day);
    cells.push({
      type: 'day',
      key: dateKey,
      day,
      dateKey,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: dateKey === todayKey()
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: 'empty', key: `empty-end-${year}-${monthIndex}-${cells.length}` });
  }

  return cells;
}

export function isFutureOrToday(dateKey) {
  return dateKey >= todayKey();
}
