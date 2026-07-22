import api from './api';

export interface Agent {
  id: string;
  hostname: string;
  ip_address: string;
  os_type: string;
  status: string;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
}

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await api.get('/agents/');
    return response.data;
  },

  async getAgent(agentId: string): Promise<Agent> {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
  },

  async enrollAgent(agentData: { hostname: string; ip_address: string; os_type: string }): Promise<Agent> {
    const response = await api.post('/agents/enroll', agentData);
    return response.data;
  },

  async sendHeartbeat(agentId: string, status: string = 'online'): Promise<Agent> {
    const response = await api.post(`/agents/${agentId}/heartbeat`, { status });
    return response.data;
  },

  async configureAgent(agentId: string, config: {
    status?: string;
    heartbeat_interval?: number;
    log_level?: string;
  }): Promise<Agent> {
    const response = await api.patch(`/agents/${agentId}/config`, config);
    return response.data;
  },

  async deleteAgent(agentId: string): Promise<void> {
    await api.delete(`/agents/${agentId}`);
  }
};
