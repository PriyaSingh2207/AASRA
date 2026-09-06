/**
 * AASRA Voice-First AI Assistant
 * Integrates browser Web Speech API (STT) and SpeechSynthesis (TTS)
 * for senior-friendly natural language interaction and audible feedback.
 */

class VoiceAssistantEngine {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.currentLang = 'hi-IN'; // Default Hindi, customizable for Indian & NER languages
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.currentLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice recognized:', transcript);
        this.handleVoiceInput(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.isListening = false;
        this.updateMicUI(false);
      };
    }
  }

  setLanguage(langCode) {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'mr': 'mr-IN',
      'od': 'or-IN',
      'pa': 'pa-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'gu': 'gu-IN',
      'as': 'as-IN',
      'mni': 'hi-IN',
      'lus': 'en-IN',
      'brx': 'hi-IN',
      'nag': 'en-IN'
    };
    this.currentLang = langMap[langCode] || 'hi-IN';
    if (this.recognition) {
      this.recognition.lang = this.currentLang;
    }
  }

  startListening() {
    if (!this.recognition) {
      this.simulateVoicePrompt();
      return;
    }
    try {
      if (this.isListening) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    } catch (e) {
      this.simulateVoicePrompt();
    }
  }

  updateMicUI(listening) {
    const micBtn = document.getElementById('mainMicBtn');
    const statusText = document.getElementById('voiceStatusText');
    if (!micBtn) return;

    if (listening) {
      micBtn.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)';
      if (statusText) statusText.innerText = 'Listening... Speak now!';
    } else {
      micBtn.style.background = 'linear-gradient(135deg, #D97706, #F59E0B)';
      if (statusText) statusText.innerText = 'Tap mic to speak to AASRA';
    }
  }

  async speak(text) {
    if (!text) return;
    
    // Try Sarvam AI Bulbul Neural TTS First
    try {
      const res = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, lang: this.currentLang.split('-')[0] || 'hi', pace: 0.88 })
      });
      const data = await res.json();
      if (data && data.audio_base64) {
        const audio = new Audio("data:audio/wav;base64," + data.audio_base64);
        audio.play();
        return;
      }
    } catch (e) {
      console.log('Sarvam TTS fallback to browser synthesis:', e);
    }

    // High fidelity browser Web Speech API fallback
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slower rate for senior clarity
    utterance.pitch = 1.0;
    utterance.lang = this.currentLang;

    this.synth.speak(utterance);
  }

  async handleVoiceInput(transcript) {
    const statusText = document.getElementById('voiceStatusText');
    if (statusText) statusText.innerText = `You said: "${transcript}"`;

    try {
      const res = await fetch('/api/ai/voice-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, lang: this.currentLang })
      });
      const data = await res.json();
      
      this.speak(data.speech_response);
      this.executeVoiceAction(data);
    } catch (err) {
      // Fallback intent execution offline
      this.fallbackLocalIntent(transcript);
    }
  }

  executeVoiceAction(data) {
    if (data.intent === 'emergency_sos') {
      if (window.emergencyEngine) window.emergencyEngine.triggerSOS('Voice Command');
    } else if (data.intent === 'get_schedule') {
      if (window.appController) window.appController.scrollSchedule();
    } else if (data.intent === 'start_cognitive_game') {
      if (window.cognitiveEngine) window.cognitiveEngine.launchGame('photo_recall');
    } else if (data.intent === 'call_caregiver') {
      alert('Connecting voice call to Rahul Sharma (Primary Caregiver)...');
    }
  }

  fallbackLocalIntent(text) {
    const lower = text.toLowerCase();
    let reply = "Savitri ji, I am here to support you. Your afternoon medicine is scheduled for 2:00 PM.";
    
    if (lower.includes('help') || lower.includes('sos') || lower.includes('madad')) {
      reply = "Emergency requested. Alerting your son Rahul Sharma.";
      if (window.emergencyEngine) window.emergencyEngine.triggerSOS('Voice Command');
    } else if (lower.includes('medicine') || lower.includes('dawai')) {
      reply = "Your next tablet is Amlodipine 5mg at 2:00 PM.";
    }

    this.speak(reply);
  }

  simulateVoicePrompt() {
    const samplePrompts = [
      "AASRA, what do I have to do today?",
      "Did I take my morning medicine?",
      "AASRA, where am I right now?",
      "AASRA HELP ME",
      "Let us play the family photo game"
    ];
    
    const choice = prompt("Voice Assistant Input (Simulation):\nType your prompt or pick one:", samplePrompts[0]);
    if (choice) {
      this.handleVoiceInput(choice);
    }
  }
}

window.voiceAssistant = new VoiceAssistantEngine();
