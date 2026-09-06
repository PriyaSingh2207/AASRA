/**
 * AASRA Application Master Controller
 * Orchestrates view navigation, accessibility settings, and component loading.
 */

class AppController {
  constructor() {
    this.currentMode = 'patient'; // 'patient' or 'caregiver'
    this.init();
  }

  async init() {
    this.bindEvents();
    
    // Load initial backend data across components
    if (window.remindersEngine) await window.remindersEngine.loadReminders();
    if (window.memoryCapsule) await window.memoryCapsule.loadMemories();
    if (window.consentUI) await window.consentUI.loadConsentData();
    if (window.caregiverDashboard) await window.caregiverDashboard.loadDashboard();
    
    if (window.offlineEngine) window.offlineEngine.updateNetworkBadge();
  }

  bindEvents() {
    // Mode Switcher Buttons
    const btnPatient = document.getElementById('btnModePatient');
    const btnCaregiver = document.getElementById('btnModeCaregiver');

    if (btnPatient && btnCaregiver) {
      btnPatient.addEventListener('click', () => this.switchMode('patient'));
      btnCaregiver.addEventListener('click', () => this.switchMode('caregiver'));
    }

    // High Contrast Toggle
    const contrastCheck = document.getElementById('highContrastCheck');
    if (contrastCheck) {
      contrastCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }
      });
    }

    // Language Selector
    const langSelect = document.getElementById('languageSelector');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const langCode = e.target.value;
        if (window.voiceAssistant) window.voiceAssistant.setLanguage(langCode);
      });
    }
  }

  switchMode(mode) {
    this.currentMode = mode;

    const patientView = document.getElementById('patientAppView');
    const caregiverView = document.getElementById('caregiverDashboardView');
    const btnPatient = document.getElementById('btnModePatient');
    const btnCaregiver = document.getElementById('btnModeCaregiver');

    if (mode === 'patient') {
      patientView.classList.remove('hidden');
      caregiverView.classList.add('hidden');
      btnPatient.classList.add('active');
      btnCaregiver.classList.remove('active');
      if (window.voiceAssistant) window.voiceAssistant.speak("Switched to Patient Companion Mode");
    } else {
      patientView.classList.add('hidden');
      caregiverView.classList.remove('hidden');
      btnPatient.classList.remove('active');
      btnCaregiver.classList.add('active');
      if (window.caregiverDashboard) window.caregiverDashboard.loadDashboard();
    }
  }

  scrollSchedule() {
    const el = document.getElementById('patientScheduleSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  switchPatientTab(tabName) {
    const tabs = ['today', 'games', 'memory', 'digitalid', 'consent'];
    tabs.forEach(t => {
      const panel = document.getElementById(`tab_panel_${t}`);
      const btn = document.getElementById(`tab_btn_${t}`);
      if (panel) panel.classList.add('hidden');
      if (btn) btn.classList.remove('btn-primary');
      if (btn) btn.classList.add('btn-secondary');
    });

    const activePanel = document.getElementById(`tab_panel_${tabName}`);
    const activeBtn = document.getElementById(`tab_btn_${tabName}`);
    if (activePanel) activePanel.classList.remove('hidden');
    if (activeBtn) {
      activeBtn.classList.remove('btn-secondary');
      activeBtn.classList.add('btn-primary');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
});
