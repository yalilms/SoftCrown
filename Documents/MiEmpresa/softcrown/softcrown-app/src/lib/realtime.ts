// Real-time features implementation
// WebSocket integration, live collaboration, typing indicators, notifications

export interface RealtimeConfig {
  websocketUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface RealtimeMessage {
  id: string;
  type: 'typing' | 'form_update' | 'notification' | 'status_change' | 'chat_message';
  userId: string;
  roomId: string;
  data: any;
  timestamp: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  formField?: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface FormCollaboration {
  formId: string;
  userId: string;
  userName: string;
  fieldName: string;
  fieldValue: any;
  timestamp: Date;
}

export interface RealtimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  persistent: boolean;
  timestamp: Date;
  actions?: {
    label: string;
    action: string;
  }[];
}

// WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: RealtimeConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isConnected = false;

  constructor(config: RealtimeConfig) {
    this.config = config;
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.websocketUrl);

        this.ws.onopen = () => {
          // WebSocket connected
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            // Error parsing WebSocket message
          }
        };

        this.ws.onclose = () => {
          // WebSocket disconnected
          this.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          // WebSocket error occurred
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.isConnected = false;
  }

  // Send message through WebSocket
  send(message: Omit<RealtimeMessage, 'id' | 'timestamp'>) {
    if (!this.isConnected || !this.ws) {
      // WebSocket not connected, message not sent
      return;
    }

    const fullMessage: RealtimeMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.ws.send(JSON.stringify(fullMessage));
  }

  // Subscribe to message type
  subscribe(messageType: string, handler: Function) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  // Unsubscribe from message type
  unsubscribe(messageType: string, handler: Function) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Handle incoming messages
  private handleMessage(message: RealtimeMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  // Attempt to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      // Max reconnection attempts reached
      return;
    }

    this.reconnectAttempts++;
    // Attempting to reconnect

    setTimeout(() => {
      this.connect().catch(error => {
        // Reconnection failed
      });
    }, this.config.reconnectInterval);
  }

  // Start heartbeat
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      websocketUrl: this.config.websocketUrl
    };
  }
}

// Typing Indicator Service
export class TypingIndicatorService {
  private wsService: WebSocketService;
  private typingUsers: Map<string, TypingIndicator> = new Map();
  private typingTimeout: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Function[] = [];

  constructor(wsService: WebSocketService) {
    this.wsService = wsService;
    this.setupMessageHandlers();
  }

  // Start typing indicator
  startTyping(userId: string, userName: string, roomId: string, formField?: string) {
    // Clear existing timeout
    const timeoutKey = `${userId}-${formField || 'general'}`;
    const existingTimeout = this.typingTimeout.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Send typing message
    this.wsService.send({
      type: 'typing',
      userId,
      roomId,
      data: {
        userName,
        formField,
        isTyping: true
      }
    });

    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      this.stopTyping(userId, roomId, formField);
    }, 3000); // Stop typing after 3 seconds of inactivity

    this.typingTimeout.set(timeoutKey, timeout);
  }

  // Stop typing indicator
  stopTyping(userId: string, roomId: string, formField?: string) {
    const timeoutKey = `${userId}-${formField || 'general'}`;
    const timeout = this.typingTimeout.get(timeoutKey);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeout.delete(timeoutKey);
    }

    this.wsService.send({
      type: 'typing',
      userId,
      roomId,
      data: {
        formField,
        isTyping: false
      }
    });
  }

  // Get current typing users
  getTypingUsers(roomId: string, formField?: string): TypingIndicator[] {
    return Array.from(this.typingUsers.values()).filter(
      indicator => 
        indicator.isTyping && 
        (!formField || indicator.formField === formField)
    );
  }

  // Subscribe to typing updates
  onTypingUpdate(callback: (typingUsers: TypingIndicator[]) => void) {
    this.callbacks.push(callback);
  }

  // Setup message handlers
  private setupMessageHandlers() {
    this.wsService.subscribe('typing', (message: RealtimeMessage) => {
      const { userName, formField, isTyping } = message.data;
      const key = `${message.userId}-${formField || 'general'}`;

      if (isTyping) {
        this.typingUsers.set(key, {
          userId: message.userId,
          userName,
          formField,
          isTyping: true,
          timestamp: message.timestamp
        });
      } else {
        this.typingUsers.delete(key);
      }

      // Notify callbacks
      this.callbacks.forEach(callback => {
        callback(Array.from(this.typingUsers.values()));
      });
    });
  }
}

// Form Collaboration Service
export class FormCollaborationService {
  private wsService: WebSocketService;
  private formStates: Map<string, any> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  constructor(wsService: WebSocketService) {
    this.wsService = wsService;
    this.setupMessageHandlers();
  }

