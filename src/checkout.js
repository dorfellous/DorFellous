import { defaultPayPalUrl, storeProducts } from './storeData.js';

const ordersKey = 'dorFellousCheckoutOrders';
let activeTrigger = null;

document.addEventListener('click', (event) => {
  const checkoutTrigger = event.target.closest('[data-checkout-trigger]');
  if (checkoutTrigger) {
    openCheckout(checkoutTrigger);
    return;
  }

  if (event.target.closest('[data-checkout-close]')) {
    closeCheckout();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCheckout();
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-checkout-form]');
  if (!form) return;

  event.preventDefault();
  const modal = form.closest('[data-checkout-modal]');
  const message = modal?.querySelector('[data-checkout-message]');
  const paypalLink = modal?.querySelector('[data-paypal-link]');

  if (!form.reportValidity()) {
    if (message) message.textContent = 'Please complete the required fields before continuing.';
    if (paypalLink) paypalLink.hidden = true;
    return;
  }

  const order = buildCheckoutOrder(form, modal);
  saveCheckoutOrder(order);
  console.log('Dor Fellous checkout order', order);

  if (message) {
    message.textContent = 'Order details saved locally. Continue to PayPal to complete payment.';
  }
  if (paypalLink) {
    paypalLink.href = order.payment.paypalUrl;
    paypalLink.hidden = false;
    paypalLink.focus();
  }
});

function openCheckout(trigger) {
  if (trigger.disabled) return;
  const modal = document.querySelector('[data-checkout-modal]');
  if (!modal) return;

  activeTrigger = trigger;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-checkout-open');
  window.setTimeout(() => {
    modal.querySelector('select, input:not([readonly]), textarea, button')?.focus();
  }, 80);
}

function closeCheckout() {
  const modal = document.querySelector('[data-checkout-modal].is-open');
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-checkout-open');
  activeTrigger?.focus();
  activeTrigger = null;
}

function buildCheckoutOrder(form, modal) {
  const formData = new FormData(form);
  const product = storeProducts.find((item) =>
    item.id === modal?.dataset.productId && item.category === modal?.dataset.productCategory,
  );
  const quantity = Math.max(1, Number.parseInt(formData.get('quantity'), 10) || 1);
  const paypalUrl = product?.paypalUrl || modal?.dataset.paypalUrl || defaultPayPalUrl;

  return {
    id: `DF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    product: {
      id: product?.id || modal?.dataset.productId || '',
      category: product?.category || modal?.dataset.productCategory || '',
      name: product?.name || String(formData.get('productName') || ''),
      price: product?.price ?? null,
      currency: product?.currency || 'USD',
      displayPrice: String(formData.get('productPrice') || ''),
    },
    options: {
      size: String(formData.get('size') || ''),
      variation: String(formData.get('variation') || ''),
      quantity,
    },
    customer: {
      fullName: String(formData.get('fullName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
    },
    shipping: {
      address: String(formData.get('shippingAddress') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      country: String(formData.get('country') || '').trim(),
      postalCode: String(formData.get('postalCode') || '').trim(),
    },
    notes: String(formData.get('notes') || '').trim(),
    payment: {
      provider: 'paypal',
      paypalUrl,
      status: 'pending',
    },
  };
}

function saveCheckoutOrder(order) {
  let existingOrders = [];

  try {
    existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    if (!Array.isArray(existingOrders)) existingOrders = [];
  } catch {
    existingOrders = [];
  }

  existingOrders.push(order);
  localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
  localStorage.setItem('dorFellousLatestCheckoutOrder', JSON.stringify(order));
}
