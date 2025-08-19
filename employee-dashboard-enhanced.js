/* ============================================================
   Employee Dashboard Enhanced JS (Final)
   - Auth check (employee only)
   - Load stats, customers, subscriptions, messages
   - Generate reports (Blob/URL)
   - Smooth anchor nav
   - Robust global logout
   ============================================================ */

/* ======================= CONFIG ========================== */
const API_BASE = `${window.location.origin}/backend/api`;

/* ======================= HELPERS ========================= */
const qs = (id) => document.getElementById(id);
const safeNumber = (v, d = 0) => (isNaN(Number(v)) ? d : Number(v));
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function formatDate(s) { try { return new Date(s).toLocaleDateString(); } catch { return s; } }

/**
 * apiFetch(path, { method, headers, body, as })
 * - as: 'json' (default, tolerant), 'blob' (for reports), 'text'
 * - يتسامح مع نقص Content-Type ل JSON ويحاول parse من النص
 */
async function apiFetch(path, options = {}) {
  let clean = String(path || '')
    .replace(/^\/+/, '')
    .replace(/^backend\/?api\/?/, '')
    .replace(/^api\/?/, '');

  const url = `${API_BASE}/${clean}`;
  const as = options.as || 'json';

  const resp = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(as === 'blob' ? { 'Accept': '*/*' } : { 'Accept': 'application/json' }),
      ...(options.headers || {})
    },
    ...options
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(()=> '');
    console.error(`[API] ${url} -> HTTP ${resp.status}`, txt);
    throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  }

  const ct = (resp.headers.get('Content-Type') || '').toLowerCase();

  if (as === 'blob') return resp.blob();
  if (as === 'text') return resp.text();

  // Default: JSON tolerant
  if (ct.includes('application/json')) {
    return resp.json();
  }
  // حاول نحول النص ل JSON (لو الheader ناقص)
  const txt = await resp.text();
  try { return JSON.parse(txt); } catch {
    console.warn(`[API] Expected JSON at ${url} but got:`, ct || 'no content-type');
    return { _raw: txt, _contentType: ct };
  }
}

/* ------------------ Smooth Anchor Nav ------------------ */
function initAnchorNav() {
  const headerOffset = 90;
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const sel = a.getAttribute('href');
      if (!sel || sel === '#') return;
      const target = document.querySelector(sel);
      if (!target) return;
      e.preventDefault();
      const y = window.scrollY + target.getBoundingClientRect().top - headerOffset;
      window.history.pushState({}, '', sel);
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

/* ===================== AUTH CHECK ======================== */
async function checkEmployeeAuth() {
  try {
    const data = await apiFetch('auth/check-auth.php');
    if (!data?.authenticated || !data?.user || data.user.role !== 'employee') {
      window.location.href = 'index.html';
      return false;
    }
    const initials = `${data.user.first_name?.[0] || ''}${data.user.last_name?.[0] || ''}`.toUpperCase();
    const initialsEl = qs('user-initials');
    if (initialsEl) initialsEl.textContent = initials || 'E';
    return true;
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.href = 'index.html';
    return false;
  }
}

/* =================== ROBUST LOGOUT ======================= */
/** global logout مضمونة حتى لو ما كانت موجودة بملف آخر */
window.logout = async function () {
  try { await apiFetch('auth/logout.php', { method: 'POST' }); }
  catch (e) { console.warn('Logout error:', e); }
  finally {
    // كسر الكاش عند الرجوع
    const target = `index.html?logged_out=${Date.now()}`;
    window.location.replace(target);
    setTimeout(() => (window.location.href = target), 250);
  }
};

/* ======================= MAIN =========================== */
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth checks if this is a verification page
  if (window.isVerificationPage) {
    console.log('Skipping employee auth check for verification page');
    return;
  }
  initAnchorNav();
  checkEmployeeAuth().then(ok => { if (ok) loadAll(); });

  // ثبّت ستايل زر اللغة لو نسيته في الـ HTML
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn && !langBtn.classList.contains('lang-btn')) {
    langBtn.classList.add('lang-btn');
  }
});

async function loadAll() {
  await Promise.allSettled([
    loadStats(),
    loadCustomers(),
    loadSubscriptions(),
    loadMessages()
  ]);
}

/* ===================== STATS ============================ */
async function loadStats() {
  try {
    const data = await apiFetch('employee/get-statistics.php');
    if (!data || data._raw) throw new Error('Bad JSON (statistics)');
    const s = data.statistics || {};
    setText('total-customers', s.total_customers ?? 0);
    setText('active-subscriptions', s.active_subscriptions ?? 0);
    setText('pending-messages', s.pending_messages ?? 0);
    setText('monthly-revenue', `$${safeNumber(s.monthly_revenue).toFixed(2)}`);
  } catch (err) {
    console.error('Stats load failed (employee/get-statistics.php):', err);
  }
}
function setText(id, val) { const el = qs(id); if (el) el.textContent = val; }

/* ===================== CUSTOMERS ======================== */
async function loadCustomers() {
  try {
    const data = await apiFetch('employee/get-customers.php');
    if (!data || data._raw) throw new Error('Bad JSON (customers)');
    updateCustomersTable(data.customers || []);
  } catch (err) {
    console.error('Customers load failed (employee/get-customers.php):', err);
  }
}
function updateCustomersTable(items) {
  const tbody = qs('customers-table-body');
  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No customers</td></tr>`;
    return;
  }
  tbody.innerHTML = (items || []).map(c => `
    <tr>
      <td>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.plan_name || '—')}</td>
      <td>${escapeHtml(c.status || 'active')}</td>
      <td>${c.created_at ? formatDate(c.created_at) : ''}</td>
      <td>
        <button class="btn-sm btn-outline" onclick="viewCustomer(${c.id})">View</button>
        <button class="btn-sm btn-primary" onclick="messageCustomer(${c.id})">Message</button>
      </td>
    </tr>
  `).join('');
}
window.viewCustomer = (id) => alert(`View customer #${id} (modal coming soon)`);
window.messageCustomer = (id) => alert(`Message customer #${id} (modal coming soon)`);

