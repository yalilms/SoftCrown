// PWA utilities and native-like features
// Install prompt, Share API, Clipboard API, Geolocation, Device orientation

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsShare: boolean;
  supportsClipboard: boolean;
  supportsGeolocation: boolean;
  supportsDeviceOrientation: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
}

export class PWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private installCallbacks: ((canInstall: boolean) => void)[] = [];

  constructor() {
    this.initializePWA();
  }

  // Initialize PWA features
  private initializePWA() {
    if (typeof window === 'undefined') return;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.notifyInstallCallbacks(true);
      // PWA: Install prompt available
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.notifyInstallCallbacks(false);
      // PWA: App installed successfully
    });

    // Register service worker
    this.registerServiceWorker();
  }

  // Register service worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // PWA: Service Worker registered successfully

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // PWA: New version available
                this.showUpdateAvailable();
              }
            });
          }
        });

        return registration;
      } catch (error) {
        // PWA: Service Worker registration failed
      }
    }
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      // PWA: Install prompt not available
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        // PWA: User accepted install prompt
        return true;
      } else {
        // PWA: User dismissed install prompt
        return false;
      }
    } catch (error) {
      // PWA: Error showing install prompt
      return false;
    }
  }

  // Check if app can be installed
  canInstall(): boolean {
    return !!this.installPrompt;
  }

  // Check if app is installed/standalone
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get PWA capabilities
  getCapabilities(): PWACapabilities {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled(),
      isStandalone: this.isInstalled(),
      supportsShare: 'share' in navigator,
      supportsClipboard: 'clipboard' in navigator,
      supportsGeolocation: 'geolocation' in navigator,
      supportsDeviceOrientation: 'DeviceOrientationEvent' in window,
      supportsPushNotifications: 'PushManager' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };
  }

  // Subscribe to install availability changes
  onInstallAvailable(callback: (canInstall: boolean) => void) {
    this.installCallbacks.push(callback);
  }

  // Notify install callbacks
  private notifyInstallCallbacks(canInstall: boolean) {
    this.installCallbacks.forEach(callback => callback(canInstall));
  }

  // Show update available notification
  private showUpdateAvailable() {
    // This would typically show a toast or modal
    // console.log('PWA: Update available - reload to get the latest version');
  }

  // Update service worker
  async updateServiceWorker() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }
}

// Share API utilities
export class ShareService {
  // Check if sharing is supported
  static isSupported(): boolean {
    return 'share' in navigator;
  }

  // Share content
  static async share(data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }): Promise<boolean> {
    if (!this.isSupported()) {
      // console.warn('Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      // console.log('Share successful');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        // console.error('Share failed:', error);
      }
      return false;
    }
  }

  // Share page
  static async sharePage(customTitle?: string, customText?: string): Promise<boolean> {
    return this.share({
      title: customTitle || document.title,
      text: customText || 'Echa un vistazo a SoftCrown',
      url: window.location.href
    });
  }

  // Share quote
  static async shareQuote(quoteData: any): Promise<boolean> {
    const text = `Mi cotización de SoftCrown: ${quoteData.category} por €${quoteData.total.toLocaleString()}`;
    return this.share({
      title: 'Cotización SoftCrown',
      text,
      url: window.location.href
    });
  }
}

// Clipboard API utilities
export class ClipboardService {
  // Check if clipboard is supported
  static isSupported(): boolean {
    return 'clipboard' in navigator;
  }

  // Copy text to clipboard
  static async copyText(text: string): Promise<boolean> {
    if (!this.isSupported()) {
      // Fallback for older browsers
      return this.fallbackCopyText(text);
    }

    try {
      await navigator.clipboard.writeText(text);
      // console.log('Text copied to clipboard');
      return true;
    } catch (error) {
      // console.error('Failed to copy text:', error);
      return this.fallbackCopyText(text);
    }
  }

  // Read text from clipboard
  static async readText(): Promise<string | null> {
    if (!this.isSupported()) {
      // console.warn('Clipboard read not supported');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      // console.error('Failed to read clipboard:', error);
      return null;
    }
  }

  // Fallback copy method for older browsers
  private static fallbackCopyText(text: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        // console.log('Text copied using fallback method');
      }
      
