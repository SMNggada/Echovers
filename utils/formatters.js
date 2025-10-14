/**
 * Format duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "1h 30m" or "45m")
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  }
  
  return `${minutes}m`;
};

/**
 * Format date to a human-readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format number to a compact string with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string (e.g., "1.5K", "2.3M")
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return num.toString();
};

/**
 * Format a timestamp to a relative time string
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};