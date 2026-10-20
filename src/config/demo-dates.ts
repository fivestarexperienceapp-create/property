/**
 * Demo-only helper: produces upcoming weekend dates so the sample open house
 * never shows a date in the past. Customer sites use fixed "YYYY-MM-DD" dates.
 */
export function upcomingWeekday(weekday: number, weeksAhead = 0, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let delta = (weekday - d.getDay() + 7) % 7;
  if (delta < 2) delta += 7; // give visitors at least a couple of days' notice
  d.setDate(d.getDate() + delta + weeksAhead * 7);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
