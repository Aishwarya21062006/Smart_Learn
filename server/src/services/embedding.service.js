import getGeminiClient from '../config/gemini.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Embedding Service
 * Generates 768-dimension vector embeddings using Gemini API (text-embedding-004).
 * If the API key is not configured or an error occurs, fails gracefully and logs a warning.
 */

/**
 * Generates vector embedding for a given text.
 * @param {string} text - The text to embed
 * @returns {Promise<number[] | null>} 768-dimension vector array or null if failed
 */
export const getEmbedding = async (text) => {
  if (!text || typeof text !== 'string') return null;

  const ai = getGeminiClient();
  if (!ai || !config.gemini.apiKey) {
    logger.warn('Skipping embedding generation: GEMINI_API_KEY is not set');
    return null;
  }

  try {
    const embedModel = config.gemini.embedModel || 'text-embedding-004';
    // Use the official @google/genai SDK embeddings API
    const response = await ai.models.embedContent({
      model: embedModel,
      contents: text,
      config: {
        outputDimensionality: 768
      }
    });

    const values = response?.embedding?.values || response?.embeddings?.[0]?.values;
    if (values) {
      return values;
    }
    return null;
  } catch (err) {
    logger.warn(`Failed to generate embedding: ${err.message}`);
    return null;
  }
};

/**
 * Re-indexes a topic by chunking its content and inserting rows into content_chunks.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} topicId
 * @param {string} content
 */
export const indexTopicChunks = async (supabase, topicId, content) => {
  if (!topicId || !content) return;

  try {
    const { chunkText } = await import('./chunking.service.js');
    const chunks = chunkText(content);

    if (chunks.length === 0) return;

    // Delete existing chunks for this topic
    await supabase.from('content_chunks').delete().eq('topic_id', topicId);

    // Prepare new chunk rows
    const rows = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      rows.push({
        topic_id: topicId,
        chunk,
        embedding: embedding || null
      });
    }

    // Insert chunks in database
    const { error } = await supabase.from('content_chunks').insert(rows);
    if (error) {
      logger.warn(`Error inserting content chunks for topic ${topicId}:`, error.message);
    } else {
      logger.info(`Successfully indexed ${rows.length} chunk(s) for topic ${topicId}`);
    }
  } catch (err) {
    logger.warn(`Failed to index topic chunks: ${err.message}`);
  }
};

export default { getEmbedding, indexTopicChunks };
