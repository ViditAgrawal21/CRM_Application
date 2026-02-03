export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isPast = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
    owner: 'Owner',
  };
  return labels[role] || role;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indian phone number if 10 digits
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

export const openPhoneDialer = (phone: string) => {
  const {Linking} = require('react-native');
  Linking.openURL(`tel:${phone}`);
};

export const openWhatsApp = (phone: string, message?: string) => {
  const {Linking} = require('react-native');
  const url = message
    ? `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${phone}`;
  Linking.openURL(url);
};

export const shareText = async (text: string) => {
  const {Share} = require('react-native');
  try {
    await Share.share({message: text});
  } catch (error) {
    console.error('Failed to share:', error);
  }
};

/**
 * Extract scheduled time from remark text
 * Supports formats like:
 * - "Meeting 5th Feb at 2 PM"
 * - "Visit tomorrow at 3 PM"
 * - "Meeting 5/2/2025 at 14:00"
 * - "Visit today at 5 PM"
 */
export const extractTimeFromRemark = (remark: string): string | null => {
  if (!remark) return null;
  
  // Match patterns like "5th Feb at 2 PM", "5/2/2025 at 14:00", "tomorrow at 3 PM"
  const patterns = [
    // "5th Feb at 2 PM" or "5th February at 2:30 PM"
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    // "5/2/2025 at 14:00" or "05-02-2025 at 2 PM"
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    // "tomorrow at 3 PM" or "today at 5 PM"
    /((?:today|tomorrow)\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    // Just date with optional time "5th Feb" or "5th Feb 2 PM"
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*(?:\d{4})?\s*(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)?)/i,
  ];
  
  for (const pattern of patterns) {
    const match = remark.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
};

/**
 * Format remark text for display with extracted time highlighted
 */
export const formatRemarkWithTime = (remark: string): {text: string; time: string | null} => {
  const time = extractTimeFromRemark(remark);
  return {text: remark, time};
};

/**
 * Get suggested remark formats for user guidance
 */
export const getRemarkFormatSuggestions = (): string[] => {
  return [
    'Meeting 5th Feb at 2 PM',
    'Visit tomorrow at 3 PM',
    'Meeting 5/2/2025 at 14:00',
    'Visit today at 5 PM',
  ];
};

/**
 * Check if user is owner/admin role
 */
export const isOwnerRole = (role: string): boolean => {
  return ['admin', 'owner', 'manager'].includes(role.toLowerCase());
};
