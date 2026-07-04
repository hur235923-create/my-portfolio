# JW중외제약 케이스 스터디 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JW중외제약 리디자인 결과 뒤의 UX 사고 과정을 12단계 세로 스크롤 케이스 스터디 페이지로 만들고, 메인 갤러리에서 진입할 수 있게 한다.

**Architecture:** `works/jw중외제약/casestudy.html`(+ `casestudy.css` / `casestudy.js`)를 독립 실행 페이지로 신설한다. 결과물의 '고요의 심해' `:root` 토큰·폰트·라이브러리(GSAP·ScrollTrigger·Lenis)를 재사용하고, 분석 텍스트 구간은 반투명 유리 카드로 가독성을 확보한다. 메인 `index.html`의 JW 패널(panel-4)에는 진입 버튼 1개만 추가한다.

**Tech Stack:** HTML · CSS · JavaScript · GSAP 3.12.5 · ScrollTrigger · Lenis 1.0.42 · Playwright(검증)

**검증 방식(중요):** 이 프로젝트는 정적 웹이므로 단위 테스트 대신 **CLAUDE.md 워크플로우 = 로컬 서버 + Playwright 실측**이 각 태스크의 테스트다. 매 태스크는 `구현 → 로컬 서버 기동 → Playwright로 콘솔오류 0·가로오버플로우 0·데스크톱(1440)+모바일(390) 스크린샷 → 문제 시 즉시 수정·재검증 → 커밋` 루프를 따른다. 검증용 임시 스크립트/스크린샷은 커밋하지 않는다.

**소스 문서:** `UX분석/jw중외제약/1_분석.md`, `2_개선안.md`, `3_반영.md`
**재사용 토큰(결과물 `works/jw중외제약/styles.css:7-31`):** `--abyss #04131e`, `--abyss2 #07223a`, `--deep #00407f`, `--blue #0075c5`, `--light #00a9e5`, `--cyan #5fe0ef`, `--vital #f2b24a`, `--foam #eef5fb`, `--ink #0c1820`, `--ink-s #46596a`, `--mute #8093a2`, `--sans Noto Sans KR`, `--mono JetBrains Mono`, `--ease cubic-bezier(0.22,1,0.36,1)`
**재사용 이미지(`works/jw중외제약/img/`):** deep.jpg, ink.jpg, sea.jpg, lab.jpg, research.jpg, bubbles.jpg

---

## 파일 구조

- Create: `works/jw중외제약/casestudy.html` — 12섹션 마크업 + HUD + skip-link
- Create: `works/jw중외제약/casestudy.css` — 심해 톤 토큰 + 12섹션 레이아웃 + 반응형 3분기
- Create: `works/jw중외제약/casestudy.js` — Lenis 스무스 스크롤 + 진행 게이지 + ScrollTrigger 리빌 + 카운트업
- Modify: `index.html:149-170` — panel-4에 "케이스 스터디 →" 버튼 추가
- (구현 중 생성/삭제) 임시 검증 스크립트 `verify.mjs`, 캡처 산출물 — 커밋 금지

---

## 로컬 서버 규약

정적 페이지이므로 프로젝트 루트에서 정적 서버를 띄운다.
Run: `cd "나의-포트폴리오" && python -m http.server 5500`
접속 URL: `http://localhost:5500/works/jw중외제약/casestudy.html`
(Jinja 아님 — Flask 불필요. 단, Live Server 대신 http.server로 동일 오리진 유지.)

---

## Task 0: 페이지 골격 + 진행 게이지 (심해 셸)

**Files:**
- Create: `works/jw중외제약/casestudy.html`
- Create: `works/jw중외제약/casestudy.css`
- Create: `works/jw중외제약/casestudy.js`

- [ ] **Step 1: casestudy.html 골격 작성**

`<head>`는 결과물(`works/jw중외제약/index.html:1-17`)의 폰트·라이브러리 세팅을 그대로 따르되 `split-type`은 생략한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JW중외제약 리디자인 — UX 케이스 스터디 · 허강범</title>
  <meta name="description" content="1945년 한 방울의 수액에서 시작된 흐름. JW중외제약 리디자인의 UX 사고 과정을 12단계로 기록한 케이스 스터디." />
  <script>document.documentElement.classList.add("js");</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="casestudy.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
  <script src="casestudy.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#cs-main">본문으로 건너뛰기</a>

  <!-- 상단 고정 HUD -->
  <header class="cs-hud" aria-label="케이스 스터디 탐색">
    <a class="cs-hud__back" href="../../index.html">← 포트폴리오</a>
    <div class="cs-hud__center">
      <span class="cs-hud__title">JW중외제약 · UX CASE STUDY</span>
      <span class="cs-hud__counter" id="csCounter" aria-live="polite">01 / 12</span>
    </div>
    <a class="cs-hud__live" href="index.html">라이브 보기 <span aria-hidden="true">↗</span></a>
    <span class="cs-hud__gauge" aria-hidden="true"><span class="cs-hud__gauge-fill" id="csGauge"></span></span>
  </header>

  <main id="cs-main">
    <!-- 섹션 01~12는 이후 태스크에서 채운다. 지금은 자리표시 골격만. -->
    <section class="cs-sec" id="sec-01" aria-labelledby="t01" data-idx="1"><h2 id="t01">01 · Project Intro</h2></section>
    <section class="cs-sec" id="sec-02" aria-labelledby="t02" data-idx="2"><h2 id="t02">02 · Service Understanding</h2></section>
    <section class="cs-sec" id="sec-03" aria-labelledby="t03" data-idx="3"><h2 id="t03">03 · UX Audit</h2></section>
    <section class="cs-sec" id="sec-04" aria-labelledby="t04" data-idx="4"><h2 id="t04">04 · Problem Statement</h2></section>
    <section class="cs-sec" id="sec-05" aria-labelledby="t05" data-idx="5"><h2 id="t05">05 · Design Goal</h2></section>
    <section class="cs-sec" id="sec-06" aria-labelledby="t06" data-idx="6"><h2 id="t06">06 · UX Strategy</h2></section>
    <section class="cs-sec" id="sec-07" aria-labelledby="t07" data-idx="7"><h2 id="t07">07 · UI Design</h2></section>
    <section class="cs-sec" id="sec-08" aria-labelledby="t08" data-idx="8"><h2 id="t08">08 · Design System</h2></section>
    <section class="cs-sec" id="sec-09" aria-labelledby="t09" data-idx="9"><h2 id="t09">09 · Final Design</h2></section>
    <section class="cs-sec" id="sec-10" aria-labelledby="t10" data-idx="10"><h2 id="t10">10 · Before / After</h2></section>
    <section class="cs-sec" id="sec-11" aria-labelledby="t11" data-idx="11"><h2 id="t11">11 · Expected Outcome</h2></section>
    <section class="cs-sec" id="sec-12" aria-labelledby="t12" data-idx="12"><h2 id="t12">12 · Project Reflection</h2></section>
  </main>
