// API Base Configuration
// Este archivo será la base para integrar las llamadas a la API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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

export const api = new ApiService(API_URL);
