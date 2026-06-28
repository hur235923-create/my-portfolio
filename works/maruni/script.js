/* ============================================================
   MARUNI — quiet luxury interactions
   GSAP + ScrollTrigger + Lenis · 전역 접두사 mr_ · var 금지
   절제된 프리미엄 모션: 마스크 라인 리빌 · 이미지 스케일 리빌 · 히어로 켄번스 패럴랙스
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);
if (window.Flip) gsap.registerPlugin(Flip);

const mr_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mr_nav = document.getElementById("nav");

/* ---------- Lenis ---------- */
const mr_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
mr_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => mr_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- 헤더 상태 ---------- */
mr_lenis.on("scroll", ({ scroll }) => {
  mr_nav.classList.toggle("is-solid", scroll > 40);
});

/* ---------- 앵커 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target !== null) { e.preventDefault(); mr_lenis.scrollTo(target, { offset: -50, duration: 1.3 }); }
    }
  });
});

/* ---------- HERO: 라인 리빌 + 켄번스 + 패럴랙스 ---------- */
if (!mr_reduce) {
  gsap.set(".hero__title .line > span", { yPercent: 112 });
  gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } })
    .to(".hero__eyebrow", { opacity: 1, duration: 1 })
    .to(".hero__title .line > span", { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.14 }, "-=0.6")
    .from(".hero__intro", { opacity: 0, y: 18, duration: 1.1 }, "-=0.7")
    .from(".hero__scroll", { opacity: 0, duration: 1 }, "-=0.8");

  /* 켄번스: 로드 후 아주 느린 줌 */
  gsap.fromTo("#heroImg", { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power2.out" });
  /* 스크롤 패럴랙스 (bleed 안에서만) */
  gsap.to("#heroImg", {
    yPercent: 8, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
} else {
  gsap.set(".hero__title .line > span", { opacity: 1 });
}

/* ---------- STATEMENT 라인 리빌 ---------- */
if (!mr_reduce) {
  gsap.utils.toArray(".statement .reveal-line").forEach((el) => {
    const inner = document.createElement("span");
    /* 마스크 효과를 위해 줄을 감싼다 */
    el.style.display = "block";
    el.style.overflow = "hidden";
    while (el.firstChild) inner.appendChild(el.firstChild);
    inner.style.display = "block";
    el.appendChild(inner);
    gsap.set(el, { opacity: 1 });
    gsap.set(inner, { yPercent: 110 });
    gsap.to(inner, {
      yPercent: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });
} else {
  gsap.set(".statement .reveal-line", { opacity: 1 });
}

/* ---------- 일반 리빌 ---------- */
if (!mr_reduce) {
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  /* 이미지: overflow 안에서 스케일 1로 (clip 없이 transform만) */
  gsap.utils.toArray(".reveal-img").forEach((fig) => {
    const img = fig.querySelector("img");
    if (!img) return;
    gsap.to(img, { scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: fig, start: "top 90%" } });
  });
} else {
  gsap.set(".reveal", { opacity: 1, y: 0 });
  gsap.set(".reveal-img img", { scale: 1 });
}

/* ---------- SplitType 헤딩 리빌 (라인 마스크 + 단어 스태거) ---------- */
const mr_stTargets = gsap.utils.toArray(".st-target");
let mr_splits = [];
let mr_stTriggers = [];

function mr_buildSplits() {
  mr_stTargets.forEach((el) => {
    const split = new SplitType(el, { types: "lines, words", lineClass: "st-line", wordClass: "st-word" });
    mr_splits.push(split);
    gsap.set(el, { opacity: 1 });
    gsap.set(split.words, { yPercent: 116 });
    const tween = gsap.to(split.words, {
      yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.07,
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
    if (tween.scrollTrigger) mr_stTriggers.push(tween.scrollTrigger);
  });
}

function mr_initSplits() {
  if (mr_reduce || !mr_stTargets.length) {
    gsap.set(mr_stTargets, { opacity: 1 });
    return;
  }
  if (!window.SplitType) {                 // CDN 실패 → 헤딩은 그냥 노출(폴백)
    gsap.set(mr_stTargets, { opacity: 1 });
    return;
  }
  const run = () => { mr_buildSplits(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  else run();
}
mr_initSplits();

/* ---------- 라이트박스 (GSAP Flip 공유요소 전환) ---------- */
function mr_initLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb || !window.Flip) return;          // Flip 없으면 라이트박스 비활성(이미지 그대로)
  const stage = document.getElementById("lbStage");
  const cap = document.getElementById("lbCap");
  const closeBtn = document.getElementById("lbClose");
  const dur = mr_reduce ? 0.01 : 0.8;
  let active = null, homeParent = null, homeNext = null, lastFocus = null;

  const open = (img) => {
    const piece = img.closest(".piece");
    const name = piece ? piece.querySelector(".piece__name").textContent.trim() : "";
    const type = piece ? piece.querySelector(".piece__type").textContent.trim() : "";
    cap.textContent = type ? name + " — " + type : name;

    lastFocus = document.activeElement;
    active = img; homeParent = img.parentNode; homeNext = img.nextSibling;

    const state = Flip.getState(img);
    stage.appendChild(img);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    mr_lenis.stop();
    Flip.from(state, { duration: dur, ease: "power3.inOut", absolute: true });
    closeBtn.focus();
  };

  const close = () => {
    if (!active) return;
    const img = active; active = null;
    const state = Flip.getState(img);
    if (homeNext) homeParent.insertBefore(img, homeNext); else homeParent.appendChild(img);
    Flip.from(state, { duration: mr_reduce ? 0.01 : 0.7, ease: "power3.inOut", absolute: true });
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    mr_lenis.start();
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll(".piece__media img").forEach((img) => {
    img.addEventListener("click", () => { if (!active) open(img); });
  });
  lb.addEventListener("click", (e) => { if (e.target !== active) close(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("is-open")) close(); });
}
mr_initLightbox();

/* ---------- refresh ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

/* ---------- 리사이즈: SplitType 라인 재계산 ---------- */
let mr_rt = null;
window.addEventListener("resize", () => {
  if (mr_reduce || !mr_splits.length) return;
  clearTimeout(mr_rt);
  mr_rt = setTimeout(() => {
    mr_stTriggers.forEach((t) => t.kill());
    mr_stTriggers = [];
    mr_splits.forEach((s) => s.revert());
    mr_splits = [];
    mr_buildSplits();
    ScrollTrigger.refresh();
  }, 250);
});
