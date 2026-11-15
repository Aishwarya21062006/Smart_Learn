import asyncHandler from '../utils/asyncHandler.js';
import { getStudentDailyUsage, askAITutor } from '../services/tutor.service.js';

/**
 * Tutor Controller
 * Handles AI Tutor chat and daily quota checks.
 */

export const getTutorUsage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const usage = await getStudentDailyUsage(userId);
  res.json(usage);
});

export const chatWithTutor = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message, topicId } = req.body;

  const result = await askAITutor(userId, message, topicId);
  res.json(result);
});

export default {
  getTutorUsage,
  chatWithTutor
};
