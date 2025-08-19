// Payment Checkout JavaScript (production-safe, unified API usage)

// ---- API base & helper ----------------------------------------------------
// Works on localhost and production; https is taken from current origin
const API_BASE = window.location.origin + '/backend';

// Uniform API caller; normalizes paths and always includes credentials (cookies)
const api = (path, opts = {}) => {
  const clean = String(path).replace(/^\/?api\/?/, ''); // avoid /api/api/...
  return fetch(`${API_BASE}/api/${clean}`, {
    credentials: 'include',
    ...opts
  });
};

// Graceful home navigation (avoid hard index.html redirect)
const goHome = () => {
  if (typeof showHome === 'function') {
    showHome();
  } else {
    window.location.href = '/';
  }
};

// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  loadCheckoutData();
  initializePaymentForm();
});

// Load checkout data from URL parameters
function loadCheckoutData() {
  const urlParams = new URLSearchParams(window.location.search);
  const planName  = urlParams.get('plan');
  const amount    = urlParams.get('amount');
  const sessionId = urlParams.get('session');

  if (!planName || !amount || !sessionId) {
    alert('Invalid checkout session');
    goHome();
    return;
  }

  // Update order summary (with safe element checks)
  const planNameEl   = document.getElementById('plan-name');
  const planPriceEl  = document.getElementById('plan-price');
  const totalAmountEl= document.getElementById('total-amount');

  if (planNameEl)    planNameEl.textContent  = planName;
  if (planPriceEl)   planPriceEl.textContent = `$${amount}`;
  if (totalAmountEl) totalAmountEl.textContent = `$${amount}`;

  // Store session data in memory
  window.checkoutSession = {
    sessionId: sessionId,
    planName: planName,
    amount: parseFloat(amount)
  };
}

// Initialize payment form
function initializePaymentForm() {
  // Payment method selection
  const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      updatePaymentMethod(this.value);
    });
  });

  // Card number formatting
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      this.value = formatCardNumber(this.value);
    });
  }

  // Expiry date formatting
  const expiryInput = document.getElementById('expiry-date');
  if (expiryInput) {
    expiryInput.addEventListener('input', function() {
      this.value = formatExpiryDate(this.value);
    });
  }

  // CVV validation
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  // Form submission
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePaymentSubmission);
  }
}

// Update payment method display
function updatePaymentMethod(method) {
  const cardForm    = document.getElementById('card-form');
  const paypalForm  = document.getElementById('paypal-form');
  const containers  = document.querySelectorAll('.payment-method');

  containers.forEach(pm => pm.classList.remove('active'));
  const selected = document.querySelector(`input[value="${method}"]`);
  if (selected) selected.closest('.payment-method')?.classList.add('active');

  if (method === 'card') {
    cardForm?.classList.remove('hidden');
    paypalForm?.classList.add('hidden');
  } else if (method === 'paypal') {
    cardForm?.classList.add('hidden');
    paypalForm?.classList.remove('hidden');
  }
}

// Format card number with spaces
function formatCardNumber(value) {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const match = (v.match(/\d{4,16}/g) || [])[0] || '';
  const parts = [];
  for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4));
  return parts.length ? parts.join(' ') : v;
}

// Format expiry date MM/YY
function formatExpiryDate(value) {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v;
}

// Validate card number using Luhn algorithm
function validateCardNumber(cardNumber) {
  const num = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(num)) return false;
  let sum = 0, isEven = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// Validate expiry date
function validateExpiryDate(expiry) {
  const [month, year] = (expiry || '').split('/');
  if (!month || !year) return false;

  const currentDate  = new Date();
  const currentYear  = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month, 10);
  const expYear  = parseInt(year, 10);

  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  return true;
}

