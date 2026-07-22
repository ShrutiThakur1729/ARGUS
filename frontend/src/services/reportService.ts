import api from './api';

export interface Report {
  id: string;
  title: string;
  file_type: string;
  recipient_email: string;
  status: string;
  size: string;
  timestamp: string;
}

export const reportService = {
  async getReportsHistory(): Promise<Report[]> {
    const response = await api.get('/reports/');
    return response.data;
  },

  async sendEmailReport(title: string, fileType: string, email: string, content?: string): Promise<Report> {
    const response = await api.post('/reports/send-email', {
      title,
      file_type: fileType,
      recipient_email: email,
      content
    });
    return response.data;
  },

  async resendReport(reportId: string): Promise<Report> {
    const response = await api.post(`/reports/${reportId}/resend`);
    return response.data;
  }
};
