/* ============================================================
   ICEGLER — main.js
   Shared chrome (nav / footer / cart drawer), commerce data,
   and the motion engine for the "Shaped by light" revamp.
   No dependencies. See _build/DESIGN-SPEC.md §4–5 for the API.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. Environment ---------- */
  var doc = document;
  var body = doc.body;
  var page = body.getAttribute('data-page') || '';
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(pointer: fine)');
  // ?static — QA/review mode: render the final resting state with no motion
  var STATIC = /[?&]static\b/.test(window.location.search);
  var RM = mqRM.matches || STATIC;
  if (RM) doc.documentElement.classList.add('rm');
  if (STATIC) {
    var st = doc.createElement('style');
    st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}' +
      '[data-reveal],.product-card{opacity:1!important;transform:none!important;clip-path:none!important}' +
      '.hero,.cover,.lost{min-height:900px!important}'; /* tall QA viewports: cap 100svh plates */
    doc.head.appendChild(st);
  }

  /* ---------- 1. Commerce data ---------- */
  var PRODUCTS = {
    solstice: {
      id: 'solstice', name: 'The Solstice', shape: 'Angular', price: 245, badge: 'New',
      tagline: 'Double-bridge. The edge.',
      colorways: [
        { name: 'Glacier',  lens: 'Blue gradient',  material: 'Bio-acetate', dot: '#C9DFE5',
          img: 'assets/solstice-front.jpeg', alt: 'assets/solstice-angle.jpeg' },
        { name: 'Eclipse',  lens: 'Blue gradient',  material: 'Titanium',    dot: '#2B3238',
          img: null, alt: null, comingSoon: true }
      ]
    },
    drift: {
      id: 'drift', name: 'The Drift', shape: 'Rounded', price: 210, badge: null,
      tagline: 'Soft oval. Quiet and light.',
      colorways: [
        { name: 'Basalt',  lens: 'Polarized grey', material: 'Bio-acetate', dot: '#15191B',
          img: 'assets/drift-basalt.jpeg',  alt: 'assets/drift-glacier.jpeg' },
        { name: 'Glacier', lens: 'Smoke',          material: 'Bio-acetate', dot: '#C9DFE5',
          img: 'assets/drift-glacier.jpeg', alt: 'assets/drift-basalt.jpeg' }
      ]
    },
    basalt: {
      id: 'basalt', name: 'The Basalt', shape: 'Square', price: 230, badge: null,
      tagline: 'Bold unisex. Warm and dark.',
      colorways: [
        { name: 'Driftwood', lens: 'Polarized grey', material: 'Bio-acetate', dot: '#8A6B4F',
          img: 'assets/basalt-driftwood.jpeg', alt: 'assets/basalt-meltwater.jpeg' },
        { name: 'Meltwater', lens: 'Smoke',          material: 'Bio-acetate', dot: '#9FB6BD',
          img: 'assets/basalt-meltwater.jpeg', alt: 'assets/basalt-driftwood.jpeg' }
      ]
    }
  };
  var FREE_SHIP = 250;
  var CART_KEY = 'icegler_cart_v1';

  function eur(n) { return '€' + Math.round(n); }
  function findColorway(frame, color) {
    var p = PRODUCTS[frame];
    if (!p) return null;
    for (var i = 0; i < p.colorways.length; i++) {
      if (p.colorways[i].name.toLowerCase() === String(color).toLowerCase()) return p.colorways[i];
    }
    return null;
  }

  /* ---------- 2. Cart store ---------- */
  var cart = (function () {
    var items = [];
    function load() {
      try {
        var raw = localStorage.getItem(CART_KEY);
        items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items)) items = [];
      } catch (e) { items = []; }
      // keep only lines that still resolve to a live, purchasable SKU
      items = items.filter(function (it) {
        var cw = it && findColorway(it.frame, it.color);
        return cw && !cw.comingSoon;
      });
    }
    function save() {
      try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
      window.dispatchEvent(new CustomEvent('icegler:cart-changed'));
    }
    function keyOf(frame, color) { return frame + '|' + color; }
    return {
      load: load,
      items: function () { return items.slice(); },
      count: function () { return items.reduce(function (n, it) { return n + it.qty; }, 0); },
      subtotal: function () {
        return items.reduce(function (n, it) {
          var p = PRODUCTS[it.frame];
          return n + (p ? p.price * it.qty : 0);
        }, 0);
      },
      add: function (frame, color, qty) {
        var cw = findColorway(frame, color);
        if (!cw || cw.comingSoon) return false;
        var id = keyOf(frame, color);
        var line = items.find(function (it) { return it.id === id; });
        if (line) line.qty += (qty || 1);
        else items.push({ id: id, frame: frame, color: cw.name, qty: qty || 1 });
        save(); return true;
      },
      setQty: function (id, qty) {
        var line = items.find(function (it) { return it.id === id; });
        if (!line) return;
        line.qty = Math.max(0, qty | 0);
        if (line.qty === 0) items = items.filter(function (it) { return it.id !== id; });
        save();
      },
      remove: function (id) { items = items.filter(function (it) { return it.id !== id; }); save(); },
      clear: function () { items = []; save(); }
    };
  })();
  cart.load();

  window.ICEGLER = { products: PRODUCTS, cart: cart, eur: eur, findColorway: findColorway, FREE_SHIP: FREE_SHIP };

  /* ---------- 3. Icons ---------- */
  var IC = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- 4. Inject chrome ---------- */
  function el(html) {
    var t = doc.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // skip link
  body.insertBefore(el('<a class="skip-link" href="#main">Skip to content</a>'), body.firstChild);

  // nav
  var NAV_LINKS = [
    { href: 'collection.html', label: 'Shop',     key: 'collection' },
    { href: 'lookbook.html',   label: 'Lookbook', key: 'lookbook' },
    { href: 'story.html',      label: 'Story',    key: 'story' },
    { href: 'contact.html',    label: 'Stores',   key: 'contact' }
  ];
  function navA(l) {
    var cur = (page === l.key) ? ' aria-current="page"' : '';
    return '<a href="' + l.href + '"' + cur + '>' + l.label + '</a>';
  }
  var nav = el(
    '<header id="site-nav">' +
      '<div class="nav-inner">' +
        '<nav class="nav-links" aria-label="Primary">' +
          NAV_LINKS.slice(0, 3).map(navA).join('') +
        '</nav>' +
        '<button class="nav-burger nav-icon" aria-label="Open menu" aria-expanded="false">' + IC.burger + '</button>' +
        '<a class="nav-logo" href="index.html" aria-label="Icegler — home">Icegler</a>' +
        '<div class="nav-right">' +
          '<nav class="nav-links" aria-label="Secondary">' + navA(NAV_LINKS[3]) + '</nav>' +
          '<button class="nav-icon" data-cart-open aria-label="Open bag">' + IC.bag +
            '<span class="cart-badge" data-cart-count hidden>0</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>'
  );
  body.insertBefore(nav, doc.getElementById('main'));

  // mobile menu overlay
  var menu = el(
    '<div id="menu-overlay" aria-hidden="true">' +
      '<button id="menu-close" class="nav-icon" aria-label="Close menu">' + IC.close + '</button>' +
      '<nav class="menu-links" aria-label="Menu">' +
        NAV_LINKS.map(function (l, i) {
          return '<a href="' + l.href + '" style="transition-delay:' + (80 + i * 70) + 'ms">' + l.label + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="menu-foot"><span class="coord">Designed in Reykjavík — 64°08′N</span></div>' +
    '</div>'
  );
  body.appendChild(menu);

  // footer
  var showNews = body.getAttribute('data-newsletter') !== 'off';
  var footer = el(
    '<footer id="site-footer" class="section-dusk">' +
      '<div class="container">' +
        (showNews ?
        '<div class="footer-news">' +
          '<p class="eyebrow on-dark">The newsletter</p>' +
          '<h2 class="d-l" style="margin-top:18px;">Join the <em>Cold</em> Club.</h2>' +
          '<p class="lead" style="max-width:46ch;margin-top:20px;">Early access to drops, the winter lookbook, and a little Reykjavík in your inbox. No noise.</p>' +
          '<form class="news-form js-newsletter" novalidate>' +
            '<input type="email" required placeholder="your@email.com" aria-label="Email address">' +
            '<button type="submit">Subscribe <span class="arr">→</span></button>' +
          '</form>' +
          '<p class="small news-note" style="margin-top:12px;color:rgba(252,253,253,.45);">We send rarely. Unsubscribe anytime.</p>' +
        '</div>' : '<div style="height:clamp(56px,8vh,88px);"></div>') +
        '<div class="footer-cols">' +
          '<div>' +
            '<p style="max-width:30ch;font-size:15px;color:var(--snow-dim);">Premium sunglasses designed in Reykjavík and shaped by Icelandic light.</p>' +
            '<p class="coord" style="margin-top:22px;">64°08′46″N — 21°56′24″W</p>' +
          '</div>' +
          '<div><h4>Shop</h4><ul>' +
            '<li><a href="product.html?frame=solstice&color=Glacier">The Solstice</a></li>' +
            '<li><a href="product.html?frame=drift&color=Basalt">The Drift</a></li>' +
            '<li><a href="product.html?frame=basalt&color=Driftwood">The Basalt</a></li>' +
            '<li><a href="collection.html">All frames</a></li>' +
          '</ul></div>' +
          '<div><h4>Brand</h4><ul>' +
            '<li><a href="story.html">Our story</a></li>' +
            '<li><a href="lookbook.html">Lookbook</a></li>' +
            '<li><a href="story.html">Sustainability</a></li>' +
            '<li><a href="contact.html">Stores</a></li>' +
          '</ul></div>' +
          '<div><h4>Care</h4><ul>' +
            '<li><a href="contact.html">Shipping &amp; returns</a></li>' +
            '<li><a href="contact.html">FAQ</a></li>' +
            '<li><a href="contact.html">Lens guide</a></li>' +
            '<li><a href="contact.html">Contact</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer-meta">' +
          '<span>© 2025 Icegler — Reykjavík, Iceland</span>' +
          '<a href="contact.html">Privacy</a><a href="contact.html">Terms</a>' +
          '<span class="mono" style="margin-left:auto;">EUR €</span>' +
        '</div>' +
      '</div>' +
      '<div class="footer-ghost" aria-hidden="true">Icegler</div>' +
    '</footer>'
  );
  body.appendChild(footer);

  // cart drawer + scrim
  var cartVeil = el('<div id="cart-veil"></div>');
  var drawer = el(
    '<aside id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden="true">' +
      '<header class="drawer-head">' +
        '<span class="h3">Your bag (<span data-cart-count-inline>0</span>)</span>' +
        '<button class="nav-icon" data-cart-close aria-label="Close bag">' + IC.close + '</button>' +
      '</header>' +
      '<div class="drawer-ship"><p class="small drawer-ship-label"></p><div class="progress"><i></i></div></div>' +
      '<ul class="drawer-items"></ul>' +
      '<div class="drawer-empty" hidden>' +
        '<p class="d-m">Your bag is empty</p>' +
        '<p class="muted" style="max-width:30ch;margin-inline:auto;">The cold is calling. Find a frame shaped for the northern light.</p>' +
        '<a class="btn btn-primary" href="collection.html" data-cart-close-nav>Shop the collection</a>' +
      '</div>' +
      '<footer class="drawer-foot">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
          '<span style="font-weight:600;">Subtotal</span><span class="price drawer-subtotal"></span>' +
        '</div>' +
        '<p class="small faint" style="margin-top:-6px;">Shipping &amp; taxes calculated at checkout.</p>' +
        '<a class="btn btn-primary btn-block drawer-checkout" href="checkout.html">Checkout</a>' +
        '<a class="link-underline" style="justify-self:center;" href="cart.html">View full bag</a>' +
      '</footer>' +
    '</aside>'
  );
  body.appendChild(cartVeil);
  body.appendChild(drawer);

  // overlays
  body.appendChild(el('<div id="grain" aria-hidden="true"></div>'));
  var veil = el('<div id="veil" aria-hidden="true"></div>');
  body.appendChild(veil);

  /* ---------- 5. Nav behavior ---------- */
  var firstSection = doc.querySelector('#main > *');
  var overDusk = firstSection && (firstSection.classList.contains('section-dusk') ||
                 firstSection.querySelector(':scope > .section-dusk') ||
                 body.hasAttribute('data-nav-dusk'));
  if (overDusk) nav.classList.add('on-dusk');
  function onScrollNav() {
    var sc = window.scrollY > 32;
    nav.classList.toggle('scrolled', sc);
    if (overDusk) nav.classList.toggle('on-dusk', !sc);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  var burger = nav.querySelector('.nav-burger');
  var menuClose = doc.getElementById('menu-close');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
    if (open) menuClose.focus();
  }
  burger.addEventListener('click', function () { setMenu(true); });
  menuClose.addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ---------- 6. Drawer render & wiring ---------- */
  var itemsUl = drawer.querySelector('.drawer-items');
  var emptyBox = drawer.querySelector('.drawer-empty');
  var footBox = drawer.querySelector('.drawer-foot');
  var shipBox = drawer.querySelector('.drawer-ship');

  function renderCartChrome() {
    var count = cart.count();
    doc.querySelectorAll('[data-cart-count]').forEach(function (b) {
      b.textContent = count; b.hidden = count === 0;
    });
    var inline = drawer.querySelector('[data-cart-count-inline]');
    inline.textContent = count;

    var items = cart.items();
    var has = items.length > 0;
    emptyBox.hidden = has;
    itemsUl.hidden = !has;
    footBox.hidden = !has;
    shipBox.hidden = !has;

    if (has) {
      var sub = cart.subtotal();
      var label = shipBox.querySelector('.drawer-ship-label');
      var bar = shipBox.querySelector('.progress i');
      if (sub >= FREE_SHIP) { label.textContent = 'You’ve unlocked free shipping. ❄'; bar.style.width = '100%'; }
      else { label.textContent = 'Add ' + eur(FREE_SHIP - sub) + ' for free shipping'; bar.style.width = (sub / FREE_SHIP * 100).toFixed(1) + '%'; }

      itemsUl.innerHTML = items.map(function (it) {
        var p = PRODUCTS[it.frame]; var cw = findColorway(it.frame, it.color);
        return '<li data-line="' + it.id + '">' +
          '<img src="' + cw.img + '" alt="' + p.name + ' — ' + cw.name + '" width="76" height="76" loading="lazy">' +
          '<div>' +
            '<p style="font-weight:600;font-size:15px;">' + p.name + '</p>' +
            '<p class="small muted">' + cw.name + ' · ' + cw.lens + '</p>' +
            '<div style="display:flex;align-items:center;gap:14px;margin-top:10px;">' +
              '<span class="qty"><button data-qty="-1" aria-label="Decrease quantity">−</button>' +
              '<output>' + it.qty + '</output>' +
              '<button data-qty="1" aria-label="Increase quantity">+</button></span>' +
              '<button class="remove-link" data-remove>Remove</button>' +
            '</div>' +
          '</div>' +
          '<span class="price">' + eur(p.price * it.qty) + '</span>' +
        '</li>';
      }).join('');
      drawer.querySelector('.drawer-subtotal').textContent = eur(sub);
      drawer.querySelector('.drawer-checkout').textContent = 'Checkout — ' + eur(sub);
    }
    window.dispatchEvent(new CustomEvent('icegler:cart-render'));
  }

  var lastFocus = null;
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    cartVeil.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    body.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = doc.activeElement; drawer.querySelector('[data-cart-close]').focus(); }
    else if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }
  cart.open = function () { renderCartChrome(); setDrawer(true); };
  cart.close = function () { setDrawer(false); };

  doc.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-cart-open]'))) { e.preventDefault(); cart.open(); return; }
    if (e.target.closest('[data-cart-close]')) { setDrawer(false); return; }
    if ((t = e.target.closest('[data-add-to-cart]'))) {
      e.preventDefault();
      var parts = t.getAttribute('data-add-to-cart').split(':');
      if (cart.add(parts[0], parts[1], parseInt(parts[2] || '1', 10))) cart.open();
      return;
    }
    if ((t = e.target.closest('#cart-drawer [data-qty]'))) {
      var li = t.closest('li'); var id = li.getAttribute('data-line');
      var line = cart.items().find(function (it) { return it.id === id; });
      if (line) cart.setQty(id, line.qty + parseInt(t.getAttribute('data-qty'), 10));
      return;
    }
    if ((t = e.target.closest('#cart-drawer [data-remove]'))) {
      var li2 = t.closest('li');
      li2.classList.add('removing');
      var id2 = li2.getAttribute('data-line');
      setTimeout(function () { cart.remove(id2); }, RM ? 0 : 240);
      return;
    }
  });
  cartVeil.addEventListener('click', function () { setDrawer(false); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (drawer.classList.contains('open')) setDrawer(false);
      if (menu.classList.contains('open')) setMenu(false);
    }
  });
  window.addEventListener('icegler:cart-changed', renderCartChrome);
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { cart.load(); renderCartChrome(); } });
  renderCartChrome();

  /* ---------- 7. Newsletter forms ---------- */
  doc.addEventListener('submit', function (e) {
    var f = e.target.closest('.js-newsletter');
    if (!f) return;
    e.preventDefault();
    var input = f.querySelector('input[type="email"]');
    if (!input.value || input.validity.typeMismatch || input.validity.valueMissing) { input.focus(); return; }
    var note = f.parentElement.querySelector('.news-note') || f.querySelector('.news-note');
    if (note) note.textContent = 'Welcome to the Cold Club. ❄ Check your inbox.';
    f.reset();
  });

  /* ---------- 8. Reveal system ---------- */
  (function () {
    var toWatch = [];
    doc.querySelectorAll('[data-reveal-group]').forEach(function (g) {
      var kids = Array.prototype.slice.call(g.children);
      kids.forEach(function (k, i) {
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

  /* ---------- 9. Counters ---------- */
  (function () {
    var els = doc.querySelectorAll('[data-count-to]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var elc = en.target, target = parseFloat(elc.getAttribute('data-count-to'));
        if (RM) { elc.textContent = elc.getAttribute('data-count-format') === 'eur' ? eur(target) : String(target); return; }
        var t0 = performance.now(), dur = 1100;
        (function tick(t) {
          var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
          var v = Math.round(target * k);
          elc.textContent = elc.getAttribute('data-count-format') === 'eur' ? eur(v) : String(v);
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 10. Parallax + tilt + cursor (single rAF loop) ---------- */
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

  /* ---------- 11. Marquee ---------- */
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

  /* ---------- 12. Product-card image swap ---------- */
  doc.querySelectorAll('.product-card .card-media img[data-swap-src]').forEach(function (img) {
    img.classList.add('swap-main');
    var alt = doc.createElement('img');
    alt.src = img.getAttribute('data-swap-src');
    alt.alt = ''; alt.setAttribute('aria-hidden', 'true');
    alt.loading = 'lazy'; alt.className = 'swap-alt';
    alt.width = img.width || 800; alt.height = img.height || 800;
    img.parentElement.appendChild(alt);
  });

  /* ---------- 13. Page transitions ---------- */
  window.addEventListener('pageshow', function () { veil.classList.remove('on'); });
  doc.addEventListener('click', function (e) {
    if (RM) return;
    var a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href)) return;
    if (href.indexOf('.html') === -1) return;
    e.preventDefault();
    if (a.hasAttribute('data-cart-close-nav')) setDrawer(false);
    veil.classList.add('on');
    setTimeout(function () { window.location.href = href; }, 290);
  });

  /* ---------- 14. Preloader (home, once per session) ---------- */
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
  doc.documentElement.classList.remove('preload');
})();