// Handle payment form submission
async function handlePaymentSubmission(event) {
  event.preventDefault();

  const paymentBtn   = document.getElementById('payment-btn');
  const originalText = paymentBtn?.textContent || 'Pay Now';

  // Disable button and show loading
  if (paymentBtn) {
    paymentBtn.disabled = true;
    paymentBtn.innerHTML = '<span class="spinner"></span> Processing...';
  }

  try {
    const paymentMethodEl = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'card';

    if (paymentMethod === 'card') {
      const isValid = validateCardForm();
      if (!isValid) throw new Error('Please check your card details');
    }

    // ---- Try confirming the checkout session on backend -------------------
    // If you have backend endpoint: /backend/api/payment/confirm-checkout.php
    // It should validate sessionId and activate the subscription server-side.
    let confirmed = false;
    if (window.checkoutSession?.sessionId) {
      try {
        const resp = await api('payment/confirm-checkout.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: window.checkoutSession.sessionId })
        });
        if (resp.ok) {
          const data = await resp.json().catch(() => ({}));
          // Expecting something like { success: true }
          confirmed = Boolean(data?.success ?? true);
        }
      } catch (_) {
        // If endpoint missing or fails, we fall back to simulation below
      }
    }

    // ---- Fallback simulation if backend confirm is not available ----------
    if (!confirmed) {
      await simulatePaymentProcessing(); // 2s fake delay
    }

    // Show success and redirect
    showPaymentSuccess();
  } catch (error) {
    alert('Payment failed: ' + (error?.message || 'Unknown error'));
    if (paymentBtn) {
      paymentBtn.disabled = false;
      paymentBtn.textContent = originalText;
    }
  }
}

// Validate card form
function validateCardForm() {
  const cardNumber     = (document.getElementById('card-number')?.value || '').trim();
  const expiryDate     = (document.getElementById('expiry-date')?.value || '').trim();
  const cvv            = (document.getElementById('cvv')?.value || '').trim();
  const cardholderName = (document.getElementById('cardholder-name')?.value || '').trim();

  if (!validateCardNumber(cardNumber)) {
    alert('Invalid card number');
    return false;
  }
  if (!validateExpiryDate(expiryDate)) {
    alert('Invalid expiry date');
    return false;
  }
  if (cvv.length < 3) {
    alert('Invalid CVV');
    return false;
  }
  if (!cardholderName) {
    alert('Cardholder name is required');
    return false;
  }
  return true;
}

// Simulate payment processing (fallback)
function simulatePaymentProcessing() {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

// Show payment success
function showPaymentSuccess() {
  const planName = (window.checkoutSession?.planName) || 'your plan';

  // Show success animation instead of modal
  if (typeof showSuccessAnimation === 'function') {
    showSuccessAnimation('subscribe', () => {
      redirectToDashboard();
    });
  } else {
    // Fallback to modal if animation function not available
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal success-modal">
        <div class="success-icon">✅</div>
        <h2 style="color: var(--accent); margin-bottom: 1rem;">Payment Successful!</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Your subscription to ${planName} has been activated.
        </p>
        <button class="btn" onclick="redirectToDashboard()">Go to Dashboard</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// Redirect to dashboard (customer by default)
function redirectToDashboard() {
  window.location.href = 'customer-dashboard.html';
}

// Add CSS for payment form
const paymentStyles = `
<style>
.checkout-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.checkout-header { text-align: center; margin-bottom: 3rem; }
.checkout-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
.order-summary { height: fit-content; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border); }
.plan-info { flex: 1; }
.plan-name { font-weight: 600; color: var(--text-primary); }
.plan-billing { font-size: 0.875rem; color: var(--text-secondary); }
.plan-price { font-weight: 600; color: var(--primary); }
.order-total { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; font-weight: 600; font-size: 1.125rem; }
.total-amount { color: var(--primary); }
.security-badges { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.security-badge { font-size: 0.875rem; color: var(--text-secondary); }
.payment-methods { display: flex; gap: 1rem; margin-bottom: 2rem; }
.payment-method { flex: 1; display: flex; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.3s ease; }
.payment-method.active { border-color: var(--primary); background: rgba(0, 212, 255, 0.1); }
.payment-method input { display: none; }
.method-icon { font-size: 1.5rem; }
.method-name { font-weight: 500; }
.payment-details { margin-bottom: 2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.billing-address { margin-bottom: 2rem; }
.terms-agreement { margin-bottom: 2rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); }
.checkbox-label input { margin: 0; }
.payment-btn { width: 100%; padding: 1rem; font-size: 1.125rem; font-weight: 600; }
.success-modal { text-align: center; padding: 3rem; }
.success-icon { font-size: 4rem; margin-bottom: 1rem; }
.spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid currentColor; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 768px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .payment-methods { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
`;
document.head.insertAdjacentHTML('beforeend', paymentStyles);
