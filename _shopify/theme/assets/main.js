/* ============================================================
   ICEGLER — main.js (Shopify theme build)
   Motion engine + Shopify cart wiring for the "Shaped by light"
   design. Chrome (nav/footer/drawer) is server-rendered in Liquid;
   this file binds behaviour. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var page = body.getAttribute('data-page') || '';
  var ENV = window.ICEGLER_ENV || { currency: 'EUR', freeShipCents: 25000, cartCount: 0, routes: {} };
  var R = ENV.routes || {};
  var CART_URL = (R.cart || '/cart');
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(pointer: fine)');
  var STATIC = /[?&]static\b/.test(window.location.search);
  var RM = mqRM.matches || STATIC;
  if (RM) doc.documentElement.classList.add('rm');
  if (STATIC) {
    var st = doc.createElement('style');
    st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}' +
      '[data-reveal],.product-card{opacity:1!important;transform:none!important;clip-path:none!important}' +
      '.hero,.cover,.lost{min-height:900px!important}';
    doc.head.appendChild(st);
  }

  /* ---------- 1. Money ---------- */
  function money(cents) {
    var whole = cents % 100 === 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency: ENV.currency,
        minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2
      }).format(cents / 100);
    } catch (e) { return (cents / 100).toFixed(whole ? 0 : 2) + ' ' + ENV.currency; }
  }
  window.ICEGLER = { money: money };

  /* ---------- 2. Shopify cart (AJAX) ---------- */
  var drawer = doc.getElementById('cart-drawer');
  var cartVeil = doc.getElementById('cart-veil');

  function fetchCart() {
    return fetch(CART_URL + '.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); });
  }
  function cartAdd(id, qty) {
    return fetch(CART_URL + '/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: id, quantity: qty || 1 }] })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw e; });
      return r.json();
    });
  }
  function cartChange(key, qty) {
    return fetch(CART_URL + '/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    }).then(function (r) { return r.json(); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderDrawer(cart) {
    if (!drawer) return;
    var count = cart.item_count;
    doc.querySelectorAll('[data-cart-count]').forEach(function (b) {
      b.textContent = count; b.hidden = count === 0;
    });
    var inline = drawer.querySelector('[data-cart-count-inline]');
    if (inline) inline.textContent = count;

    var has = count > 0;
    drawer.querySelector('.drawer-empty').hidden = has;
    drawer.querySelector('.drawer-items').hidden = !has;
    drawer.querySelector('.drawer-foot').hidden = !has;
    drawer.querySelector('.drawer-ship').hidden = !has;
    if (!has) return;

    var label = drawer.querySelector('.drawer-ship-label');
    var bar = drawer.querySelector('.progress i');
    var sub = cart.total_price;
    if (sub >= ENV.freeShipCents) {
      label.textContent = 'You’ve unlocked free shipping. ❄'; bar.style.width = '100%';
    } else {
      label.textContent = 'Add ' + money(ENV.freeShipCents - sub) + ' for free shipping';
      bar.style.width = (sub / ENV.freeShipCents * 100).toFixed(1) + '%';
    }

    drawer.querySelector('.drawer-items').innerHTML = cart.items.map(function (it) {
      var img = it.image ? it.image.replace(/(\.[a-z]{3,4})(\?|$)/i, '_152x152$1$2') : '';
      var variantLine = (it.variant_title && it.variant_title !== 'Default Title')
        ? '<p class="small muted">' + esc(it.variant_title.split(' / ').join(' · ')) + '</p>' : '';
      return '<li data-line-key="' + esc(it.key) + '">' +
        (img ? '<img src="' + esc(img) + '" alt="' + esc(it.title) + '" width="76" height="76" loading="lazy">'
             : '<span class="ice-field" style="width:76px;height:76px;border-radius:2px;"></span>') +
        '<div>' +
          '<p style="font-weight:600;font-size:15px;">' + esc(it.product_title) + '</p>' +
          variantLine +
          '<div style="display:flex;align-items:center;gap:14px;margin-top:10px;">' +
            '<span class="qty"><button data-qty="-1" aria-label="Decrease quantity">−</button>' +
            '<output>' + it.quantity + '</output>' +
            '<button data-qty="1" aria-label="Increase quantity">+</button></span>' +
            '<button class="remove-link" data-remove>Remove</button>' +
          '</div>' +
        '</div>' +
        '<span class="price">' + money(it.final_line_price) + '</span>' +
      '</li>';
    }).join('');
    var subEl = drawer.querySelector('.drawer-subtotal');
    if (subEl) subEl.textContent = money(sub);
    var co = drawer.querySelector('.drawer-checkout');
    if (co) co.textContent = 'Checkout — ' + money(sub);
  }

  var lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    cartVeil.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    body.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = doc.activeElement; drawer.querySelector('[data-cart-close]').focus(); }
    else if (lastFocus) { try { lastFocus.focus(); } catch (e) {} lastFocus = null; }
  }
  function openDrawer() { fetchCart().then(renderDrawer).then(function () { setDrawer(true); }); }
  window.ICEGLER.cart = { open: openDrawer, close: function () { setDrawer(false); }, add: cartAdd, change: cartChange, fetch: fetchCart };

  doc.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-cart-open]'))) { e.preventDefault(); openDrawer(); return; }
    if (e.target.closest('[data-cart-close]')) { setDrawer(false); return; }
    if ((t = e.target.closest('[data-add-to-cart]'))) {
      var parts = t.getAttribute('data-add-to-cart').split(':');
      var id = parseInt(parts[0], 10);
      if (!id) return; // not a resolvable variant — let native behaviour happen
      e.preventDefault();
      t.setAttribute('aria-busy', 'true');
      cartAdd(id, parseInt(parts[1] || '1', 10))
        .then(openDrawer)
        .catch(function (err) {
          t.textContent = (err && err.description) ? err.description : 'Unavailable';
        })
        .finally(function () { t.removeAttribute('aria-busy'); });
      return;
    }
    if ((t = e.target.closest('#cart-drawer [data-qty]'))) {
      var li = t.closest('li'); var key = li.getAttribute('data-line-key');
      var out = li.querySelector('output');
      var next = Math.max(0, parseInt(out.textContent, 10) + parseInt(t.getAttribute('data-qty'), 10));
      cartChange(key, next).then(renderDrawer);
      return;
    }
    if ((t = e.target.closest('#cart-drawer [data-remove]'))) {
      var li2 = t.closest('li'); var key2 = li2.getAttribute('data-line-key');
      li2.classList.add('removing');
      setTimeout(function () { cartChange(key2, 0).then(renderDrawer); }, RM ? 0 : 240);
      return;
    }
    // cart PAGE steppers/remove: change then reload for authoritative totals
    if ((t = e.target.closest('[data-cart-line][data-qty-delta]'))) {
      e.preventDefault();
      var key3 = t.getAttribute('data-cart-line');
      var cur = parseInt(t.getAttribute('data-current'), 10) || 0;
      var q = Math.max(0, cur + parseInt(t.getAttribute('data-qty-delta'), 10));
      cartChange(key3, q).then(function () { window.location.reload(); });
      return;
    }
    if ((t = e.target.closest('[data-cart-line][data-line-remove]'))) {
      e.preventDefault();
      cartChange(t.getAttribute('data-cart-line'), 0).then(function () { window.location.reload(); });
      return;
    }
  });
  if (cartVeil) cartVeil.addEventListener('click', function () { setDrawer(false); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (drawer && drawer.classList.contains('open')) setDrawer(false);
      var menu = doc.getElementById('menu-overlay');
      if (menu && menu.classList.contains('open')) setMenu(false);
    }
  });

  // product form: enhance native /cart/add POST into AJAX + drawer
  doc.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f.matches('form[action*="/cart/add"]')) return;
    e.preventDefault();
    var fd = new FormData(f);
    var id = parseInt(fd.get('id'), 10);
    var qty = parseInt(fd.get('quantity') || '1', 10);
    if (!id) { f.submit(); return; }
    var btn = f.querySelector('[type="submit"]');
    if (btn) btn.setAttribute('aria-busy', 'true');
    cartAdd(id, qty)
      .then(openDrawer)
      .catch(function (err) {
        if (btn) btn.textContent = (err && err.description) ? err.description : 'Unavailable';
      })
      .finally(function () { if (btn) btn.removeAttribute('aria-busy'); });
  });

  /* ---------- 3. Nav behaviour ---------- */
  var nav = doc.getElementById('site-nav');
  var mainEl = doc.getElementById('main');
  var firstSection = mainEl && mainEl.querySelector('.shopify-section > *, :scope > *');
  var overDusk = firstSection && (firstSection.classList.contains('section-dusk') ||
                 firstSection.querySelector(':scope > .section-dusk') ||
                 (firstSection.firstElementChild && firstSection.firstElementChild.classList &&
                  firstSection.firstElementChild.classList.contains('section-dusk')));
  if (overDusk && nav) nav.classList.add('on-dusk');
  function onScrollNav() {
    if (!nav) return;
    var sc = window.scrollY > 32;
    nav.classList.toggle('scrolled', sc);
    if (overDusk) nav.classList.toggle('on-dusk', !sc);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  var menu = doc.getElementById('menu-overlay');
  var burger = nav && nav.querySelector('.nav-burger');
  var menuClose = doc.getElementById('menu-close');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (burger) burger.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
    if (open && menuClose) menuClose.focus();
  }
  if (burger) burger.addEventListener('click', function () { setMenu(true); });
  if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ---------- 4. Reveal system ---------- */
  (function () {
    var toWatch = [];
    doc.querySelectorAll('[data-reveal-group]').forEach(function (g) {
      Array.prototype.slice.call(g.children).forEach(function (k, i) {
        if (!k.hasAttribute('data-reveal')) k.setAttribute('data-reveal', '');
        var extra = parseInt(k.getAttribute('data-reveal-delay') || '0', 10);
        k.style.transitionDelay = (extra + i * 90) + 'ms';
      });
    });
    doc.querySelectorAll('[data-reveal]').forEach(function (n) {
      var extra = parseInt(n.getAttribute('data-reveal-delay') || '0', 10);
      if (extra && !n.style.transitionDelay) n.style.transitionDelay = extra + 'ms';
      toWatch.push(n);
    });
    if (STATIC || !('IntersectionObserver' in window)) {
      toWatch.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    toWatch.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 5. Counters ---------- */
  (function () {
    var els = doc.querySelectorAll('[data-count-to]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var elc = en.target, target = parseFloat(elc.getAttribute('data-count-to'));
        if (RM) { elc.textContent = String(target); return; }
        var t0 = performance.now(), dur = 1100;
        (function tick(t) {
          var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
          elc.textContent = String(Math.round(target * k));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 6. Parallax + tilt + cursor (single rAF loop) ---------- */
  var pxItems = [];
  doc.querySelectorAll('[data-parallax]').forEach(function (n) {
    pxItems.push({ el: n, f: parseFloat(n.getAttribute('data-parallax')) || 0.15, cur: 0, tgt: 0 });
  });
  var tiltEl = doc.querySelector('[data-tilt]');
  var tilt = { rx: 0, ry: 0, trx: 0, try_: 0 };
  if (tiltEl && mqFine.matches && !RM) {
    tiltEl.addEventListener('pointermove', function (e) {
      var r = tiltEl.getBoundingClientRect();
      tilt.try_ = ((e.clientX - r.left) / r.width - 0.5) * 8;
      tilt.trx = -((e.clientY - r.top) / r.height - 0.5) * 6;
    });
    tiltEl.addEventListener('pointerleave', function () { tilt.trx = 0; tilt.try_ = 0; });
  }

  function el(html) {
    var t = doc.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  var cursorOn = mqFine.matches && !RM;
  var cdot, cring, clabel, mx = -100, my = -100, rx = -100, ry = -100;
  if (cursorOn) {
    cdot = el('<div id="cursor-dot" aria-hidden="true"></div>');
    cring = el('<div id="cursor-ring" aria-hidden="true"><span class="cursor-label"></span></div>');
    body.appendChild(cdot); body.appendChild(cring);
    clabel = cring.querySelector('.cursor-label');
    doc.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      body.classList.add('cursor-on');
      var t = e.target;
      var hov = t.closest && t.closest('a,button,[data-cursor],input,select,textarea,label');
      body.classList.toggle('cursor-hover', !!hov && !t.closest('input,select,textarea'));
      var cz = t.closest && t.closest('[data-cursor]');
      clabel.textContent = cz ? (cz.getAttribute('data-cursor') || '') : '';
      var dark = t.closest && t.closest('.section-dusk,#site-footer,#menu-overlay,.ice-field.deep,[data-cursor-dark]');
      body.classList.toggle('cursor-dark', !!dark);
    }, { passive: true });
    doc.addEventListener('pointerleave', function () { body.classList.remove('cursor-on'); });
  }

  var vh = window.innerHeight;
  window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });
  function frame() {
    if (!RM) {
      for (var i = 0; i < pxItems.length; i++) {
        var it = pxItems[i], r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        it.tgt = ((r.top + r.height / 2) - vh / 2) * -it.f;
        it.cur += (it.tgt - it.cur) * 0.09;
        it.el.style.transform = 'translate3d(0,' + it.cur.toFixed(2) + 'px,0)';
      }
      if (tiltEl) {
        tilt.rx += (tilt.trx - tilt.rx) * 0.08;
        tilt.ry += (tilt.try_ - tilt.ry) * 0.08;
        tiltEl.style.transform = 'perspective(900px) rotateX(' + tilt.rx.toFixed(2) + 'deg) rotateY(' + tilt.ry.toFixed(2) + 'deg)';
      }
    }
    if (cursorOn) {
      cdot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      cring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 7. Marquee ---------- */
  doc.querySelectorAll('[data-marquee]').forEach(function (m) {
    var text = m.textContent.trim();
    m.textContent = '';
    var track = el('<span class="marquee-track" aria-hidden="true"></span>');
    for (var i = 0; i < 2; i++) {
      var half = doc.createElement('span');
      for (var j = 0; j < 6; j++) {
        var c = doc.createElement('span');
        c.className = 'marquee-chunk'; c.textContent = text;
        half.appendChild(c);
      }
      track.appendChild(half);
    }
    var sr = doc.createElement('span');
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';
    sr.textContent = text;
    m.appendChild(sr); m.appendChild(track);
    m.style.setProperty('--marquee-dur', Math.max(28, text.length * 1.15) + 's');
  });

  /* ---------- 8. Product-card image swap ---------- */
  doc.querySelectorAll('.product-card .card-media img[data-swap-src]').forEach(function (img) {
    img.classList.add('swap-main');
    var alt = doc.createElement('img');
    alt.src = img.getAttribute('data-swap-src');
    alt.alt = ''; alt.setAttribute('aria-hidden', 'true');
    alt.loading = 'lazy'; alt.className = 'swap-alt';
    alt.width = img.width || 800; alt.height = img.height || 800;
    img.parentElement.appendChild(alt);
  });

  /* ---------- 9. Page transitions ---------- */
  var veil = doc.getElementById('veil');
  window.addEventListener('pageshow', function () { if (veil) veil.classList.remove('on'); });
  doc.addEventListener('click', function (e) {
    if (RM || !veil) return;
    var a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    if (a.hasAttribute('data-no-veil')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href) && a.origin !== window.location.origin) return;
    var url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname.indexOf('/checkout') === 0 || url.pathname.indexOf('/account') === 0) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    e.preventDefault();
    veil.classList.add('on');
    setTimeout(function () { window.location.href = url.href; }, 290);
  });

  /* ---------- 10. Preloader (home, once per session) ---------- */
  if (page === 'home' && !RM && !STATIC) {
    var seen = false;
    try { seen = sessionStorage.getItem('icegler_pre') === '1'; } catch (e) {}
    if (!seen) {
      try { sessionStorage.setItem('icegler_pre', '1'); } catch (e) {}
      var pre = el('<div id="preloader" aria-hidden="true"><span class="pre-mark">Icegler</span></div>');
      body.appendChild(pre);
      setTimeout(function () {
        pre.classList.add('done');
        setTimeout(function () { pre.remove(); }, 650);
      }, 1450);
    }
  }
})();