</body>
</html>
```

- [ ] **Step 2: casestudy.css 기초 작성**

결과물 토큰을 복사하고, 셸(HUD·게이지·섹션 기본·유리 카드·skip-link)과 반응형 3분기를 정의한다.

```css
:root{
  --abyss:#04131e; --abyss2:#07223a; --deep:#00407f; --blue:#0075c5;
  --light:#00a9e5; --cyan:#5fe0ef; --vital:#f2b24a; --foam:#eef5fb;
  --ink:#0c1820; --ink-s:#46596a; --mute:#8093a2;
  --line-d:rgba(234,244,251,.14);
  --sans:"Noto Sans KR",system-ui,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,monospace;
  --maxw:1100px; --pad:clamp(1.4rem,5vw,5rem);
  --sec-y:clamp(6rem,14vh,12rem);
  --ease:cubic-bezier(0.22,1,0.36,1);
  --glass:rgba(9,34,58,.55); --glass-line:rgba(95,224,239,.18);
}
*{margin:0;padding:0;box-sizing:border-box;}
:where(body,h1,h2,h3,h4,p,li,a,span,dt,dd,em,b,figcaption){word-break:keep-all;overflow-wrap:break-word;}
html{background:var(--abyss);-webkit-text-size-adjust:100%;scroll-behavior:smooth;}
body{font-family:var(--sans);color:var(--foam);background:var(--abyss);
  line-height:1.75;font-size:clamp(1rem,.95rem + .25vw,1.08rem);
  -webkit-font-smoothing:antialiased;overflow-x:hidden;}
.skip-link{position:fixed;left:1rem;top:-4rem;z-index:100;background:var(--cyan);
  color:var(--abyss);padding:.6rem 1rem;border-radius:.4rem;transition:top .2s;}
.skip-link:focus{top:1rem;}

/* HUD */
.cs-hud{position:fixed;inset:0 0 auto 0;z-index:60;display:flex;align-items:center;
  justify-content:space-between;gap:1rem;padding:.9rem clamp(1rem,4vw,2.4rem);
  background:linear-gradient(var(--abyss),rgba(4,19,30,.75));
  border-bottom:1px solid var(--line-d);}
.cs-hud a{color:var(--foam);text-decoration:none;font:500 .8rem/1 var(--mono);letter-spacing:.04em;}
.cs-hud a:hover{color:var(--cyan);}
.cs-hud__center{display:flex;flex-direction:column;align-items:center;gap:.25rem;text-align:center;}
.cs-hud__title{font:500 .72rem/1 var(--mono);letter-spacing:.14em;color:var(--mute);}
.cs-hud__counter{font:500 .8rem/1 var(--mono);color:var(--cyan);}
.cs-hud__gauge{position:absolute;left:0;bottom:-1px;height:2px;width:100%;background:var(--line-d);}
.cs-hud__gauge-fill{display:block;height:100%;width:100%;transform:scaleX(0);transform-origin:left;
  background:linear-gradient(90deg,var(--cyan),var(--blue));}

/* 섹션 기본 */
.cs-sec{max-width:var(--maxw);margin-inline:auto;padding:var(--sec-y) var(--pad);
  min-height:60vh;}
.cs-sec h2{font-weight:600;font-size:clamp(1.6rem,1.2rem + 2vw,2.6rem);line-height:1.2;}
.cs-kicker{font:500 .78rem/1 var(--mono);letter-spacing:.16em;color:var(--cyan);
  display:block;margin-bottom:1rem;}

/* 유리 카드(분석 구간 가독성) */
.cs-card{background:var(--glass);border:1px solid var(--glass-line);border-radius:1rem;
  padding:clamp(1.4rem,3vw,2.2rem);}

/* 리빌 */
.cs-reveal{opacity:0;transform:translateY(28px);}
html.js .cs-reveal{will-change:opacity,transform;}

@media (max-width:960px){:root{--maxw:100%;}}
@media (max-width:760px){
  .cs-hud__title{display:none;}
  .cs-sec{min-height:auto;}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  .cs-reveal{opacity:1;transform:none;}
}
```

- [ ] **Step 3: casestudy.js 기초 작성**

Lenis 스무스 스크롤 + 진행 게이지(scaleX) + 섹션 카운터 + 리빌. reduced-motion 대응 포함.

```js
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
```

- [ ] **Step 4: 로컬 서버 기동 + Playwright 검증**

Run: `cd "나의-포트폴리오" && python -m http.server 5500` (백그라운드)
Playwright로 `http://localhost:5500/works/jw중외제약/casestudy.html` 접속.
Expected:
- 콘솔 오류 0 / 실패 네트워크 요청 0
- 스크롤 시 상단 게이지 채워짐(scaleX 증가), 카운터 `01/12 → 12/12` 갱신
- 가로 오버플로우 0 (데스크톱 1440 · 모바일 390)
- 데스크톱/모바일 스크린샷으로 셸 확인

문제 발견 시 즉시 수정 후 재검증.

- [ ] **Step 5: 커밋**

```bash
git add works/jw중외제약/casestudy.html works/jw중외제약/casestudy.css works/jw중외제약/casestudy.js
git commit -m "feat(jw-casestudy): 심해 톤 셸 + 진행 게이지 골격"
```

---

## Task 1: 섹션 01 — Project Intro

**Files:** Modify `works/jw중외제약/casestudy.html:sec-01`, `casestudy.css`

소스: `1_분석.md` 머리말/§1. 역할·스택·연도는 메인 `index.html:163-166` 참조(브랜드 전략·디자인·구현 / GSAP·SplitType·Canvas / 2026).

- [ ] **Step 1: sec-01 마크업 교체**

```html
<section class="cs-sec cs-intro" id="sec-01" aria-labelledby="t01" data-idx="1">
  <img class="cs-intro__bg" src="img/deep.jpg" alt="" aria-hidden="true" />
  <div class="cs-intro__inner">
    <span class="cs-kicker cs-reveal">UX CASE STUDY — 2026</span>
    <h2 class="cs-intro__title cs-reveal" id="t01">생명이 흐르게 하다<span lang="en">KEEPING LIFE IN FLOW</span></h2>
    <p class="cs-intro__lead cs-reveal">1945년 한 방울의 수액에서 시작된 흐름. 국내 대형 제약사의 '기업 포털'식 사이트를
      <b>‘고요의 심해’ 단일 서사</b>로 재해석한 리디자인의 UX 사고 과정을 12단계로 기록한다.</p>
    <dl class="cs-intro__meta cs-reveal">
      <div><dt>ROLE</dt><dd>브랜드 전략 · 디자인 · 구현</dd></div>
      <div><dt>STACK</dt><dd>GSAP · SplitType · Canvas</dd></div>
      <div><dt>YEAR</dt><dd>2026</dd></div>
    </dl>
    <p class="cs-intro__hint cs-reveal" aria-hidden="true">SCROLL — 아래로 흐릅니다</p>
  </div>
</section>
```

