// =================== Password Toggle Functions ===================

function togglePassword(inputId, iconElement) {
  console.log('Toggle password called for:', inputId); // Debug log
  const passwordInput = document.getElementById(inputId);
  
  if (!passwordInput) {
    console.error('Password input not found:', inputId);
    return;
  }
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    iconElement.classList.add('showing');
    console.log('Password shown, icon class added'); // Debug log
  } else {
    passwordInput.type = 'password';
    iconElement.classList.remove('showing');
    console.log('Password hidden, icon class removed'); // Debug log
  }
}

// =================== App Bootstrap & Unified API ===================

// // // Global state
// // let currentUser = null;
// // let currentSubscription = null;
// // let pendingUserId = null;

// // // API base: works on localhost and production; https comes from current origin
// // const API_BASE = window.location.origin + '/backend';

// // // Uniform API caller; normalizes paths and always includes credentials (cookies)
// // const api = (path, opts = {}) => {
// //   const clean = String(path).replace(/^\/?api\/?/, ''); // avoid /api/api/...
// //   return fetch(`${API_BASE}/api/${clean}`, {
// //     credentials: 'include',
// //     ...opts
// //   });
// // };

// // // Graceful auth/home handlers (avoid login.html hard redirects)
// // const handleNoAuth = () => {
// //   if (typeof showLogin === 'function') {
// //     showLogin();
// //   } else {
// //     window.location.href = '/';
// //   }
// // };

// // const goHome = () => {
// //   if (typeof showHome === 'function') {
// //     showHome();
// //   } else {
// //     window.location.href = '/';
// //   }
// // };

// // // =================== Init & UI Effects ===================

// // document.addEventListener('DOMContentLoaded', function() {
// //   checkAuthStatus();
// //   initScrollAnimations();
// // });

// // // Simple intersection-based fade-in
// // function initScrollAnimations() {
// //   const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
// //   const observer = new IntersectionObserver((entries) => {
// //     entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
// //   }, observerOptions);

// //   document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
// // }

// // // =================== Auth ===================

// // async function checkAuthStatus() {
// //   try {
// //     const resp = await api('auth/check-auth.php');
// //     const data = await resp.json();

// //     if (data?.authenticated) {
// //       currentUser = data.user;
// //       updateUIForLoggedInUser();
// //       loadDashboardData();
// //     } else {
// //       updateUIForLoggedOutUser();
// //     }
// //   } catch (error) {
// //     console.error('Auth check failed:', error);
// //     updateUIForLoggedOutUser();
// //   }
// // }

// // async function handleLogin(event) {
// //   event.preventDefault();
// //   const form = event.target;
// //   const formData = new FormData(form);
// //   const loginBtn = document.getElementById('login-btn');
// //   const errorDiv = document.getElementById('login-error');

// //   loginBtn.disabled = true;
// //   loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
// //   errorDiv?.classList.add('hidden');

// //   try {
// //     const resp = await api('auth/login.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         email: formData.get('email'),
// //         password: formData.get('password')
// //       })
// //     });
// //     const data = await resp.json();

// //     if (resp.ok) {
// //       currentUser = data.user;
// //       updateUIForLoggedInUser();
// //       closeModal();
// //       showDashboard();
// //       loadDashboardData();
// //     } else {
// //       if (errorDiv) { errorDiv.textContent = data.error || 'Login failed'; errorDiv.classList.remove('hidden'); }
// //     }
// //   } catch (error) {
// //     if (errorDiv) { errorDiv.textContent = 'Login failed. Please try again.'; errorDiv.classList.remove('hidden'); }
// //   } finally {
// //     loginBtn.disabled = false;
// //     loginBtn.innerHTML = 'Sign In';
// //   }
// // }

// // async function handleRegister(event) {
// //   event.preventDefault();
// //   const form = event.target;
// //   const formData = new FormData(form);
// //   const registerBtn = document.getElementById('register-btn');
// //   const errorDiv = document.getElementById('register-error');
// //   const successDiv = document.getElementById('register-success');

// //   registerBtn.disabled = true;
// //   registerBtn.innerHTML = '<span class="spinner"></span> Creating account...';
// //   errorDiv?.classList.add('hidden');
// //   successDiv?.classList.add('hidden');

// //   try {
// //     const resp = await api('auth/register.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         first_name: formData.get('first_name'),
// //         last_name:  formData.get('last_name'),
// //         email:      formData.get('email'),
// //         password:   formData.get('password')
// //       })
// //     });
// //     const data = await resp.json();

// //     if (resp.ok) {
// //       pendingUserId = data.user_id;
// //       if (successDiv) { successDiv.textContent = data.message || 'Registration successful'; successDiv.classList.remove('hidden'); }
// //       setTimeout(() => { closeModal(); showVerification(); }, 2000);
// //     } else {
// //       if (errorDiv) { errorDiv.textContent = data.error || 'Registration failed'; errorDiv.classList.remove('hidden'); }
// //     }
// //   } catch (error) {
// //     if (errorDiv) { errorDiv.textContent = 'Registration failed. Please try again.'; errorDiv.classList.remove('hidden'); }
// //   } finally {
// //     registerBtn.disabled = false;
// //     registerBtn.innerHTML = 'Create Account';
// //   }
// // }

// // async function handleVerification(event) {
// //   event.preventDefault();
// //   const form = event.target;
// //   const formData = new FormData(form);
// //   const verificationBtn = document.getElementById('verification-btn');
// //   const errorDiv = document.getElementById('verification-error');
// //   const successDiv = document.getElementById('verification-success');

// //   if (!pendingUserId) {
// //     if (errorDiv) { errorDiv.textContent = 'No pending verification found.'; errorDiv.classList.remove('hidden'); }
// //     return;
// //   }

// //   verificationBtn.disabled = true;
// //   verificationBtn.innerHTML = '<span class="spinner"></span> Verifying...';
// //   errorDiv?.classList.add('hidden');
// //   successDiv?.classList.add('hidden');

// //   try {
// //     const resp = await api('auth/verify-email.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         user_id: pendingUserId,
// //         token: formData.get('token')
// //       })
// //     });
// //     const data = await resp.json();

// //     if (resp.ok) {
// //       if (successDiv) { successDiv.textContent = 'Email verified successfully! You can now log in.'; successDiv.classList.remove('hidden'); }
// //       setTimeout(() => { closeModal(); showLogin(); }, 2000);
// //     } else {
// //       if (errorDiv) { errorDiv.textContent = data.error || 'Verification failed'; errorDiv.classList.remove('hidden'); }
// //     }
// //   } catch (error) {
// //     if (errorDiv) { errorDiv.textContent = 'Verification failed. Please try again.'; errorDiv.classList.remove('hidden'); }
// //   } finally {
// //     verificationBtn.disabled = false;
// //     verificationBtn.innerHTML = 'Verify Email';
// //   }
// // }

// // async function logout() {
// //   try {
// //     await api('auth/logout.php', { method: 'POST' });
// //   } catch (error) {
// //     console.error('Logout error:', error);
// //   } finally {
// //     currentUser = null;
// //     currentSubscription = null;
// //     updateUIForLoggedOutUser();
// //     showHome();
// //   }
// // }

// // // =================== Dashboard Data ===================

// // async function loadDashboardData() {
// //   if (!currentUser) return;
// //   try {
// //     const resp = await api('subscription/my-subscription.php');
// //     const data = await resp.json();
// //     if (resp.ok) {
// //       currentSubscription = data.subscription;
// //       updateDashboard(data);
// //     }
// //   } catch (error) {
// //     console.error('Failed to load dashboard data:', error);
// //   }
// // }

// // function updateDashboard(data) {
// //   const conversationsUsed = document.getElementById('conversations-used');
// //   const currentPlan       = document.getElementById('current-plan');
// //   const usageProgress     = document.getElementById('usage-progress');
// //   const subscriptionDetails = document.getElementById('subscription-details');

// //   if (data.subscription) {
// //     const usage = data.usage || {};
// //     if (conversationsUsed) conversationsUsed.textContent = Number(usage.conversations_used || 0).toLocaleString();
// //     if (currentPlan)       currentPlan.textContent = (data.subscription.plan_type || '—').replace(/^./, c => c.toUpperCase());
// //     if (usageProgress)     usageProgress.style.width = `${Math.min(Number(usage.percentage_used || 0), 100)}%`;

