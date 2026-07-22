import api from './api';

export interface Alert {
  id: string;
  agent_id?: string;
  telemetry_id?: string;
  incident_id?: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  mitre_tactic?: string;
  mitre_technique?: string;
  mitre_technique_id?: string;
  created_at: string;
  updated_at: string;
}

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    const response = await api.get('/alerts/');
    return response.data;
  },

  async getAlert(alertId: string): Promise<Alert> {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const response = await api.post('/alerts/', alertData);
    return response.data;
  },

  async updateAlert(alertId: string, alertUpdate: Partial<Alert>): Promise<Alert> {
    const response = await api.put(`/alerts/${alertId}`, alertUpdate);
    return response.data;
  },

  async dispatchAlert(alertData: {
    title: string;
    description: string;
    severity: string;
    mitre_tactic?: string;
    mitre_technique_id?: string;
    mitre_technique?: string;
    agent_id?: string;
  }): Promise<any> {
    const response = await api.post('/dispatcher/dispatch', alertData);
    return response.data;
  },

  async simulateScenario(scenario: string): Promise<any> {
    const response = await api.post('/dispatcher/simulate', { scenario });
    return response.data;
  }
};
