import api from './api';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  email: string;
  is_active: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const formData = new FormData();
    formData.append('username', email); // standard OAuth2 uses 'username' field for email input
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const token = response.data.access_token;
    localStorage.setItem('argus_token', token);
    return token;
  },

  async registerOrganization(data: any): Promise<any> {
    const response = await api.post('/auth/register-org', data);
    return response.data;
  },

  async getMe(): Promise<UserProfile> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  loginWithGoogle(): void {
    const supabaseUrl = "https://gjlppslwymuniviarclx.supabase.co";
    // Redirect browser directly to Supabase Google Auth endpoint
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  logout(): void {
    localStorage.removeItem('argus_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('argus_token');
  }
};