// //     if (subscriptionDetails) {
// //       subscriptionDetails.innerHTML = `
// //         <div style="display:grid;gap:1rem;">
// //           <div><strong style="color:var(--primary);">Plan:</strong> <span style="color:var(--text-secondary);">${(data.subscription.plan_type||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
// //           <div><strong style="color:var(--primary);">Status:</strong> <span style="color:var(--accent);">${(data.subscription.status||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
// //           <div><strong style="color:var(--primary);">Monthly Limit:</strong> <span style="color:var(--text-secondary);">${Number(data.subscription.monthly_conversations||0).toLocaleString()} conversations</span></div>
// //           <div><strong style="color:var(--primary);">Price:</strong> <span style="color:var(--text-secondary);">$${Number(data.subscription.price||0)}/month</span></div>
// //           <div class="mt-4" style="display:flex;gap:1rem;flex-wrap:wrap;">
// //             <button class="btn" onclick="showPricing()">Upgrade Plan</button>
// //             <button class="btn-outline btn" onclick="cancelSubscription()">Cancel Subscription</button>
// //           </div>
// //         </div>
// //       `;
// //     }
// //   } else {
// //     if (conversationsUsed) conversationsUsed.textContent = '0';
// //     if (currentPlan)       currentPlan.textContent = 'No Plan';
// //     if (usageProgress)     usageProgress.style.width = '0%';
// //     if (subscriptionDetails) {
// //       subscriptionDetails.innerHTML = `
// //         <p style="color:var(--text-secondary);">No active subscription found.</p>
// //         <button class="btn mt-4" onclick="showPricing()">Choose a Plan</button>
// //       `;
// //     }
// //   }
// // }

// // // =================== Subscription ===================

// // async function cancelSubscription() {
// //   if (!confirm('Are you sure you want to cancel your subscription?')) return;
// //   try {
// //     const resp = await api('subscription/cancel.php', { method: 'POST' });
// //     const data = await resp.json();
// //     if (resp.ok) {
// //       alert('Subscription cancelled successfully.');
// //       loadDashboardData();
// //     } else {
// //       alert(data.error || 'Cancellation failed');
// //     }
// //   } catch (error) {
// //     alert('Cancellation failed. Please try again.');
// //   }
// // }

// // // Unified plan selection → create checkout and redirect
// // async function selectPlan(planId) {
// //   if (!currentUser) { alert('Please login to select a plan'); showLogin(); return; }
// //   try {
// //     const resp = await api('payment/create-checkout.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ plan_id: planId })
// //     });
// //     const data = await resp.json();
// //     if (resp.ok && data?.checkout_url) {
// //       window.location.href = data.checkout_url;
// //     } else {
// //       alert(data.error || 'Failed to create checkout session');
// //     }
// //   } catch (error) {
// //     console.error('Plan selection error:', error);
// //     alert('Failed to select plan');
// //   }
// // }

// // // =================== UI Helpers & Routing ===================

// // function updateUIForLoggedInUser() {
// //   document.getElementById('auth-buttons')?.classList.add('hidden');
// //   document.getElementById('user-menu')?.classList.remove('hidden');

// //   if (currentUser) {
// //     const initials = ((currentUser.first_name||'').charAt(0) + (currentUser.last_name||'').charAt(0)).toUpperCase() || 'A';
// //     const el = document.getElementById('user-initials');
// //     if (el) el.textContent = initials;
// //   }
// // }

// // function updateUIForLoggedOutUser() {
// //   document.getElementById('auth-buttons')?.classList.remove('hidden');
// //   document.getElementById('user-menu')?.classList.add('hidden');
// //   document.getElementById('user-dropdown')?.classList.add('hidden');
// // }

// // function toggleUserDropdown() {
// //   const dropdown = document.getElementById('user-dropdown');
// //   dropdown?.classList.toggle('hidden');
// // }

// // // Modals
// // function showLogin()        { closeModal(); document.getElementById('login-modal')?.classList.remove('hidden'); }
// // function showRegister()     { closeModal(); document.getElementById('register-modal')?.classList.remove('hidden'); }
// // function showVerification() { closeModal(); document.getElementById('verification-modal')?.classList.remove('hidden'); }

// // function closeModal() {
// //   document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
// //   document.getElementById('user-dropdown')?.classList.add('hidden');
// // }

// // // Page navigation
// // function showHome() {
// //   document.getElementById('home-page')?.classList.remove('hidden');
// //   document.getElementById('dashboard-page')?.classList.add('hidden');
// //   closeModal();
// // }

// // function showDashboard() {
// //   if (!currentUser) { showLogin(); return; }
// //   switch (currentUser.role) {
// //     case 'admin':    window.location.href = 'admin-dashboard.html'; break;
// //     case 'employee': window.location.href = 'employee-dashboard.html'; break;
// //     case 'customer': window.location.href = 'customer-dashboard.html'; break;
// //     default:         window.location.href = 'customer-dashboard.html';
// //   }
// // }

// // function showProfile() {
// //   if (!currentUser) { showLogin(); return; }
// //   switch (currentUser.role) {
// //     case 'admin':    window.location.href = 'admin-profile.html'; break;
// //     case 'employee': window.location.href = 'employee-profile.html'; break;
// //     case 'customer': window.location.href = 'customer-profile.html'; break;
// //     default:         window.location.href = 'customer-profile.html';
// //   }
// //   closeModal();
// // }

// // function showPricing() {
// //   showHome();
// //   setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
// // }

// // function contactSales() {
// //   showHome();
// //   setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
// // }

// // // =================== Contact ===================

// // async function submitContact(event) {
// //   event.preventDefault();
// //   const form = event.target;
// //   const formData = new FormData(form);

// //   try {
// //     const resp = await api('contact/submit.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         name:    formData.get('name'),
// //         email:   formData.get('email'),
// //         company: formData.get('company'),
// //         message: formData.get('message')
// //       })
// //     });

// //     const data = await resp.json();
// //     if (resp.ok) {
// //       alert(data.message || 'Message sent!');
// //       form.reset();
// //     } else {
// //       alert(data.error || 'Failed to submit message');
// //     }
// //   } catch (error) {
// //     alert('Failed to submit message. Please try again.');
// //   }
// // }

// // // =================== Events & UX ===================

// // document.addEventListener('click', function(event) {
// //   if (event.target.classList?.contains('modal-overlay')) closeModal();
// // });

// // document.addEventListener('click', function(event) {
// //   const userMenu     = document.getElementById('user-menu');
// //   const userDropdown = document.getElementById('user-dropdown');
// //   if (userMenu && !userMenu.contains(event.target)) userDropdown?.classList.add('hidden');
// // });

// // // Smooth scrolling for nav anchors
// // document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
// //   anchor.addEventListener('click', function (e) {
// //     e.preventDefault();
// //     const target = document.querySelector(this.getAttribute('href'));
// //     if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //   });
// // });

// // // =================== Pricing (Plans & Reviews) ===================

// // async function loadPlans() {
// //   try {
// //     const resp = await api('public/get-plans.php');
// //     const data = await resp.json();
// //     if (data.plans) displayPlans(data.plans);
// //   } catch (error) {
// //     console.error('Failed to load plans:', error);
// //   }
// // }

// // function displayPlans(plans) {
// //   const container = document.getElementById('pricing-plans-container');
// //   if (!container) return;
// //   container.innerHTML = '';

// //   const monthlyPlans = plans.filter(p => p.billing_period === 'monthly');
// //   monthlyPlans.forEach(plan => container.appendChild(createPlanElement(plan)));
// // }

// // function createPlanElement(plan) {
// //   const planDiv = document.createElement('div');
// //   planDiv.className = 'pricing-card';

// //   const nameL = (plan.name || '').toLowerCase();
// //   const isPopular = nameL.includes('professional') || nameL.includes('business standard');

// //   if (isPopular) planDiv.classList.add('featured');

// //   let emoji = '🟢';
// //   if (nameL.includes('professional') || nameL.includes('individual pro')) emoji = '🟠';
// //   else if (nameL.includes('business standard')) emoji = '🟡';
// //   else if (nameL.includes('business plus'))    emoji = '🔵';
// //   else if (nameL.includes('enterprise'))       emoji = nameL.includes('max') ? '🔴🔴' : '🔴';

// //   planDiv.innerHTML = `
// //     <div class="plan-header">
// //       <div class="plan-emoji">${emoji}</div>
// //       <div class="plan-name">${plan.name}</div>
// //       ${isPopular ? '<div class="popular-badge" data-translate="popular">Popular</div>' : ''}
// //     </div>
// //     <div class="plan-price">$${plan.price}<span class="plan-period">/${plan.billing_period}</span></div>
// //     <ul class="plan-features">
// //       ${(plan.features || []).map(f => `<li>${f}</li>`).join('')}
// //     </ul>
// //     <button class="btn" onclick="selectPlan(${plan.id})" style="width:100%;" data-translate="selectPlan">
// //       Select Plan
// //     </button>
// //   `;
// //   return planDiv;
// // }

// // // Load plans & reviews on DOM ready (in addition to auth init)
// // document.addEventListener('DOMContentLoaded', function() { loadPlans(); loadReviews(); });

// // async function loadReviews() {
// //   try {
// //     const resp = await api('public/get-reviews.php');
// //     const data = await resp.json();
// //     if (data.reviews) displayReviews(data.reviews);
// //   } catch (error) {
// //     console.error('Failed to load reviews:', error);
// //   }
// // }

// // function displayReviews(reviews) {
// //   const container = document.getElementById('customer-reviews-container');
// //   if (!container) return;

