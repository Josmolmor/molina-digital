/* Shared by the server section (aria summary) and the client grid (hover label) */

const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const dayLabel = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const formatTokens = (tokens: number) => compact.format(tokens);

/* Day keys are plain YYYY-MM-DD, so format them in UTC to keep the same day */
export const formatDay = (date: string) =>
  dayLabel.format(new Date(`${date}T00:00:00Z`));
