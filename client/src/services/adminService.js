import api from './api.js';

export const adminService = {
  /**
   * Fetches overall counts for the admin dashboard.
   */
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // --- Subjects ---
  async getSubjects() {
    const response = await api.get('/admin/subjects');
    return response.data;
  },

  async createSubject(data) {
    const response = await api.post('/admin/subjects', data);
    return response.data;
  },

  async updateSubject(id, data) {
    const response = await api.put(`/admin/subjects/${id}`, data);
    return response.data;
  },

  async deleteSubject(id) {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data;
  },

  // --- Topics ---
  async getTopics(subjectId = null) {
    const response = await api.get('/admin/topics', {
      params: subjectId ? { subjectId } : {}
    });
    return response.data;
  },

  async getTopicById(id) {
    const response = await api.get(`/admin/topics/${id}`);
    return response.data;
  },

  async createTopic(data) {
    const response = await api.post('/admin/topics', data);
    return response.data;
  },

  async updateTopic(id, data) {
    const response = await api.put(`/admin/topics/${id}`, data);
    return response.data;
  },

  async deleteTopic(id) {
    const response = await api.delete(`/admin/topics/${id}`);
    return response.data;
  },

  async reindexTopic(id) {
    const response = await api.post(`/admin/topics/${id}/reindex`);
    return response.data;
  },

  /**
   * Uploads a local PDF file by encoding to base64 and saving to Supabase Storage.
   * Returns { url, fileName, title }
   */
  async uploadPdf(file) {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.post('/admin/upload-pdf', {
      fileName: file.name,
      fileBase64: base64,
      contentType: file.type || 'application/pdf'
    });
    return response.data;
  },

  // --- Questions ---
  async getQuestions(topicId) {
    const response = await api.get(`/admin/topics/${topicId}/questions`);
    return response.data;
  },

  async createQuestion(topicId, data) {
    const response = await api.post(`/admin/topics/${topicId}/questions`, data);
    return response.data;
  },

  async updateQuestion(questionId, data) {
    const response = await api.put(`/admin/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(questionId) {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  /**
   * Generates multiple-choice questions automatically using Gemini based on topic notes.
   */
  async generateQuestions(topicId, count = 5) {
    const response = await api.post(`/admin/topics/${topicId}/generate-questions`, {
      count
    });
    return response.data;
  }
};

export default adminService;
