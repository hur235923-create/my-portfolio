/* ============================================================
   HASSELBLAD — interactions
   GSAP + ScrollTrigger + Lenis · 전역 접두사 hb_ · var 금지
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const hb_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hb_mobile = window.matchMedia("(max-width: 720px)").matches;
const hb_hoverable = window.matchMedia("(hover: hover)").matches;
const hb_horizontal = !hb_reduce && !hb_mobile;

const hb_nav = document.getElementById("nav");
const hb_bar = document.getElementById("progressBar");

/* ---------- Lenis ---------- */
const hb_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
hb_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => hb_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- 헤더 상태 + 진행바 ---------- */
hb_lenis.on("scroll", ({ scroll }) => {
  hb_nav.classList.toggle("is-scrolled", scroll > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  hb_bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scroll / max) : 0) + ")";
});

/* ---------- 부드러운 앵커 이동 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target !== null) { e.preventDefault(); hb_lenis.scrollTo(target, { offset: -70, duration: 1.2 }); }
    }
  });
});

/* ---------- HERO 인트로 (프리로더 이후 호출) ---------- */
if (!hb_reduce) {
  gsap.set(".hero__kicker span", { y: 22 });
  gsap.set(".hero__title .line > span", { yPercent: 110 });
}
function hb_playHero() {
  if (hb_reduce) return;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero__kicker span", { opacity: 1, y: 0, duration: 1 })
    .to(".hero__title .line > span", { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, "-=0.6")
    .to(".hero__sub", { opacity: 1, duration: 1 }, "-=0.6");

  /* 스크롤 패럴랙스 + 스케일 — img·canvas 동시 (bleed 안에서만 이동) */
  gsap.to(["#heroImg", "#heroGl"], {
    yPercent: 12, scale: 1.18, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });

  /* 마우스 패럴랙스 (미디어 레이어) */
  if (hb_hoverable) {
    const hb_hero = document.querySelector(".hero");
    const hb_media = document.querySelector(".hero__media");
    hb_hero.addEventListener("mousemove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      gsap.to(hb_media, { x: cx * -34, y: cy * -22, duration: 0.9, ease: "power3.out" });
    });
  }
}

/* ---------- 시네마틱 프리로더 ---------- */
const hb_pre = document.getElementById("preloader");
if (hb_reduce || !hb_pre) {
  if (hb_pre) hb_pre.remove();
  hb_playHero();
} else {
  hb_lenis.stop();
  document.documentElement.style.overflow = "hidden";
  const hb_count = document.getElementById("preCount");
  const hb_preBar = document.getElementById("preBar");
  const prog = { v: 0 };
  const tl = gsap.timeline();
  tl.to(prog, {
    v: 100, duration: 1.6, ease: "power2.inOut",
    onUpdate: () => {
      const n = Math.round(prog.v);
      hb_count.textContent = n;
      hb_preBar.style.transform = "scaleX(" + prog.v / 100 + ")";
    },
  })
    .to(".preloader__inner, .preloader__status", { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, "+=0.15")
    .to(hb_pre, {
      yPercent: -100, duration: 1.0, ease: "power4.inOut",
      onComplete: () => {
        hb_pre.remove();
        document.documentElement.style.overflow = "";
        hb_lenis.start();
        ScrollTrigger.refresh();
      },
    }, "-=0.1")
    .add(hb_playHero, "<0.15");
}

/* ---------- Reveal (텍스트 up / 이미지 zoom-in / 헤딩 클립 와이프) ---------- */
if (!hb_reduce) {
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });
  gsap.utils.toArray(".reveal-clip").forEach((el) => {
    // clip-path는 시작·끝을 4값 %로 명시해야 GSAP이 중간값을 보간(fromTo) — 안 그러면 끝에서 툭 열림
    gsap.fromTo(el,
      { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
      { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power4.out", delay: 0.08,
        scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.utils.toArray(".reveal-img").forEach((fig) => {
    const img = fig.querySelector("img");
    if (!img) return;
    gsap.to(img, {
      opacity: 1, scale: 1, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: fig, start: "top 88%" },
    });
  });
}

/* ---------- 연도 카운트업 ---------- */
const hb_counter = document.querySelector(".counter");
if (hb_counter) {
  const to = parseInt(hb_counter.dataset.countTo, 10) || 0;
  if (hb_reduce) {
    hb_counter.textContent = to;
  } else {
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: hb_counter, start: "top 88%", once: true,
      onEnter: () => gsap.to(obj, { v: to, duration: 2, ease: "power2.out", onUpdate: () => { hb_counter.textContent = Math.round(obj.v); } }),
    });
  }
}

/* ---------- PRODUCTS 가로 핀 쇼케이스 ---------- */
let hb_showTween = null;
if (hb_horizontal) {
  const track = document.getElementById("showcaseTrack");
  const getDist = () => track.scrollWidth - window.innerWidth;
  hb_showTween = gsap.to(track, {
    x: () => -getDist(),
    ease: "none",
    scrollTrigger: {
      trigger: ".showcase",
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      end: () => "+=" + getDist(),
    },
  });
}

/* ---------- 커스텀 커서 + 라벨 ---------- */
if (hb_hoverable) {
  const hb_cursor = document.getElementById("cursor");
  const hb_dot = hb_cursor.querySelector(".cursor__dot");
  const hb_ring = hb_cursor.querySelector(".cursor__ring");
  const hb_label = document.getElementById("cursorLabel");
  gsap.set([hb_dot, hb_ring], { xPercent: -50, yPercent: -50 });
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    gsap.to(hb_dot, { x: mx, y: my, duration: 0.08, ease: "none" });
  });
  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    gsap.set(hb_ring, { x: rx, y: ry });
  });
  document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
    el.addEventListener("mouseenter", () => hb_cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => hb_cursor.classList.remove("is-hover"));
  });
  /* 라벨: 갤러리 = VIEW, 쇼케이스 = DRAG */
  const hb_labels = [
    { sel: ".gallery__item", text: "VIEW" },
    { sel: ".showcase", text: hb_horizontal ? "DRAG" : "" },
  ];
  hb_labels.forEach(({ sel, text }) => {
    if (!text) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.addEventListener("mouseenter", () => { hb_label.textContent = text; hb_cursor.classList.add("is-label"); });
      el.addEventListener("mouseleave", () => hb_cursor.classList.remove("is-label"));
    });
  });
}

