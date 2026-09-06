/**
 * AASRA Authentication & Access Control Controller
 * Supports Patients (PIN / 1-Tap), Family Caregivers, and Doctors.
 */

class AuthController {
  constructor() {
    this.token = localStorage.getItem('aasra_auth_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('aasra_user') || 'null');
    this.profiles = [];
    this.init();
  }

  async init() {
    await this.fetchProfiles();
    if (this.token) {
      await this.verifySession();
    } else {
      // Default to Savitri Devi (Senior Patient) for seamless instant experience
      if (!this.currentUser) {
        this.currentUser = {
          id: 1,
          name: "Savitri Devi",
          role: "patient",
          username: "savitri",
          pin: "8492"
        };
      }
      this.updateHeaderProfileUI();
    }
  }

  async fetchProfiles() {
    try {
      const res = await fetch('/api/auth/profiles');
      const data = await res.json();
      this.profiles = data.profiles || [];
      this.renderProfileSwitchList();
    } catch (e) {
      console.warn('Could not load profiles:', e);
    }
  }

  async verifySession() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.currentUser = data.user;
        localStorage.setItem('aasra_user', JSON.stringify(this.currentUser));
        this.updateHeaderProfileUI();
      } else {
        this.logout();
      }
    } catch (e) {
      console.warn('Session check failed:', e);
    }
  }

  async loginWithPassword(identifier, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || 'Login failed. Please check credentials.');
        return false;
      }
      this.setSession(data.session);
      this.showToast(`Welcome, ${this.currentUser.name}!`, `Signed in as ${this.formatRole(this.currentUser.role)}`);
      this.closeAuthModal();
      return true;
    } catch (e) {
      alert('Network error during login');
      return false;
    }
  }

  async loginWithPIN(pin) {
    try {
      const res = await fetch('/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || 'Incorrect PIN');
        return false;
      }
      this.setSession(data.session);
      this.showToast(`Namaste ${this.currentUser.name} Ji!`, 'Patient Mode Active');
      this.closeAuthModal();
      return true;
    } catch (e) {
      alert('Network error during PIN verification');
      return false;
    }
  }

  async loginWithPairingCode(code) {
    try {
      const res = await fetch('/api/auth/pairing-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || 'Invalid Pairing Code');
        return false;
      }
      this.setSession(data.session);
      this.showToast('Caregiver Connected', `Linked to Patient ${this.currentUser.patient_digital_id || 'AASRA-8921-IND'}`);
      this.closeAuthModal();
      return true;
    } catch (e) {
      alert('Network error during pairing verification');
      return false;
    }
  }

  async registerUser(userData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || 'Registration failed');
        return false;
      }
      this.setSession(data.session);
      this.showToast('Account Created!', `Welcome to AASRA, ${this.currentUser.name}`);
      this.closeAuthModal();
      await this.fetchProfiles();
      return true;
    } catch (e) {
      alert('Network error during registration');
      return false;
    }
  }

  async quickSwitchProfile(userId) {
    const profile = this.profiles.find(p => p.id === userId);
    if (!profile) return;

    // Direct login simulation for seamless 1-tap switching during demo
    if (profile.role === 'patient') {
      await this.loginWithPIN(profile.pin || '8492');
    } else if (profile.role === 'doctor') {
      await this.loginWithPassword(profile.username, 'Doctor@123');
    } else {
      await this.loginWithPassword(profile.username, 'Caregiver@123');
    }
  }

  setSession(session) {
    this.token = session.token;
    this.currentUser = session.user;
    localStorage.setItem('aasra_auth_token', this.token);
    localStorage.setItem('aasra_user', JSON.stringify(this.currentUser));
    this.updateHeaderProfileUI();
  }

  logout() {
    if (this.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      }).catch(() => {});
    }
    this.token = null;
    this.currentUser = {
      id: 1,
      name: "Savitri Devi",
      role: "patient",
      username: "savitri",
      pin: "8492"
    };
    localStorage.removeItem('aasra_auth_token');
    localStorage.setItem('aasra_user', JSON.stringify(this.currentUser));
    this.updateHeaderProfileUI();
    this.showToast("Signed Out", "Switched back to Senior Patient mode");
    this.closeAuthModal();
  }

  updateHeaderProfileUI() {
    const user = this.currentUser || { name: "Savitri Devi", role: "patient" };
    const nameEl = document.getElementById('headerProfileName');
    const roleEl = document.getElementById('headerProfileRole');
    const avatarEl = document.getElementById('headerProfileAvatar');

    if (nameEl) nameEl.innerText = user.name;
    if (roleEl) {
      const roleLabels = {
        'patient': 'Safe & Calm (Patient)',
        'primary_caregiver': 'Primary Caregiver (Family)',
        'doctor': 'Clinical Neurologist (Doctor)',
        'caregiver': 'Care Circle'
      };
      roleEl.innerText = roleLabels[user.role] || this.formatRole(user.role);
    }
    if (avatarEl) {
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarEl.innerText = initials || 'SD';
      if (user.role === 'doctor') {
        avatarEl.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
      } else if (user.role === 'primary_caregiver' || user.role === 'caregiver') {
        avatarEl.style.background = 'linear-gradient(135deg, #D97706, #B45309)';
      } else {
        avatarEl.style.background = 'linear-gradient(135deg, #006064, #137a7f)';
      }
    }
  }

  renderProfileSwitchList() {
    const container = document.getElementById('quickProfileList');
    if (!container) return;

    container.innerHTML = this.profiles.map(p => {
      const isCurrent = this.currentUser && this.currentUser.id === p.id;
      const roleBadges = {
        'patient': '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">Patient</span>',
        'primary_caregiver': '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Family Caregiver</span>',
        'doctor': '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">Doctor</span>'
      };
      return `
        <button onclick="window.authController.quickSwitchProfile(${p.id})" class="w-full p-3 rounded-xl ${isCurrent ? 'bg-primary-container text-on-primary border-2 border-primary' : 'bg-surface-container-low hover:bg-surface-container'} flex items-center justify-between transition-all border border-outline-variant/30 text-left active:scale-98">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center ${isCurrent ? 'bg-surface text-primary' : 'bg-surface-container-high text-on-surface'}">
              ${p.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
            </div>
            <div>
              <div class="font-bold text-sm leading-tight ${isCurrent ? 'text-on-primary' : 'text-on-surface'}">${p.name} ${isCurrent ? '✓' : ''}</div>
              <div class="text-[11px] ${isCurrent ? 'text-on-primary/80' : 'text-on-surface-variant'}">${p.email || p.username}</div>
            </div>
          </div>
          <div>${roleBadges[p.role] || ''}</div>
        </button>
      `;
    }).join('');
  }

  formatRole(role) {
    if (!role) return 'User';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderProfileSwitchList();
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
  }

  showToast(title, subtitle) {
    if (window.showToast) {
      window.showToast(title, subtitle);
    }
  }
}

window.authController = new AuthController();
