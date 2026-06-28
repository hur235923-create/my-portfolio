/* ============================================================
   YAMAHA — Make Waves · SPARK
   ESM 모듈 · 전역 접두사 ym_ · var 금지
   - GSAP + ScrollTrigger + Lenis (전역) / Three.js (importmap)
   - DARING_MOVE: 페이지를 관통하는 크롬-바이올렛 MatCap 사운드 링
   ============================================================ */

import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const ym_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ym_hoverable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Lenis ---------- */
const ym_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
ym_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => ym_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- 앵커 부드러운 이동 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target !== null) { e.preventDefault(); ym_lenis.scrollTo(target, { offset: -40, duration: 1.2 }); }
    }
  });
});

/* ---------- 우측 눈금: 진행 채움 + 활성 섹션 ---------- */
const ym_fill = document.getElementById("rulerFill");
ym_lenis.on("scroll", ({ scroll }) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (ym_fill) ym_fill.style.transform = "scaleY(" + (max > 0 ? Math.min(1, scroll / max) : 0) + ")";
});
const ym_navLinks = gsap.utils.toArray(".ruler__list a");
ym_navLinks.forEach((a) => {
  const sec = document.querySelector(a.getAttribute("href"));
  if (!sec) return;
  ScrollTrigger.create({
    trigger: sec, start: "top 50%", end: "bottom 50%",
    onToggle: (self) => a.classList.toggle("is-active", self.isActive),
  });
});

/* ---------- 히어로 라인 마스크 리빌 ---------- */
if (!ym_reduce) {
  gsap.set(".hero__title .ln > span", { yPercent: 115 });
  gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 })
    .to(".hero__eyebrow", { opacity: 1, duration: 0.8 })
    .to(".hero__title .ln > span", { yPercent: 0, opacity: 1, duration: 1.15, stagger: 0.12 }, "-=0.4")
    .from(".hero__note", { opacity: 0, y: 20, duration: 1 }, "-=0.6")
    .from(".hero__meta", { opacity: 0, duration: 0.8 }, "-=0.7");
} else {
  gsap.set(".hero__title .ln > span", { opacity: 1 });
}

/* ---------- 콘텐츠 리빌 (일괄 fade 탈피: 블록별 stagger + 사진 줌) ---------- */
if (!ym_reduce) {
  gsap.utils.toArray(":is(.reson__text, .inst__caption, .figure, .quote, .legacy .huge, .legacy__cols > div, .voices__head)").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });
  gsap.utils.toArray(".plate img").forEach((img) => {
    gsap.fromTo(img, { opacity: 0, scale: 1.09 }, {
      opacity: 1, scale: 1, duration: 1.3, ease: "power3.out",
      scrollTrigger: { trigger: img, start: "top 90%" },
    });
  });
} else {
  gsap.set(".plate img", { opacity: 1 });
}

/* ---------- 카운트업 (사회적 증거) ---------- */
gsap.utils.toArray(".count").forEach((el) => {
  const to = parseInt(el.dataset.countTo, 10) || 0;
  const suffix = el.dataset.suffix || "";
  if (ym_reduce) { el.textContent = to + suffix; return; }
  const obj = { v: 0 };
  ScrollTrigger.create({
    trigger: el, start: "top 90%", once: true,
    onEnter: () => gsap.to(obj, { v: to, duration: 1.8, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; } }),
  });
});

/* ============================================================
   사운드 링 — Three.js + 절차적 MatCap (네트워크 0)
   ============================================================ */
