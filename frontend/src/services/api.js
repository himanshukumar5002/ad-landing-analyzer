import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds timeout due to scraping/GPT latency
});

export const apiService = {
  /**
   * Performs the ad to landing page fit analysis.
   * @param {string} adText - Advertisement copy
   * @param {string} landingUrl - Landing page URL
   */
  analyzeFit: async (adText, landingUrl) => {
    const response = await api.post('/analyze', {
      ad_text: adText,
      landing_url: landingUrl,
    });
    return response.data;
  },

  /**
   * Clusters multiple ads and analyzes their fits.
   * @param {string[]} adTexts - List of ad text copies
   * @param {string} landingUrl - Landing page URL
   */
  analyzeMultiple: async (adTexts, landingUrl) => {
    const response = await api.post('/analyze-multiple', {
      ad_texts: adTexts,
      landing_url: landingUrl,
    });
    return response.data;
  },

  /**
   * Uploads an image screenshot to perform OCR and extract details.
   * @param {File} file - Image file object
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return response.data;
  },

  /**
   * Checks the health and configured dependencies of the backend.
   */
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
