import api from './api';

export interface Telemetry {
  id: string;
  agent_id: string;
  telemetry_type: string;
  data: any;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface SystemTelemetry {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  net_sent_mb: number;
  net_recv_mb: number;
  uptime_seconds: number;
  hostname: string;
  ip_address: string;
  os: string;
  platform: string;
  source: string;
  note: string;
}

export const telemetryService = {
  async submitTelemetry(telemetryData: { agent_id: string; telemetry_type: string; data: any }): Promise<Telemetry> {
    const response = await api.post('/telemetry/', telemetryData);
    return response.data;
  },

  async getTelemetry(): Promise<Telemetry[]> {
    const response = await api.get('/telemetry/');
    return response.data;
  },

  async getAgentTelemetry(agentId: string): Promise<Telemetry[]> {
    const response = await api.get(`/telemetry/agent/${agentId}`);
    return response.data;
  },

  async getSystemTelemetry(): Promise<SystemTelemetry> {
    const response = await api.get('/telemetry/system');
    return response.data;
  }
};
