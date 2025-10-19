// Utility functions for date formatting and comparison

/**
 * Format date for display in chat
 * Returns formats like: "Hari ini", "Kemarin", "Senin, 15 Oktober 2025"
 */
export const formatDateSeparator = (date: Date | string): string => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours for accurate day comparison
  const resetTime = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const messageDateReset = resetTime(new Date(messageDate));
  const todayReset = resetTime(new Date(today));
  const yesterdayReset = resetTime(new Date(yesterday));

  // Check if today
  if (messageDateReset.getTime() === todayReset.getTime()) {
    return 'Hari ini';
  }

  // Check if yesterday
  if (messageDateReset.getTime() === yesterdayReset.getTime()) {
    return 'Kemarin';
  }

  // Check if within this week
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 6);
  resetTime(oneWeekAgo);

  if (messageDateReset >= oneWeekAgo) {
    // Return day name in Indonesian
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames[messageDate.getDay()];
  }

  // For older dates, return full date
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const day = messageDate.getDate();
  const month = monthNames[messageDate.getMonth()];
  const year = messageDate.getFullYear();

  // Include year only if not current year
  if (year !== today.getFullYear()) {
    return `${day} ${month} ${year}`;
  }

  return `${day} ${month}`;
};

/**
 * Check if two dates are on different days
 */
export const isDifferentDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
};

/**
 * Format time for message timestamp
 * Returns format like: "14:30"
 */
export const formatMessageTime = (date: Date | string): string => {
  const messageDate = new Date(date);
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format date for message timestamp with date context
 * Returns formats like: "14:30", "Kemarin 14:30", "15 Okt 14:30"
 */
export const formatMessageTimestamp = (date: Date | string): string => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = formatMessageTime(messageDate);

  // Reset hours for accurate day comparison
  const resetTime = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const messageDateReset = resetTime(new Date(messageDate));
  const todayReset = resetTime(new Date(today));
  const yesterdayReset = resetTime(new Date(yesterday));

  // If today, just show time
  if (messageDateReset.getTime() === todayReset.getTime()) {
    return time;
  }

  // If yesterday, show "Kemarin"
  if (messageDateReset.getTime() === yesterdayReset.getTime()) {
    return `Kemarin ${time}`;
  }

  // For older dates, show short date format
  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = messageDate.getDate();
  const month = monthShortNames[messageDate.getMonth()];

  return `${day} ${month} ${time}`;
};
