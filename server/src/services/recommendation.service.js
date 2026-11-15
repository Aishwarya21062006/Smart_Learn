import { supabase } from '../config/supabase.js';
import config from '../config/env.js';
import getGeminiClient from '../config/gemini.js';
import logger from '../utils/logger.js';

/**
 * Recommendation Service
 * Implements an intelligent, rule-based adaptive learning recommendation engine.
 *
 * Viva Explanation:
 * The recommendation algorithm uses a 4-tier pedagogical priority queue:
 *  1. Weak Topics Priority: Topics where student's mastery score is < 0.40 (requires immediate revision).
 *  2. Subject Continuity Priority: The sequential next topic in the student's most recently active subject.
 *  3. Unstarted Topics Priority: Topics with 0 quiz attempts, sorted by subject curriculum order.
 *  4. Reinforcement Priority: Topics with moderate mastery (0.40 - 0.75) needing a quiz to reach mastery.
 *
 * This guarantees the student always has a personalized, goal-oriented learning path.
 */

/**
 * Calculates adaptive recommendations for a given user.
 * @param {string} userId - Supabase auth user UUID
 * @param {number} limit - Maximum number of recommendations to return (default: 4)
 * @returns {Promise<Array>} List of recommended topic objects with adaptive reasoning
 */
export const getRecommendationsForUser = async (userId, limit = 4) => {
  // 1. Fetch all subjects and topics from database
  const { data: allTopics, error: topErr } = await supabase
    .from('topics')
    .select(`
      id,
      subject_id,
      title,
      difficulty,
      position,
      subjects (
        id,
        title
      )
    `)
    .order('position', { ascending: true });

  if (topErr || !allTopics || allTopics.length === 0) {
    return [];
  }

  // 2. Fetch user's topic mastery records
  const { data: masteryRows } = await supabase
    .from('topic_mastery')
    .select('*')
    .eq('user_id', userId);

  const masteryMap = new Map();
  (masteryRows || []).forEach(m => {
    masteryMap.set(m.topic_id, {
      score: Number(m.mastery_score) || 0,
      attemptsCount: m.attempts_count || 0,
      lastCalculatedAt: m.last_calculated_at
    });
  });

  // 3. Fetch user's most recent quiz attempt to determine current learning focus
  const { data: recentAttempts } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      topic_id,
      score,
      completed_at,
      topics (
        id,
        subject_id,
        position
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5);

  const mostRecentTopicId = recentAttempts?.[0]?.topic_id || null;
  const mostRecentSubjectId = recentAttempts?.[0]?.topics?.subject_id || null;
  const mostRecentTopicPosition = recentAttempts?.[0]?.topics?.position ?? -1;

  // 4. Categorize topics into the 4 pedagogical priority queues
  const weakTopics = [];
  const nextInSubjectTopics = [];
  const unstartedTopics = [];
  const reinforceTopics = [];

  for (const topic of allTopics) {
    const topicId = topic.id;
    const mastery = masteryMap.get(topicId);
    const score = mastery ? mastery.score : 0;
    const attempts = mastery ? mastery.attemptsCount : 0;
    const subjectTitle = topic.subjects?.title || 'General';

    const item = {
      topicId: topic.id,
      topicTitle: topic.title,
      subjectId: topic.subject_id,
      subjectTitle,
      difficulty: topic.difficulty,
      position: topic.position,
      masteryScore: Math.round(score * 100),
      attemptsCount: attempts
    };

    if (attempts > 0 && score < 0.40) {
      // Tier 1: Weak topic needing urgent revision
      weakTopics.push({
        ...item,
        priority: 1,
        tier: 'weak',
        reason: `Needs revision — Current mastery is only ${Math.round(score * 100)}%. Revise notes and take a quiz to boost your score.`
      });
    } else if (attempts === 0 && mostRecentSubjectId && topic.subject_id === mostRecentSubjectId && topic.position > mostRecentTopicPosition) {
      // Tier 2: Next sequential topic in the subject they are currently studying
      nextInSubjectTopics.push({
        ...item,
        priority: 2,
        tier: 'next_in_subject',
        reason: `Continue where you left off in ${subjectTitle} — Next curriculum topic.`
      });
    } else if (attempts === 0) {
      // Tier 3: Unstarted topic
      unstartedTopics.push({
        ...item,
        priority: 3,
        tier: 'unstarted',
        reason: `New topic ready to start in ${subjectTitle}.`
      });
    } else if (score < 0.80) {
      // Tier 4: Moderate mastery topic
      reinforceTopics.push({
        ...item,
        priority: 4,
        tier: 'reinforce',
        reason: `Mastery at ${Math.round(score * 100)}% — One more quiz can push this into full mastery!`
      });
    }
  }

  // Sort within each tier:
  // Weak: lowest score first
  weakTopics.sort((a, b) => a.masteryScore - b.masteryScore);
  // Next in subject: position ascending
  nextInSubjectTopics.sort((a, b) => a.position - b.position);
  // Unstarted: subject position then topic position
  unstartedTopics.sort((a, b) => a.position - b.position);
  // Reinforce: lowest score first
  reinforceTopics.sort((a, b) => a.masteryScore - b.masteryScore);

  // Combine queues in priority order
  const combined = [
    ...weakTopics,
    ...nextInSubjectTopics,
    ...unstartedTopics,
    ...reinforceTopics
  ];

  // Take top N
  const topRecommendations = combined.slice(0, limit);

  // Optional: Polish reason with Gemini if enabled in config
  if (config.useLlmForReason && config.gemini.apiKey && topRecommendations.length > 0) {
    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `You are an encouraging college AI study tutor.
Rewrite each topic recommendation reason into a concise, motivating 1-sentence prompt for a student:
${JSON.stringify(topRecommendations.map(r => ({ title: r.topicTitle, subject: r.subjectTitle, currentReason: r.reason })))}

Return a JSON array of strings matching the same order: ["Reason 1", "Reason 2", ...]`;

        const resp = await ai.models.generateContent({
          model: config.gemini.model,
          contents: prompt
        });

        if (resp?.text) {
          const raw = resp.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === topRecommendations.length) {
            topRecommendations.forEach((r, idx) => {
              if (parsed[idx]) r.reason = String(parsed[idx]).trim();
            });
          }
        }
      }
    } catch (llmErr) {
      logger.warn('LLM reason polishing skipped:', llmErr.message);
    }
  }

  return topRecommendations;
};

export default {
  getRecommendationsForUser
};
