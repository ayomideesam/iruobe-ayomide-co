// Iruobe Ayomide Co.: reveal-on-scroll, mobile menu, supplier enquiry form, WhatsApp links, footer year.
(function () {
  var CONFIG = {
    email: 'iruobeakhigbe@gmail.com',
    whatsapp: '2347038772342' // international format, digits only
  };
  // The Web3Forms access key lives on the form element (data-access-key) in index.html. It's public by design.
  // While it's empty, the form falls back to opening the visitor's email app.

  /* ---------- Reveal on scroll ---------- */
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); }) : [];
        var index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(index * 80, 400) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Sticky nav + mobile menu ---------- */
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('site-menu');

  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 1040px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- WhatsApp helpers ---------- */
  function waUrl(text) {
    return 'https://wa.me/' + CONFIG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  // Pre-fill a friendly greeting on every plain WhatsApp link.
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-wa'));
  });
  function openLink(href, newTab) {
    var link = document.createElement('a');
    link.href = href;
    if (newTab) { link.target = '_blank'; link.rel = 'noopener'; }
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /* ---------- Supplier enquiry form ---------- */
  var form = document.querySelector('.form');
  if (form) {
    var sendBtn = form.querySelector('.form__send');
    var sendLabel = form.querySelector('.form__send-label');
    var waBtn = form.querySelector('.form__wa');
    var statuses = {};
    form.querySelectorAll('[data-status]').forEach(function (el) { statuses[el.getAttribute('data-status')] = el; });

    var FIELDS = [
      ['company', 'Company'], ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone/WhatsApp'],
      ['website', 'Website'], ['type', 'They are a'], ['categories', 'Categories'], ['message', 'Message']
    ];

    function showStatus(key) {
      Object.keys(statuses).forEach(function (k) { statuses[k].hidden = k !== key; });
      if (key && statuses[key]) statuses[key].focus({ preventScroll: true });
    }

    function showError(field, message) {
      var wrap = field.closest('.field');
      wrap.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      var err = wrap.querySelector('.field__error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field__error';
        err.id = field.id + '-error';
        wrap.appendChild(err);
        field.setAttribute('aria-describedby', err.id);
      }
      err.textContent = message;
    }
    function clearError(field) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      var err = wrap.querySelector('.field__error');
      if (err) err.textContent = '';
    }
    form.querySelectorAll('.field input, .field select, .field textarea').forEach(function (f) {
      f.addEventListener('input', function () { clearError(f); });
      f.addEventListener('change', function () { clearError(f); });
    });

    function validate() {
      var firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        if (!f.checkValidity()) {
          var msg = f.validity.valueMissing ? 'Please fill this in.' : (f.type === 'email' ? 'Please enter a valid email address.' : 'Please check this field.');
          showError(f, msg);
          if (!firstInvalid) firstInvalid = f;
        } else {
          clearError(f);
        }
      });
      if (firstInvalid) { firstInvalid.focus(); return false; }
      return true;
    }

    function values() {
      var data = new FormData(form);
      var out = {};
      FIELDS.forEach(function (pair) { out[pair[0]] = (data.get(pair[0]) || '').toString().trim(); });
      out.botcheck = (data.get('botcheck') || '').toString();
      return out;
    }

    function plainSummary(v) {
      return FIELDS.filter(function (p) { return v[p[0]]; }).map(function (p) { return p[1] + ': ' + v[p[0]]; }).join('\n');
    }

    function setSending(sending) {
      sendBtn.disabled = sending;
      sendBtn.classList.toggle('is-loading', sending);
      sendLabel.textContent = sending ? 'Sending…' : 'Send enquiry';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showStatus(null);
      if (!validate()) return;
      var v = values();
      if (v.botcheck) { form.reset(); showStatus('ok'); return; } // silently drop bots

      var subject = 'Supplier enquiry: ' + v.company;

      var accessKey = (form.getAttribute('data-access-key') || '').trim();
      if (!accessKey) {
        var body = 'Hello Iruobe Ayomide Co.,\n\n' + plainSummary(v) + '\n\nSent from the supplier form on your website.';
        openLink('mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body));
        showStatus('mail');
        return;
      }

      setSending(true);
      var payload = {
        access_key: accessKey,
        subject: subject,
        from_name: 'Iruobe Ayomide Co. website',
        replyto: v.email
      };
      FIELDS.forEach(function (p) { if (v[p[0]]) payload[p[1]] = v[p[0]]; });

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (json) { return { ok: res.ok && json.success !== false }; }); })
        .then(function (r) {
          if (r.ok) { form.reset(); showStatus('ok'); } else { showStatus('error'); }
        })
        .catch(function () { showStatus('error'); })
        .then(function () { setSending(false); });
    });

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        showStatus(null);
        if (!validate()) return;
        var v = values();
        var lines = ['Hello Iruobe Ayomide Co. 👋', "I'd like to talk about supplying your business.", ''];
        FIELDS.forEach(function (p) {
          if (!v[p[0]]) return;
          lines.push(p[0] === 'message' ? '' : null);
          lines.push('*' + p[1] + ':* ' + v[p[0]]);
        });
        var text = lines.filter(function (l) { return l !== null; }).join('\n');
        openLink(waUrl(text), true);
      });
    }

    var copyBtn = form.querySelector('[data-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = copyBtn.getAttribute('data-copy');
        var done = function () { copyBtn.textContent = 'Copied ✓'; setTimeout(function () { copyBtn.textContent = 'Copy email address'; }, 2000); };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var t = document.createElement('textarea');
          t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
          document.body.appendChild(t); t.select();
          try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
          document.body.removeChild(t);
        }
      });
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
