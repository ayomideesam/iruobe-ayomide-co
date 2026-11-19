// Iruobe Ayomide Co.: reveal-on-scroll, mobile menu, supplier enquiry form, footer year.
(function () {
  var CONTACT_EMAIL = 'iruobeakhigbe@gmail.com';

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

  /* ---------- Supplier enquiry form ---------- */
  var form = document.querySelector('.form');
  if (form) {
    var status = form.querySelector('.form__status');
    var labels = {
      company: 'Company or brand', name: 'Name', email: 'Email', website: 'Website',
      type: 'They are a', categories: 'Product categories', message: 'Message'
    };

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
      wrap.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      var err = wrap.querySelector('.field__error');
      if (err) err.textContent = '';
    }

    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('input', function () { clearError(f); });
      f.addEventListener('change', function () { clearError(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
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
      if (firstInvalid) { firstInvalid.focus(); return; }

      var data = new FormData(form);
      var lines = [];
      Object.keys(labels).forEach(function (key) {
        var value = (data.get(key) || '').toString().trim();
        if (value) lines.push(labels[key] + ': ' + value);
      });
      var subject = 'Supplier enquiry: ' + (data.get('company') || '').toString().trim();
      var body = 'Hello Iruobe Ayomide Co.,\n\n' + lines.join('\n') + '\n\nSent from the supplier form on your website.';
      var href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      var link = document.createElement('a');
      link.href = href;
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      status.hidden = false;
    });

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