/* =================== SUBSCRIPTIONS ====================== */
async function loadSubscriptions() {
  try {
    const data = await apiFetch('employee/get-subscriptions.php');
    if (!data || data._raw) throw new Error('Bad JSON (subscriptions)');
    updateSubscriptionsTable(data.subscriptions || []);
  } catch (err) {
    console.error('Subscriptions load failed (employee/get-subscriptions.php):', err);
  }
}
function updateSubscriptionsTable(items) {
  const tbody = qs('subscriptions-table-body');
  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">No subscriptions</td></tr>`;
    return;
  }
  tbody.innerHTML = (items || []).map(s => {
    const active = !!Number(s.is_active ?? (s.status === 'active'));
    const used = safeNumber(s.conversations_used);
    const limit = safeNumber(s.monthly_conversations);
    const usage = limit ? `${used}/${limit} (${Math.min(100, (used/limit)*100).toFixed(0)}%)` : `${used}`;
    return `
      <tr>
        <td>${escapeHtml(s.customer_name || '')}</td>
        <td>${escapeHtml(s.plan_name || '')}</td>
        <td>${active ? 'Active' : 'Inactive'}</td>
        <td>${s.start_date ? formatDate(s.start_date) : ''}</td>
        <td>${s.end_date ? formatDate(s.end_date) : ''}</td>
        <td>${usage}</td>
        <td>
          <button class="btn-sm btn-outline" onclick="viewSubscription(${s.id})">View</button>
          <button class="btn-sm ${active ? 'btn-warning' : 'btn-success'}"
            onclick="toggleSubscription(${s.id}, ${active})">
            ${active ? 'Pause' : 'Activate'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
window.viewSubscription = (id) => alert(`View subscription #${id} (modal coming soon)`);
async function toggleSubscription(id, isActive) {
  try {
    await apiFetch('employee/update-subscription.php', {
      method: 'POST',
      body: JSON.stringify({ id, is_active: !Boolean(isActive) })
    });
    await Promise.all([loadSubscriptions(), loadStats()]);
  } catch (err) {
    alert('Failed to update subscription');
    console.error(err);
  }
}

/* ====================== MESSAGES ======================== */
async function loadMessages() {
  try {
    const data = await apiFetch('employee/get-messages.php');
    if (!data || data._raw) throw new Error('Bad JSON (messages)');
    updateMessagesTable(data.messages || []);
  } catch (err) {
    console.error('Messages load failed (employee/get-messages.php):', err);
  }
}
function updateMessagesTable(messages) {
  const tbody = qs('messages-table-body');
  if (!tbody) return;
  if (!messages.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No messages</td></tr>`;
    return;
  }
  tbody.innerHTML = (messages || []).map(m => `
    <tr>
      <td>${escapeHtml(m.name || '')}</td>
      <td>${escapeHtml(m.email || '')}</td>
      <td>${escapeHtml(m.company || '')}</td>
      <td>${escapeHtml((m.message || '').slice(0, 120))}${(m.message || '').length > 120 ? '…' : ''}</td>
      <td>${m.created_at ? formatDate(m.created_at) : ''}</td>
      <td>
        <button class="btn-sm btn-outline" onclick="replyMessage(${m.id})">Reply</button>
        <button class="btn-sm btn-danger" onclick="deleteMessage(${m.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}
window.replyMessage = (id) => alert(`Reply to message #${id} (modal coming soon)`);
async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiFetch('employee/delete-message.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    loadMessages();
  } catch (err) {
    alert('Failed to delete message');
    console.error(err);
  }
}

/* ====================== REPORTS ========================= */
/** كل دوال التقارير: نطلب Blob (PDF/CSV/Excel) أو JSON {url} */
async function generateSubscriptionReport() {
  try {
    const res = await apiFetch('employee/reports/subscriptions.php', { as: 'blob', method: 'POST' });
    await handleReportResponse(res, 'subscription-report');
  } catch (err) {
    alert('Failed to generate Subscription Report');
    console.error(err);
  }
}
async function generateCustomerReport() {
  try {
    const res = await apiFetch('employee/reports/customers.php', { as: 'blob', method: 'POST' });
    await handleReportResponse(res, 'customer-report');
  } catch (err) {
    alert('Failed to generate Customer Report');
    console.error(err);
  }
}
async function generateRevenueReport() {
  try {
    const res = await apiFetch('employee/reports/revenue.php', { as: 'blob', method: 'POST' });
    await handleReportResponse(res, 'revenue-report');
  } catch (err) {
    alert('Failed to generate Revenue Report');
    console.error(err);
  }
}

/** يقبل Blob (ملف) أو JSON { url } */
async function handleReportResponse(result, baseName) {
  // Blob مباشر
  if (result instanceof Blob) {
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}${guessExtension(result.type)}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    return;
  }
  // JSON { url }
  if (result && typeof result === 'object' && result.url) {
    window.open(result.url, '_blank');
    return;
  }
  alert('Report generated but response was unexpected.');
}
function guessExtension(mime = '') {
  const m = mime.toLowerCase();
  if (m.includes('pdf')) return '.pdf';
  if (m.includes('csv')) return '.csv';
  if (m.includes('json')) return '.json';
  if (m.includes('excel') || m.includes('spreadsheetml')) return '.xlsx';
  return '';
}
