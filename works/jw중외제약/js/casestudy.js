(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const gauge = document.getElementById("csGauge");
  const counter = document.getElementById("csCounter");
  const secs = [...document.querySelectorAll(".cs-sec")];

  // Lenis 스무스 스크롤 (reduced-motion이면 생략)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
})();
