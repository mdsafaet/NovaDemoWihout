import { useEffect, useRef } from "react";

import { addTicker } from "@/lib/ticker";
import { lenisRef } from "@/lib/lenis";
import { glState } from "@/lib/gl-state";

const COBALT = [17 / 255, 40 / 255, 153 / 255];
const ICE = [0.86, 0.91, 1];
const CITIES = {
  Dubai: [25.2, 55.27],
  Dhaka: [23.81, 90.41],
  "New York": [40.71, -74.0],
  London: [51.5, -0.12],
};
const ARCS = [
  ["Dhaka", "Dubai"],
  ["Dubai", "London"],
  ["London", "New York"],
  ["New York", "Dubai"],
];

// Camera "flight path" across the whole page: [progress, x, y, rotX, rotY, scale]
const KEYS = [
  [0.0, 0.3, -0.12, 0.95, 0.35, 1.0],
  [0.2, -0.26, 0.04, 0.8, 0.95, 0.9],
  [0.42, 0.28, 0.1, 1.1, 1.65, 1.1],
  [0.62, -0.3, 0.0, 0.7, 2.4, 1.0],
  [0.82, 0.26, 0.1, 1.0, 3.2, 1.15],
  [1.0, 0.0, 0.0, 0.85, 4.0, 1.0],
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const smooth = (t) => t * t * (3 - 2 * t);
const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const sampleKeys = (p) => {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = smooth(clamp((p - a[0]) / (b[0] - a[0]), 0, 1));
  return a.slice(1).map((v, k) => v + (b[k + 1] - v) * t);
};
const noise3 = (x, y, z) =>
  Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7) + Math.sin(z * 3.7 + x * 1.9) * 0.6 + Math.cos(y * 5.3 + z * 2.1) * 0.35;
const latLon = (lat, lon) => {
  const φ = (lat * Math.PI) / 180, λ = (lon * Math.PI) / 180;
  return [Math.cos(φ) * Math.sin(λ), Math.sin(φ), Math.cos(φ) * Math.cos(λ)] ;
};

/* ---------------------------------- shaders --------------------------------- */
const CITY_VERT = /* glsl */ `
attribute float aH; attribute float aPh; attribute float aRad;
uniform float uIntro; uniform float uTime; varying float vA;
void main(){
  vec3 p = position;
  float g = smoothstep(0., 1., clamp(uIntro * 1.7 - aPh * 0.7, 0., 1.));
  p.y *= g;
  float pulse = pow(sin(uTime * .5 - aRad * 5. + aPh * 3.) * .5 + .5, 6.);
  vA = (0.28 + 0.72 * aH) * (1. - aRad * .85) * (0.6 + 0.9 * pulse) * g;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;
const CITY_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){ gl_FragColor = vec4(uColor, vA * uOpacity); }`;

