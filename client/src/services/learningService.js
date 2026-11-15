import api from './api.js';

export const learningService = {
  /**
   * Fetches all subjects with current student completion percentage.
   */
  async getSubjects() {
    const response = await api.get('/subjects');
    return response.data;
  },

  /**
   * Fetches a specific subject with its list of topics and student mastery/status.
   */
  async getSubject(id) {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  /**
   * Fetches topic content, study resources, and automatically marks the topic in_progress.
   */
  async getTopic(id) {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  }
};

export default learningService;
