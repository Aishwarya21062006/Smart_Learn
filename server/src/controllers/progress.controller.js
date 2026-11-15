import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/progress
 * Returns the student's complete learning progress summary:
 * - Subject completion percentages
 * - Topic-by-topic status and mastery scores
 * - Weak topics (mastery < 50, attempted)
 * - Strong topics (mastery >= 75)
 * - Overall mastery average
 * - Last 10 quiz attempts with timestamps and scores
 */
export const getStudentProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Fetch all subjects
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('id, title')
    .order('created_at', { ascending: true });

  if (subjErr) throw new AppError(subjErr.message, 500);

  // 2. Fetch all topics with their subject titles
  const { data: topics, error: topErr } = await supabase
    .from('topics')
    .select(`
      id,
      subject_id,
      title,
      difficulty,
      position,
      subjects:subject_id (
        id,
        title
      )
    `)
    .order('position', { ascending: true });

  if (topErr) throw new AppError(topErr.message, 500);

  // 3. Fetch user's topic progress
  const { data: progressList, error: progErr } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', userId);

  if (progErr) throw new AppError(progErr.message, 500);

  const progressMap = new Map();
  for (const p of progressList || []) {
    progressMap.set(p.topic_id, p);
  }

  // 4. Map topics with progress
  const enrichedTopics = (topics || []).map(t => {
    const prog = progressMap.get(t.id);
    const masteryScore = prog?.mastery_score != null ? Number(prog.mastery_score) : 0;
    const status = prog?.status || 'not_started';
    const attempted = prog?.last_attempt_at != null || masteryScore > 0;

    let label = 'not_attempted';
    if (attempted) {
      if (masteryScore < 50) label = 'weak';
      else if (masteryScore >= 75) label = 'strong';
      else label = 'average';
    }

    return {
      id: t.id,
      title: t.title,
      subjectId: t.subject_id,
      subjectTitle: t.subjects?.title || 'Unknown Subject',
      difficulty: t.difficulty,
      position: t.position,
      status,
      masteryScore,
      masteryLabel: label,
      attempted,
      lastAttemptAt: prog?.last_attempt_at || null
    };
  });

  // 5. Subject completion summary
  const completionBySubject = (subjects || []).map(s => {
    const subjectTopics = enrichedTopics.filter(t => t.subjectId === s.id);
    const totalTopics = subjectTopics.length;
    const completedTopics = subjectTopics.filter(t => t.status === 'completed').length;
    const completionPercentage = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

    return {
      id: s.id,
      title: s.title,
      totalTopics,
      completedTopics,
      completionPercentage
    };
  });

  // 6. Weak and Strong Topics lists
  const weakTopics = enrichedTopics
    .filter(t => t.attempted && t.masteryScore < 50)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const strongTopics = enrichedTopics
    .filter(t => t.attempted && t.masteryScore >= 75)
    .sort((a, b) => b.masteryScore - a.masteryScore);

  // 7. Overall Average Mastery across attempted topics
  const attemptedTopics = enrichedTopics.filter(t => t.attempted);
  const averageMastery = attemptedTopics.length > 0
    ? Math.round(
        (attemptedTopics.reduce((sum, t) => sum + t.masteryScore, 0) / attemptedTopics.length) * 10
      ) / 10
    : 0;

  // 8. Fetch last 10 quiz attempts with topic and subject details
  const { data: attempts, error: attErr } = await supabase
    .from('attempts')
    .select(`
      id,
      topic_id,
      score,
      total_questions,
      correct_answers,
      taken_at,
      topics:topic_id (
        id,
        title,
        subject_id,
        subjects:subject_id (
          id,
          title
        )
      )
    `)
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
    .limit(10);

  if (attErr) throw new AppError(attErr.message, 500);

  const recentAttempts = (attempts || []).map(a => ({
    id: a.id,
    topicId: a.topic_id,
    topicTitle: a.topics?.title || 'Unknown Topic',
    subjectTitle: a.topics?.subjects?.title || 'Unknown Subject',
    score: Number(a.score),
    totalQuestions: a.total_questions,
    correctAnswers: a.correct_answers,
    takenAt: a.taken_at
  }));

  res.json({
    completionBySubject,
    topics: enrichedTopics,
    weakTopics,
    strongTopics,
    averageMastery,
    totalAttemptedTopics: attemptedTopics.length,
    recentAttempts
  });
});

export default { getStudentProgress };