// //   const existing = container.innerHTML;
// //   const reviewsHTML = (reviews || []).slice(0, 6).map(r => {
// //     const stars = '⭐'.repeat(Number(r.rating || 0));
// //     return `
// //       <div class="customer-card">
// //         <div class="review-rating">${stars}</div>
// //         <h3>${r.name || ''}</h3>
// //         <h4 style="color:var(--primary);margin:.5rem 0;">${r.title || ''}</h4>
// //         <p>${r.content || ''}</p>
// //       </div>
// //     `;
// //   }).join('');

// //   container.innerHTML = existing + reviewsHTML;
// // }

// // =================== App Bootstrap & Unified API ===================

// // Global state
// let currentUser = null;
// let currentSubscription = null;
// let pendingUserId = null;

// // API base: works on localhost and production; https comes from current origin
// const API_BASE = window.location.origin + '/backend';

// // Uniform API caller; normalizes paths and always includes credentials (cookies)
// const api = (path, opts = {}) => {
//   const clean = String(path).replace(/^\/?api\/?/, ''); // avoid /api/api/...
//   return fetch(`${API_BASE}/api/${clean}`, {
//     credentials: 'include',
//     ...opts
//   });
// };

// // Graceful auth/home handlers (avoid login.html hard redirects)
// const handleNoAuth = () => {
//   if (typeof showLogin === 'function') {
//     showLogin();
//   } else {
//     window.location.href = '/';
//   }
// };

// const goHome = () => {
//   if (typeof showHome === 'function') {
//     showHome();
//   } else {
//     window.location.href = '/';
//   }
// };

// // =================== Init & UI Effects ===================

// document.addEventListener('DOMContentLoaded', function () {
//   checkAuthStatus();
//   initScrollAnimations();
//   loadPlans();
//   loadReviews();
// });

// // Simple intersection-based fade-in
// function initScrollAnimations() {
//   const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
//   }, observerOptions);

//   document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
// }

// // =================== Auth ===================

// async function checkAuthStatus() {
//   try {
//     const resp = await api('auth/check-auth.php');
//     const data = await resp.json();

//     if (data?.authenticated) {
//       currentUser = data.user;
//       updateUIForLoggedInUser();
//       loadDashboardData();
//     } else {
//       updateUIForLoggedOutUser();
//     }
//   } catch (error) {
//     console.error('Auth check failed:', error);
//     updateUIForLoggedOutUser();
//   }
// }

// async function handleLogin(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);
//   const loginBtn = document.getElementById('login-btn');
//   const errorDiv = document.getElementById('login-error');

//   loginBtn.disabled = true;
//   loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
//   errorDiv?.classList.add('hidden');

//   try {
//     const resp = await api('auth/login.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         email: formData.get('email'),
//         password: formData.get('password')
//       })
//     });
//     const data = await resp.json();

//     if (resp.ok) {
//       currentUser = data.user;
//       updateUIForLoggedInUser();
//       closeModal();
//       showDashboard();
//       loadDashboardData();
//     } else {
//       if (errorDiv) { errorDiv.textContent = data.error || 'Login failed'; errorDiv.classList.remove('hidden'); }
//     }
//   } catch (error) {
//     if (errorDiv) { errorDiv.textContent = 'Login failed. Please try again.'; errorDiv.classList.remove('hidden'); }
//   } finally {
//     loginBtn.disabled = false;
//     loginBtn.innerHTML = 'Sign In';
//   }
// }

// async function handleRegister(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);
//   const registerBtn = document.getElementById('register-btn');
//   const errorDiv = document.getElementById('register-error');
//   const successDiv = document.getElementById('register-success');

//   registerBtn.disabled = true;
//   registerBtn.innerHTML = '<span class="spinner"></span> Creating account...';
//   errorDiv?.classList.add('hidden');
//   successDiv?.classList.add('hidden');

//   try {
//     const resp = await api('auth/register.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         first_name: formData.get('first_name'),
//         last_name:  formData.get('last_name'),
//         email:      formData.get('email'),
//         password:   formData.get('password')
//       })
//     });
//     const data = await resp.json();

//     if (resp.ok) {
//       pendingUserId = data.user_id;
//       if (successDiv) { successDiv.textContent = data.message || 'Registration successful'; successDiv.classList.remove('hidden'); }
//       setTimeout(() => { closeModal(); showVerification(); }, 1200);
//     } else {
//       if (errorDiv) { errorDiv.textContent = data.error || 'Registration failed'; errorDiv.classList.remove('hidden'); }
//     }
//   } catch (error) {
//     if (errorDiv) { errorDiv.textContent = 'Registration failed. Please try again.'; errorDiv.classList.remove('hidden'); }
//   } finally {
//     registerBtn.disabled = false;
//     registerBtn.innerHTML = 'Create Account';
//   }
// }

// async function handleVerification(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);
//   const verificationBtn = document.getElementById('verification-btn');
//   const errorDiv = document.getElementById('verification-error');
//   const successDiv = document.getElementById('verification-success');

//   if (!pendingUserId) {
//     if (errorDiv) { errorDiv.textContent = 'No pending verification found.'; errorDiv.classList.remove('hidden'); }
//     return;
//   }

//   verificationBtn.disabled = true;
//   verificationBtn.innerHTML = '<span class="spinner"></span> Verifying...';
//   errorDiv?.classList.add('hidden');
//   successDiv?.classList.add('hidden');

//   try {
//     const resp = await api('auth/verify-email.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         user_id: pendingUserId,
//         token: formData.get('token')
//       })
//     });
//     const data = await resp.json();

//     if (resp.ok) {
//       if (successDiv) { successDiv.textContent = 'Email verified successfully! You can now log in.'; successDiv.classList.remove('hidden'); }
//       setTimeout(() => { closeModal(); showLogin(); }, 1200);
//     } else {
//       if (errorDiv) { errorDiv.textContent = data.error || 'Verification failed'; errorDiv.classList.remove('hidden'); }
//     }
//   } catch (error) {
//     if (errorDiv) { errorDiv.textContent = 'Verification failed. Please try again.'; errorDiv.classList.remove('hidden'); }
//   } finally {
//     verificationBtn.disabled = false;
//     verificationBtn.innerHTML = 'Verify Email';
//   }
// }

// async function handleForgotPassword(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);
//   const errorDiv = document.getElementById('forgot-error');
//   const successDiv = document.getElementById('forgot-success');

//   errorDiv?.classList.add('hidden');
//   successDiv?.classList.add('hidden');

//   try {
//     const resp = await api('auth/forgot-password.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email: formData.get('email') })
//     });
//     const data = await resp.json();

//     if (resp.ok) {
//       if (successDiv) { successDiv.textContent = data.message || 'We sent you a reset link/code.'; successDiv.classList.remove('hidden'); }
//     } else {
//       if (errorDiv) { errorDiv.textContent = data.error || 'Failed to send reset email'; errorDiv.classList.remove('hidden'); }
//     }
//   } catch (error) {
//     if (errorDiv) { errorDiv.textContent = 'Failed to send reset email. Please try again.'; errorDiv.classList.remove('hidden'); }
//   }
// }

// async function logout() {
//   try {
//     await api('auth/logout.php', { method: 'POST' });
//   } catch (error) {
//     console.error('Logout error:', error);
//   } finally {
//     currentUser = null;
//     currentSubscription = null;
//     updateUIForLoggedOutUser();
//     showHome();
//   }
// }

// // =================== Dashboard Data ===================

// async function loadDashboardData() {
//   if (!currentUser) return;
//   try {
//     const resp = await api('subscription/my-subscription.php');
//     const data = await resp.json();
//     if (resp.ok) {
//       currentSubscription = data.subscription;
//       updateDashboard(data);
//     }
//   } catch (error) {
//     console.error('Failed to load dashboard data:', error);
//   }
// }

// function updateDashboard(data) {
//   const conversationsUsed = document.getElementById('conversations-used');
//   const currentPlan       = document.getElementById('current-plan');
//   const usageProgress     = document.getElementById('usage-progress');
//   const subscriptionDetails = document.getElementById('subscription-details');

//   if (data.subscription) {
//     const usage = data.usage || {};
//     if (conversationsUsed) conversationsUsed.textContent = Number(usage.conversations_used || 0).toLocaleString();
//     if (currentPlan)       currentPlan.textContent = (data.subscription.plan_type || '—').replace(/^./, c => c.toUpperCase());
//     if (usageProgress)     usageProgress.style.width = `${Math.min(Number(usage.percentage_used || 0), 100)}%`;

