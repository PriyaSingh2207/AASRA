/**
 * AASRA Offline-First Local Storage & Sync Queue Engine
 * Uses LocalStorage / IndexedDB to cache patient data offline
 * and syncs with backend FastAPI services when online.
 */

class OfflineSyncEngine {
  constructor() {
    self.isOnline = navigator.onLine;
    this.storageKey = 'aasra_offline_queue';
    this.cacheKey = 'aasra_local_cache';
    this.initNetworkListeners();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkBadge();
      this.syncPendingQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkBadge();
    });
  }

  updateNetworkBadge() {
    const badge = document.getElementById('networkStatusBadge');
    const dot = document.getElementById('networkDot');
    const label = document.getElementById('networkLabel');
    if (!badge) return;

    if (this.isOnline) {
      dot.className = 'network-dot';
      label.innerText = 'Online (Backend Synced)';
    } else {
      dot.className = 'network-dot offline';
      label.innerText = 'Offline Mode (Local Storage)';
    }
  }

  getQueue() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  }

  enqueueAction(type, payload) {
    const queue = this.getQueue();
    queue.push({
      id: 'evt_' + Date.now(),
      type: type,
      payload: payload,
      timestamp: Date.now()
    });
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
    
    if (this.isOnline) {
      this.syncPendingQueue();
    }
  }

  async syncPendingQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log('Syncing offline queue:', queue.length, 'events');
    const remaining = [];

    for (const item of queue) {
      try {
        if (item.type === 'UPDATE_REMINDER') {
          await fetch('/api/reminders/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
        } else if (item.type === 'ADD_COGNITIVE') {
          await fetch('/api/cognitive/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    localStorage.setItem(this.storageKey, JSON.stringify(remaining));
  }

  saveCache(data) {
    localStorage.setItem(this.cacheKey, JSON.stringify(data));
  }

  getCache() {
    try {
      return JSON.parse(localStorage.getItem(this.cacheKey)) || null;
    } catch (e) {
      return null;
    }
  }
}

window.offlineEngine = new OfflineSyncEngine();
