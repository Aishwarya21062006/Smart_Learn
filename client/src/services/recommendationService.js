import api from './api.js';

/**
 * Recommendation API Client Service
 */
export const recommendationService = {
  /**
   * Fetches adaptive topic recommendations for the current student.
   * @param {number} limit - Maximum number of recommendations (default: 4)
   * @returns {Promise<Array>} List of recommendations
   */
  async getRecommendations(limit = 4) {
    const response = await api.get(`/recommendations?limit=${limit}`);
    return response.data?.recommendations || [];
  }
};

export default recommendationService;
