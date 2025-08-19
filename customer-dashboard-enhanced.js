/* Role for this page */
const ROLE = 'customer';

/* ---- API base & helper -------------------------------------------------- */
const API_BASE = window.location.origin + '/backend';
const api = (path, opts = {}) => {
  const clean = String(path).replace(/^\/?api\/?/, '');
  return fetch(`${API_BASE}/api/${clean}`, { credentials: 'include', ...opts });
};

/* ---- Auth fallback (no login.html redirects) ----------------------------- */
const handleNoAuth = () => {
  if (typeof showLogin === 'function') {
    showLogin();
  } else {
    window.location.href = '/';
  }
};

/* ---- Safe "go to pricing" from any page --------------------------------- */
window.gotoPricing = function () {
  try {
    const u = new URL('index.html', location.href);
    u.hash = 'pricing';
    location.href = u.toString();
  } catch (e) {
    location.href = 'index.html#pricing';
  }
};
// Backward compatibility with old calls
window.showPricingPage = window.gotoPricing;
if (!window.showPricing) window.showPricing = window.gotoPricing;

/* ---- Bootstrap ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth checks if this is a verification page
  if (window.isVerificationPage) {
    console.log('Skipping auth check for verification page');
    return;
  }
  checkAuthAndInit();
});

async function checkAuthAndInit() {
  try {
    const resp = await api('auth/check-auth.php');
    const data = await resp.json();

    if (!data?.authenticated) {
      handleNoAuth();
      return;
    }

    if (data.user?.role !== ROLE) {
      const dest = {
        admin:    'admin-dashboard.html',
        employee: 'employee-dashboard.html',
        customer: 'customer-dashboard.html'
      }[data.user.role] || 'customer-dashboard.html';

      if (!location.pathname.endsWith(dest)) window.location.href = dest;
      return;
    }

    setUserInitials(data.user);
    await loadDashboardData();
  } catch (e) {
    console.error('Auth/init failed:', e);
    handleNoAuth();
  }
}

/* ---- UI helpers ---------------------------------------------------------- */
function setUserInitials(user) {
  const el = document.getElementById('user-initials');
  if (el) {
    const fi = (user?.first_name || '').charAt(0);
    const li = (user?.last_name  || '').charAt(0);
    el.textContent = (fi + li).toUpperCase() || 'A';
  }
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = (val != null ? val : '');
}

/* ---- Page data loaders --------------------------------------------------- */
async function loadDashboardData() {
  if (ROLE === 'customer') {
    await loadCustomerData();
  } else if (ROLE === 'employee') {
    await loadEmployeeData();
  } else if (ROLE === 'admin') {
    await loadAdminData();
  }
}

/* ADMIN: defer to enhanced loader if present */
async function loadAdminData() {
  if (typeof loadEnhancedDashboardData === 'function') {
    return loadEnhancedDashboardData();
  }
}

/* EMPLOYEE (kept for parity, not used on this page) */
async function loadEmployeeData() {
  try {
    const usage        = await api('usage/my-usage.php').then(r => r.json()).catch(() => ({}));
    const subscription = await api('subscription/my-subscription.php').then(r => r.json()).catch(() => ({}));
    updateEmployeeSections(usage, subscription);
  } catch (e) {
    console.error('Employee data load failed:', e);
  }
}
function updateEmployeeSections(usage, subscription) {
  if (usage?.usage) {
    const u = usage.usage;
    setText('conv-used',   u.conversations_used);
    setText('tokens-used', u.tokens_used);
  }
  if (subscription?.subscription) {
    const s = subscription.subscription;
    setText('plan-name',   s.plan_name || '');
    setText('plan-status', s.status    || '');
  }
}

/* ---------------- CUSTOMER ---------------- */
async function loadCustomerData() {
  try {
    const usage        = await api('usage/my-usage.php').then(r => r.json()).catch(() => ({}));
    const subscription = await api('subscription/my-subscription.php').then(r => r.json()).catch(() => ({}));
    const reviews      = await api('public/get-reviews.php').then(r => r.json()).catch(() => ({}));
    updateCustomerSections(usage, subscription, reviews);
  } catch (e) {
    console.error('Customer data load failed:', e);
  }
}

function updateCustomerSections(usage, subscription, reviews) {
  const u = usage?.usage || {};
  const s = subscription?.subscription || null;

  // --- Usage numbers ---
  const used = Number(u.conversations_used || 0);
  setText('conversations-used', used.toLocaleString());

  const limit = Number(u.monthly_limit || u.monthly_conversations || 0);
  const pct = Math.max(0, Math.min(100,
    (isFinite(u.percentage_used) ? Number(u.percentage_used) :
     limit ? (used / limit) * 100 : 0)
  ));
  const bar = document.getElementById('usage-progress');
  if (bar) bar.style.width = `${pct.toFixed(0)}%`;

  // Monthly spend (if API provides it)
  if (u.monthly_spend != null) {
    setText('monthly-spend', `$${Number(u.monthly_spend).toFixed(2)}`);
  }

  // --- Subscription summary / counters ---
  if (s) {
    setText('current-plan', s.plan_name || s.plan_type || '—');

    // Days remaining
    let daysLeft = 0;
    if (s.end_date) {
      const end = new Date(s.end_date);
      const now = new Date();
      daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
    }
    setText('days-remaining', daysLeft);

    // Details card
    const planNameEl  = document.getElementById('plan-name');
    const planPriceEl = document.getElementById('plan-price');
    if (planNameEl)  planNameEl.textContent = s.plan_name || s.plan_type || '—';
    if (planPriceEl) planPriceEl.textContent = `$${Number(s.price || s.monthly_price || 0)}/month`;
  } else {
    setText('current-plan', 'No Plan');
    setText('days-remaining', 0);
  }

  // Reviews (optional; container may not exist on this page)
  if (reviews?.reviews) {
    const container = document.getElementById('my-reviews');
    if (container) {
      container.innerHTML = '';
      reviews.reviews
        .filter(r => r.is_approved)
        .slice(0, 5)
        .forEach(r => {
          const div = document.createElement('div');
          div.className = 'review-mini';
          div.innerHTML = `
            <div class="r-title">${r.title || ''}</div>
            <div class="r-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <div class="r-content">${r.content}</div>
          `;
          container.appendChild(div);
        });
    }
  }
}

/* ---- Support Functions -------------------------------------------------- */
function showProfile() {
  // Navigate to customer profile page
  window.location.href = 'customer-profile.html';
}

function openDocumentation() {
  // Open documentation in new tab (you can replace with your actual docs URL)
  window.open('https://docs.agent-eq.com', '_blank');
  showNotification('Opening documentation in a new tab...', 'info');
}

function contactSupport() {
  // Scroll to contact section on main page
  window.location.href = 'index.html#contact';
  showNotification('Redirecting to contact support section...', 'info');
}

function openForum() {
  // Open community forum (you can replace with your actual forum URL)
  window.open('https://community.agent-eq.com', '_blank');
  showNotification('Opening community forum in a new tab...', 'info');
}

/* ---- Export Functions --------------------------------------------------- */
window.showProfile = showProfile;
window.openDocumentation = openDocumentation;
window.contactSupport = contactSupport;
window.openForum = openForum;
