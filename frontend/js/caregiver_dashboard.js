/**
 * AASRA Caregiver Web Dashboard Controller
 * Displays patient status overview, cognitive domain metrics,
 * AI supportive insights, routine management, and medical vault curation.
 */

class CaregiverDashboardController {
  constructor() {
    this.insights = [];
    this.cognitive = {};
    this.adherence = {};
  }

  async loadDashboard() {
    try {
      const res = await fetch('/api/caregiver/insights');
      const data = await res.json();
      this.insights = data.insights || [];
      this.cognitive = data.cognitive_summary || {};
      this.adherence = data.adherence || {};

      this.renderQuickStats();
      this.renderInsights();
      this.renderCognitiveDomains();
      this.renderMedicalVaultCaregiver();
    } catch (err) {
      console.warn('Error loading caregiver dashboard:', err);
    }
  }

  renderQuickStats() {
    const rateEl = document.getElementById('cgAdherenceRate');
    if (rateEl) {
      rateEl.innerText = `${this.adherence.adherence_rate || 100}%`;
    }
  }

  renderInsights() {
    const container = document.getElementById('caregiverInsightsList');
    if (!container) return;

    if (this.insights.length === 0) {
      container.innerHTML = `<p style="color: var(--slate-muted);">No new observations available.</p>`;
      return;
    }

    container.innerHTML = this.insights.map(ins => `
      <div class="insight-card ${ins.type === 'attention' ? 'attention' : ''}" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--primary-teal); text-transform: uppercase; letter-spacing: 0.5px;">${ins.category || 'Clinical Insight'}</span>
          <span style="font-size: 10px; font-weight: 700; background: #EEF2FF; color: #4338CA; padding: 2px 6px; border-radius: 6px;">⚡ Groq AI</span>
        </div>
        <div class="insight-title">${ins.title}</div>
        <div class="insight-body">${ins.summary}</div>
      </div>
    `).join('');
  }

  renderCognitiveDomains() {
    const container = document.getElementById('caregiverCognitiveDomains');
    if (!container) return;

    const domains = [
      { key: 'recognition', label: 'Recognition & Memory', icon: '🌸' },
      { key: 'attention', label: 'Spatial Focus & Attention', icon: '🎯' },
      { key: 'orientation', label: 'Temporal Orientation', icon: '🌞' },
      { key: 'problem_solving', label: 'Problem Solving', icon: '🔢' }
    ];

    container.innerHTML = domains.map(d => {
      const score = this.cognitive[d.key]?.score || 75;
      const trend = this.cognitive[d.key]?.trend || '+0%';
      return `
        <div class="cognitive-domain-bar">
          <div class="domain-header">
            <span>${d.icon} ${d.label}</span>
            <span style="color: var(--primary-teal-dark);">${score}/100 <small style="color: #10B981;">(${trend})</small></span>
          </div>
          <div class="domain-progress-track">
            <div class="domain-progress-fill" style="width: ${score}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  async renderMedicalVaultCaregiver() {
    const container = document.getElementById('caregiverMedicalVaultList');
    if (!container) return;

    try {
      const res = await fetch('/api/medical-vault');
      const data = await res.json();
      const docs = Array.isArray(data) ? data : (data.documents || []);

      container.innerHTML = docs.map(doc => `
        <div class="glass-card" style="padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--primary-teal);">
          <div style="font-size: 12px; font-weight: 700; color: var(--primary-teal);">${doc.type} | ${doc.date}</div>
          <strong style="font-size: 18px; color: var(--slate-dark);">${doc.title}</strong>
          <div style="font-size: 14px; color: var(--slate-muted); margin-top: 4px;">Doctor: ${doc.doctor} (${doc.hospital})</div>
          <p style="font-size: 14px; color: var(--slate-dark); margin-top: 6px; background: #F8FAFC; padding: 8px; border-radius: 8px;">"${doc.notes}"</p>
        </div>
      `).join('');
    } catch (e) {
      container.innerHTML = '<p>Error loading medical records.</p>';
    }
  }

  async addMedicationReminder() {
    const name = prompt("Enter Medication / Reminder Title:", "Evening BP Pill (Amlodipine 5mg)");
    const time = prompt("Enter Time (e.g. 08:00 PM):", "08:00 PM");
    const dosage = prompt("Enter Dosage instructions:", "1 tablet after dinner");

    if (!name || !time) return;

    const payload = {
      title: name,
      category: "medicine",
      time: time,
      dosage: dosage || "1 tablet",
      prescribed_by: "Rahul Sharma (Caregiver)",
      audio_prompt: `Savitri ji, please take your ${name} now.`
    };

    try {
      await fetch('/api/reminders/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Medication reminder added successfully!');
      if (window.remindersEngine) window.remindersEngine.loadReminders();
    } catch (e) {
      alert('Failed to add reminder');
    }
  }

  async addMemoryCapsuleItem() {
    const title = prompt("Enter Memory Photo Title:", "Guwahati Temple Family Visit");
    const rel = prompt("Relationship / Tag:", "Family Gathering");
    const story = prompt("Audio Story Context:", "Rahul and Priya brought marigolds.");
    const url = prompt("Photo Image URL:", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80");

    if (!title) return;

    const payload = {
      title: title,
      relationship: rel || "Family",
      context: story || "Personal memory",
      year: "2026",
      audio_story: story,
      image_url: url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    };

    try {
      await fetch('/api/memory-capsule/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Memory Capsule photo added!');
      if (window.memoryCapsule) window.memoryCapsule.loadMemories();
    } catch (e) {
      alert('Failed to add memory');
    }
  }
}

window.caregiverDashboard = new CaregiverDashboardController();
