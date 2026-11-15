import { supabase } from '../config/supabase.js';
import config from '../config/env.js';
import getGeminiClient from '../config/gemini.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Explainer Service
 * Generates and manages interactive visual novel storyboards starring:
 *  - Sensei Hana (Patient, expert instructor)
 *  - Ren (Relatable, inquisitive student)
 *
 * Supports both full-module overviews and targeted concept-specific deep-dives.
 */

const slugify = (text = '') => {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'default';
};

/**
 * Extracts all main topics and conceptual sections from module notes.
 * Main topics in lecture notes and slides are typically written in:
 *  1. Table of Contents / Outline lists
 *  2. Big letters / Markdown Headings (#, ##, ###, ####)
 *  3. Bold letters (**Topic Name** or <b>Topic Name</b>)
 *  4. Standalone UPPERCASE section/slide headers
 *
 * Returns all extracted topics without artificial caps, with an AI fallback if needed.
 */
export const extractConceptsFromNotes = async (content = '', title = '') => {
  if (!content || typeof content !== 'string') {
    return [title || 'Module Overview'];
  }

  const lines = content.split('\n');
  const candidateTopics = [];

  const isNoise = (text) => {
    if (!text) return true;
    const clean = text.trim();
    if (clean.length < 3 || clean.length > 70) return true;

    // Ignore questions or student commands
    if (/^(explain|discuss|describe|what is|how do|differentiate|compare|state|list|derive|write|illustrate)\b/i.test(clean)) return true;
    if (/\?$/.test(clean)) return true;

    // Ignore meta, syllabus headers, and generic structural labels
    return /^(table of contents?|comprehensive study notes|module \d+|unit \d+|course overview|course code|assessment|credits|prerequisites|see|cie|note|notes|tip|warning|caution|example|references?|summary|conclusion|chapter \d+|syllabus|textbook|level|page \d+|formal definition|definition|core components|primary aim|mixed aspects|consent|core definitions & objectives|key concepts, rules & mechanisms|important examination questions|concrete examples|module breakdown|step-by-step)/i.test(
      clean
    );
  };

  const cleanText = (str) => {
    return str
      .replace(/[*_#`~]/g, '')
      .replace(/^(?:\d+[\.\)]|[A-Z][\.\)]|\bstep\s+[IVX\d]+[:\.]?)\s*/i, '')
      .replace(/[:—\-]+$/, '')
      .trim();
  };

  // 1. Table of Contents items (author's official curriculum outline)
  let inToc = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##?\s*TABLE OF CONTENTS/i.test(trimmed)) {
      inToc = true;
      continue;
    }
    if (inToc) {
      if (/^---|^##\s+/i.test(trimmed) && !/TABLE OF CONTENTS/i.test(trimmed)) {
        inToc = false;
      } else {
        const m = trimmed.match(/^\d+[\.\)]\s*(?:\[(.*?)\](?:\(.*\))?|(.*))/);
        if (m) {
          const raw = cleanText(m[1] || m[2] || '');
          if (!isNoise(raw)) candidateTopics.push(raw);
        }
      }
    }
  }

  // 2. Headings (Big Letters: #, ##, ###, ####)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      const raw = cleanText(headerMatch[2]);
      if (!isNoise(raw)) candidateTopics.push(raw);
    }
  }

  // 3. Bold Letters (Section Titles & Core Concepts: **Topic** or <b>Topic</b>)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const stripped = trimmed.replace(/^(?:[\*\-+]|\d+[\.\)]|[A-Z][\.\)])\s+/, '').trim();
    const boldMatch = stripped.match(/^(?:\*\*|<b>|<strong>)([\s\S]+?)(?:\*\*|<\/b>|<\/strong>)/);
    if (boldMatch) {
      const raw = cleanText(boldMatch[1]);
      if (!isNoise(raw)) candidateTopics.push(raw);
    }
  }

  // 4. Standalone UPPERCASE Lines (Slide headers or capitalized section titles)
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length >= 6 &&
      trimmed.length <= 55 &&
      trimmed === trimmed.toUpperCase() &&
      /^[A-Z0-9\s,\-\(\)\/&]+$/.test(trimmed)
    ) {
      const raw = cleanText(trimmed);
      if (!isNoise(raw)) candidateTopics.push(raw);
    }
  }

  // Deduplicate case-insensitively, preferring Title Case over UPPERCASE
  const seen = new Map();
  for (const item of candidateTopics) {
    const norm = item.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.length < 3) continue;

    if (!seen.has(norm)) {
      seen.set(norm, item);
    } else {
      const existing = seen.get(norm);
      if (existing === existing.toUpperCase() && item !== item.toUpperCase()) {
        seen.set(norm, item);
      }
    }
  }

  let allTopics = Array.from(seen.values());

  // 5. If fewer than 3 topics detected and notes are substantial, ask Gemini for main topics
  if (allTopics.length < 3 && content.length > 200) {
    const ai = getGeminiClient();
    if (ai && config.gemini.apiKey) {
      try {
        const response = await ai.models.generateContent({
          model: config.gemini.model,
          contents: `Extract the main topics and key conceptual sections from these college module study notes.
Usually main topics are bold headings or major conceptual sections.
Return ONLY a valid JSON array of strings containing the topic titles (e.g. ["Topic 1", "Topic 2", ...]). No extra text.

Notes:
${content.slice(0, 5000)}`
        });

        const text = response.text?.trim() || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allTopics = parsed.map(cleanText).filter((t) => !isNoise(t));
          }
        }
      } catch (err) {
        logger.warn(`Gemini topic extraction fallback failed: ${err.message}`);
      }
    }
  }

  return allTopics.length > 0 ? allTopics : [title || 'Module Overview'];
};