- [ ] **Step 2: CSS 추가 (intro)**

```css
.cs-intro{position:relative;min-height:100vh;display:flex;align-items:center;
  max-width:none;padding-inline:var(--pad);overflow:hidden;}
.cs-intro__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  opacity:.5;filter:saturate(1.1);}
.cs-intro::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(4,19,30,.4),var(--abyss));}
.cs-intro__inner{position:relative;z-index:2;max-width:var(--maxw);margin-inline:auto;width:100%;}
.cs-intro__title{font-weight:600;font-size:clamp(2.4rem,1.5rem + 5vw,5rem);line-height:1.08;margin:.4rem 0 1.4rem;}
.cs-intro__title span{display:block;font:500 clamp(.85rem,1.4vw,1.1rem)/1 var(--mono);
  letter-spacing:.28em;color:var(--cyan);margin-top:1rem;}
.cs-intro__lead{max-width:44ch;color:#d6e6f2;font-size:clamp(1.05rem,1vw + .8rem,1.3rem);}
.cs-intro__meta{display:flex;gap:2.4rem;margin-top:2.4rem;flex-wrap:wrap;}
.cs-intro__meta dt{font:500 .72rem/1 var(--mono);letter-spacing:.12em;color:var(--mute);}
.cs-intro__meta dd{font-size:.95rem;margin-top:.35rem;}
.cs-intro__hint{margin-top:3rem;font:500 .78rem/1 var(--mono);letter-spacing:.14em;color:var(--cyan);}
```

- [ ] **Step 3: Playwright 검증** — 콘솔 0, 히어로 배경/그라디언트 정상, 텍스트 대비 양호, 모바일에서 타이틀 오버플로우 0. 데스크톱+모바일 스크린샷 확인.
- [ ] **Step 4: 커밋** `git commit -am "feat(jw-casestudy): 01 Project Intro"`

---

## Task 2: 섹션 02 Service Understanding · 03 UX Audit

**Files:** Modify `casestudy.html:sec-02, sec-03`, `casestudy.css`
소스: `1_분석.md` §1~2(02), §3(03).

- [ ] **Step 1: sec-02 마크업** — 브랜드 목적/핵심가치/사용자 3층을 유리 카드로.

```html
<section class="cs-sec" id="sec-02" aria-labelledby="t02" data-idx="2">
  <span class="cs-kicker cs-reveal">02 — Service Understanding</span>
  <h2 class="cs-reveal" id="t02">브랜드와 사용자를 먼저 이해한다</h2>
  <div class="cs-grid3">
    <div class="cs-card cs-reveal"><h3>브랜드 목적</h3><p>1945년 광복과 함께 태어난 제약사. 국내 최초 수액(1959)에서 시작된 헤리티지 위에
      "생명이 흐르게 하다"를 핵심 은유로, 혁신신약과 AI 신약개발 플랫폼 ‘JWave’를 함께 전한다.</p></div>
    <div class="cs-card cs-reveal"><h3>핵심 가치</h3><p>생명존중 · 개척정신 · 80년 헤리티지 · 연구 기술력 · 사회적 신뢰.</p></div>
    <div class="cs-card cs-reveal"><h3>주요 사용자</h3>
      <ul><li><b>환자·보호자</b> — 신뢰할 만한 회사인가, 어떤 약을 만드는가</li>
        <li><b>투자자·구직자·파트너</b> — 규모·성장·R&D 경쟁력(JWave)</li>
        <li><b>채용담당자·동료</b> — 브랜드 해석력과 인터랙티브 구현력</li></ul></div>
  </div>
</section>
```

- [ ] **Step 2: sec-03 마크업** — 기존 UX 진단 7항목 리스트.

```html
<section class="cs-sec" id="sec-03" aria-labelledby="t03" data-idx="3">
  <span class="cs-kicker cs-reveal">03 — UX Audit</span>
  <h2 class="cs-reveal" id="t03">기존 사이트를 진단한다</h2>
  <p class="cs-lead cs-reveal">국내 대형 제약사 기업 사이트의 통상 패턴을 기준으로 한 베이스라인 진단.</p>
  <dl class="cs-audit">
    <div class="cs-reveal"><dt>정보구조(IA)</dt><dd>회사소개/IR/제품/채용이 병렬 나열된 ‘기업 포털’ — 헤리티지·비전·제품이 흩어져 하나의 서사로 안 읽힘.</dd></div>
    <div class="cs-reveal"><dt>내비게이션</dt><dd>다층 GNB·방대한 메뉴로 브랜드 정서보다 ‘기능적 탐색’에 치우침.</dd></div>
    <div class="cs-reveal"><dt>시각 계층</dt><dd>보도자료·배너가 균질 나열 — 브랜드 메시지 위계 약함, ‘생명·흐름’ 정서 부재.</dd></div>
    <div class="cs-reveal"><dt>콘텐츠</dt><dd>사실 나열(설립·매출·제품명) 중심 — ‘생명을 대하는 태도’라는 정서 축이 약함.</dd></div>
    <div class="cs-reveal"><dt>인터랙션</dt><dd>정적 페이지·탭 전환 위주 — 핵심 은유 ‘흐름(flow)’이 움직임으로 구현되지 않음.</dd></div>
    <div class="cs-reveal"><dt>접근성</dt><dd>모션 강화 시 스크린리더·키보드·모션 민감 사용자, 한·영 병기 처리가 소홀해지기 쉬움.</dd></div>
    <div class="cs-reveal"><dt>모바일</dt><dd>다층 패럴랙스·캔버스·세로 타이포의 성능 부담과 소형 화면 처리 리스크.</dd></div>
  </dl>
</section>
```

- [ ] **Step 3: CSS 추가**

```css
.cs-lead{max-width:52ch;color:#c8d8e6;margin:.4rem 0 2rem;}
.cs-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-top:2rem;}
.cs-card h3{font:600 1.05rem/1.3 var(--sans);color:var(--cyan);margin-bottom:.7rem;}
.cs-card ul{list-style:none;display:grid;gap:.6rem;}
.cs-card li{padding-left:1rem;position:relative;}
.cs-card li::before{content:"—";position:absolute;left:0;color:var(--cyan);}
.cs-audit{display:grid;gap:.9rem;margin-top:1.6rem;}
.cs-audit div{display:grid;grid-template-columns:11rem 1fr;gap:1rem;padding:1rem 1.2rem;
  border:1px solid var(--line-d);border-radius:.7rem;background:rgba(7,34,58,.35);}
.cs-audit dt{font:500 .9rem/1.4 var(--mono);color:var(--cyan);}
@media (max-width:760px){
  .cs-grid3{grid-template-columns:1fr;}
  .cs-audit div{grid-template-columns:1fr;gap:.35rem;}
}
```

