import api from './api.js';

export const tutorService = {
  /**
   * Fetches the current student's daily message quota and usage.
   * @returns {Promise<{ used: number, remaining: number, limit: number, day: string }>}
   */
  async getUsage() {
    const response = await api.get('/tutor/usage');
    return response.data;
  },

  /**
   * Sends a student question to the RAG-grounded AI Tutor.
   * @param {string} message - Student's question
   * @param {string} [topicId] - Optional topic UUID to restrict retrieval context
   * @returns {Promise<{ answer: string, sources: string[], usage: { used: number, remaining: number, limit: number } }>}
   */
  async sendMessage(message, topicId = null) {
    const response = await api.post('/tutor/chat', {
      message,
      topicId: topicId || null
    });
    return response.data;
  }
};

export default tutorService;
