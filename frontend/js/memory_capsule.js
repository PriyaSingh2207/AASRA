/**
 * AASRA Memory Capsule Manager
 * Provides personal photo recall, audio story recordings,
 * and family context preservation for senior patients and caregivers.
 */

class MemoryCapsuleManager {
  constructor() {
    this.memories = [];
  }

  async loadMemories() {
    try {
      const res = await fetch('/api/memory-capsule');
      const data = await res.json();
      this.memories = Array.isArray(data) ? data : (data.items || []);
      this.renderCapsuleUI();
    } catch (err) {
      console.warn('Using cached memory capsule:', err);
    }
  }

  renderCapsuleUI() {
    const container = document.getElementById('memoryCapsuleGrid');
    if (!container) return;

    if (this.memories.length === 0) {
      container.innerHTML = `<p style="color: var(--slate-muted);">No memory capsule photos added yet.</p>`;
      return;
    }

    container.innerHTML = this.memories.map(mem => `
      <div class="glass-card" style="padding: 16px; border-radius: var(--radius-md); text-align: left;">
        <img src="${mem.image_url}" alt="${mem.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--primary-teal); text-transform: uppercase;">${mem.relationship || 'Family'}</div>
        <h4 style="font-size: 20px; font-weight: 800; color: var(--slate-dark); margin: 4px 0;">${mem.title}</h4>
        <p style="font-size: 15px; color: var(--slate-muted); margin-bottom: 12px;">${mem.context}</p>
        
        <button class="btn-secondary" style="width: 100%; font-size: 15px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.memoryCapsule.playAudioStory('${mem.id}')">
          🔊 Play Memory Story
        </button>
      </div>
    `).join('');
  }

  playAudioStory(memId) {
    const mem = this.memories.find(m => m.id === memId);
    if (!mem) return;

    const storyText = mem.audio_story || mem.context;
    if (window.voiceAssistant) {
      window.voiceAssistant.speak(`Memory from ${mem.year || 'past'}: ${storyText}`);
    } else {
      alert(`Playing Audio Story:\n"${storyText}"`);
    }
  }
}

window.memoryCapsule = new MemoryCapsuleManager();
