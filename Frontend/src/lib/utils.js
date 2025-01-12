import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';

export function formatHeaderDate(dateString) {
  const messageDate = parseISO(dateString);
  const today = new Date();

  // If the message is from today
  if (isToday(messageDate)) {
    return "Today";
  }

  // If the message is from yesterday
  if (isYesterday(messageDate)) {
    return "Yesterday";
  }

  // If the message is within the last week, show the weekday
  const daysDiff = differenceInDays(today, messageDate);
  if (daysDiff <= 7) {
    return format(messageDate, 'EEEE'); // "Monday", "Tuesday", etc.
  }

  // If the message is older than a week, show the full date format (e.g., 28 Dec 2024)
  return format(messageDate, 'd MMMM yyyy'); // "28 December 2024"
}


export function formatMessageTime(dateString) {
  const date = parseISO(dateString);

  return format(date, 'hh:mm a');  // Format the time as "12:45 PM"
}