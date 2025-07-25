// Voice input/output service using Web Speech API
import { VoiceConfig } from '@/types/chat';

// Type definitions for Web Speech API
interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export class VoiceService {
  private recognition: ISpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private config: VoiceConfig;
  private isListening = false;
  private isSupported = false;

  constructor(config: VoiceConfig) {
    this.config = config;
    this.initializeVoiceServices();
  }

  // Initialize Web Speech API services
  private initializeVoiceServices() {
    if (typeof window === 'undefined') return;

    // Check for Speech Recognition support
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.setupRecognition();
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  // Setup speech recognition
  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      // Voice recognition started
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Voice recognition ended
    };

    this.recognition.onerror = (event: Event) => {
      // Voice recognition error
      this.isListening = false;
    };
  }

  // Start voice recognition
  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.config.enabled) {
        reject(new Error('Voice recognition not available'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        // Voice input processed with confidence: event.results[0][0].confidence
        resolve(transcript);
      };

      this.recognition.onerror = (event: Event & { error?: string }) => {
        reject(new Error(`Voice recognition error: ${event.error || 'Unknown error'}`));
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop voice recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Speak text using speech synthesis
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.config.enabled) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.lang = this.config.language;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Set voice if specified
      if (this.config.voice) {
        utterance.voice = this.config.voice;
      } else {
        // Find appropriate voice for language
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(this.config.language)) || voices[0];
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => {
        // console.log('Speech synthesis completed');
        resolve();
      };

      utterance.onerror = (event) => {
        // console.error('Speech synthesis error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // Get voices for specific language
  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.startsWith(language)
    );
  }

  // Update configuration
  updateConfig(newConfig: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition && newConfig.language) {
      this.recognition.lang = newConfig.language;
    }
  }

  // Check if voice services are supported
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  // Get current configuration
  getConfig(): VoiceConfig {
    return { ...this.config };
  }
}

// Voice command processor
export class VoiceCommandProcessor {
  private voiceService: VoiceService;
  private commands: Map<string, () => void> = new Map();

  constructor(voiceService: VoiceService) {
    this.voiceService = voiceService;
    this.setupDefaultCommands();
  }

  // Setup default voice commands
  private setupDefaultCommands() {
    this.addCommand('parar', () => this.voiceService.stopSpeaking());
    this.addCommand('silencio', () => this.voiceService.stopSpeaking());
    this.addCommand('repetir', () => {
      // This would repeat the last message
      // console.log('Repeat command triggered');
    });
    this.addCommand('ayuda', () => {
      this.voiceService.speak('Puedes decir: parar para detener la voz, repetir para escuchar de nuevo, o simplemente hacer tu pregunta.');
    });
  }

  // Add custom voice command
  addCommand(phrase: string, callback: () => void) {
    this.commands.set(phrase.toLowerCase(), callback);
  }

  // Process voice input for commands
  processVoiceInput(input: string): boolean {
    const lowerInput = input.toLowerCase().trim();
    
    for (const [command, callback] of this.commands.entries()) {
      if (lowerInput.includes(command)) {
        callback();
        return true; // Command was processed
      }
    }
    
    return false; // No command found
  }

  // Remove command
  removeCommand(phrase: string) {
    this.commands.delete(phrase.toLowerCase());
  }

  // Get all commands
  getCommands(): string[] {
    return Array.from(this.commands.keys());
  }
}

// Voice activity detector
export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isDetecting = false;
  private threshold = 50; // Voice activity threshold
  private onVoiceStart?: () => void;
  private onVoiceEnd?: () => void;
  private silenceTimeout: NodeJS.Timeout | null = null;

  constructor(threshold = 50) {
    this.threshold = threshold;
  }

  // Start voice activity detection
  async startDetection(onVoiceStart?: () => void, onVoiceEnd?: () => void): Promise<void> {
    this.onVoiceStart = onVoiceStart;
    this.onVoiceEnd = onVoiceEnd;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.microphone.connect(this.analyser);
      
      this.isDetecting = true;
      this.detectVoiceActivity();
      
    } catch (error) {
      // console.error('Error starting voice activity detection:', error);
      throw error;
    }
  }

  // Stop voice activity detection
  stopDetection() {
    this.isDetecting = false;
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Detect voice activity
  private detectVoiceActivity() {
    if (!this.isDetecting || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    if (average > this.threshold) {
      // Voice detected
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
      
      if (this.onVoiceStart) {
        this.onVoiceStart();
      }
    } else {
      // Silence detected
      if (!this.silenceTimeout) {
        this.silenceTimeout = setTimeout(() => {
          if (this.onVoiceEnd) {
            this.onVoiceEnd();
          }
          this.silenceTimeout = null;
        }, 1000); // 1 second of silence
      }
    }

    // Continue detection
    requestAnimationFrame(() => this.detectVoiceActivity());
  }

  // Set voice activity threshold
  setThreshold(threshold: number) {
    this.threshold = threshold;
  }

  // Get current threshold
  getThreshold(): number {
    return this.threshold;
  }

  // Check if currently detecting
  isCurrentlyDetecting(): boolean {
    return this.isDetecting;
  }
}

// Export default voice service instance
export const voiceService = new VoiceService({
  enabled: true,
  language: 'es-ES',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoSpeak: false
});

export const voiceCommandProcessor = new VoiceCommandProcessor(voiceService);
export const voiceActivityDetector = new VoiceActivityDetector();
