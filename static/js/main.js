// York Computer Help — interaction shim (replaces the React runtime of the live SPA)
(function () {
  'use strict';

  // --- smooth-scroll nav buttons (fall back to home anchors off the home page) ---
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-goto]');
    if (!btn) return;
    var id = btn.getAttribute('data-goto');
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#' + id;
    }
    var menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
  });

  // --- honour #hash navigation (native hash scroll is unreliable on this SPA clone) ---
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); }, 60);
  }

  // --- mobile menu toggle ---
  var burger = document.querySelector('header button.md\\:hidden');
  if (burger) burger.addEventListener('click', function () {
    var menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  });

  // --- contact form: client-side math-captcha gate, then normal POST to /submit.php ---
  var form = document.querySelector('#contact form');
  if (!form) return;
  var qEl = form.querySelector('span.text-lg.font-semibold');
  var inputEl = form.querySelector('#captcha');
  var capBox = inputEl.closest('div');
  var refreshBtn = capBox.nextElementSibling;
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
  function setQuestion(a, b) { qEl.textContent = a + ' + ' + b + ' ='; }
  function rand() { return Math.floor(Math.random() * 10) + 1; }
  function newCaptcha() {
    setQuestion(rand(), rand());
    inputEl.value = '';
    capBox.classList.remove('border-red-300', 'bg-red-50');
    capBox.classList.add('border-gray-300', 'bg-white');
    inputEl.classList.remove('border-red-300');
    inputEl.classList.add('border-gray-300');
    clearAlert();
  }

  var n1 = rand(), n2 = rand();
  setQuestion(n1, n2);

  if (refreshBtn) refreshBtn.addEventListener('click', newCaptcha);

  form.addEventListener('submit', function (ev) {
    var m = qEl.textContent.match(/(\d+)\s*\+\s*(\d+)/);
    var expect = m ? (parseInt(m[1], 10) + parseInt(m[2], 10)) : NaN;
    if (parseInt(inputEl.value) !== expect) {
      ev.preventDefault();
      capBox.classList.remove('border-gray-300', 'bg-white');
      capBox.classList.add('border-red-300', 'bg-red-50');
      inputEl.classList.remove('border-gray-300');
      inputEl.classList.add('border-red-300');
      showAlert('Please solve the math problem correctly');
      return;
    }
  });
})();
