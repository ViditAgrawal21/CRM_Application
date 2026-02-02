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
