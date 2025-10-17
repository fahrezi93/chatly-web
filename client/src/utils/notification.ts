// Notification utility functions

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
};

export const playNotificationSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
  audio.play().catch(err => console.log('Error playing sound:', err));
};

// Unread message counter
const UNREAD_KEY = 'unreadMessages';

export const getUnreadCount = (userId: string): number => {
  const data = localStorage.getItem(UNREAD_KEY);
  if (!data) return 0;
  
  try {
    const unreadData = JSON.parse(data);
    return unreadData[userId] || 0;
  } catch {
    return 0;
  }
};

export const setUnreadCount = (userId: string, count: number) => {
  const data = localStorage.getItem(UNREAD_KEY);
  let unreadData: { [key: string]: number } = {};
  
  if (data) {
    try {
      unreadData = JSON.parse(data);
    } catch {
      unreadData = {};
    }
  }
  
  unreadData[userId] = Math.max(0, count);
  localStorage.setItem(UNREAD_KEY, JSON.stringify(unreadData));
  
  // Update page title
  updatePageTitle();
};

export const incrementUnreadCount = (userId: string) => {
  const current = getUnreadCount(userId);
  setUnreadCount(userId, current + 1);
};

export const clearUnreadCount = (userId: string) => {
  setUnreadCount(userId, 0);
};

export const getTotalUnreadCount = (): number => {
  const data = localStorage.getItem(UNREAD_KEY);
  if (!data) return 0;
  
  try {
    const unreadData = JSON.parse(data);
    return Object.values(unreadData).reduce((sum: number, count) => sum + (count as number), 0);
  } catch {
    return 0;
  }
};

export const updatePageTitle = () => {
  const totalUnread = getTotalUnreadCount();
  const baseTitle = 'Chat App';
  
  if (totalUnread > 0) {
    document.title = `(${totalUnread}) ${baseTitle}`;
    
    // Update favicon badge (simple approach)
    if (totalUnread > 0) {
      updateFaviconBadge(totalUnread);
    }
  } else {
    document.title = baseTitle;
  }
};

// Simple favicon badge (visual indicator)
const updateFaviconBadge = (count: number) => {
  // This is a simple implementation
  // For production, consider using a library like "favico.js"
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Draw red circle
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(24, 8, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw count
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL('image/png');
    document.getElementsByTagName('head')[0].appendChild(link);
  }
};