/**
 * Creates a deterministic fallback storyboard if LLM generation is unavailable.
 */
const createFallbackStoryboard = (topicTitle, concept = '', topicNotes = '') => {
  const target = concept || topicTitle || 'Key Concept';
  const snippet = topicNotes.slice(0, 200).replace(/\n+/g, ' ').trim();

  return {
    topicTitle,
    targetConcept: target,
    synopsis: `Sensei Hana and Ren break down "${target}" step-by-step using everyday analogies.`,
    scenes: [
      {
        id: 1,
        speaker: 'Ren',
        emotion: 'thinking',
        dialogue: `Sensei Hana, I was studying our module notes, but I'm really stuck on "${target}". Can you help me break it down?`,
        visualCue: 'Ren scratches his head, looking puzzled at his notebook in the classroom.'
      },
      {
        id: 2,
        speaker: 'Sensei Hana',
        emotion: 'explaining',
        dialogue: `Of course, Ren! Many students find "${target}" confusing at first glance. Let's look at the underlying principle rather than just memorizing definitions.`,
        visualCue: 'Sensei Hana smiles warmly and writes the core concept on the blackboard.'
      },
      {
        id: 3,
        speaker: 'Ren',
        emotion: 'surprised',
        dialogue: `So it's not just a standalone formula or rule? It actually fits into the broader engineering mechanism we are studying?`,
        visualCue: 'Ren leans forward with wide, curious eyes as the connection begins to form.'
      },
      {
        id: 4,
        speaker: 'Sensei Hana',
        emotion: 'explaining',
        dialogue: `Exactly! ${snippet ? `As noted in our curriculum: "${snippet.slice(0, 140)}..."` : `When you understand why this concept exists, applying it in tests and viva questions becomes second nature.`}`,
        visualCue: 'Sensei Hana highlights a step-by-step diagram showing how the mechanism works.'
      },
      {
        id: 5,
        speaker: 'Ren',
        emotion: 'thinking',
        dialogue: `I see! So in a viva or exam, if the professor asks about this, I should focus on the mechanism and common real-world examples!`,
        visualCue: 'Ren quickly jots down the key takeaway in his notebook with a satisfied nod.'
      },
      {
        id: 6,
        speaker: 'Sensei Hana',
        emotion: 'happy',
        dialogue: `Spot on, Ren! You've grasped the core intuition. Now let's do a quick comprehension check to make sure you're 100% test-ready!`,
        visualCue: 'Sensei Hana gives an encouraging thumbs-up with an approving smile.'
      }
    ],
    checkQuestion: {
      question: `What is the most effective approach to mastering "${target}" for exams and viva?`,
      options: [
        'Understand the underlying mechanism and real-world application step-by-step',
        'Rely purely on rote memorization without understanding principles',
        'Skip the concept and guess during assessments',
        'Assume it has no relevance to real-world engineering'
      ],
      correctIndex: 0,
      explanation: `Mastering conceptual mechanisms and real-world analogies ensures high retention and solid viva answers.`
    }
  };
};