- [ ] **Step 4: Playwright 검증** — 3열 그리드가 모바일에서 1열로, 카드 대비 가독성 확인, 오버플로우 0. 스크린샷.
- [ ] **Step 5: 커밋** `git commit -am "feat(jw-casestudy): 02 Service Understanding · 03 UX Audit"`

---

## Task 3: 섹션 04 Problem Statement · 05 Design Goal

**Files:** Modify `casestudy.html:sec-04, sec-05`, `casestudy.css`
소스: `1_분석.md` §4~6(04), §7(05).

- [ ] **Step 1: sec-04 마크업** — P1~P5 카드 + Why 연결 + 문제정의 대형 인용.

```html
<section class="cs-sec" id="sec-04" aria-labelledby="t04" data-idx="4">
  <span class="cs-kicker cs-reveal">04 — Problem Statement</span>
  <h2 class="cs-reveal" id="t04">무엇이, 왜 문제인가</h2>
  <ol class="cs-pains">
    <li class="cs-card cs-reveal"><span class="cs-pno">P1</span><p><b>병렬 IA</b>가 브랜드 메시지를 흩어 ‘생명을 대하는 태도’가 전달되지 않는다.<em>← 부서·기능 단위로 IA를 구성해 서사를 통합하지 못함</em></p></li>
    <li class="cs-card cs-reveal"><span class="cs-pno">P2</span><p>헤리티지(과거)와 R&D(미래)가 <b>분리</b>되어 ‘한 흐름’이라는 핵심 서사가 끊긴다.<em>← ‘흐름’이라는 연결 개념을 IA로 승격하지 않음</em></p></li>
    <li class="cs-card cs-reveal"><span class="cs-pno">P3</span><p>사실 나열·스톡 이미지로 <b>‘생명·흐름’의 정서가 시각적으로 부재</b>하다.<em>← 이미지를 정보 삽화로만 사용, 은유를 시각 시스템화하지 않음</em></p></li>
    <li class="cs-card cs-reveal"><span class="cs-pno">P4</span><p><b>‘흐름(flow)’을 체감할 인터랙션 장치가 없다.</b><em>← 모션을 장식으로 인식, 핵심 은유를 관통하는 장치 부재</em></p></li>
    <li class="cs-card cs-reveal"><span class="cs-pno">P5</span><p>딱딱한 기업 톤으로 <b>신뢰가 숫자로만</b> 쌓일 뿐 정서적 공감으로 이어지지 않는다.<em>← 신뢰를 정량 지표로만 환원</em></p></li>
  </ol>
  <blockquote class="cs-quote cs-reveal">사용자는 “이 제약사가 생명을 대하는 태도와, 과거에서 미래로 이어지는 흐름”을 신뢰감 있게 이해하려 하지만,
    기업 포털식 병렬 IA와 사실 나열 탓에 브랜드 메시지가 흩어져 <b>정서적 신뢰에 도달하지 못한다.</b></blockquote>
</section>
```

- [ ] **Step 2: sec-05 마크업** — G1~G4 그리드.

```html
<section class="cs-sec" id="sec-05" aria-labelledby="t05" data-idx="5">
  <span class="cs-kicker cs-reveal">05 — Design Goal</span>
  <h2 class="cs-reveal" id="t05">디자인 목표</h2>
  <div class="cs-goals">
    <div class="cs-card cs-reveal"><span class="cs-gno">G1</span><p>기업 포털을 <b>‘고요의 심해’ 단일 서사</b>로 재편해 브랜드 메시지를 하나로 모은다.</p></div>
    <div class="cs-card cs-reveal"><span class="cs-gno">G2</span><p>과거→현재→미래를 <b>‘흐름(flow)’이라는 하나의 축</b>으로 연결한다.</p></div>
    <div class="cs-card cs-reveal"><span class="cs-gno">G3</span><p>‘물·심해·흐름’ 은유를 <b>시각·인터랙션 시스템</b>으로 구현해 정서적 신뢰를 만든다.</p></div>
    <div class="cs-card cs-reveal"><span class="cs-gno">G4</span><p>한·영 바이링구얼 프리미엄 경험을 제공하되 <b>성능·접근성</b>을 지킨다.</p></div>
  </div>
</section>
```

- [ ] **Step 3: CSS 추가**

```css
.cs-pains{list-style:none;display:grid;gap:1rem;margin:1.8rem 0;}
.cs-pains li{display:grid;grid-template-columns:3.4rem 1fr;gap:1.1rem;align-items:start;}
.cs-pno,.cs-gno{font:600 1.1rem/1 var(--mono);color:var(--vital);}
.cs-pains em{display:block;margin-top:.5rem;color:var(--mute);font-style:normal;font-size:.9rem;}
.cs-quote{margin-top:2rem;padding:1.6rem 1.8rem;border-left:3px solid var(--cyan);
  background:rgba(7,34,58,.4);border-radius:0 .8rem .8rem 0;font-size:clamp(1.1rem,1vw + .9rem,1.45rem);line-height:1.6;}
.cs-goals{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem;margin-top:1.8rem;}
.cs-goals .cs-card{display:grid;grid-template-columns:3rem 1fr;gap:1rem;align-items:start;}
.cs-goals .cs-gno{color:var(--cyan);}
@media (max-width:760px){.cs-goals{grid-template-columns:1fr;}}
```

- [ ] **Step 4: Playwright 검증** — P/G 번호 정렬, 인용 대비, 모바일 1열 전환, 오버플로우 0. 스크린샷.
- [ ] **Step 5: 커밋** `git commit -am "feat(jw-casestudy): 04 Problem · 05 Goal"`

---

## Task 4: 섹션 06 — UX Strategy (흐름도)

**Files:** Modify `casestudy.html:sec-06`, `casestudy.css`
소스: `1_분석.md` §8(S1~S6).

- [ ] **Step 1: sec-06 마크업** — IA 흐름 파이프 + S1~S6.

