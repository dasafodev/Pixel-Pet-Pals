// frontend/src/utils/imageUtils.js

/**
 * Utility function to get the correct avatar image URL for user avatars.
 * Ensures avatars always load from the frontend's static assets (public/avatars),
 * handling various path formats including full URLs and paths with spaces.
 * @param {string} avatarPath - The avatar path string from the user data.
 * @returns {string} The processed, correct URL for the avatar image.
 */
export const getAvatarUrl = (avatarPath) => {
  const defaultAvatar = `${process.env.PUBLIC_URL}/avatars/avatar_1.png`;

  if (!avatarPath) {
    return defaultAvatar;
  }

  let pathSegment = avatarPath; // Renamed for clarity

  // If it's a full URL, extract the pathname
  if (pathSegment.startsWith('http://') || pathSegment.startsWith('https://')) {
    try {
      const url = new URL(pathSegment);
      pathSegment = url.pathname; // e.g., "/avatars/avatar 8.png" or "/avatars/avatar_8.png"
    } catch (e) {
      console.error(`Invalid avatar URL: ${avatarPath}, falling back to default.`, e);
      return defaultAvatar;
    }
  }

  // Sanitize: replace spaces with underscores in the path segment.
  // This handles cases like "avatar 1.png" -> "avatar_1.png" within the path.
  const sanitizedPathSegment = pathSegment.replace(/ /g, '_');

  // Construct the final URL
  if (sanitizedPathSegment.startsWith('/')) {
    // Path is absolute from the domain root, e.g., "/avatars/avatar_1.png"
    return `${process.env.PUBLIC_URL}${sanitizedPathSegment}`;
  } else {
    // Path is relative, e.g., "avatar_1.png" (after sanitization).
    // Assume it belongs in /avatars/ if it's just a filename.
    // If the path is already specific like 'pets/pet_1.png', this will still work
    // as long as the base PUBLIC_URL is correct.
    // However, for user avatars, we typically expect them in /avatars/.
    // A more robust solution for mixed content might need to check if pathSegment already includes a directory.
    // For now, assuming user avatars are either absolute paths starting with /avatars/ or just filenames.
    if (sanitizedPathSegment.includes('/')) { // e.g. 'avatars/avatar_1.png' or 'pets/pet_1.png'
        return `${process.env.PUBLIC_URL}/${sanitizedPathSegment}`;
    } else { // e.g. 'avatar_1.png'
        return `${process.env.PUBLIC_URL}/avatars/${sanitizedPathSegment}`;
    }
  }
};
