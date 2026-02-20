const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = {
  baseURL: API_URL,
  
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },
  
  get(endpoint: string) {
    return this.fetch(endpoint);
  },
  
  post(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(endpoint: string) {
    return this.fetch(endpoint, {
      method: 'DELETE',
    });
  },
};