/* ---------- 마그네틱 버튼 ---------- */
if (hb_hoverable && !hb_reduce) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.45, duration: 0.6, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ---------- 갤러리 라이트박스 ---------- */
const hb_lb = document.getElementById("lightbox");
if (hb_lb) {
  const hb_lbImg = document.getElementById("lightboxImg");
  const hb_lbCap = document.getElementById("lightboxCap");
  const hb_lbClose = document.getElementById("lightboxClose");
  let hb_lastFocus = null;

  const openLB = (src, alt, cap) => {
    hb_lbImg.src = src;
    hb_lbImg.alt = alt || "";
    hb_lbCap.textContent = cap || "";
    hb_lb.classList.add("is-open");
    hb_lb.setAttribute("aria-hidden", "false");
    hb_lenis.stop();
    hb_lbClose.focus();
  };
  const closeLB = () => {
    hb_lb.classList.remove("is-open");
    hb_lb.setAttribute("aria-hidden", "true");
    hb_lenis.start();
    if (hb_lastFocus) hb_lastFocus.focus();
  };

  document.querySelectorAll(".gallery__item").forEach((item) => {
    const img = item.querySelector("img");
    const cap = item.querySelector("figcaption");
    if (!img) return;
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    const trigger = () => { hb_lastFocus = item; openLB(img.currentSrc || img.src, img.alt, cap ? cap.textContent : ""); };
    item.addEventListener("click", trigger);
    item.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); } });
  });

  hb_lbClose.addEventListener("click", closeLB);
  hb_lb.addEventListener("click", (e) => { if (e.target === hb_lb) closeLB(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && hb_lb.classList.contains("is-open")) closeLB(); });
}

/* ============================================================
   개선(리디자인) — HP1 드로어 · HP2 READ MORE · HP3 트랩 · HP4 활성 nav
   ============================================================ */

/* HP1 — 모바일 드로어 */
(function hb_drawer() {
  const burger = document.getElementById("hbBurger");
  const drawer = document.getElementById("hbNav");
  if (!burger || !drawer) return;
  const closeBtn = document.getElementById("hbNavClose");
  let lastFocus = null;
  const focusables = () =>
    Array.from(drawer.querySelectorAll("a[href], button")).filter((el) => el.offsetParent !== null);

  function open() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "메뉴 닫기");
    hb_lenis.stop();
    document.documentElement.style.overflow = "hidden";
    const f = focusables();
    if (f.length) f[0].focus();
  }
  function close() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "메뉴 열기");
    hb_lenis.start();
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  burger.addEventListener("click", () => (drawer.classList.contains("is-open") ? close() : open()));
  if (closeBtn) closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  drawer.querySelectorAll("[data-mclose]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      close();
      if (id && id.startsWith("#")) {
        e.preventDefault();
        const target = id === "#top" ? 0 : document.querySelector(id);
        if (target !== null) hb_lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      }
    });
  });
})();

/* HP2 — READ MORE 죽은 링크(#) 무력화 */
document.querySelectorAll('.link-more[href="#"]').forEach((el) => {
  el.setAttribute("aria-disabled", "true");
  el.addEventListener("click", (e) => e.preventDefault());
});

/* HP3 — 라이트박스 포커스 트랩(닫기 버튼 고정) */
(function hb_lbTrap() {
  const lb = document.getElementById("lightbox");
  const closeB = document.getElementById("lightboxClose");
  if (!lb || !closeB) return;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && lb.classList.contains("is-open")) { e.preventDefault(); closeB.focus(); }
  });
})();

/* HP4 — 데스크톱 nav 현재 섹션 활성 표시 */
(function hb_activeNav() {
  const map = Array.from(document.querySelectorAll('.nav__menu a[href^="#"]'))
    .map((a) => ({ a, sec: document.querySelector(a.getAttribute("href")) }))
    .filter((o) => o.sec);
  if (!map.length) return;
  map.forEach((o) => {
    ScrollTrigger.create({
      trigger: o.sec, start: "top center", end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          map.forEach((x) => x.a.removeAttribute("aria-current"));
          o.a.setAttribute("aria-current", "location");
        }
      },
    });
  });
})();

/* ---------- refresh ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

/* ---------- 리사이즈: 가로/세로 경계 넘으면 새로고침 ---------- */
let hb_rt = null;
window.addEventListener("resize", () => {
  clearTimeout(hb_rt);
  hb_rt = setTimeout(() => {
    const nowH = !hb_mobile && !hb_reduce && !window.matchMedia("(max-width: 720px)").matches;
    if (nowH !== hb_horizontal) window.location.reload();
    else ScrollTrigger.refresh();
  }, 250);
});
