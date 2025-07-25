'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { Lead } from '@/types/contact';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface LeadWithStatus extends Lead {
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastActivity: Date;
  nextFollowUp?: Date;
  assignedTo?: string;
  source: 'website' | 'referral' | 'social' | 'advertising' | 'cold_outreach';
  tags: string[];
  score: number;
}

const mockLeads: LeadWithStatus[] = [
  {
    id: 'lead-001',
    personalInfo: {
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@empresa.com',
      phone: '+34 666 123 456',
      company: 'Tech Solutions SL',
      position: 'CTO',
      website: 'https://techsolutions.com'
    },
    projectDetails: {
      projectType: 'web',
      description: 'Plataforma e-commerce para venta B2B',
      features: ['ecommerce', 'user-auth', 'payment-integration'],
      targetAudience: 'Empresas del sector industrial',
      timeline: '3-6 months'
    },
    budget: {
      range: '15000-30000',
      currency: 'EUR',
      paymentPreference: 'installments',
      budgetApproved: true
    },
    timeline: '3-6 months',
    contactMethod: 'email',
    marketingConsent: true,
    createdAt: new Date('2024-07-15'),
    status: 'proposal',
    priority: 'high',
    lastActivity: new Date('2024-07-20'),
    nextFollowUp: new Date('2024-07-25'),
    assignedTo: 'Carlos Mendoza',
    source: 'website',
    tags: ['e-commerce', 'b2b', 'high-value'],
    score: 85
  },
  {
    id: 'lead-002',
    personalInfo: {
      firstName: 'Juan',
      lastName: 'Rodríguez',
      email: 'juan.rodriguez@startup.es',
      phone: '+34 677 987 654',
      company: 'InnovaStart',
      position: 'CEO'
    },
    projectDetails: {
      projectType: 'mobile',
      description: 'App móvil para gestión de inventarios',
      features: ['mobile-app', 'real-time-sync'],
      targetAudience: 'Pequeñas y medianas empresas',
      timeline: '2-4 months'
    },
    budget: {
      range: '8000-15000',
      currency: 'EUR',
      paymentPreference: 'upfront',
      budgetApproved: false
    },
    timeline: '2-4 months',
    contactMethod: 'phone',
    marketingConsent: true,
    createdAt: new Date('2024-07-18'),
    status: 'qualified',
    priority: 'medium',
    lastActivity: new Date('2024-07-22'),
    nextFollowUp: new Date('2024-07-24'),
    assignedTo: 'Ana López',
    source: 'referral',
    tags: ['mobile', 'inventory'],
    score: 72
  }
];

export function LeadsManagement() {
  const { state, dispatch } = useContact();
  const [leads, setLeads] = useState<LeadWithStatus[]>(mockLeads);
  const [filteredLeads, setFilteredLeads] = useState<LeadWithStatus[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadWithStatus | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.personalInfo.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  const getStatusColor = (status: LeadWithStatus['status']) => {
    const colors = {
      new: 'blue',
      contacted: 'yellow',
      qualified: 'purple',
      proposal: 'orange',
      negotiation: 'indigo',
      won: 'green',
      lost: 'red'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: LeadWithStatus['priority']) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority];
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadWithStatus['status']) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastActivity: new Date() }
        : lead
    ));
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'success',
        title: 'Lead actualizado',
        message: `Estado cambiado a ${newStatus}`
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
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
            <UserGroupIcon className="w-8 h-8 inline-block mr-3 text-blue-500" />
            Gestión de Leads
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Administra y da seguimiento a todos tus leads y oportunidades de negocio
          </motion.p>
        </div>

        <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Nuevo Lead</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filtros</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="qualified">Calificado</option>
                    <option value="proposal">Propuesta</option>
                    <option value="negotiation">Negociación</option>
                    <option value="won">Ganado</option>
                    <option value="lost">Perdido</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Calificados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Seguimiento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredLeads.filter(l => l.nextFollowUp && l.nextFollowUp > new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <StarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Puntuación Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(filteredLeads.reduce((sum, l) => sum + l.score, 0) / filteredLeads.length || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Puntuación
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {lead.personalInfo.firstName[0]}{lead.personalInfo.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.personalInfo.firstName} {lead.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.personalInfo.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {lead.personalInfo.company}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {lead.projectDetails.projectType.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.budget.range} EUR
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadWithStatus['status'])}
                      className={`
                        px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-2
                        bg-${getStatusColor(lead.status)}-100 dark:bg-${getStatusColor(lead.status)}-900/20
                        text-${getStatusColor(lead.status)}-800 dark:text-${getStatusColor(lead.status)}-200
                      `}
                    >
                      <option value="new">Nuevo</option>
                      <option value="contacted">Contactado</option>
                      <option value="qualified">Calificado</option>
                      <option value="proposal">Propuesta</option>
                      <option value="negotiation">Negociación</option>
                      <option value="won">Ganado</option>
                      <option value="lost">Perdido</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className={`
                          text-sm font-medium
                          text-${getScoreColor(lead.score)}-600 dark:text-${getScoreColor(lead.score)}-400
                        `}>
                          {lead.score}/100
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className={`bg-${getScoreColor(lead.score)}-500 h-2 rounded-full`}
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        title="Llamar"
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                        title="Enviar email"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                        title="Chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No se encontraron leads que coincidan con los filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
