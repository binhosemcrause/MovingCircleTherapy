import { env } from '../../config/env';

const dateTimeFormat = new Intl.DateTimeFormat('en-AU', {
  timeZone: env.PRACTICE_TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

// "Monday 19 October at 9:00 am", in the practice's timezone.
export function formatPracticeDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}