//     if (subscriptionDetails) {
//       subscriptionDetails.innerHTML = `
//         <div style="display:grid;gap:1rem;">
//           <div><strong style="color:var(--primary);">Plan:</strong> <span style="color:var(--text-secondary);">${(data.subscription.plan_type||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
//           <div><strong style="color:var(--primary);">Status:</strong> <span style="color:var(--accent);">${(data.subscription.status||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
//           <div><strong style="color:var(--primary);">Monthly Limit:</strong> <span style="color:var(--text-secondary);">${Number(data.subscription.monthly_conversations||0).toLocaleString()} conversations</span></div>
//           <div><strong style="color:var(--primary);">Price:</strong> <span style="color:var(--text-secondary);">$${Number(data.subscription.price||0)}/month</span></div>
//           <div class="mt-4" style="display:flex;gap:1rem;flex-wrap:wrap;">
//             <button class="btn" onclick="showPricing()">Upgrade Plan</button>
//             <button class="btn-outline btn" onclick="cancelSubscription()">Cancel Subscription</button>
//           </div>
//         </div>
//       `;
//     }
//   } else {
//     if (conversationsUsed) conversationsUsed.textContent = '0';
//     if (currentPlan)       currentPlan.textContent = 'No Plan';
//     if (usageProgress)     usageProgress.style.width = '0%';
//     if (subscriptionDetails) {
//       subscriptionDetails.innerHTML = `
//         <p style="color:var(--text-secondary);">No active subscription found.</p>
//         <button class="btn mt-4" onclick="showPricing()">Choose a Plan</button>
//       `;
//     }
//   }
// }

// // =================== Subscription ===================

// async function cancelSubscription() {
//   if (!confirm('Are you sure you want to cancel your subscription?')) return;
//   try {
//     const resp = await api('subscription/cancel.php', { method: 'POST' });
//     const data = await resp.json();
//     if (resp.ok) {
//       alert('Subscription cancelled successfully.');
//       loadDashboardData();
//     } else {
//       alert(data.error || 'Cancellation failed');
//     }
//   } catch (error) {
//     alert('Cancellation failed. Please try again.');
//   }
// }

// // Unified plan selection → create checkout and redirect
// async function selectPlan(planId) {
//   if (!currentUser) { alert('Please login to select a plan'); showLogin(); return; }
//   try {
//     const resp = await api('payment/create-checkout.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ plan_id: planId })
//     });
//     const data = await resp.json();
//     if (resp.ok && data?.checkout_url) {
//       window.location.href = data.checkout_url;
//     } else {
//       alert(data.error || 'Failed to create checkout session');
//     }
//   } catch (error) {
//     console.error('Plan selection error:', error);
//     alert('Failed to select plan');
//   }
// }

// // =================== UI Helpers & Routing ===================

// function updateUIForLoggedInUser() {
//   document.getElementById('auth-buttons')?.classList.add('hidden');
//   document.getElementById('user-menu')?.classList.remove('hidden');

//   if (currentUser) {
//     const initials = ((currentUser.first_name||'').charAt(0) + (currentUser.last_name||'').charAt(0)).toUpperCase() || 'A';
//     const el = document.getElementById('user-initials');
//     if (el) el.textContent = initials;
//   }
// }

// function updateUIForLoggedOutUser() {
//   document.getElementById('auth-buttons')?.classList.remove('hidden');
//   document.getElementById('user-menu')?.classList.add('hidden');
//   document.getElementById('user-dropdown')?.classList.add('hidden');
// }

// function toggleUserDropdown() {
//   const dropdown = document.getElementById('user-dropdown');
//   dropdown?.classList.toggle('hidden');
// }

// // Modals
// function showLogin()        { closeModal(); document.getElementById('login-modal')?.classList.remove('hidden'); }
// function showRegister()     { closeModal(); document.getElementById('register-modal')?.classList.remove('hidden'); }
// function showVerification() { closeModal(); document.getElementById('verification-modal')?.classList.remove('hidden'); }

// function openForgotPasswordModal() {
//   closeModal();
//   document.getElementById('forgot-password-modal')?.classList.remove('hidden');
// }
// function closeForgotPasswordModal() {
//   document.getElementById('forgot-password-modal')?.classList.add('hidden');
// }

// function closeModal() {
//   document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
//   document.getElementById('user-dropdown')?.classList.add('hidden');
// }

// // Page navigation
// function showHome() {
//   document.getElementById('home-page')?.classList.remove('hidden');
//   document.getElementById('dashboard-page')?.classList.add('hidden');
//   closeModal();
// }

// function showDashboard() {
//   if (!currentUser) { showLogin(); return; }
//   switch (currentUser.role) {
//     case 'admin':    window.location.href = 'admin-dashboard.html'; break;
//     case 'employee': window.location.href = 'employee-dashboard.html'; break;
//     case 'customer': window.location.href = 'customer-dashboard.html'; break;
//     default:         window.location.href = 'customer-dashboard.html';
//   }
// }

// function showProfile() {
//   if (!currentUser) { showLogin(); return; }
//   switch (currentUser.role) {
//     case 'admin':    window.location.href = 'admin-profile.html'; break;
//     case 'employee': window.location.href = 'employee-profile.html'; break;
//     case 'customer': window.location.href = 'customer-profile.html'; break;
//     default:         window.location.href = 'customer-profile.html';
//   }
//   closeModal();
// }

// function showPricing() {
//   showHome();
//   setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
// }

// function contactSales() {
//   showHome();
//   setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
// }

// // =================== Contact ===================

// async function submitContact(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);

//   try {
//     const resp = await api('contact/submit.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name:    formData.get('name'),
//         email:   formData.get('email'),
//         company: formData.get('company'),
//         message: formData.get('message')
//       })
//     });

//     const data = await resp.json();
//     if (resp.ok) {
//       alert(data.message || 'Message sent!');
//       form.reset();
//     } else {
//       alert(data.error || 'Failed to submit message');
//     }
//   } catch (error) {
//     alert('Failed to submit message. Please try again.');
//   }
// }

// // =================== Events & UX ===================

// // Close modal when clicking overlay
// document.addEventListener('click', function (event) {
//   if (event.target.classList?.contains('modal-overlay')) closeModal();
// });

// // Hide user dropdown on outside click
// document.addEventListener('click', function (event) {
//   const userMenu     = document.getElementById('user-menu');
//   const userDropdown = document.getElementById('user-dropdown');
//   if (userMenu && !userMenu.contains(event.target)) userDropdown?.classList.add('hidden');
// });

// // Smooth scrolling for nav anchors
// document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
//   anchor.addEventListener('click', function (e) {
//     e.preventDefault();
//     const target = document.querySelector(this.getAttribute('href'));
//     if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   });
// });

// // Password toggle via [data-toggle-password] (no auto-injection)
// document.addEventListener('click', (e) => {
//   const btn = e.target.closest('[data-toggle-password]');
//   if (!btn) return;
//   const selector = btn.getAttribute('data-toggle-password');
//   const input = document.querySelector(selector);
//   if (!input) return;

//   const show = input.type === 'password';
//   input.type = show ? 'text' : 'password';
//   btn.textContent = show ? 'Hide' : 'Show';
// });

// // =================== Pricing (Plans & Reviews) ===================

// async function loadPlans() {
//   try {
//     const resp = await api('public/get-plans.php');
//     const data = await resp.json();
//     if (data.plans) displayPlans(data.plans);
//   } catch (error) {
//     console.error('Failed to load plans:', error);
//   }
// }

// function displayPlans(plans) {
//   const container = document.getElementById('pricing-plans-container');
//   if (!container) return;
//   container.innerHTML = '';

//   const monthlyPlans = plans.filter(p => p.billing_period === 'monthly');
//   monthlyPlans.forEach(plan => container.appendChild(createPlanElement(plan)));
// }

// function createPlanElement(plan) {
//   const planDiv = document.createElement('div');
//   planDiv.className = 'pricing-card';

//   const nameL = (plan.name || '').toLowerCase();
//   const isPopular = nameL.includes('professional') || nameL.includes('business standard');

//   if (isPopular) planDiv.classList.add('featured');

//   let emoji = '🟢';
//   if (nameL.includes('professional') || nameL.includes('individual pro')) emoji = '🟠';
//   else if (nameL.includes('business standard')) emoji = '🟡';
//   else if (nameL.includes('business plus'))    emoji = '🔵';
//   else if (nameL.includes('enterprise'))       emoji = nameL.includes('max') ? '🔴🔴' : '🔴';

//   planDiv.innerHTML = `
//     <div class="plan-header">
//       <div class="plan-emoji">${emoji}</div>
//       <div class="plan-name">${plan.name}</div>
//       ${isPopular ? '<div class="popular-badge" data-translate="popular">Popular</div>' : ''}
//     </div>
//     <div class="plan-price">$${plan.price}<span class="plan-period">/${plan.billing_period}</span></div>
//     <ul class="plan-features">
//       ${(plan.features || []).map(f => `<li>${f}</li>`).join('')}
//     </ul>
//     <button class="btn" onclick="selectPlan(${plan.id})" style="width:100%;" data-translate="selectPlan">
//       Select Plan
//     </button>
//   `;
//   return planDiv;
// }

// async function loadReviews() {
//   try {
//     const resp = await api('public/get-reviews.php');
//     const data = await resp.json();
//     if (data.reviews) displayReviews(data.reviews);
//   } catch (error) {
//     console.error('Failed to load reviews:', error);
//   }
// }

// function displayReviews(reviews) {
//   const container = document.getElementById('customer-reviews-container');
//   if (!container) return;

//   const reviewsHTML = (reviews || []).slice(0, 6).map(r => {
//     const stars = '⭐'.repeat(Number(r.rating || 0));
//     return `
//       <div class="customer-card">
//         <div class="review-rating">${stars}</div>
//         <h3>${r.name || ''}</h3>
//         <h4 style="color:var(--primary);margin:.5rem 0;">${r.title || ''}</h4>
//         <p>${r.content || ''}</p>
//       </div>
//     `;
//   }).join('');