```html
<section class="cs-sec" id="sec-06" aria-labelledby="t06" data-idx="6">
  <span class="cs-kicker cs-reveal">06 — UX Strategy</span>
  <h2 class="cs-reveal" id="t06">‘깊이로 내려가는’ 단일 스토리로 재편</h2>
  <ol class="cs-flow cs-reveal" aria-label="재편된 정보구조 흐름">
    <li>Hero<span>심해</span></li><li>Glance<span>현황</span></li><li>Heritage<span>과거</span></li>
    <li>R&amp;D<span>미래·JWave</span></li><li>Products<span>제품</span></li><li>Sustainability<span>철학</span></li>
  </ol>
  <ul class="cs-strat">
    <li class="cs-reveal"><b>S1 서사 통합 IA</b> — 위 6단계 ‘깊이로 내려가는’ 단일 스토리로 재편.</li>
    <li class="cs-reveal"><b>S2 관통하는 은유</b> — 좌측 세로 타이포 강(江) + 진행 게이지로 ‘흐름’을 상시 각인.</li>
    <li class="cs-reveal"><b>S3 물의 시각 시스템</b> — 심해·잉크·바다·기포 실사 + 다층 패럴랙스로 ‘깊이’를 조형화.</li>
    <li class="cs-reveal"><b>S4 흐름의 연결</b> — Heritage 타임라인이 R&D의 “물의 흐름이 데이터의 흐름으로”로 이어져 과거·미래를 봉합.</li>
    <li class="cs-reveal"><b>S5 정서적 신뢰</b> — 카운트업 수치를 “숫자가 아니라 흐름의 깊이”로 프레이밍, 철학으로 클로징.</li>
    <li class="cs-reveal"><b>S6 접근성·성능</b> — skip-link, 장식 aria-hidden, 한·영 병기, reduced-motion·저사양 대비.</li>
  </ul>
</section>
```

- [ ] **Step 2: CSS 추가**

```css
.cs-flow{list-style:none;display:flex;flex-wrap:wrap;gap:.7rem;margin:1.8rem 0 2.2rem;counter-reset:f;}
.cs-flow li{position:relative;flex:1 1 8rem;text-align:center;padding:1rem .6rem;border-radius:.7rem;
  background:linear-gradient(180deg,rgba(0,64,127,.35),rgba(7,34,58,.5));border:1px solid var(--glass-line);
  font-weight:600;font-size:.95rem;}
.cs-flow li span{display:block;font:400 .72rem/1 var(--mono);color:var(--cyan);margin-top:.4rem;}
.cs-flow li:not(:last-child)::after{content:"↓";position:absolute;right:-.6rem;top:50%;transform:translateY(-50%);
  color:var(--cyan);font-size:.9rem;}
.cs-strat{list-style:none;display:grid;gap:.8rem;}
.cs-strat li{padding:1rem 1.2rem;border:1px solid var(--line-d);border-radius:.7rem;background:rgba(7,34,58,.3);}
.cs-strat b{color:var(--cyan);}
@media (max-width:760px){.cs-flow li:not(:last-child)::after{content:"↓";right:auto;left:50%;top:auto;bottom:-.65rem;transform:translateX(-50%);}}
```

- [ ] **Step 3: Playwright 검증** — 흐름 화살표 방향(데스크톱 가로 ↓ vs 모바일 세로) 확인, 오버플로우 0. 스크린샷.
- [ ] **Step 4: 커밋** `git commit -am "feat(jw-casestudy): 06 UX Strategy"`

---

## Task 5: 결과물 스크린샷 캡처 → 섹션 07 UI Design · 09 Final Design

**Files:** Create `works/jw중외제약/img/shots/*.jpg`(캡처 산출물, 커밋함), Modify `casestudy.html:sec-07, sec-09`, `casestudy.css`

> 07/09는 실제 결과물 화면 캡처를 사용한다. 캡처 이미지는 페이지가 참조하므로 **예외적으로 커밋한다**(임시 검증 산출물이 아니라 콘텐츠 자산).

- [ ] **Step 1: 결과물 로컬 기동 + 섹션별 캡처**

