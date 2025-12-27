// API Client for GearGuard CMMS Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.detail) {
        errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch {
      errorMessage = 'An error occurred';
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    return handleResponse<T>(response);
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse<{ access_token: string; token_type: string }>(response);
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<{
      total_equipment: number;
      equipment_by_status: Record<string, number>;
      total_requests: number;
      requests_by_stage: Record<string, number>;
      requests_by_priority: Record<string, number>;
    }>('/api/dashboard/stats');
  }

  async getRecentRequests(limit: number = 10) {
    return this.request<any[]>(`/api/dashboard/recent-requests?limit=${limit}`);
  }

  // Equipment endpoints
  async getEquipment(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    category_id?: string;
    team_id?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<any[]>(`/api/equipment${queryString ? `?${queryString}` : ''}`);
  }

  async getEquipmentById(id: string) {
    return this.request<any>(`/api/equipment/${id}`);
  }

  async createEquipment(data: any) {
    return this.request<any>('/api/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: string, data: any) {
    return this.request<any>(`/api/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipment(id: string) {
    return this.request<void>(`/api/equipment/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance Request endpoints
  async getMaintenanceRequests(params?: {
    skip?: number;
    limit?: number;
    stage?: string;
    priority?: string;
    equipment_id?: string;
    assigned_technician_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<any[]>(`/api/requests${queryString ? `?${queryString}` : ''}`);
  }

  async getMaintenanceRequestById(id: string) {
    return this.request<any>(`/api/requests/${id}`);
  }

  async createMaintenanceRequest(data: any) {
    return this.request<any>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenanceRequest(id: string, data: any) {
    return this.request<any>(`/api/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateRequestStage(id: string, stage: string) {
    return this.request<any>(`/api/requests/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  }

  async deleteMaintenanceRequest(id: string) {
    return this.request<void>(`/api/requests/${id}`, {
      method: 'DELETE',
    });
  }

  async getRequestHistory(id: string) {
    return this.request<any[]>(`/api/requests/${id}/history`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
