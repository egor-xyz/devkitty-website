import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer
} from 'three';

import { type HeroShared } from './heroController';

/** The window sky and the reveal ring. This is the only file that imports three. Returns the disposer. */
export function mountShaders(shared: HeroShared): () => void {
  const { reduce, stage, state } = shared;
  // A canvas whose context was force-lost cannot get a new one (dev remounts), so swap a used canvas for a fresh one.
  const fresh = (c: HTMLCanvasElement) => {
    if (!c.dataset.gl) return c;
    const n = c.cloneNode(false) as HTMLCanvasElement;
    delete n.dataset.gl;
    c.replaceWith(n);

    return n;
  };
  const sky = (shared.sky = fresh(shared.sky));
  const ring = (shared.ring = fresh(shared.ring));
  sky.dataset.gl = '1';
  ring.dataset.gl = '1';
  const fallback = () => {
    shared.fallback.hidden = false;
    sky.hidden = true;
    ring.hidden = true;
  };

  let skyR: WebGLRenderer;
  let ringR: WebGLRenderer;
  try {
    skyR = new WebGLRenderer({ alpha: false, antialias: false, canvas: sky, powerPreference: 'low-power' });
    ringR = new WebGLRenderer({ alpha: true, antialias: false, canvas: ring, premultipliedAlpha: true });
  } catch {
    fallback();

    return () => {};
  }

  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  [skyR, ringR].forEach((r) => r.setPixelRatio(dpr));
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new PlaneGeometry(2, 2);
  const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
  const common = `
    precision highp float;
    uniform vec2 uRes; uniform float uDpr, uTime, uR; uniform vec2 uC;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.03; a*=.5; } return v; }
    vec2 px(){ return vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y) / uDpr; }`;

  const skyMat = new ShaderMaterial({
    fragmentShader:
      `${common 
      }
    uniform vec2 uMouse; uniform float uPhase;
    void pal(float i, out vec3 top, out vec3 mid, out vec3 low, out vec3 hor, out vec3 glowC, out vec3 discC, out vec3 cDark, out vec3 cLite,
             out vec3 bBase, out vec2 sp, out float disc, out float stars, out float starH, out float litAmt, out float moon, out float greyK) {
      // evening (the Devkitty sunset) is the default
      top = vec3(.141,.102,.31); mid = vec3(.29,.071,.188); low = vec3(.72,.227,.086); hor = vec3(1.,.70,.48);
      glowC = vec3(1.,.55,.3); discC = vec3(1.,.88,.66); cDark = vec3(.42,.08,.2); cLite = vec3(1.,.54,.36);
      bBase = vec3(.11,.075,.10); sp = vec2(.58,.86); disc = .12; stars = 1.; starH = .3; litAmt = 1.; moon = 0.; greyK = .8;
      if (i < .5) { top = vec3(.36,.50,.80); mid = vec3(.80,.62,.76); low = vec3(1.,.72,.62); hor = vec3(1.,.88,.70);
        glowC = vec3(1.,.72,.55); discC = vec3(1.,.95,.82); cDark = vec3(.86,.62,.72); cLite = vec3(1.,.86,.80);
        bBase = vec3(.30,.24,.34); sp = vec2(.24,.80); stars = 0.; litAmt = .2; greyK = .92; }
      else if (i < 1.5) { top = vec3(.24,.50,.90); mid = vec3(.44,.68,.96); low = vec3(.70,.84,.99); hor = vec3(.94,.94,.88);
        glowC = vec3(1.,.95,.75); discC = vec3(1.,1.,.92); cDark = vec3(.86,.90,.97); cLite = vec3(1.);
        bBase = vec3(.34,.40,.52); sp = vec2(.66,.22); disc = .09; stars = 0.; litAmt = .05; greyK = 1.; }
      else if (i > 2.5) { top = vec3(.02,.02,.08); mid = vec3(.05,.05,.17); low = vec3(.11,.08,.26); hor = vec3(.26,.15,.36);
        glowC = vec3(.55,.62,.9); discC = vec3(.92,.94,1.); cDark = vec3(.07,.06,.16); cLite = vec3(.22,.2,.38);
        sp = vec2(.74,.24); disc = 0.; stars = 2.4; starH = .75; moon = 1.; greyK = .45; }
    }
    void main(){
      vec2 p = px();
      float s = uRes.x / 1200.;
      vec2 uv = (p / s - vec2(96., 66.)) / vec2(328., 260.); // 0..1 inside the window, y down
      float reveal = 1. - smoothstep(uR - 24., uR, distance(p, uC));
      float t = uTime;
      // ---- grey: drizzle over a dull city
      float cl = fbm(uv * vec2(3., 5.) + vec2(t * .03, 0.));
      vec3 grey = mix(vec3(.62), vec3(.80), uv.y) - cl * .18;
      float col = floor(uv.x * 80.);
      float drop = step(.965, fract(uv.y * 3. - t * 2.2 + h(vec2(col, 1.)) * 7.)) * step(.5, h(vec2(col, 2.)));
      grey += drop * .12;
      // ---- the Devkitty sky, by time of day: blend phase floor(uPhase) into the next one
      vec3 top, mid, low, hor, glowC, discC, cDark, cLite, bBase; vec2 sp; float disc, stars, starH, litAmt, moon, greyK;
      vec3 t2, m2, l2, h2, g2, d2, k2, c2b, b2; vec2 s2; float di2, st2, sh2, la2, mo2, gk2;
      float ph = mod(uPhase, 4.), fi = floor(ph), ff = ph - fi;
      pal(fi, top, mid, low, hor, glowC, discC, cDark, cLite, bBase, sp, disc, stars, starH, litAmt, moon, greyK);
      pal(mod(fi + 1., 4.), t2, m2, l2, h2, g2, d2, k2, c2b, b2, s2, di2, st2, sh2, la2, mo2, gk2);
      top = mix(top, t2, ff); mid = mix(mid, m2, ff); low = mix(low, l2, ff); hor = mix(hor, h2, ff);
      glowC = mix(glowC, g2, ff); discC = mix(discC, d2, ff); cDark = mix(cDark, k2, ff); cLite = mix(cLite, c2b, ff);
      bBase = mix(bBase, b2, ff); disc = mix(disc, di2, ff); stars = mix(stars, st2, ff); starH = mix(starH, sh2, ff);
      litAmt = mix(litAmt, la2, ff); moon = mix(moon, mo2, ff); greyK = mix(greyK, gk2, ff);
      // the sun/moon sets below the skyline, then the next one rises
      sp = ff < .5 ? mix(sp, sp + vec2(0., .5), ff * 2.) : mix(s2 + vec2(0., .5), s2, ff * 2. - 1.);
      vec3 sun = mix(top, mid, smoothstep(0., .45, uv.y));
      sun = mix(sun, low, smoothstep(.4, .75, uv.y));
      sun = mix(sun, hor, smoothstep(.7, .95, uv.y));
      sp += vec2((uMouse.x - .5) * .12, (uMouse.y - .5) * .05);
      float d = length((uv - sp) * vec2(1.26, 1.));
      sun += glowC * exp(-d * 5.) * .55 * (1. - moon); // no sun glow or disc at night: the moon is drawn in the scene
      sun = mix(sun, discC, smoothstep(disc + .01, disc - .01, d) * (1. - moon));
      float c2 = fbm(uv * vec2(2.4, 7.) + vec2(t * .02, 3.));
      float band = smoothstep(.55, .75, c2) * smoothstep(.15, .5, uv.y) * (1. - smoothstep(.75, .9, uv.y));
      sun = mix(sun, mix(cDark, cLite, smoothstep(.5,.9,uv.y)), band * .75);
      float star = step(.997, h(floor(uv * 160.))) * (1. - smoothstep(0., starH, uv.y)) * (.6 + .4 * sin(t * 3. + h(floor(uv * 160.)) * 40.));
      sun += star * stars;
      // ---- skyline shared by both
      float bi = floor(uv.x * 16.);
      float bh = .14 + h(vec2(bi, 9.)) * .2;
      float bld = step(1. - bh, uv.y);
      vec2 wg = vec2(fract(uv.x * 64.), fract(uv.y * 40.));
      float win = step(.35, wg.x) * step(wg.x, .75) * step(.3, wg.y) * step(wg.y, .7) * step(1. - bh + .03, uv.y);
      float lit = step(.55, h(floor(vec2(uv.x * 64., uv.y * 40.)) + floor(t * .25) * .01));
      vec3 bG = vec3(.33) + win * .06;
      vec3 bS = bBase + win * lit * vec3(1., .7, .48) * .95 * litAmt;
      grey = mix(grey, bG, bld);
      grey *= greyK;
      sun = mix(sun, bS, bld);
      float gl = dot(grey, vec3(.333));
      vec3 c = mix(vec3(gl), sun, reveal);
      c += (h(p + fract(t)) - .5) * .035; // film grain
      gl_FragColor = vec4(c, 1.);
    }`,
    uniforms: {
      uC: { value: new Vector2() },
      uDpr: { value: dpr },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uPhase: { value: 2 },
      uR: { value: 0 },
      uRes: { value: new Vector2() },
      uTime: { value: 0 }
    },
    vertexShader: vert
  });
  const ringMat = new ShaderMaterial({
    fragmentShader:
      `${common 
      }
    uniform float uA;
    void main(){
      vec2 p = px(); vec2 q = p - uC;
      float ang = atan(q.y, q.x);
      float wob = fbm(vec2(ang * 3., uTime * 1.5)) * 26.;
      float d = length(q) + wob;
      float w = 14. + uR * .05;
      float r = exp(-pow((d - uR) / w, 2.));
      float inner = exp(-pow((d - uR * .82) / (w * 2.5), 2.)) * .35;
      vec3 col = mix(vec3(1., .42, .24), vec3(1., .78, .55), r);
      float a = (r + inner) * uA;
      gl_FragColor = vec4(col * a, a);
    }`,
    transparent: true,
    uniforms: {
      uA: { value: 0 },
      uC: { value: new Vector2() },
      uDpr: { value: dpr },
      uR: { value: 0 },
      uRes: { value: new Vector2() },
      uTime: { value: 0 }
    },
    vertexShader: vert
  });
  const skyMesh = new Mesh(quad, skyMat);
  const ringMesh = new Mesh(quad, ringMat);
  const skyScene = new Scene();
  skyScene.add(skyMesh);
  const ringScene = new Scene();
  ringScene.add(ringMesh);

  const ac = new AbortController();
  const { signal } = ac;
  let raf = 0;
  let visible = true;
  let running = false;
  let stopped = false;

  function draw(now: number) {
    if (stopped) return;
    const t = now / 1000;
    skyMat.uniforms.uTime!.value = t;
    ringMat.uniforms.uTime!.value = t;
    skyMat.uniforms.uPhase!.value = shared.phase;
    skyMat.uniforms.uR!.value = state.r;
    ringMat.uniforms.uR!.value = state.r;
    (skyMat.uniforms.uC!.value as Vector2).set(state.cx, state.cy);
    (ringMat.uniforms.uC!.value as Vector2).set(state.cx, state.cy);
    ringMat.uniforms.uA!.value = state.ringA;
    skyR.render(skyScene, cam);
    ringR.render(ringScene, cam);
  }

  function size() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    skyR.setSize(w, h, false);
    ringR.setSize(w, h, false);
    (skyMat.uniforms.uRes!.value as Vector2).set(w, h);
    (ringMat.uniforms.uRes!.value as Vector2).set(w, h);
  }
  size();
  const resizeObs = new ResizeObserver(() => {
    size();
    draw(performance.now());
  });
  resizeObs.observe(stage);

  stage.addEventListener(
    'pointermove',
    (e) => {
      const r = stage.getBoundingClientRect();
      (skyMat.uniforms.uMouse!.value as Vector2).set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    },
    { signal }
  );

  let paused = false;
  function loop(now: number) {
    if (!visible || document.hidden || paused) {
      running = false;

      return;
    }
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  function startLoop() {
    if (paused) return;
    if (reduce) {
      draw(performance.now());

      return;
    }
    if (!running) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  }
  // The monitor zoom covers the hero: stop drawing until it has settled.
  window.addEventListener('devkitty:hero-pause', () => (paused = true), { signal });
  window.addEventListener(
    'devkitty:hero-resume',
    () => {
      paused = false;
      startLoop();
    },
    { signal }
  );
  shared.kick = () => {
    if (reduce || !running) draw(performance.now());
  };
  const io = new IntersectionObserver((es) => {
    visible = es[0]?.isIntersecting ?? true;
    if (visible) startLoop();
  });
  io.observe(stage);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) startLoop();
    },
    { signal }
  );
  startLoop();

  return () => {
    stopped = true;
    ac.abort();
    cancelAnimationFrame(raf);
    resizeObs.disconnect();
    io.disconnect();
    shared.kick = () => {};
    quad.dispose();
    skyMat.dispose();
    ringMat.dispose();
    skyR.dispose();
    ringR.dispose();
    skyR.forceContextLoss();
    ringR.forceContextLoss();
  };
}
