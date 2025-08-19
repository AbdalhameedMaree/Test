/* ============================================================
   Admin Dashboard Enhanced JS (Professional Charts)
   - Auth check (admin/employee access)
   - Load statistics, employees, users, plans, reviews, messages
   - Render professional Chart.js charts
   - Smooth anchor nav
   - Global functions for HTML onclick handlers
   ============================================================ */

// Chart instances
let subscriptionChart = null;
let revenueChart = null;
let planPerformanceChart = null;

// Define all modal functions globally first
window.showAddEmployeeModal = function() {
  console.log('showAddEmployeeModal called globally');
  const modal = document.getElementById('addEmployeeModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    console.log('Employee modal should be visible now');
  } else {
    console.error('Employee modal not found');
  }
};

window.showAddUserModal = function() {
  console.log('showAddUserModal called globally');
  const modal = document.getElementById('addUserModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    console.log('User modal should be visible now');
  } else {
    console.error('User modal not found');
  }
};

window.showAddPlanModal = function() {
  console.log('showAddPlanModal called globally');
  const modal = document.getElementById('addPlanModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    console.log('Plan modal should be visible now');
  } else {
    console.error('Plan modal not found');
  }
};

window.showAddReviewModal = function() {
  console.log('showAddReviewModal called globally');
  const modal = document.getElementById('addReviewModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    console.log('Review modal should be visible now');
  } else {
    console.error('Review modal not found');
  }
};

window.closeModal = function() {
  console.log('closeModal called globally');
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  });
};

// Ensure all modals are closed on page load
window.closeAllModals = function() {
  console.log('Closing all modals on page load');
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal, index) => {
    console.log(`Modal ${index + 1}: ID=${modal.id}, classes=${modal.className}`);
    modal.classList.add('hidden');
    modal.style.display = 'none';
    console.log(`After hiding: classes=${modal.className}, display=${modal.style.display}`);
  });
};

// Debug function to check modal states
window.checkModalStates = function() {
  console.log('=== Modal States ===');
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal, index) => {
    const isVisible = !modal.classList.contains('hidden') && modal.style.display !== 'none';
    console.log(`Modal ${index + 1}: ID=${modal.id}, Hidden Class=${modal.classList.contains('hidden')}, Display=${modal.style.display}, Visible=${isVisible}`);
  });
};