/**
 * Retrieves an existing explainer or generates a targeted concept explainer with Gemini.
 *
 * @param {string} topicId - UUID of the topic / module
 * @param {string|null} targetConcept - Specific concept inside this module (optional)
 * @returns {Promise<Object>} Storyboard object with concept navigation
 */
export const getOrGenerateExplainer = async (topicId, targetConcept = null) => {
  // 1. Fetch topic notes and title
  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select('id, title, content')
    .eq('id', topicId)
    .single();

  if (topErr || !topic) {
    throw new AppError('Topic not found', 404);
  }

  const topicTitle = topic.title;
  const topicContent = topic.content || '';
  const concepts = await extractConceptsFromNotes(topicContent, topicTitle);

  const cleanConcept = targetConcept ? targetConcept.trim() : null;
  const conceptKey = cleanConcept ? slugify(cleanConcept) : 'default';

  // 2. Check if explainer row exists in explainers table
  const { data: existing } = await supabase
    .from('explainers')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();

  // If already stored in new multi-concept structure: { default: story, [key]: story }
  const cachedStories = existing?.storyboard?.stories || {};
  if (cachedStories[conceptKey]) {
    logger.info(`Serving cached story for topic ${topicId}, concept: ${conceptKey}`);
    return {
      topicId,
      topicTitle,
      concepts,
      activeConcept: cleanConcept || 'Module Overview',
      storyboard: cachedStories[conceptKey],
      source: existing.source,
      createdAt: existing.created_at
    };
  }

  // If legacy single-storyboard matches default request
  if (!cleanConcept && existing?.storyboard && Array.isArray(existing.storyboard.scenes)) {
    return {
      topicId,
      topicTitle,
      concepts,
      activeConcept: 'Module Overview',
      storyboard: existing.storyboard,
      source: existing.source,
      createdAt: existing.created_at
    };
  }

  // 3. Generate targeted concept story with Gemini
  let storyboard = null;
  let source = 'llm';

  const ai = getGeminiClient();
  if (ai && config.gemini.apiKey) {
    try {
      const isSpecific = Boolean(cleanConcept);
      const prompt = `You are a scriptwriter for an educational anime visual novel.
Characters:
1. "Sensei Hana": Patient, knowledgeable, supportive female professor who explains concepts using intuitive college-life analogies (cooking, smartphones, sports, library, building blocks).
2. "Ren": Relatable, enthusiastic student who makes common mistakes, asks questions, and has 'aha!' moments.

Full Module Title: "${topicTitle}"
${isSpecific ? `Target Specific Sub-Topic to Explain: "${cleanConcept}"` : 'Target: Comprehensive Module Overview and Core Principles'}

Module Study Notes & Curriculum:
${topicContent.slice(0, 9000)}

Task:
Write a 6 to 8 scene visual novel educational dialogue where Sensei Hana teaches Ren ${isSpecific ? `specifically about "${cleanConcept}"` : 'the core conceptual foundation of this module'} step-by-step.
${isSpecific ? `Focus heavily and specifically on "${cleanConcept}": address common confusions, explain why it matters in engineering, provide a concrete real-world analogy, and give a viva tip.` : 'Focus on the main themes and demystify the core mechanisms.'}

For each scene provide:
- "id": integer (1 to N)
- "speaker": exactly "Sensei Hana" or "Ren"
- "emotion": one of ["neutral", "happy", "thinking", "surprised", "explaining"]
- "dialogue": 20-40 words spoken line. Natural, expressive, viva-ready.
- "visualCue": Short stage direction description (e.g. "Sensei draws a flow diagram on the board").

Include exactly 1 quick comprehension check at the end testing ${isSpecific ? `"${cleanConcept}"` : 'the core concept'}:
- "checkQuestion": {
    "question": "Clear multiple-choice question testing the concept taught in this story",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctIndex": integer (0 to 3),
    "explanation": "Clear explanation of why this answer is correct"
  }

Respond ONLY with valid JSON in this exact structure:
{
  "topicTitle": "${topicTitle}",
  "targetConcept": "${cleanConcept || 'Module Overview'}",
  "synopsis": "Short 1-sentence overview of what is taught in this dialogue",
  "scenes": [
    {
      "id": 1,
      "speaker": "Ren",
      "emotion": "thinking",
      "dialogue": "...",
      "visualCue": "..."
    }
  ],
  "checkQuestion": {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "..."
  }
}`;

      const aiResponse = await ai.models.generateContent({
        model: config.gemini.model || 'gemini-3.5-flash-lite',
        contents: prompt
      });

      let raw = aiResponse?.text ? aiResponse.text.trim() : '';
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length >= 4) {
        storyboard = {
          topicTitle: parsed.topicTitle || topicTitle,
          targetConcept: parsed.targetConcept || cleanConcept || 'Module Overview',
          synopsis: parsed.synopsis || `Sensei Hana and Ren explore ${cleanConcept || topicTitle}`,
          scenes: parsed.scenes.map((s, idx) => ({
            id: s.id || (idx + 1),
            speaker: s.speaker === 'Ren' ? 'Ren' : 'Sensei Hana',
            emotion: ['neutral', 'happy', 'thinking', 'surprised', 'explaining'].includes(s.emotion) ? s.emotion : 'neutral',
            dialogue: String(s.dialogue || '').trim(),
            visualCue: String(s.visualCue || '').trim()
          })),
          checkQuestion: parsed.checkQuestion && parsed.checkQuestion.question ? {
            question: String(parsed.checkQuestion.question).trim(),
            options: Array.isArray(parsed.checkQuestion.options) ? parsed.checkQuestion.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof parsed.checkQuestion.correctIndex === 'number' ? parsed.checkQuestion.correctIndex : 0,
            explanation: String(parsed.checkQuestion.explanation || '').trim()
          } : null
        };
      }
    } catch (llmErr) {
      logger.warn(`Gemini concept explainer generation failed: ${llmErr.message}`);
    }
  }

  // 4. Fallback if LLM failed
  if (!storyboard) {
    storyboard = createFallbackStoryboard(topicTitle, cleanConcept, topicContent);
    source = 'fallback';
  }

  // 5. Update cached stories object in explainers table
  const updatedStories = {
    ...cachedStories,
    [conceptKey]: storyboard
  };

  // If default story wasn't set, also store it
  if (!updatedStories['default'] && !cleanConcept) {
    updatedStories['default'] = storyboard;
  }

  const { data: saved, error: saveErr } = await supabase
    .from('explainers')
    .upsert({
      topic_id: topicId,
      storyboard: {
        concepts,
        stories: updatedStories,
        // Keep default scenes at root for backward compatibility
        ...(updatedStories['default'] || storyboard)
      },
      source
    })
    .select()
    .single();

  if (saveErr) {
    logger.warn('Failed to cache concept explainer in database:', saveErr.message);
  }

  return {
    topicId,
    topicTitle,
    concepts,
    activeConcept: cleanConcept || 'Module Overview',
    storyboard,
    source,
    createdAt: saved?.created_at || new Date().toISOString()
  };
};

/**
 * Returns the list of auto-extracted concepts for a topic.
 */
export const getTopicConcepts = async (topicId) => {
  const { data: topic, error } = await supabase
    .from('topics')
    .select('id, title, content')
    .eq('id', topicId)
    .single();

  if (error || !topic) {
    throw new AppError('Topic not found', 404);
  }

  const concepts = await extractConceptsFromNotes(topic.content, topic.title);
  return {
    topicId,
    title: topic.title,
    concepts
  };
};

/**
 * Saves student feedback and check-question score for an explainer.
 */
export const recordExplainerFeedback = async (userId, topicId, helped, checkScore = null) => {
  const { data, error } = await supabase
    .from('explainer_feedback')
    .insert({
      user_id: userId,
      topic_id: topicId,
      helped: Boolean(helped),
      check_score: checkScore !== null ? Number(checkScore) : null
    })
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

export default {
  getOrGenerateExplainer,
  getTopicConcepts,
  extractConceptsFromNotes,
  recordExplainerFeedback
};
