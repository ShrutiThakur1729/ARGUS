import axios from 'axios';

export interface HealthResponse {
  status: string;
  database: string;
  telegram_configured: boolean;
  email_configured: boolean;
  ai_configured: boolean;
}

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await axios.get('/health/');
    return response.data;
  }
};
