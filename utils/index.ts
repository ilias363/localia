/**
 * Generate a short title from user message content
 * Takes first 40 characters and truncates at word boundary if needed
 */
export const generateTitle = (content: string): string => {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 40) return cleaned;
  const truncated = cleaned.substring(0, 40);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 20) {
    return truncated.substring(0, lastSpace) + "...";
  }
  return truncated + "...";
};
