// York Computer Help — interaction shim (replaces the React runtime of the live SPA)
(function () {
  'use strict';

  // --- smooth-scroll nav buttons ---
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-goto]');
    if (!btn) return;
    var el = document.getElementById(btn.getAttribute('data-goto'));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    var menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
  });
  var logo = document.querySelector('header nav .cursor-pointer');
  if (logo) logo.addEventListener('click', function () {
    var el = document.getElementById('home');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });

  // --- mobile menu toggle ---
  var burger = document.querySelector('header button.md\\:hidden');
  if (burger) burger.addEventListener('click', function () {
    var menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  });

  // --- contact form (mirrors the live React logic) ---
  var WEBHOOK = 'https://services.leadconnectorhq.com/hooks/5KgnAuxR3KkJGeb8jS12/webhook-trigger/f4cc95f8-add3-41de-8565-cc1c69eb6ba3';
  var form = document.querySelector('#contact form');
  if (!form) return;

  var qEl = form.querySelector('span.text-lg.font-semibold');
  var inputEl = form.querySelector('#captcha');
  var capBox = inputEl.closest('div');
  var appName = inputEl.closest('label') ? inputEl.closest('label').parentElement : null;
  var refreshBtn = capBox.nextElementSibling;
  var captchaErr = false;

  function resetCaptcha() {
    captchaErr = false;
    setQuestion(rand1(), rand2());
    inputEl.value = '';
    capBox.classList.remove('border-red-300', 'bg-red-50');
    capBox.classList.add('border-gray-300', 'bg-white');
    inputEl.classList.remove('border-red-300');
    inputEl.classList.add('border-gray-300');
    clearAlert();
  }
  function rand1() { return Math.floor(Math.random() * 10) + 1; }
  function rand2() { return Math.floor(Math.random() * 10) + 1; }
  function setQuestion(a, b) { qEl.textContent = a + ' + ' + b + ' ='; }

  var alertEl = null;
  function showAlert(msg) {
    clearAlert();
    alertEl = document.createElement('div');
    alertEl.className = 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg';
    var p = document.createElement('p');
    p.className = 'text-sm';
    p.textContent = msg;
    alertEl.appendChild(p);
    var submit = form.querySelector('button[type=submit]');
    submit.parentNode.insertBefore(alertEl, submit);
  }
  function clearAlert() {
    if (alertEl) { alertEl.remove(); alertEl = null; }
  }

  var n1 = rand1(), n2 = rand2();
  setQuestion(n1, n2);

  if (refreshBtn) refreshBtn.addEventListener('click', resetCaptcha);

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearAlert();
    var b1 = parseInt(qEl.textContent) || 0;
    var m = qEl.textContent.match(/(\d+)\s*\+\s*(\d+)/);
    var expect = m ? (parseInt(m[1], 10) + parseInt(m[2], 10)) : NaN;
    if (parseInt(inputEl.value) !== expect) {
      captchaErr = true;
      capBox.classList.remove('border-gray-300', 'bg-white');
      capBox.classList.add('border-red-300', 'bg-red-50');
      inputEl.classList.remove('border-gray-300');
      inputEl.classList.add('border-red-300');
      showAlert('Please solve the math problem correctly');
      return;
    }
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var phone = form.querySelector('#phone');
    var message = form.querySelector('#message');
    var payload = {
      name: name.value, email: email.value,
      phone: phone.value, message: message.value
    };
    setSending(true);
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('Failed to send message');
      successState();
      name.value = ''; email.value = ''; phone.value = ''; message.value = '';
      resetCaptcha();
      setTimeout(function () { restoreButton(); }, 5000);
      setSending(false);
    }).catch(function (err) {
      console.error('Error sending message:', err);
      sendLabel.textContent = 'Send Message';
      setSpinnerIcon(sendMessageIcon);
      showAlert(err && err.message ? err.message : 'Failed to send message. Please try again.');
      setSending(false);
    });
  });

  var submitBtn = form.querySelector('button[type=submit]');
  var sendLabel = submitBtn.querySelector('span');

  var sendMessageIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send h-5 w-5"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>';
  var sentCheckIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle2 h-5 w-5"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>';
  function setSpinnerIcon(html) {
    var inner = submitBtn.querySelector('svg, .animate-spin');
    if (inner) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      inner.replaceWith(tmp.firstChild);
    }
  }
  function setSending(on) {
    submitBtn.disabled = on;
    if (on) {
      submitBtn.classList.remove('bg-orange-600');
      submitBtn.classList.add('bg-gray-400');
      setSpinnerIcon('<div class="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>');
      sendLabel.textContent = 'Sending...';
    }
  }
  function successState() {
    submitBtn.classList.remove('bg-gray-400');
    submitBtn.classList.add('bg-green-600');
    setSpinnerIcon(sentCheckIcon);
    sendLabel.textContent = 'Message Sent!';
  }
  function restoreButton() {
    clearAlert();
    submitBtn.disabled = false;
    submitBtn.classList.remove('bg-green-600', 'bg-gray-400');
    submitBtn.classList.add('bg-orange-600');
    setSpinnerIcon(sendMessageIcon);
    sendLabel.textContent = 'Send Message';
  }
})();
