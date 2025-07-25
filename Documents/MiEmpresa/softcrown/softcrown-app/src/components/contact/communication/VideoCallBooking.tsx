'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { CalendarBooking } from '@/types/contact';
import { 
  Video as VideoCameraIcon,
  Calendar as CalendarDaysIcon,
  Clock as ClockIcon,
  User as UserIcon,
  Mail as EnvelopeIcon,
  CheckCircle as CheckCircleIcon,
  X as XMarkIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Plus as PlusIcon
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface AvailableDay {
  date: Date;
  dayName: string;
  timeSlots: TimeSlot[];
}

const meetingTypes = [
  {
    id: 'consultation',
    name: 'Consulta Inicial',
    description: 'Conversación sobre tu proyecto y necesidades',
    duration: 30,
    icon: '💬',
    color: 'blue'
  },
  {
    id: 'demo',
    name: 'Demo de Producto',
    description: 'Demostración de nuestros trabajos anteriores',
    duration: 45,
    icon: '🖥️',
    color: 'purple'
  },
  {
    id: 'follow-up',
    name: 'Seguimiento',
    description: 'Revisión del progreso del proyecto',
    duration: 30,
    icon: '📋',
    color: 'green'
  },
  {
    id: 'project-review',
    name: 'Revisión de Proyecto',
    description: 'Presentación y feedback del trabajo realizado',
    duration: 60,
    icon: '🎯',
    color: 'orange'
  }
];

// Generate available time slots for the next 14 days
const generateAvailableDays = (): AvailableDay[] => {
  const days: AvailableDay[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const timeSlots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute);
        
        // Simulate some booked slots
        const isBooked = Math.random() < 0.3;
        const isAvailable = !isBooked && slotDate > new Date();
        
        timeSlots.push({
          time,
          available: isAvailable,
          booked: isBooked
        });
      }
    }
    
    days.push({
      date,
      dayName: date.toLocaleDateString('es-ES', { weekday: 'long' }),
      timeSlots
    });
  }
  
  return days;
};

