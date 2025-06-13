import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { Calendar, Zap, Thermometer, Activity, Plus, Filter, BarChart3, TrendingUp } from 'lucide-react';
import AdvancedAnalytics from './AdvancedAnalytics';

// Configuração da API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://pi-4sem-backend.onrender.com'
  : 'https://pi-4sem-backend.onrender.com';

// Serviço de API
const apiService = {
  async getData(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/data/period?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  },
  
  async getStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/data/stats?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },
  
  async createEvent(eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }
};

// Função para obter data de 30 dias atrás
const getLastMonthDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

// Componente de Filtro de Data
const DateFilter = ({ startDate, endDate, deviceName, onStartDateChange, onEndDateChange, onDeviceNameChange, onFilter, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Filter className="w-5 h-5 text-green-600" />
      <h3 className="text-lg font-semibold text-green-800">Filtros de Análise</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-green-700 mb-2">Data Inicial</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-2">Data Final</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-2">Dispositivo</label>
        <input
          type="text"
          placeholder="Nome do dispositivo"
          value={deviceName}
          onChange={(e) => onDeviceNameChange(e.target.value)}
          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={onFilter}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {loading ? 'Carregando...' : 'Filtrar Dados'}
        </button>
      </div>
    </div>
  </div>
);

// Componente de Cards de Estatísticas
const StatsCards = ({ stats }) => {
  if (!stats || !stats.generalStatistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { generalStatistics } = stats;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Consumo Total</p>
            <p className="text-2xl font-bold text-green-800">{generalStatistics.totalConsumption?.toFixed(2) || 0} kWh</p>
          </div>
          <Zap className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-600 text-sm font-medium">Temperatura Média</p>
            <p className="text-2xl font-bold text-emerald-800">{generalStatistics.avgTemperature?.toFixed(1) || 0}°C</p>
          </div>
          <Thermometer className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl shadow-lg border border-teal-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-600 text-sm font-medium">Dispositivos Únicos</p>
            <p className="text-2xl font-bold text-teal-800">{generalStatistics.uniqueDevices || 0}</p>
          </div>
          <Activity className="w-8 h-8 text-teal-600" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-6 rounded-xl shadow-lg border border-lime-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lime-600 text-sm font-medium">Total de Registros</p>
            <p className="text-lime-800 text-2xl font-bold">{generalStatistics.totalRecords || 0}</p>
          </div>
          <Calendar className="w-8 h-8 text-lime-600" />
        </div>
      </div>
    </div>
  );
};

// Modal para adicionar eventos
const EventModal = ({ isOpen, onClose, onSave }) => {
  const [eventDescription, setEventDescription] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (eventDescription.trim() && deviceName.trim() && eventDate) {
      onSave({
        device_name: deviceName,
        date: eventDate,
        consumption: 0,
        temperature: { avg: 0, max: 0, min: 0 },
        event: eventDescription
      });
      setEventDescription('');
      setDeviceName('');
      setEventDate(new Date().toISOString().split('T')[0]);
      onClose();
    }
  };

  const handleClose = () => {
    setEventDescription('');
    setDeviceName('');
    setEventDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Adicionar Evento</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Data do Evento</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Dispositivo</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nome do dispositivo (ex: Geladeira, Ar Condicionado...)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Descrição do Evento</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva o evento que justifica o consumo (ex: Festa em casa, Uso intensivo, Manutenção...)"
              required
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!eventDescription.trim() || !deviceName.trim() || !eventDate}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
          >
            Salvar Evento
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const SmartEnergyDashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [startDate, setStartDate] = useState(getLastMonthDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [deviceName, setDeviceName] = useState('');
  
  const [showEventModal, setShowEventModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando dados da API...');
      const params = { startDate, endDate };
      if (deviceName) params.device_name = deviceName;
      
      const [dataResponse, statsResponse] = await Promise.all([
        apiService.getData(params),
        apiService.getStats(params)
      ]);
      
      console.log('Dados recebidos:', dataResponse);
      console.log('Stats recebidas:', statsResponse);
      
      setData(dataResponse.data || []);
      setStats(statsResponse);
    } catch (err) {
      console.error('Erro ao buscar dados da API:', err);
      setError(`Erro ao conectar com a API: ${err.message}`);
      setData([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await apiService.createEvent(eventData);
      fetchData(); // Recarrega os dados
    } catch (err) {
      setError('Erro ao adicionar evento: ' + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Preparar dados para o gráfico de temperatura vs consumo
  const tempConsumptionData = data.map((item, index) => ({
    name: new Date(item.date).toLocaleDateString('pt-BR'),
    temperature: item.temperature?.avg || 0,
    consumption: item.consumption || 0,
    device: item.device_name,
    id: index
  }));

  // Preparar dados para consumo por dispositivo
  const deviceConsumptionData = stats?.consumptionByDevice?.map(device => ({
    name: device.device_name,
    consumption: device.totalConsumption,
    avgTemp: device.avgTemperature,
    records: device.recordCount
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Smart Energy</h1>
          <p className="text-green-600">Dashboard de Análise de Consumo Energético</p>
        </div>

        {/* Navegação por Abas */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-green-100">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-green-600 text-white'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard Principal
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-green-600 text-white'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Análises Avançadas
              </button>
            </div>
          </div>
        </div>

        {/* Filtro de Data */}
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          deviceName={deviceName}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onDeviceNameChange={setDeviceName}
          onFilter={fetchData}
          loading={loading}
        />

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Botão para adicionar evento */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Evento
              </button>
            </div>

            {/* Cards de Estatísticas */}
            <StatsCards stats={stats} />

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-green-600">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Carregando dados...
                </div>
              </div>
            )}

            {/* Gráficos - só exibe se há dados */}
            {!loading && tempConsumptionData.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Gráfico Temperatura vs Consumo */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Temperatura vs Consumo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={tempConsumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
                        <XAxis dataKey="temperature" name="Temperatura" unit="°C" stroke="#059669" />
                        <YAxis dataKey="consumption" name="Consumo" unit="kWh" stroke="#059669" />
                        <Tooltip 
                          formatter={(value, name) => [
                            value + (name === 'consumption' ? ' kWh' : '°C'), 
                            name === 'consumption' ? 'Consumo' : 'Temperatura'
                          ]}
                          labelFormatter={() => ''}
                          contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                        />
                        <Scatter dataKey="consumption" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de Consumo por Dispositivo */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Consumo por Dispositivo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={deviceConsumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
                        <XAxis dataKey="name" stroke="#059669" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#059669" />
                        <Tooltip 
                          formatter={(value) => [value + ' kWh', 'Consumo Total']}
                          contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                        />
                        <Bar dataKey="consumption" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Linha Temporal */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Consumo ao Longo do Tempo</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={tempConsumptionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
                      <XAxis dataKey="name" stroke="#059669" />
                      <YAxis stroke="#059669" />
                      <Tooltip 
                        formatter={(value, name) => [
                          value + (name === 'consumption' ? ' kWh' : '°C'), 
                          name === 'consumption' ? 'Consumo' : 'Temperatura'
                        ]}
                        contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="consumption" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Consumo (kWh)"
                        dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#34d399" 
                        strokeWidth={2}
                        name="Temperatura (°C)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Estado vazio */}
            {!loading && !error && tempConsumptionData.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 text-center">
                <div className="text-gray-400 mb-4">
                  <BarChart3 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum dado encontrado</h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros de data ou adicionar dados através da API.
                </p>
              </div>
            )}
          </>
        ) : (
          <AdvancedAnalytics 
            filters={{ 
              startDate, 
              endDate, 
              deviceName 
            }} 
          />
        )}

        {/* Modal de Evento */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleAddEvent}
        />
      </div>
    </div>
  );
};

export default SmartEnergyDashboard;