로컬 서버가 떠 있는 상태에서 Playwright로 `http://localhost:5500/works/jw중외제약/index.html` 접속.
프리로더 종료를 기다린 뒤(모션 완료), 데스크톱 1440 뷰포트로 다음 섹션을 각각 캡처해 `works/jw중외제약/img/shots/`에 저장:
- `hero.jpg`(#hero), `glance.jpg`(#glance), `heritage.jpg`(#heritage), `rnd.jpg`(#rnd), `products.jpg`(#products), `sustain.jpg`(#sustain), 그리고 전체 대표 `full.jpg`(hero 풀뷰).
저장 후 각 파일 존재·용량>0 확인. (모바일 캡처 1장 `mobile.jpg`(390px)도 Final용으로 확보.)

- [ ] **Step 2: sec-07 마크업** — 구현 매핑을 캡처+캡션 교차로.

```html
<section class="cs-sec" id="sec-07" aria-labelledby="t07" data-idx="7">
  <span class="cs-kicker cs-reveal">07 — UI Design</span>
  <h2 class="cs-reveal" id="t07">전략을 화면으로 옮기다</h2>
  <div class="cs-uigrid">
    <figure class="cs-shot cs-reveal"><img src="img/shots/hero.jpg" alt="심해 배경 다층 패럴랙스 히어로 — ‘한 방울이 생명을 잇다’" loading="lazy" />
      <figcaption><b>Hero</b> deep.jpg 다층 패럴랙스 + 비대칭 타이포 + 한·영 병기로 정서·격을 즉시 형성.</figcaption></figure>
    <figure class="cs-shot cs-reveal"><img src="img/shots/glance.jpg" alt="카운트업 지표가 놓인 Glance 섹션" loading="lazy" />
      <figcaption><b>Glance</b> 1945·80년·매출·국내최초를 “숫자가 아니라 흐름의 깊이”로 프레이밍(P5).</figcaption></figure>
    <figure class="cs-shot cs-reveal"><img src="img/shots/heritage.jpg" alt="세로 연도 타임라인 Heritage 섹션" loading="lazy" />
      <figcaption><b>Heritage</b> 1945→1959→1969→Today 세로 타임라인으로 ‘아래로 흐르는’ 서사(G2).</figcaption></figure>
    <figure class="cs-shot cs-reveal"><img src="img/shots/rnd.jpg" alt="데이터 파티클 캔버스가 있는 R&D 섹션" loading="lazy" />
      <figcaption><b>R&amp;D</b> 연구 실사 + 데이터 파티클로 “물의 흐름이 데이터의 흐름으로”, 과거·미래 봉합(P2).</figcaption></figure>
    <figure class="cs-shot cs-reveal"><img src="img/shots/products.jpg" alt="세 갈래 제품 블록" loading="lazy" />
      <figcaption><b>Products</b> 위너프·리바로·헴리브라를 ‘세 갈래의 흐름’ 어긋난 블록으로 배치.</figcaption></figure>
    <figure class="cs-shot cs-reveal"><img src="img/shots/sustain.jpg" alt="대형 인용의 Sustainability 섹션" loading="lazy" />
      <figcaption><b>Sustainability</b> “생명이 흐르는 한 우리의 흐름도 멈추지 않는다”로 정서적 클로징.</figcaption></figure>
  </div>
</section>
```

- [ ] **Step 3: sec-09 마크업** — 완성 화면 쇼케이스.

```html
<section class="cs-sec" id="sec-09" aria-labelledby="t09" data-idx="9">
  <span class="cs-kicker cs-reveal">09 — Final Design</span>
  <h2 class="cs-reveal" id="t09">완성된 화면</h2>
  <figure class="cs-final cs-reveal"><img src="img/shots/full.jpg" alt="JW중외제약 리디자인 히어로 풀뷰" loading="lazy" /></figure>
  <div class="cs-final-row">
    <figure class="cs-reveal"><img src="img/shots/rnd.jpg" alt="R&D 섹션" loading="lazy" /></figure>
    <figure class="cs-reveal"><img src="img/shots/mobile.jpg" alt="모바일 뷰" loading="lazy" /></figure>
  </div>
  <a class="cs-livecta cs-reveal" href="index.html">라이브 사이트에서 직접 경험하기 <span aria-hidden="true">↗</span></a>
</section>
```

- [ ] **Step 4: CSS 추가**

```css
.cs-uigrid{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem;margin-top:2rem;}
.cs-shot img,.cs-final img,.cs-final-row img{width:100%;height:100%;object-fit:cover;
  border-radius:.8rem;border:1px solid var(--glass-line);display:block;}
.cs-shot figcaption{margin-top:.7rem;color:#c8d8e6;font-size:.92rem;}
.cs-shot b{color:var(--cyan);}
.cs-final{margin-top:1.8rem;}
.cs-final-row{display:grid;grid-template-columns:2fr 1fr;gap:1.2rem;margin-top:1.2rem;}
.cs-livecta{display:inline-block;margin-top:2rem;padding:.9rem 1.6rem;border:1px solid var(--cyan);
  border-radius:2rem;color:var(--cyan);text-decoration:none;font:500 .95rem/1 var(--mono);transition:.25s var(--ease);}
.cs-livecta:hover{background:var(--cyan);color:var(--abyss);}
@media (max-width:760px){.cs-uigrid,.cs-final-row{grid-template-columns:1fr;}}
```

- [ ] **Step 5: Playwright 검증** — 캡처 이미지 6+3장 모두 로드(깨진 이미지 0), 2열→1열 전환, CTA 호버, 오버플로우 0. 스크린샷.
- [ ] **Step 6: 커밋**

```bash
git add works/jw중외제약/img/shots works/jw중외제약/casestudy.html works/jw중외제약/casestudy.css
git commit -m "feat(jw-casestudy): 07 UI Design · 09 Final Design + 결과물 캡처"
```

---

## Task 6: 섹션 08 — Design System

**Files:** Modify `casestudy.html:sec-08`, `casestudy.css`
소스: `1_분석.md` §9 톤 + 결과물 `styles.css:7-31` 실제 토큰.

- [ ] **Step 1: sec-08 마크업** — 컬러칩·폰트 견본·모션 언어.

```html
<section class="cs-sec" id="sec-08" aria-labelledby="t08" data-idx="8">
  <span class="cs-kicker cs-reveal">08 — Design System</span>
  <h2 class="cs-reveal" id="t08">‘고요의 심해’ 디자인 시스템</h2>
  <h3 class="cs-sub cs-reveal">Palette</h3>
  <ul class="cs-swatches cs-reveal">
    <li style="--c:#04131e"><span></span>abyss<em>#04131E</em></li>
    <li style="--c:#07223a"><span></span>abyss2<em>#07223A</em></li>
    <li style="--c:#00407f"><span></span>deep<em>#00407F</em></li>
    <li style="--c:#0075c5"><span></span>blue<em>#0075C5</em></li>
    <li style="--c:#00a9e5"><span></span>light<em>#00A9E5</em></li>
    <li style="--c:#5fe0ef"><span></span>cyan<em>#5FE0EF</em></li>
    <li style="--c:#f2b24a"><span></span>vital<em>#F2B24A</em></li>
    <li style="--c:#eef5fb"><span></span>foam<em>#EEF5FB</em></li>
  </ul>
  <h3 class="cs-sub cs-reveal">Typography</h3>
  <div class="cs-type cs-reveal">
    <p class="cs-type__sans">Noto Sans KR — 생명이 흐르게 하다<em>본문 · 제목</em></p>
    <p class="cs-type__mono">JetBrains Mono — SINCE 1945 · KEEPING LIFE IN FLOW<em>데이터 · 라벨 · 연구소 감성</em></p>
  </div>
  <h3 class="cs-sub cs-reveal">Motion</h3>
  <p class="cs-lead cs-reveal">세로 진행 게이지(흐름) · 섹션 진입 클립 리빌 · 카운트업 수치 — 모두 <code>prefers-reduced-motion</code>에서 축소.
    ease는 <code>cubic-bezier(0.22, 1, 0.36, 1)</code> 하나로 통일해 리듬을 일관되게 유지.</p>
</section>
```

- [ ] **Step 2: CSS 추가**

```css
.cs-sub{font:500 .8rem/1 var(--mono);letter-spacing:.14em;color:var(--mute);
  margin:2.2rem 0 1rem;text-transform:uppercase;}
.cs-swatches{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:.9rem;}
.cs-swatches li{font:500 .8rem/1.4 var(--mono);}
.cs-swatches span{display:block;height:4.5rem;border-radius:.6rem;background:var(--c);
  border:1px solid var(--line-d);margin-bottom:.5rem;}
.cs-swatches em{display:block;color:var(--mute);font-style:normal;font-size:.72rem;}
.cs-type p{padding:1.1rem 1.3rem;border:1px solid var(--line-d);border-radius:.7rem;
  background:rgba(7,34,58,.3);margin-bottom:.8rem;font-size:1.25rem;}
.cs-type__mono{font-family:var(--mono);}
.cs-type em{float:right;font-style:normal;font-size:.78rem;color:var(--mute);font-family:var(--mono);}
.cs-lead code{font:.85em var(--mono);color:var(--cyan);}
@media (max-width:760px){.cs-swatches{grid-template-columns:repeat(2,1fr);}.cs-type em{float:none;display:block;margin-top:.4rem;}}
```

- [ ] **Step 3: Playwright 검증** — 컬러칩 8개 정확 렌더, 폰트 견본 구분, 모바일 2열, 오버플로우 0. 스크린샷.
- [ ] **Step 4: 커밋** `git commit -am "feat(jw-casestudy): 08 Design System"`

---

## Task 7: 섹션 10 — Before / After

**Files:** Modify `casestudy.html:sec-10`, `casestudy.css`
소스: `2_개선안.md` + `3_반영.md`(P1~P6).

- [ ] **Step 1: sec-10 마크업** — 좌(문제)/우(해결) 2열 대비, P1~P6.

```html
<section class="cs-sec" id="sec-10" aria-labelledby="t10" data-idx="10">
  <span class="cs-kicker cs-reveal">10 — Before / After</span>
  <h2 class="cs-reveal" id="t10">결함을 보강하다 <small>컨셉 보존형 2차 개선</small></h2>
  <div class="cs-ba">
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P1 모바일 내비</span>
      <div class="cs-ba__b"><b>Before</b> 모바일에서 섹션 메뉴가 대체 없이 display:none — 이동 수단 전무.</div>
      <div class="cs-ba__a"><b>After</b> 햄버거 → 심해 풀스크린 드로어(포커스 트랩·ESC·스크롤 락).</div></div>
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P2 흐름 연속성</span>
      <div class="cs-ba__b"><b>Before</b> 세로 타이포 강이 모바일에서 소멸 — 은유·위치감 상실.</div>
      <div class="cs-ba__a"><b>After</b> 헤더 하단 얇은 진행 게이지로 대체(riverFill 계산값 재사용).</div></div>
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P3 태스크 종착지</span>
      <div class="cs-ba__b"><b>Before</b> 대표 CTA가 #top으로 되돌아가는 막다른 루프.</div>
      <div class="cs-ba__a"><b>After</b> 문의(mailto)·제품·채용/IR 세그먼트 링크, 미완은 aria-disabled 명시.</div></div>
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P4 제품 심화</span>
      <div class="cs-ba__b"><b>Before</b> 제품 3종이 감성 카피뿐, ‘자세히’ 어포던스 0.</div>
      <div class="cs-ba__a"><b>After</b> 카드별 접근 가능 아코디언(성분·적응증·특징), 키보드 지원.</div></div>
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P5 YMYL 신뢰</span>
      <div class="cs-ba__b"><b>Before</b> 의약품 정보인데 전문가 상담 고지·정보 성격 안내 부재.</div>
      <div class="cs-ba__a"><b>After</b> “의학적 판단은 의료 전문가와 상담” 고지문으로 E-E-A-T 보강.</div></div>
    <div class="cs-ba__row cs-reveal"><span class="cs-ba__tag">P6 접근성</span>
      <div class="cs-ba__b"><b>Before</b> hero__mark 중복 낭독 / en 저대비 / 카운트업 SR 불안정 / nav 활성 표시 없음.</div>
      <div class="cs-ba__a"><b>After</b> aria-hidden 정리 · 대비 상향 · 최종값 aria-label · aria-current 활성 표시.</div></div>
  </div>
</section>
```

- [ ] **Step 2: CSS 추가**

```css
.cs-sec h2 small{display:block;font:400 .82rem/1 var(--mono);color:var(--mute);margin-top:.6rem;letter-spacing:.06em;}
.cs-ba{display:grid;gap:1rem;margin-top:2rem;}
.cs-ba__row{display:grid;grid-template-columns:9rem 1fr 1fr;gap:1rem;align-items:stretch;}
.cs-ba__tag{font:500 .82rem/1.4 var(--mono);color:var(--cyan);align-self:center;}
.cs-ba__b,.cs-ba__a{padding:1rem 1.2rem;border-radius:.7rem;font-size:.94rem;}
.cs-ba__b{background:rgba(70,89,106,.18);border:1px solid var(--line-d);}
.cs-ba__a{background:rgba(0,64,127,.28);border:1px solid var(--glass-line);}
.cs-ba__b b{color:var(--mute);} .cs-ba__a b{color:var(--cyan);}
.cs-ba__b b,.cs-ba__a b{display:block;font:600 .72rem/1 var(--mono);letter-spacing:.1em;margin-bottom:.5rem;}
@media (max-width:760px){.cs-ba__row{grid-template-columns:1fr;gap:.5rem;}.cs-ba__tag{align-self:start;}}
```

- [ ] **Step 3: Playwright 검증** — 3열(태그/Before/After)이 모바일 1열로 쌓임, 색 대비로 전/후 구분, 오버플로우 0. 스크린샷.
- [ ] **Step 4: 커밋** `git commit -am "feat(jw-casestudy): 10 Before/After"`

---

## Task 8: 섹션 11 Expected Outcome · 12 Project Reflection

**Files:** Modify `casestudy.html:sec-11, sec-12`, `casestudy.css`
소스: `1_분석.md` §10(11) + `3_반영.md` 종합/남은 사항(12 회고는 신규 작성).

- [ ] **Step 1: sec-11 마크업** — 기대효과 리스트.

```html
<section class="cs-sec" id="sec-11" aria-labelledby="t11" data-idx="11">
  <span class="cs-kicker cs-reveal">11 — Expected Outcome</span>
  <h2 class="cs-reveal" id="t11">기대 효과</h2>
  <ul class="cs-out">
    <li class="cs-reveal">기업 포털이 ‘고요의 심해’ 단일 서사로 모여 <b>브랜드 메시지가 명확·정서적으로 각인</b>된다.</li>
    <li class="cs-reveal">세로 타이포 강·패럴랙스가 ‘흐름’ 은유를 상시 체감시켜 <b>몰입·기억도</b>를 높인다.</li>
    <li class="cs-reveal">헤리티지 → R&D 구성으로 <b>과거·미래가 ‘한 흐름’</b>으로 이해된다.</li>
    <li class="cs-reveal">카운트업 수치의 정서적 프레이밍으로 <b>신뢰가 숫자를 넘어 공감</b>으로 확장된다.</li>
    <li class="cs-reveal">한·영 병기·접근성 배려로 폭넓은 사용자에게 <b>프리미엄 경험을 균질하게</b> 제공한다.</li>
  </ul>
</section>
```

- [ ] **Step 2: sec-12 마크업** — 1인칭 회고(신규) + 포트폴리오 복귀 CTA.

```html
<section class="cs-sec cs-reflect" id="sec-12" aria-labelledby="t12" data-idx="12">
  <span class="cs-kicker cs-reveal">12 — Project Reflection</span>
  <h2 class="cs-reveal" id="t12">회고</h2>
  <div class="cs-reflect__body cs-reveal">
    <p>이 프로젝트에서 가장 신경 쓴 것은 <b>‘컨셉을 지키면서 결함만 보강’</b>하는 균형이었다. 심해·흐름이라는 은유는
      브랜드의 핵심 자산이라 손대지 않되, 모바일 내비 소멸이나 막다른 CTA처럼 실제 사용자를 막는 결함은 코드 레벨에서
      근거(파일:라인)를 짚어 국소적으로 고쳤다.</p>
    <p>몰입형 인터랙션과 <b>접근성·성능</b>은 자주 충돌했다. 다층 패럴랙스·캔버스를 늘리는 대신 기존 스크롤 계산값을
      재사용해 게이지를 만들고, 모든 신규 모션을 <code>prefers-reduced-motion</code>에서 축소하는 식으로 ‘화려함’과
      ‘책임감’ 사이를 조율했다. 결과의 감도만큼이나 <b>왜 그렇게 했는지를 설명할 수 있는가</b>가 중요하다는 걸 배웠다.</p>
    <p>남은 과제도 솔직히 남겨둔다. 채용·IR은 실제 페이지가 없어 ‘준비 중’ placeholder로 처리했고, 60fps·모바일 발열은
      브라우저 실측으로 계속 확인이 필요하다. 이 케이스 스터디는 그 과정을 감추지 않고 드러내는 기록이다.</p>
  </div>
  <div class="cs-reflect__cta cs-reveal">
    <a href="../../index.html">← 포트폴리오로 돌아가기</a>
    <a class="cs-livecta" href="index.html">라이브 사이트 보기 <span aria-hidden="true">↗</span></a>
  </div>
</section>
```

- [ ] **Step 3: CSS 추가**

```css
.cs-out{list-style:none;display:grid;gap:.9rem;margin-top:1.8rem;}
.cs-out li{position:relative;padding:1rem 1.2rem 1rem 3rem;border:1px solid var(--line-d);
  border-radius:.7rem;background:rgba(7,34,58,.3);}
.cs-out li::before{content:"✓";position:absolute;left:1.1rem;top:1rem;color:var(--cyan);font-weight:700;}
.cs-reflect__body{max-width:60ch;display:grid;gap:1.1rem;color:#d0e0ee;margin-top:1.6rem;}
.cs-reflect__body code{font:.85em var(--mono);color:var(--cyan);}
.cs-reflect__cta{display:flex;gap:1.4rem;align-items:center;flex-wrap:wrap;margin-top:2.6rem;
  padding-top:2rem;border-top:1px solid var(--line-d);}
.cs-reflect__cta a:first-child{color:var(--foam);text-decoration:none;font:500 .95rem/1 var(--mono);}
.cs-reflect__cta a:first-child:hover{color:var(--cyan);}
```

- [ ] **Step 4: Playwright 검증** — 리스트/회고 가독성, 하단 CTA 2개 동작, 오버플로우 0. 스크린샷.
- [ ] **Step 5: 커밋** `git commit -am "feat(jw-casestudy): 11 Expected Outcome · 12 Reflection"`

---

## Task 9: 메인 갤러리 진입 버튼 추가

**Files:** Modify `index.html:167-168`(panel-4의 work__cta 부근)

- [ ] **Step 1: 현재 마크업 확인**

`index.html:168`은 현재:
```html
          <a class="work__cta" href="works/jw중외제약/index.html">라이브 보기<span aria-hidden="true">↗</span></a>
```

- [ ] **Step 2: CTA를 2개 링크 묶음으로 교체**

```html
          <div class="work__ctas">
            <a class="work__cta" href="works/jw중외제약/index.html">라이브 보기<span aria-hidden="true">↗</span></a>
            <a class="work__cta work__cta--ghost" href="works/jw중외제약/casestudy.html">케이스 스터디<span aria-hidden="true">→</span></a>
          </div>
```

- [ ] **Step 3: styles.css에 보조 버튼 스타일 추가**

메인 `styles.css` 끝에 추가(기존 `.work__cta` 톤 재사용):
```css
.work__ctas{display:flex;gap:.8rem;flex-wrap:wrap;align-items:center;}
.work__cta--ghost{opacity:.85;}
.work__cta--ghost:hover{opacity:1;}
```
> 주: 기존 `.work__cta`의 실제 스타일과 충돌 없으면 그대로 사용. 충돌 시 이 태스크에서 `.work__cta` 규칙을 확인해 `--ghost`만 색/보더로 구분(밑줄 or 반투명)한다.

- [ ] **Step 4: Playwright 검증** — 메인 `index.html`에서 JW 패널에 버튼 2개 노출, "케이스 스터디 →" 클릭 시 `casestudy.html` 진입, 되돌아가기 동작. 데스크톱+모바일 스크린샷. 다른 패널 레이아웃 깨짐 0.
- [ ] **Step 5: 커밋** `git commit -am "feat(portfolio): JW 패널에 케이스 스터디 진입 버튼 추가"`

---

## Task 10: 통합 검증 + 정리

**Files:** 없음(검증·정리)

- [ ] **Step 1: 전체 페이지 통합 Playwright 검증**

`casestudy.html`을 데스크톱(1440) · 태블릿(960) · 모바일(390) 3해상도로:
- [ ] 콘솔 오류 / 페이지 오류 / 실패 네트워크 요청 0건
- [ ] 12섹션 전 구간 가로 스크롤 오버플로우 0
- [ ] 진행 게이지가 최상단 0 → 최하단 1(scaleX)로 정확히 연동, 카운터 01→12 갱신
- [ ] 섹션 리빌 애니메이션 동작, `prefers-reduced-motion` 에뮬레이션에서 즉시 표시(모션 없음)
- [ ] 07/09 캡처 이미지 전부 로드(깨진 이미지 0)
- [ ] HUD의 "← 포트폴리오" / "라이브 보기 ↗" 및 하단 CTA 전부 정상 이동
- [ ] 각 해상도 대표 스크린샷으로 레이아웃·디자인 의도 확인

문제 발견 시 해당 태스크로 돌아가 수정·재커밋.

- [ ] **Step 2: 임시 산출물 정리**

검증용 임시 스크립트(`verify.mjs` 등)·임시 스크린샷 삭제. `img/shots/`(콘텐츠 자산)는 유지.
Run: `git status` — 의도치 않은 임시 파일이 스테이지/워킹트리에 없는지 확인.

- [ ] **Step 3: 최종 커밋(있을 경우)**

```bash
git add -A && git commit -m "chore(jw-casestudy): 통합 검증 반영 + 임시 산출물 정리"
```

---

## 완료 기준 (Definition of Done)

- `works/jw중외제약/casestudy.html`이 12섹션(01~12) 모두 실 콘텐츠로 채워져 독립 실행된다.
- 메인 `index.html` JW 패널에서 케이스 스터디로 진입·복귀가 된다.
- 데스크톱·태블릿·모바일에서 콘솔오류 0·가로오버플로우 0·깨진 이미지 0, 진행 게이지·리빌·reduced-motion 정상.
- 07/09가 실제 결과물 캡처를 사용한다.
- 임시 검증 산출물이 저장소에 남지 않는다.
