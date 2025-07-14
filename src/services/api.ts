// Vite exposes environment variables via `import.meta.env.*`, and any custom
// variable must be prefixed with `VITE_` to be statically replaced at build time.
// Using `process.env` in browser code causes a runtime ReferenceError because
// `process` is not defined. Fall back to the local API URL when the env var is
// absent.

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://dizesi-backend.onrender.com/api";
  // const API_BASE_URL =
  // (import.meta.env.VITE_API_URL as string | undefined) ??
  // "http://localhost:8000/api";
  

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getFormDataHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async requestFormData(endpoint: string, formData: FormData) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getFormDataHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; password: string; email: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Posts endpoints
  async getPosts(feed?: 'general' | 'following') {
    const query = feed ? `?feed=${feed}` : '';
    return this.request(`/posts${query}`);
  }

  async createPost(postData: FormData | { title: string; content: string }) {
    if (postData instanceof FormData) {
      return this.requestFormData('/posts', postData);
    }
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: number) {
    return this.request('/posts/like', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }

  // Username availability
  async checkUsername(username: string): Promise<{ available: boolean }> {
    return this.request(`/auth/check-username?username=${encodeURIComponent(username)}`);
  }

  // User endpoints
  async getProfile(username: string) {
    return this.request(`/profile/${username}`);
  }

  async updateProfile(formData: FormData) {
    const url = `${API_BASE_URL}/profile`;
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async uploadProfileImage(type: 'profile_picture' | 'cover_image', file: File) {
    const url = `${API_BASE_URL}/profile`;
    const formData = new FormData();
    formData.append(type, file);
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async removeProfileImage(type: 'profile_picture' | 'cover_image') {
    const url = `${API_BASE_URL}/profile`;
    const formData = new FormData();
    formData.append(type === 'profile_picture' ? 'remove_profile_picture' : 'remove_cover_image', 'true');
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async followUser(userId: number) {
    return this.request('/posts/follow', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Search
  async search(query: string, type: 'posts' | 'users' = 'posts') {
    return this.request(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  // Admin
  async getPendingPosts() {
    return this.request('/admin/pending-posts');
  }

  async approvePost(postId: number) {
    return this.request(`/admin/posts/${postId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectPost(postId: number) {
    return this.request(`/admin/posts/${postId}/reject`, {
      method: 'DELETE',
    });
  }

  async getAllUsers() {
    return this.request('/admin/users');
  }

  async getAllPosts() {
    return this.request('/admin/posts');
  }

  async commentOnPost(postId: number, content: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ postId, content }),
    });
  }

  async getComments(postId: number) {
    return this.request(`/posts/${postId}/comments`);
  }

  async reportPost(postId: number, reason?: string) {
    return this.request(`/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getReports() {
    return this.request('/admin/reports');
  }

  async deleteReportedPost(postId: number) {
    return this.request(`/admin/posts/${postId}`, { method: 'DELETE' });
  }

  async deletePost(postId: number) {
    const url = `${API_BASE_URL}/posts/${postId}`;
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
}

export const apiService = new ApiService();
