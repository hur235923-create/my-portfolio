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
    /* MP2: 키보드 접근 — 포커스 가능 + 역할/라벨 + Enter/Space */
    const piece = img.closest(".piece");
    const nm = piece ? piece.querySelector(".piece__name").textContent.trim() : "가구";
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", nm + " 확대 보기");
    img.addEventListener("click", () => { if (!active) open(img); });
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!active) open(img); }
    });
  });
  lb.addEventListener("click", (e) => { if (e.target !== active) close(); });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); } /* MP2: 포커스 트랩 */
  });
}
mr_initLightbox();

/* ============================================================
   개선(리디자인) — MP1 드로어 · MP3 활성 nav · MP4 SNS/뉴스레터
   ============================================================ */

/* MP1 — 모바일 드로어 */
(function mr_drawer() {
  const burger = document.getElementById("mrBurger");
  const drawer = document.getElementById("mrNav");
  if (!burger || !drawer) return;
  const closeBtn = document.getElementById("mrNavClose");
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
    mr_lenis.stop();
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
    mr_lenis.start();
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
        if (target !== null) mr_lenis.scrollTo(target, { offset: -50, duration: 1.3 });
      }
    });
  });
})();

/* MP3 — 데스크톱 nav 현재 섹션 활성 표시 */
(function mr_activeNav() {
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

/* MP4 — SNS 죽은 링크 무력화 */
document.querySelectorAll('[aria-disabled="true"]').forEach((el) => {
  el.addEventListener("click", (e) => e.preventDefault());
});

/* MP4 — 뉴스레터 폼 피드백 */
(function mr_news() {
  const form = document.querySelector(".foot__news");
  if (!form) return;
  let msg = null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "foot__news-msg";
      msg.setAttribute("aria-live", "polite");
      form.after(msg);
    }
    const input = form.querySelector("input");
    const has = input && input.value.trim();
    msg.textContent = has ? "구독 신청이 접수되었습니다. 감사합니다." : "이메일 주소를 입력해 주세요.";
    if (has) input.value = "";
  });
})();

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
