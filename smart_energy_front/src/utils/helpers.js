// src/utils/helpers.js

// Função para formatar data
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para formatar data e hora
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Função para obter data de X dias atrás
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Função para validar formato de data
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Função para calcular diferença entre datas em dias
export const daysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Função para formatar números com duas casas decimais
export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals);
};

// Função para agrupar dados por dispositivo
export const groupByDevice = (data) => {
  return data.reduce((acc, item) => {
    const device = item.device_name;
    if (!acc[device]) {
      acc[device] = [];
    }
    acc[device].push(item);
    return acc;
  }, {});
};

// Função para calcular média
export const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Função para formatar consumo em kWh
export const formatConsumption = (consumption) => {
  return `${formatNumber(consumption)} kWh`;
};

// Função para formatar temperatura
export const formatTemperature = (temperature) => {
  return `${formatNumber(temperature, 1)}°C`;
};

// Função para gerar cores para gráficos
export const generateColors = (count) => {
  const colors = [
    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
    '#047857', '#059669', '#065f46', '#064e3b'
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Gerar cores adicionais se necessário
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...colors, ...additionalColors];
};

// Função para filtrar dados por período
export const filterDataByPeriod = (data, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
};

// Função para detectar anomalias no consumo
export const detectAnomalies = (data, threshold = 2) => {
  const consumptions = data.map(item => item.consumption);
  const avg = calculateAverage(consumptions);
  const variance = calculateAverage(consumptions.map(c => Math.pow(c - avg, 2)));
  const stdDev = Math.sqrt(variance);
  
  return data.filter(item => 
    Math.abs(item.consumption - avg) > threshold * stdDev
  );
};

// Função para calcular eficiência energética
export const calculateEfficiency = (consumption, temperature) => {
  // Lógica básica de eficiência baseada em consumo e temperatura
  if (temperature === 0) return 0;
  return consumption / temperature;
};

// Função para export de dados para CSV
export const exportToCSV = (data, filename = 'smart_energy_data.csv') => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};