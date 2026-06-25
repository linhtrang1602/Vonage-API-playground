// ── Tab Switching ─────────────────────────────────────────────
const tabs = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('[data-panel]');
const indicator = document.getElementById('tab-indicator');

function switchTab(tabName) {
  tabs.forEach(t => {
    t.classList.toggle('tab-active', t.dataset.tab === tabName);
  });
  panels.forEach(p => {
    p.classList.toggle('hidden', p.dataset.panel !== tabName);
  });
  // Move indicator
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab && indicator) {
    indicator.style.left = activeTab.offsetLeft + 'px';
    indicator.style.width = activeTab.offsetWidth + 'px';
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Initialize first tab
window.addEventListener('load', () => {
  const firstTab = tabs[0];
  if (firstTab) switchTab(firstTab.dataset.tab);
});

// ── WebSocket Client ──────────────────────────────────────────
let ws = null;
let wsReconnectTimer = null;
const wsStatusEl = document.getElementById('ws-status');
const wsStatusDot = document.getElementById('ws-status-dot');
const wsStatusText = document.getElementById('ws-status-text');

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WS] Connected');
    updateWsStatus(true);
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WS] Received:', data);
      handleWebSocketEvent(data);
    } catch (e) {
      console.error('[WS] Parse error:', e);
    }
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected');
    updateWsStatus(false);
    // Auto-reconnect after 3 seconds
    wsReconnectTimer = setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (err) => {
    console.error('[WS] Error:', err);
    ws.close();
  };
}

function updateWsStatus(connected) {
  if (wsStatusDot) {
    wsStatusDot.className = connected
      ? 'w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse'
      : 'w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50';
  }
  if (wsStatusText) {
    wsStatusText.textContent = connected ? 'Connected' : 'Disconnected';
    wsStatusText.className = connected ? 'text-xs text-emerald-400' : 'text-xs text-red-400';
  }
}

function handleWebSocketEvent(data) {
  // Dispatch to messages.js handler
  if (typeof onWebSocketEvent === 'function') {
    onWebSocketEvent(data);
  }
}

// Connect on page load
connectWebSocket();

// ── Toast System ──────────────────────────────────────────────
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

// ── Utility: API Call ─────────────────────────────────────────
async function apiCall(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}