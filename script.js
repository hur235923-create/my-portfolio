/* ============================================================
   PORTFOLIO — "갤러리 워크" 인터랙션
   GSAP + ScrollTrigger + Lenis · 가로 스크롤 / 진행도 / INDEX 도약
   전역 접두사 spark_ · var 금지 · scrollIntoView 금지
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const spark_track = document.getElementById("track");
const spark_viewport = document.getElementById("viewport");
const spark_fill = document.getElementById("progressFill");
const spark_counter = document.getElementById("counter");
const spark_indexBtn = document.getElementById("indexBtn");
const spark_indexPanel = document.getElementById("indexPanel");
const spark_indexClose = document.getElementById("indexClose");
const spark_panels = gsap.utils.toArray(".panel");
const spark_total = spark_panels.length;

const spark_mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const spark_mqMobile = window.matchMedia("(max-width: 860px)");
const spark_isHorizontal = !spark_mqReduce.matches && !spark_mqMobile.matches;

/* ---------- Lenis (필수 스니펫) ---------- */
const spark_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
spark_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- HUD 갱신 ---------- */
function spark_updateHud(progress) {
  const p = Math.min(1, Math.max(0, progress));
  spark_fill.style.transform = "scaleX(" + p + ")";
  const idx = Math.round(p * (spark_total - 1)) + 1;
  spark_counter.textContent =
    String(idx).padStart(2, "0") + " / " + String(spark_total).padStart(2, "0");
}
spark_updateHud(0);

/* ---------- 가로 스크롤 (데스크톱 + 모션 허용) ---------- */
let spark_scrollTween = null;

if (spark_isHorizontal) {
  spark_scrollTween = gsap.to(spark_track, {
    x: () => -(spark_track.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: spark_viewport,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      end: () => "+=" + (spark_track.scrollWidth - window.innerWidth),
      onUpdate: (self) => spark_updateHud(self.progress),
    },
  });

  spark_setupReveal(spark_scrollTween);
} else {
  /* 세로 폴백: Lenis 진행도로 HUD 갱신 */
  spark_lenis.on("scroll", ({ scroll, limit }) => {
    spark_updateHud(limit > 0 ? scroll / limit : 0);
  });
  if (!spark_mqReduce.matches) spark_setupReveal(null);
}

/* ---------- Reveal (블랭킷 fadeIn 아님: 오브제 scale + 텍스트 stagger) ---------- */
function spark_setupReveal(container) {
  spark_panels.forEach((panel) => {
    const obj = panel.querySelector(".work__object, .intro__object");
    const texts = panel.querySelectorAll(
      ".work__text > *, .intro__title .intro__line, .intro__kicker, .intro__body, .profile__col > *"
    );
    const stBase = container
      ? { trigger: panel, containerAnimation: container, start: "left 78%", toggleActions: "play none none reverse" }
      : { trigger: panel, start: "top 82%", toggleActions: "play none none reverse" };

    if (obj) {
      gsap.from(obj, {
        opacity: 0,
        scale: 0.9,
        yPercent: 5,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: Object.assign({}, stBase),
      });
    }
    if (texts.length) {
      gsap.from(texts, {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: Object.assign({}, stBase, { start: container ? "left 70%" : "top 80%" }),
      });
    }
  });
}

/* ---------- INDEX 도약 ---------- */
function spark_jumpTo(idx) {
  const i = Math.min(spark_total - 1, Math.max(0, idx));

  if (spark_isHorizontal && spark_scrollTween) {
    const st = spark_scrollTween.scrollTrigger;
    const ratio = spark_total > 1 ? i / (spark_total - 1) : 0;
    const targetY = st.start + ratio * (st.end - st.start);
    spark_lenis.scrollTo(targetY, { duration: 1.4 });
  } else {
    spark_lenis.scrollTo(spark_panels[i], { duration: 1.2, offset: -64 });
  }
}

/* ---------- INDEX 오버레이 열고 닫기 ---------- */
let spark_lastFocus = null;

function spark_openIndex() {
  spark_lastFocus = document.activeElement;
  spark_indexPanel.hidden = false;
  requestAnimationFrame(() => spark_indexPanel.classList.add("is-open"));
  spark_indexBtn.setAttribute("aria-expanded", "true");
  spark_lenis.stop();
  const first = spark_indexPanel.querySelector("button");
  if (first) first.focus();
}

function spark_closeIndex() {
  spark_indexPanel.classList.remove("is-open");
  spark_indexBtn.setAttribute("aria-expanded", "false");
  spark_lenis.start();
  const onEnd = () => {
    spark_indexPanel.hidden = true;
    spark_indexPanel.removeEventListener("transitionend", onEnd);
  };
  spark_indexPanel.addEventListener("transitionend", onEnd);
  if (spark_lastFocus) spark_lastFocus.focus();
}

spark_indexBtn.addEventListener("click", spark_openIndex);
spark_indexClose.addEventListener("click", spark_closeIndex);

spark_indexPanel.querySelectorAll("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = parseInt(btn.getAttribute("data-target"), 10);
    spark_closeIndex();
    /* 닫힘 후 스크롤 시작 (lenis.start 직후) */
    requestAnimationFrame(() => spark_jumpTo(target));
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !spark_indexPanel.hidden) spark_closeIndex();
});

/* ---------- 폰트/이미지 로드 후 좌표 재계산 ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ---------- 리사이즈: 가로/세로 모드 경계 넘으면 새로고침 ---------- */
let spark_resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(spark_resizeTimer);
  spark_resizeTimer = setTimeout(() => {
    const nowHorizontal = !spark_mqReduce.matches && !spark_mqMobile.matches;
    if (nowHorizontal !== spark_isHorizontal) {
      window.location.reload();
    } else {
      ScrollTrigger.refresh();
    }
  }, 250);
});
