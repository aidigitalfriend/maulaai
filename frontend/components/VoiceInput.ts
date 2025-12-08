// VoiceInput Logic
// Handles speech recognition, audio processing, and voice command functionality

export interface VoiceInputState {
  isListening: boolean;
  isProcessing: boolean;
  hasPermission: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  isMuted: boolean;
  volume: number;
}

export interface VoiceInputActions {
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  processTranscript: (transcript: string) => void;
  clearTranscript: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export class VoiceInputLogic {
  private state: VoiceInputState;
  private actions: VoiceInputActions;
  private recognition: SpeechRecognition | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.state = {
      isListening: false,
      isProcessing: false,
      hasPermission: false,
      isSupported: this.checkBrowserSupport(),
      transcript: '',
      confidence: 0,
      error: null,
      isMuted: false,
      volume: 1,
    };

    this.actions = {
      startListening: this.startListening.bind(this),
      stopListening: this.stopListening.bind(this),
      toggleListening: this.toggleListening.bind(this),
      requestPermission: this.requestPermission.bind(this),
      processTranscript: this.processTranscript.bind(this),
      clearTranscript: this.clearTranscript.bind(this),
      setVolume: this.setVolume.bind(this),
      toggleMute: this.toggleMute.bind(this),
    };

    // Initialize speech recognition if supported
    if (this.state.isSupported) {
      this.initializeSpeechRecognition();
    }

    // Check for existing microphone permissions
    this.checkExistingPermissions();
  }

  private checkBrowserSupport(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();

      // Configure recognition settings
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      // Event handlers
      this.recognition.onstart = () => {
        this.state.isListening = true;
        this.state.error = null;
        this.trackVoiceEvent('voice_listening_started');
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            this.state.confidence = result[0].confidence;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          this.processTranscript(finalTranscript);
        } else {
          this.state.transcript = interimTranscript;
        }
      };

      this.recognition.onerror = (event) => {
        this.state.error = `Speech recognition error: ${event.error}`;
        this.state.isListening = false;
        this.trackVoiceEvent('voice_recognition_error', { error: event.error });
      };

      this.recognition.onend = () => {
        this.state.isListening = false;
        this.trackVoiceEvent('voice_listening_stopped');
      };
    }
  }

  async startListening(): Promise<void> {
    if (!this.state.isSupported) {
      throw new Error('Speech recognition not supported in this browser');
    }

    try {
      // Request microphone permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      this.state.error = null;
      this.state.transcript = '';

      if (this.recognition) {
        this.recognition.start();
      }
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Failed to start listening';
      throw error;
    }
  }

  stopListening(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }
    this.state.isListening = false;
  }

  async toggleListening(): Promise<void> {
    if (this.state.isListening) {
      this.stopListening();
    } else {
      await this.startListening();
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        this.state.hasPermission = true;

        // Initialize audio context for volume control
        this.initializeAudioContext();

        return true;
      } else {
        throw new Error('MediaDevices API not supported');
      }
    } catch (error) {
      this.state.hasPermission = false;
      this.state.error = 'Microphone access denied or not available';
      return false;
    }
  }

  private async checkExistingPermissions(): Promise<void> {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        this.state.hasPermission = permissionStatus.state === 'granted';

        // Listen for permission changes
        permissionStatus.addEventListener('change', () => {
          this.state.hasPermission = permissionStatus.state === 'granted';
        });
      }
    } catch (error) {
      console.warn('Could not check microphone permissions:', error);
    }
  }

  private initializeAudioContext(): void {
    if (!this.mediaStream) return;

    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );
      const gainNode = this.audioContext.createGain();

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set initial volume
      gainNode.gain.value = this.state.volume;
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
    }
  }

  processTranscript(transcript: string): void {
    const cleanedTranscript = transcript.trim();
    if (cleanedTranscript) {
      this.state.transcript = cleanedTranscript;

      // Track successful speech recognition
      this.trackVoiceEvent('voice_transcript_generated', {
        transcript_length: cleanedTranscript.length,
        confidence: this.state.confidence,
      });
    }
  }

  clearTranscript(): void {
    this.state.transcript = '';
    this.state.confidence = 0;
  }

  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));

    // Update audio context gain if available
    if (this.audioContext) {
      const gainNodes = this.audioContext;
      // Would need to store reference to gain node to update it
    }
  }

  toggleMute(): void {
    this.state.isMuted = !this.state.isMuted;

    if (this.mediaStream) {
      const audioTracks = this.mediaStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !this.state.isMuted;
      });
    }
  }

  // Command processing for voice commands
  processVoiceCommand(
    transcript: string
  ): { command: string; parameters?: any } | null {
    const lowerTranscript = transcript.toLowerCase();

    // Define voice command patterns
    const commands = [
      { pattern: /^(start|begin|new) chat/i, command: 'new_chat' },
      {
        pattern: /^(stop|end|finish) (?:chat|conversation)/i,
        command: 'end_chat',
      },
      {
        pattern: /^clear (?:chat|conversation|history)/i,
        command: 'clear_chat',
      },
      { pattern: /^send message (.+)/i, command: 'send_message', extract: 1 },
      {
        pattern: /^switch to (.+) agent/i,
        command: 'switch_agent',
        extract: 1,
      },
      { pattern: /^(?:mute|silence) microphone/i, command: 'mute_mic' },
      { pattern: /^(?:unmute|enable) microphone/i, command: 'unmute_mic' },
    ];

    for (const cmd of commands) {
      const match = lowerTranscript.match(cmd.pattern);
      if (match) {
        const result: any = { command: cmd.command };

        if (cmd.extract && match[cmd.extract]) {
          result.parameters = { text: match[cmd.extract].trim() };
        }

        this.trackVoiceEvent('voice_command_recognized', {
          command: cmd.command,
          transcript: transcript,
        });

        return result;
      }
    }

    return null;
  }

  private trackVoiceEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'voice_interaction',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    this.stopListening();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  getState(): VoiceInputState {
    return { ...this.state };
  }

  getActions(): VoiceInputActions {
    return this.actions;
  }

  setState(updates: Partial<VoiceInputState>): void {
    this.state = { ...this.state, ...updates };
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export default VoiceInputLogic;
