import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://api.tu-zi.com/v1';

interface TaskResponse {
  id: string;
  status: string;
  progress: number;
  video_url?: string;
  error?: string;
}

interface BalanceData {
  totalLimit: number;
  totalUsage: number;
  remaining: number;
  usagePercentage: number;
}

class SoraApiClient {
  private client: AxiosInstance;
  private apiKey: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${key}`;
  }

  async submitVideoGenerationTask(
    prompt: string,
    model: 'sora-2' | 'sora-2-pro',
    imageFile?: File
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API密钥未设置');
    }

    const formData = new FormData();
    formData.append('model', model);
    formData.append('prompt', prompt);
    formData.append('seconds', model === 'sora-2' ? '15' : '25');
    formData.append('size', '720x1280');

    if (imageFile) {
      formData.append('input_reference', imageFile);
    }

    try {
      const response = await this.client.post<TaskResponse>('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.id) {
        throw new Error('API响应中未找到任务ID');
      }

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `任务提交失败: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<TaskResponse> {
    if (!this.apiKey) {
      throw new Error('API密钥未设置');
    }

    try {
      const response = await this.client.get<TaskResponse>(`/videos/${taskId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('任务未找到或已过期');
      }
      throw error;
    }
  }

  async getBalance(): Promise<BalanceData> {
    if (!this.apiKey) {
      throw new Error('API密钥未设置');
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const [subscriptionRes, usageRes] = await Promise.all([
        this.client.get('/dashboard/billing/subscription'),
        this.client.get(
          `/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(
            endDate
          )}`
        ),
      ]);

      const totalLimit = subscriptionRes.data.hard_limit_usd || 0;
      const totalUsage = (usageRes.data.total_usage || 0) / 100;
      const remaining = totalLimit - totalUsage;
      const usagePercentage = totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;

      return {
        totalLimit,
        totalUsage,
        remaining,
        usagePercentage,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `查询额度失败: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}

export const apiClient = new SoraApiClient();
export type { TaskResponse, BalanceData };
