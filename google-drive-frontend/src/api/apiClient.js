// src/api/apiClient.js

import axios from 'axios';
import { supabase } from '../supabaseClient';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// This interceptor automatically adds a valid token to every request.
apiClient.interceptors.request.use(
  async (config) => {
    // This will get the current session, refreshing the token if it's expired.
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