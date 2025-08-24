import axios from 'axios';
import { supabase } from '../supabaseClient';

const apiClient = axios.create({
  // Use the environment variable for the deployed URL,
  // but keep localhost as a fallback for when you're developing locally.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// The interceptor automatically adds a valid token to every request.
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;