const DUST_VERT = /* glsl */ `
attribute vec3 aSeed; uniform float uTime; uniform float uScroll; uniform float uWrap; uniform float uDpr; uniform float uD;
varying float vA;
void main(){
  vec3 p = position;
  p.x += sin(uTime * .2 + aSeed.x * 6.28) * 18.;
  p.y = mod(p.y + uScroll * (0.15 + aSeed.z * 0.85) + uWrap * .5, uWrap) - uWrap * .5;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = (1.4 + aSeed.y * 3.2) * uDpr * clamp(uD / -mv.z, .3, 2.5);
  vA = 0.35 + 0.65 * aSeed.y;
  gl_Position = projectionMatrix * mv;
}`;
const DUST_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){ float d = length(gl_PointCoord - .5); if(d > .5) discard;
  gl_FragColor = vec4(uColor, smoothstep(.5, .05, d) * vA * uOpacity); }`;

const HERO_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const HERO_FRAG = /* glsl */ `
uniform sampler2D uTex; uniform vec2 uPlane; uniform float uImg; uniform float uParallax;
uniform vec2 uMouse; uniform float uVel; uniform float uTime; uniform float uIntro; varying vec2 vUv;
vec2 cover(vec2 uv){
  float pa = uPlane.x / uPlane.y;
  vec2 s = pa > uImg ? vec2(1., uImg / pa) : vec2(pa / uImg, 1.);
  vec2 o = vec2(.5, .52);
  return (uv - o) * s * .92 + o;
}
void main(){
  vec2 uv = vUv;
  float pa = uPlane.x / uPlane.y;
  vec2 d = (uv - uMouse) * vec2(pa, 1.);
  float lens = smoothstep(.38, 0., length(d));
  uv += (uv - uMouse) * lens * .05;
  uv += vec2(sin(uv.y * 9. + uTime * .6), cos(uv.x * 9. + uTime * .5)) * .0022;
  uv.y += uParallax * .05;
  vec2 c = cover(uv);
  float sp = uVel * .004;
  vec3 col = vec3(texture2D(uTex, c + vec2(sp, 0.)).r, texture2D(uTex, c).g, texture2D(uTex, c - vec2(sp, 0.)).b);
  float reveal = smoothstep(0., 1., clamp(uIntro * 1.4 - (1. - vUv.y) * .4, 0., 1.));
  gl_FragColor = vec4(col * (.25 + .75 * reveal), 1.);
}`;

const GLOBE_VERT = /* glsl */ `
attribute float aLand; uniform float uDpr; varying float vF; varying float vL;
void main(){
  vec3 n = normalize(normalMatrix * normalize(position));
  vF = smoothstep(-.05, .45, n.z); vL = aLand;
  gl_PointSize = (1.5 + aLand * 1.9) * uDpr;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;
const GLOBE_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying float vF; varying float vL;
void main(){ float d = length(gl_PointCoord - .5); if(d > .5) discard;
  gl_FragColor = vec4(uColor, smoothstep(.5, .1, d) * mix(.08, 1., vF) * (.3 + .7 * vL) * uOpacity); }`;
const GRAT_VERT = /* glsl */ `varying float vF; void main(){ vec3 n = normalize(normalMatrix * normalize(position)); vF = smoothstep(-.1, .5, n.z); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const GRAT_FRAG = /* glsl */ `uniform vec3 uColor; uniform float uOpacity; varying float vF; void main(){ gl_FragColor = vec4(uColor, mix(.02, .16, vF) * uOpacity); }`;
const ARC_VERT = /* glsl */ `
attribute float aT; varying float vT; varying float vF;
void main(){ vT = aT; vec3 n = normalize(normalMatrix * normalize(position)); vF = smoothstep(-.05, .3, n.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const ARC_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uTime; uniform float uBoost; uniform float uOff; uniform float uOpacity; varying float vT; varying float vF;
void main(){
  float dist = mod(fract(uTime * .22 + uOff) - vT + 1., 1.);
  float pulse = exp(-dist * 12.);
  gl_FragColor = vec4(uColor, vF * (.14 + .5 * uBoost) * (.35 + 1.1 * pulse) * uOpacity);
}`;
const HALO_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
void main(){ float d = length(vUv - .5) * 2.;
  float a = smoothstep(1., .8, d) * .12 + exp(-pow((d - .8) * 9., 2.)) * .32 + step(d, .8) * .05;
  gl_FragColor = vec4(uColor, a * uOpacity); }`;

/* ----------------------------------- scene ---------------------------------- */
function start(THREE, canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch {
    return () => {};
  }
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = window.innerWidth, h = window.innerHeight;
  const small = w < 800;
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, w / h, 10, 9000);
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(35 / 2));
  const placeCamera = () => {
    camera.aspect = w / h;
    camera.position.z = h / 2 / tanHalf; // 1 world unit == 1 CSS px at z = 0
    camera.updateProjectionMatrix();
  };
  placeCamera();

  const shared = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Vector3(...COBALT) },
    uDpr: { value: dpr },
    uD: { value: camera.position.z },
  };
  const mat = (vertexShader, fragmentShader, uniforms, extra = {}) =>
    new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: { ...shared, ...uniforms }, transparent: true, depthTest: false, depthWrite: false, ...extra });

  /* --- 1. skyline of wireframe towers + ground grid (one draw call) --- */
  const world = new THREE.Group();
  scene.add(world);
  const cityMat = mat(CITY_VERT, CITY_FRAG, { uIntro: { value: reduce ? 1 : 0 }, uOpacity: { value: 0.16 } });
  {
    const rand = rng(7);
    const N = small ? 9 : 13, gap = 130;
    const pos = [], aH = [], aPh = [], aRad = [];
    const push = (x, y, z, hh, ph, rad) => {
      pos.push(x, y, z); aH.push(hh); aPh.push(ph); aRad.push(rad);
    };
    const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const half = (gap * N) / 2;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = (i - (N - 1) / 2) * gap, z = (j - (N - 1) / 2) * gap;
        const rad = Math.hypot(x, z) / half;
        if (rand() < 0.28 + rad * 0.25) continue;
        const bw = 34 + rand() * 46, bd = 34 + rand() * 46;
        const ht = (60 + Math.pow(rand(), 2.2) * 620) * (1.15 - rad * 0.6);
        const ph = rand();
        const x0 = x - bw / 2, x1 = x + bw / 2, z0 = z - bd / 2, z1 = z + bd / 2;
        const c = [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1], [x0, ht, z0], [x1, ht, z0], [x1, ht, z1], [x0, ht, z1]];
        for (const [a, b] of E) {
          push(c[a][0], c[a][1], c[a][2], c[a][1] / ht, ph, rad);
          push(c[b][0], c[b][1], c[b][2], c[b][1] / ht, ph, rad);
        }
      }
    }
    for (let k = -N / 2; k <= N / 2; k++) {
      const o = k * gap;
      push(-half, 0, o, 0, 0, Math.abs(o) / half); push(half, 0, o, 0, 0, Math.abs(o) / half);
      push(o, 0, -half, 0, 0, Math.abs(o) / half); push(o, 0, half, 0, 0, Math.abs(o) / half);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aH", new THREE.Float32BufferAttribute(aH, 1));
    g.setAttribute("aPh", new THREE.Float32BufferAttribute(aPh, 1));
    g.setAttribute("aRad", new THREE.Float32BufferAttribute(aRad, 1));
    const lines = new THREE.LineSegments(g, cityMat);
    lines.position.y = -160;
    lines.frustumCulled = false;
    lines.renderOrder = 1;
    world.add(lines);
  }

  /* --- 2. drifting dust that parallaxes with scroll --- */
  const dustMat = mat(DUST_VERT, DUST_FRAG, { uScroll: { value: 0 }, uWrap: { value: h + 400 }, uOpacity: { value: 0.4 } });
  {
    const rand = rng(21);
    const n = small ? 650 : 1400;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([(rand() - 0.5) * w * 1.6, (rand() - 0.5) * (h + 400), -900 + rand() * 1200], i * 3);
      seed.set([rand(), rand(), rand()], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    const dust = new THREE.Points(g, dustMat);
    dust.frustumCulled = false;
    dust.renderOrder = 2;
    scene.add(dust);
  }

  /* --- 3. hero photo as a WebGL plane (lens + scroll parallax + velocity RGB split) --- */
  const heroEl = document.querySelector(".hero");
  const heroImg = document.querySelector(".hero-image");
  const heroUniforms = {
    uTex: { value: null }, uPlane: { value: new THREE.Vector2(1, 1) }, uImg: { value: 1.5 },
    uParallax: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uVel: { value: 0 }, uIntro: { value: reduce ? 1 : 0 },
  };
  const heroMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat(HERO_VERT, HERO_FRAG, heroUniforms));
  heroMesh.visible = false;
  heroMesh.renderOrder = 0;
  scene.add(heroMesh);
  let heroReady = false;
  // Hero media: a <video class="hero-video"> (if the Hero has one) wins over the still image.
  const heroVideo = document.querySelector(".hero-video");
  let onVideoReady = null;
  if (heroEl && heroVideo) {
    const setupVideo = () => {
      if (heroReady || !heroVideo.videoWidth) return;
      const tex = new THREE.VideoTexture(heroVideo);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      heroUniforms.uTex.value = tex;
      heroUniforms.uImg.value = heroVideo.videoWidth / heroVideo.videoHeight;
      heroReady = true;
      root.classList.add("gl-hero");
    };
    onVideoReady = setupVideo;
    if (heroVideo.readyState >= 2) setupVideo();
    else heroVideo.addEventListener("loadeddata", setupVideo, { once: true });
  } else if (heroEl && heroImg) {
    new THREE.TextureLoader().load(heroImg.currentSrc || heroImg.src, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      heroUniforms.uTex.value = tex;
      heroUniforms.uImg.value = tex.image.width / tex.image.height;
      heroReady = true;
      root.classList.add("gl-hero");
    });
  }

  /* --- 4. interactive globe, anchored to a DOM slot in the "presence" section --- */
  const slot = document.querySelector('[data-gl="globe"]');
  const globeRoot = new THREE.Group();
  globeRoot.visible = false;
  scene.add(globeRoot);
  const globe = new THREE.Group();
  globeRoot.add(globe);
  const globeUniforms = { uOpacity: { value: 1 }, uColor: { value: new THREE.Vector3(...ICE) } };
  const arcMats = [];
  const markers = [];
  const globeQ = new THREE.Quaternion();
  if (slot) {
    // dots
    const n = small ? 1600 : 2800;
    const p = new Float32Array(n * 3), land = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      p.set([x, y, z], i * 3);
      land[i] = clamp((noise3(x * 1.6, y * 1.6, z * 1.6) + 0.15) * 1.3, 0, 1) > 0.45 ? 1 : 0.15;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(p, 3));
    dg.setAttribute("aLand", new THREE.BufferAttribute(land, 1));
    const dots = new THREE.Points(dg, mat(GLOBE_VERT, GLOBE_FRAG, globeUniforms));
    dots.renderOrder = 4;
    globe.add(dots);

    // graticule
    const gp = [];
    const ring = (fn, seg) => {
      for (let i = 0; i < seg; i++) gp.push(...fn(i / seg), ...fn((i + 1) / seg));
    };
    for (let lat = -60; lat <= 60; lat += 30) ring((t) => latLon(lat, t * 360), 128);
    for (let lon = 0; lon < 360; lon += 30) ring((t) => latLon(-90 + t * 180, lon), 64);
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.Float32BufferAttribute(gp, 3));
    const grat = new THREE.LineSegments(gg, mat(GRAT_VERT, GRAT_FRAG, globeUniforms));
    grat.renderOrder = 3;
    globe.add(grat);

    // halo (does not rotate)
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), mat(HERO_VERT, HALO_FRAG, globeUniforms, { blending: THREE.AdditiveBlending }));
    halo.renderOrder = 3;
    globeRoot.add(halo);

    // markers
    Object.entries(CITIES).forEach(([name, [lat, lon]]) => {
      const nrm = new THREE.Vector3(...latLon(lat, lon));
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.024, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthTest: false }));
      const rg = new THREE.Mesh(new THREE.RingGeometry(0.032, 0.04, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthTest: false }));
      for (const m of [dot, rg]) { m.position.copy(nrm).multiplyScalar(1.004); m.quaternion.copy(q); m.renderOrder = 6; globe.add(m); }
      markers.push({ name, dot, ring: rg, normal: nrm });
    });

    // arcs between markets
    ARCS.forEach(([a, b], idx) => {
      const A = new THREE.Vector3(...latLon(...CITIES[a])), B = new THREE.Vector3(...latLon(...CITIES[b]));
      const ang = A.angleTo(B), seg = 64, pts = [], ts = [];
      for (let i = 0; i <= seg; i++) {
        const t = i / seg;
        const v = A.clone().lerp(B, t).normalize().multiplyScalar(1 + (0.1 + 0.3 * (ang / Math.PI)) * Math.sin(Math.PI * t));
        pts.push(v.x, v.y, v.z); ts.push(t);
      }
      const ag = new THREE.BufferGeometry();
      ag.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      ag.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
      const am = mat(ARC_VERT, ARC_FRAG, { uBoost: { value: 0 }, uOff: { value: idx * 0.27 }, uOpacity: { value: 1 }, uColor: globeUniforms.uColor });
      am.userData = { a, b };
      arcMats.push(am);
      const line = new THREE.Line(ag, am);
      line.renderOrder = 5;
      line.frustumCulled = false;
      globe.add(line);
    });
  }
  const qx = new THREE.Quaternion(), qy = new THREE.Quaternion(), qs = new THREE.Quaternion();
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();

  /* --- layout / sections (used to switch line colour on dark vs. light sections) --- */
  let sections = [];
  let docH = 1;
  const measure = () => {
    const sy = window.scrollY;
    sections = [...document.querySelectorAll("main > *, footer")].map((el) => {
      const r = el.getBoundingClientRect();
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
      const a = m.length > 3 ? m[3] : 1;
      const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
      return { top: r.top + sy, bottom: r.bottom + sy, dark: a > 0.1 && lum < 0.45 ? 1 : 0 };
    });
    docH = document.documentElement.scrollHeight;
  };
  measure();

  const resize = () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    if (nw === w && Math.abs(nh - h) < 140) return; // ignore mobile URL-bar jitter
    w = nw; h = nh;
    renderer.setSize(w, h, false);
    placeCamera();
    shared.uD.value = camera.position.z;
    dustMat.uniforms.uWrap.value = h + 400;
    measure();
  };
  window.addEventListener("resize", resize);
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: w / 2, py: h / 2 };
  const onMove = (e) => {
    mouse.tx = (e.clientX / w) * 2 - 1;
    mouse.ty = (e.clientY / h) * 2 - 1;
    mouse.px = e.clientX; mouse.py = e.clientY;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  /* ------------------------------ render loop ------------------------------ */
  let last = performance.now(), time = 0, dark = 0, vel = 0, prevScroll = window.scrollY;
  const col = new THREE.Vector3();
  const tmpIce = new THREE.Vector3();
  const stopTick = addTicker((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduce) time += dt;
    const lam = reduce ? 60 : 1;
    const scroll = lenisRef.current?.animatedScroll ?? window.scrollY;
    vel = damp(vel, (scroll - prevScroll) / Math.max(dt, 0.001), 8, dt);
    prevScroll = scroll;
    const v = clamp(vel / 2500, -1, 1);
    const progress = clamp(scroll / Math.max(1, docH - h), 0, 1);

    // section theme -> colours
    const probe = scroll + h * 0.5;
    const sec = sections.find((s) => probe >= s.top && probe < s.bottom);
    dark = damp(dark, sec ? sec.dark : 0, 4 * lam, dt);
    col.set(...COBALT).lerp(tmpIce.set(...ICE), dark);
    shared.uColor.value.copy(col);
    shared.uTime.value = time;
    cityMat.uniforms.uOpacity.value = 0.22 + dark * 0.26;
    dustMat.uniforms.uOpacity.value = 0.32 + dark * 0.28;
    dustMat.uniforms.uScroll.value = scroll;
    cityMat.uniforms.uIntro.value = Math.min(1, cityMat.uniforms.uIntro.value + dt / 2.6);

    // pointer + camera flight
    mouse.x = damp(mouse.x, mouse.tx, 3 * lam, dt);
    mouse.y = damp(mouse.y, mouse.ty, 3 * lam, dt);
    const k = sampleKeys(progress);
    const bs = small ? 0.55 : clamp(Math.min(w, 1500) / 1400, 0.6, 1.1);
    world.position.x = damp(world.position.x, k[0] * w, 2.5 * lam, dt);
    world.position.y = damp(world.position.y, k[1] * h, 2.5 * lam, dt);
    world.rotation.x = damp(world.rotation.x, k[2] + mouse.y * 0.05, 2.5 * lam, dt);
    world.rotation.y = damp(world.rotation.y, k[3] + mouse.x * 0.08 + v * 0.35, 2.5 * lam, dt);
    world.scale.setScalar(damp(world.scale.x, k[4] * bs, 2.5 * lam, dt));

    // hero plane
    if (heroReady && heroEl) {
      const r = heroEl.getBoundingClientRect();
      const on = r.bottom > 0 && r.top < h;
      heroMesh.visible = on;
      if (on) {
        heroMesh.position.set(r.left + r.width / 2 - w / 2, -(r.top + r.height / 2 - h / 2), 0);
        heroMesh.scale.set(r.width, r.height, 1);
        heroUniforms.uPlane.value.set(r.width, r.height);
        heroUniforms.uParallax.value = clamp(-r.top / r.height, -1, 1);
        heroUniforms.uMouse.value.set((mouse.px - r.left) / r.width, 1 - (mouse.py - r.top) / r.height);
        heroUniforms.uVel.value = v * 6;
        heroUniforms.uIntro.value = Math.min(1, heroUniforms.uIntro.value + dt / 1.6);
      }
    }

    // globe
    if (slot) {
      const r = slot.getBoundingClientRect();
      const on = r.bottom > -50 && r.top < h + 50 && r.width > 0;
      globeRoot.visible = on;
      if (on) {
        const rad = Math.min(r.width, r.height) / 2;
        globeRoot.position.set(r.left + r.width / 2 - w / 2, -(r.top + r.height / 2 - h / 2), 0);
        globeRoot.scale.setScalar(rad * 0.86);
        const target = CITIES[glState.market] ?? CITIES.Dubai;
        qx.setFromAxisAngle(AX, (target[0] * Math.PI) / 180);
        qy.setFromAxisAngle(AY, (-target[1] * Math.PI) / 180);
        qs.setFromAxisAngle(AY, Math.sin(time * 0.35) * 0.12 + mouse.x * 0.15);
        globeQ.copy(qx).multiply(qy).premultiply(qs.invert());
        globe.quaternion.slerp(globeQ, 1 - Math.exp(-3 * lam * dt));
        markers.forEach((m, i) => {
          const active = m.name === glState.market;
          const facing = smooth(clamp(tmp.copy(m.normal).applyQuaternion(globe.quaternion).z / 0.25, 0, 1));
          const ph = (time * 0.6 + i * 0.25) % 1;
          m.dot.scale.setScalar(damp(m.dot.scale.x, active ? 1.9 : 1, 8, dt));
          (m.dot.material).opacity = facing * (active ? 1 : 0.7);
          m.ring.scale.setScalar(1 + ph * (active ? 3 : 2));
          (m.ring.material).opacity = facing * (1 - ph) * (active ? 0.9 : 0.35);
        });
        arcMats.forEach((am) => {
          const u = am.userData;
          const hit = u.a === glState.market || u.b === glState.market ? 1 : 0;
          am.uniforms.uBoost.value = damp(am.uniforms.uBoost.value, hit, 5, dt);
        });
      }
    }

    renderer.render(scene, camera);
  });
  root.classList.add("gl");
  return () => {
    stopTick();
    ro.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMove);
    if (onVideoReady && heroVideo) heroVideo.removeEventListener("loadeddata", onVideoReady);
    root.classList.remove("gl", "gl-hero");
    scene.traverse((o) => {
      const m = o ;
      m.geometry?.dispose?.();
      const mm = m.material ;
      (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => x.dispose());
    });
    heroUniforms.uTex.value?.dispose();
    renderer.dispose();
  };
}

export default function WebGLScene() {
  const ref = useRef (null);
  useEffect(() => {
    let dead = false;
    let cleanup = () => {};
    import("three").then((THREE) => {
      if (!dead && ref.current) cleanup = start(THREE, ref.current);
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, []);
  return <canvas ref={ref} className="gl-canvas" aria-hidden="true" />;
}
