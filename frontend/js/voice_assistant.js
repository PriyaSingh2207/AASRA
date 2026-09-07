/**
 * AASRA Voice-First AI Assistant
 * Sovereign Multilingual Voice Engine with Sarvam AI & Web Speech API
 * Full Voice Navigation, Intent Recognition & Neural Speech Synthesis.
 */

class VoiceAssistantEngine {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.currentLang = 'hi'; // Default Hindi
    this.audioPlayer = null;
    this.initSpeechRecognition();
    this.injectVoiceModal();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getBcp47Lang(this.currentLang);

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateVoiceUIState(true);
        };

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const transcript = finalTranscript || interimTranscript;
          if (transcript) {
            this.updateTranscriptUI(transcript);
          }

          if (finalTranscript) {
            this.handleVoiceInput(finalTranscript);
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('Speech recognition notice:', event.error);
          this.isListening = false;
          this.updateVoiceUIState(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            this.showToastNotification("Microphone Access", "Please allow mic permissions or tap any sample voice command below.");
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateVoiceUIState(false);
        };
      } catch (e) {
        console.warn('Speech recognition init error:', e);
      }
    }
  }

  getBcp47Lang(code) {
    const map = {
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
    return map[code] || 'hi-IN';
  }

  setLanguage(langCode) {
    this.currentLang = langCode.split('-')[0].toLowerCase();
    if (this.recognition) {
      this.recognition.lang = this.getBcp47Lang(this.currentLang);
    }
  }

  startListening() {
    this.openVoiceModal();
    if (!this.recognition) {
      this.updateTranscriptUI("Speech recognition is initializing. Tap a prompt or type below:");
      return;
    }

    try {
      if (this.isListening) {
        this.recognition.stop();
      } else {
        this.recognition.lang = this.getBcp47Lang(this.currentLang);
        this.recognition.start();
      }
    } catch (e) {
      console.log('Recognition start error:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.updateVoiceUIState(false);
  }

  updateVoiceUIState(listening) {
    const heroBtn = document.getElementById('voiceHeroBtn');
    const heroSub = document.getElementById('voiceHeroSub');
    const modalWave = document.getElementById('voiceWaveformAnim');
    const modalStatus = document.getElementById('voiceModalStatus');

    if (heroBtn) {
      if (listening) {
        heroBtn.classList.add('ring-4', 'ring-amber-400', 'scale-105');
      } else {
        heroBtn.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
      }
    }

    if (heroSub && listening) {
      heroSub.innerText = "🎙️ Listening... Speak now in Hindi or English";
    }

    if (modalWave) {
      modalWave.style.display = listening ? 'flex' : 'none';
    }

    if (modalStatus) {
      modalStatus.innerText = listening ? "Listening... Speak clearly into your mic" : "Tap the mic or select a command below";
    }
  }

  updateTranscriptUI(text) {
    const box = document.getElementById('voiceTranscriptBox');
    if (box) {
      box.innerText = `"${text}"`;
    }
  }

  async speak(text) {
    if (!text) return;

    // Show toast
    this.showToastNotification("AASRA Speaking", text);

    // Stop any ongoing audio
    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer = null;
      } catch (e) {}
    }
    if (this.synth) {
      this.synth.cancel();
    }

    // 1. Try Sarvam AI Neural TTS (Bulbul:v3)
    try {
      const res = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text, 
          lang: this.currentLang,
          pace: 0.88 
        })
      });
      const data = await res.json();
      if (data && data.audio_base64) {
        this.audioPlayer = new Audio("data:audio/wav;base64," + data.audio_base64);
        this.audioPlayer.play();
        return;
      }
    } catch (e) {
      console.log('Sarvam TTS fallback to browser synthesis:', e);
    }

    // 2. High-Fidelity Browser SpeechSynthesis Fallback
    if (this.synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Soothing calm pace for seniors
      utterance.pitch = 1.0;
      utterance.lang = this.getBcp47Lang(this.currentLang);
      this.synth.speak(utterance);
    }
  }

  async handleVoiceInput(transcript) {
    if (!transcript || !transcript.trim()) return;
    this.updateTranscriptUI(transcript);
    this.stopListening();

    const replyBox = document.getElementById('voiceReplyBox');
    if (replyBox) {
      replyBox.innerText = "Analyzing voice command & navigating...";
      replyBox.classList.remove('hidden');
    }

    try {
      const res = await fetch('/api/ai/voice-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcript, 
          lang: this.currentLang,
          generate_audio: true 
        })
      });
      const data = await res.json();

      const replyText = data.speech_response || "Namaste! I am here to help you.";
      if (replyBox) {
        replyBox.innerText = replyText;
      }

      this.speak(replyText);
      this.executeVoiceAction(data);
    } catch (err) {
      this.fallbackLocalIntent(transcript);
    }
  }

  executeVoiceAction(data) {
    const intent = data.intent;
    const navTarget = data.nav_target;
    const gameId = data.game_id;

    // 1. Emergency SOS
    if (intent === 'emergency_sos') {
      if (window.emergencyEngine) {
        window.emergencyEngine.triggerSOS('Voice Command: Emergency SOS');
      } else {
        alert("🚨 Emergency SOS Triggered! Caregivers notified with location.");
      }
      return;
    }

    // 2. Direct Cognitive Game Navigation & Launch
    if (intent === 'navigate_game' || gameId) {
      this.switchToPatientMode();
      if (typeof switchTab === 'function') switchTab('games');
      const targetGame = gameId || 'photo_recall';
      setTimeout(() => {
        if (window.cognitiveEngine) {
          window.cognitiveEngine.launchGame(targetGame);
        }
        const gameModal = document.getElementById('gameActiveModal');
        if (gameModal) gameModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return;
    }

    // 3. Tab Navigation (today, games, memory, consent)
    if (intent === 'navigate_tab' || intent === 'start_cognitive_game') {
      this.switchToPatientMode();
      const tab = navTarget || (intent === 'start_cognitive_game' ? 'games' : 'today');
      if (typeof switchTab === 'function') {
        switchTab(tab);
      }
      return;
    }

    // 4. Mode Navigation (Caregiver Dashboard vs Patient App)
    if (intent === 'navigate_mode') {
      if (navTarget === 'caregiver') {
        this.switchToCaregiverMode();
      } else {
        this.switchToPatientMode();
      }
      return;
    }

    // 5. Modal Navigation (Auth / Profile, Language)
    if (intent === 'navigate_modal') {
      if (navTarget === 'auth') {
        this.closeVoiceModal();
        if (window.authController) window.authController.openAuthModal();
      } else if (navTarget === 'lang') {
        const langModal = document.getElementById('langModal');
        if (langModal) langModal.classList.remove('hidden');
      }
      return;
    }

    // 6. Direct AAC & Needs Actions
    if (intent === 'action_need') {
      if (data.action === 'water_need') {
        if (typeof triggerAAC === 'function') {
          triggerAAC('Need Water', 'পানী লাগিছে • Thirsty');
        }
      }
      return;
    }

    // 7. Schedule & Reminders
    if (intent === 'get_schedule' || intent === 'read_next_reminder') {
      this.switchToPatientMode();
      if (typeof switchTab === 'function') switchTab('today');
      const medTitle = document.getElementById('medTitle');
      if (medTitle) {
        medTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 8. Location Orientation
    if (intent === 'location_orientation') {
      this.switchToPatientMode();
      if (typeof switchTab === 'function') switchTab('today');
      const safetyBox = document.getElementById('safetyText');
      if (safetyBox) safetyBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 9. Call Caregiver
    if (intent === 'call_caregiver' || intent === 'dial_caregiver') {
      alert("📞 Calling Primary Caregiver: Rahul Sharma (+91 98765 43210)...");
      return;
    }
  }

  switchToCaregiverMode() {
    const patientView = document.getElementById('patientAppView');
    const caregiverView = document.getElementById('caregiverDashboardView');
    const bottomNav = document.getElementById('bottomNav');
    const toggleLabel = document.getElementById('modeToggleLabel');

    if (patientView && caregiverView) {
      patientView.classList.add('hidden');
      caregiverView.classList.remove('hidden');
      if (bottomNav) bottomNav.classList.add('hidden');
      if (toggleLabel) toggleLabel.innerText = 'Patient App';
      if (window.caregiverDashboard) window.caregiverDashboard.loadDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  switchToPatientMode() {
    const patientView = document.getElementById('patientAppView');
    const caregiverView = document.getElementById('caregiverDashboardView');
    const bottomNav = document.getElementById('bottomNav');
    const toggleLabel = document.getElementById('modeToggleLabel');

    if (patientView && caregiverView) {
      patientView.classList.remove('hidden');
      caregiverView.classList.add('hidden');
      if (bottomNav) bottomNav.classList.remove('hidden');
      if (toggleLabel) toggleLabel.innerText = 'Caregiver View';
    }
  }

  fallbackLocalIntent(text) {
    const lower = text.toLowerCase();
    let reply = "Savitri ji, I am here with you. Your next medicine is scheduled for 11:30 AM.";
    let data = { intent: "general_query", speech_response: reply };

    if (lower.includes('help') || lower.includes('sos') || lower.includes('madad') || lower.includes('bachao')) {
      reply = "Emergency assistance requested. Contacting your son Rahul Sharma and Dr. Barua.";
      data = { intent: "emergency_sos", speech_response: reply };
    } else if (lower.includes('game') || lower.includes('khel') || lower.includes('photo') || lower.includes('play')) {
      reply = "Opening Mind Activities and cognitive games now.";
      data = { intent: "navigate_tab", nav_target: "games", speech_response: reply };
    } else if (lower.includes('memory') || lower.includes('album') || lower.includes('yaad')) {
      reply = "Opening your personal Memory Capsule and family photos.";
      data = { intent: "navigate_tab", nav_target: "memory", speech_response: reply };
    } else if (lower.includes('caregiver') || lower.includes('doctor') || lower.includes('dashboard') || lower.includes('portal')) {
      reply = "Opening Caregiver and Doctor Clinical Dashboard.";
      data = { intent: "navigate_mode", nav_target: "caregiver", speech_response: reply };
    } else if (lower.includes('consent') || lower.includes('permission') || lower.includes('circle')) {
      reply = "Opening Care Circle permissions and Digital ID.";
      data = { intent: "navigate_tab", nav_target: "consent", speech_response: reply };
    } else if (lower.includes('profile') || lower.includes('user') || lower.includes('login') || lower.includes('account')) {
      reply = "Opening User Profile & Account Switcher.";
      data = { intent: "navigate_modal", nav_target: "auth", speech_response: reply };
    } else if (lower.includes('water') || lower.includes('paani') || lower.includes('thirsty')) {
      reply = "Water reminder registered. Please have a warm glass of water.";
      data = { intent: "action_need", action: "water_need", speech_response: reply };
    } else if (lower.includes('medicine') || lower.includes('dawai') || lower.includes('schedule') || lower.includes('today')) {
      reply = "Your next tablet is Blood Pressure Amlodipine 5mg at 11:30 AM.";
      data = { intent: "get_schedule", nav_target: "today", speech_response: reply };
    } else if (lower.includes('where') || lower.includes('kahan') || lower.includes('location')) {
      reply = "You are safely at home in Shillong with your family.";
      data = { intent: "location_orientation", nav_target: "today", speech_response: reply };
    }

    const replyBox = document.getElementById('voiceReplyBox');
    if (replyBox) {
      replyBox.innerText = reply;
      replyBox.classList.remove('hidden');
    }

    this.speak(reply);
    this.executeVoiceAction(data);
  }

  injectVoiceModal() {
    if (document.getElementById('voiceAssistantModal')) return;

    const modalHtml = `
      <div id="voiceAssistantModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-3 sm:p-4">
        <div class="bg-surface-container-lowest text-on-surface rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-primary/20 space-y-4 animate-fade-in relative max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-surface-container pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-2xl">mic</span>
              </div>
              <div>
                <h3 class="font-headline-md font-bold text-primary leading-tight">AASRA Voice & Navigation Companion</h3>
                <p class="text-xs text-on-surface-variant font-medium">16 Indic Languages • Voice Navigation Enabled</p>
              </div>
            </div>
            <button onclick="window.voiceAssistant.closeVoiceModal()" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Live Mic Action Button & Waveform -->
          <div class="flex flex-col items-center justify-center py-4 space-y-3 bg-surface-container-low rounded-2xl p-4">
            <button id="modalMicTriggerBtn" onclick="window.voiceAssistant.toggleModalMic()" class="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-xl active:scale-95 transition-transform relative">
              <span class="material-symbols-outlined text-4xl">mic</span>
            </button>
            
            <!-- Animated Soundwave Visualizer -->
            <div id="voiceWaveformAnim" class="hidden items-center justify-center gap-1.5 h-6">
              <span class="w-1.5 h-4 bg-primary rounded-full animate-bounce"></span>
              <span class="w-1.5 h-6 bg-primary rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span class="w-1.5 h-8 bg-primary rounded-full animate-bounce [animation-delay:0.3s]"></span>
              <span class="w-1.5 h-5 bg-primary rounded-full animate-bounce [animation-delay:0.45s]"></span>
              <span class="w-1.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.6s]"></span>
            </div>

            <p id="voiceModalStatus" class="text-xs font-semibold text-primary text-center">
              Tap mic to speak or navigate anywhere with 1 tap below
            </p>
          </div>

          <!-- Live Transcript Box -->
          <div class="bg-surface-container p-3.5 rounded-xl">
            <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Recognized Voice Command:</span>
            <p id="voiceTranscriptBox" class="text-sm font-medium text-on-surface italic min-h-[24px]">
              "Go to Mind Games"
            </p>
          </div>

          <!-- AI Speech Response Box -->
          <div id="voiceReplyBox" class="hidden bg-primary/10 border border-primary/20 p-3.5 rounded-xl text-sm font-semibold text-primary leading-relaxed">
          </div>

          <!-- Voice Navigation Chips Grid -->
          <div>
            <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Voice Navigation Commands:</span>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="window.voiceAssistant.handleVoiceInput('Go to Mind Games')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🧠</span> <span>Go to Mind Games</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('Play math puzzle game')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🪙</span> <span>Play Math Game</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('Open Memory Capsule')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🖼️</span> <span>Open Photo Capsule</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('Open Caregiver Dashboard')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>📊</span> <span>Caregiver Dashboard</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('Open Care Circle Permissions')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🛡️</span> <span>Care Circle & ID</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('Switch User Profile')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>👤</span> <span>Switch Profile</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('What is my schedule today?')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🗓️</span> <span>Today Routine</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('AASRA I need water')" class="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-left text-on-surface flex items-center gap-2 transition-all">
                <span>🚰</span> <span>Need Water</span>
              </button>
              <button onclick="window.voiceAssistant.handleVoiceInput('AASRA HELP ME EMERGENCY')" class="col-span-2 p-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-xs font-bold text-left text-red-800 flex items-center gap-2 transition-all">
                <span>🚨</span> <span>Emergency SOS Voice Trigger</span>
              </button>
            </div>
          </div>

          <!-- Type Command Input -->
          <div class="flex items-center gap-2 pt-1">
            <input type="text" id="voiceTextInput" placeholder="Say or type 'Go to games', 'Open photos'..." class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
            <button onclick="window.voiceAssistant.handleTypedInput()" class="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shrink-0">
              Go
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Enter key listener
    setTimeout(() => {
      const input = document.getElementById('voiceTextInput');
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.handleTypedInput();
          }
        });
      }
    }, 100);
  }

  openVoiceModal() {
    const modal = document.getElementById('voiceAssistantModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeVoiceModal() {
    const modal = document.getElementById('voiceAssistantModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.stopListening();
  }

  toggleModalMic() {
    if (this.isListening) {
      this.stopListening();
    } else {
      if (!this.recognition) {
        this.initSpeechRecognition();
      }
      try {
        if (this.recognition) {
          this.recognition.lang = this.getBcp47Lang(this.currentLang);
          this.recognition.start();
        }
      } catch (e) {
        console.log('Mic start error:', e);
      }
    }
  }

  handleTypedInput() {
    const input = document.getElementById('voiceTextInput');
    if (input && input.value.trim()) {
      const text = input.value.trim();
      input.value = '';
      this.handleVoiceInput(text);
    }
  }

  showToastNotification(title, message) {
    if (typeof showToast === 'function') {
      showToast(title, message);
    }
  }
}

// Instantiate globally on window
window.voiceAssistant = new VoiceAssistantEngine();
