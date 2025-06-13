import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Clock, Zap, AlertTriangle, Calendar, DollarSign, Target, Activity } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://pi-4sem-backend.onrender.com'
  : 'https://pi-4sem-backend.onrender.com';

const analyticsService = {
  async getDailyConsumption(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/daily-consumption?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar dados diários');
    return response.json();
  },
  
  async getEnergyEfficiency(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/energy-efficiency?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar eficiência energética');
    return response.json();
  },
  
  async getAnomalies(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/anomalies?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar anomalias');
    return response.json();
  },
  
  async getSeasonalPatterns(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/seasonal-patterns?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar padrões sazonais');
    return response.json();
  },
  
  async getTemperatureCorrelation(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/temperature-correlation?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar correlação temperatura');
    return response.json();
  },
  
  async getEnergyCost(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/energy-cost?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar análise de custos');
    return response.json();
  },
  
  async getMonthlyComparison(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/analytics/monthly-comparison?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar comparação mensal');
    return response.json();
  }
};

// Cores para gráficos
const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857', '#065f46', '#064e3b'];

// Componente de Loading
const LoadingCard = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// Componente de Erro
const ErrorCard = ({ title, error }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
    <div className="flex items-center gap-2 mb-4">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <h3 className="text-lg font-semibold text-red-800">{title}</h3>
    </div>
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p className="text-sm">{error}</p>
    </div>
  </div>
);

