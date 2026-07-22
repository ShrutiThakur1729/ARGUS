import api from './api';

export interface OrgSettings {
  name: string;
  department: string;
  faculty: string;
  institution: string;
  location: string;
  email: string;
  logo: string;
  timezone: string;
}

export const configService = {
  async getOrgSettings(): Promise<OrgSettings> {
    const response = await api.get('/config/org');
    return response.data;
  },

  async updateOrgSettings(settings: OrgSettings): Promise<OrgSettings> {
    const response = await api.put('/config/org', settings);
    return response.data;
  }
};
