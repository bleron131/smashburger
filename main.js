(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------------------------------------------------------
     Preloader
  --------------------------------------------------------------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    setTimeout(() => pre && pre.classList.add("done"), 550);
    setTimeout(() => pre && pre.remove(), 1300);
  });

  /* ---------------------------------------------------------------
     Custom cursor
  --------------------------------------------------------------- */
  if (!isCoarse) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .pill, .tab").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  }

  /* ---------------------------------------------------------------
     Scroll progress bar + nav scrolled state
  --------------------------------------------------------------- */
  const progressFill = document.getElementById("progressFill");
  const nav = document.getElementById("siteNav");

  function onScrollTop() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    progressFill.style.width = pct + "%";
    nav.classList.toggle("scrolled", scrollTop > 40);
  }
  window.addEventListener("scroll", onScrollTop, { passive: true });
  onScrollTop();

  /* ---------------------------------------------------------------
     Mobile nav
  --------------------------------------------------------------- */
  const navBurger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  navBurger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navBurger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navBurger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------------------------------------------------------
     Active nav link + reveal-on-scroll
  --------------------------------------------------------------- */
  const navAnchors = document.querySelectorAll("[data-nav]");
  const sectionIds = ["menu", "build", "story", "visit"];
  const sectionEls = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  sectionEls.forEach((el) => navObserver.observe(el));

  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------------
     Stat counters
  --------------------------------------------------------------- */
  const counters = document.querySelectorAll(".stat-num");
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1300;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------------------------------------------------------------
     Hero burger rig — scroll-scrubbed assembly
  --------------------------------------------------------------- */
  const heroSection = document.getElementById("hero");
  const hud = document.querySelectorAll(".hud-step");
  const scrollCue = document.querySelector(".hero-scrollcue");

  const layerConfig = {
    lBunBot:  { y: 640, scatter: { x: 0,    y: 420,  r: 0,   o: .95 }, w: [0.00, 0.35] },
    lPatty1:  { y: 606, scatter: { x: 300,  y: 380,  r: 22,  o: .95 }, w: [0.05, 0.40] },
    lCheese1: { y: 600, scatter: { x: -300, y: 340,  r: -18, o: .95 }, w: [0.10, 0.45] },
    lOnion:   { y: 592, scatter: { x: 260,  y: 260,  r: 15,  o: .9  }, w: [0.15, 0.50] },
    lPatty2:  { y: 566, scatter: { x: -280, y: 220,  r: -20, o: .95 }, w: [0.20, 0.55] },
    lCheese2: { y: 560, scatter: { x: 300,  y: 120,  r: 20,  o: .95 }, w: [0.25, 0.60] },
    lSauce:   { y: 553, scatter: { x: 0,    y: -260, r: 0,   o: .85 }, w: [0.32, 0.62] },
    lLettuce: { y: 546, scatter: { x: -300, y: 40,   r: -15, o: .95 }, w: [0.38, 0.68] },
    lTomato:  { y: 538, scatter: { x: 260,  y: -80,  r: 25,  o: .9  }, w: [0.44, 0.74] },
    lPickle:  { y: 530, scatter: { x: -260, y: -120, r: -35, o: .9  }, w: [0.50, 0.80] },
    lBunTop:  { y: 528, scatter: { x: 0,    y: -380, r: -8,  o: .95 }, w: [0.58, 0.96] },
  };
  const layerEls = {};
  Object.keys(layerConfig).forEach((id) => (layerEls[id] = document.getElementById(id)));

  function smoothstep(p) {
    return p * p * (3 - 2 * p);
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  let heroP = 0;
  let ticking = false;

  function computeHeroProgress() {
    const rect = heroSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function renderHero() {
    ticking = false;
    Object.entries(layerConfig).forEach(([id, cfg]) => {
      const el = layerEls[id];
      if (!el) return;
      const [s, e] = cfg.w;
      let local = (heroP - s) / (e - s);
      local = Math.min(1, Math.max(0, local));
      const eased = smoothstep(local);

      const x = lerp(cfg.scatter.x, 0, eased);
      const y = lerp(cfg.scatter.y, cfg.y, eased);
      const r = lerp(cfg.scatter.r, 0, eased);
      const o = lerp(cfg.scatter.o, 1, eased);

      el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      el.style.opacity = o;
    });

    hud.forEach((el) => {
      const step = parseInt(el.dataset.step, 10);
      const active = heroP >= step * 0.25 && heroP < (step + 1) * 0.25 + (step === 3 ? 0.01 : 0);
      el.classList.toggle("active", active);
    });

    if (scrollCue) scrollCue.style.opacity = String(Math.max(0, 1 - heroP * 14));
  }

  function onHeroScroll() {
    heroP = computeHeroProgress();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderHero);
    }
  }
  window.addEventListener("scroll", onHeroScroll, { passive: true });
  window.addEventListener("resize", onHeroScroll);
  onHeroScroll();

  /* ---------------------------------------------------------------
     Menu tabs
  --------------------------------------------------------------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".menu-grid[data-panel]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      panels.forEach((p) => (p.hidden = p.dataset.panel !== target));
    });
  });

  /* ---------------------------------------------------------------
     Configurator
  --------------------------------------------------------------- */
  const PRICES = {
    base: 5.0,
    extraPatty: 2.0,
    cheese: { none: 0, american: 0.75, pepperjack: 1.0, cheddar: 1.0 },
    toppingPremium: { onion: 0.75, jalapeno: 0.75, crispyonion: 0.75 },
    sauce: { house: 0, chipotle: 0.5, aioli: 0.5, none: 0 },
    bun: { potato: 0, brioche: 1.0, lettucewrap: 0.5 },
  };
  const LABELS = {
    bun: { potato: "Potato Bun", brioche: "Brioche Bun", lettucewrap: "Lettuce Wrap" },
    cheese: { american: "American Cheese", pepperjack: "Pepper-Jack", cheddar: "Cheddar" },
    topping: {
      lettuce: "Lettuce", tomato: "Tomato", pickles: "Pickles",
      onion: "Caramelized Onion", jalapeno: "Jalapeño", crispyonion: "Crispy Onions",
    },
    sauce: { house: "House Sauce", chipotle: "Chipotle Sauce", aioli: "Garlic Aioli" },
  };

  const state = {
    patties: 1,
    cheese: "american",
    toppings: new Set(["lettuce", "tomato", "pickles"]),
    sauce: "house",
    bun: "potato",
  };

  const pattyCountEl = document.getElementById("pattyCount");
  const pattyStepper = document.getElementById("pattyStepper");
  const stackPlate = document.getElementById("stackPlate");
  const totalPriceEl = document.getElementById("totalPrice");
  const btnPriceEl = document.getElementById("btnPrice");
  const addBtn = document.getElementById("addToOrder");

  pattyStepper.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-step]");
    if (!btn) return;
    const delta = parseInt(btn.dataset.step, 10);
    state.patties = Math.min(4, Math.max(1, state.patties + delta));
    update();
  });

  document.querySelectorAll(".pill-group").forEach((group) => {
    const key = group.dataset.group;
    const multi = group.classList.contains("multi");
    group.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      const value = pill.dataset.value;
      if (multi) {
        if (state.toppings.has(value)) state.toppings.delete(value);
        else state.toppings.add(value);
        pill.classList.toggle("active");
      } else {
        state[key] = value;
        group.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === pill));
      }
      update();
    });
  });

  function calcPrice() {
    let total = PRICES.base + (state.patties - 1) * PRICES.extraPatty;
    total += PRICES.cheese[state.cheese] || 0;
    state.toppings.forEach((t) => (total += PRICES.toppingPremium[t] || 0));
    total += PRICES.sauce[state.sauce] || 0;
    total += PRICES.bun[state.bun] || 0;
    return total;
  }

  function fmt(n) {
    return "$" + n.toFixed(2);
  }

  const TOPPING_ORDER = ["crispyonion", "onion", "jalapeno", "tomato", "lettuce", "pickles"];

  function renderStack() {
    stackPlate.innerHTML = "";
    const addLayer = (cls, label) => {
      const div = document.createElement("div");
      div.className = "stack-layer";
      div.dataset.layer = cls;
      div.textContent = label;
      stackPlate.appendChild(div);
    };

    addLayer("bun-bottom", LABELS.bun[state.bun] + " (Base)");

    for (let i = 0; i < state.patties; i++) {
      addLayer("patty-" + i, "Smash Patty " + (i + 1));
      if (state.cheese !== "none") addLayer("cheese-" + i, LABELS.cheese[state.cheese]);
    }

    TOPPING_ORDER.filter((t) => state.toppings.has(t)).forEach((t) => addLayer("topping-" + t, LABELS.topping[t]));

    if (state.sauce !== "none") addLayer("sauce", LABELS.sauce[state.sauce]);

    addLayer("bun-top", LABELS.bun[state.bun] + " (Top)");
  }

  function update() {
    pattyCountEl.textContent = state.patties;
    renderStack();
    const price = calcPrice();
    totalPriceEl.textContent = fmt(price);
    btnPriceEl.textContent = fmt(price);
  }

  addBtn.addEventListener("click", () => {
    const original = addBtn.innerHTML;
    addBtn.innerHTML = "Added To Order ✓";
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.innerHTML = original;
      addBtn.disabled = false;
    }, 1600);
  });

  update();
})();