function ym_buildMatcap() {
  /* 폴리시드 크롬에 바이올렛을 입힌 구형 라이팅 텍스처를 캔버스로 직접 그림 */
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  x.fillStyle = "#0b0710"; x.fillRect(0, 0, s, s);

  /* 베이스: 어두운 가장자리 → 중앙 보라 금속 */
  let g = x.createRadialGradient(s * 0.5, s * 0.5, s * 0.05, s * 0.5, s * 0.5, s * 0.6);
  g.addColorStop(0, "#b79ce0");
  g.addColorStop(0.45, "#6b3fa6");
  g.addColorStop(0.8, "#2e1448");
  g.addColorStop(1, "#0c0712");
  x.fillStyle = g; x.beginPath(); x.arc(s * 0.5, s * 0.5, s * 0.5, 0, Math.PI * 2); x.fill();

  /* 메인 하이라이트 (좌상단) */
  g = x.createRadialGradient(s * 0.34, s * 0.30, 0, s * 0.34, s * 0.30, s * 0.42);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, "rgba(240,232,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.beginPath(); x.arc(s * 0.5, s * 0.5, s * 0.5, 0, Math.PI * 2); x.fill();

  /* 림 라이트 (우하단, 차가운 보라) */
  g = x.createRadialGradient(s * 0.72, s * 0.78, 0, s * 0.72, s * 0.78, s * 0.3);
  g.addColorStop(0, "rgba(160,120,235,0.6)");
  g.addColorStop(1, "rgba(160,120,235,0)");
  x.fillStyle = g; x.beginPath(); x.arc(s * 0.5, s * 0.5, s * 0.5, 0, Math.PI * 2); x.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ym_buildRing() {
  /* 원형 파형: 토러스의 큰 반지름을 사인파로 변조 */
  const geo = new THREE.TorusGeometry(1.0, 0.2, 30, 260);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const theta = Math.atan2(v.y, v.x);
    const r = Math.hypot(v.x, v.y);
    if (r > 0.0001) {
      const k = 1 + (0.085 * Math.sin(theta * 12)) / r;
      v.x *= k; v.y *= k;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function ym_initRing() {
  const canvas = document.getElementById("ring");
  if (!canvas || ym_reduce) { if (canvas) canvas.style.display = "none"; return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    canvas.style.display = "none"; return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const mobile = window.matchMedia("(max-width: 900px)").matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, mobile ? 6.6 : 4.4);

  const group = new THREE.Group();
  const matcapMat = new THREE.MeshMatcapMaterial({ matcap: ym_buildMatcap() });
  if (mobile) { matcapMat.transparent = true; matcapMat.opacity = 0.6; }
  const mesh = new THREE.Mesh(ym_buildRing(), matcapMat);
  group.add(mesh);
  scene.add(group);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  /* 스크롤 스파인: 섹션마다 여백 쪽으로 링이 이동/회전 */
  const st = { x: 0, y: 0.1, scale: 1, spin: 0 };
  const offX = mobile ? 1.0 : 1.7;
  gsap.timeline({ scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } })
    .to(st, { x: offX, y: 0.15, scale: 1, spin: 1.4, ease: "none" })          // hero → resonance(우측)
    .to(st, { x: -offX, y: -0.2, scale: 1.05, spin: 2.8, ease: "none" })      // instruments(좌측)
    .to(st, { x: offX * 0.55, y: 0.6, scale: 0.62, spin: 4.0, ease: "none" }) // voices(우상단, 중앙 회피)
    .to(st, { x: offX * 0.85, y: 0.35, scale: 0.9, spin: 5.2, ease: "none" }); // legacy → footer

  /* 마우스 패럴랙스 */
  const mouse = { x: 0, y: 0 };
  if (ym_hoverable) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5);
      mouse.y = (e.clientY / window.innerHeight - 0.5);
    });
  }

  let mx = 0, my = 0;
  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    mx += (mouse.x - mx) * 0.05;
    my += (mouse.y - my) * 0.05;
    group.position.x = st.x + mx * 0.5;
    group.position.y = st.y - my * 0.4;
    group.scale.setScalar(st.scale * (mobile ? 0.78 : 1));
    mesh.rotation.x = t * 0.12 + st.spin * 0.6 + my * 0.5;
    mesh.rotation.y = t * 0.18 + mx * 0.6;
    mesh.rotation.z = st.spin;
    renderer.render(scene, camera);
  }
  gsap.ticker.add(render);

  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); ScrollTrigger.refresh(); }, 200); });
}
ym_initRing();

/* ---------- refresh ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
