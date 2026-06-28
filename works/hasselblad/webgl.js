/* ============================================================
   HASSELBLAD — WebGL 히어로 (OGL 셰이더 플레인)
   마우스 디스플레이스먼트 리플 + 스크롤 색수차 · 점진적 향상
   WebGL/CDN 실패 시 조용히 폴백(<img> 유지)
   ============================================================ */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("heroGl");
const source = document.getElementById("heroImg");

if (canvas && source && !reduce) {
  import("https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm")
    .then((OGL) => initGL(OGL))
    .catch(() => {/* CDN 실패 → img 폴백 */});
}

function initGL(OGL) {
  const { Renderer, Program, Mesh, Triangle, Texture } = OGL;

  let renderer, gl;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(2, window.devicePixelRatio || 1), alpha: false });
    gl = renderer.gl;
  } catch (e) { return; }              // WebGL 미지원 → 폴백
  if (!gl) return;

  const hero = document.querySelector(".hero");

  const vertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tMap;
    uniform vec2  uMouse;
    uniform float uVel;
    uniform float uTime;
    uniform float uScroll;
    uniform float uHover;
    uniform float uImgAspect;
    uniform float uPlaneAspect;
    uniform float uReady;

    vec2 cover(vec2 uv, float ia, float pa) {
      vec2 s = uv - 0.5;
      if (pa > ia) { s.y *= ia / pa; }
      else         { s.x *= pa / ia; }
      return s + 0.5;
    }

    void main() {
      vec2 uv = cover(vUv, uImgAspect, uPlaneAspect);

      // 마우스 주변 물결 디스플레이스먼트
      float d = distance(vUv, uMouse);
      vec2 dir = normalize(vUv - uMouse + 0.0001);
      float falloff = smoothstep(0.45, 0.0, d);
      float ripple = sin(d * 24.0 - uTime * 3.2) * 0.006 * uHover * falloff;
      vec2 disp = dir * ripple;

      // 미세한 상시 흐름
      disp += vec2(sin(uTime * 0.3 + uv.y * 6.0),
                   cos(uTime * 0.24 + uv.x * 6.0)) * 0.0016;
      uv += disp;

      // 색수차: 스크롤 + 마우스 속도 + 호버에 비례
      float ca = 0.0015 + uScroll * 0.013 + uVel * 0.05 + uHover * falloff * 0.004;
      float r = texture2D(tMap, uv + dir * ca).r;
      float g = texture2D(tMap, uv).g;
      float b = texture2D(tMap, uv - dir * ca).b;
      vec3 col = vec3(r, g, b);

      // 비네팅
      float vig = smoothstep(1.05, 0.35, distance(vUv, vec2(0.5)));
      col *= mix(0.82, 1.0, vig);

      gl_FragColor = vec4(col * uReady, 1.0);
    }
  `;

  const texture = new Texture(gl, { generateMipmaps: false, premultiplyAlpha: false });
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      tMap:        { value: texture },
      uMouse:      { value: [0.5, 0.5] },
      uVel:        { value: 0 },
      uTime:       { value: 0 },
      uScroll:     { value: 0 },
      uHover:      { value: 0 },
      uImgAspect:  { value: 1 },
      uPlaneAspect:{ value: 1 },
      uReady:      { value: 0 },
    },
  });
  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  // OGL Renderer 생성자가 캔버스에 inline 300x150을 박으므로
  // 캔버스가 아닌 부모(.hero__media)를 기준으로 측정한다.
  const box = canvas.parentElement || canvas;
  function resize() {
    const r = box.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height);
    program.uniforms.uPlaneAspect.value = r.width / r.height;
  }
  window.addEventListener("resize", resize);

  // 텍스처 로드 (이미 디코드된 hero img 사용)
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    texture.image = img;
    program.uniforms.uImgAspect.value = img.naturalWidth / img.naturalHeight;
    resize();
    canvas.classList.add("is-ready");   // CSS로 페이드인
  };
  img.src = source.currentSrc || source.src;

  // 포인터
  const target = { x: 0.5, y: 0.5 };
  const smooth = { x: 0.5, y: 0.5 };
  let hoverTarget = 0;
  if (hero) {
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1.0 - (e.clientY - r.top) / r.height;
      hoverTarget = 1;
    });
    hero.addEventListener("pointerleave", () => { hoverTarget = 0; });
  }

  const heroEl = hero || document.body;
  let raf;
  function update(t) {
    const time = t * 0.001;
    program.uniforms.uTime.value = time;

    const px = smooth.x, py = smooth.y;
    smooth.x += (target.x - smooth.x) * 0.08;
    smooth.y += (target.y - smooth.y) * 0.08;
    program.uniforms.uMouse.value = [smooth.x, smooth.y];

    const vel = Math.hypot(smooth.x - px, smooth.y - py);
    const u = program.uniforms;
    u.uVel.value += (vel - u.uVel.value) * 0.2;
    u.uHover.value += (hoverTarget - u.uHover.value) * 0.06;

    const rect = heroEl.getBoundingClientRect();
    const prog = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    u.uScroll.value = prog;
    u.uReady.value += ((texture.image ? 1 : 0) - u.uReady.value) * 0.05;

    // 히어로가 화면 밖이면 렌더 스킵(성능)
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      renderer.render({ scene: mesh });
    }
    raf = requestAnimationFrame(update);
  }
  raf = requestAnimationFrame(update);
}
