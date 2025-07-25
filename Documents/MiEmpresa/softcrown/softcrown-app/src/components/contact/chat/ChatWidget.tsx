'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { ChatMessage, ChatSession } from '@/types/contact';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MinusIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  position?: 'bottom-right' | 'bottom-left';
}

const quickReplies = [
  '¡Hola! 👋',
  'Necesito información sobre precios',
  'Quiero agendar una consulta',
  '¿Cuánto tiempo toma un proyecto?',
  'Tengo una pregunta técnica'
];

const agentInfo = {
  name: 'SoftCrown Assistant',
  avatar: '/images/agent-avatar.jpg',
  status: 'online',
  responseTime: 'Responde en minutos'
};

export function ChatWidget({ 
  isOpen = false, 
  onToggle,
  position = 'bottom-right' 
}: ChatWidgetProps) {
  const { state, dispatch } = useContact();
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.activeChatSession?.messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !state.activeChatSession) {
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        visitorId: 'visitor-' + Math.random().toString(36).substr(2, 9),
        status: 'active',
        messages: [
          {
            id: 'welcome-1',
            senderId: 'agent',
            senderName: agentInfo.name,
            senderType: 'agent',
            content: '¡Hola! 👋 Soy el asistente de SoftCrown. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date(),
            type: 'text',
            isRead: true
          }
        ],
        startedAt: new Date(),
        tags: ['website', 'new-visitor']
      };
      
      dispatch({ type: 'ADD_CHAT_SESSION', payload: newSession });
      dispatch({ type: 'SET_ACTIVE_CHAT', payload: newSession });
    }
  }, [isOpen, state.activeChatSession, dispatch]);

  const sendMessage = async (content: string, type: 'text' | 'file' = 'text') => {
    if (!content.trim() || !state.activeChatSession) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: state.activeChatSession.visitorId,
      senderName: 'Tú',
      senderType: 'user',
      content,
      timestamp: new Date(),
      type,
      isRead: false
    };

    // Add user message
    dispatch({
      type: 'UPDATE_CHAT_SESSION',
      payload: {
        id: state.activeChatSession.id,
        updates: {
          messages: [...state.activeChatSession.messages, userMessage]
        }
      }
    });

    setMessage('');
    setShowQuickReplies(false);
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        'Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto.',
        '¡Perfecto! Te ayudo con eso. ¿Podrías darme más detalles?',
        'Entiendo. Déjame conectarte con un especialista.',
        'Excelente pregunta. Te voy a enviar información detallada.',
        '¡Genial! Vamos a trabajar juntos en tu proyecto.'
      ];

      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        senderId: 'agent',
        senderName: agentInfo.name,
        senderType: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text',
        isRead: true
      };

      dispatch({
        type: 'UPDATE_CHAT_SESSION',
        payload: {
          id: state.activeChatSession!.id,
          updates: {
            messages: [...state.activeChatSession!.messages, userMessage, agentMessage]
          }
        }
      });

      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file and get a URL
      sendMessage(`📎 ${file.name}`, 'file');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={onToggle}
        className={`fixed ${positionClasses[position]} z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">1</span>
        </div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          ¿Necesitas ayuda? ¡Chatea con nosotros!
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-50 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ 
        scale: isMinimized ? 0.8 : 1, 
        opacity: 1, 
        y: isMinimized ? 50 : 0,
        x: dragOffset.x,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      drag={isDragging}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        setDragOffset({ x: dragOffset.x + info.offset.x, y: dragOffset.y + info.offset.y });
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold">{agentInfo.name}</h3>
              <p className="text-xs text-white/80">{agentInfo.responseTime}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <button className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition-colors">
            <PhoneIcon className="w-3 h-3" />
            <span>Llamar</span>
          </button>
          <button className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition-colors">
            <VideoCameraIcon className="w-3 h-3" />
            <span>Video</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
              {state.activeChatSession?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-xs px-4 py-2 rounded-2xl
                    ${msg.senderType === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                    }
                  `}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderType === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Respuestas rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.slice(0, 3).map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  <PaperClipIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
                  >
                    <FaceSmileIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                <button
                  onClick={() => sendMessage(message)}
                  disabled={!message.trim()}
                  className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