      return successful;
    } catch (error) {
      // console.error('Fallback copy failed:', error);
      return false;
    }
  }

  // Copy quote to clipboard
  static async copyQuote(quoteData: any): Promise<boolean> {
    const text = `Cotización SoftCrown\n\nServicio: ${quoteData.category}\nCaracterísticas: ${quoteData.features?.length || 0}\nTotal: €${quoteData.total.toLocaleString()}\nTiempo: ${quoteData.timeline}\n\nMás información: ${window.location.origin}`;
    return this.copyText(text);
  }
}

// Geolocation utilities
export class GeolocationService {
  // Check if geolocation is supported
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  // Get current position
  static async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition | null> {
    if (!this.isSupported()) {
      // console.warn('Geolocation not supported');
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // console.log('Location obtained:', position.coords);
          resolve(position);
        },
        (error) => {
          // console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
          ...options
        }
      );
    });
  }

  // Watch position changes
  static watchPosition(
    callback: (position: GeolocationPosition | null) => void,
    options?: PositionOptions
  ): number | null {
    if (!this.isSupported()) {
      // console.warn('Geolocation not supported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => callback(position),
      (error) => {
        // console.error('Geolocation watch error:', error);
        callback(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000, // 10 minutes
        ...options
      }
    );
  }

  // Stop watching position
  static clearWatch(watchId: number) {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // Get distance between two points (in km)
  static getDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Device Orientation utilities
export class DeviceOrientationService {
  private static listeners: ((orientation: DeviceOrientationEvent) => void)[] = [];

  // Check if device orientation is supported
  static isSupported(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  // Request permission (iOS 13+)
  static async requestPermission(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        // console.error('Device orientation permission error:', error);
        return false;
      }
    }
    return true; // Permission not required on other platforms
  }

  // Start listening to orientation changes
  static async startListening(callback: (orientation: DeviceOrientationEvent) => void): Promise<boolean> {
    if (!this.isSupported()) {
      // console.warn('Device orientation not supported');
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      // console.warn('Device orientation permission denied');
      return false;
    }

    this.listeners.push(callback);
    window.addEventListener('deviceorientation', callback);
    // console.log('Device orientation listening started');
    return true;
  }

  // Stop listening to orientation changes
  static stopListening(callback: (orientation: DeviceOrientationEvent) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
      window.removeEventListener('deviceorientation', callback);
      // console.log('Device orientation listening stopped');
    }
  }

  // Get orientation description
  static getOrientationDescription(event: DeviceOrientationEvent): string {
    const { alpha, beta, gamma } = event;
    
    if (beta === null || gamma === null) {
      return 'Orientación no disponible';
    }

    // Determine device orientation
    if (Math.abs(gamma) > Math.abs(beta)) {
      return gamma > 0 ? 'Inclinado a la derecha' : 'Inclinado a la izquierda';
    } else {
      return beta > 0 ? 'Inclinado hacia adelante' : 'Inclinado hacia atrás';
    }
  }
}

// Push Notifications utilities
export class PushNotificationService {
  // Check if push notifications are supported
  static isSupported(): boolean {
    return 'PushManager' in window && 'serviceWorker' in navigator;
  }

  // Request notification permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      // console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    // console.log('Notification permission:', permission);
    return permission;
  }

  // Subscribe to push notifications
  static async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      // console.warn('Push notifications not supported');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      // console.warn('Push notification permission not granted');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        // console.error('Service worker not registered');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      // console.error('Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      const result = await subscription.unsubscribe();
      // console.log('Push unsubscription:', result);
      return result;
    } catch (error) {
      // console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Convert VAPID key
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification
  static async showNotification(title: string, options?: NotificationOptions): Promise<boolean> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    try {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
      return true;
    } catch (error) {
      // console.error('Local notification failed:', error);
      return false;
    }
  }
}

// Export singleton instances
export const pwaService = new PWAService();
export { ShareService as shareService };
export { ClipboardService as clipboardService };
export { GeolocationService as geolocationService };
export { DeviceOrientationService as deviceOrientationService };
export { PushNotificationService as pushNotificationService };