export function VideoCallBooking() {
  const { state, dispatch } = useContact();
  const [step, setStep] = useState<'type' | 'datetime' | 'details' | 'confirmation'>('type');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<CalendarBooking | null>(null);

  useEffect(() => {
    setAvailableDays(generateAvailableDays());
  }, []);

  // Pre-fill contact info if available from context
  useEffect(() => {
    if (state.formData.personalInfo) {
      setContactInfo({
        name: `${state.formData.personalInfo.firstName || ''} ${state.formData.personalInfo.lastName || ''}`.trim(),
        email: state.formData.personalInfo.email || '',
        notes: ''
      });
    }
  }, [state.formData.personalInfo]);

  const selectedMeetingTypeData = meetingTypes.find(type => type.id === selectedMeetingType);
  const selectedDay = availableDays.find(day => 
    selectedDate && day.date.toDateString() === selectedDate.toDateString()
  );

  const getWeekDays = (weekOffset: number) => {
    const startIndex = weekOffset * 7;
    return availableDays.slice(startIndex, startIndex + 7);
  };

  const handleBooking = async () => {
    if (!selectedMeetingType || !selectedDate || !selectedTime || !contactInfo.name || !contactInfo.email) {
      return;
    }

    setIsSubmitting(true);

    try {
      const meetingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      meetingDateTime.setHours(hours, minutes);

      const booking: CalendarBooking = {
        id: `booking-${Date.now()}`,
        contactEmail: contactInfo.email,
        contactName: contactInfo.name,
        meetingType: selectedMeetingType as any,
        scheduledAt: meetingDateTime,
        duration: selectedMeetingTypeData?.duration || 30,
        status: 'scheduled',
        meetingLink: `https://meet.softcrown.com/room/${Date.now()}`,
        notes: contactInfo.notes,
        reminders: true
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to context
      dispatch({ type: 'ADD_BOOKING', payload: booking });
      
      // Set confirmation
      setBookingConfirmed(booking);
      setStep('confirmation');

      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Reunión agendada',
          message: `Tu reunión ha sido programada para el ${meetingDateTime.toLocaleDateString('es-ES')}`
        }
      });

      // Send confirmation email (simulated)
      setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'info',
            title: 'Email de confirmación enviado',
            message: `Se ha enviado la confirmación a ${contactInfo.email}`
          }
        });
      }, 1000);

    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error al agendar',
          message: 'No se pudo programar la reunión. Inténtalo de nuevo.'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep('type');
    setSelectedMeetingType('');
    setSelectedDate(null);
    setSelectedTime('');
    setContactInfo({ name: '', email: '', notes: '' });
    setBookingConfirmed(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VideoCameraIcon className="w-8 h-8 inline-block mr-2 text-blue-500" />
          Agendar Videollamada
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Programa una reunión virtual con nuestro equipo
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {['type', 'datetime', 'details', 'confirmation'].map((stepName, index) => (
          <React.Fragment key={stepName}>
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
              ${step === stepName || (step === 'confirmation' && index < 3)
                ? 'border-blue-500 bg-blue-500 text-white'
                : index < ['type', 'datetime', 'details', 'confirmation'].indexOf(step)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400'
              }
            `}>
              {index < ['type', 'datetime', 'details', 'confirmation'].indexOf(step) ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < 3 && (
              <div className={`
                w-16 h-0.5 mx-2 transition-all duration-300
                ${index < ['type', 'datetime', 'details', 'confirmation'].indexOf(step)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Meeting Type Selection */}
        {step === 'type' && (
          <motion.div
            key="type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              ¿Qué tipo de reunión necesitas?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetingTypes.map((type) => (
                <motion.div
                  key={type.id}
                  className={`
                    p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedMeetingType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedMeetingType(type.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {type.description}
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{type.duration} minutos</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep('datetime')}
                disabled={!selectedMeetingType}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Selecciona fecha y hora
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                  disabled={currentWeek === 0}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                  disabled={(currentWeek + 1) * 7 >= availableDays.length}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Days */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Días disponibles
                </h3>
                <div className="space-y-2">
                  {getWeekDays(currentWeek).map((day) => (
                    <motion.button
                      key={day.date.toISOString()}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${selectedDate?.toDateString() === day.date.toDateString()
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {day.dayName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {day.date.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {day.timeSlots.filter(slot => slot.available).length} slots
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Horarios disponibles
                </h3>
                {selectedDay ? (
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {selectedDay.timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`
                          p-3 rounded-lg text-sm transition-all duration-200
                          ${selectedTime === slot.time
                            ? 'bg-blue-500 text-white'
                            : slot.available
                            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {slot.time}
                        {slot.booked && <span className="block text-xs">Ocupado</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Selecciona un día para ver los horarios disponibles</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep('type')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={!selectedDate || !selectedTime}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Información de contacto
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="¿Hay algo específico que te gustaría discutir en la reunión?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Meeting Summary */}
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Resumen de la reunión
                </h3>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Tipo:</strong> {selectedMeetingTypeData?.name}</p>
                  <p><strong>Fecha:</strong> {selectedDate?.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Duración:</strong> {selectedMeetingTypeData?.duration} minutos</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep('datetime')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleBooking}
                disabled={!contactInfo.name || !contactInfo.email || isSubmitting}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Confirmar Reunión</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && bookingConfirmed && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Reunión Confirmada!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Tu reunión ha sido agendada exitosamente. Te hemos enviado un email de confirmación con todos los detalles.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Detalles de la reunión:
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{selectedMeetingTypeData?.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedMeetingTypeData?.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedMeetingTypeData?.duration} minutos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bookingConfirmed.scheduledAt.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {bookingConfirmed.scheduledAt.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Enlace de la reunión
                    </p>
                    <a
                      href={bookingConfirmed.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {bookingConfirmed.meetingLink}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedMeetingTypeData?.name || '')}&dates=${bookingConfirmed.scheduledAt.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(bookingConfirmed.scheduledAt.getTime() + bookingConfirmed.duration * 60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(selectedMeetingTypeData?.description || '')}&location=${encodeURIComponent(bookingConfirmed.meetingLink || '')}`, '_blank')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Agregar a Google Calendar</span>
              </button>
              
              <button
                onClick={resetBooking}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
              >
                Agendar otra reunión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
