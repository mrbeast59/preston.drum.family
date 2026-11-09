---
layout: game
title: "Forza Horizon 10"
---

<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #0b0f14; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  canvas { display: block; }
  #hud { position: fixed; inset: 0; z-index: 10; pointer-events: none; color: #f2f6fa; }
  .panel {
    background: linear-gradient(180deg, rgba(9, 13, 20, .8), rgba(9, 13, 20, .52));
    border: 1px solid rgba(255, 255, 255, .14);
    border-radius: 12px;
    box-shadow: 0 12px 34px rgba(0, 0, 0, .38), inset 0 1px 0 rgba(255, 255, 255, .08);
    backdrop-filter: blur(10px);
  }
  #place { position: absolute; top: 20px; left: 20px; padding: 12px 16px 11px 18px; min-width: 190px; border-left: 3px solid #e11d48; }
  #place .city { font-size: 10px; letter-spacing: .24em; font-weight: 700; color: #aeb9c7; text-transform: uppercase; }
  #place .where { font-size: 21px; font-weight: 700; letter-spacing: .02em; margin-top: 2px; }
  #place .time { font-size: 11px; color: #9fb0c2; margin-top: 4px; letter-spacing: .04em; }
  #help { position: absolute; top: 20px; right: 20px; padding: 12px 15px; font-size: 11px; line-height: 1.85; color: #c4ced9; letter-spacing: .02em; }
  #help b { display: inline-block; min-width: 102px; color: #fff; font-weight: 600; }
  #speedo { position: absolute; right: 22px; bottom: 22px; width: 210px; padding: 14px 18px 13px; text-align: right; }
  #speed { font-size: 64px; line-height: .82; font-weight: 800; font-style: italic; letter-spacing: -.04em; font-variant-numeric: tabular-nums; text-shadow: 0 4px 18px rgba(0, 0, 0, .45); }
  #unit { font-size: 10px; letter-spacing: .3em; color: #9fb0c2; margin-top: 5px; font-weight: 700; }
  #gear { position: absolute; left: 16px; top: 17px; width: 38px; height: 38px; border: 1px solid rgba(255, 255, 255, .22); border-radius: 8px; display: grid; place-items: center; font-size: 20px; font-weight: 800; color: #fff; background: rgba(255, 255, 255, .06); }
  #fps { position: absolute; right: 0; bottom: calc(100% + 6px); min-width: 56px; padding: 5px 7px; border: 1px solid rgba(255, 255, 255, .14); border-radius: 7px; background: rgba(9, 13, 20, .72); box-shadow: 0 4px 14px rgba(0, 0, 0, .28); color: #d7e0ea; font-size: 10px; line-height: 1; font-weight: 700; letter-spacing: .1em; text-align: center; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .rpm { height: 5px; border-radius: 99px; background: rgba(255, 255, 255, .12); margin-top: 12px; overflow: hidden; }
  .rpm i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, #38bdf8, #f43f5e 70%, #fb7185); border-radius: inherit; transition: width .08s linear; }
  #drift { position: absolute; left: 16px; bottom: 15px; font-size: 10px; letter-spacing: .18em; font-weight: 800; color: #fb7185; opacity: 0; transform: translateY(4px); transition: .12s; }
  #drift.on { opacity: 1; transform: none; }
  #minimap { position: absolute; left: 22px; bottom: 22px; width: 180px; height: 180px; padding: 8px; box-sizing: content-box; border-radius: 14px; background: rgba(8, 12, 18, .66); border: 1px solid rgba(255, 255, 255, .14); box-shadow: 0 12px 34px rgba(0, 0, 0, .38); }
  #toast { position: absolute; top: 92px; left: 50%; transform: translate(-50%, -8px); padding: 10px 18px; border-radius: 999px; background: rgba(9, 13, 20, .8); border: 1px solid rgba(255, 255, 255, .16); font-size: 12px; letter-spacing: .04em; opacity: 0; transition: .25s; white-space: nowrap; }
  #toast.on { opacity: 1; transform: translate(-50%, 0); }
  #street { position: absolute; left: 22px; bottom: 230px; width: 198px; box-sizing: border-box; padding: 10px 12px 9px; }
  #street .label { font-size: 9px; letter-spacing: .2em; font-weight: 700; color: #aeb9c7; text-transform: uppercase; }
  #street .value { margin: 2px 0 3px; font-size: 30px; line-height: 1; font-weight: 800; font-style: italic; letter-spacing: -.03em; font-variant-numeric: tabular-nums; text-shadow: 0 4px 18px rgba(0, 0, 0, .45); }
  #street .meta { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 9px; font-weight: 700; letter-spacing: .08em; color: #9fb0c2; }
  #mult.hot { color: #ffd166; text-shadow: 0 0 12px rgba(255, 209, 102, .5); }
  #street .best { margin-top: 5px; font-size: 8px; letter-spacing: .1em; color: #77889a; }
  #vignette { position: fixed; inset: 0; pointer-events: none; z-index: 5; background: radial-gradient(ellipse at 50% 46%, transparent 50%, rgba(2, 6, 12, .44) 100%); }
  #garage { position: fixed; inset: 0; z-index: 40; display: none; align-items: center; justify-content: center; padding: 24px; overflow: auto; background: radial-gradient(circle at 50% 30%, rgba(17, 31, 50, .82), rgba(4, 8, 14, .96)); backdrop-filter: blur(12px); }
  #garage.open { display: flex; }
  .garage-panel { width: min(900px, 100%); max-height: 92vh; overflow: auto; padding: 28px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 20px; background: linear-gradient(145deg, rgba(18, 25, 36, .97), rgba(9, 14, 23, .97)); box-shadow: 0 28px 90px rgba(0, 0, 0, .62), inset 0 1px 0 rgba(255, 255, 255, .08); }
  .garage-kicker { color: #52e5ff; font-size: 10px; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; }
  .garage-panel h2 { margin: 7px 0 6px; font-size: clamp(27px, 5vw, 42px); line-height: 1; letter-spacing: -.035em; font-style: italic; }
  .garage-sub { margin: 0 0 20px; color: #9fb0c2; font-size: 12px; line-height: 1.55; }
  .car-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .car-card { position: relative; display: grid; grid-template-columns: 46px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px; color: #f2f6fa; text-align: left; border: 1px solid rgba(255, 255, 255, .14); border-radius: 14px; background: linear-gradient(145deg, rgba(255, 255, 255, .06), rgba(255, 255, 255, .02)); cursor: pointer; font: inherit; transition: border-color .18s, transform .18s, background .18s; }
  .car-card:hover { border-color: rgba(255, 255, 255, .34); transform: translateY(-2px); }
  .car-card.selected { border-color: #ffd166; background: linear-gradient(145deg, rgba(255, 209, 102, .14), rgba(255, 255, 255, .035)); box-shadow: inset 0 0 0 1px rgba(255, 209, 102, .28); }
  .car-card.selected::after { content: 'SELECTED'; position: absolute; top: 9px; right: 10px; color: #ffd166; font-size: 8px; font-weight: 800; letter-spacing: .14em; }
  .car-swatch { width: 46px; height: 46px; border-radius: 11px; border: 1px solid rgba(255, 255, 255, .3); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .38), 0 6px 16px rgba(0, 0, 0, .3); }
  .car-name { display: block; padding-right: 52px; font-size: 16px; font-weight: 800; letter-spacing: -.01em; }
  .car-tag { display: block; margin-top: 3px; color: #9fb0c2; font-size: 10px; }
  .car-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
  .car-stat { display: block; color: #93a3b4; font-size: 7px; font-weight: 800; letter-spacing: .1em; }
  .car-stat i { display: block; height: 4px; margin-bottom: 4px; border-radius: 99px; background: linear-gradient(90deg, #52e5ff, #ffd166); box-shadow: 0 0 8px rgba(82, 229, 255, .18); }
  .garage-actions { display: flex; align-items: center; gap: 14px; margin-top: 20px; flex-wrap: wrap; }
  #garage-close { padding: 12px 22px; border: 0; border-radius: 10px; background: linear-gradient(135deg, #ffd166, #ff9f43); color: #17120b; font: inherit; font-size: 12px; font-weight: 900; letter-spacing: .12em; cursor: pointer; box-shadow: 0 8px 24px rgba(255, 159, 67, .22); }
  #garage-close:hover { filter: brightness(1.08); }
  .garage-actions span { color: #7f91a3; font-size: 10px; letter-spacing: .04em; }
  @media (max-width: 760px) {
    #garage { padding: 12px; }
    .garage-panel { padding: 20px 16px; border-radius: 16px; }
    .car-list { grid-template-columns: 1fr; }
    .garage-actions span { display: none; }
    #garage-close { width: 100%; }
    #help { display: none; }
    #speedo { width: 165px; right: 12px; bottom: 12px; padding: 11px 14px 10px; }
    #speed { font-size: 48px; }
    #minimap { width: 120px; height: 120px; left: 12px; bottom: 12px; padding: 6px; }
    #street { left: 12px; bottom: 154px; width: 134px; padding: 8px 9px 7px; }
    #street .value { font-size: 22px; }
    #street .label { font-size: 8px; }
    #street .meta { font-size: 8px; }
    #street .best { margin-top: 4px; font-size: 7px; }
    #place { top: 12px; left: 12px; padding: 9px 12px; min-width: 0; }
    #place .where { font-size: 17px; }
    #toast { top: 78px; font-size: 11px; }
  }
</style>

<div id="hud">
  <div id="place" class="panel">
    <div class="city">Tokyo Metropolis</div>
    <div class="where">Shibuya Loop</div>
    <div class="time">16:24 · Golden hour · Clear</div>
  </div>
  <div id="help" class="panel">
    <div><b>WASD / ARROWS</b> drive</div>
    <div><b>SPACE</b> handbrake</div>
    <div><b>R</b> reset &nbsp; <b>C</b> camera</div>
    <div><b>M</b> sound &nbsp; <b>G</b> garage</div>
    <div><b>GOLD RINGS</b> collect for score</div>
    <div><b>CYAN DECKS</b> hit the sky stunts</div>
  </div>
  <div id="speedo" class="panel">
    <div id="gear">N</div>
    <div id="fps" aria-label="Frames per second">-- FPS</div>
    <div id="speed">0</div>
    <div id="unit">KM/H</div>
    <div class="rpm"><i id="rpm-fill"></i></div>
    <div id="drift">DRIFT</div>
  </div>
  <div id="street" class="panel" aria-label="Street score">
    <div class="label">Street score</div>
    <div class="value" id="score">0</div>
    <div class="meta"><span id="mult">x1</span><span id="rings">RINGS 0/8</span></div>
    <div class="best">BEST <span id="best">0</span></div>
  </div>
  <canvas id="minimap" width="180" height="180"></canvas>
  <div id="toast"></div>
</div>
<div id="vignette"></div>
<div id="garage" role="dialog" aria-modal="true" aria-label="Choose a car" aria-hidden="true">
  <div class="garage-panel">
    <div class="garage-kicker">Shibuya Underground</div>
    <h2>Choose your ride</h2>
    <p class="garage-sub">Every build has its own grip, drift angle and top speed. Press <b>G</b> anytime to switch, or hit the streets and find the cyan sky decks.</p>
    <div id="car-list" class="car-list"></div>
    <div class="garage-actions">
      <button id="garage-close" type="button">HIT THE STREETS</button>
      <span>WASD drive · SPACE drift · R reset · C camera</span>
    </div>
  </div>
</div>

<script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>

<script type="module">
  import * as THREE from 'three';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];

  // --- City dimensions -------------------------------------------------------
  const ROAD_W = 60;
  const BLOCK_W = 220;
  const BLOCK_L = 400;
  const GRID_X = 4;
  const GRID_Z = 3;
  const ISLAND_W = BLOCK_W - ROAD_W;
  const ISLAND_L = BLOCK_L - ROAD_W;
  const MAP_X = GRID_X * BLOCK_W;
  const MAP_Z = GRID_Z * BLOCK_L;
  const SIDEWALK_H = 0.28;
  const SPAWN = new THREE.Vector3(BLOCK_W / 2, 0, -120);
  const CAR_RADIUS = 1.55;

  // --- Renderer --------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const MAX_PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, 1.25);
  let renderPixelRatio = MAX_PIXEL_RATIO;
  renderer.setPixelRatio(renderPixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9d4ea);
  scene.fog = new THREE.Fog(0xc6d9e9, 320, 1350);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.12, 5000);
  camera.position.set(SPAWN.x, 4.4, SPAWN.z - 9);

  // --- Texture helpers -------------------------------------------------------
  function makeTexture(w, h, draw, repeatX = 1, repeatY = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    draw(g, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  const asphaltTex = makeTexture(256, 256, (g) => {
    g.fillStyle = '#3a3e44';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 7500; i++) {
      const v = 44 + Math.random() * 34;
      g.fillStyle = `rgb(${v}, ${v}, ${v + 2})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 1.3, 1.3);
    }
    g.strokeStyle = 'rgba(0,0,0,.1)';
    g.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(Math.random() * 256, Math.random() * 256);
      g.lineTo(Math.random() * 256, Math.random() * 256);
      g.stroke();
    }
  }, 110, 110);

  const sidewalkTex = makeTexture(256, 256, (g) => {
    g.fillStyle = '#b4b6b8';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(40,44,48,.28)';
    g.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      const p = i * 32;
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke();
      g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke();
    }
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * .06})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }, 5, 10);

  function facadeTexture(base, glass, lit) {
    return makeTexture(256, 256, (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 256, 256);
      const cols = 8;
      const rows = 10;
      const pad = 5;
      const cw = (256 - pad * 2) / cols;
      const rh = (256 - pad * 2) / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const on = Math.random() < .1;
          g.globalAlpha = on ? .9 : .58 + Math.random() * .2;
          g.fillStyle = on ? lit : glass;
          g.fillRect(pad + x * cw + 2, pad + y * rh + 3, cw - 5, rh - 6);
        }
      }
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(8,12,18,.24)';
      g.lineWidth = 2;
      for (let x = 0; x <= cols; x++) {
        g.beginPath(); g.moveTo(pad + x * cw, pad); g.lineTo(pad + x * cw, 256 - pad); g.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        g.beginPath(); g.moveTo(pad, pad + y * rh); g.lineTo(256 - pad, pad + y * rh); g.stroke();
      }
    });
  }

  const facadeTextures = [
    facadeTexture('#8a9097', '#394552', '#ffe3b3'),
    facadeTexture('#a49b8c', '#41464c', '#ffe8c2'),
    facadeTexture('#75838f', '#2d4050', '#c4ecff'),
    facadeTexture('#948f96', '#353d47', '#ffd9a8')
  ];

  const shopTex = makeTexture(256, 64, (g) => {
    g.fillStyle = '#232a30';
    g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = ['#ffd18a', '#ffb45e', '#fff0c8', '#ff8a6b'][(Math.random() * 4) | 0];
      g.globalAlpha = .55 + Math.random() * .35;
      g.fillRect(8 + i * 31, 14, 22, 36);
    }
    g.globalAlpha = 1;
    g.fillStyle = '#10161b';
    for (let i = 0; i < 9; i++) g.fillRect(i * 31, 0, 4, 64);
    g.fillStyle = '#2f383f';
    g.fillRect(0, 0, 256, 4);
    g.fillRect(0, 60, 256, 4);
  });
  shopTex.repeat.set(4, 1);
  const shopMat = new THREE.MeshStandardMaterial({
    map: shopTex,
    emissive: 0xffb45e,
    emissiveMap: shopTex,
    emissiveIntensity: 1.3,
    roughness: .38,
    metalness: .25
  });

  const sunTex = makeTexture(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    grd.addColorStop(0, 'rgba(255,252,232,1)');
    grd.addColorStop(.22, 'rgba(255,238,185,.9)');
    grd.addColorStop(.55, 'rgba(255,205,130,.24)');
    grd.addColorStop(1, 'rgba(255,180,90,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });

  const shadowTex = makeTexture(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,.62)');
    grd.addColorStop(.55, 'rgba(0,0,0,.3)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });

  // --- Sky and light ---------------------------------------------------------
  const skyRig = new THREE.Group();
  scene.add(skyRig);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(0x5b9bd9) },
        bottom: { value: new THREE.Color(0xffe3bd) }
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform vec3 top;
        uniform vec3 bottom;
        void main() {
          float h = normalize(vPos).y;
          vec3 c = mix(bottom, top, smoothstep(-0.08, 0.62, h));
          gl_FragColor = vec4(pow(max(c, 0.0), vec3(0.4545)), 1.0);
        }
      `
    })
  );
  sky.frustumCulled = false;
  skyRig.add(sky);

  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sunTex,
    transparent: true,
    depthWrite: false,
    fog: false,
    color: 0xffffff
  }));
  sunSprite.scale.set(190, 190, 1);
  sunSprite.position.set(-720, 520, -1400);
  skyRig.add(sunSprite);

  scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x3a3733, 1.2));
  scene.add(new THREE.AmbientLight(0xffffff, .24));

  const sunLight = new THREE.DirectionalLight(0xffe6bd, 2.8);
  sunLight.castShadow = false;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -135;
  sunLight.shadow.camera.right = 135;
  sunLight.shadow.camera.top = 135;
  sunLight.shadow.camera.bottom = -135;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 520;
  sunLight.shadow.bias = -0.00035;
  sunLight.shadow.normalBias = 0.03;
  scene.add(sunLight);
  scene.add(sunLight.target);
  sunLight.position.set(-110, 170, -70);

  // --- Shared materials and geometry ----------------------------------------
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeo = new THREE.SphereGeometry(1, 10, 8);
  const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
  const wheelGeo = new THREE.CylinderGeometry(.36, .36, .27, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(.19, .19, .29, 16);
  rimGeo.rotateZ(Math.PI / 2);

  // Smooth, tapered car shells instead of stacked boxes.
  function makeCarHullGeometry(sections, radial = 20) {
    const positions = [];
    const indices = [];
    for (const s of sections) {
      const mid = (s.b + s.t) / 2;
      const halfH = (s.t - s.b) / 2;
      for (let i = 0; i < radial; i++) {
        const a = (i / radial) * Math.PI * 2;
        const cx = Math.cos(a);
        const sy = Math.sin(a);
        positions.push(
          s.w * Math.sign(cx) * Math.pow(Math.abs(cx), .72),
          mid + halfH * Math.sign(sy) * Math.pow(Math.abs(sy), .68),
          s.z
        );
      }
    }
    for (let s = 0; s < sections.length - 1; s++) {
      const a0 = s * radial;
      const b0 = (s + 1) * radial;
      for (let i = 0; i < radial; i++) {
        const j = (i + 1) % radial;
        indices.push(a0 + i, a0 + j, b0 + j, a0 + i, b0 + j, b0 + i);
      }
    }
    const rearCenter = positions.length / 3;
    const first = sections[0];
    positions.push(0, (first.b + first.t) / 2, first.z);
    for (let i = 0; i < radial; i++) indices.push(rearCenter, (i + 1) % radial, i);
    const frontCenter = positions.length / 3;
    const last = sections[sections.length - 1];
    positions.push(0, (last.b + last.t) / 2, last.z);
    const base = (sections.length - 1) * radial;
    for (let i = 0; i < radial; i++) indices.push(frontCenter, base + i, base + (i + 1) % radial);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function makeRoundedBoxGeometry(w, h, d, radius) {
    const rr = Math.min(radius, w / 2, h / 2);
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + rr, y);
    shape.lineTo(x + w - rr, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + rr);
    shape.lineTo(x + w, y + h - rr);
    shape.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    shape.lineTo(x + rr, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - rr);
    shape.lineTo(x, y + rr);
    shape.quadraticCurveTo(x, y, x + rr, y);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: Math.min(rr * .35, d * .18),
      bevelThickness: Math.min(rr * .35, d * .18)
    });
    geo.translate(0, 0, -d / 2);
    geo.computeVertexNormals();
    return geo;
  }

  const CAR_SHAPES = {
    crimson: {
      body: [
        { z: -2.26, w: .58, b: .52, t: .86 },
        { z: -2.08, w: .90, b: .38, t: .98 },
        { z: -1.58, w: 1.03, b: .32, t: 1.05 },
        { z: -.55, w: 1.06, b: .32, t: 1.06 },
        { z: .65, w: 1.04, b: .32, t: 1.02 },
        { z: 1.62, w: 1.02, b: .34, t: .98 },
        { z: 2.12, w: .90, b: .40, t: .90 },
        { z: 2.28, w: .62, b: .50, t: .78 }
      ],
      cabin: [
        { z: -1.34, w: .35, b: .98, t: 1.10 },
        { z: -1.12, w: .65, b: .99, t: 1.32 },
        { z: -.72, w: .76, b: .99, t: 1.53 },
        { z: -.25, w: .76, b: .99, t: 1.56 },
        { z: .35, w: .70, b: .99, t: 1.52 },
        { z: .78, w: .58, b: .99, t: 1.32 },
        { z: 1.04, w: .36, b: .99, t: 1.10 },
        { z: 1.12, w: .18, b: 1.0, t: 1.04 }
      ],
      roof: { sx: 1.24, sy: .055, sz: 1.42, y: 1.55, z: -.14 },
      light: { x: .52, y: .8, z: 2.2, sx: .36, sy: .11, sz: .08 }
    },
    midnight: {
      body: [
        { z: -2.30, w: .62, b: .50, t: .82 },
        { z: -2.12, w: .96, b: .34, t: .98 },
        { z: -1.60, w: 1.08, b: .30, t: 1.00 },
        { z: -.50, w: 1.03, b: .30, t: .95 },
        { z: .70, w: .98, b: .30, t: .88 },
        { z: 1.70, w: .94, b: .33, t: .80 },
        { z: 2.30, w: .64, b: .40, t: .70 }
      ],
      cabin: [
        { z: -1.72, w: .20, b: .90, t: .96 },
        { z: -1.30, w: .60, b: .94, t: 1.14 },
        { z: -.80, w: .72, b: .94, t: 1.34 },
        { z: -.25, w: .73, b: .94, t: 1.38 },
        { z: .35, w: .62, b: .94, t: 1.24 },
        { z: .80, w: .40, b: .92, t: 1.06 },
        { z: 1.00, w: .18, b: .90, t: .98 }
      ],
      roof: { sx: 1.08, sy: .045, sz: 1.25, y: 1.40, z: -.50 },
      light: { x: .54, y: .74, z: 2.22, sx: .32, sy: .09, sz: .07 }
    },
    solar: {
      body: [
        { z: -2.28, w: .70, b: .46, t: .98 },
        { z: -2.05, w: 1.08, b: .32, t: 1.06 },
        { z: -1.40, w: 1.10, b: .30, t: 1.02 },
        { z: -.30, w: 1.02, b: .28, t: .94 },
        { z: .80, w: 1.00, b: .29, t: .84 },
        { z: 1.75, w: .94, b: .32, t: .72 },
        { z: 2.30, w: .62, b: .38, t: .60 }
      ],
      cabin: [
        { z: -1.25, w: .20, b: .86, t: .98 },
        { z: -.90, w: .55, b: .88, t: 1.20 },
        { z: -.45, w: .72, b: .88, t: 1.36 },
        { z: .10, w: .72, b: .88, t: 1.38 },
        { z: .60, w: .58, b: .86, t: 1.22 },
        { z: .95, w: .32, b: .84, t: 1.00 },
        { z: 1.10, w: .15, b: .83, t: .93 }
      ],
      roof: { sx: 1.12, sy: .04, sz: 1.05, y: 1.34, z: -.30 },
      light: { x: .52, y: .66, z: 2.2, sx: .34, sy: .09, sz: .06 }
    },
    mint: {
      body: [
        { z: -2.00, w: .64, b: .50, t: .94 },
        { z: -1.90, w: .96, b: .34, t: 1.08 },
        { z: -1.20, w: 1.02, b: .32, t: 1.10 },
        { z: 0, w: 1.02, b: .32, t: 1.06 },
        { z: 1.20, w: 1.00, b: .32, t: .98 },
        { z: 1.75, w: .94, b: .36, t: .86 },
        { z: 1.98, w: .68, b: .44, t: .74 }
      ],
      cabin: [
        { z: -1.82, w: .18, b: .98, t: 1.05 },
        { z: -1.60, w: .60, b: .98, t: 1.45 },
        { z: -1.15, w: .78, b: .98, t: 1.62 },
        { z: -.45, w: .80, b: .98, t: 1.65 },
        { z: .20, w: .76, b: .98, t: 1.60 },
        { z: .65, w: .58, b: .98, t: 1.36 },
        { z: .90, w: .28, b: .98, t: 1.10 }
      ],
      roof: { sx: 1.28, sy: .055, sz: 1.45, y: 1.64, z: -.55 },
      light: { x: .54, y: .76, z: 2.02, sx: .34, sy: .1, sz: .07 }
    },
    gt3rs: {
      body: [
        { z: -2.30, w: .70, b: .46, t: .86 },
        { z: -2.10, w: 1.04, b: .34, t: .96 },
        { z: -1.70, w: 1.09, b: .31, t: .99 },
        { z: -1.25, w: 1.10, b: .30, t: .98 },
        { z: -.55, w: 1.01, b: .30, t: .95 },
        { z: .35, w: .96, b: .30, t: .92 },
        { z: 1.15, w: 1.02, b: .31, t: .92 },
        { z: 1.55, w: 1.03, b: .33, t: .90 },
        { z: 2.05, w: .88, b: .38, t: .87 },
        { z: 2.30, w: .60, b: .44, t: .81 }
      ],
      cabin: [
        { z: -1.62, w: .22, b: .94, t: 1.00 },
        { z: -1.38, w: .58, b: .94, t: 1.06 },
        { z: -1.00, w: .72, b: .94, t: 1.22 },
        { z: -.55, w: .78, b: .94, t: 1.34 },
        { z: -.05, w: .76, b: .94, t: 1.37 },
        { z: .38, w: .66, b: .94, t: 1.26 },
        { z: .72, w: .48, b: .94, t: 1.08 },
        { z: .92, w: .22, b: .95, t: .97 }
      ],
      roof: { sx: 1.14, sy: .045, sz: 1.22, y: 1.40, z: -.58 },
      light: { x: .62, y: .76, z: 2.22, sx: .15, sy: .11, sz: .06 }
    }
  };

  function makeRoofGeometry(def) {
    return makeCarHullGeometry(def.cabin.map((s) => ({
      z: s.z,
      w: s.w * .82,
      b: s.t - .03,
      t: s.t + .012
    })), 12);
  }

  const carShapeCache = new Map();
  function getCarShape(id) {
    let shape = carShapeCache.get(id);
    if (!shape) {
      const def = CAR_SHAPES[id] || CAR_SHAPES.crimson;
      shape = {
        body: makeCarHullGeometry(def.body, 20),
        cabin: makeCarHullGeometry(def.cabin, 18),
        roof: makeRoofGeometry(def),
        def
      };
      carShapeCache.set(id, shape);
    }
    return shape;
  }
  const defaultCarShape = getCarShape('crimson');
  const roundedGeo = makeRoundedBoxGeometry(1, 1, 1, .2);

  const asphaltMat = new THREE.MeshStandardMaterial({ map: asphaltTex, color: 0xffffff, roughness: .96, metalness: .02 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, color: 0xd2d4d5, roughness: .9 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3c6b42, roughness: 1 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xb9ad97, roughness: .92 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x777b7d, roughness: .86 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: .78, metalness: .18 });
  const skylineMat = new THREE.MeshStandardMaterial({ color: 0x354654, roughness: .9 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2f343a, roughness: .55, metalness: .55 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffda8a, emissiveIntensity: 1.4, roughness: .35 });
  const signalMat = new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: .65, metalness: .25 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b4030, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: .95 });
  const lobbyMat = new THREE.MeshStandardMaterial({ color: 0x17232c, metalness: .55, roughness: .24 });

  const buildingMats = facadeTextures.map((tex) => new THREE.MeshStandardMaterial({
    map: tex,
    color: 0xffffff,
    emissive: 0x0d141b,
    emissiveIntensity: .38,
    roughness: .6,
    metalness: .16
  }));

  const neonMats = [
    new THREE.MeshBasicMaterial({ color: 0xff3d7f }),
    new THREE.MeshBasicMaterial({ color: 0x52e5ff }),
    new THREE.MeshBasicMaterial({ color: 0xffc44d }),
    new THREE.MeshBasicMaterial({ color: 0x9b8cff })
  ];

  const lampOff = {
    red: new THREE.MeshBasicMaterial({ color: 0x2a0d12 }),
    yellow: new THREE.MeshBasicMaterial({ color: 0x2b2410 }),
    green: new THREE.MeshBasicMaterial({ color: 0x0c2418 })
  };
  const lampOn = {
    red: new THREE.MeshBasicMaterial({ color: 0xff2d3f }),
    yellow: new THREE.MeshBasicMaterial({ color: 0xffc53d }),
    green: new THREE.MeshBasicMaterial({ color: 0x35ff9c })
  };

  function block(x, y, z, sx, sy, sz, mat, cast = true, receive = true) {
    const mesh = new THREE.Mesh(boxGeo, mat);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    return mesh;
  }

  // --- Ground and road markings ---------------------------------------------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000), asphaltMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadXs = [];
  const roadZs = [];
  for (let i = -GRID_X; i < GRID_X; i++) roadXs.push(i * BLOCK_W + BLOCK_W / 2);
  for (let j = -GRID_Z; j < GRID_Z; j++) roadZs.push(j * BLOCK_L + BLOCK_L / 2);

  const dashData = [];
  for (const x of roadXs) {
    for (let z = -MAP_Z - 170; z <= MAP_Z + 170; z += 11) dashData.push({ x, z, rot: 0 });
  }
  for (const z of roadZs) {
    for (let x = -MAP_X - 170; x <= MAP_X + 170; x += 11) dashData.push({ x, z, rot: Math.PI / 2 });
  }
  const dashGeo = new THREE.BoxGeometry(.15, .019, 3.1);
  const laneMat = new THREE.MeshBasicMaterial({ color: 0xcfcfca });
  const dashMesh = new THREE.InstancedMesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0xd8d8d4 }), dashData.length);
  const dummy = new THREE.Object3D();
  dashData.forEach((d, i) => {
    dummy.position.set(d.x, .012, d.z);
    dummy.rotation.set(0, d.rot, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    dashMesh.setMatrixAt(i, dummy.matrix);
  });
  dashMesh.instanceMatrix.needsUpdate = true;
  scene.add(dashMesh);

  for (const x of roadXs) {
    block(x - 28, .012, 0, .14, .018, MAP_Z * 2 + 340, laneMat, false, false);
    block(x + 28, .012, 0, .14, .018, MAP_Z * 2 + 340, laneMat, false, false);
  }
  for (const z of roadZs) {
    block(0, .012, z - 28, MAP_X * 2 + 340, .018, .14, laneMat, false, false);
    block(0, .012, z + 28, MAP_X * 2 + 340, .018, .14, laneMat, false, false);
  }

  // --- City blocks -----------------------------------------------------------
  const blocks = [];
  const intersections = [];
  const towerInstances = [[], [], [], []];
  const roofInstances = [];
  const mastInstances = [];
  const neonInstances = [[], [], [], []];
  const sidewalkInstances = [];
  const curbInstances = [];

  function addTree(x, z, s = 1) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(cylinderGeo, trunkMat);
    trunk.scale.set(.24 * s, 2.5 * s, .24 * s);
    trunk.position.y = 1.25 * s;
    trunk.castShadow = true;
    group.add(trunk);
    const crown = new THREE.Mesh(sphereGeo, leafMat);
    crown.scale.set(1.55 * s, 1.7 * s, 1.55 * s);
    crown.position.y = 3.1 * s;
    crown.castShadow = true;
    group.add(crown);
    const crown2 = new THREE.Mesh(sphereGeo, leafMat);
    crown2.scale.set(.9 * s, 1.05 * s, .9 * s);
    crown2.position.set(.75 * s, 3.8 * s, -.35 * s);
    crown2.castShadow = true;
    group.add(crown2);
    group.position.set(x, SIDEWALK_H + .08, z);
    scene.add(group);
  }

  function addPark(x, z) {
    block(x, SIDEWALK_H + .04, z, ISLAND_W - 16, .08, ISLAND_L - 16, grassMat, false, true);
    block(x, SIDEWALK_H + .1, z, 11, .06, ISLAND_L - 34, pathMat, false, true);
    block(x, SIDEWALK_H + .1, z, ISLAND_W - 38, .06, 10, pathMat, false, true);
    for (let i = 0; i < 11; i++) {
      addTree(x + rand(-ISLAND_W / 2 + 16, ISLAND_W / 2 - 16), z + rand(-ISLAND_L / 2 + 16, ISLAND_L / 2 - 16), rand(.75, 1.3));
    }
    for (let i = 0; i < 4; i++) {
      const bx = x + rand(-ISLAND_W / 2 + 22, ISLAND_W / 2 - 22);
      const bz = z + rand(-ISLAND_L / 2 + 22, ISLAND_L / 2 - 22);
      block(bx, SIDEWALK_H + .55, bz, 3.4, .18, .85, roofMat, true, true);
      block(bx - 1.3, SIDEWALK_H + .3, bz, .18, .55, .7, poleMat, true, true);
      block(bx + 1.3, SIDEWALK_H + .3, bz, .18, .55, .7, poleMat, true, true);
    }
  }

  function addTower(x, z, w, d, h, matIndex) {
    towerInstances[matIndex].push({ x, y: SIDEWALK_H + h / 2, z, sx: w, sy: h, sz: d });
    roofInstances.push({ x, y: SIDEWALK_H + h + .7, z, sx: w + 1.2, sy: 1.4, sz: d + 1.2 });
    if (Math.random() < .85) {
      roofInstances.push({
        x: x + rand(-w / 3, w / 3),
        y: SIDEWALK_H + h + 1.8,
        z: z + rand(-d / 3, d / 3),
        sx: rand(2.5, 6),
        sy: rand(1.2, 2.4),
        sz: rand(2.5, 6)
      });
    }
    if (h > 90 && Math.random() < .55) {
      const mastH = rand(5, 12);
      mastInstances.push({
        x: x + rand(-w / 4, w / 4),
        y: SIDEWALK_H + h + mastH / 2,
        z: z + rand(-d / 4, d / 4),
        sx: .09,
        sy: mastH,
        sz: .09
      });
    }
    if (Math.random() < .26) {
      neonInstances[(Math.random() * neonMats.length) | 0].push({
        x: x + (Math.random() < .5 ? -w / 2 - .25 : w / 2 + .25),
        y: SIDEWALK_H + rand(7, Math.min(45, h * .7)),
        z: z + rand(-d / 4, d / 4),
        sx: .32,
        sy: rand(3.5, 10),
        sz: rand(1.1, 2.4)
      });
    }
  }

  for (let i = -GRID_X; i <= GRID_X; i++) {
    for (let j = -GRID_Z; j <= GRID_Z; j++) {
      const x = i * BLOCK_W;
      const z = j * BLOCK_L;
      const park = (i === 2 && j === -1) || (i === -3 && j === 2) || (i === 0 && j === 2);
      blocks.push({
        minX: x - ISLAND_W / 2,
        maxX: x + ISLAND_W / 2,
        minZ: z - ISLAND_L / 2,
        maxZ: z + ISLAND_L / 2,
        park
      });
      sidewalkInstances.push({ x, y: SIDEWALK_H / 2, z, sx: ISLAND_W, sy: SIDEWALK_H, sz: ISLAND_L });
      curbInstances.push({ x, y: SIDEWALK_H + .015, z, sx: ISLAND_W + .5, sy: .03, sz: ISLAND_L + .5 });

      if (park) {
        addPark(x, z);
        continue;
      }

      const cols = 2;
      const rows = 3;
      const cw = ISLAND_W / cols;
      const cd = ISLAND_L / rows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() < .11) continue;
          const w = rand(34, 64);
          const d = rand(36, 78);
          const h = rand(30, 148);
          const cx = x - ISLAND_W / 2 + cw * (c + .5) + rand(-(cw - w - 10) / 2, (cw - w - 10) / 2);
          const cz = z - ISLAND_L / 2 + cd * (r + .5) + rand(-(cd - d - 10) / 2, (cd - d - 10) / 2);
          addTower(cx, cz, w, d, h, (Math.random() * buildingMats.length) | 0);
        }
      }
    }
  }

  function addInstances(data, geo, mat, cast = false, receive = false) {
    if (!data.length) return;
    const mesh = new THREE.InstancedMesh(geo, mat, data.length);
    data.forEach((d, i) => {
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, d.rot || 0, 0);
      dummy.scale.set(d.sx, d.sy, d.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
  }

  for (let i = 0; i < towerInstances.length; i++) {
    addInstances(towerInstances[i], boxGeo, buildingMats[i], true, true);
  }
  addInstances(roofInstances, boxGeo, roofMat, true, true);
  addInstances(mastInstances, cylinderGeo, poleMat, true, false);
  for (let i = 0; i < neonInstances.length; i++) {
    addInstances(neonInstances[i], boxGeo, neonMats[i], false, false);
  }
  addInstances(sidewalkInstances, boxGeo, sidewalkMat, true, true);
  addInstances(curbInstances, boxGeo, curbMat, false, true);

  const shopStrips = [];
  for (const b of blocks) {
    if (b.park) continue;
    shopStrips.push({ x: (b.minX + b.maxX) / 2, y: SIDEWALK_H + 1.9, z: b.maxZ - .12, sx: b.maxX - b.minX - 2, sy: 3.8, sz: .24 });
    shopStrips.push({ x: (b.minX + b.maxX) / 2, y: SIDEWALK_H + 1.9, z: b.minZ + .12, sx: b.maxX - b.minX - 2, sy: 3.8, sz: .24 });
    shopStrips.push({ x: b.maxX - .12, y: SIDEWALK_H + 1.9, z: (b.minZ + b.maxZ) / 2, sx: .24, sy: 3.8, sz: b.maxZ - b.minZ - 2 });
    shopStrips.push({ x: b.minX + .12, y: SIDEWALK_H + 1.9, z: (b.minZ + b.maxZ) / 2, sx: .24, sy: 3.8, sz: b.maxZ - b.minZ - 2 });
  }
  const shopMesh = new THREE.InstancedMesh(boxGeo, shopMat, shopStrips.length);
  shopStrips.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(s.sx, s.sy, s.sz);
    dummy.updateMatrix();
    shopMesh.setMatrixAt(i, dummy.matrix);
  });
  shopMesh.instanceMatrix.needsUpdate = true;
  scene.add(shopMesh);

  for (let a = 0; a < Math.PI * 2; a += .145) {
    const r = rand(1000, 1500);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const w = rand(45, 120);
    const d = rand(45, 120);
    const h = rand(65, 285);
    const m = new THREE.Mesh(boxGeo, skylineMat);
    m.scale.set(w, h, d);
    m.position.set(x, h / 2, z);
    scene.add(m);
  }

  // --- Street lights and traffic signals ------------------------------------
  function addStreetlight(x, z, rot) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(cylinderGeo, poleMat);
    pole.scale.set(.13, 7.2, .13);
    pole.position.y = 3.6;
    pole.castShadow = true;
    group.add(pole);
    const arm = new THREE.Mesh(boxGeo, poleMat);
    arm.scale.set(4.4, .15, .15);
    arm.position.set(-2.2, 7.1, 0);
    arm.castShadow = true;
    group.add(arm);
    const lamp = new THREE.Mesh(boxGeo, lampMat);
    lamp.scale.set(1.35, .16, .5);
    lamp.position.set(-4.3, 7.0, 0);
    group.add(lamp);
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    scene.add(group);
  }

  function makeSignalHead() {
    const group = new THREE.Group();
    const housing = new THREE.Mesh(boxGeo, signalMat);
    housing.scale.set(2.35, .72, .48);
    group.add(housing);
    const lamps = [];
    for (let i = 0; i < 3; i++) {
      const lamp = new THREE.Mesh(sphereGeo, lampOff.red);
      lamp.scale.setScalar(.21);
      lamp.position.set((i - 1) * .72, 0, .28);
      group.add(lamp);
      lamps.push(lamp);
    }
    return { group, lamps };
  }

  function setSignal(lamps, state) {
    const keys = ['red', 'yellow', 'green'];
    lamps.forEach((lamp, i) => {
      const key = keys[i];
      lamp.material = state === key ? lampOn[key] : lampOff[key];
    });
  }

  function addIntersection(x, z) {
    const inter = { x, z, phase: 0, timer: 0, zState: 'green', xState: 'red', zHead: null, xHead: null };
    const group = new THREE.Group();
    const pole = new THREE.Mesh(cylinderGeo, poleMat);
    pole.scale.set(.11, 6.2, .11);
    pole.position.set(x + 31, 3.1, z - 31);
    pole.castShadow = true;
    group.add(pole);

    const zHead = makeSignalHead();
    zHead.group.position.set(x + 29.6, 5.8, z - 31);
    zHead.group.rotation.y = Math.PI;
    group.add(zHead.group);

    const xHead = makeSignalHead();
    xHead.group.position.set(x + 31, 4.6, z - 29.6);
    xHead.group.rotation.y = -Math.PI / 2;
    group.add(xHead.group);

    scene.add(group);
    inter.zHead = zHead.lamps;
    inter.xHead = xHead.lamps;
    setSignal(inter.zHead, 'green');
    setSignal(inter.xHead, 'red');
    intersections.push(inter);
  }

  for (const x of roadXs) {
    for (const z of roadZs) addIntersection(x, z);
  }

  for (let z = -MAP_Z + 100; z < MAP_Z; z += 190) {
    addStreetlight(110 - 33, z, Math.PI);
    addStreetlight(110 + 33, z + 95, 0);
  }
  for (const z of [-80, 60, 200]) {
    addTree(110 - 34, z, 1.1);
    addTree(110 + 34, z + 75, 1.0);
  }

  const LIGHT_PHASES = [
    { dur: 11, z: 'green', x: 'red' },
    { dur: 2, z: 'yellow', x: 'red' },
    { dur: 11, z: 'red', x: 'green' },
    { dur: 2, z: 'red', x: 'yellow' }
  ];

  function updateTrafficLights(dt) {
    for (const inter of intersections) {
      inter.timer += dt;
      const phase = LIGHT_PHASES[inter.phase];
      if (inter.timer >= phase.dur) {
        inter.timer = 0;
        inter.phase = (inter.phase + 1) % LIGHT_PHASES.length;
        const next = LIGHT_PHASES[inter.phase];
        inter.zState = next.z;
        inter.xState = next.x;
        setSignal(inter.zHead, next.z);
        setSignal(inter.xHead, next.x);
      }
    }
  }

  // --- Cars -----------------------------------------------------------------
  const paintCache = new Map();
  function paint(color) {
    if (!paintCache.has(color)) {
      paintCache.set(color, new THREE.MeshStandardMaterial({
        color,
        metalness: .62,
        roughness: .3
      }));
    }
    return paintCache.get(color);
  }

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x090a0c, roughness: .92 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: .95, roughness: .22 });
  const gt3RimMat = new THREE.MeshStandardMaterial({ color: 0x15181c, metalness: .9, roughness: .3 });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x15181c, metalness: .55, roughness: .36 });
  const gt3SpokeMat = new THREE.MeshStandardMaterial({ color: 0x4a5158, metalness: .85, roughness: .3 });
  const gt3HeadMat = new THREE.MeshStandardMaterial({ color: 0x0b0d0f, emissive: 0xffe6b8, emissiveIntensity: .08, metalness: .3, roughness: .15 });
  const caliperMat = new THREE.MeshStandardMaterial({ color: 0xf0b600, metalness: .35, roughness: .4, emissive: 0x4a3200, emissiveIntensity: .35 });
  const gt3DecalMat = new THREE.MeshBasicMaterial({
    map: makeTexture(512, 128, (g, w, h) => {
      g.fillStyle = '#0c1014';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#f4f5f1';
      g.font = '700 70px Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('GT3 RS', w / 2, h / 2 + 3);
      g.fillStyle = '#9ba3a8';
      g.fillRect(30, h - 18, w - 60, 4);
    }),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2
  });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0b1621, metalness: .8, roughness: .14 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1c4, emissiveIntensity: 2.1, roughness: .2 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x7a0b16, emissive: 0xff1a2e, emissiveIntensity: .9, roughness: .3 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xe7e8e4, roughness: .6 });

  function makeCar(color, hero = false) {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);

    const bodyMat = hero
      ? new THREE.MeshPhysicalMaterial({ color, metalness: .5, roughness: .24, clearcoat: 1, clearcoatRoughness: .16 })
      : paint(color);

    const lower = new THREE.Mesh(defaultCarShape.body, bodyMat);
    lower.castShadow = true;
    lower.receiveShadow = true;
    body.add(lower);

    const cabin = new THREE.Mesh(defaultCarShape.cabin, glassMat);
    cabin.castShadow = true;
    body.add(cabin);

    const roof = new THREE.Mesh(defaultCarShape.roof, bodyMat);
    roof.castShadow = true;
    body.add(roof);

    let grille = null;
    let plate = null;
    let splitter = null;
    let diffuser = null;
    const exhausts = [];
    if (hero) {
      grille = new THREE.Mesh(roundedGeo, signalMat);
      grille.scale.set(.72, .13, .06);
      grille.position.set(0, .56, 2.235);
      body.add(grille);
    }

    const headLights = [];
    if (hero) {
      for (const x of [-.52, .52]) {
        const light = new THREE.Mesh(roundedGeo, headMat);
        light.scale.set(.36, .11, .08);
        light.position.set(x, .8, 2.2);
        body.add(light);
        headLights.push(light);
      }
    } else {
      const bar = new THREE.Mesh(roundedGeo, headMat);
      bar.scale.set(1.12, .11, .07);
      bar.position.set(0, .8, 2.2);
      body.add(bar);
      headLights.push(bar);
    }

    const roundHeadlights = [];
    if (hero) {
      for (const x of [-.6, .6]) {
        const light = new THREE.Mesh(sphereGeo, gt3HeadMat);
        light.scale.set(.18, .14, .09);
        light.position.set(x, .78, 2.21);
        light.visible = false;
        body.add(light);
        roundHeadlights.push(light);
      }
    }

    const brakeMat = hero
      ? new THREE.MeshStandardMaterial({ color: 0x7a0b16, emissive: 0xff1a2e, emissiveIntensity: .35, roughness: .3 })
      : tailMat;
    const rearLights = [];
    if (hero) {
      for (const x of [-.52, .52]) {
        const light = new THREE.Mesh(roundedGeo, brakeMat);
        light.scale.set(.34, .11, .07);
        light.position.set(x, .8, -2.18);
        body.add(light);
        rearLights.push(light);
      }
    } else {
      const bar = new THREE.Mesh(roundedGeo, brakeMat);
      bar.scale.set(1.12, .11, .07);
      bar.position.set(0, .8, -2.18);
      body.add(bar);
      rearLights.push(bar);
    }

    let spoiler = null;
    let gt3Details = null;
    let thirdBrake = null;
    const wingEndplates = [];
    const mirrors = [];
    if (hero) {
      plate = new THREE.Mesh(roundedGeo, plateMat);
      plate.scale.set(.54, .15, .035);
      plate.position.set(0, .57, -2.275);
      body.add(plate);

      splitter = new THREE.Mesh(roundedGeo, signalMat);
      splitter.scale.set(1.94, .06, .46);
      splitter.position.set(0, .3, 2.06);
      body.add(splitter);

      diffuser = new THREE.Mesh(roundedGeo, signalMat);
      diffuser.scale.set(1.72, .1, .38);
      diffuser.position.set(0, .3, -2.03);
      body.add(diffuser);

      spoiler = new THREE.Mesh(roundedGeo, bodyMat);
      spoiler.scale.set(1.72, .06, .48);
      spoiler.position.set(0, 1.22, -2.03);
      spoiler.castShadow = true;
      body.add(spoiler);
      for (const x of [-1.0, 1.0]) {
        const endplate = new THREE.Mesh(roundedGeo, bodyMat);
        endplate.scale.set(.055, .2, .48);
        endplate.position.set(x, 1.28, -2.03);
        endplate.visible = false;
        body.add(endplate);
        wingEndplates.push(endplate);
      }

      gt3Details = new THREE.Group();
      gt3Details.visible = false;

      const rearVent = new THREE.Mesh(roundedGeo, signalMat);
      rearVent.scale.set(.92, .04, .52);
      rearVent.position.set(0, .982, -1.52);
      gt3Details.add(rearVent);

      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const sideVent = new THREE.Mesh(roundedGeo, signalMat);
          sideVent.scale.set(.06, .16, .075);
          sideVent.position.set(side * 1.1, .66, -1.02 - i * .12);
          gt3Details.add(sideVent);
        }
        for (let i = 0; i < 3; i++) {
          const louvre = new THREE.Mesh(roundedGeo, signalMat);
          louvre.scale.set(.045, .16, .08);
          louvre.position.set(side * .995, .66, 1.02 + i * .11);
          gt3Details.add(louvre);
        }

        const skirt = new THREE.Mesh(roundedGeo, signalMat);
        skirt.scale.set(.1, .13, 1.66);
        skirt.position.set(side * 1.005, .33, .02);
        gt3Details.add(skirt);

        const canard = new THREE.Mesh(roundedGeo, carbonMat);
        canard.scale.set(.2, .025, .3);
        canard.position.set(side * .93, .46, 2.01);
        canard.rotation.z = side * -.12;
        gt3Details.add(canard);

        const surround = new THREE.Mesh(roundedGeo, signalMat);
        surround.scale.set(.28, .21, .06);
        surround.position.set(side * .62, .76, 2.17);
        gt3Details.add(surround);

        const drl = new THREE.Mesh(new THREE.TorusGeometry(.09, .012, 4, 14), headMat);
        drl.position.set(side * .62, .76, 2.258);
        gt3Details.add(drl);

        const intake = new THREE.Mesh(roundedGeo, signalMat);
        intake.scale.set(.34, .2, .1);
        intake.position.set(side * .45, .52, 2.27);
        gt3Details.add(intake);

        const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.02, .26), gt3DecalMat);
        decal.position.set(side * 1.006, .7, .32);
        decal.rotation.y = side * Math.PI / 2;
        gt3Details.add(decal);
      }

      const hood = new THREE.Mesh(roundedGeo, carbonMat);
      hood.scale.set(.74, .03, .58);
      hood.position.set(0, .9, 1.63);
      hood.rotation.x = .1;
      gt3Details.add(hood);

      const archGeo = new THREE.TorusGeometry(.46, .05, 6, 18, Math.PI);
      const wellGeo = new THREE.CircleGeometry(.47, 20, 0, Math.PI);
      for (const side of [-1, 1]) {
        for (const wz of [1.37, -1.37]) {
          const arch = new THREE.Mesh(archGeo, signalMat);
          arch.position.set(side * (wz > 0 ? 1.035 : 1.105), .37, wz);
          arch.rotation.y = side * Math.PI / 2;
          gt3Details.add(arch);
          const well = new THREE.Mesh(wellGeo, signalMat);
          well.position.set(side * (wz > 0 ? 1.03 : 1.1), .37, wz);
          well.rotation.y = side * Math.PI / 2;
          gt3Details.add(well);
        }
      }

      for (const x of [-.5, 0, .5]) {
        const fin = new THREE.Mesh(roundedGeo, signalMat);
        fin.scale.set(.035, .16, .46);
        fin.position.set(x, .21, -2.08);
        gt3Details.add(fin);
      }

      const lightBar = new THREE.Mesh(roundedGeo, brakeMat);
      lightBar.scale.set(.96, .035, .04);
      lightBar.position.set(0, .8, -2.235);
      gt3Details.add(lightBar);

      for (const side of [-1, 1]) {
        const armCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * .55, .93, -1.42),
          new THREE.Vector3(side * .55, 1.2, -1.56),
          new THREE.Vector3(side * .55, 1.44, -1.98),
          new THREE.Vector3(side * .55, 1.48, -2.13)
        ]);
        const arm = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 12, .03, 6, false), carbonMat);
        arm.castShadow = true;
        gt3Details.add(arm);
      }

      body.add(gt3Details);

      thirdBrake = new THREE.Mesh(roundedGeo, brakeMat);
      thirdBrake.scale.set(.58, .04, .05);
      thirdBrake.position.set(0, 1.252, -2.05);
      body.add(thirdBrake);

      for (const x of [-.55, .55]) {
        const pipe = new THREE.Mesh(cylinderGeo, rimMat);
        pipe.scale.set(.055, .3, .055);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, .36, -2.36);
        body.add(pipe);
        exhausts.push(pipe);
      }
      for (const x of [-.65, .65]) {
        const strut = new THREE.Mesh(roundedGeo, signalMat);
        strut.scale.set(.06, .3, .08);
        strut.position.set(x, 1.05, -2.02);
        body.add(strut);
      }

      for (const x of [-1.02, 1.02]) {
        const mirror = new THREE.Mesh(roundedGeo, bodyMat);
        mirror.scale.set(.24, .09, .16);
        mirror.position.set(x, .99, .55);
        body.add(mirror);
        mirrors.push(mirror);
        const mirrorArm = new THREE.Mesh(roundedGeo, bodyMat);
        mirrorArm.scale.set(.16, .04, .05);
        mirrorArm.position.set(x - Math.sign(x) * .05, .95, .55);
        body.add(mirrorArm);
        mirrors.push(mirrorArm);
      }
    }

    const wheels = [];
    const frontPivots = [];
    const wheelPivots = [];
    const rims = [];
    const calipers = [];
    const spokes = [];
    const rimLips = [];
    for (const [x, z] of [[-.99, 1.37], [.99, 1.37], [-.99, -1.37], [.99, -1.37]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, .37, z);
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      pivot.add(tire);
      if (hero) {
        const rim = new THREE.Mesh(rimGeo, rimMat);
        pivot.add(rim);
        rims.push(rim);
        const caliper = new THREE.Mesh(roundedGeo, caliperMat);
        caliper.scale.set(.04, .085, .12);
        caliper.position.set(Math.sign(x) * .164, .18, 0);
        caliper.visible = false;
        pivot.add(caliper);
        calipers.push(caliper);
        for (let s = 0; s < 5; s++) {
          const spoke = new THREE.Mesh(boxGeo, gt3SpokeMat);
          spoke.scale.set(.016, .3, .038);
          spoke.position.set(Math.sign(x) * .157, 0, 0);
          spoke.rotation.x = s * Math.PI / 5;
          spoke.visible = false;
          pivot.add(spoke);
          spokes.push(spoke);
        }
        const lip = new THREE.Mesh(new THREE.TorusGeometry(.335, .012, 4, 20), rimMat);
        lip.position.set(Math.sign(x) * .151, 0, 0);
        lip.rotation.y = Math.PI / 2;
        lip.visible = false;
        pivot.add(lip);
        rimLips.push(lip);
      }
      root.add(pivot);
      wheels.push(tire);
      wheelPivots.push(pivot);
      if (z > 0) frontPivots.push(pivot);
    }

    root.userData = { body, lower, cabin, roof, wheels, frontPivots, wheelPivots, rims, calipers, spokes, rimLips, mirrors, brakeMat, rearLights, headLights, roundHeadlights, gt3Details, grille, plate, splitter, diffuser, exhausts, bodyMat, spoiler, wingEndplates, thirdBrake };
    return root;
  }

  const hero = makeCar(0xd21f3c, true);
  hero.position.copy(SPAWN);
  scene.add(hero);

  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 7.6),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .58 })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = .02;
  hero.add(contactShadow);

  // --- Garage / car builds --------------------------------------------------
  const CARS = [
    { id: 'crimson', name: 'Crimson GT', tag: 'Faster balanced street build', color: 0xd21f3c, accel: 20.2, top: 76, grip: 11.8, driftGrip: 1.35, handbrakeDrag: 2.6, driftDrag: .16, steer: .68, yaw: 13.5, driftYaw: 18.5, speed: 4.2, gripBar: 3.8, driftBar: 3.4 },
    { id: 'midnight', name: 'Midnight Drift', tag: 'Loose rear, carries speed', color: 0x2f6bff, accel: 19, top: 71, grip: 10.2, driftGrip: .82, handbrakeDrag: 2, driftDrag: .08, steer: .74, yaw: 15, driftYaw: 21, speed: 3.7, gripBar: 3.1, driftBar: 5 },
    { id: 'solar', name: 'Solar Apex', tag: 'Top speed monster', color: 0xffb21a, accel: 22.4, top: 88, grip: 12.1, driftGrip: 1.45, handbrakeDrag: 2.8, driftDrag: .18, steer: .65, yaw: 13.2, driftYaw: 17, speed: 5, gripBar: 4, driftBar: 2.8 },
    { id: 'mint', name: 'Mint Machine', tag: 'Grip for days', color: 0x2fe0a4, accel: 18.2, top: 68, grip: 13.4, driftGrip: 1.55, handbrakeDrag: 3, driftDrag: .22, steer: .76, yaw: 13.6, driftYaw: 16.5, speed: 3.2, gripBar: 5, driftBar: 3.2 },
    { id: 'gt3rs', name: 'Porsche 911 GT3 RS', tag: 'Track-bred flat-six', color: 0xd6d7d2, accel: 23.5, top: 90, grip: 14.2, driftGrip: 1.15, handbrakeDrag: 2.2, driftDrag: .1, steer: .75, yaw: 15.5, driftYaw: 20, speed: 5.5, gripBar: 5, driftBar: 4.1 }
  ];
  const CAR_KEY = 'forza.car.v1';
  let selectedCarIndex = 0;
  try {
    const savedCar = Number(localStorage.getItem(CAR_KEY));
    if (Number.isInteger(savedCar) && CARS[savedCar]) selectedCarIndex = savedCar;
  } catch (e) {}
  let activeCar = CARS[selectedCarIndex];

  function applyCarLook(car) {
    const shape = getCarShape(car.id);
    const def = shape.def;
    const first = def.body[0];
    const last = def.body[def.body.length - 1];
    const gt3 = car.id === 'gt3rs';
    hero.userData.lower.geometry = shape.body;
    hero.userData.cabin.geometry = shape.cabin;
    hero.userData.roof.geometry = shape.roof;
    hero.userData.grille.position.set(0, gt3 ? .5 : last.b + (last.t - last.b) * .35, last.z - .01);
    hero.userData.grille.scale.set(gt3 ? 1.02 : last.w * 1.12, gt3 ? .18 : .13, .06);
    hero.userData.plate.position.z = first.z - .01;
    hero.userData.splitter.position.set(0, gt3 ? .4 : .3, last.z + .02);
    hero.userData.splitter.scale.set(gt3 ? 1.5 : 1.94, .06, gt3 ? .3 : .46);
    hero.userData.diffuser.position.set(0, gt3 ? .38 : .3, first.z + .08);
    hero.userData.diffuser.scale.set(gt3 ? 1.45 : 1.72, .1, gt3 ? .32 : .38);
    hero.userData.exhausts.forEach((pipe, index) => {
      pipe.position.x = gt3 ? (index === 0 ? -.2 : .2) : (index === 0 ? -.55 : .55);
      pipe.position.z = first.z - .08;
    });
    const rearX = Math.min(.52, first.w * .74);
    hero.userData.rearLights.forEach((mesh, index) => {
      mesh.position.set((index === 0 ? -1 : 1) * rearX, .8, first.z + .07);
    });
    const light = def.light;
    hero.userData.headLights.forEach((mesh, index) => {
      mesh.position.set((index === 0 ? -1 : 1) * light.x, light.y, light.z);
      mesh.scale.set(light.sx, light.sy, light.sz);
      mesh.visible = !gt3;
    });
    hero.userData.roundHeadlights.forEach((mesh, index) => {
      mesh.position.set((index === 0 ? -1 : 1) * light.x, light.y, light.z);
      mesh.visible = gt3;
    });
    if (hero.userData.gt3Details) hero.userData.gt3Details.visible = gt3;
    hero.userData.bodyMat.color.setHex(car.color);
    hero.userData.roof.material = gt3 ? carbonMat : hero.userData.bodyMat;
    hero.userData.rims.forEach((rim) => { rim.material = gt3 ? gt3RimMat : rimMat; });
    hero.userData.calipers.forEach((caliper) => { caliper.visible = gt3; });
    hero.userData.spokes.forEach((spoke) => { spoke.visible = gt3; });
    hero.userData.rimLips.forEach((lip) => { lip.visible = gt3; });
    hero.userData.mirrors.forEach((mirror) => { mirror.material = gt3 ? carbonMat : hero.userData.bodyMat; });
    hero.userData.wheelPivots.forEach((pivot) => {
      pivot.position.x = Math.sign(pivot.position.x) * (gt3 ? 1.01 : .99);
    });
    if (hero.userData.thirdBrake) hero.userData.thirdBrake.visible = !gt3;

    if (hero.userData.spoiler) {
      const wingY = gt3 ? 1.48 : 1.22;
      const wingZ = gt3 ? -2.14 : -2.03;
      hero.userData.spoiler.scale.set(gt3 ? 2.1 : 1.72, gt3 ? .07 : .06, gt3 ? .64 : .48);
      hero.userData.spoiler.position.set(0, wingY, wingZ);
      hero.userData.spoiler.material = gt3 ? carbonMat : hero.userData.bodyMat;
      for (const endplate of hero.userData.wingEndplates) {
        const sx = Math.sign(endplate.position.x) || 1;
        endplate.position.set(sx * (gt3 ? 1.03 : 1.0), wingY + .02, wingZ);
        endplate.scale.set(gt3 ? .06 : .055, gt3 ? .32 : .2, gt3 ? .6 : .48);
        endplate.material = gt3 ? carbonMat : hero.userData.bodyMat;
        endplate.visible = gt3;
      }
    }
  }
  applyCarLook(activeCar);

  // --- Traffic --------------------------------------------------------------
  const traffic = [];
  const trafficColors = [0x1d2329, 0xd8d9d5, 0x8b1e28, 0x1d3d64, 0x6a6d72, 0xc9b48c, 0x2e4d3d, 0xe0e1dc];

  function addTrafficCar(axis, road, dir, laneOffset, position) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const clash = traffic.some((other) =>
        other.axis === axis &&
        other.dir === dir &&
        Math.abs(other.road - road) < 1 &&
        Math.abs(other.laneOffset - laneOffset) < 1 &&
        Math.abs(other.pos - position) < 20
      );
      if (!clash) break;
      position += dir * 24;
    }
    const root = makeCar(pick(trafficColors));
    root.rotation.y = axis === 'z'
      ? (dir > 0 ? 0 : Math.PI)
      : (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    const car = {
      root,
      axis,
      road,
      dir,
      laneOffset,
      pos: position,
      speed: rand(6, 11),
      target: rand(7, 12),
      hitTimer: 0,
      nearMissCd: 0,
      wheels: root.userData.wheels
    };
    if (axis === 'z') root.position.set(road + laneOffset, 0, position);
    else root.position.set(position, 0, road + laneOffset);
    scene.add(root);
    traffic.push(car);
  }

  for (const x of roadXs) {
    for (const dir of [-1, 1]) {
      const lane = dir > 0 ? 10 : -10;
      for (let n = 0; n < 1; n++) {
        addTrafficCar('z', x, dir, lane, rand(-MAP_Z + 60, MAP_Z - 60));
      }
    }
  }
  for (const z of roadZs) {
    for (const dir of [-1, 1]) {
      const lane = dir > 0 ? 10 : -10;
      for (let n = 0; n < 1; n++) {
        addTrafficCar('x', z, dir, lane, rand(-MAP_X + 60, MAP_X - 60));
      }
    }
  }

  addTrafficCar('z', 110, -1, -10, 20);
  addTrafficCar('z', 110, 1, 10, -40);
  addTrafficCar('z', 110, -1, -10, 140);
  addTrafficCar('z', 110, 1, 10, 220);

  const parkedCars = [];
  const parkedColors = [0xd8d9d5, 0x1d2329, 0x8b1e28, 0x3f5e7a];
  for (let i = 0; i < 14; i++) {
    const x = pick(roadXs) + (Math.random() < .5 ? -24 : 24);
    const z = rand(-MAP_Z + 80, MAP_Z - 80);
    const car = makeCar(pick(parkedColors));
    car.position.set(x, 0, z);
    car.rotation.y = Math.random() < .5 ? 0 : Math.PI;
    scene.add(car);
    parkedCars.push(car);
  }
  for (const [x, z] of [[84, -80], [136, 70], [84, 160], [136, -200]]) {
    const car = makeCar(pick(parkedColors));
    car.position.set(x, 0, z);
    car.rotation.y = 0;
    scene.add(car);
    parkedCars.push(car);
  }

  // --- Sky decks, ramps and stunt surfaces ----------------------------------
  const stuntSurfaces = [];
  const stuntDecks = [];
  const stuntMat = new THREE.MeshStandardMaterial({ color: 0x39434c, roughness: .86, metalness: .18 });
  const stuntTopMat = new THREE.MeshStandardMaterial({ color: 0x20272e, roughness: .95, metalness: .05 });
  const stuntConcreteMat = new THREE.MeshStandardMaterial({ color: 0x9aa1a7, roughness: .92, metalness: .02 });
  const stuntRailMat = new THREE.MeshStandardMaterial({ color: 0xb9c3cb, roughness: .34, metalness: .72 });
  const stuntPaintMat = new THREE.MeshBasicMaterial({ color: 0xd9e4ea });
  const stuntGlowMat = neonMats[1];
  const stuntWarmGlowMat = neonMats[2];
  const pierGeo = new THREE.CylinderGeometry(1.5, 2.2, 1, 14);
  const upAxis = new THREE.Vector3(0, 1, 0);

  function roundedRectShape(w, d, r) {
    const x0 = -w / 2;
    const z0 = -d / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x0 + r, z0);
    shape.lineTo(x0 + w - r, z0);
    shape.quadraticCurveTo(x0 + w, z0, x0 + w, z0 + r);
    shape.lineTo(x0 + w, z0 + d - r);
    shape.quadraticCurveTo(x0 + w, z0 + d, x0 + w - r, z0 + d);
    shape.lineTo(x0 + r, z0 + d);
    shape.quadraticCurveTo(x0, z0 + d, x0, z0 + d - r);
    shape.lineTo(x0, z0 + r);
    shape.quadraticCurveTo(x0, z0, x0 + r, z0);
    return shape;
  }

  function deckSlabGeometry(w, d, thickness, radius) {
    const bevel = .22;
    const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, d, radius), {
      depth: thickness,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 1,
      curveSegments: 3,
      steps: 1
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, -bevel, 0);
    geo.computeVertexNormals();
    return geo;
  }

  function rampWedgeGeometry(length, startRise, endRise, width) {
    const bevel = .14;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(length, 0);
    shape.lineTo(length, endRise);
    shape.lineTo(0, startRise);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: width,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 1,
      steps: 1
    });
    geo.translate(0, 0, -width / 2);
    geo.rotateY(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }

  function strutBetween(ax, ay, az, bx, by, bz, radius) {
    const a = new THREE.Vector3(ax, ay, az);
    const b = new THREE.Vector3(bx, by, bz);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < .001) return;
    const mesh = new THREE.Mesh(cylinderGeo, stuntRailMat);
    mesh.scale.set(radius, len, radius);
    mesh.position.copy(a).addScaledVector(dir, .5);
    mesh.quaternion.setFromUnitVectors(upAxis, dir.normalize());
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function makeDeckSign(label) {
    const tex = makeTexture(640, 128, (g, w, h) => {
      g.fillStyle = '#0c141b';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#52e5ff';
      g.lineWidth = 5;
      g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#eaf8ff';
      g.font = '700 58px Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, w / 2, h / 2 + 2);
      g.fillStyle = '#ffc44d';
      g.fillRect(18, h - 18, w - 36, 5);
    });
    return new THREE.MeshBasicMaterial({ map: tex });
  }

  function addRamp(x, z, w, length, baseY, y0, y1, accentMat) {
    const rise = y1 - y0;
    const angle = Math.atan2(rise, length);
    const run = Math.hypot(length, rise);
    const ramp = new THREE.Mesh(rampWedgeGeometry(length, y0 - baseY, y1 - baseY, w), stuntMat);
    ramp.position.set(x, baseY - .14, z);
    ramp.receiveShadow = true;
    scene.add(ramp);

    for (const side of [-1, 1]) {
      const bx = x + side * (w / 2 - .28);
      const wall = new THREE.Mesh(boxGeo, stuntConcreteMat);
      wall.scale.set(.5, .8, run);
      wall.position.set(bx, (y0 + y1) / 2 + .34, z + length / 2);
      wall.rotation.x = -angle;
      wall.receiveShadow = true;
      scene.add(wall);

      const handrail = new THREE.Mesh(boxGeo, stuntRailMat);
      handrail.scale.set(.62, .12, run);
      handrail.position.set(bx, (y0 + y1) / 2 + .78, z + length / 2);
      handrail.rotation.x = -angle;
      scene.add(handrail);

      const strip = new THREE.Mesh(boxGeo, accentMat);
      strip.scale.set(.1, .05, run - .5);
      strip.position.set(bx - side * .27, (y0 + y1) / 2 + .86, z + length / 2);
      strip.rotation.x = -angle;
      scene.add(strip);

      const paint = new THREE.Mesh(boxGeo, stuntPaintMat);
      paint.scale.set(.32, .05, run - 1.4);
      paint.position.set(x + side * (w / 2 - 1.05), (y0 + y1) / 2 + .08, z + length / 2);
      paint.rotation.x = -angle;
      scene.add(paint);
    }

    const bars = Math.max(2, Math.floor(length / 26));
    for (let i = 1; i <= bars; i++) {
      const t = i / (bars + 1);
      const bar = new THREE.Mesh(boxGeo, i % 2 ? stuntPaintMat : accentMat);
      bar.scale.set(w - 4, .04, .7);
      bar.position.set(x, y0 + rise * t + .09, z + length * t);
      bar.rotation.x = -angle;
      scene.add(bar);
    }

    stuntSurfaces.push({
      kind: 'ramp', minX: x - w / 2, maxX: x + w / 2,
      minZ: z, maxZ: z + length, y0, y1, axis: 'z'
    });
  }

  function addDeckDetails(x, z, w, d, y, index) {
    // Rounded, chamfered deck edge instead of a hard box.
    const slab = new THREE.Mesh(deckSlabGeometry(w, d, .9, 5), stuntMat);
    slab.position.set(x, y, z);
    slab.receiveShadow = true;
    scene.add(slab);
    const top = new THREE.Mesh(deckSlabGeometry(w - 1.6, d - 1.6, .12, 4.2), stuntTopMat);
    top.position.set(x, y + .05, z);
    top.receiveShadow = true;
    scene.add(top);

    // Tapered piers, crossheads and diagonal bracing.
    const pierH = y - 1.45;
    for (const side of [-1, 1]) {
      for (const zs of [-1, 1]) {
        const px = x + side * (w / 2 - 4);
        const pz = z + zs * d * .3;
        const pier = new THREE.Mesh(pierGeo, stuntConcreteMat);
        pier.scale.y = pierH;
        pier.position.set(px, pierH / 2, pz);
        pier.castShadow = true;
        pier.receiveShadow = true;
        scene.add(pier);
        block(px, y - 1.15, pz, 4.2, .8, 4.2, stuntConcreteMat, true, true);
      }
      const beamZ = z + side * d * .3;
      block(x, y - 1.02, beamZ, w * .82, .9, 3.2, stuntConcreteMat, true, true);
      strutBetween(x - (w / 2 - 4), 1.4, beamZ, x + (w / 2 - 4), y - 2.2, beamZ, .16);
      strutBetween(x + (w / 2 - 4), 1.4, beamZ, x - (w / 2 - 4), y - 2.2, beamZ, .16);
    }

    // Solid edge barrier with a lit handrail.
    const railLen = d - 10;
    for (const side of [-1, 1]) {
      const bx = x + side * (w / 2 - .42);
      block(bx, y + .52, z, .55, 1.04, railLen, stuntConcreteMat, false, true);
      block(bx, y + 1.1, z, .68, .12, railLen, stuntRailMat, false, false);
      block(bx - side * .3, y + .3, z, .1, .12, railLen - .6, side < 0 ? stuntGlowMat : stuntWarmGlowMat, false, false);
    }
    block(x, y + .06, z - d / 2 + .6, w - 3, .06, .35, stuntWarmGlowMat, false, false);
    block(x, y + .06, z + d / 2 - .6, w - 3, .06, .35, stuntGlowMat, false, false);

    // Entry gantry with a deck sign.
    const gateZ = z - d / 2 + 5;
    const gateMat = makeDeckSign(`SKY DECK ${String(index).padStart(2, '0')}`);
    for (const side of [-1, 1]) {
      const gx = x + side * (w / 2 - 2.2);
      block(gx, y + 2.3, gateZ, .55, 4.6, .55, stuntMat, true, true);
      block(gx, y + 4.62, gateZ, 1.2, .18, 1.2, stuntWarmGlowMat, false, false);
    }
    block(x, y + 4.45, gateZ, w - 4, .32, .5, stuntMat, false, false);
    const panel = new THREE.Mesh(boxGeo, gateMat);
    panel.scale.set(14, 2.8, .36);
    panel.position.set(x, y + 3.72, gateZ);
    panel.castShadow = true;
    scene.add(panel);

    // Warm lamp masts and planted corners.
    for (const side of [-1, 1]) {
      const lx = x + side * (w / 2 - 4.5);
      const lz = z + d * .28;
      const pole = new THREE.Mesh(cylinderGeo, poleMat);
      pole.scale.set(.16, 4.2, .16);
      pole.position.set(lx, y + 2.1, lz);
      scene.add(pole);
      block(lx - side * .75, y + 4.15, lz, 1.6, .16, .2, poleMat, false, false);
      block(lx - side * 1.5, y + 3.98, lz, .95, .22, .55, stuntWarmGlowMat, false, false);

      const px = x + side * (w / 2 - 7.5);
      const pz = z + d / 2 - 9;
      const pot = new THREE.Mesh(cylinderGeo, stuntConcreteMat);
      pot.scale.set(.95, .8, .95);
      pot.position.set(px, y + .4, pz);
      scene.add(pot);
      const bush = new THREE.Mesh(sphereGeo, leafMat);
      bush.scale.set(1.35, 1.0, 1.35);
      bush.position.set(px, y + 1.15, pz);
      bush.castShadow = true;
      scene.add(bush);
    }
  }

  function addStuntDeck(x, z, w, d, y, rampStart, rampLength, index) {
    addDeckDetails(x, z, w, d, y, index);
    addRamp(x, rampStart, w * .66, rampLength, 0, 0, y, stuntGlowMat);

    // Two-stage kicker: a gentle transition and then a steeper launch lip.
    const kickerZ = z + d / 2 - 30;
    addRamp(x, kickerZ, w * .66, 16, y, y, y + 1, stuntWarmGlowMat);
    addRamp(x, kickerZ + 16, w * .66, 14, y, y + 1, y + 3.4, stuntWarmGlowMat);
    block(x, y + 3.4, z + d / 2 - .35, w * .66, .12, .5, stuntWarmGlowMat, false, false);

    // Hazard chevrons across the launch face, visible from the street below.
    for (let i = -3; i <= 3; i++) {
      const stripe = new THREE.Mesh(boxGeo, stuntWarmGlowMat);
      stripe.scale.set(.5, 2.2, .06);
      stripe.position.set(x + i * 4.1, y + 1.75, z + d / 2 + .15);
      stripe.rotation.z = Math.PI / 4;
      scene.add(stripe);
    }
    for (const side of [-1, 1]) {
      block(x + side * (w * .33 - 1), y + 3.62, z + d / 2 - .3, .7, .32, .7, stuntWarmGlowMat, false, false);
    }

    stuntSurfaces.push({ kind: 'deck', minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, y });
    stuntDecks.push({ x, z, w, d, y });
  }

  addStuntDeck(110, 520, 52, 120, 9, 340, 120, 1);
  addStuntDeck(-330, 0, 52, 100, 11, -180, 130, 2);
  addStuntDeck(550, -300, 52, 100, 10, -470, 120, 3);

  // --- Collectible street rings ---------------------------------------------
  const rings = [];
  const ringGeo = new THREE.TorusGeometry(3.1, .28, 8, 28);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffc247,
    emissive: 0xff8a00,
    emissiveIntensity: 1.4,
    metalness: .6,
    roughness: .22
  });
  const ringGlowMat = new THREE.SpriteMaterial({
    map: sunTex,
    color: 0xffc76a,
    transparent: true,
    opacity: .55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const ringPoints = [
    [110, -30, 'z'],
    [110, 780, 'z'],
    [-330, -300, 'z'],
    [550, -700, 'z'],
    [-600, 200, 'x'],
    [200, 600, 'x'],
    [600, -200, 'x'],
    [-200, -600, 'x']
  ];
  for (const [x, z, axis] of ringPoints) {
    const group = new THREE.Group();
    const torus = new THREE.Mesh(ringGeo, ringMat);
    group.add(torus);
    const glow = new THREE.Sprite(ringGlowMat);
    glow.scale.set(11, 11, 1);
    group.add(glow);
    group.position.set(x, 3.3, z);
    if (axis === 'x') group.rotation.y = Math.PI / 2;
    scene.add(group);
    rings.push({ group, spin: torus, x, z, phase: rings.length });
  }

  const trafficShadowGeo = new THREE.PlaneGeometry(4.6, 4.6);
  trafficShadowGeo.rotateX(-Math.PI / 2);
  const trafficShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: .42
  });
  const carShadowMesh = new THREE.InstancedMesh(trafficShadowGeo, trafficShadowMat, traffic.length + parkedCars.length);
  carShadowMesh.frustumCulled = false;
  carShadowMesh.renderOrder = 2;
  scene.add(carShadowMesh);
  const carShadowDummy = new THREE.Object3D();

  function updateCarShadows() {
    let index = 0;
    for (const car of traffic) {
      carShadowDummy.position.set(car.root.position.x, .025, car.root.position.z);
      carShadowDummy.rotation.set(0, 0, 0);
      carShadowDummy.scale.setScalar(1);
      carShadowDummy.updateMatrix();
      carShadowMesh.setMatrixAt(index++, carShadowDummy.matrix);
    }
    for (const car of parkedCars) {
      carShadowDummy.position.set(car.position.x, .025, car.position.z);
      carShadowDummy.rotation.set(0, 0, 0);
      carShadowDummy.scale.setScalar(1);
      carShadowDummy.updateMatrix();
      carShadowMesh.setMatrixAt(index++, carShadowDummy.matrix);
    }
    carShadowMesh.instanceMatrix.needsUpdate = true;
  }

  // --- Player physics state -------------------------------------------------
  const state = {
    pos: SPAWN.clone(),
    heading: 0,
    vel: new THREE.Vector2(0, 0),
    steer: 0,
    wheelSpin: 0,
    bodyRoll: 0,
    bodyPitch: 0,
    y: 0,
    vy: 0,
    airborne: false,
    airTime: 0,
    surfaceSlope: 0,
    chassisPitch: 0,
    speedKmh: 0,
    gear: 'N',
    drifting: false,
    camMode: 0,
    shake: 0,
    vForward: 0,
    lastVForward: 0,
    lateral: 0,
    score: 0,
    best: 0,
    multiplier: 1,
    comboTimer: 0,
    comboProgress: 0,
    rings: 0,
    nearMissTimer: 0
  };

  const BEST_KEY = 'forza.street.best.v1';
  try {
    const savedBest = Math.floor(Number(localStorage.getItem(BEST_KEY)));
    if (Number.isFinite(savedBest) && savedBest > 0) state.best = savedBest;
  } catch (e) {}
  let bestSaveAt = 0;

  const audio = {
    ctx: null,
    osc: null,
    gain: null,
    filter: null,
    muted: false,
    ready: false
  };

  function initAudio() {
    if (audio.ready) {
      if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      filter.Q.value = 1.4;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audio.ctx = ctx;
      audio.osc = osc;
      audio.gain = gain;
      audio.filter = filter;
      audio.ready = true;
      ctx.resume().catch(() => {});
    } catch (e) {
      // Audio is optional; the game remains fully playable without it.
    }
  }

  function toggleSound() {
    initAudio();
    audio.muted = !audio.muted;
    if (audio.gain && audio.ctx) {
      audio.gain.gain.setTargetAtTime(audio.muted ? 0 : .02, audio.ctx.currentTime, .08);
    }
    showToast(audio.muted ? 'Sound off' : 'Sound on');
  }

  function updateAudio(throttle) {
    if (!audio.ready || !audio.ctx || !audio.osc) return;
    const speed = state.speedKmh;
    const rpm = clamp(speed / (activeCar.top * 3.6), 0, 1);
    audio.osc.frequency.setTargetAtTime(42 + rpm * 155 + throttle * 18, audio.ctx.currentTime, .06);
    audio.filter.frequency.setTargetAtTime(260 + rpm * 1600 + throttle * 260, audio.ctx.currentTime, .08);
    const volume = audio.muted ? 0 : .012 + rpm * .018 + throttle * .006;
    audio.gain.gain.setTargetAtTime(volume, audio.ctx.currentTime, .12);
  }

  const keys = Object.create(null);

  function toggleCamera() {
    state.camMode = state.camMode === 0 ? 1 : 0;
    showToast(state.camMode === 0 ? 'Chase camera' : 'Hood camera');
  }

  function resetCar() {
    state.pos.copy(SPAWN);
    state.heading = 0;
    state.vel.set(0, 0);
    state.steer = 0;
    state.wheelSpin = 0;
    state.bodyRoll = 0;
    state.bodyPitch = 0;
    state.shake = 0;
    state.vForward = 0;
    state.lastVForward = 0;
    state.lateral = 0;
    state.y = 0;
    state.vy = 0;
    state.airborne = false;
    state.airTime = 0;
    state.surfaceSlope = 0;
    state.chassisPitch = 0;
    state.drifting = false;
    state.multiplier = 1;
    state.comboTimer = 0;
    state.comboProgress = 0;
    state.nearMissTimer = 0;
    hero.position.copy(SPAWN);
    hero.rotation.y = 0;
    hero.rotation.x = 0;
    contactShadow.visible = true;
    camera.position.set(SPAWN.x, 4.4, SPAWN.z - 9);
    showToast('Reset · Shibuya Loop');
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyG' && !e.repeat) {
      e.preventDefault();
      setGarage(!garageOpen);
      return;
    }
    if (e.code === 'Escape' && garageOpen) {
      e.preventDefault();
      setGarage(false);
      return;
    }
    if (garageOpen) return;
    const watched = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyR', 'KeyC', 'KeyM'];
    if (watched.includes(e.code)) e.preventDefault();
    keys[e.code] = true;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) initAudio();
    if (e.code === 'KeyR' && !e.repeat) resetCar();
    if (e.code === 'KeyC' && !e.repeat) toggleCamera();
    if (e.code === 'KeyM' && !e.repeat) toggleSound();
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    for (const key in keys) keys[key] = false;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Collision and physics ------------------------------------------------
  function surfaceAt(x, z, feet = 0) {
    let best = { y: 0, slopeX: 0, slopeZ: 0, kind: 'ground' };
    for (const s of stuntSurfaces) {
      if (x < s.minX || x > s.maxX || z < s.minZ || z > s.maxZ) continue;
      let y = s.y;
      let slopeX = 0;
      let slopeZ = 0;
      if (s.kind === 'ramp') {
        const t = clamp((z - s.minZ) / Math.max(.001, s.maxZ - s.minZ), 0, 1);
        y = s.y0 + (s.y1 - s.y0) * t;
        slopeZ = (s.y1 - s.y0) / Math.max(.001, s.maxZ - s.minZ);
      }
      if (y > feet + .9) continue;
      if (y > best.y + .001 || (y > best.y - .001 && s.kind === 'ramp' && best.kind !== 'ramp')) {
        best = { y, slopeX, slopeZ, kind: s.kind };
      }
    }
    return best;
  }

  function updateVertical(dt) {
    if (state.airborne) {
      state.airTime += dt;
      state.vy -= 30 * dt;
      state.y += state.vy * dt;
      const surf = surfaceAt(state.pos.x, state.pos.z, state.y);
      if (state.y <= surf.y) {
        state.y = surf.y;
        state.vy = 0;
        state.airborne = false;
        const air = state.airTime;
        state.airTime = 0;
        state.surfaceSlope = surf.slopeX * Math.sin(state.heading) + surf.slopeZ * Math.cos(state.heading);
        if (air > .4) {
          const points = Math.round(air * 260 * state.multiplier);
          award(points, `AIR ${air.toFixed(1)}s +${points}`, 1200);
          bumpMultiplier();
          state.shake = Math.min(1, state.shake + Math.min(.3, air * .12));
        }
      }
      return;
    }

    const surf = surfaceAt(state.pos.x, state.pos.z, state.y);
    if (surf.y < state.y - .55) {
      state.airborne = true;
      state.airTime = 0;
      state.vy = state.surfaceSlope * state.vForward;
      return;
    }
    state.y = surf.y;
    state.surfaceSlope = surf.slopeX * Math.sin(state.heading) + surf.slopeZ * Math.cos(state.heading);
  }

  function collideBlocks() {
    const p = state.pos;
    for (const b of blocks) {
      const cx = clamp(p.x, b.minX, b.maxX);
      const cz = clamp(p.z, b.minZ, b.maxZ);
      let dx = p.x - cx;
      let dz = p.z - cz;
      let d2 = dx * dx + dz * dz;
      if (d2 < CAR_RADIUS * CAR_RADIUS) {
        let d = Math.sqrt(d2);
        if (d < .0001) {
          dx = 0;
          dz = p.z < (b.minZ + b.maxZ) / 2 ? -1 : 1;
          d = .0001;
        }
        const nx = dx / d;
        const nz = dz / d;
        p.x = cx + nx * CAR_RADIUS;
        p.z = cz + nz * CAR_RADIUS;
        const vn = state.vel.x * nx + state.vel.y * nz;
        if (vn < 0) {
          state.vel.x -= 1.02 * vn * nx;
          state.vel.y -= 1.02 * vn * nz;
        }
        state.vel.multiplyScalar(.72);
        if (Math.abs(vn) > 2.5) state.shake = Math.min(1, state.shake + Math.abs(vn) * .04);
        breakCombo();
        break;
      }
    }
    const limX = MAP_X + 240;
    const limZ = MAP_Z + 240;
    if (p.x > limX) { p.x = limX; state.vel.x *= -.32; }
    if (p.x < -limX) { p.x = -limX; state.vel.x *= -.32; }
    if (p.z > limZ) { p.z = limZ; state.vel.y *= -.32; }
    if (p.z < -limZ) { p.z = -limZ; state.vel.y *= -.32; }
  }

  function resolveTrafficHit(root, movingCar = null) {
    const dx = state.pos.x - root.position.x;
    const dz = state.pos.z - root.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist >= 3.1) return;
    const nx = dx / Math.max(dist, .001);
    const nz = dz / Math.max(dist, .001);
    state.pos.x += nx * (3.1 - dist);
    state.pos.z += nz * (3.1 - dist);
    const vn = state.vel.x * nx + state.vel.y * nz;
    if (vn < 0) {
      state.vel.x -= 1.02 * vn * nx;
      state.vel.y -= 1.02 * vn * nz;
    }
    state.vel.multiplyScalar(.65);
    if (Math.abs(vn) > 2) state.shake = Math.min(1, state.shake + .35);
    breakCombo();
    if (movingCar) movingCar.hitTimer = 1.2;
  }

  function collideTraffic() {
    if (state.y > 1.5) return;
    for (const car of traffic) resolveTrafficHit(car.root, car);
    for (const car of parkedCars) resolveTrafficHit(car);
  }

  function updatePhysics(dt) {
    const throttle = (keys.KeyW || keys.ArrowUp) ? 1 : 0;
    const brake = (keys.KeyS || keys.ArrowDown) ? 1 : 0;
    const handbrake = keys.Space ? 1 : 0;
    const steerInput = (keys.KeyA || keys.ArrowLeft ? 1 : 0) - (keys.KeyD || keys.ArrowRight ? 1 : 0);

    const fwd = new THREE.Vector2(Math.sin(state.heading), Math.cos(state.heading));
    const right = new THREE.Vector2(-Math.cos(state.heading), Math.sin(state.heading));
    let vF = state.vel.dot(fwd);
    let vL = state.vel.dot(right);

    if (throttle) {
      if (vF < -.5) vF += 18 * dt;
      else vF += activeCar.accel * dt * (1 - Math.min(1, vF / activeCar.top));
    }
    if (brake) {
      if (vF > .5) vF -= 27 * dt;
      else vF -= 8 * dt;
    }
    if (handbrake) vF -= Math.sign(vF) * activeCar.handbrakeDrag * dt;

    vF -= vF * .022 * dt;
    vF -= Math.sign(vF) * .18 * dt;
    vF = clamp(vF, -12, activeCar.top);

    // Keep steering authority alive at speed, then open the yaw cap as speed
    // climbs so fast corners and drifts tighten instead of washing wide.
    const speedAbs = Math.abs(vF);
    const speedT = clamp((speedAbs - 18) / 42, 0, 1);
    const maxSteer = activeCar.steer / (1 + speedAbs * (.018 - .006 * speedT));
    const targetSteer = steerInput * maxSteer;
    state.steer += (targetSteer - state.steer) * Math.min(1, 13 * dt);

    const baseYaw = speedAbs > .55
      ? (vF / 2.6) * Math.tan(state.steer) * (handbrake ? 1.4 : 1)
      : 0;
    const yawBoost = 1 + speedT * (handbrake ? 1 : .75);
    const maxYaw = ((handbrake ? activeCar.driftYaw : activeCar.yaw) * yawBoost) / Math.max(3.2, speedAbs * .58);
    const yaw = clamp(baseYaw, -maxYaw, maxYaw);
    state.heading += yaw * dt;

    const oldVel = new THREE.Vector2(
      fwd.x * vF + right.x * vL,
      fwd.y * vF + right.y * vL
    );
    const grip = handbrake ? activeCar.driftGrip : activeCar.grip;
    const newFwd = new THREE.Vector2(Math.sin(state.heading), Math.cos(state.heading));
    const newRight = new THREE.Vector2(-Math.cos(state.heading), Math.sin(state.heading));
    let nvF = oldVel.dot(newFwd);
    let nvL = oldVel.dot(newRight);
    nvL *= Math.exp(-grip * dt);
    if (handbrake) nvF *= Math.exp(-activeCar.driftDrag * dt);
    state.vel.set(newFwd.x * nvF + newRight.x * nvL, newFwd.y * nvF + newRight.y * nvL);
    state.pos.x += state.vel.x * dt;
    state.pos.z += state.vel.y * dt;

    collideBlocks();
    collideTraffic();

    state.vForward = state.vel.dot(newFwd);
    state.lateral = nvL;
    updateVertical(dt);
    state.speedKmh = state.vel.length() * 3.6;
    state.drifting = !state.airborne && Math.abs(nvL) > 2 && state.speedKmh > 14;
    state.gear = state.vForward > .5 ? 'D' : (state.vForward < -.5 ? 'R' : 'N');

    const accel = (vF - state.lastVForward) / Math.max(dt, .001);
    state.lastVForward = vF;
    const targetRoll = clamp(yaw * vF * .005 + nvL * .011, -.085, .085);
    const targetPitch = clamp(-accel * .0017, -.045, .045);
    const targetChassisPitch = state.airborne
      ? clamp(-state.vy * .02, -.16, .16)
      : clamp(-Math.atan(state.surfaceSlope), -.2, .2);
    state.bodyRoll += (targetRoll - state.bodyRoll) * Math.min(1, 7 * dt);
    state.bodyPitch += (targetPitch - state.bodyPitch) * Math.min(1, 7 * dt);
    state.chassisPitch += (targetChassisPitch - state.chassisPitch) * Math.min(1, 9 * dt);

    state.wheelSpin += vF / .36 * dt;

    hero.position.set(state.pos.x, state.y, state.pos.z);
    hero.rotation.y = state.heading;
    hero.rotation.x = state.chassisPitch;
    const body = hero.userData.body;
    body.rotation.z = state.bodyRoll;
    body.rotation.x = state.bodyPitch;
    for (const wheel of hero.userData.wheels) wheel.rotation.x = state.wheelSpin;
    for (const pivot of hero.userData.frontPivots) pivot.rotation.y = state.steer;
    hero.userData.brakeMat.emissiveIntensity = (brake || handbrake) ? 2.6 : .35;
    contactShadow.visible = !state.airborne && Math.abs(state.surfaceSlope) < .03;

    state.shake *= Math.exp(-5 * dt);
    updateStuntScore(dt);
    updateRings(dt);
  }

  // --- Traffic --------------------------------------------------------------
  function updateTraffic(dt) {
    for (const car of traffic) {
      let target = car.target;
      let aheadBlocked = false;
      if (car.hitTimer > 0) {
        car.hitTimer = Math.max(0, car.hitTimer - dt);
        car.speed = Math.max(0, car.speed - 30 * dt);
        target = 0;
      }

      for (const inter of intersections) {
        if (car.axis === 'z' && Math.abs(inter.x - car.road) < 1.5) {
          const ahead = (inter.z - car.pos) * car.dir;
          if (ahead > 0 && ahead < 42 && inter.zState !== 'green') {
            target = 0;
            aheadBlocked = true;
            break;
          }
        }
        if (car.axis === 'x' && Math.abs(inter.z - car.road) < 1.5) {
          const ahead = (inter.x - car.pos) * car.dir;
          if (ahead > 0 && ahead < 42 && inter.xState !== 'green') {
            target = 0;
            aheadBlocked = true;
            break;
          }
        }
      }

      if (!aheadBlocked) {
        for (const other of traffic) {
          if (other === car || other.axis !== car.axis || other.dir !== car.dir) continue;
          if (Math.abs(other.laneOffset - car.laneOffset) > 2.5) continue;
          const gap = (other.pos - car.pos) * car.dir;
          if (gap > 0 && gap < 17) {
            target = Math.min(target, other.speed * .72);
            break;
          }
        }
      }

      car.speed += clamp(target - car.speed, -15 * dt, 7 * dt);
      car.pos += car.speed * car.dir * dt;
      const limitX = MAP_X + 180;
      const limitZ = MAP_Z + 180;
      if (car.axis === 'z') {
        if (car.pos > limitZ) car.pos = -limitZ;
        if (car.pos < -limitZ) car.pos = limitZ;
        car.root.position.set(car.road + car.laneOffset, 0, car.pos);
      } else {
        if (car.pos > limitX) car.pos = -limitX;
        if (car.pos < -limitX) car.pos = limitX;
        car.root.position.set(car.pos, 0, car.road + car.laneOffset);
      }
      if (state.y < .6 && !state.airborne && state.speedKmh > 28 && car.nearMissCd <= 0 && state.nearMissTimer <= 0 && car.hitTimer <= 0) {
        const dx = state.pos.x - car.root.position.x;
        const dz = state.pos.z - car.root.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 3.2 && dist < 5.4) {
          car.nearMissCd = 2.5;
          state.nearMissTimer = 1.1;
          const points = 100 * state.multiplier;
          award(points, `NEAR MISS +${points}`, 800);
          bumpMultiplier();
        }
      }
      car.nearMissCd = Math.max(0, car.nearMissCd - dt);
      for (const wheel of car.wheels) wheel.rotation.x += car.speed / .36 * dt;
    }
  }

  // --- Camera ---------------------------------------------------------------
  const fwd3 = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();

  function pointInBlock(x, z, margin = 1) {
    for (const b of blocks) {
      if (x > b.minX - margin && x < b.maxX + margin && z > b.minZ - margin && z < b.maxZ + margin) return true;
    }
    return false;
  }

  function updateCamera(dt) {
    const speed = state.speedKmh;
    fwd3.set(Math.sin(state.heading), 0, Math.cos(state.heading));

    if (state.camMode === 1) {
      desiredCamera.copy(state.pos).addScaledVector(fwd3, .55);
      desiredCamera.y = state.y + 1.24;
      lookTarget.copy(state.pos).addScaledVector(fwd3, 30);
      lookTarget.y = state.y + 1.25;
      camera.position.lerp(desiredCamera, 1 - Math.exp(-20 * dt));
    } else {
      const back = 8.6 + speed * .085;
      let camBack = back;
      for (let t = .35; t <= 1.001; t += .1) {
        const px = state.pos.x - fwd3.x * back * t;
        const pz = state.pos.z - fwd3.z * back * t;
        if (pointInBlock(px, pz, 1.2)) {
          camBack = Math.max(3.2, back * (t - .08));
          break;
        }
      }
      const height = 3.7 + speed * .018 + (camBack < back ? .9 : 0);
      desiredCamera.copy(state.pos).addScaledVector(fwd3, -camBack);
      desiredCamera.y = state.y + height;
      camera.position.lerp(desiredCamera, 1 - Math.exp(-5.5 * dt));
      lookTarget.copy(state.pos).addScaledVector(fwd3, 6 + speed * .075);
      lookTarget.y = state.y + 1.15;
    }

    if (state.shake > .01) {
      camera.position.x += (Math.random() - .5) * state.shake * .7;
      camera.position.y += (Math.random() - .5) * state.shake * .45;
    }

    camera.lookAt(lookTarget);
    const targetFov = state.camMode === 1 ? 68 : 58 + Math.min(14, speed * .065);
    camera.fov += (targetFov - camera.fov) * Math.min(1, 4 * dt);
    camera.updateProjectionMatrix();

    skyRig.position.copy(camera.position);
    sunLight.position.set(state.pos.x - 110, 170 + state.y, state.pos.z - 70);
    sunLight.target.position.set(state.pos.x, state.y, state.pos.z);
    sunLight.target.updateMatrixWorld();
  }

  // --- HUD, minimap, toast --------------------------------------------------
  const speedEl = document.getElementById('speed');
  const gearEl = document.getElementById('gear');
  const fpsEl = document.getElementById('fps');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const multEl = document.getElementById('mult');
  const ringsEl = document.getElementById('rings');
  const rpmEl = document.getElementById('rpm-fill');
  const driftEl = document.getElementById('drift');
  const toastEl = document.getElementById('toast');
  const minimap = document.getElementById('minimap');
  const mm = minimap.getContext('2d');
  let toastTimer = 0;
  let minimapTimer = 0;
  let fpsFrames = 0;
  let fpsWindowStart = performance.now();
  let ringTime = 0;
  let ringResetTimer = 0;

  const garageEl = document.getElementById('garage');
  const carListEl = document.getElementById('car-list');
  const garageCloseEl = document.getElementById('garage-close');
  let garageOpen = false;

  function renderGarage() {
    carListEl.innerHTML = CARS.map((car, index) => {
      const selected = car === activeCar;
      const hex = `#${car.color.toString(16).padStart(6, '0')}`;
      const stat = (value) => `${Math.round(clamp(value / 5, 0, 1) * 100)}%`;
      return `<button type="button" class="car-card${selected ? ' selected' : ''}" data-index="${index}" aria-pressed="${selected}">
        <span class="car-swatch" style="background:${hex}"></span>
        <span>
          <span class="car-name">${car.name}</span>
          <span class="car-tag">${car.tag}</span>
          <span class="car-stats">
            <span class="car-stat"><i style="width:${stat(car.speed)}"></i>SPEED</span>
            <span class="car-stat"><i style="width:${stat(car.gripBar)}"></i>GRIP</span>
            <span class="car-stat"><i style="width:${stat(car.driftBar)}"></i>DRIFT</span>
          </span>
        </span>
      </button>`;
    }).join('');
  }

  function selectCar(index) {
    const car = CARS[index];
    if (!car) return;
    selectedCarIndex = index;
    activeCar = car;
    applyCarLook(car);
    try { localStorage.setItem(CAR_KEY, String(index)); } catch (e) {}
    renderGarage();
  }

  function setGarage(open) {
    garageOpen = open;
    garageEl.classList.toggle('open', open);
    garageEl.setAttribute('aria-hidden', String(!open));
    for (const key in keys) keys[key] = false;
    if (open) {
      renderGarage();
    } else {
      initAudio();
      showToast('WASD drive · SPACE drift · cyan decks = air time', 4200);
    }
  }

  carListEl.addEventListener('click', (e) => {
    const card = e.target.closest('.car-card');
    if (card) selectCar(Number(card.dataset.index));
  });
  garageCloseEl.addEventListener('click', () => setGarage(false));
  garageEl.addEventListener('click', (e) => {
    if (e.target === garageEl) setGarage(false);
  });

  function showToast(message, duration = 2400) {
    toastEl.textContent = message;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), duration);
  }

  function trackBest() {
    if (state.score <= state.best) return;
    state.best = Math.floor(state.score);
    const now = performance.now();
    if (now - bestSaveAt < 2000) return;
    bestSaveAt = now;
    try { localStorage.setItem(BEST_KEY, String(state.best)); } catch (e) {}
  }

  function award(points, label, duration = 1200) {
    state.score += Math.max(0, Math.round(points));
    trackBest();
    if (label) showToast(label, duration);
  }

  function bumpMultiplier() {
    state.comboTimer = 2.6;
    state.comboProgress = 0;
    if (state.multiplier < 5) state.multiplier++;
  }

  function breakCombo() {
    if (state.multiplier > 1) showToast('COMBO LOST', 900);
    state.multiplier = 1;
    state.comboTimer = 0;
    state.comboProgress = 0;
  }

  function updateStuntScore(dt) {
    state.nearMissTimer = Math.max(0, state.nearMissTimer - dt);
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer === 0 && state.multiplier > 1) {
      state.multiplier = 1;
      state.comboProgress = 0;
    }
    if (!state.drifting) return;
    state.score += 34 * state.multiplier * dt;
    state.comboTimer = 2.4;
    state.comboProgress += dt;
    if (state.comboProgress >= 1 && state.multiplier < 5) {
      state.comboProgress = 0;
      state.multiplier++;
    }
    trackBest();
  }

  function updateRings(dt) {
    ringTime += dt;
    if (ringResetTimer > 0) {
      ringResetTimer -= dt;
      if (ringResetTimer <= 0) {
        for (const ring of rings) ring.group.visible = true;
        state.rings = 0;
        showToast('Gold rings respawned', 1300);
      }
      return;
    }
    for (const ring of rings) {
      if (!ring.group.visible) continue;
      ring.spin.rotation.z += dt * .8;
      const pulse = 1 + Math.sin(ringTime * 3 + ring.phase) * .045;
      ring.group.scale.setScalar(pulse);
      const dx = state.pos.x - ring.x;
      const dz = state.pos.z - ring.z;
      const dy = (state.y + 1.2) - 3.3;
      if (dx * dx + dz * dz < 17.6 && Math.abs(dy) < 4.2) {
        ring.group.visible = false;
        state.rings++;
        const points = 500 * state.multiplier;
        award(points, `RING ${state.rings}/${rings.length} +${points}`, 1100);
        bumpMultiplier();
        state.shake = Math.min(1, state.shake + .12);
        if (state.rings === rings.length) {
          award(2500, 'CITY CLEARED +2,500', 2200);
          state.shake = Math.min(1, state.shake + .35);
          ringResetTimer = 8;
        }
        break;
      }
    }
  }

  function updateHud() {
    speedEl.textContent = Math.round(state.speedKmh);
    gearEl.textContent = state.gear;
    rpmEl.style.width = `${Math.min(100, state.speedKmh / (activeCar.top * 3.6) * 100)}%`;
    driftEl.classList.toggle('on', state.drifting);
    scoreEl.textContent = Math.floor(state.score).toLocaleString('en-US');
    bestEl.textContent = Math.floor(state.best).toLocaleString('en-US');
    multEl.textContent = `x${state.multiplier}`;
    multEl.classList.toggle('hot', state.multiplier > 1);
    ringsEl.textContent = `RINGS ${state.rings}/${rings.length}`;
  }

  function updateFps() {
    fpsFrames++;
    const now = performance.now();
    const elapsed = now - fpsWindowStart;
    if (elapsed < 500) return;
    const fps = fpsFrames * 1000 / elapsed;
    fpsEl.textContent = `${fps < 10 ? fps.toFixed(1) : Math.round(fps)} FPS`;
    fpsFrames = 0;
    fpsWindowStart = now;
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fpsFrames = 0;
      fpsWindowStart = performance.now();
    }
  });

  function drawMinimap() {
    const w = minimap.width;
    const h = minimap.height;
    const pad = 9;
    const scale = Math.min((w - pad * 2) / (MAP_X * 2 + 240), (h - pad * 2) / (MAP_Z * 2 + 240));
    const toX = (x) => w / 2 + x * scale;
    const toY = (z) => h / 2 + z * scale;

    mm.clearRect(0, 0, w, h);
    mm.fillStyle = 'rgba(7,12,18,.7)';
    mm.fillRect(0, 0, w, h);

    for (const b of blocks) {
      mm.fillStyle = b.park ? 'rgba(54, 107, 66, .75)' : 'rgba(35, 47, 58, .9)';
      mm.fillRect(toX(b.minX), toY(b.minZ), (b.maxX - b.minX) * scale, (b.maxZ - b.minZ) * scale);
    }

    mm.strokeStyle = 'rgba(210, 225, 240, .24)';
    mm.lineWidth = 1;
    for (const x of roadXs) {
      mm.beginPath(); mm.moveTo(toX(x), pad); mm.lineTo(toX(x), h - pad); mm.stroke();
    }
    for (const z of roadZs) {
      mm.beginPath(); mm.moveTo(pad, toY(z)); mm.lineTo(w - pad, toY(z)); mm.stroke();
    }

    for (const deck of stuntDecks) {
      mm.fillStyle = 'rgba(82, 229, 255, .16)';
      mm.strokeStyle = 'rgba(82, 229, 255, .72)';
      mm.lineWidth = 1.2;
      mm.fillRect(toX(deck.x - deck.w / 2), toY(deck.z - deck.d / 2), deck.w * scale, deck.d * scale);
      mm.strokeRect(toX(deck.x - deck.w / 2), toY(deck.z - deck.d / 2), deck.w * scale, deck.d * scale);
    }

    for (const ring of rings) {
      if (!ring.group.visible) continue;
      mm.fillStyle = '#ffd166';
      mm.beginPath();
      mm.arc(toX(ring.x), toY(ring.z), 2.3, 0, Math.PI * 2);
      mm.fill();
    }

    for (const car of traffic) {
      mm.fillStyle = 'rgba(230, 238, 245, .55)';
      mm.beginPath();
      mm.arc(toX(car.root.position.x), toY(car.root.position.z), 1.4, 0, Math.PI * 2);
      mm.fill();
    }

    const px = toX(state.pos.x);
    const pz = toY(state.pos.z);
    const fx = Math.sin(state.heading);
    const fz = Math.cos(state.heading);
    mm.strokeStyle = '#ff2d55';
    mm.lineWidth = 2;
    mm.beginPath();
    mm.moveTo(px, pz);
    mm.lineTo(px + fx * 8, pz + fz * 8);
    mm.stroke();
    mm.fillStyle = '#ff2d55';
    mm.beginPath();
    mm.arc(px, pz, 3.1, 0, Math.PI * 2);
    mm.fill();
  }

  // --- Main loop -------------------------------------------------------------
  const clock = new THREE.Clock();
  const FIXED_STEP = 1 / 60;
  let accumulator = 0;
  let minimapTime = 0;
  let perfElapsed = 0;
  let perfFrames = 0;
  let perfCooldown = 0;

  function tunePerformance(rawDt) {
    perfElapsed += rawDt;
    perfFrames++;
    perfCooldown = Math.max(0, perfCooldown - rawDt);
    if (perfElapsed < 2.5) return;
    const fps = perfFrames / perfElapsed;
    if (fps < 42 && renderPixelRatio > .8) {
      renderPixelRatio = Math.max(.8, renderPixelRatio - .15);
      renderer.setPixelRatio(renderPixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
    } else if (fps > 57 && renderPixelRatio < MAX_PIXEL_RATIO && perfCooldown === 0) {
      renderPixelRatio = Math.min(MAX_PIXEL_RATIO, renderPixelRatio + .1);
      renderer.setPixelRatio(renderPixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      perfCooldown = 8;
    }
    perfElapsed = 0;
    perfFrames = 0;
  }

  function animate() {
    requestAnimationFrame(animate);
    const rawDt = Math.min(.2, clock.getDelta());
    if (garageOpen) {
      accumulator = 0;
      updateAudio(0);
    } else {
      accumulator = Math.min(accumulator + rawDt, .2);
      let steps = 0;
      while (accumulator >= FIXED_STEP && steps < 12) {
        updatePhysics(FIXED_STEP);
        updateTraffic(FIXED_STEP);
        updateTrafficLights(FIXED_STEP);
        accumulator -= FIXED_STEP;
        steps++;
      }
      updateAudio((keys.KeyW || keys.ArrowUp) ? 1 : 0);
    }
    updateCamera(rawDt);
    updateHud();
    updateCarShadows();
    tunePerformance(rawDt);
    updateFps();
    minimapTime += rawDt;
    if (minimapTime > .1) {
      drawMinimap();
      minimapTime = 0;
    }
    renderer.render(scene, camera);
  }

  camera.position.set(SPAWN.x, 4.4, SPAWN.z - 9);
  camera.lookAt(SPAWN.x, 1.15, SPAWN.z + 6);
  drawMinimap();
  updateHud();
  setGarage(true);
  animate();

  window.__forza = {
    state, blocks, traffic, camera, renderer, scene, rings, hero, CARS, stuntSurfaces, stuntDecks, surfaceAt, selectCar,
    get activeCar() { return activeCar; },
    get garageOpen() { return garageOpen; }
  };
</script>
