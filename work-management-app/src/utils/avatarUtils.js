/**
 * Generate avatar from user name
 * @param {string} name - Full name of the user
 * @returns {string} - Avatar initials (2 characters max)
 */
export const generateAvatar = (name) => {
  if (!name || !name.trim()) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Single word: take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words: take first character of first 2 words
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }
};

/**
 * Get user display name
 * @param {object} user - User object
 * @returns {string} - Full display name
 */
export const getUserDisplayName = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || 'User';
};

/**
 * Get user avatar with fallback
 * @param {object} user - User object
 * @returns {string} - Avatar string (either from database or generated)
 */
export const getUserAvatar = (user) => {
  // Use avatar from database if available
  if (user.avatarUrl && user.avatarUrl.trim()) {
    return user.avatarUrl;
  }
  
  // Fallback to legacy avatar field
  if (user.avatar && user.avatar.trim()) {
    return user.avatar;
  }
  
  // Generate avatar from name
  const displayName = getUserDisplayName(user);
  return generateAvatar(displayName);
};
