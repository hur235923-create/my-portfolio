(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const gauge = document.getElementById("csGauge");
  const counter = document.getElementById("csCounter");
  const secs = [...document.querySelectorAll(".cs-sec")];

  // Lenis 스무스 스크롤 (reduced-motion이면 생략)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.0, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // 진행 게이지 + 카운터
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    gauge.style.transform = `scaleX(${p})`;
    const mid = window.scrollY + window.innerHeight * 0.5;
    let idx = 1;
    secs.forEach((s) => { if (s.offsetTop <= mid) idx = +s.dataset.idx; });
    counter.textContent = `${String(idx).padStart(2, "0")} / 12`;
  };
  (lenis ? lenis.on.bind(lenis, "scroll") : window.addEventListener.bind(window, "scroll"))(onScroll);
  onScroll();

  // 섹션 진입 리빌
  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".cs-reveal").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });
  }

  // 07 필름 스트립: 커서를 올려 좌우로 움직이면 그 위치로 가로 패닝(hover-to-scroll)
  const strip = document.querySelector("#sec-07 .cs-film07__strip");
  const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (strip && !reduce && fine) {
    strip.classList.add("is-hoverpan"); // CSS에서 scroll-snap 해제
    let targetX = 0, curX = 0, active = false, raf = 0;
    const maxScroll = () => strip.scrollWidth - strip.clientWidth;
    const loop = () => {
      curX += (targetX - curX) * 0.12;
      if (Math.abs(targetX - curX) > 0.5) {
        strip.scrollLeft = curX;
        raf = requestAnimationFrame(loop);
      } else {
        strip.scrollLeft = curX = targetX;
        active = false;
      }
    };
    strip.addEventListener("mousemove", (e) => {
      const max = maxScroll();
      if (max <= 0) return;
      const r = strip.getBoundingClientRect();
      const ratio = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      targetX = ratio * max;
      if (!active) { active = true; raf = requestAnimationFrame(loop); }
    });
    strip.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      active = false;
    });
  }
})();