  // Update form field
  updateField(formId: string, userId: string, userName: string, fieldName: string, fieldValue: any) {
    // Update local state
    const formState = this.formStates.get(formId) || {};
    formState[fieldName] = fieldValue;
    this.formStates.set(formId, formState);

    // Send update to other users
    this.wsService.send({
      type: 'form_update',
      userId,
      roomId: formId,
      data: {
        userName,
        fieldName,
        fieldValue,
        formState
      }
    });
  }

  // Get form state
  getFormState(formId: string): any {
    return this.formStates.get(formId) || {};
  }

  // Subscribe to form updates
  onFormUpdate(formId: string, callback: (update: FormCollaboration) => void) {
    if (!this.callbacks.has(formId)) {
      this.callbacks.set(formId, []);
    }
    this.callbacks.get(formId)!.push(callback);
  }

  // Setup message handlers
  private setupMessageHandlers() {
    this.wsService.subscribe('form_update', (message: RealtimeMessage) => {
      const { userName, fieldName, fieldValue, formState } = message.data;
      const formId = message.roomId;

      // Update local state
      this.formStates.set(formId, formState);

      // Create collaboration object
      const collaboration: FormCollaboration = {
        formId,
        userId: message.userId,
        userName,
        fieldName,
        fieldValue,
        timestamp: message.timestamp
      };

      // Notify callbacks
      const callbacks = this.callbacks.get(formId);
      if (callbacks) {
        callbacks.forEach(callback => callback(collaboration));
      }
    });
  }
}

// Notification Service
export class NotificationService {
  private wsService: WebSocketService;
  private notifications: RealtimeNotification[] = [];
  private callbacks: Function[] = [];

  constructor(wsService: WebSocketService) {
    this.wsService = wsService;
    this.setupMessageHandlers();
  }

  // Send notification
  sendNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp'>, roomId: string) {
    const fullNotification: RealtimeNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.wsService.send({
      type: 'notification',
      userId: 'system',
      roomId,
      data: fullNotification
    });

    // Add to local notifications if persistent
    if (fullNotification.persistent) {
      this.notifications.push(fullNotification);
    }
  }

  // Get notifications
  getNotifications(userId?: string): RealtimeNotification[] {
    return this.notifications.filter(
      notification => !userId || !notification.userId || notification.userId === userId
    );
  }

  // Dismiss notification
  dismissNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  // Subscribe to notifications
  onNotification(callback: (notification: RealtimeNotification) => void) {
    this.callbacks.push(callback);
  }

  // Setup message handlers
  private setupMessageHandlers() {
    this.wsService.subscribe('notification', (message: RealtimeMessage) => {
      const notification: RealtimeNotification = message.data;

      // Add to local notifications if persistent
      if (notification.persistent) {
        this.notifications.push(notification);
      }

      // Notify callbacks
      this.callbacks.forEach(callback => callback(notification));
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Main Realtime Service
export class RealtimeService {
  private wsService: WebSocketService;
  private typingService: TypingIndicatorService;
  private formCollabService: FormCollaborationService;
  private notificationService: NotificationService;

  constructor(config?: Partial<RealtimeConfig>) {
    const defaultConfig: RealtimeConfig = {
      websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000
    };

    const fullConfig = { ...defaultConfig, ...config };

    this.wsService = new WebSocketService(fullConfig);
    this.typingService = new TypingIndicatorService(this.wsService);
    this.formCollabService = new FormCollaborationService(this.wsService);
    this.notificationService = new NotificationService(this.wsService);
  }

  // Initialize realtime features
  async initialize(): Promise<void> {
    try {
      await this.wsService.connect();
      // Realtime service initialized
    } catch (error) {
      // Failed to initialize realtime service
      throw error;
    }
  }

  // Cleanup
  cleanup() {
    this.wsService.disconnect();
  }

  // Get services
  get typing() {
    return this.typingService;
  }

  get formCollab() {
    return this.formCollabService;
  }

  get notifications() {
    return this.notificationService;
  }

  get websocket() {
    return this.wsService;
  }

  // Get status
  getStatus() {
    return {
      websocket: this.wsService.getStatus(),
      features: {
        typing: true,
        formCollaboration: true,
        notifications: true
      }
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Utility hooks for React components
export const useTypingIndicator = (roomId: string, userId: string, userName: string) => {
  const startTyping = (formField?: string) => {
    realtimeService.typing.startTyping(userId, userName, roomId, formField);
  };

  const stopTyping = (formField?: string) => {
    realtimeService.typing.stopTyping(userId, roomId, formField);
  };

  return { startTyping, stopTyping };
};

export const useFormCollaboration = (formId: string, userId: string, userName: string) => {
  const updateField = (fieldName: string, fieldValue: any) => {
    realtimeService.formCollab.updateField(formId, userId, userName, fieldName, fieldValue);
  };

  const getFormState = () => {
    return realtimeService.formCollab.getFormState(formId);
  };

  return { updateField, getFormState };
};
