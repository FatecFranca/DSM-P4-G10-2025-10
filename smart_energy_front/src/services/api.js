// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Buscar dados por período
  async getDataByPeriod(params = {}) {
    const queryParams = new URLSearchParams(params);
    return this.makeRequest(`/data/period?${queryParams}`);
  }

  // Buscar estatísticas por período
  async getStatsByPeriod(params = {}) {
    const queryParams = new URLSearchParams(params);
    return this.makeRequest(`/data/stats?${queryParams}`);
  }

  // Buscar todos os dados
  async getAllData() {
    return this.makeRequest('/data');
  }

  // Buscar dados por ID
  async getDataById(id) {
    return this.makeRequest(`/data/${id}`);
  }

  // Criar novo registro
  async createData(data) {
    return this.makeRequest('/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Atualizar registro
  async updateData(id, data) {
    return this.makeRequest(`/data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Deletar registro
  async deleteData(id) {
    return this.makeRequest(`/data/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;