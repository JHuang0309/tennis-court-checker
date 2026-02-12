export function isWithinNextTwoHours(date) {
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return date > now && date <= twoHoursFromNow;
}
