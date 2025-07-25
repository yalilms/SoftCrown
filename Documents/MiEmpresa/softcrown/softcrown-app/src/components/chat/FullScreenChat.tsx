'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  CalendarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { ChatMessage, ChatSession } from '@/types/chat';
import { aiChatService } from '@/lib/ai-chat';
import { voiceService, voiceCommandProcessor } from '@/lib/voice';

interface FullScreenChatProps {
  userId?: string;
  onClose: () => void;
  initialSession?: ChatSession;
}

export function FullScreenChat({ userId, onClose, initialSession }: FullScreenChatProps) {
  const [session, setSession] = useState<ChatSession | null>(initialSession || null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat session if not provided
  useEffect(() => {
    const initializeChat = async () => {
      if (!session) {
        try {
          const newSession = await aiChatService.createSession(userId);
          setSession(newSession);
        } catch (error) {
          console.error('Error initializing chat:', error);
        }
      }
    };

    initializeChat();
  }, [userId, session]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Check voice support
  useEffect(() => {
    setVoiceEnabled(voiceService.isVoiceSupported());
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message?: string) => {
    const messageToSend = message || currentMessage.trim();
    if (!messageToSend || !session || isLoading) return;

    setCurrentMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await aiChatService.processMessage(
        session.id, 
        messageToSend, 
        voiceEnabled
      );

      // Update session with new messages
      const updatedSession = aiChatService.getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);

        // Auto-speak response if voice is enabled
        if (voiceEnabled && response.metadata?.voiceEnabled) {
          await speakMessage(response.content);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = async () => {
    if (!voiceEnabled || isListening) return;

    try {
      setIsListening(true);
      const transcript = await voiceService.startListening();
      
      // Check if it's a voice command
      const isCommand = voiceCommandProcessor.processVoiceInput(transcript);
      
      if (!isCommand) {
        // Send as regular message
        await sendMessage(transcript);
      }
    } catch (error) {
      console.error('Voice input error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (!voiceEnabled || isSpeaking) return;

    try {
      setIsSpeaking(true);
      await voiceService.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const requestHumanHandoff = async () => {
    if (!session) return;
    
    try {
      await aiChatService.requestHandoff(session.id, 'User requested human support');
      const updatedSession = aiChatService.getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Error requesting handoff:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    {
      id: 'services',
      label: '¿Qué servicios ofrecen?',
      icon: ChatBubbleLeftRightIcon,
      message: '¿Qué servicios ofrecen?'
    },
    {
      id: 'pricing',
      label: '¿Cuánto cuesta un sitio web?',
      icon: CurrencyEuroIcon,
      message: 'Me gustaría saber los precios de sus servicios'
    },
    {
      id: 'appointment',
      label: 'Agendar una cita',
      icon: CalendarIcon,
      message: 'Me gustaría agendar una cita para discutir mi proyecto'
    },
    {
      id: 'human',
      label: 'Hablar con un humano',
      icon: HandRaisedIcon,
      action: requestHumanHandoff
    }
  ];

  if (!session) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Iniciando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SoftCrown Assistant</h1>
            <p className="text-sm opacity-90">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Asistente inteligente en línea
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {voiceEnabled && (
            <button
              onClick={isSpeaking ? stopSpeaking : undefined}
              className={`
                p-3 rounded-xl transition-colors
                ${isSpeaking 
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
              title={isSpeaking ? 'Detener voz' : 'Voz habilitada'}
            >
              {isSpeaking ? (
                <SpeakerXMarkIcon className="w-6 h-6" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Cerrar chat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Welcome Message with Quick Actions */}
            {showQuickActions && session.messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Hola! Soy tu asistente virtual
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Estoy aquí para ayudarte con información sobre nuestros servicios, precios y agendar citas. ¿En qué puedo ayudarte?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => action.action ? action.action() : sendMessage(action.message)}
                      className="
                        p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700
                        hover:shadow-xl transition-all duration-200 text-left
                      "
                    >
                      <action.icon className="w-8 h-8 text-blue-500 mb-3" />
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {action.label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chat Messages */}
            {session.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                `}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : message.role === 'system'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <UserIcon className="w-6 h-6" />
                    ) : (
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`
                      px-6 py-4 rounded-2xl max-w-full
                      ${message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : message.role === 'system'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-bl-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </p>
                      {message.role === 'assistant' && voiceEnabled && (
                        <button
                          onClick={() => speakMessage(message.content)}
                          disabled={isSpeaking}
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity ml-2"
                          title="Escuchar mensaje"
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-2xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-6 py-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje aquí..."
                    disabled={isLoading}
                    rows={1}
                    className="
                      w-full px-6 py-4 pr-16 rounded-2xl border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed
                      resize-none min-h-[56px] max-h-32
                    "
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                  
                  {voiceEnabled && (
                    <button
                      onClick={startVoiceInput}
                      disabled={isLoading || isListening}
                      className={`
                        absolute right-4 top-1/2 transform -translate-y-1/2
                        p-2 rounded-xl transition-colors
                        ${isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      title={isListening ? 'Escuchando...' : 'Usar voz'}
                    >
                      <MicrophoneIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!currentMessage.trim() || isLoading}
                  className="
                    p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                    hover:from-blue-600 hover:to-purple-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg hover:shadow-xl
                  "
                  title="Enviar mensaje"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Voice status */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full">
                    <MicrophoneIcon className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Escuchando...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with session info (optional) */}
        {session.context.leadScore > 0 && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 hidden lg:block">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Información de la sesión
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Puntuación de lead</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(session.context.leadScore, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.context.leadScore}%
                  </span>
                </div>
              </div>

              {session.context.preferences.serviceType && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tipo de servicio</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {session.context.preferences.serviceType}
                  </p>
                </div>
              )}

              {session.context.preferences.budget && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Presupuesto</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    €{session.context.preferences.budget.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Etapa de conversación</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {session.context.conversationStage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
