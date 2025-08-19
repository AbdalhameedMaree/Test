const ROLE = 'customer';

/* ---- API base & helper -------------------------------------------------- */
// Works on localhost and production (uses https automatically on your domain)
const API_BASE = window.location.origin + '/backend';

// Uniform API caller; normalizes paths and always includes credentials (cookies)
const api = (path, opts = {}) => {
  const clean = String(path).replace(/^\/?api\/?/, ''); // avoid /api/api/...
  return fetch(`${API_BASE}/api/${clean}`, {
    credentials: 'include',
    ...opts
  });
};

/* ---- Auth fallback (no login.html redirects) ----------------------------- */
// If you have a login modal function, use it; otherwise fall back to homepage
const handleNoAuth = () => {
  if (typeof showLogin === 'function') {
    showLogin();
  } else {
    window.location.href = '/';
  }
};

/* ---- Bootstrap ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', initProfile);

async function initProfile(){
  try {
    // Check current auth/session state
    const resp = await api('auth/check-auth.php');
    const data = await resp.json();

    // Not authenticated → no login.html redirects
    if (!data?.authenticated) {
      handleNoAuth();
      return;
    }

    // If user role doesn't match this page's role, route to the proper profile page
    if (data.user?.role !== ROLE){
      const dest = {
        admin:    'admin-profile.html',
        employee: 'employee-profile.html',
        customer: 'customer-profile.html'
      }[data.user.role] || 'customer-profile.html';

      if (!location.pathname.endsWith(dest)) window.location.href = dest;
      return;
    }

    // Fill the UI with the fetched user data
    fillProfile(data.user);

  } catch (e) {
    console.error('Auth check failed:', e);
    // Graceful fallback instead of login.html
    handleNoAuth();
  }
}

/* ---- UI helpers ---------------------------------------------------------- */
function fillProfile(user){
  setVal('first_name', user?.first_name || '');
  setVal('last_name',  user?.last_name  || '');
  setVal('email',      user?.email      || '');

  const initialsEl = document.getElementById('user-initials');
  if (initialsEl){
    const fi = (user?.first_name || '').charAt(0);
    const li = (user?.last_name  || '').charAt(0);
    initialsEl.textContent = (fi + li).toUpperCase() || 'A';
  }
}

function setVal(id, val){
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
    el.value = val;
  } else {
    el.textContent = val;
  }
}
