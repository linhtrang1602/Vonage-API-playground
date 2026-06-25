// ── Messages Tab Logic ────────────────────────────────────────
const channelSelect = document.getElementById('msg-channel');
const recipientInput = document.getElementById('msg-recipient');
const messageTextarea = document.getElementById('msg-text');
const btnSendMsg = document.getElementById('btn-send-msg');
const conversationLog = document.getElementById('conversation-log');
const emptyState = document.getElementById('conversation-empty');

// Track sent messages by UUID for status updates
const sentMessages = new Map();

// ── Send Message ──────────────────────────────────────────────
btnSendMsg.addEventListener('click', async () => {
  const to = recipientInput.value.trim();
  const channel = channelSelect.value;
  const text = messageTextarea.value.trim();

  if (!to) {
    showToast('Vui lòng nhập số người nhận', 'warning');
    return;
  }
  if (!text) {
    showToast('Vui lòng nhập nội dung tin nhắn', 'warning');
    return;
  }

  btnSendMsg.disabled = true;
  btnSendMsg.innerHTML = '<span class="spinner"></span> Đang gửi...';

  try {
    const res = await apiCall('/api/messages/send', { to, channel, text });

    if (res.success) {
      const msgId = res.message_id;
      addMessageBubble('out', text, channel, msgId);
      sentMessages.set(msgId, { status: 'sent' });
      messageTextarea.value = '';
      showToast('Tin nhắn đã gửi!', 'success');
    } else {
      showToast(`Lỗi: ${res.error}`, 'error');
    }
  } catch (e) {
    showToast(`Lỗi: ${e.message}`, 'error');
  } finally {
    btnSendMsg.disabled = false;
    btnSendMsg.innerHTML = '📨 Gửi tin';
  }
});

// ── WebSocket Event Handler ───────────────────────────────────
function onWebSocketEvent(data) {
  if (data.type === 'inbound') {
    addMessageBubble('in', data.text, 'reply', null, data.from);
    showToast(`Tin nhắn mới từ ${data.from}`, 'info');
  } else if (data.type === 'status') {
    updateMessageStatus(data.message_uuid, data.status);
  }
}

// ── Add Message Bubble ────────────────────────────────────────
function addMessageBubble(direction, text, channel, msgId, from) {
  // Hide empty state
  if (emptyState) emptyState.classList.add('hidden');

  const bubble = document.createElement('div');
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const isOut = direction === 'out';

  bubble.className = `message-bubble ${isOut ? 'message-out' : 'message-in'} animate-slide-up`;
  if (msgId) bubble.dataset.msgId = msgId;

  const channelIcons = { 
    whatsapp: '💬', 
    sms: '📱', 
    viber_service: '🪀', 
    messenger: '🌐', 
    instagram: '📸',
    reply: '↩️' 
  };
  const icon = channelIcons[channel] || '💬';
  const arrow = isOut ? '➡️' : '⬅️';

  bubble.innerHTML = `
    <div class="flex items-center gap-2 mb-1">
      <span class="text-xs opacity-60">${arrow} ${isOut ? '[out]' : '[in]'}</span>
      <span class="text-xs opacity-60">${time}</span>
      <span class="text-xs">${icon}</span>
      ${from ? `<span class="text-xs text-cyan-400">${from}</span>` : ''}
    </div>
    <p class="text-sm">${escapeHtml(text)}</p>
    ${isOut ? `<div class="mt-1" id="status-${msgId}"><span class="status-badge status-sent">📤 sent</span></div>` : ''}
  `;

  conversationLog.appendChild(bubble);
  conversationLog.scrollTop = conversationLog.scrollHeight;
}

// ── Update Message Status ─────────────────────────────────────
function updateMessageStatus(msgId, status) {
  const statusEl = document.getElementById(`status-${msgId}`);
  if (!statusEl) return;

  const statusConfig = {
    delivered: { icon: '✅', class: 'status-delivered', label: 'delivered' },
    read:      { icon: '👀', class: 'status-read',      label: 'read' },
    failed:    { icon: '❌', class: 'status-failed',    label: 'failed' },
    rejected:  { icon: '🚫', class: 'status-failed',    label: 'rejected' },
    submitted: { icon: '📤', class: 'status-sent',      label: 'submitted' },
  };

  const config = statusConfig[status] || { icon: '❓', class: 'status-sent', label: status };
  statusEl.innerHTML = `<span class="status-badge ${config.class}">${config.icon} ${config.label}</span>`;

  if (sentMessages.has(msgId)) {
    sentMessages.get(msgId).status = status;
  }
}

// ── Escape HTML ───────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('msg-channel').addEventListener('change', function () {
  const label = document.getElementById('msg-recipient-label');
  const input = document.getElementById('msg-recipient');

  if (this.value === 'messenger') {
    label.textContent = 'Recipient ID';
    input.placeholder = '';
  } else {
    label.textContent = 'Phone number';
    input.placeholder = '+8498xxxxxxx';
  }
});