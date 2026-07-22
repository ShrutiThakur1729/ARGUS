import api from './api';

export interface Prediction {
  id: string;
  incident_id: string;
  predicted_next_step: string;
  probability: number;
  mitre_tactic?: string;
  mitre_technique?: string;
  created_at: string;
  updated_at: string;
}

export const predictionService = {
  async getPredictions(): Promise<Prediction[]> {
    const response = await api.get('/predictions/');
    return response.data;
  },

  async createPrediction(predictionData: Partial<Prediction>): Promise<Prediction> {
    const response = await api.post('/predictions/', predictionData);
    return response.data;
  },

  async getPredictionsByIncident(incidentId: string): Promise<Prediction[]> {
    const response = await api.get(`/predictions/incident/${incidentId}`);
    return response.data;
  },

  async getPrediction(predictionId: string): Promise<Prediction> {
    const response = await api.get(`/predictions/${predictionId}`);
    return response.data;
  }
};
