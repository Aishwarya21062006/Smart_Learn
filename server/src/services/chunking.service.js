/**
 * Chunking Service
 * Splits educational text content into overlapping chunks of ~500 characters with ~50 character overlap.
 * This prepares text for vector embedding and Retrieval-Augmented Generation (RAG).
 */

/**
 * Splits a text into overlapping windows.
 * Tries to break at sentence or word boundaries whenever possible.
 *
 * @param {string} text - The input text to chunk
 * @param {number} chunkSize - Target characters per chunk (default: 500)
 * @param {number} overlap - Overlap characters between chunks (default: 50)
 * @returns {string[]} Array of text chunks
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (trimmed.length <= chunkSize) return [trimmed];

  const chunks = [];
  let startIndex = 0;

  while (startIndex < trimmed.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < trimmed.length) {
      // Look for sentence boundary (.!?) near the end of the window
      const sentenceBreak = trimmed.slice(startIndex, endIndex).search(/[.!?]\s+(?=[A-Z0-9])/);
      if (sentenceBreak !== -1 && sentenceBreak > chunkSize * 0.5) {
        endIndex = startIndex + sentenceBreak + 1;
      } else {
        // Fallback: look for space to avoid cutting words in half
        const lastSpace = trimmed.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex + chunkSize * 0.4) {
          endIndex = lastSpace;
        }
      }
    } else {
      endIndex = trimmed.length;
    }

    const chunk = trimmed.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Advance start index by chunk length minus overlap
    const step = Math.max(1, (endIndex - startIndex) - overlap);
    startIndex += step;

    if (endIndex >= trimmed.length) break;
  }

  return chunks;
};

export default { chunkText };
