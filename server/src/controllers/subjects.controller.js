import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/subjects
 * Retrieves all subjects with the current student's completion percentage.
 */
export const getSubjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Fetch all subjects ordered by title
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('id, title, description, created_at')
    .order('created_at', { ascending: true });

  if (subjErr) throw new AppError(subjErr.message, 500);

  // 2. Fetch all topics (id and subject_id)
  const { data: topics, error: topErr } = await supabase
    .from('topics')
    .select('id, subject_id');

  if (topErr) throw new AppError(topErr.message, 500);

  // 3. Fetch user's progress for completed topics
  const { data: progress, error: progErr } = await supabase
    .from('topic_progress')
    .select('topic_id, status')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (progErr) throw new AppError(progErr.message, 500);

  const completedTopicIds = new Set((progress || []).map(p => p.topic_id));

  // 4. Calculate stats per subject
  const subjectsWithProgress = (subjects || []).map(subject => {
    const subjectTopics = (topics || []).filter(t => t.subject_id === subject.id);
    const totalTopics = subjectTopics.length;
    const completedTopics = subjectTopics.filter(t => completedTopicIds.has(t.id)).length;
    const completionPercentage = totalTopics > 0 
      ? Math.round((completedTopics / totalTopics) * 100) 
      : 0;

    return {
      ...subject,
      totalTopics,
      completedTopics,
      completionPercentage
    };
  });

  res.json(subjectsWithProgress);
});

/**
 * GET /api/subjects/:id
 * Retrieves a single subject along with its topics, including the current student's status and mastery.
 */
export const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Fetch subject details
  const { data: subject, error: subjErr } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (subjErr || !subject) {
    throw new AppError('Subject not found', 404);
  }

  // 2. Fetch all topics for this subject
  const { data: topics, error: topErr } = await supabase
    .from('topics')
    .select('id, subject_id, title, difficulty, position, created_at')
    .eq('subject_id', id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (topErr) throw new AppError(topErr.message, 500);

  // 3. Fetch user progress for topics in this subject
  const topicIds = (topics || []).map(t => t.id);
  let progressMap = new Map();

  if (topicIds.length > 0) {
    const { data: progressList, error: progErr } = await supabase
      .from('topic_progress')
      .select('topic_id, status, mastery_score, last_attempt_at')
      .eq('user_id', userId)
      .in('topic_id', topicIds);

    if (progErr) throw new AppError(progErr.message, 500);

    for (const prog of (progressList || [])) {
      progressMap.set(prog.topic_id, prog);
    }
  }

  // 4. Merge topic details with user progress
  const enrichedTopics = (topics || []).map(topic => {
    const userProgress = progressMap.get(topic.id);
    return {
      ...topic,
      status: userProgress?.status || 'not_started',
      mastery_score: userProgress?.mastery_score != null ? Number(userProgress.mastery_score) : 0,
      last_attempt_at: userProgress?.last_attempt_at || null
    };
  });

  res.json({
    ...subject,
    topics: enrichedTopics
  });
});
