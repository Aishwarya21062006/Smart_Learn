import { supabase } from '../config/supabase.js';
import config from '../config/env.js';
import getGeminiClient from '../config/gemini.js';
import { getEmbedding } from './embedding.service.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * AI Tutor & RAG Service
 * Provides grounded curriculum tutoring using pgvector hybrid search and Gemini.
 * Enforces a daily 20-message quota per student.
 */

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Retrieves the student's current message usage for today.
 */
export const getStudentDailyUsage = async (userId) => {
  const today = getTodayDateString();
  const limit = config.tutorDailyLimit || 20;

  const { data } = await supabase
    .from('tutor_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('day', today)
    .maybeSingle();

  const count = data?.message_count || 0;
  return {
    used: count,
    remaining: Math.max(0, limit - count),
    limit,
    day: today
  };
};

/**
 * Increments student's message count for today.
 */
const incrementStudentUsage = async (userId) => {
  const today = getTodayDateString();

  // Try insert or upsert with Postgres
  const { data: existing } = await supabase
    .from('tutor_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('day', today)
    .maybeSingle();

  const newCount = (existing?.message_count || 0) + 1;

  const { error } = await supabase
    .from('tutor_usage')
    .upsert({
      user_id: userId,
      day: today,
      message_count: newCount
    });

  if (error) {
    logger.warn('Failed to update tutor usage count:', error.message);
  }

  return newCount;
};

/**
 * Performs hybrid vector + full-text search to retrieve relevant curriculum chunks.
 */
export const retrieveCurriculumContext = async (queryText, filterTopicId = null, maxChunks = 4) => {
  let chunks = [];

  // 1. Vector Search using match_chunks RPC function
  try {
    const queryVector = await getEmbedding(queryText);
    if (queryVector && queryVector.length === 768) {
      const { data: vectorMatches, error: vecErr } = await supabase.rpc('match_chunks', {
        query_embedding: queryVector,
        match_count: maxChunks,
        filter_topic: filterTopicId || null
      });

      if (!vecErr && Array.isArray(vectorMatches) && vectorMatches.length > 0) {
        chunks = vectorMatches.filter(m => m.similarity > 0.35);
      }
    }
  } catch (vecErr) {
    logger.warn('Vector match_chunks search failed, falling back to full-text:', vecErr.message);
  }

  // 2. Full-text search fallback / supplement if vector search found few chunks
  if (chunks.length < 2) {
    try {
      const { data: textMatches, error: txtErr } = await supabase.rpc('search_chunks_text', {
        query_text: queryText,
        match_count: maxChunks,
        filter_topic: filterTopicId || null
      });

      if (!txtErr && Array.isArray(textMatches)) {
        const existingIds = new Set(chunks.map(c => c.id));
        for (const tm of textMatches) {
          if (!existingIds.has(tm.id)) {
            chunks.push(tm);
          }
        }
      }
    } catch (txtErr) {
      logger.warn('Full-text search_chunks_text error:', txtErr.message);
    }
  }

  // 3. Attach topic titles for clear academic attribution
  if (chunks.length > 0) {
    const topicIds = [...new Set(chunks.map(c => c.topic_id).filter(Boolean))];
    if (topicIds.length > 0) {
      const { data: topics } = await supabase
        .from('topics')
        .select('id, title')
        .in('id', topicIds);

      const topicMap = new Map((topics || []).map(t => [t.id, t.title]));
      chunks = chunks.map(c => ({
        ...c,
        topicTitle: topicMap.get(c.topic_id) || 'Curriculum Notes'
      }));
    }
  }

  return chunks;
};

/**
 * Handles an AI Tutor question from a student.
 */
export const askAITutor = async (userId, question, topicId = null) => {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new AppError('Question text cannot be empty', 400);
  }

  const cleanQuestion = question.trim();

  // 1. Enforce 20-message daily rate limit
  const usage = await getStudentDailyUsage(userId);
  if (usage.remaining <= 0) {
    throw new AppError(
      `Daily AI tutor limit reached (${usage.limit}/${usage.limit} messages). Your quota resets at midnight UTC. You can continue reading topic notes or taking quizzes!`,
      429
    );
  }

  // 2. Retrieve relevant curriculum context chunks via RAG
  const contextChunks = await retrieveCurriculumContext(cleanQuestion, topicId, 4);

  // 3. Generate answer using Gemini
  const ai = getGeminiClient();
  if (!ai || !config.gemini.apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured on the server', 500);
  }

  const contextFormatted = contextChunks.length > 0
    ? contextChunks.map((c, i) => `[Source ${i + 1} - Topic: "${c.topicTitle}"]: ${c.chunk}`).join('\n\n')
    : 'No directly matching notes found in the uploaded curriculum documents.';

  const systemPrompt = `You are SmartLearn's intelligent AI College Tutor.
Your goal is to guide students to deep understanding by explaining concepts step-by-step, using clear bullet points, relatable analogies, and concise viva-ready explanations.

Context from Student's Uploaded Curriculum Notes:
${contextFormatted}

Instructions:
1. Ground your answer in the provided context whenever possible.
2. If the student's question touches upon material from the notes, cite the topic name naturally (e.g., "As detailed in your Research Methodology notes...").
3. If the question extends beyond the notes, explain the concept accurately while noting that it goes beyond the uploaded notes.
4. Keep the tone supportive, encouraging, and academic. Use markdown for headings, bold terms, and bullet points.`;

  let answer = '';
  try {
    const response = await ai.models.generateContent({
      model: config.gemini.model || 'gemini-3.5-flash-lite',
      contents: [
        { text: systemPrompt },
        { text: `Student Question: ${cleanQuestion}` }
      ]
    });

    answer = response?.text ? response.text.trim() : 'I was unable to generate an answer. Please rephrase your question.';
  } catch (err) {
    logger.error('Gemini tutor generation error:', err.message);
    throw new AppError(`AI Tutor service error: ${err.message}`, 500);
  }

  // 4. Increment student daily usage
  const updatedCount = await incrementStudentUsage(userId);
  const limit = config.tutorDailyLimit || 20;

  // 5. Gather unique cited topic names
  const citedTopics = [...new Set(contextChunks.map(c => c.topicTitle).filter(Boolean))];

  return {
    answer,
    sources: citedTopics,
    usage: {
      used: updatedCount,
      remaining: Math.max(0, limit - updatedCount),
      limit
    }
  };
};

export default {
  getStudentDailyUsage,
  retrieveCurriculumContext,
  askAITutor
};
