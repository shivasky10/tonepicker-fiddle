import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://tonepicker-fiddle.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Invalid request. Please check your input.');
        case 401:
          throw new Error(data.error || 'Authentication failed. Please check your API key.');
        case 429:
          throw new Error(data.error || 'Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error(data.error || 'Server error. Please try again later.');
        default:
          throw new Error(data.error || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

export const adjustTone = async (text, x, y) => {
  try {
    const response = await api.post('/adjust-tone', {
      text: text.trim(),
      x: parseInt(x),
      y: parseInt(y)
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to adjust tone: ${error.message}`);
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

export const testConnection = async () => {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default api;
