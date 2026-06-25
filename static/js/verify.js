// ── Verify OTP Tab Logic ──────────────────────────────────────
const phoneInput = document.getElementById('verify-phone');
const brandInput = document.getElementById('verify-brand');
const btnSendOtp = document.getElementById('btn-send-otp');
const step2 = document.getElementById('verify-step2');
const otpInput = document.getElementById('verify-otp');
const btnCheckOtp = document.getElementById('btn-check-otp');
const btnCancelOtp = document.getElementById('btn-cancel-otp');
const resultArea = document.getElementById('verify-result');
const debugPanel = document.getElementById('verify-debug');
const debugContent = document.getElementById('verify-debug-content');
const btnToggleDebug = document.getElementById('btn-toggle-debug');

let currentRequestId = null;

// ── Send OTP ──────────────────────────────────────────────────
btnSendOtp.addEventListener('click', async () => {
  const phone = phoneInput.value.trim();
  const brand = brandInput.value.trim() || 'VonageDemo';

  if (!phone) {
    showToast('Vui lòng nhập số điện thoại', 'warning');
    return;
  }

  btnSendOtp.disabled = true;
  btnSendOtp.innerHTML = '<span class="spinner"></span> Đang gửi...';
  setResult('pending', '⏳ Đang gửi OTP...');

  try {
    const res = await apiCall('/api/verify/start', { phone, brand });
    appendDebug('start_verify', res);

    if (res.success) {
      currentRequestId = res.data.request_id;
      step2.classList.remove('hidden');
      step2.classList.add('animate-slide-up');
      otpInput.focus();
      setResult('pending', '⏳ OTP đã gửi – chờ nhập mã');
      showToast('OTP đã được gửi thành công!', 'success');
    } else {
      setResult('error', `❌ ${res.error}`);
      showToast(`Lỗi: ${res.error}`, 'error');
    }
  } catch (e) {
    setResult('error', `❌ ${e.message}`);
    showToast(`Lỗi: ${e.message}`, 'error');
  } finally {
    btnSendOtp.disabled = false;
    btnSendOtp.innerHTML = '🚀 Gửi OTP';
  }
});

// ── Check OTP ─────────────────────────────────────────────────
btnCheckOtp.addEventListener('click', async () => {
  const code = otpInput.value.trim();
  if (!code) {
    showToast('Vui lòng nhập mã OTP', 'warning');
    return;
  }
  if (!currentRequestId) {
    showToast('Chưa có request ID – hãy gửi OTP trước', 'warning');
    return;
  }

  btnCheckOtp.disabled = true;
  btnCheckOtp.innerHTML = '<span class="spinner"></span> Đang kiểm tra...';

  try {
    const res = await apiCall('/api/verify/check', {
      request_id: currentRequestId,
      code,
    });
    appendDebug('check_verify', res);

    if (res.success) {
      setResult('success', '✅ Xác thực thành công!');
      showToast('Xác thực OTP thành công!', 'success');
      resetVerifyFlow();
    } else {
      setResult('error', `❌ ${res.error}`);
      showToast(`Lỗi: ${res.error}`, 'error');
    }
  } catch (e) {
    setResult('error', `❌ ${e.message}`);
    showToast(`Lỗi: ${e.message}`, 'error');
  } finally {
    btnCheckOtp.disabled = false;
    btnCheckOtp.innerHTML = '✔️ Xác nhận';
  }
});

// ── Cancel OTP ────────────────────────────────────────────────
btnCancelOtp.addEventListener('click', async () => {
  if (!currentRequestId) return;

  btnCancelOtp.disabled = true;
  btnCancelOtp.innerHTML = '<span class="spinner"></span> Đang huỷ...';

  try {
    const res = await apiCall('/api/verify/cancel', {
      request_id: currentRequestId,
    });
    appendDebug('cancel_verify', res);

    if (res.success) {
      setResult('cancelled', '🚫 Đã huỷ yêu cầu OTP');
      showToast('Đã huỷ yêu cầu OTP', 'info');
      resetVerifyFlow();
    } else {
      setResult('error', `❌ ${res.error}`);
      showToast(`Lỗi huỷ: ${res.error}`, 'error');
    }
  } catch (e) {
    setResult('error', `❌ ${e.message}`);
    showToast(`Lỗi: ${e.message}`, 'error');
  } finally {
    btnCancelOtp.disabled = false;
    btnCancelOtp.innerHTML = '🚫 Huỷ OTP';
  }
});

// ── Debug Panel Toggle ────────────────────────────────────────
if (btnToggleDebug) {
  btnToggleDebug.addEventListener('click', () => {
    debugPanel.classList.toggle('hidden');
    btnToggleDebug.textContent = debugPanel.classList.contains('hidden')
      ? '🔍 Show Debug'
      : '🔍 Hide Debug';
  });
}

// ── Helpers ───────────────────────────────────────────────────
function setResult(type, message) {
  const colors = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cancelled: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  resultArea.className = `mt-4 p-4 rounded-xl border ${colors[type] || colors.pending} animate-fade-in`;
  resultArea.innerHTML = `<p class="font-medium">${message}</p>`;
  resultArea.classList.remove('hidden');
}

function appendDebug(label, data) {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'mb-3';
  entry.innerHTML = `
    <div class="text-xs text-slate-500 mb-1">${time} — ${label}</div>
    <pre class="text-xs text-slate-300 bg-black/30 p-2 rounded-lg overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
  `;
  debugContent.prepend(entry);
}

function resetVerifyFlow() {
  currentRequestId = null;
  step2.classList.add('hidden');
  otpInput.value = '';
}
