// API Base Configuration
// Este archivo será la base para integrar las llamadas a la API

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('API Service initialized with baseUrl:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Pastor endpoints
  async createLider(liderData: any) {
    return this.request('/pastor/lideres', {
      method: 'POST',
      body: JSON.stringify(liderData),
    });
  }

  async getCelulas() {
    return this.request('/pastor/celulas', {
      method: 'GET',
    });
  }

  async getEstadisticas(timeframe: string) {
    return this.request(`/pastor/estadisticas?timeframe=${timeframe}`, {
      method: 'GET',
    });
  }

  // Lider endpoints
  async getMiCelula() {
    return this.request('/lider/mi-celula', {
      method: 'GET',
    });
  }

  async addMiembro(celulaId: string, miembroData: any) {
    return this.request(`/lider/celulas/${celulaId}/miembros`, {
      method: 'POST',
      body: JSON.stringify(miembroData),
    });
  }

  async removeMiembro(celulaId: string, miembroId: string) {
    return this.request(`/lider/celulas/${celulaId}/miembros/${miembroId}`, {
      method: 'DELETE',
    });
  }

  async addColider(celulaId: string, coliderData: any) {
    return this.request(`/lider/celulas/${celulaId}/colideres`, {
      method: 'POST',
      body: JSON.stringify(coliderData),
    });
  }

  async removeColider(celulaId: string, coliderId: string) {
    return this.request(`/lider/celulas/${celulaId}/colideres/${coliderId}`, {
      method: 'DELETE',
    });
  }

  async registrarAsistencia(asistenciaData: any) {
    return this.request('/lider/asistencia', {
      method: 'POST',
      body: JSON.stringify(asistenciaData),
    });
  }

  async getAsistencias(celulaId: string) {
    return this.request(`/lider/celulas/${celulaId}/asistencias`, {
      method: 'GET',
    });
  }

  // Búsqueda de líderes precargados
  async searchLider(nombre: string) {
    return this.request(`/auth/buscar-lider?nombre=${encodeURIComponent(nombre)}`, {
      method: 'GET',
    });
  }
}

export const api = new ApiService(API_BASE);
export default api;
