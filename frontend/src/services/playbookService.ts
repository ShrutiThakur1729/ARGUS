import api from './api';

export interface Playbook {
  id: string;
  incident_id: string;
  title: string;
  description?: string;
  steps: any[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const playbookService = {
  async getPlaybooks(): Promise<Playbook[]> {
    const response = await api.get('/playbooks/');
    return response.data;
  },

  async createPlaybook(playbookData: Partial<Playbook>): Promise<Playbook> {
    const response = await api.post('/playbooks/', playbookData);
    return response.data;
  },

  async getPlaybooksByIncident(incidentId: string): Promise<Playbook[]> {
    const response = await api.get(`/playbooks/incident/${incidentId}`);
    return response.data;
  },

  async getPlaybook(playbookId: string): Promise<Playbook> {
    const response = await api.get(`/playbooks/${playbookId}`);
    return response.data;
  },

  async updatePlaybook(playbookId: string, playbookUpdate: Partial<Playbook>): Promise<Playbook> {
    const response = await api.put(`/playbooks/${playbookId}`, playbookUpdate);
    return response.data;
  }
};
