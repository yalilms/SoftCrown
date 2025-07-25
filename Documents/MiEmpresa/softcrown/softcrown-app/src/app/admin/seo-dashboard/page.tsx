'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Bot, 
  Users, 
  Target, 
  DollarSign,
  BarChart3,
  Activity,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { seoAnalyticsService } from '@/lib/seo/seoAnalyticsService';
import type { SEODashboardData } from '@/lib/seo/seoAnalyticsService';

interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  aiVisibility: number;
  trend: 'up' | 'down' | 'stable';
  traffic: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'stable',
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    green: 'bg-green-500/10 text-green-600 border-green-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
  };

  const trendIcon = trend === 'up' ? (
    <ArrowUpRight className="w-4 h-4 text-green-500" />
  ) : trend === 'down' ? (
    <ArrowDownRight className="w-4 h-4 text-red-500" />
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trendIcon}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-sm flex items-center gap-1 ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? '+' : ''}{change}% vs mes anterior
          </p>
        )}
      </div>
    </motion.div>
  );
};

const KeywordTable: React.FC<{ keywords: KeywordRanking[] }> = ({ keywords }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
      <div className="p-6 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Rankings de Keywords
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tráfico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Visibility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {keywords.map((keyword) => (
              <motion.tr
                key={keyword.keyword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                  <div className="text-sm text-gray-500">Dificultad: {keyword.difficulty}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    keyword.position <= 3 
                      ? 'bg-green-100 text-green-800' 
                      : keyword.position <= 10 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    #{keyword.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.searchVolume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.traffic}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${keyword.aiVisibility}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{keyword.aiVisibility}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {keyword.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {keyword.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {keyword.trend === 'stable' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function SEODashboard() {
  const [dashboardData, setDashboardData] = useState<SEODashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'ai-traffic'>('overview');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await seoAnalyticsService.getDashboardData(dateRange);
      setDashboardData(data);
    } catch {
      // Error loading dashboard data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de SEO...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error cargando datos del dashboard</p>
          <Button onClick={loadDashboardData} className="mt-4">Reintentar</Button>
        </div>
      </div>
    );
  }

  const { overview, keywords, aiTraffic, recommendations } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SEO & AI-SEO Dashboard</h1>
              <p className="text-sm text-gray-600">SoftCrown Analytics</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Últimos 30 días
              </div>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              
              <Button size="sm" onClick={loadDashboardData} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'keywords', label: 'Keywords', icon: Search },
              { id: 'ai-traffic', label: 'Tráfico AI', icon: Bot },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Keywords Totales"
                value={overview.totalKeywords}
                change={12}
                icon={<Search className="w-6 h-6" />}
                trend="up"
                color="blue"
              />
              
              <MetricCard
                title="Posición Promedio"
                value={overview.averagePosition.toFixed(1)}
                change={-8}
                icon={<Target className="w-6 h-6" />}
                trend="up"
                color="green"
              />
              
              <MetricCard
                title="Tráfico Orgánico"
                value={overview.organicTraffic.toLocaleString()}
                change={15}
                icon={<Users className="w-6 h-6" />}
                trend="up"
                color="purple"
              />
              
              <MetricCard
                title="Tráfico AI"
                value={overview.aiTraffic.toLocaleString()}
                change={28}
                icon={<Bot className="w-6 h-6" />}
                trend="up"
                color="orange"
              />
            </div>

            {/* Revenue & Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Tasa de Conversión"
                value={`${overview.conversionRate}%`}
                change={5}
                icon={<Target className="w-6 h-6" />}
                trend="up"
                color="green"
              />
              
              <MetricCard
                title="Ingresos SEO"
                value={`€${overview.revenue.toLocaleString()}`}
                change={22}
                icon={<DollarSign className="w-6 h-6" />}
                trend="up"
                color="green"
              />
              
              <MetricCard
                title="Score Técnico"
                value="87"
                change={3}
                icon={<Activity className="w-6 h-6" />}
                trend="up"
                color="blue"
              />
            </div>

            {/* AI Traffic Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Tráfico de AI Assistants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {aiTraffic.sources.map((source: { source: string; sessions: number; revenue: number; conversions: number }) => (
                  <div key={source.source} className="text-center p-4 bg-gray-50/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {source.sessions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{source.source}</div>
                    <div className="text-xs text-green-600 font-medium">
                      €{source.revenue.toLocaleString()} • {source.conversions} conv.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recomendaciones Prioritarias
              </h3>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' ? 'border-red-500 bg-red-50/50' :
                      rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50/50' :
                      'border-green-500 bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          {rec.aiRelevant && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Bot className="w-3 h-3 mr-1" />
                              AI-SEO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-sm font-medium text-gray-900">{rec.expectedImpact}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="space-y-8">
            <KeywordTable keywords={keywords} />
          </div>
        )}

        {/* AI Traffic Tab */}
        {activeTab === 'ai-traffic' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Consultas AI Principales</h3>
              <div className="space-y-4">
                {aiTraffic.queries.map((query: any) => (
                  <div key={query.query} className="p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{query.query}</p>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        #{query.avgPosition}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{query.source}</span>
                      <span>{query.frequency} veces • {query.conversions} conversiones</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