//   container.innerHTML = reviewsHTML;
// }

/* ============================================================
   Site Script (Unified & Resilient)
   - Global auth state (home/customer-facing pages)
   - Unified API fetch with automatic fallback:
       1) /backend/api/<path>
       2) /backend/<path>
   - Home page data loaders (plans/reviews) with graceful errors
   - Auth flows: login, register, verify, forgot password, logout
   - Dashboard snippet (if present in DOM)
   - UI helpers: modals, smooth scroll, password toggle
   ============================================================ */

/* ======================= GLOBAL STATE ======================= */
let currentUser = null;
let currentSubscription = null;
let pendingUserId = null;

/* ==================== API (with fallback) =================== */
// Back-end base
const SITE_API_BASE = window.location.origin + '/backend';

/**
 * siteApi(path, opts)
 * - يجرب تلقائياً:
 *   1) /backend/api/<path>
 *   2) /backend/<path>
 * - يرجّع Response لو نجحت أي محاولة
 */
async function siteApi(path, opts = {}) {
  const clean = String(path || '')
    .replace(/^\/+/, '')
    .replace(/^backend\/?api\/?/, '')
    .replace(/^api\/?/, ''); // avoid /api/api...

  const tryUrls = [
    `${SITE_API_BASE}/api/${clean}`,
  ];

  let lastErr;
  for (const url of tryUrls) {
    try {
      console.log('[siteApi] Trying URL:', url);
      const resp = await fetch(url, {
        credentials: 'include',
        ...opts
      });
      console.log('[siteApi] Response status:', resp.status, 'for URL:', url);
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        console.error('[siteApi] Error response:', txt.slice(0, 500));
        throw new Error(`HTTP ${resp.status} ${resp.statusText} @ ${url} -> ${txt.slice(0, 200)}`);
      }
      console.log('[siteApi] Success:', url);
      return resp;
    } catch (e) {
      console.error('[siteApi] Failed attempt for URL:', url, 'Error:', e.message);
      lastErr = e;
      // جرّب التالي
    }
  }
  console.error('[siteApi] All attempts failed for:', clean, lastErr);
  throw lastErr;
}

// Backward-compat: expose as `api`
const api = siteApi;

/* ================ INIT & SCROLL ANIMATIONS ================== */

document.addEventListener('DOMContentLoaded', function () {
  // شغّل تأثيرات الظهور
  initScrollAnimations();

  // تحقق من حالة الدخول (آمن لجميع الصفحات)
  checkAuthStatus();

  // حمّل بيانات الهوم فقط إذا عناصرها موجودة
  const hasPlans   = document.getElementById('pricing-plans-container');
  const hasReviews = document.getElementById('customer-reviews-container');
  if (hasPlans || hasReviews) {
    loadPlans();
    loadReviews();
  }
});

// Intersection-based fade-in
function initScrollAnimations() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ========================= AUTH ========================== */

async function checkAuthStatus() {
  try {
    const resp = await api('auth/check-auth.php');
    const data = await resp.json().catch(() => ({}));

    if (data?.authenticated) {
      currentUser = data.user;
      updateUIForLoggedInUser();
      loadDashboardData();
    } else {
      updateUIForLoggedOutUser();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    updateUIForLoggedOutUser();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const loginBtn = document.getElementById('login-btn');
  const errorDiv = document.getElementById('login-error');

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
  }
  errorDiv?.classList.add('hidden');

  try {
    const resp = await api('auth/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });
    const data = await resp.json().catch(() => ({}));

    if (data?.user) {
      currentUser = data.user;
      updateUIForLoggedInUser();
      closeModal();
      
      // Show success animation then redirect to dashboard
      showSuccessAnimation('login', () => {
        showDashboard();
        loadDashboardData();
      });
    } else {
      if (errorDiv) { errorDiv.textContent = data.error || 'Login failed'; errorDiv.classList.remove('hidden'); }
    }
  } catch (error) {
    if (errorDiv) { errorDiv.textContent = 'Login failed. Please try again.'; errorDiv.classList.remove('hidden'); }
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Sign In';
    }
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const registerBtn = document.getElementById('register-btn');
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');

  if (registerBtn) {
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="spinner"></span> Creating account...';
  }
  errorDiv?.classList.add('hidden');
  successDiv?.classList.add('hidden');

  try {
    console.log('Starting registration...', {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: '***' // Don't log actual password
    });

    const resp = await api('auth/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: formData.get('first_name'),
        last_name:  formData.get('last_name'),
        email:      formData.get('email'),
        password:   formData.get('password')
      })
    });

    console.log('Registration response status:', resp.status);
    
    // Get the response text first, then try to parse as JSON
    const responseText = await resp.text();
    console.log('Raw response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Registration response data:', data);
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      console.log('Response was not JSON, content:', responseText.slice(0, 500));
      throw new Error('Server returned invalid JSON response. Check server logs for PHP errors.');
    }

    if (resp.ok && data?.user_id) {
      pendingUserId = data.user_id;
      console.log('Registration successful, user ID:', pendingUserId);
      if (successDiv) { 
        successDiv.textContent = data.message || 'Registration successful'; 
        successDiv.classList.remove('hidden'); 
      }
      
      // Close modal and show verification (no animation for registration)
      closeModal(); 
      showVerification();
    } else {
      console.error('Registration failed:', data);
      const errorMessage = data?.error || `Registration failed (Status: ${resp.status})`;
      if (errorDiv) { 
        errorDiv.textContent = errorMessage; 
        errorDiv.classList.remove('hidden'); 
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.message || 'Registration failed. Please try again.';
    if (errorDiv) { 
      errorDiv.textContent = errorMessage; 
      errorDiv.classList.remove('hidden'); 
    }
  } finally {
    if (registerBtn) {
      registerBtn.disabled = false;
      registerBtn.innerHTML = 'Create Account';
    }
  }
}

async function handleVerification(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const verificationBtn = document.getElementById('verification-btn');
  const errorDiv = document.getElementById('verification-error');
  const successDiv = document.getElementById('verification-success');

  if (!pendingUserId) {
    if (errorDiv) { errorDiv.textContent = 'No pending verification found.'; errorDiv.classList.remove('hidden'); }
    return;
  }

  if (verificationBtn) {
    verificationBtn.disabled = true;
    verificationBtn.innerHTML = '<span class="spinner"></span> Verifying...';
  }
  errorDiv?.classList.add('hidden');
  successDiv?.classList.add('hidden');

  try {
    const resp = await api('auth/verify-email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: pendingUserId,
        token: formData.get('token')
      })
    });
    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      if (successDiv) { successDiv.textContent = 'Email verified successfully! You can now log in.'; successDiv.classList.remove('hidden'); }
      setTimeout(() => { closeModal(); showLogin(); }, 1200);
    } else {
      if (errorDiv) { errorDiv.textContent = data.error || 'Verification failed'; errorDiv.classList.remove('hidden'); }
    }
  } catch (error) {
    if (errorDiv) { errorDiv.textContent = 'Verification failed. Please try again.'; errorDiv.classList.remove('hidden'); }
  } finally {
    if (verificationBtn) {
      verificationBtn.disabled = false;
      verificationBtn.innerHTML = 'Verify Email';
    }
  }
}

// async function handleForgotPassword(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);
//   const errorDiv = document.getElementById('forgot-error');
//   const successDiv = document.getElementById('forgot-success');

//   errorDiv?.classList.add('hidden');
//   successDiv?.classList.add('hidden');

//   try {
//     const resp = await api('api/auth/forgot-password.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email: formData.get('email') })
//     });
//     const data = await resp.json().catch(() => ({}));

//     if (resp.ok) {
//       if (successDiv) { successDiv.textContent = data.message || 'We sent you a reset link/code.'; successDiv.classList.remove('hidden'); }
//     } else {
//       if (errorDiv) { errorDiv.textContent = data.error || 'Failed to send reset email'; errorDiv.classList.remove('hidden'); }
//     }
//   } catch (error) {
//     if (errorDiv) { errorDiv.textContent = 'Failed to send reset email. Please try again.'; errorDiv.classList.remove('hidden'); }
//   }
// }

