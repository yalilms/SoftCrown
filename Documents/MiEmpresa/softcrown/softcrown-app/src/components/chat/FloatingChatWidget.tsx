'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { ChatMessage, ChatSession, ChatWidget } from '@/types/chat';
import { aiChatService } from '@/lib/ai-chat';
import { voiceService, voiceCommandProcessor } from '@/lib/voice';

interface FloatingChatWidgetProps {
  userId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
}

export function FloatingChatWidget({ 
  userId, 
  position = 'bottom-right',
  theme = 'auto'
}: FloatingChatWidgetProps) {
  const [widget, setWidget] = useState<ChatWidget>({
    isOpen: false,
    isMinimized: false,
    isFullscreen: false,
    position,
    theme,
    showTypingIndicator: false,
    showOnlineStatus: true,
    unreadCount: 0
  });

  const [session, setSession] = useState<ChatSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const newSession = await aiChatService.createSession(userId);
        setSession(newSession);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Check voice support
  useEffect(() => {
    setVoiceEnabled(voiceService.isVoiceSupported());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleWidget = () => {
    setWidget(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      unreadCount: prev.isOpen ? prev.unreadCount : 0
    }));
  };

  const toggleFullscreen = () => {
    setWidget(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }));
  };

  const closeWidget = () => {
    setWidget(prev => ({
      ...prev,
      isOpen: false,
      isFullscreen: false
    }));
  };

  const sendMessage = async (message?: string) => {
    const messageToSend = message || currentMessage.trim();
    if (!messageToSend || !session || isLoading) return;

    setCurrentMessage('');
    setIsLoading(true);

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

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence>
        {/* Chat Widget */}
        {widget.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`
              ${widget.isFullscreen 
                ? 'fixed inset-4 z-50' 
                : 'w-80 h-96 mb-4'
              }
              bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
              flex flex-col overflow-hidden
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">SoftCrown Assistant</h3>
                  <p className="text-xs opacity-90">
                    {widget.showOnlineStatus && (
                      <>
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        En línea
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {voiceEnabled && (
                  <button
                    onClick={isSpeaking ? stopSpeaking : undefined}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${isSpeaking 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : 'bg-white/10 hover:bg-white/20'
                      }
                    `}
                    title={isSpeaking ? 'Detener voz' : 'Voz habilitada'}
                  >
                    {isSpeaking ? (
                      <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title={widget.isFullscreen ? 'Ventana normal' : 'Pantalla completa'}
                >
                  {widget.isFullscreen ? (
                    <ArrowsPointingInIcon className="w-5 h-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={closeWidget}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Cerrar chat"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                  `}
                >
                  <div
                    className={`
                      max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
                      ${message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : message.role === 'system'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-bl-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {(isLoading || widget.showTypingIndicator) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    disabled={isLoading}
                    className="
                      w-full px-4 py-2 pr-12 rounded-xl border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  />
                  
                  {voiceEnabled && (
                    <button
                      onClick={startVoiceInput}
                      disabled={isLoading || isListening}
                      className={`
                        absolute right-2 top-1/2 transform -translate-y-1/2
                        p-1.5 rounded-lg transition-colors
                        ${isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      title={isListening ? 'Escuchando...' : 'Usar voz'}
                    >
                      <MicrophoneIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!currentMessage.trim() || isLoading}
                  className="
                    p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                  title="Enviar mensaje"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!widget.isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleWidget}
          className="
            w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white
            rounded-full shadow-lg hover:shadow-xl transition-shadow
            flex items-center justify-center relative
          "
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          
          {/* Unread count badge */}
          {widget.unreadCount > 0 && (
            <span className="
              absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
              rounded-full flex items-center justify-center font-semibold
            ">
              {widget.unreadCount > 9 ? '9+' : widget.unreadCount}
            </span>
          )}

          {/* Online indicator */}
          {widget.showOnlineStatus && (
            <span className="
              absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white
              rounded-full
            "></span>
          )}
        </motion.button>
      )}
    </div>
  );
}