// Global API fetch function for submit functions
window.apiFetch = async function(path, options = {}) {
  const ADMIN_API_BASE = `${window.location.origin}/backend/api`;
  const buildUrl = (path) => {
    if (!path) return ADMIN_API_BASE;
    if (/^https?:\/\//i.test(path)) return path;
    const clean = String(path).replace(/^\/+/, '');
    return `${ADMIN_API_BASE}/${clean}`;
  };
  
  const url = buildUrl(path);
  const resp = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${resp.statusText} -> ${txt}`);
  }
  const ct = resp.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) return resp.json();
  return resp.text();
};

// Now wrap the rest in IIFE for organization
(() => {
  /* ======================= CONFIG ========================== */
  /** API base (works on localhost & production) */
  const ADMIN_API_BASE = `${window.location.origin}/backend/api`;

  /* ======================= HELPERS ========================= */
  const qs = (id) => document.getElementById(id);

  const safeNumber = (v, d = 0) => {
    const n = Number(v);
    return isNaN(n) ? d : n;
  };

  const buildUrl = (path) => {
    if (!path) return ADMIN_API_BASE;
    if (/^https?:\/\//i.test(path)) return path;
    const clean = String(path).replace(/^\/+/, '');
    return `${ADMIN_API_BASE}/${clean}`;
  };

  /** Normalize relative API path and fetch */
  async function apiFetch(path, options = {}) {
    const url = buildUrl(path);
    const resp = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status} ${resp.statusText} -> ${txt}`);
    }
    const ct = resp.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) return resp.json();
    return resp.text();
  }

  /* Format & escape */
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function formatDate(s) {
    try { return new Date(s).toLocaleDateString(); } catch { return s; }
  }

  /* ===================== AUTH CHECK ======================== */
  async function checkAdminAuth() {
    try {
      const data = await apiFetch('auth/check-auth.php');
      if (!data?.authenticated || !data?.user) {
        // Redirect to main login page instead of admin-only page
        window.location.href = 'index.html';
        return false;
      }
      
      // Check if user has admin or employee role
      if (data.user.role !== 'admin' && data.user.role !== 'employee') {
        alert('Access denied. Admin or employee role required.');
        window.location.href = 'index.html';
        return false;
      }

      // Set initials in header
      const initials = `${data.user.first_name?.[0] || ''}${data.user.last_name?.[0] || ''}`.toUpperCase();
      const initialsEl = qs('user-initials');
      if (initialsEl) initialsEl.textContent = initials || 'A';
      return true;
    } catch (err) {
      console.error('Auth check failed:', err);
      window.location.href = 'index.html';
      return false;
    }
  }

  /* ======================= LOGOUT ========================== */
  async function logout() {
    try {
      await apiFetch('auth/logout.php', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error (will fallback):', e);
    } finally {
      // Fallback: حاول امسح كوكي الجلسة (اسم شائع PHPSESSID؛ عدّله إذا اسمك مختلف)
      try {
        const domains = ['', `.${location.hostname}`];
        const paths = ['/', '/backend', '/backend/api'];
        domains.forEach((d) => {
          paths.forEach((p) => {
            document.cookie = `PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}; ${d ? `domain=${d};` : ''} SameSite=Lax`;
          });
        });
      } catch {}
      // إعادة توجيه قسرية وتحديث بدون كاش
      location.replace('index.html');
      setTimeout(() => location.reload(true), 50);
    }
  }

  /* ======================= MAIN =========================== */
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure all modals are closed on page load
    window.closeAllModals();
    
    // Debug: Check modal states after 1 second
    setTimeout(() => {
      window.checkModalStates();
    }, 1000);
    
    // Skip auth checks if this is a verification page
    if (window.isVerificationPage) {
      console.log('Skipping admin auth check for verification page');
      return;
    }
    initAnchorNav();
    checkAdminAuth().then(ok => {
      if (ok) {
        loadEnhancedDashboardData();
        // Check modal states after loading data
        setTimeout(() => {
          console.log('=== Modal States After Data Load ===');
          window.checkModalStates();
        }, 2000);
      }
    });
  });

  /** اجمع كل التحميلات */
  async function loadEnhancedDashboardData() {
    await Promise.allSettled([
      loadStatistics(),
      loadEmployees(),
      loadUsers(),
      loadPlans(),
      loadReviews(),
      loadMessages()
    ]);
  }

  /* ------------------ Smooth Anchor Nav ------------------ */
  function initAnchorNav() {
    const headerOffset = 90; // لتعويض الهيدر الثابت
    document.querySelectorAll('nav a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const targetSel = a.getAttribute('href');
        if (!targetSel || targetSel === '#') return;
        const target = document.querySelector(targetSel);
        if (!target) return;

        e.preventDefault();
        const rect = target.getBoundingClientRect();
        const absoluteY = window.scrollY + rect.top - headerOffset;
        window.history.pushState({}, '', targetSel);
        window.scrollTo({ top: absoluteY, behavior: 'smooth' });
      });
    });
  }

  /* ===================== STATISTICS ======================= */
  async function loadStatistics() {
    try {
      // Show loading state for charts
      showChartLoading();
      
      const data = await apiFetch('admin/get-statistics.php');
      const stats = data.statistics?.overview || {};
      updateStatisticsCards(stats);
      
      // For monthly revenue, use our working test endpoint temporarily
      try {
        const monthlyResponse = await fetch('/test_monthly_simple.php');
        const monthlyData = await monthlyResponse.json();
        if (monthlyData.success && monthlyData.monthly_revenue) {
          data.statistics.monthly_revenue = monthlyData.monthly_revenue;
        }
      } catch (e) {
        console.log('Monthly revenue fallback failed:', e);
      }
      
      updateChartsAndGraphs(data.statistics || {});
    } catch (err) {
      console.error('Statistics load failed:', err);
      showChartError();
    }
  }

  // Chart instances
  let subscriptionChart = null;
  let revenueChart = null;
  let planPerformanceChart = null;

  function showChartLoading() {
    const containers = ['subscription-chart', 'revenue-chart', 'plan-performance-chart'];
    containers.forEach(id => {
      const container = qs(id);
      if (container && container.getContext) {
        const ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
        ctx.fillStyle = '#8b8ba0';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', container.width / 2, container.height / 2);
      }
    });
  }

  function showChartError() {
    const containers = ['subscription-chart', 'revenue-chart', 'plan-performance-chart'];
    containers.forEach(id => {
      const container = qs(id);
      if (container && container.getContext) {
        const ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading chart', container.width / 2, container.height / 2);
      }
    });
  }
  function updateStatisticsCards(stats) {
    const map = {
      'total-users': stats.total_users || 0,
      'active-subscriptions': stats.active_subscriptions || 0,
      'total-revenue': `$${safeNumber(stats.total_revenue).toFixed(2)}`,
      'unread-messages': stats.unread_messages || 0,
      'new-users-month': stats.new_users_this_month || 0,
      'average-rating': `${safeNumber(stats.average_rating).toFixed(1)}/5`,
      'total-reviews': stats.total_reviews || 0
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = qs(id);
      if (el) el.textContent = val;
    });
  }

  /* ------------------ Charts / Graphs ------------------ */

  function updateChartsAndGraphs(stats) {
    console.log('Chart data received:', stats);
    
    if (stats.subscriptions_by_plan && qs('subscription-chart')) {
      console.log('Subscription data:', stats.subscriptions_by_plan);
      createSubscriptionChart(stats.subscriptions_by_plan);
    }
    if (stats.monthly_revenue && qs('revenue-chart')) {
      console.log('Revenue data:', stats.monthly_revenue);
      createRevenueChart(stats.monthly_revenue);
    } else {
      console.log('No monthly revenue data found');
      // Show "No data" message
      const ctx = qs('revenue-chart');
      if (ctx) {
        const context = ctx.getContext('2d');
        context.clearRect(0, 0, ctx.width, ctx.height);
        context.fillStyle = '#8b8ba0';
        context.font = '16px Inter';
        context.textAlign = 'center';
        context.fillText('No revenue data available', ctx.width / 2, ctx.height / 2);
      }
    }
    if (stats.plan_performance && qs('plan-performance-chart')) {
      console.log('Plan performance data:', stats.plan_performance);
      createPlanPerformanceChart(stats.plan_performance);
    }
  }

  function createSubscriptionChart(data) {
    const ctx = qs('subscription-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (subscriptionChart) {
      subscriptionChart.destroy();
    }

    if (!data || data.length === 0) {
      const context = ctx.getContext('2d');
      context.clearRect(0, 0, ctx.width, ctx.height);
      context.fillStyle = '#8b8ba0';
      context.font = '16px Inter';
      context.textAlign = 'center';
      context.fillText('No subscription data', ctx.width / 2, ctx.height / 2);
      return;
    }

    const labels = data.map(item => item.name);
    const counts = data.map(item => item.count || 0);
    const total = counts.reduce((sum, count) => sum + count, 0);

    // Professional gradient colors
    const colors = [
      'rgba(0, 212, 255, 0.8)',
      'rgba(124, 58, 237, 0.8)', 
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ];

    const borderColors = [
      'rgba(0, 212, 255, 1)',
      'rgba(124, 58, 237, 1)',
      'rgba(16, 185, 129, 1)', 
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)'
    ];

    subscriptionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 12,
                weight: '500'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 30, 46, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#b4b4c8',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: 'easeOutQuart'
        },
        cutout: '60%'
      }
    });
  }

  function createRevenueChart(data) {
    const ctx = qs('revenue-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (revenueChart) {
      revenueChart.destroy();
    }

    console.log('Creating revenue chart with data:', data);

    if (!data || data.length === 0) {
      console.log('No revenue data available, showing message');
      const context = ctx.getContext('2d');
      context.clearRect(0, 0, ctx.width, ctx.height);
      context.fillStyle = '#8b8ba0';
      context.font = '16px Inter';
      context.textAlign = 'center';
      context.fillText('No revenue data available', ctx.width / 2, ctx.height / 2);
      return;
    }

    // Ensure data is properly formatted
    const cleanData = data.filter(item => item && item.month && (item.revenue !== null && item.revenue !== undefined));
    
    if (cleanData.length === 0) {
      console.log('No valid revenue data after filtering');
      const context = ctx.getContext('2d');
      context.clearRect(0, 0, ctx.width, ctx.height);
      context.fillStyle = '#8b8ba0';
      context.font = '16px Inter';
      context.textAlign = 'center';
      context.fillText('No valid revenue data', ctx.width / 2, ctx.height / 2);
      return;
    }

    // Generate last 5 months from current date
    const now = new Date();
    const last5Months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      // Find revenue for this month in database, default to 0 if not found
      const monthData = cleanData.find(item => item.month === monthKey);
      const revenue = monthData ? parseFloat(monthData.revenue) || 0 : 0;
      
      last5Months.push({
        label: monthLabel,
        revenue: revenue
      });
    }
    
    const labels = last5Months.map(item => item.label);
    const revenues = last5Months.map(item => item.revenue);

    console.log('Chart labels:', labels);
    console.log('Chart revenues:', revenues);

    // Create gradient
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.6)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.1)');

    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Revenue',
          data: revenues,
          borderColor: 'rgba(0, 212, 255, 1)',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(0, 212, 255, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgba(0, 212, 255, 1)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(30, 30, 46, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#b4b4c8',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            borderWidth: 1,
            cornerRadius: 12,
            callbacks: {
              label: function(context) {
                return `Revenue: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(42, 42, 62, 0.5)',
              drawBorder: false
            },
            ticks: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(42, 42, 62, 0.5)',
              drawBorder: false
            },
            ticks: {
              color: '#b4b4c8',
              font: {
                family: 'Inter', 
                size: 11
              },
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
          delay: (context) => {
            return context.dataIndex * 100;
          }
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    });
  }

  function createPlanPerformanceChart(data) {
    const ctx = qs('plan-performance-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (planPerformanceChart) {
      planPerformanceChart.destroy();
    }

    if (!data || data.length === 0) {
      const context = ctx.getContext('2d');
      context.clearRect(0, 0, ctx.width, ctx.height);
      context.fillStyle = '#8b8ba0';
      context.font = '16px Inter';
      context.textAlign = 'center';
      context.fillText('No plan performance data', ctx.width / 2, ctx.height / 2);
      return;
    }

    const sortedData = [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    const planNames = sortedData.map(item => item.name);
    const revenues = sortedData.map(item => item.revenue || 0);
    const subscriptions = sortedData.map(item => item.subscriptions || 0);

    // Professional gradient colors for bars
    const backgroundColors = planNames.map((_, index) => {
      const colors = [
        'rgba(0, 212, 255, 0.8)',
        'rgba(124, 58, 237, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ];
      return colors[index % colors.length];
    });

    const borderColors = planNames.map((_, index) => {
      const colors = [
        'rgba(0, 212, 255, 1)',
        'rgba(124, 58, 237, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ];
      return colors[index % colors.length];
    });

    planPerformanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: planNames,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenues,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            yAxisID: 'y'
          },
          {
            label: 'Subscriptions',
            data: subscriptions,
            type: 'line',
            borderColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(255, 255, 255, 1)',
            pointBorderColor: 'rgba(0, 212, 255, 1)',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 12,
                weight: '500'
              },
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 30, 46, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#b4b4c8',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            borderWidth: 1,
            cornerRadius: 12,
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `Revenue: $${context.raw.toFixed(2)}`;
                } else {
                  return `Subscriptions: ${context.raw}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(42, 42, 62, 0.5)',
              drawBorder: false
            },
            ticks: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(42, 42, 62, 0.5)',
              drawBorder: false
            },
            ticks: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 11
              },
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#b4b4c8',
              font: {
                family: 'Inter',
                size: 11
              }
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
          delay: (context) => {
            return context.dataIndex * 150;
          }
        }
      }
    });
  }

  function updatePlanPerformance(data) {
    const container = qs('plan-performance');
    if (!container) return;
    container.innerHTML = '';
    if (!data.length) { 
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No plan performance data</p>'; 
      return; 
    }
    
    // Sort by revenue descending
    const sortedData = [...data].sort((a, b) => safeNumber(b.revenue) - safeNumber(a.revenue));
    
    sortedData.forEach((plan, index) => {
      const div = document.createElement('div');
      div.className = 'plan-performance-item';
      div.style.animationDelay = `${index * 100}ms`;
      
      const revenue = safeNumber(plan.revenue);
      const subscriptions = safeNumber(plan.subscriptions);
      const avgRevenue = subscriptions > 0 ? revenue / subscriptions : 0;
      
      div.innerHTML = `
        <div class="plan-performance-content">
          <div class="plan-header">
            <div class="plan-name">${escapeHtml(plan.name)}</div>
            <div class="plan-rank">#${index + 1}</div>
          </div>
          <div class="plan-metrics">
            <div class="metric">
              <div class="metric-label">Revenue</div>
              <div class="metric-value">$${revenue.toFixed(2)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Subscriptions</div>
              <div class="metric-value">${subscriptions}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Avg per Sub</div>
              <div class="metric-value">$${avgRevenue.toFixed(2)}</div>
            </div>
          </div>
          <div class="plan-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min((revenue / (sortedData[0] ? safeNumber(sortedData[0].revenue) : 1)) * 100, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  /* ===================== EMPLOYEES ======================== */
  async function loadEmployees() {
    try {
      const data = await apiFetch('admin/get-employees.php');
      updateEmployeesTable(data.employees || []);
    } catch (err) {
      console.error('Employees load failed:', err);
    }
  }
  function updateEmployeesTable(items) {
    const tbody = qs('employees-table-body');
    if (!tbody) return;
    tbody.innerHTML = (items || []).map(emp => {
      const role   = escapeHtml(emp.role || 'employee');
      const status = String(emp.status || 'active').toLowerCase();
      return `
        <tr>
          <td>${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</td>
          <td>${escapeHtml(emp.email)}</td>
          <td><span class="role-badge role-employee">${role}</span></td>
          <td>
            <span class="status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}">
              ${status}
            </span>
          </td>
          <td>
            <button class="btn-sm btn-edit" onclick="editEmployee(${emp.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
            <button class="btn-sm btn-delete" onclick="deleteEmployee(${emp.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  function editEmployee(id) {
    // Show a simple prompt for now, can be enhanced with a proper edit modal
    const newEmail = prompt('Enter new email for employee (leave empty to cancel):');
    if (newEmail && newEmail.trim()) {
      updateEmployee(id, { email: newEmail.trim() });
    }
  }

  async function updateEmployee(id, updateData) {
    try {
      await apiFetch('admin/update-employee.php', {
        method: 'POST',
        body: JSON.stringify({ id, ...updateData })
      });
      if (window.showNotification) {
        window.showNotification('Employee updated successfully!', 'success');
      } else {
        alert('Employee updated successfully!');
      }
      loadEmployees();
    } catch (error) {
      console.error('Update employee error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to update employee: ' + error.message, 'error');
      } else {
        alert('Failed to update employee: ' + error.message);
      }
    }
  }
  async function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    try {
      await apiFetch('admin/delete-employee.php', { method: 'POST', body: JSON.stringify({ id }) });
      loadEmployees();
    } catch (err) {
      alert('Failed to delete employee');
      console.error(err);
    }
  }

  /* ======================= USERS ========================== */
  async function loadUsers() {
    try {
      const data = await apiFetch('admin/get-users.php');
      updateUsersTable(data.users || []);
    } catch (err) {
      console.error('Users load failed:', err);
    }
  }
  function updateUsersTable(users) {
    const tbody = qs('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="role-badge role-${escapeHtml(u.role)}">${escapeHtml(u.role)}</span></td>
        <td>
          <span class="status-badge ${u.is_verified ? 'verified' : 'unverified'}">
            ${u.is_verified ? 'Verified' : 'Unverified'}
          </span>
        </td>
        <td>
          <button class="btn-sm btn-edit" onclick="editUser(${u.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-sm btn-delete" onclick="deleteUser(${u.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  }
  function editUser(id) {
    // Show a simple prompt for now, can be enhanced with a proper edit modal
    const newEmail = prompt('Enter new email for user (leave empty to cancel):');
    if (newEmail && newEmail.trim()) {
      updateUser(id, { email: newEmail.trim() });
    }
  }

  async function updateUser(id, updateData) {
    try {
      await apiFetch('admin/update-user.php', {
        method: 'POST',
        body: JSON.stringify({ id, ...updateData })
      });
      if (window.showNotification) {
        window.showNotification('User updated successfully!', 'success');
      } else {
        alert('User updated successfully!');
      }
      loadUsers();
    } catch (error) {
      console.error('Update user error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to update user: ' + error.message, 'error');
      } else {
        alert('Failed to update user: ' + error.message);
      }
    }
  }
  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await apiFetch('admin/delete-user.php', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      loadUsers();
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  }

  /* ======================== PLANS ========================= */
  async function loadPlans() {
    try {
      const data = await apiFetch('admin/get-plans.php');
      updatePlansTable(data.plans || []);
    } catch (err) {
      console.error('Plans load failed:', err);
    }
  }
  function updatePlansTable(plans) {
    const tbody = qs('plans-table-body');
    if (!tbody) return;
    tbody.innerHTML = plans.map(p => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>$${safeNumber(p.price).toFixed(2)}</td>
        <td>${safeNumber(p.monthly_conversations ?? p.conversations)}</td>
        <td>${p.is_active ? 'Active' : 'Inactive'}</td>
                <td>
          <button class="btn-sm btn-edit" onclick="editPlan(${p.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-sm btn-toggle" onclick="togglePlan(${p.id}, ${p.is_active})">
            ${p.is_active ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg> Disable` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg> Enable`}
          </button>
        </td>
      </tr>
    `).join('');
  }
  function editPlan(id) {
    // Show a simple prompt for now, can be enhanced with a proper edit modal
    const newPrice = prompt('Enter new price for plan (leave empty to cancel):');
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      updatePlan(id, { price: parseFloat(newPrice) });
    }
  }

  async function updatePlan(id, updateData) {
    try {
      await apiFetch('admin/update-plan.php', {
        method: 'POST',
        body: JSON.stringify({ id, ...updateData })
      });
      if (window.showNotification) {
        window.showNotification('Plan updated successfully!', 'success');
      } else {
        alert('Plan updated successfully!');
      }
      loadPlans();
    } catch (error) {
      console.error('Update plan error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to update plan: ' + error.message, 'error');
      } else {
        alert('Failed to update plan: ' + error.message);
      }
    }
  }
  async function togglePlan(id, isActive) {
    try {
      await apiFetch('admin/update-plan.php', {
        method: 'POST',
        body: JSON.stringify({ id, is_active: !isActive })
      });
      loadPlans();
      loadStatistics(); // Might affect counts
    } catch (err) {
      alert('Failed to toggle plan status');
      console.error(err);
    }
  }

  /* ======================= REVIEWS ======================== */
  async function loadReviews() {
    try {
      const data = await apiFetch('admin/get-reviews.php');
      updateReviewsTable(data.reviews || []);
    } catch (err) {
      console.error('Reviews load failed:', err);
    }
  }
  function updateReviewsTable(reviews) {
    const tbody = qs('reviews-table-body');
    if (!tbody) return;
    tbody.innerHTML = reviews.map(r => `
      <tr>
        <td>${escapeHtml(r.name || r.company || '—')}</td>
        <td>${escapeHtml(r.content || r.review || '')}</td>
        <td>${'★'.repeat(safeNumber(r.rating))}${'☆'.repeat(Math.max(0, 5 - safeNumber(r.rating)))}</td>
        <td>${r.is_featured ? 'Yes' : 'No'}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editReview(${r.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-sm btn-toggle"
            onclick="toggleReviewApproval(${r.id}, ${r.is_approved})">
            ${r.is_approved ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg> Unapprove` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg> Approve`}
          </button>
          <button class="btn-sm btn-toggle"
            onclick="toggleReviewFeatured(${r.id}, ${r.is_featured})">
            ${r.is_featured ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg> Unfeature` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg> Feature`}
          </button>
        </td>
      </tr>
    `).join('');
  }
  function editReview(id) {
    // Show a simple prompt for now, can be enhanced with a proper edit modal
    const newRating = prompt('Enter new rating (1-5) for review (leave empty to cancel):');
    if (newRating && !isNaN(parseInt(newRating)) && parseInt(newRating) >= 1 && parseInt(newRating) <= 5) {
      updateReview(id, { rating: parseInt(newRating) });
    }
  }

  async function updateReview(id, updateData) {
    try {
      await apiFetch('admin/update-review.php', {
        method: 'POST',
        body: JSON.stringify({ id, ...updateData })
      });
      if (window.showNotification) {
        window.showNotification('Review updated successfully!', 'success');
      } else {
        alert('Review updated successfully!');
      }
      loadReviews();
    } catch (error) {
      console.error('Update review error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to update review: ' + error.message, 'error');
      } else {
        alert('Failed to update review: ' + error.message);
      }
    }
  }
  async function toggleReviewApproval(id, current) {
    try {
      await apiFetch('admin/update-review.php', {
        method: 'POST',
        body: JSON.stringify({ id, is_approved: !current })
      });
      loadReviews();
      loadStatistics();
    } catch (err) {
      alert('Failed to update review approval');
      console.error(err);
    }
  }
  async function toggleReviewFeatured(id, current) {
    try {
      await apiFetch('admin/update-review.php', {
        method: 'POST',
        body: JSON.stringify({ id, is_featured: !current })
      });
      loadReviews();
      loadStatistics();
    } catch (err) {
      alert('Failed to update review featured status');
      console.error(err);
    }
  }

  /* ======================= MESSAGES ======================= */
  async function loadMessages() {
    try {
      const data = await apiFetch('admin/get-messages.php');
      updateMessagesTable(data.messages || []);
    } catch (err) {
      console.error('Messages load failed:', err);
    }
  }
  function updateMessagesTable(messages) {
    const tbody = qs('messages-table-body');
    if (!tbody) return;
    tbody.innerHTML = messages.map(m => {
      // Ensure we have a valid ID before creating the button
      const messageId = m.id || m.message_id;
      if (!messageId) {
        console.warn('Message without valid ID:', m);
        return `
          <tr>
            <td>${escapeHtml(m.name || '')}</td>
            <td>${escapeHtml(m.email || '')}</td>
            <td>${escapeHtml(m.company || '')}</td>
            <td>${escapeHtml((m.message || '').slice(0, 120))}${m.message && m.message.length > 120 ? '…' : ''}</td>
            <td>${m.created_at ? formatDate(m.created_at) : ''}</td>
            <td>
              <span class="text-muted">No ID</span>
            </td>
          </tr>
        `;
      }
      
      return `
        <tr>
          <td>${escapeHtml(m.name || '')}</td>
          <td>${escapeHtml(m.email || '')}</td>
          <td>${escapeHtml(m.company || '')}</td>
          <td>${escapeHtml((m.message || '').slice(0, 120))}${m.message && m.message.length > 120 ? '…' : ''}</td>
          <td>${m.created_at ? formatDate(m.created_at) : ''}</td>
          <td>
            <button class="btn-sm btn-view" onclick="viewMessage(${messageId})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View
            </button>
            <button class="btn-sm btn-delete" onclick="deleteMessage(${messageId})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  async function viewMessage(id) {
    console.log('viewMessage called with ID:', id, 'Type:', typeof id);
    
    if (!id || id === 'undefined' || id === 'null' || id === undefined || id === null) {
      console.error('Invalid message ID:', id);
      return;
    }
    
    // Convert to number to be safe
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      console.error('Invalid numeric message ID:', id, 'parsed as:', numericId);
      return;
    }
    
    console.log('Attempting to load message with ID:', numericId);
    
    try {
      const data = await apiFetch(`admin/get-message.php?id=${numericId}`);
      
      if (!data || !data.message) {
        console.error('No message data received for ID:', numericId, 'Response:', data);
        if (window.showNotification) {
          window.showNotification('Message not found', 'error');
        }
        return;
      }
      
      const message = data.message;
      console.log('Message loaded successfully:', message);
      
      const modalBody = document.getElementById('messageModalBody');
      modalBody.innerHTML = `
        <div class="message-details">
          <div class="form-group">
            <label><strong>Name:</strong></label>
            <p>${escapeHtml(message.name)}</p>
          </div>
          <div class="form-group">
            <label><strong>Email:</strong></label>
            <p>${escapeHtml(message.email)}</p>
          </div>
          <div class="form-group">
            <label><strong>Company:</strong></label>
            <p>${escapeHtml(message.company || 'N/A')}</p>
          </div>
          <div class="form-group">
            <label><strong>Date:</strong></label>
            <p>${formatDate(message.created_at)}</p>
          </div>
          <div class="form-group">
            <label><strong>Message:</strong></label>
            <p style="white-space: pre-wrap; background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius);">${escapeHtml(message.message)}</p>
          </div>
        </div>
      `;
      
      console.log('Showing modal for message ID:', numericId);
      document.getElementById('viewMessageModal').classList.remove('hidden');
      
      // Mark as read if not already
      if (!message.is_read) {
        await apiFetch('admin/mark-message-read.php', {
          method: 'POST',
          body: JSON.stringify({ id: numericId })
        });
        loadMessages(); // Refresh to update read status
        loadStatistics(); // Update unread count
      }
    } catch (error) {
      console.error('View message error for ID:', numericId, 'Error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to load message details: ' + error.message, 'error');
      } else {
        alert('Failed to load message details: ' + error.message);
      }
    }
  }
  async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await apiFetch('admin/delete-message.php', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      loadMessages();
    } catch (err) {
      alert('Failed to delete message');
      console.error(err);
    }
  }

  /* =================== SUBMIT FUNCTIONS (Global) ================== */

  // Add Employee Form Submission (Global)
  window.submitAddEmployee = async function(event) {
    event.preventDefault();
    console.log('submitAddEmployee called globally');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const employeeData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    console.log('Employee data:', employeeData);

    try {
      const result = await window.apiFetch('admin/add-employee.php', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      
      console.log('Employee add result:', result);
      if (window.showNotification) {
        window.showNotification('Employee added successfully!', 'success');
      } else {
        alert('Employee added successfully!');
      }
      window.closeModal();
      form.reset();
      if (window.loadEmployees) window.loadEmployees(); // Refresh the employees table
    } catch (error) {
      console.error('Add employee error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to add employee: ' + error.message, 'error');
      } else {
        alert('Failed to add employee: ' + error.message);
      }
    }
  };

  // Add User Form Submission
  // Global Submit Functions
  window.submitAddUser = async function(event) {
    event.preventDefault();
    console.log('submitAddUser called globally');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role')
    };

    console.log('User data:', userData);

    try {
      const result = await window.apiFetch('admin/add-user.php', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      console.log('User add result:', result);
      if (window.showNotification) {
        window.showNotification('User added successfully!', 'success');
      } else {
        alert('User added successfully!');
      }
      window.closeModal();
      form.reset();
      if (window.loadUsers) window.loadUsers(); // Refresh the users table
    } catch (error) {
      console.error('Add user error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to add user: ' + error.message, 'error');
      } else {
        alert('Failed to add user: ' + error.message);
      }
    }
  };

  window.submitAddPlan = async function(event) {
    event.preventDefault();
    console.log('submitAddPlan called globally');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const planData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      billing_period: formData.get('billing_period'),
      max_conversations: formData.get('max_conversations') ? parseInt(formData.get('max_conversations')) : null,
      features: ["Basic Features"] // Default features, can be enhanced later
    };

    console.log('Plan data:', planData);

    try {
      const result = await window.apiFetch('admin/add-plan.php', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      
      console.log('Plan add result:', result);
      if (window.showNotification) {
        window.showNotification('Plan added successfully!', 'success');
      } else {
        alert('Plan added successfully!');
      }
      window.closeModal();
      form.reset();
      if (window.loadPlans) window.loadPlans(); // Refresh the plans table
    } catch (error) {
      console.error('Add plan error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to add plan: ' + error.message, 'error');
      } else {
        alert('Failed to add plan: ' + error.message);
      }
    }
  };

  window.submitAddReview = async function(event) {
    event.preventDefault();
    console.log('submitAddReview called globally');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const reviewData = {
      name: formData.get('name'),
      email: formData.get('email'),
      rating: parseInt(formData.get('rating')),
      title: formData.get('title'),
      content: formData.get('content'),
      is_approved: formData.get('is_approved') ? 1 : 0,
      is_featured: formData.get('is_featured') ? 1 : 0
    };

    console.log('Review data:', reviewData);

    try {
      const result = await window.apiFetch('admin/add-review.php', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      
      console.log('Review add result:', result);
      if (window.showNotification) {
        window.showNotification('Review added successfully!', 'success');
      } else {
        alert('Review added successfully!');
      }
      window.closeModal();
      form.reset();
      if (window.loadReviews) window.loadReviews(); // Refresh the reviews table
    } catch (error) {
      console.error('Add review error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to add review: ' + error.message, 'error');
      } else {
        alert('Failed to add review: ' + error.message);
      }
    }
  };

  /* =================== Exports to window ================== */
  // Export only internal functions that need to be accessible
  window.loadEnhancedDashboardData = loadEnhancedDashboardData;
  window.loadEmployees = loadEmployees;
  window.loadUsers = loadUsers;
  window.loadPlans = loadPlans;
  window.loadReviews = loadReviews;
  window.editUser = editUser;
  window.deleteUser = deleteUser;
  window.editEmployee = editEmployee;
  window.deleteEmployee = deleteEmployee;
  window.editPlan = editPlan;
  window.togglePlan = togglePlan;
  window.editReview = editReview;
  window.toggleReviewApproval = toggleReviewApproval;
  window.toggleReviewFeatured = toggleReviewFeatured;
  window.viewMessage = viewMessage;
  window.deleteMessage = deleteMessage;
  window.logout = logout; // زر الخروج في الهيدر
})();


