import api from './api.js';

export const quizService = {
  /**
   * Fetches up to 10 random questions for a topic (answers are withheld by server).
   * @param {string} topicId
   */
  async getQuiz(topicId) {
    const response = await api.get(`/topics/${topicId}/quiz`);
    return response.data;
  },

  /**
   * Submits student answers for grading, mastery calculation, and review.
   * @param {string} topicId
   * @param {Array<{ questionId: string, selectedIndex: number | null }>} answers
   */
  async submitQuiz(topicId, answers) {
    const response = await api.post(`/topics/${topicId}/quiz/submit`, {
      answers
    });
    return response.data;
  }
};

export default quizService;