// يُستخدم من صفحات أخرى (admin/employee) أيضاً
async function logout() {
  try {
    await api('auth/logout.php', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    currentUser = null;
    currentSubscription = null;
    updateUIForLoggedOutUser();
    
    // Show logout notification
    showNotification('You have been successfully signed out. Thank you for using AgentEQ!', 'success');
    
    // Redirect to main page after a brief delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
}

/* ===================== DASHBOARD DATA ==================== */

async function loadDashboardData() {
  if (!currentUser) return;
  try {
    const resp = await api('subscription/my-subscription.php');
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      currentSubscription = data.subscription;
      updateDashboard(data);
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

function updateDashboard(data) {
  const conversationsUsed   = document.getElementById('conversations-used');
  const currentPlan         = document.getElementById('current-plan');
  const usageProgress       = document.getElementById('usage-progress');
  const subscriptionDetails = document.getElementById('subscription-details');

  if (data.subscription) {
    const usage = data.usage || {};
    if (conversationsUsed) conversationsUsed.textContent = Number(usage.conversations_used || 0).toLocaleString();
    if (currentPlan)       currentPlan.textContent = (data.subscription.plan_type || '—').replace(/^./, c => c.toUpperCase());
    if (usageProgress)     usageProgress.style.width = `${Math.min(Number(usage.percentage_used || 0), 100)}%`;

    if (subscriptionDetails) {
      subscriptionDetails.innerHTML = `
        <div style="display:grid;gap:1rem;">
          <div><strong style="color:var(--primary);">Plan:</strong> <span style="color:var(--text-secondary);">${(data.subscription.plan_type||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
          <div><strong style="color:var(--primary);">Status:</strong> <span style="color:var(--accent);">${(data.subscription.status||'—').replace(/^./,c=>c.toUpperCase())}</span></div>
          <div><strong style="color:var(--primary);">Monthly Limit:</strong> <span style="color:var(--text-secondary);">${Number(data.subscription.monthly_conversations||0).toLocaleString()} conversations</span></div>
          <div><strong style="color:var(--primary);">Price:</strong> <span style="color:var(--text-secondary);">$${Number(data.subscription.price||0)}/month</span></div>
          <div class="mt-4" style="display:flex;gap:1rem;flex-wrap:wrap;">
            <button class="btn" onclick="showPricing()">Upgrade Plan</button>
            <button class="btn-outline btn" onclick="cancelSubscription()">Cancel Subscription</button>
          </div>
        </div>
      `;
    }
  } else {
    if (conversationsUsed) conversationsUsed.textContent = '0';
    if (currentPlan)       currentPlan.textContent = 'No Plan';
    if (usageProgress)     usageProgress.style.width = '0%';
    if (subscriptionDetails) {
      subscriptionDetails.innerHTML = `
        <p style="color:var(--text-secondary);">No active subscription found.</p>
        <button class="btn mt-4" onclick="showPricing()">Choose a Plan</button>
      `;
    }
  }
}

/* ===================== SUBSCRIPTION ====================== */

async function cancelSubscription() {
  if (!confirm('Are you sure you want to cancel your subscription?')) return;
  try {
    const resp = await api('subscription/cancel.php', { method: 'POST' });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      showNotification('Your subscription has been successfully cancelled. You will continue to have access until the end of your current billing period.', 'success');
      loadDashboardData();
    } else {
      showNotification(data.error || 'We encountered an issue while processing your cancellation request. Please contact our support team for assistance.', 'error');
    }
  } catch (error) {
    showNotification('Unable to process your cancellation request at this time. Please check your internet connection and try again, or contact support if the issue persists.', 'error');
  }
}

// Unified plan selection → create checkout and redirect
async function selectPlan(planId) {
  if (!currentUser) { 
    showNotification('Please sign in to your account to select a subscription plan and continue with your purchase.', 'warning'); 
    showLogin(); 
    return; 
  }
  try {
    const resp = await api('payment/create-checkout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId })
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data?.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      showNotification(data.error || 'We were unable to create your checkout session. Please try again or contact our support team if the issue persists.', 'error');
    }
  } catch (error) {
    console.error('Plan selection error:', error);
    showNotification('There was an error processing your plan selection. Please check your internet connection and try again.', 'error');
  }
}

/* ================= UI HELPERS & ROUTING ================= */

function updateUIForLoggedInUser() {
  document.getElementById('auth-buttons')?.classList.add('hidden');
  document.getElementById('user-menu')?.classList.remove('hidden');

  if (currentUser) {
    const initials = ((currentUser.first_name||'').charAt(0) + (currentUser.last_name||'').charAt(0)).toUpperCase() || 'A';
    const el = document.getElementById('user-initials');
    if (el) el.textContent = initials;
  }
}

function updateUIForLoggedOutUser() {
  document.getElementById('auth-buttons')?.classList.remove('hidden');
  document.getElementById('user-menu')?.classList.add('hidden');
  document.getElementById('user-dropdown')?.classList.add('hidden');
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown?.classList.toggle('hidden');
}

// Modals
function showLogin()        { closeModal(); document.getElementById('login-modal')?.classList.remove('hidden'); }
function showRegister()     { closeModal(); document.getElementById('register-modal')?.classList.remove('hidden'); }
function showVerification() { closeModal(); document.getElementById('verification-modal')?.classList.remove('hidden'); }

function openForgotPasswordModal() {
  closeModal();
  document.getElementById('forgot-password-modal')?.classList.remove('hidden');
}
function closeForgotPasswordModal() {
  document.getElementById('forgot-password-modal')?.classList.add('hidden');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  document.getElementById('user-dropdown')?.classList.add('hidden');
}

// Page navigation
function showHome() {
  document.getElementById('home-page')?.classList.remove('hidden');
  document.getElementById('dashboard-page')?.classList.add('hidden');
  closeModal();
}

function showDashboard() {
  if (!currentUser) { showLogin(); return; }
  switch (currentUser.role) {
    case 'admin':    window.location.href = 'admin-dashboard.html'; break;
    case 'employee': window.location.href = 'employee-dashboard.html'; break;
    case 'customer': window.location.href = 'customer-dashboard.html'; break;
    default:         window.location.href = 'customer-dashboard.html';
  }
}

function showProfile() {
  if (!currentUser) { showLogin(); return; }
  switch (currentUser.role) {
    case 'admin':    window.location.href = 'admin-profile.html'; break;
    case 'employee': window.location.href = 'employee-profile.html'; break;
    case 'customer': window.location.href = 'customer-profile.html'; break;
    default:         window.location.href = 'customer-profile.html';
  }
  closeModal();
}

function showPricing() {
  showHome();
  setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
}

function contactSales() {
  showHome();
  setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
}

/* ======================= CONTACT ======================== */

async function submitContact(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  submitButton.style.opacity = '0.7';

  try {
    console.log('Submitting contact form...'); // Debug log
    
    const resp = await api('contact/submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    formData.get('name'),
        email:   formData.get('email'),
        company: formData.get('company'),
        message: formData.get('message')
      })
    });

    const data = await resp.json().catch(() => ({}));
    
    if (resp.ok) {
      // Success feedback
      console.log('Contact form submitted successfully'); // Debug log
      showNotification(data.message || 'Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
      form.reset();
    } else {
      console.error('Contact form submission failed:', data.error); // Debug log
      showNotification(data.error || 'Failed to submit message. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Contact form error:', error); // Debug log
    showNotification('Failed to submit message. Please check your connection and try again.', 'error');
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    submitButton.style.opacity = '1';
  }
}

// Enhanced Professional Notification System
function showNotification(message, type = 'info', duration = 5000) {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.professional-notification');
  existingNotifications.forEach(notification => notification.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `professional-notification notification-${type}`;
  
  // Professional styling
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1.2rem 1.8rem;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    font-size: 0.95rem;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 420px;
    word-wrap: break-word;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
  `;

  // Set colors and icons based on type
  let iconHtml = '';
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    iconHtml = '<svg style="width: 18px; height: 18px; margin-right: 8px; vertical-align: -3px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    iconHtml = '<svg style="width: 18px; height: 18px; margin-right: 8px; vertical-align: -3px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>';
  } else if (type === 'warning') {
    notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    iconHtml = '<svg style="width: 18px; height: 18px; margin-right: 8px; vertical-align: -3px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
  } else {
    notification.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    iconHtml = '<svg style="width: 18px; height: 18px; margin-right: 8px; vertical-align: -3px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
  }

  // Add close button
  const closeBtn = '<button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 16px; line-height: 1;">&times;</button>';
  
  notification.innerHTML = `${closeBtn}<div style="display: flex; align-items: flex-start;">${iconHtml}<span>${message}</span></div>`;
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Auto remove after specified duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }
  }, duration);

  // Add click to dismiss
  notification.addEventListener('click', (e) => {
    if (e.target !== notification.querySelector('button')) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }
  });
}

/* ====================== SUCCESS ANIMATION SYSTEM ===================== */

function showSuccessAnimation(type = 'default', callback = null) {
  // Configuration for different animation types
  const animationConfig = {
    login: {
      title: 'Welcome Back!',
      description: 'You have successfully signed in to your AgentEQ account. Get ready to transform your customer experience with AI automation.',
    },
    signup: {
      title: 'Welcome to AgentEQ!',
      description: 'Your account has been created successfully. Discover the power of AI-driven customer experience automation.',
    },
    subscribe: {
      title: 'Subscription Activated!',
      description: 'Thank you for subscribing! Your new plan is now active and ready to supercharge your business with AI automation.',
    },
    default: {
      title: 'Success!',
      description: 'Your action has been completed successfully. Welcome to the future of AI automation.',
    }
  };

  const config = animationConfig[type] || animationConfig.default;

  // Create overlay HTML
  const overlayHTML = `
    <div class="success-animation-overlay" id="success-animation-overlay">
      <div class="success-animation-container">
        <button class="success-animation-skip" onclick="closeSuccessAnimation()">Skip</button>
        
        <video 
          class="success-animation-video" 
          autoplay 
          muted 
          playsinline
          onended="onAnimationVideoEnded()"
        >
          <source src="Agent-eq-animation.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        <div class="success-animation-content">
          <h2 class="success-animation-title">${config.title}</h2>
          <p class="success-animation-description">${config.description}</p>
          <button class="success-animation-close" onclick="closeSuccessAnimation()">
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove any existing overlay
  const existingOverlay = document.getElementById('success-animation-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Add overlay to page
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // Store callback for later use
  window.successAnimationCallback = callback;

  // Show overlay with animation
  setTimeout(() => {
    const overlay = document.getElementById('success-animation-overlay');
    if (overlay) {
      overlay.classList.add('show');
    }
  }, 100);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeSuccessAnimation() {
  const overlay = document.getElementById('success-animation-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = ''; // Restore body scroll
      
      // Execute callback if provided
      if (typeof window.successAnimationCallback === 'function') {
        window.successAnimationCallback();
        window.successAnimationCallback = null;
      }
    }, 500);
  }
}

function onAnimationVideoEnded() {
  // Video has finished playing - automatically close the overlay
  console.log('Success animation video ended');
  
  // Wait a moment then close the animation
  setTimeout(() => {
    closeSuccessAnimation();
  }, 500);
}

// Make functions globally available
window.showSuccessAnimation = showSuccessAnimation;
window.closeSuccessAnimation = closeSuccessAnimation;
window.onAnimationVideoEnded = onAnimationVideoEnded;

/* ====================== EVENTS & UX ===================== */

// Close modal when clicking overlay
document.addEventListener('click', function (event) {
  if (event.target.classList?.contains('modal-overlay')) closeModal();
});

// Hide user dropdown on outside click
document.addEventListener('click', function (event) {
  const userMenu     = document.getElementById('user-menu');
  const userDropdown = document.getElementById('user-dropdown');
  if (userMenu && !userMenu.contains(event.target)) userDropdown?.classList.add('hidden');
});

// Smooth scrolling for nav anchors
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Password toggle via [data-toggle-password]
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle-password]');
  if (!btn) return;
  const selector = btn.getAttribute('data-toggle-password');
  const input = document.querySelector(selector);
  if (!input) return;

  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Hide' : 'Show';
});

