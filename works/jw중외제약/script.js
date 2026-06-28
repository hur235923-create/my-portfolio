/* ============================================================
   JW중외제약 — 생명이 흐르게 하다 / SPARK
   Lenis + GSAP + ScrollTrigger + SplitType · 접두사 jw_
   다층 패럴랙스 · 세로 강 게이지 · 햅틱 · 데이터 파티클
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const jw_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const jw_canVibrate = "vibrate" in navigator && window.matchMedia("(hover: none)").matches;

const jw_nav = document.getElementById("nav");
const jw_riverFill = document.getElementById("riverFill");

/* ---------- Lenis ---------- */
const jw_lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
jw_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => jw_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- 헤더 + 세로 강 게이지 ---------- */
jw_lenis.on("scroll", ({ scroll }) => {
  jw_nav.classList.toggle("is-solid", scroll > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, scroll / max) : 0;
  if (jw_riverFill) jw_riverFill.style.transform = "scaleY(" + p + ")";
});

/* ---------- 햅틱 ---------- */
function jw_buzz(ms) { if (jw_canVibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
document.querySelectorAll("[data-haptic]").forEach((el) => {
  el.addEventListener("pointerdown", () => jw_buzz(10));
});

/* ---------- 앵커 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target !== null) { e.preventDefault(); jw_lenis.scrollTo(target, { offset: -50, duration: 1.3 }); }
    }
  });
});

/* ---------- HERO 인트로 ---------- */
document.querySelectorAll(".hero__title .l").forEach((line) => {
  const inner = document.createElement("span");
  while (line.firstChild) inner.appendChild(line.firstChild);
  line.appendChild(inner);
  gsap.set(inner, { yPercent: jw_reduce ? 0 : 118 });
});
function jw_playHero() {
  if (jw_reduce) return;
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero__eyebrow", { opacity: 0, y: 16, duration: 0.9 })
    .to(".hero__title .l > span", { yPercent: 0, duration: 1.3, stagger: 0.14 }, "-=0.5")
    .from(".hero__foot", { opacity: 0, y: 16, duration: 1 }, "-=0.7")
    .from(".hero__scroll", { opacity: 0, duration: 0.8 }, "-=0.5");
}

/* ---------- 프리로더 ---------- */
const jw_loader = document.getElementById("loader");
if (jw_reduce || !jw_loader) {
  if (jw_loader) jw_loader.remove();
  jw_playHero();
} else {
  jw_lenis.stop();
  document.documentElement.style.overflow = "hidden";
  const num = document.getElementById("loadNum");
  const o = { v: 0 };
  gsap.timeline()
    .to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => { num.textContent = Math.round(o.v); } })
    .to(".loader__drop", { y: 40, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.05")
    .to(".loader__num", { opacity: 0, duration: 0.4 }, "<")
    .to(jw_loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => {
      jw_loader.remove();
      document.documentElement.style.overflow = "";
      jw_lenis.start();
      ScrollTrigger.refresh();
    } }, "-=0.1")
    .add(jw_playHero, "<0.15");
}

/* ---------- 다층 패럴랙스 ---------- */
if (!jw_reduce) {
  gsap.utils.toArray("[data-depth]").forEach((el) => {
    const d = parseFloat(el.dataset.depth) || 0.1;
    const img = el.tagName === "FIGURE" ? el.querySelector("img") : null;
    const target = img || el;
    if (img) gsap.set(img, { scale: 1.16 });
    const range = d * 14;
    gsap.fromTo(target, { yPercent: -range }, {
      yPercent: range, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });
}

/* ---------- SplitType 헤딩 리빌 (.st) ---------- */
const jw_st = gsap.utils.toArray(".st");
let jw_splits = [], jw_stTriggers = [];
function jw_build() {
  jw_st.forEach((el) => {
    const s = new SplitType(el, { types: "lines, words", lineClass: "st-line", wordClass: "st-word" });
    jw_splits.push(s);
    gsap.set(el, { opacity: 1 });
    gsap.set(s.words, { yPercent: 120 });
    const tw = gsap.to(s.words, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.06, scrollTrigger: { trigger: el, start: "top 88%" } });
    if (tw.scrollTrigger) jw_stTriggers.push(tw.scrollTrigger);
  });
}
if (jw_reduce || !jw_st.length || !window.SplitType) {
  gsap.set(jw_st, { opacity: 1 });
} else {
  const run = () => { jw_build(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else run();
}
/* st-line 마스크 */
const jw_style = document.createElement("style");
jw_style.textContent = ".st-line{overflow:hidden;padding-bottom:0.06em}.st-word{display:inline-block;will-change:transform}";
document.head.appendChild(jw_style);

/* ---------- 일반 리빌 ---------- */
if (!jw_reduce) {
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
} else { gsap.set(".reveal", { opacity: 1, y: 0 }); }

/* ---------- 카운터 ---------- */
document.querySelectorAll("[data-count-to]").forEach((el) => {
  const to = parseInt(el.dataset.countTo, 10) || 0;
  const fmt = (n) => (to >= 3000 ? Math.round(n).toLocaleString("ko-KR") : Math.round(n));
  if (jw_reduce) { el.textContent = fmt(to); return; }
  const o = { v: to > 200 ? Math.max(0, to - 80) : 0 };
  ScrollTrigger.create({
    trigger: el, start: "top 88%", once: true,
    onEnter: () => gsap.to(o, { v: to, duration: 1.7, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); } }),
  });
});

/* ---------- 헤리티지 마일스톤 진입 햅틱 ---------- */
if (jw_canVibrate) {
  gsap.utils.toArray(".drop").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: () => jw_buzz(8) });
  });
}

/* ---------- R&D 데이터 플로우 필드 ---------- */
(function jw_field() {
  const cv = document.getElementById("field");
  if (!cv || jw_reduce) return;
  const ctx = cv.getContext("2d", { alpha: true });
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const COUNT = mobile ? 55 : 140;
  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  let parts = [], running = false, raf = null;
  function size() { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function seed() { parts = []; for (let i = 0; i < COUNT; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, s: 0.4 + Math.random() * 1.5 }); }
  function flow(x, y, t) { return Math.sin(x * 0.0024 + t) + Math.cos(y * 0.0028 - t * 0.8) + Math.sin((x + y) * 0.0016 + t * 0.5); }
  function tick(time) {
    if (!running) return;
    const t = time * 0.0002;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const a = flow(p.x, p.y, t) * Math.PI;
      p.x += Math.cos(a) * p.s; p.y += Math.sin(a) * p.s;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(95,224,239," + (0.16 + p.s * 0.16) + ")"; ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
  size(); seed();
  window.addEventListener("resize", () => { size(); seed(); });
  new IntersectionObserver((es) => { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.05 }).observe(cv);
})();

/* ---------- refresh ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

/* ---------- 리사이즈: SplitType 재계산 ---------- */
let jw_rt = null;
window.addEventListener("resize", () => {
  clearTimeout(jw_rt);
  jw_rt = setTimeout(() => {
    if (!jw_reduce && jw_splits.length) {
      jw_stTriggers.forEach((t) => t.kill()); jw_stTriggers = [];
      jw_splits.forEach((s) => s.revert()); jw_splits = [];
      jw_build();
    }
    ScrollTrigger.refresh();
  }, 250);
});
