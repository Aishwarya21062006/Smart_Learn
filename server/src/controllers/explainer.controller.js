import asyncHandler from '../utils/asyncHandler.js';
import { getOrGenerateExplainer, getTopicConcepts, recordExplainerFeedback } from '../services/explainer.service.js';

/**
 * Explainer Controller
 * Handles visual novel anime explainer retrieval, concept extraction, and feedback.
 */

export const getExplainer = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const { concept } = req.query;
  const explainer = await getOrGenerateExplainer(topicId, concept);
  res.json(explainer);
});

export const getConcepts = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const result = await getTopicConcepts(topicId);
  res.json(result);
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const userId = req.user.id;
  const { helped, checkScore } = req.body;

  const result = await recordExplainerFeedback(userId, topicId, helped, checkScore);
  res.status(201).json({
    message: 'Feedback recorded successfully',
    feedback: result
  });
});

export default {
  getExplainer,
  getConcepts,
  submitFeedback
};
