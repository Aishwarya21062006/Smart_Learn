import { z } from 'zod';
import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { gradeQuiz } from '../services/scoring.service.js';
import { calculateMastery } from '../services/mastery.service.js';

// --- Zod Validation ---

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid('Valid question ID required'),
      selectedIndex: z.number().int().min(0).max(10).nullable()
    })
  ).min(1, 'At least one answer must be provided')
});

/**
 * GET /api/topics/:id/quiz
 * Retrieves up to 10 random questions for a topic.
 * 
 * SECURITY MANDATE: This endpoint MUST NEVER return correct_index or explanation.
 */
export const getQuizForTopic = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;

  // 1. Check that the topic exists
  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select('id, title, subject_id, subjects(title)')
    .eq('id', topicId)
    .single();

  if (topErr || !topic) {
    throw new AppError('Topic not found', 404);
  }

  // 2. Fetch all questions for this topic
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question, options')
    .eq('topic_id', topicId);

  if (qErr) throw new AppError(qErr.message, 500);

  if (!questions || questions.length === 0) {
    return res.json({
      topicId: topic.id,
      topicTitle: topic.title,
      subjectTitle: topic.subjects?.title || '',
      questions: []
    });
  }

  // 3. Shuffle questions using Fisher-Yates and take at most 10
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedQuestions = shuffled.slice(0, 10);

  // 4. Double-check: Sanitize output so correct_index and explanation are strictly stripped
  const sanitized = selectedQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json({
    topicId: topic.id,
    topicTitle: topic.title,
    subjectTitle: topic.subjects?.title || '',
    questions: sanitized
  });
});

/**
 * POST /api/topics/:id/quiz/submit
 * Grades the submitted answers against the database, records the attempt,
 * updates topic mastery, and returns the detailed result & review.
 */
export const submitQuizForTopic = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  // 1. Fetch the actual questions with correct_index and explanation
  const questionIds = answers.map(a => a.questionId);
  const { data: dbQuestions, error: qErr } = await supabase
    .from('questions')
    .select('id, question, options, correct_index, explanation')
    .in('id', questionIds)
    .eq('topic_id', topicId);

  if (qErr) throw new AppError(qErr.message, 500);
  if (!dbQuestions || dbQuestions.length === 0) {
    throw new AppError('No matching questions found for this quiz', 400);
  }

  // 2. Grade quiz using scoring service
  const gradeResult = gradeQuiz(dbQuestions, answers);
  const { score, correct, total, suggestExplainer, review } = gradeResult;

  // 3. Record attempt row in public.attempts
  const { error: attemptErr } = await supabase
    .from('attempts')
    .insert({
      user_id: userId,
      topic_id: topicId,
      score,
      total_questions: total,
      correct_answers: correct
    });

  if (attemptErr) throw new AppError(attemptErr.message, 500);

  // 4. Fetch current topic progress
  const { data: existingProgress, error: progErr } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle();

  if (progErr) throw new AppError(progErr.message, 500);

  // 5. Calculate new mastery and status
  const currentMastery = existingProgress ? Number(existingProgress.mastery_score) : null;
  const currentStatus = existingProgress ? existingProgress.status : 'in_progress';
  const masteryResult = calculateMastery(score, currentMastery, currentStatus);

  // 6. Upsert topic_progress with updated mastery and timestamp
  const { error: upsertErr } = await supabase
    .from('topic_progress')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      status: masteryResult.status,
      mastery_score: masteryResult.mastery,
      last_attempt_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,topic_id'
    });

  if (upsertErr) throw new AppError(upsertErr.message, 500);

  res.json({
    score,
    correct,
    total,
    mastery: masteryResult.mastery,
    status: masteryResult.status,
    masteryLabel: masteryResult.label,
    suggestExplainer,
    review
  });
});
