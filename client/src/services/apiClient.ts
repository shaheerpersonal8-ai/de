import axios, { AxiosError, AxiosInstance } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/connect';
        }
        throw error;
      }
    );
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryable(error)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        return this.retryRequest(fn, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryable(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 408 || status === 429 || status >= 500;
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      return {
        code: error.response.data?.code || 'API_ERROR',
        message: error.response.data?.message || error.message || 'An error occurred',
        statusCode: error.response.status,
        details: error.response.data?.details
      };
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error: Unable to reach the server. Check your connection.',
        details: { originalError: error.message }
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: { originalError: error }
    };
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    return this.retryRequest(() =>
      this.client.post('/auth/signup', { email, password, name })
    );
  }

  async login(email: string, password: string) {
    return this.retryRequest(() =>
      this.client.post('/auth/login', { email, password })
    );
  }

  async verifyWallet(signature: string, message: string) {
    return this.retryRequest(() =>
      this.client.post('/profile/wallet/verify', { signature, message })
    );
  }

  // Profile endpoints
  async getProfile() {
    try {
      return await this.retryRequest(() => this.client.get('/profile'));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: any) {
    try {
      return await this.retryRequest(() => this.client.patch('/profile', data));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Escrow endpoints
  async getEscrows(filters?: any) {
    try {
      return await this.retryRequest(() =>
        this.client.get('/escrows', { params: filters })
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEscrow(id: string) {
    try {
      return await this.retryRequest(() => this.client.get(`/escrows/${id}`));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEscrow(data: any) {
    try {
      return await this.retryRequest(() => this.client.post('/escrows', data));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMilestone(escrowId: string, data: any) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/escrows/${escrowId}/milestones`, data)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async releaseMilestone(escrowId: string, index: number) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/escrows/${escrowId}/milestones/${index}/release`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelEscrow(escrowId: string) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/escrows/${escrowId}/cancel`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Evidence endpoints
  async submitEvidence(milestoneId: string, data: any) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/evaluations/evidence`, { milestoneId, ...data })
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEvidence(milestoneId: string) {
    try {
      return await this.retryRequest(() =>
        this.client.get(`/evaluations/evidence/${milestoneId}`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Evaluation endpoints
  async getEvaluation(id: string) {
    try {
      return await this.retryRequest(() => this.client.get(`/evaluations/${id}`));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async evaluateWork(escrowId: string, milestoneIndex: number) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/work-submissions/${escrowId}/${milestoneIndex}/evaluate`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reputation endpoints
  async getWalletProfile(wallet: string) {
    try {
      return await this.retryRequest(() =>
        this.client.get(`/reputation/wallet/${wallet}/profile`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async scanWallet(wallet: string) {
    try {
      return await this.retryRequest(() =>
        this.client.post(`/reputation/wallet/${wallet}/scan`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWalletAnalysis(wallet: string) {
    try {
      return await this.retryRequest(() =>
        this.client.get(`/reputation/wallet/${wallet}/activity`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWalletRisk(wallet: string) {
    try {
      return await this.retryRequest(() =>
        this.client.get(`/reputation/wallet/${wallet}/risk`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification endpoints
  async getNotifications() {
    try {
      return await this.retryRequest(() => this.client.get('/notifications'));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationRead(id: string) {
    try {
      return await this.retryRequest(() =>
        this.client.patch(`/notifications/${id}/read`)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dispute endpoints
  async createDispute(data: any) {
    try {
      return await this.retryRequest(() => this.client.post('/disputes', data));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDispute(id: string) {
    try {
      return await this.retryRequest(() => this.client.get(`/disputes/${id}`));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resolveDispute(id: string, resolution: any) {
    try {
      return await this.retryRequest(() =>
        this.client.patch(`/disputes/${id}/resolve`, resolution)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const apiClient = new ApiClient();
