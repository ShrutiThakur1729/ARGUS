import api from './api';

export interface Incident {
  id: string;
  title: string;
  description?: string;
  status: string;
  severity: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export const incidentService = {
  async getIncidents(): Promise<Incident[]> {
    const response = await api.get('/incidents/');
    return response.data;
  },

  async getIncident(incidentId: string): Promise<Incident> {
    const response = await api.get(`/incidents/${incidentId}`);
    return response.data;
  },

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    const response = await api.post('/incidents/', incidentData);
    return response.data;
  },

  async updateIncident(incidentId: string, incidentUpdate: Partial<Incident>): Promise<Incident> {
    const response = await api.put(`/incidents/${incidentId}`, incidentUpdate);
    return response.data;
  }
};
