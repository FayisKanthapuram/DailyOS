import { DateTime } from 'luxon';

/**
 * Returns today's date as 'YYYY-MM-DD' in the given IANA timezone.
 * Falls back to UTC if the timezone is invalid.
 */
export function getTodayInTimezone(timezone: string): string {
  try {
    return DateTime.now().setZone(timezone).toISODate()!;
  } catch {
    return DateTime.now().toUTC().toISODate();
  }
}

/**
 * Validates an IANA timezone identifier using the built-in Intl API.
 * Available in Node 18+.
 */
export function isValidIANATimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
