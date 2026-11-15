import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/topics/:id
 * Retrieves topic content, associated resources, and student progress.
 * If student hasn't started the topic, updates status to 'in_progress'.
 */
export const getTopicById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Fetch topic details along with its subject title
  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select(`
      id,
      subject_id,
      title,
      content,
      difficulty,
      position,
      created_at,
      subjects:subject_id (
        id,
        title
      )
    `)
    .eq('id', id)
    .single();

  if (topErr || !topic) {
    throw new AppError('Topic not found', 404);
  }

  // 2. Fetch resources for this topic
  const { data: resources, error: resErr } = await supabase
    .from('resources')
    .select('id, topic_id, title, type, url')
    .eq('topic_id', id);

  if (resErr) throw new AppError(resErr.message, 500);

  // 3. Fetch or initialize student's progress for this topic
  const { data: existingProgress, error: progErr } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', id)
    .maybeSingle();

  if (progErr) throw new AppError(progErr.message, 500);

  let currentProgress = existingProgress;

  if (!existingProgress) {
    // First time opening the topic: initialize to 'in_progress'
    const { data: newProgress, error: insertErr } = await supabase
      .from('topic_progress')
      .insert({
        user_id: userId,
        topic_id: id,
        status: 'in_progress',
        mastery_score: 0
      })
      .select()
      .single();

    if (insertErr) throw new AppError(insertErr.message, 500);
    currentProgress = newProgress;
  } else if (existingProgress.status === 'not_started') {
    // If marked as not_started, transition to in_progress
    const { data: updatedProgress, error: updateErr } = await supabase
      .from('topic_progress')
      .update({ status: 'in_progress' })
      .eq('user_id', userId)
      .eq('topic_id', id)
      .select()
      .single();

    if (updateErr) throw new AppError(updateErr.message, 500);
    currentProgress = updatedProgress;
  }

  res.json({
    id: topic.id,
    subjectId: topic.subject_id,
    subjectTitle: topic.subjects?.title || 'Subject',
    title: topic.title,
    content: topic.content,
    difficulty: topic.difficulty,
    position: topic.position,
    resources: resources || [],
    progress: {
      status: currentProgress?.status || 'in_progress',
      masteryScore: currentProgress?.mastery_score != null ? Number(currentProgress.mastery_score) : 0,
      lastAttemptAt: currentProgress?.last_attempt_at || null
    }
  });
});
