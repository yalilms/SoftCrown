'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    conversionRate: number;
    averageDealSize: number;
    salesCycleLength: number;
    monthlyGrowth: number;
    revenue: number;
  };
  leadSources: {
    name: string;
    count: number;
    percentage: number;
    conversionRate: number;
    color: string;
  }[];
  monthlyMetrics: {
    month: string;
    leads: number;
    conversions: number;
    revenue: number;
  }[];
  teamPerformance: {
    name: string;
    leadsAssigned: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
  communicationStats: {
    emails: number;
    calls: number;
    chats: number;
    meetings: number;
    responseTime: string;
  };
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalLeads: 156,
    conversionRate: 23.5,
    averageDealSize: 18500,
    salesCycleLength: 28,
    monthlyGrowth: 12.3,
    revenue: 485000
  },
  leadSources: [
    { name: 'Sitio Web', count: 68, percentage: 43.6, conversionRate: 28.2, color: 'blue' },
    { name: 'Referencias', count: 42, percentage: 26.9, conversionRate: 35.7, color: 'green' },
    { name: 'Redes Sociales', count: 28, percentage: 17.9, conversionRate: 17.9, color: 'purple' },
    { name: 'Publicidad', count: 12, percentage: 7.7, conversionRate: 16.7, color: 'orange' },
    { name: 'Email Frío', count: 6, percentage: 3.8, conversionRate: 8.3, color: 'red' }
  ],
  monthlyMetrics: [
    { month: 'Ene', leads: 32, conversions: 7, revenue: 125000 },
    { month: 'Feb', leads: 28, conversions: 6, revenue: 98000 },
    { month: 'Mar', leads: 35, conversions: 9, revenue: 156000 },
    { month: 'Abr', leads: 41, conversions: 8, revenue: 142000 },
    { month: 'May', leads: 38, conversions: 11, revenue: 198000 },
    { month: 'Jun', leads: 45, conversions: 12, revenue: 235000 },
    { month: 'Jul', leads: 52, conversions: 14, revenue: 287000 }
  ],
  teamPerformance: [
    { name: 'Carlos Mendoza', leadsAssigned: 48, conversions: 14, revenue: 185000, conversionRate: 29.2 },
    { name: 'Ana López', leadsAssigned: 42, conversions: 11, revenue: 156000, conversionRate: 26.2 },
    { name: 'Pedro Sánchez', leadsAssigned: 38, conversions: 8, revenue: 98000, conversionRate: 21.1 },
    { name: 'María García', leadsAssigned: 28, conversions: 6, revenue: 76000, conversionRate: 21.4 }
  ],
  communicationStats: {
    emails: 342,
    calls: 128,
    chats: 89,
    meetings: 67,
    responseTime: '2.4 horas'
  }
};

export function AnalyticsDashboard() {
  const { state, dispatch } = useContact();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'leads' | 'revenue' | 'conversions'>('leads');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          totalLeads: prev.overview.totalLeads + Math.floor(Math.random() * 3),
          conversionRate: Math.max(15, Math.min(35, prev.overview.conversionRate + (Math.random() - 0.5) * 2))
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUpIcon : TrendingDownIcon;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChartBarIcon className="w-8 h-8 inline-block mr-3 text-green-500" />
            Analytics Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Métricas detalladas y análisis de rendimiento de ventas
          </motion.p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.totalLeads}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">
              +{analyticsData.overview.monthlyGrowth}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tasa Conversión</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.conversionRate}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+2.1%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Deal Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{analyticsData.overview.averageDealSize.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CurrencyEuroIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+8.5%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ciclo de Ventas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.salesCycleLength} días
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingDownIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">-3 días</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{analyticsData.overview.revenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CurrencyEuroIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+15.2%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tiempo Respuesta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.communicationStats.responseTime}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <TrendingDownIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">-0.8h</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Lead Sources */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Fuentes de Leads
          </h3>
          
          <div className="space-y-4">
            {analyticsData.leadSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-${source.color}-500`}></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{source.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {source.count} leads • {source.conversionRate}% conversión
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {source.percentage}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tendencias Mensuales
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="leads">Leads</option>
              <option value="conversions">Conversiones</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>

          <div className="space-y-3">
            {analyticsData.monthlyMetrics.map((month, index) => {
              const maxValue = Math.max(...analyticsData.monthlyMetrics.map(m => 
                selectedMetric === 'leads' ? m.leads :
                selectedMetric === 'conversions' ? m.conversions :
                m.revenue / 1000
              ));
              
              const value = selectedMetric === 'leads' ? month.leads :
                           selectedMetric === 'conversions' ? month.conversions :
                           month.revenue / 1000;
              
              const percentage = (value / maxValue) * 100;

              return (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {month.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedMetric === 'revenue' ? `€${value.toFixed(0)}k` : value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-blue-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Team Performance & Communication Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Rendimiento del Equipo
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Miembro
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Leads
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Conversiones
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Revenue
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Tasa
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.teamPerformance.map((member, index) => (
                  <motion.tr
                    key={member.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-900 dark:text-white">
                      {member.leadsAssigned}
                    </td>
                    <td className="py-4 text-gray-900 dark:text-white">
                      {member.conversions}
                    </td>
                    <td className="py-4 text-gray-900 dark:text-white">
                      €{member.revenue.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${member.conversionRate >= 25 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : member.conversionRate >= 20
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        }
                      `}>
                        {member.conversionRate}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Communication Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Estadísticas de Comunicación
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Emails</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Este mes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.communicationStats.emails}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <PhoneIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Llamadas</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Este mes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.communicationStats.calls}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Chats</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Este mes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.communicationStats.chats}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Reuniones</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Este mes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.communicationStats.meetings}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
