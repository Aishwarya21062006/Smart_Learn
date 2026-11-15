import api from './api.js';

export const explainerService = {
  /**
   * Retrieves the detected sub-topics / concepts for a module.
   * @param {string} topicId
   * @returns {Promise<{ topicId: string, title: string, concepts: string[] }>}
   */
  async getConcepts(topicId) {
    const response = await api.get(`/topics/${topicId}/concepts`);
    return response.data;
  },

  /**
   * Retrieves or generates a visual novel anime explainer for a given topic/module.
   * Can optionally target a specific concept or sub-topic.
   * @param {string} topicId
   * @param {string|null} [concept]
   * @returns {Promise<Object>} Storyboard object with scenes, concept, and checkQuestion
   */
  async getExplainer(topicId, concept = null) {
    const query = concept ? `?concept=${encodeURIComponent(concept)}` : '';
    const response = await api.get(`/topics/${topicId}/explainer${query}`);
    return response.data;
  },

  /**
   * Submits student feedback for an explainer.
   * @param {string} topicId
   * @param {{ helped: boolean, checkScore?: number }} data
   * @returns {Promise<Object>}
   */
  async submitFeedback(topicId, data) {
    const response = await api.post(`/topics/${topicId}/explainer/feedback`, data);
    return response.data;
  }
};

export default explainerService;
