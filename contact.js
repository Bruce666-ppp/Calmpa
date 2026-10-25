const form = document.querySelector('#contact-form');
const fields = form.querySelector('fieldset');
const submit = form.querySelector('[type="submit"]');
const status = form.querySelector('.form-status');
let sending = false;
form.addEventListener('input', () => {
  if (!sending) status.textContent = '';
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const body = new FormData(form);
  sending = true;
  fields.disabled = true;
  submit.disabled = true;
  form.setAttribute('aria-busy', 'true');
  submit.textContent = 'Sending…';
  status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(form.action, {
      method: 'POST', body, headers: { Accept: 'application/json' }, signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission rejected');
    form.reset();
    status.textContent = 'Message sent — thank you!';
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'Delivery could not be confirmed. Your message is still here; please try again.'
      : 'Unable to send. Please try again — your message has been kept.';
  } finally {
    clearTimeout(timeout);
    sending = false;
    fields.disabled = false;
    submit.disabled = false;
    submit.textContent = 'Send message';
    form.removeAttribute('aria-busy');
  }
});