// Componente de Análise por Dia da Semana
const DailyConsumptionChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Consumo por Dia da Semana" error={error} />;
  if (!data || !data.data) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Consumo por Dia da Semana</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
          <XAxis dataKey="dayName" stroke="#059669" />
          <YAxis stroke="#059669" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            formatter={(value, name) => [value + ' kWh', name === 'avgConsumption' ? 'Consumo Médio' : name]}
          />
          <Legend />
          <Bar dataKey="avgConsumption" fill="#10b981" name="Consumo Médio" />
          <Bar dataKey="maxConsumption" fill="#34d399" name="Pico" />
        </BarChart>
      </ResponsiveContainer>
      {data.insights && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-medium text-green-800">Dia de Maior Consumo</p>
            <p className="text-green-600">{data.insights.peakDay?.dayName} - {data.insights.peakDay?.avgConsumption} kWh</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="font-medium text-emerald-800">Dia de Menor Consumo</p>
            <p className="text-emerald-600">{data.insights.lowDay?.dayName} - {data.insights.lowDay?.avgConsumption} kWh</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Eficiência Energética
const EnergyEfficiencyChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Eficiência Energética" error={error} />;
  if (!data || !data.data) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Eficiência por Faixa de Temperatura</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
          <XAxis dataKey="temperatureRange" stroke="#059669" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#059669" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            formatter={(value, name) => [value, name === 'avgEfficiency' ? 'Eficiência' : name]}
          />
          <Bar dataKey="avgEfficiency" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
      {data.insights && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-medium text-green-800">Mais Eficiente</p>
            <p className="text-green-600">{data.insights.mostEfficient?.temperatureRange}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-medium text-red-800">Menos Eficiente</p>
            <p className="text-red-600">{data.insights.leastEfficient?.temperatureRange}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Padrões Sazonais
const SeasonalPatternsChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Padrões Sazonais" error={error} />;
  if (!data || !data.dailyPatterns) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Padrões por Dia da Semana</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.dailyPatterns}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
          <XAxis dataKey="dayName" stroke="#059669" />
          <YAxis stroke="#059669" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            formatter={(value, name) => [value + ' kWh', name === 'avgConsumption' ? 'Consumo Médio' : name]}
          />
          <Bar dataKey="avgConsumption" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Análise Fim de Semana vs Dias Úteis */}
      {data.weekdayAnalysis && data.weekdayAnalysis.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-green-800 mb-3">Fim de Semana vs Dias Úteis</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.weekdayAnalysis.map((item, index) => (
              <div key={index} className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-800">{item.type}</p>
                <p className="text-green-600">{item.avgConsumption} kWh (média)</p>
                <p className="text-green-500 text-sm">{item.count} registros</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Análise de Custos
const EnergyCostChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Análise de Custos" error={error} />;
  if (!data || !data.deviceCosts) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Análise de Custos ({data.tariffRate})</h3>
      </div>
      
      {/* Resumo Geral */}
      {data.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-green-600 text-sm">Consumo Total</p>
            <p className="text-green-800 font-bold">{data.summary.totalConsumption} kWh</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg text-center">
            <p className="text-emerald-600 text-sm">Custo Total</p>
            <p className="text-emerald-800 font-bold">R$ {data.summary.totalCost}</p>
          </div>
          <div className="bg-teal-50 p-3 rounded-lg text-center">
            <p className="text-teal-600 text-sm">Média por Registro</p>
            <p className="text-teal-800 font-bold">R$ {data.summary.avgCostPerRecord}</p>
          </div>
          <div className="bg-lime-50 p-3 rounded-lg text-center">
            <p className="text-lime-600 text-sm">Total de Registros</p>
            <p className="text-lime-800 font-bold">{data.summary.totalRecords}</p>
          </div>
        </div>
      )}
      
      {/* Gráfico de Custos por Dispositivo */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.deviceCosts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
          <XAxis dataKey="device_name" stroke="#059669" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#059669" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            formatter={(value, name) => [`R$ ${value}`, 'Custo Total']}
          />
          <Bar dataKey="totalDeviceCost" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>

      {/* Insights */}
      {data.insights && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-medium text-red-800">Mais Caro</p>
            <p className="text-red-600">{data.insights.mostExpensiveDevice?.device_name}</p>
            <p className="text-red-500">R$ {data.insights.mostExpensiveDevice?.totalDeviceCost}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-medium text-green-800">Mais Econômico</p>
            <p className="text-green-600">{data.insights.leastExpensiveDevice?.device_name}</p>
            <p className="text-green-500">R$ {data.insights.leastExpensiveDevice?.totalDeviceCost}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Anomalias
const AnomaliesChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Detecção de Anomalias" error={error} />;
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-green-800">Detecção de Anomalias</h3>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Limite: {data.threshold}</p>
        <p className="text-sm font-medium text-red-600">{data.anomaliesCount} anomalias detectadas</p>
      </div>

      {data.data && data.data.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.data.slice(0, 10).map((anomaly, index) => (
            <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-red-800">{anomaly.device_name}</p>
                  <p className="text-red-600 text-sm">{new Date(anomaly.date).toLocaleDateString('pt-BR')}</p>
                  {anomaly.event && (
                    <p className="text-red-500 text-xs mt-1">Evento: {anomaly.event}</p>
                  )}
                  {anomaly.deviceAvg && (
                    <p className="text-red-400 text-xs">Média do dispositivo: {anomaly.deviceAvg} kWh</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-800">{anomaly.consumption} kWh</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    anomaly.anomalyLevel === 'Alto' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {anomaly.anomalyLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-green-600">✅ Nenhuma anomalia detectada no período!</p>
        </div>
      )}
    </div>
  );
};

// Componente de Correlação Temperatura
const TemperatureCorrelationChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Correlação Temperatura" error={error} />;
  if (!data || !data.deviceCorrelations) return null;

  // Preparar dados para scatter plot
  const scatterData = data.deviceCorrelations.reduce((acc, device) => {
    device.correlationPoints.forEach(point => {
      acc.push({
        temperature: point.temperature,
        consumption: point.consumption,
        device: device.device_name
      });
    });
    return acc;
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Correlação Temperatura-Consumo</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={scatterData}>
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

      {/* Resumo por dispositivo */}
      <div className="mt-4">
        <h4 className="text-md font-medium text-green-800 mb-3">Resumo por Dispositivo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.deviceCorrelations.map((device, index) => (
            <div key={index} className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800">{device.device_name}</p>
              <p className="text-green-600 text-sm">
                Temp. média: {device.avgTemp}°C | Consumo médio: {device.avgConsumption} kWh
              </p>
              <p className="text-green-500 text-xs">{device.count} registros</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente de Comparação Mensal
const MonthlyComparisonChart = ({ data, loading, error }) => {
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard title="Comparação Mensal" error={error} />;
  if (!data || !data.data) return null;

  // Agrupar dados por dispositivo para o gráfico
  const deviceData = data.data.reduce((acc, item) => {
    if (!acc[item.device_name]) {
      acc[item.device_name] = [];
    }
    acc[item.device_name].push({
      month: item.monthName,
      consumption: item.totalConsumption,
      year: item.year
    });
    return acc;
  }, {});

  const devices = Object.keys(deviceData);
  const colors = COLORS.slice(0, devices.length);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Comparação Mensal</h3>
      </div>
      
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-green-600 text-sm">Total de Meses</p>
          <p className="text-green-800 font-bold">{data.summary.totalMonths}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg text-center">
          <p className="text-emerald-600 text-sm">Dispositivos</p>
          <p className="text-emerald-800 font-bold">{data.summary.totalDevices}</p>
        </div>
        <div className="bg-teal-50 p-3 rounded-lg text-center">
          <p className="text-teal-600 text-sm">Média Mensal</p>
          <p className="text-teal-800 font-bold">{data.summary.averageMonthlyConsumption?.toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Gráfico por dispositivo */}
      {devices.map((device, deviceIndex) => (
        <div key={device} className="mb-6">
          <h4 className="text-md font-medium text-green-800 mb-2">{device}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={deviceData[device]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
              <XAxis dataKey="month" stroke="#059669" />
              <YAxis stroke="#059669" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                formatter={(value) => [value + ' kWh', 'Consumo']}
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke={colors[deviceIndex]} 
                strokeWidth={3}
                dot={{ fill: colors[deviceIndex], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

// Componente Principal de Análises Avançadas
const AdvancedAnalytics = ({ filters }) => {
  const [dailyData, setDailyData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  
  const [loading, setLoading] = useState({
    daily: false,
    efficiency: false,
    anomalies: false,
    seasonal: false,
    correlation: false,
    cost: false,
    monthly: false
  });
  
  const [errors, setErrors] = useState({});

  const fetchAnalytics = async () => {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.deviceName && { device_name: filters.deviceName })
    };

    // Definir todos os loadings como true
    setLoading({
      daily: true,
      efficiency: true,
      anomalies: true,
      seasonal: true,
      correlation: true,
      cost: true,
      monthly: true
    });

    setErrors({});

    // Buscar dados de cada endpoint independentemente
    const endpoints = [
      { key: 'daily', fetch: () => analyticsService.getDailyConsumption(params), setState: setDailyData },
      { key: 'efficiency', fetch: () => analyticsService.getEnergyEfficiency(params), setState: setEfficiencyData },
      { key: 'anomalies', fetch: () => analyticsService.getAnomalies({ ...params, threshold: 2 }), setState: setAnomaliesData },
      { key: 'seasonal', fetch: () => analyticsService.getSeasonalPatterns(params), setState: setSeasonalData },
      { key: 'correlation', fetch: () => analyticsService.getTemperatureCorrelation(params), setState: setCorrelationData },
      { key: 'cost', fetch: () => analyticsService.getEnergyCost({ ...params, tariffRate: 0.89 }), setState: setCostData },
      { key: 'monthly', fetch: () => analyticsService.getMonthlyComparison(params), setState: setMonthlyData }
    ];

    // Executar todas as requisições em paralelo
    endpoints.forEach(async ({ key, fetch, setState }) => {
      try {
        const response = await fetch();
        setState(response);
      } catch (err) {
        console.error(`Erro em ${key}:`, err);
        setErrors(prev => ({ ...prev, [key]: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Análises Avançadas</h2>
        <p className="text-green-600">Insights detalhados sobre padrões de consumo energético diário</p>
      </div>

      {/* Primeira linha - Análise por dia e Eficiência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyConsumptionChart data={dailyData} loading={loading.daily} error={errors.daily} />
        <EnergyEfficiencyChart data={efficiencyData} loading={loading.efficiency} error={errors.efficiency} />
      </div>

      {/* Segunda linha - Padrões sazonais e Anomalias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeasonalPatternsChart data={seasonalData} loading={loading.seasonal} error={errors.seasonal} />
        <AnomaliesChart data={anomaliesData} loading={loading.anomalies} error={errors.anomalies} />
      </div>

      {/* Terceira linha - Correlação e Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureCorrelationChart data={correlationData} loading={loading.correlation} error={errors.correlation} />
        <EnergyCostChart data={costData} loading={loading.cost} error={errors.cost} />
      </div>

      {/* Quarta linha - Comparação mensal */}
      <MonthlyComparisonChart data={monthlyData} loading={loading.monthly} error={errors.monthly} />
    </div>
  );
};

export default AdvancedAnalytics;