/* ============== PRICING (Plans & Reviews) =============== */

async function loadPlans() {
  const container = document.getElementById('pricing-plans-container');
  if (!container) return;

  try {
    const resp = await api('public/get-plans.php');
    const data = await resp.json().catch(() => ({}));

    if (Array.isArray(data?.plans) && data.plans.length) {
      displayPlans(data.plans);
    } else {
      container.innerHTML = `<div class="muted">No plans found.</div>`;
      console.warn('[loadPlans] No plans in response:', data);
    }
  } catch (error) {
    console.error('Failed to load plans:', error);
    container.innerHTML = `<div class="muted">Failed to load plans.</div>`;
  }
}

function displayPlans(plans) {
  const container = document.getElementById('pricing-plans-container');
  if (!container) return;
  container.innerHTML = '';

  const monthlyPlans = plans.filter(p => p.billing_period === 'monthly');
  monthlyPlans.forEach(plan => container.appendChild(createPlanElement(plan)));
}

function createPlanElement(plan) {
  const planDiv = document.createElement('div');
  planDiv.className = 'pricing-card';

  const nameL = (plan.name || '').toLowerCase();
  const isPopular = nameL.includes('professional') || nameL.includes('business standard');

  if (isPopular) planDiv.classList.add('featured');

  let emoji = '🟢';
  if (nameL.includes('professional') || nameL.includes('individual pro')) emoji = '🟠';
  else if (nameL.includes('business standard')) emoji = '🟡';
  else if (nameL.includes('business plus'))    emoji = '🔵';
  else if (nameL.includes('enterprise'))       emoji = nameL.includes('max') ? '🔴🔴' : '🔴';

  planDiv.innerHTML = `
    <div class="plan-header">
      <div class="plan-emoji">${emoji}</div>
      <div class="plan-name">${plan.name}</div>
      ${isPopular ? '<div class="popular-badge" data-translate="popular">Popular</div>' : ''}
    </div>
    <div class="plan-price">$${plan.price}<span class="plan-period">/${plan.billing_period}</span></div>
    <ul class="plan-features">
      ${(plan.features || []).map(f => `<li>${f}</li>`).join('')}
    </ul>
    <button class="btn" onclick="selectPlan(${plan.id})" style="width:100%;" data-translate="selectPlan">
      Select Plan
    </button>
  `;
  return planDiv;
}

async function loadReviews() {
  const container = document.getElementById('customer-reviews-container');
  if (!container) return;

  try {
    const resp = await api('public/get-reviews.php');
    const data = await resp.json().catch(() => ({}));

    if (Array.isArray(data?.reviews) && data.reviews.length) {
      displayReviews(data.reviews);
    } else {
      container.innerHTML = `<div class="muted">No reviews yet.</div>`;
      console.warn('[loadReviews] No reviews in response:', data);
    }
  } catch (error) {
    console.error('Failed to load reviews:', error);
    container.innerHTML = `<div class="muted">Failed to load reviews.</div>`;
  }
}

function displayReviews(reviews) {
  const container = document.getElementById('customer-reviews-container');
  if (!container) return;

  const reviewsHTML = (reviews || []).slice(0, 6).map(r => {
    const stars = '⭐'.repeat(Number(r.rating || 0));
    return `
      <div class="customer-card">
        <div class="review-rating">${stars}</div>
        <h3>${r.name || ''}</h3>
        <h4 style="color:var(--primary);margin:.5rem 0;">${r.title || ''}</h4>
        <p>${r.content || ''}</p>
      </div>
    `;
  }).join('');

  container.innerHTML = reviewsHTML;
}

async function resendVerificationCode() {
  if (!pendingUserId) {
    showNotification('No pending verification found. Please register again or contact support if you continue to experience issues.', 'warning');
    return;
  }

  try {
    const resp = await api('auth/resend-verification.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: pendingUserId })
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      showNotification(data.message || 'A new verification code has been sent to your email address. Please check your inbox and spam folder.', 'success');
      startResendCountdown(); 
    } else {
      showNotification(data.error || 'We were unable to resend your verification code. Please try again in a few moments or contact support.', 'error');
    }
  } catch (error) {
    showNotification('There was a network error while trying to resend your verification code. Please check your internet connection and try again.', 'error');
  }
}


let resendCooldown = 60;
let resendInterval;

function startResendCountdown() {
  const btn = document.getElementById('resend-btn');

  if (!btn || btn.disabled) return;

  btn.disabled = true;
  btn.textContent = `Resend in ${resendCooldown}s`;

  clearInterval(resendInterval); // 🔐 تأكد من إلغاء أي عداد سابق
  resendInterval = setInterval(() => {
    resendCooldown--;
    btn.textContent = `Resend in ${resendCooldown}s`;
    if (resendCooldown <= 0) {
      clearInterval(resendInterval);
      btn.disabled = false;
      btn.textContent = 'Resend Code';
      resendCooldown = 60;
    }
  }, 1000);
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('forgot-email').value;

  const resp = await api('auth/request-reset.php', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

  const data = await resp.json().catch(() => ({}));
  if (resp.ok) {
    showNotification(data.message || 'A password reset code has been sent to your email address. Please check your inbox and spam folder.', 'success');
    // showResetPasswordModal();
    setTimeout(showResetPasswordModal, 0);
  } else {
    showNotification(data.error || 'We were unable to send a reset code to that email address. Please verify the email is correct and try again.', 'error');
  }
}

function showResetPasswordModal() {
  closeModal();
  document.getElementById('reset-password-modal')?.classList.remove('hidden');
}

function closeResetPasswordModal() {
  document.getElementById('reset-password-modal')?.classList.add('hidden');
}

async function handleResetPassword(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email')?.value;
  const code = document.getElementById('reset-code')?.value;
  const newPassword = document.getElementById('new-password')?.value;

  const errorDiv = document.getElementById('reset-error');
  const successDiv = document.getElementById('reset-success');
  errorDiv?.classList.add('hidden');
  successDiv?.classList.add('hidden');

  try {
    const resp = await api('auth/reset-password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code, new_password: newPassword })
    });
    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      successDiv.textContent = data.message || 'Password changed successfully.';
      successDiv.classList.remove('hidden');
      setTimeout(() => { closeResetPasswordModal(); showLogin(); }, 2000);
    } else {
      errorDiv.textContent = data.error || 'Reset failed. Please try again.';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'Something went wrong.';
    errorDiv.classList.remove('hidden');
  }
}


async function submitNewPassword(email, token, newPassword) {
  const resp = await api('auth/reset-password.php', {
    method: 'POST',
    body: JSON.stringify({ email, token, new_password: newPassword })
  });

  const data = await resp.json().catch(() => ({}));
  if (resp.ok) {
    showNotification(data.message || 'Your password has been successfully updated. You can now use your new password to sign in.', 'success');
    closeModal();
  } else {
    showNotification(data.error || 'Failed to update password. Please verify the information and try again.', 'error');
  }
}

