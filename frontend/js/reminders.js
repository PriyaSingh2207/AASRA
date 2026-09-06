/**
 * AASRA Deterministic Reminders & Daily Routine Manager
 * Handles medication status toggles, voice prompts, and adherence scoring.
 */

class RemindersEngine {
  constructor() {
    this.reminders = [];
    this.adherence = {};
    this.nextDue = null;
  }

  async loadReminders() {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      this.reminders = data.reminders || [];
      this.adherence = data.adherence || {};
      this.nextDue = data.next_due || null;

      this.renderPatientReminders();
      this.renderCaregiverReminders();
    } catch (err) {
      console.warn('Error loading reminders:', err);
    }
  }

  async markStatus(remId, newStatus) {
    // Update local state instantly for senior feedback
    const target = this.reminders.find(r => r.id === remId);
    if (target) {
      target.status = newStatus;
    }

    if (window.voiceAssistant && newStatus === 'taken') {
      window.voiceAssistant.speak("Thank you Savitri ji! Marked as taken.");
    }

    if (window.offlineEngine && !window.offlineEngine.isOnline) {
      window.offlineEngine.enqueueAction('UPDATE_REMINDER', { id: remId, status: newStatus });
      this.renderPatientReminders();
    } else {
      try {
        await fetch('/api/reminders/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: remId, status: newStatus })
        });
        await this.loadReminders();
      } catch (err) {
        window.offlineEngine.enqueueAction('UPDATE_REMINDER', { id: remId, status: newStatus });
        this.renderPatientReminders();
      }
    }
  }

  speakPrompt(remId) {
    const r = this.reminders.find(item => item.id === remId);
    if (r && window.voiceAssistant) {
      window.voiceAssistant.speak(r.audio_prompt || r.title);
    }
  }

  renderPatientReminders() {
    const heroContainer = document.getElementById('heroTaskContainer');
    const scheduleContainer = document.getElementById('patientScheduleList');

    if (heroContainer && this.nextDue) {
      heroContainer.innerHTML = `
        <div class="hero-task-card">
          <span class="hero-task-label">⏰ Next Up - ${this.nextDue.time || 'Right Now'}</span>
          <h3 class="hero-task-title">${this.nextDue.title}</h3>
          <p class="hero-task-detail">${this.nextDue.dosage || 'Follow prescribed routine'}</p>
          
          <div class="task-actions">
            <button class="action-btn-taken" onclick="window.remindersEngine.markStatus('${this.nextDue.id}', 'taken')">
              ✓ I Have Taken This
            </button>
            <button class="action-btn-audio" onclick="window.remindersEngine.speakPrompt('${this.nextDue.id}')">
              🔊 Read Aloud
            </button>
          </div>
        </div>
      `;
    }

    if (scheduleContainer) {
      scheduleContainer.innerHTML = this.reminders.map(r => `
        <div class="reminder-item-card ${r.status === 'taken' ? 'taken' : ''}">
          <div class="reminder-time">${r.time}</div>
          <div class="reminder-info">
            <div class="reminder-name">${r.title}</div>
            <div class="reminder-sub">${r.dosage || r.category} | ${r.prescribed_by || ''}</div>
          </div>
          <div>
            ${r.status === 'taken' 
              ? `<span style="color: #10B981; font-weight: 800; font-size: 18px;">✓ Done</span>`
              : `<button class="btn-primary" style="font-size: 15px; padding: 10px 18px;" onclick="window.remindersEngine.markStatus('${r.id}', 'taken')">Mark Done</button>`
            }
          </div>
        </div>
      `).join('');
    }
  }

  renderCaregiverReminders() {
    const container = document.getElementById('caregiverScheduleList');
    if (!container) return;

    container.innerHTML = this.reminders.map(r => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #E2E8F0;">
        <div>
          <strong style="font-size: 16px; color: var(--slate-dark);">${r.title}</strong>
          <div style="font-size: 13px; color: var(--slate-muted);">${r.time} | ${r.dosage}</div>
        </div>
        <div>
          <span class="network-badge" style="background: ${r.status === 'taken' ? '#DCFCE7; color: #15803D;' : '#FEF3C7; color: #B45309;'} font-weight: 700;">
            ${r.status.toUpperCase()}
          </span>
        </div>
      </div>
    `).join('');
  }
}

window.remindersEngine = new RemindersEngine();
