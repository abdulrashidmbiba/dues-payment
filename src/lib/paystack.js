import { supabase } from './supabaseClient';

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    const existing = document.querySelector('script[data-paystack]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.setAttribute('data-paystack', 'true');
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Could not load Paystack. Check your internet connection.'));
    document.body.appendChild(script);
  });
}

export async function payWithPaystack({ email, amount }) {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) throw new Error('Missing VITE_PAYSTACK_PUBLIC_KEY in .env');

  const PaystackPop = await loadPaystackScript();

  return new Promise((resolve, reject) => {
    const handler = PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      ref: `NEX-${Date.now()}`,
      callback: (response) => resolve(response),
      onClose: () => reject({ closed: true }),
    });
    handler.openIframe();
  });
}

export async function recordSuccessfulPayment({ reference, memberId, amount, categoryId }) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      member_id: memberId,
      category_id: categoryId,
      amount,
      paystack_reference: reference,
      status: 'success',
    })
    .select('*, dues_categories(name)')
    .single();

  if (error) throw error;
  return data;
}