/* ==================== MISSING CORE FUNCTIONS =================== */

function toggleLanguage() {
  // Get current language from page or default to English
  const currentLang = document.documentElement.lang || 'en';
  const newLang = currentLang === 'en' ? 'ar' : 'en';
  
  // Update document language
  document.documentElement.lang = newLang;
  
  // Update language toggle button text
  const langButtons = document.querySelectorAll('#lang-toggle, #lang-toggle-user');
  langButtons.forEach(btn => {
    if (btn) {
      btn.textContent = newLang === 'en' ? 'العربية' : 'English';
    }
  });
  
  // Store language preference
  localStorage.setItem('preferred-language', newLang);
  
  showNotification(`Language changed to ${newLang === 'en' ? 'English' : 'العربية'}`, 'success', 2000);
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function showHome() {
  // Close any open modals
  closeModal();
  
  // If we're not on the home page, navigate there
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
    window.location.href = 'index.html';
    return;
  }
  
  // Hide any modal overlays
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => modal.classList.add('hidden'));
  
  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLogin() {
  closeModal();
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.classList.remove('hidden');
  }
}

function showRegister() {
  closeModal();
  const registerModal = document.getElementById('register-modal');
  if (registerModal) {
    registerModal.classList.remove('hidden');
  }
}

function showPricing() {
  // Close any modals
  closeModal();
  
  // If we're not on the home page, navigate there with pricing hash
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
    window.location.href = 'index.html#pricing';
    return;
  }
  
  // Scroll to pricing section
  const pricingSection = document.getElementById('pricing') || document.querySelector('[data-section="pricing"]');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    // If pricing section not found, try to navigate to home page with hash
    window.location.href = 'index.html#pricing';
  }
}

function showDashboard() {
  // Redirect to appropriate dashboard based on user role
  if (currentUser) {
    const role = currentUser.role || 'customer';
    const dashboardUrls = {
      'admin': 'admin-dashboard.html',
      'employee': 'employee-dashboard.html',
      'customer': 'customer-dashboard.html'
    };
    window.location.href = dashboardUrls[role] || 'customer-dashboard.html';
  } else {
    showNotification('Please sign in to access your dashboard', 'warning');
    showLogin();
  }
}

function showProfile() {
  // Navigate to profile page based on user role
  if (currentUser) {
    const role = currentUser.role || 'customer';
    if (role === 'customer') {
      window.location.href = 'customer-profile.html';
    } else {
      // For admin/employee, could redirect to customer profile or create specific profile pages
      window.location.href = 'customer-profile.html';
    }
  } else {
    showNotification('Please sign in to access your profile', 'warning');
    showLogin();
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.classList.add('hidden');
  });
}

function resendVerificationCode() {
  if (!pendingUserId) {
    showNotification('No pending verification found. Please register again.', 'error');
    return;
  }
  
  showNotification('Verification code resent successfully!', 'success');
  // TODO: Implement actual resend verification API call
  console.log('Resend verification code for user:', pendingUserId);
}

function closeResetPasswordModal() {
  const modal = document.getElementById('reset-password-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function gotoPricing() {
  try {
    const u = new URL('index.html', location.href);
    u.hash = 'pricing';
    location.href = u.toString();
  } catch (e) {
    location.href = 'index.html#pricing';
  }
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

// Admin placeholder functions that show implementation messages
function showAddEmployeeModal() {
  showNotification('Add Employee feature is being implemented. This will open a modal to add new employees to the system.', 'info');
  console.log('Add Employee modal requested');
}

function showAddUserModal() {
  showNotification('Add User feature is being implemented. This will open a modal to add new users to the system.', 'info');
  console.log('Add User modal requested');
}

function showAddPlanModal() {
  showNotification('Add Plan feature is being implemented. This will open a modal to create new subscription plans.', 'info');
  console.log('Add Plan modal requested');
}

function showAddReviewModal() {
  showNotification('Add Review feature is being implemented. This will open a modal to add new customer reviews.', 'info');
  console.log('Add Review modal requested');
}

function editEmployee(id) {
  showNotification(`Edit Employee feature is being implemented. Employee ID: ${id}`, 'info');
  console.log('Edit employee', id);
}

function deleteEmployee(id) {
  if (confirm('Delete this employee?')) {
    showNotification(`Delete Employee feature is being implemented. Employee ID: ${id}`, 'info');
    console.log('Delete employee', id);
  }
}

function editUser(id) {
  showNotification(`Edit User feature is being implemented. User ID: ${id}`, 'info');
  console.log('Edit user', id);
}

function deleteUser(id) {
  if (confirm('Delete this user?')) {
    showNotification(`Delete User feature is being implemented. User ID: ${id}`, 'info');
    console.log('Delete user', id);
  }
}

function editPlan(id) {
  showNotification(`Edit Plan feature is being implemented. Plan ID: ${id}`, 'info');
  console.log('Edit plan', id);
}

function togglePlan(id) {
  showNotification(`Toggle Plan feature is being implemented. Plan ID: ${id}`, 'info');
  console.log('Toggle plan', id);
}

function editReview(id) {
  showNotification(`Edit Review feature is being implemented. Review ID: ${id}`, 'info');
  console.log('Edit review', id);
}

function toggleReviewApproval(id, current) {
  showNotification(`Toggle Review Approval feature is being implemented. Review ID: ${id}`, 'info');
  console.log('Toggle review approval', id, current);
}

function toggleReviewFeatured(id, current) {
  showNotification(`Toggle Review Featured feature is being implemented. Review ID: ${id}`, 'info');
  console.log('Toggle review featured', id, current);
}

function viewMessage(id) {
  showNotification(`View Message feature is being implemented. Message ID: ${id}`, 'info');
  console.log('View message', id);
}

function deleteMessage(id) {
  if (confirm('Delete this message?')) {
    showNotification(`Delete Message feature is being implemented. Message ID: ${id}`, 'info');
    console.log('Delete message', id);
  }
}

function loadEnhancedDashboardData() {
  showNotification('Enhanced Dashboard Data loading feature is being implemented.', 'info');
  console.log('Load enhanced dashboard data');
}

// Employee report generation functions
function generateSubscriptionReport() {
  showNotification('Generating Subscription Report... This feature is being implemented.', 'info');
  console.log('Generate subscription report');
}

function generateCustomerReport() {
  showNotification('Generating Customer Report... This feature is being implemented.', 'info');
  console.log('Generate customer report');
}

function generateRevenueReport() {
  showNotification('Generating Revenue Report... This feature is being implemented.', 'info');
  console.log('Generate revenue report');
}




/* ==================== EXPORTS (if needed) =================== */
window.showLogin = showLogin;
window.showRegister = showRegister;
window.openForgotPasswordModal = openForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleVerification = handleVerification;
window.handleForgotPassword = handleForgotPassword;
window.logout = logout;
window.selectPlan = selectPlan;
window.submitContact = submitContact;
window.handleResetPassword = handleResetPassword;
window.closeResetPasswordModal = closeResetPasswordModal;
window.showNotification = showNotification; // Export notification function

// Export all the missing core functions
window.toggleLanguage = toggleLanguage;
window.toggleUserDropdown = toggleUserDropdown;
window.showHome = showHome;
window.showPricing = showPricing;
window.showDashboard = showDashboard;
window.showProfile = showProfile;
window.closeModal = closeModal;
window.resendVerificationCode = resendVerificationCode;
window.gotoPricing = gotoPricing;
window.openDocumentation = openDocumentation;
window.contactSupport = contactSupport;
window.openForum = openForum;

// Export admin functions
window.showAddEmployeeModal = showAddEmployeeModal;
window.showAddUserModal = showAddUserModal;
window.showAddPlanModal = showAddPlanModal;
window.showAddReviewModal = showAddReviewModal;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editPlan = editPlan;
window.togglePlan = togglePlan;
window.editReview = editReview;
window.toggleReviewApproval = toggleReviewApproval;
window.toggleReviewFeatured = toggleReviewFeatured;
window.viewMessage = viewMessage;
window.deleteMessage = deleteMessage;
window.loadEnhancedDashboardData = loadEnhancedDashboardData;

// Export employee functions
window.generateSubscriptionReport = generateSubscriptionReport;
window.generateCustomerReport = generateCustomerReport;
window.generateRevenueReport = generateRevenueReport;

// =================== Mobile Menu Toggle ===================
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// Add mobile menu functionality to window object
window.toggleMobileMenu = toggleMobileMenu;

// =================== Initialize Flowbite Mobile Menu ===================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle button
  const mobileMenuButton = document.querySelector('[data-collapse-toggle="mobile-menu"]');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      
      // Update aria-expanded attribute
      const isExpanded = !mobileMenu.classList.contains('hidden');
      mobileMenuButton.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close mobile menu when clicking on menu links
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}


// when we click on hamburger icon its close 

const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}