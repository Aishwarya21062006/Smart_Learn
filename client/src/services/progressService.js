import api from './api.js';

export const progressService = {
  /**
   * Fetches overall student progress analytics, mastery scores, and attempt history.
   */
  async getProgress() {
    const response = await api.get('/progress');
    return response.data;
  }
};

export default progressService;
