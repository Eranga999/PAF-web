/**
 * Utility function to conditionally join CSS class names together
 * @param {...string} classes - CSS class names to be joined
 * @returns {string} - Joined class names
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
} 