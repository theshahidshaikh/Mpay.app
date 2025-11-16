// src/utils/formatters.ts
import { formatDistanceToNowStrict } from 'date-fns';

/**
 * Formats a number using Indian numerical standard (Lakh/Crore)
 * and compact notation (K/M/L/Cr).
 * @param num The number to format.
 */
export const formatIndianCompact = (num: number): string => {
  if (num === null || isNaN(num)) return '';
  const absNum = Math.abs(num);

  if (absNum < 1000) return num.toString();
  if (absNum < 100000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
  if (absNum < 10000000) return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakh
  // 1 Crore and above
  return (num / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr'; 
};

/**
 * Formats a timestamp into a relative time string (e.g., "2 minutes ago").
 * @param dateString ISO string from the database.
 */
export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '';
  try {
    return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString; // Fallback
  }
};

/**
 * Formats a count for the badge: exact number up to 999, then compact.
 * @param count The unread count.
 */
export const formatBadgeCount = (count: number): string => {
  if (count <= 999) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};