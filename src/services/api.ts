// API Base Configuration
// Este archivo será la base para integrar las llamadas a la API

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
// Remover trailing slash si existe
const cleanApiUrl = API_URL.replace(/\/$/, '');
const API_BASE = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

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

  // Perfil endpoints
  async getMe() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateProfile(userId: string, profileData: { name?: string; email?: string }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Pastor endpoints - Crear líder (ahora usa /users)
  async createLider(liderData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(liderData),
    });
  }

  async getCelulas() {
    return this.request('/celulas', {
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
    // Los líderes usan el mismo endpoint /celulas
    // El backend filtra automáticamente según el rol
    const celulas = await this.request<any[]>('/celulas', {
      method: 'GET',
    });
    // Retornar la primera célula (un líder solo tiene una)
    return celulas[0];
  }

  async addMiembro(celulaId: string, miembroData: any) {
    return this.request(`/celulas/${celulaId}/miembros`, {
      method: 'POST',
      body: JSON.stringify(miembroData),
    });
  }

  async removeMiembro(celulaId: string, miembroId: string) {
    return this.request(`/celulas/${celulaId}/miembros/${miembroId}`, {
      method: 'DELETE',
    });
  }

  async updateMiembro(celulaId: string, miembroId: string, miembroData: any) {
    return this.request(`/celulas/${celulaId}/miembros/${miembroId}`, {
      method: 'PUT',
      body: JSON.stringify(miembroData),
    });
  }

  async addColider(celulaId: string, coliderData: any) {
    return this.request(`/celulas/${celulaId}/colideres`, {
      method: 'POST',
      body: JSON.stringify(coliderData),
    });
  }

  async removeColider(celulaId: string, coliderId: string) {
    return this.request(`/celulas/${celulaId}/colideres/${coliderId}`, {
      method: 'DELETE',
    });
  }

  async registrarAsistencia(asistenciaData: any) {
    return this.request('/asistencias', {
      method: 'POST',
      body: JSON.stringify(asistenciaData),
    });
  }

  async getAsistencias(celulaId: string) {
    return this.request(`/celulas/${celulaId}/asistencias`, {
      method: 'GET',
    });
  }

  // Búsqueda de líderes precargados
  async searchLider(nombre: string) {
    return this.request(`/auth/buscar-lider?nombre=${encodeURIComponent(nombre)}`, {
      method: 'GET',
    });
  }

  // Noticias endpoints
  async getNoticias() {
    return this.request('/noticias', {
      method: 'GET',
    });
  }

  async crearNoticia(noticiaData: any) {
    return this.request('/noticias', {
      method: 'POST',
      body: JSON.stringify(noticiaData),
    });
  }

  async actualizarNoticia(id: string, noticiaData: any) {
    return this.request(`/noticias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noticiaData),
    });
  }

  async eliminarNoticia(id: string) {
    return this.request(`/noticias/${id}`, {
      method: 'DELETE',
    });
  }

  // Materiales endpoints
  async getMateriales() {
    return this.request('/materiales', {
      method: 'GET',
    });
  }

  async subirMaterial(materialData: any) {
    return this.request('/materiales', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async eliminarMaterial(id: string) {
    return this.request(`/materiales/${id}`, {
      method: 'DELETE',
    });
  }

  async descargarMaterial(id: string) {
    return this.request(`/materiales/${id}/download`, {
      method: 'GET',
    });
  }

  // Donaciones endpoints
  async getConfiguracionDonaciones() {
    return this.request('/donaciones/info', {
      method: 'GET',
    });
  }

  async getConfiguracionesDonacionesAdmin() {
    return this.request('/donaciones', {
      method: 'GET',
    });
  }

  async actualizarConfiguracionDonaciones(config: { aliasIglesia: string; cbuIglesia: string; descripcion?: string }) {
    return this.request('/donaciones', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Celulas endpoints (para pastor/admin)
  async crearCelula(celulaData: any) {
    return this.request('/celulas', {
      method: 'POST',
      body: JSON.stringify(celulaData),
    });
  }

  async actualizarCelula(id: string, celulaData: any) {
    return this.request(`/celulas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(celulaData),
    });
  }

  async eliminarCelula(id: string) {
    return this.request(`/celulas/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints (para admin/pastor)
  async getUsers() {
    return this.request('/users', {
      method: 'GET',
    });
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService(API_BASE);
export default api;
