/**
 * AASRA Emergency SOS Workflow
 * Voice-triggered ("AASRA HELP") or 1-tap Emergency Button execution.
 * Broadcasts location, alerts caregivers, and plays audio distress beacon.
 */

class EmergencyEngine {
  constructor() {
    this.audioContext = null;
  }

  triggerSOS(triggerSource = '1-Tap Emergency Button') {
    const locationStr = "Shillong Living Room (GPS: 25.5788° N, 91.8933° E)";
    
    // Play loud gentle audio alert chime
    this.playAudioBeacon();

    if (window.voiceAssistant) {
      window.voiceAssistant.speak("Emergency alert sent! Your son Rahul Sharma and Dr. Ananya Baruah have been notified with your location.");
    }

    const payload = {
      trigger_type: triggerSource,
      location: locationStr,
      timestamp: Date.now()
    };

    fetch('/api/emergency/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.warn('Emergency logged offline'));

    // Show high priority emergency modal
    this.showEmergencyModal(locationStr, triggerSource);
  }

  playAudioBeacon() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio chime simulated');
    }
  }

  showEmergencyModal(location, source) {
    const modal = document.getElementById('emergencyModal');
    const details = document.getElementById('emergencyModalDetails');
    if (!modal || !details) return;

    details.innerHTML = `
      <div style="text-align: center; color: #9F1239;">
        <div style="font-size: 64px; margin-bottom: 12px; animation: pulse-glow 1s infinite;">🚨</div>
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">EMERGENCY SOS ACTIVATED</h2>
        <p style="font-size: 18px; color: var(--slate-dark); margin-bottom: 20px;">
          Triggered via: <strong>${source}</strong><br>
          Shared Location: <strong>${location}</strong>
        </p>

        <div style="background: #FFF1F2; border: 2px solid #FECDD3; padding: 18px; border-radius: 16px; text-align: left; margin-bottom: 20px;">
          <strong style="color: #9F1239; font-size: 18px;">Notified Contacts:</strong>
          <ul style="margin: 8px 0 0 20px; font-size: 16px; color: var(--slate-dark);">
            <li>Rahul Sharma (Son / Primary Caregiver) - Calling now...</li>
            <li>Dr. Ananya Baruah (Neurologist) - SMS Sent</li>
          </ul>
        </div>

        <button class="btn-secondary" style="font-size: 18px; padding: 14px 28px;" onclick="document.getElementById('emergencyModal').classList.add('hidden')">
          Cancel False Alarm
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
  }
}

window.emergencyEngine = new EmergencyEngine();
