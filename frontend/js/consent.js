/**
 * AASRA Consent & Caregiver Credential Manager
 * Patient-first consent enforcement, Digital ID QR generator, and audit logging.
 */

class ConsentManagerUI {
  constructor() {
    this.patient = {};
    this.consent = {};
  }

  async loadConsentData() {
    try {
      const pRes = await fetch('/api/patient');
      this.patient = await pRes.json();

      const cRes = await fetch('/api/consent');
      this.consent = await cRes.json();

      this.renderDigitalIDCard();
      this.renderConsentToggles();
      this.renderAuditLogs();
    } catch (err) {
      console.warn('Error loading consent data:', err);
    }
  }

  renderDigitalIDCard() {
    const container = document.getElementById('digitalIDDisplay');
    if (!container) return;

    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #0F766E, #115E59); color: white; border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-lg);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #A7F3D0; text-transform: uppercase;">AASRA Official Digital ID</div>
            <h3 style="font-size: 26px; font-weight: 800; margin: 4px 0;">${this.patient.name || 'Savitri Devi'}</h3>
            <div style="font-size: 15px; opacity: 0.9;">Age ${this.patient.age || 74} | Shillong, Meghalaya</div>
          </div>
          <div style="background: white; padding: 8px; border-radius: 12px; font-size: 28px;">🪪</div>
        </div>

        <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border-radius: 14px; padding: 14px; margin-bottom: 18px; display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 12px; color: #CCFBF1;">PATIENT DIGITAL ID</div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">${this.patient.digital_id || 'AASRA-8921-IND'}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #FEF3C7;">CAREGIVER CREDENTIAL</div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 1px; color: #F59E0B;">${this.patient.caregiver_credential || 'CG-9942-AUTH'}</div>
          </div>
        </div>

        <div style="font-size: 13px; color: #A7F3D0; display: flex; align-items: center; gap: 8px;">
          <span>🔒 Protected by Patient-First Consent Protocol</span>
        </div>
      </div>
    `;
  }

  renderConsentToggles() {
    const container = document.getElementById('consentTogglesList');
    if (!container) return;

    const items = [
      { key: 'medicine_access', title: 'Medication & Schedule Visibility', desc: 'Allow connected caregiver to see medicine adherence and set reminders' },
      { key: 'cognitive_metrics', title: 'Cognitive Score & Activity Insights', desc: 'Allow caregiver to view game performance trends and support observations' },
      { key: 'memory_capsule_edit', title: 'Memory Capsule Curation', desc: 'Allow caregiver to upload family photos and record voice stories' },
      { key: 'location_sharing', title: 'Emergency Live Location', desc: 'Share approximate home location only during SOS emergency triggers' }
    ];

    container.innerHTML = items.map(item => {
      const isChecked = this.consent[item.key] !== false;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #E2E8F0;">
          <div style="max-width: 80%;">
            <strong style="font-size: 18px; color: var(--slate-dark);">${item.title}</strong>
            <p style="font-size: 14px; color: var(--slate-muted);">${item.desc}</p>
          </div>
          <div>
            <input type="checkbox" id="toggle_${item.key}" ${isChecked ? 'checked' : ''} style="width: 24px; height: 24px; cursor: pointer;" onchange="window.consentUI.updatePermission('${item.key}', this.checked)">
          </div>
        </div>
      `;
    }).join('');
  }

  async updatePermission(key, value) {
    this.consent[key] = value;
    try {
      await fetch('/api/consent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: this.consent, actor: 'Patient (Savitri Devi)' })
      });
      await this.loadConsentData();
    } catch (e) {
      console.warn('Updated consent offline');
    }
  }

  renderAuditLogs() {
    const container = document.getElementById('consentAuditLogList');
    if (!container) return;

    const logs = this.consent.audit_logs || [];
    container.innerHTML = logs.map(l => `
      <div class="audit-item">
        <div>
          <span class="audit-actor">${l.actor}</span>
          <div class="audit-action">${l.action}</div>
        </div>
        <span class="audit-status">${l.status}</span>
      </div>
    `).join('');
  }
}

window.consentUI = new ConsentManagerUI();
