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
  #vignette { position: fixed; inset: 0; pointer-events: none; z-index: 5; background: radial-gradient(ellipse at 50% 46%, transparent 50%, rgba(2, 6, 12, .44) 100%); }
  @media (max-width: 760px) {
    #help { display: none; }
    #speedo { width: 165px; right: 12px; bottom: 12px; padding: 11px 14px 10px; }
    #speed { font-size: 48px; }
    #minimap { width: 120px; height: 120px; left: 12px; bottom: 12px; padding: 6px; }
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
    <div><b>M</b> sound</div>
  </div>
  <div id="speedo" class="panel">
    <div id="gear">N</div>
    <div id="fps" aria-label="Frames per second">-- FPS</div>
    <div id="speed">0</div>
    <div id="unit">KM/H</div>
    <div class="rpm"><i id="rpm-fill"></i></div>
    <div id="drift">DRIFT</div>
  </div>
  <canvas id="minimap" width="180" height="180"></canvas>
  <div id="toast"></div>
</div>
<div id="vignette"></div>

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
  const wheelGeo = new THREE.CylinderGeometry(.36, .36, .27, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(.19, .19, .29, 12);
  rimGeo.rotateZ(Math.PI / 2);

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

    const lower = new THREE.Mesh(boxGeo, bodyMat);
    lower.scale.set(1.96, .52, 4.36);
    lower.position.set(0, .63, 0);
    lower.castShadow = true;
    body.add(lower);

    if (hero) {
      const hood = new THREE.Mesh(boxGeo, bodyMat);
      hood.scale.set(1.82, .16, 1.35);
      hood.position.set(0, .94, 1.48);
      body.add(hood);

      const trunk = new THREE.Mesh(boxGeo, bodyMat);
      trunk.scale.set(1.8, .15, .92);
      trunk.position.set(0, .94, -1.64);
      body.add(trunk);
    }

    const cabin = new THREE.Mesh(boxGeo, glassMat);
    cabin.scale.set(1.6, .5, 1.92);
    cabin.position.set(0, 1.16, -.12);
    cabin.castShadow = true;
    body.add(cabin);

    const roof = new THREE.Mesh(boxGeo, bodyMat);
    roof.scale.set(1.45, .1, 1.55);
    roof.position.set(0, 1.44, -.12);
    roof.castShadow = true;
    body.add(roof);

    if (hero) {
      const frontBumper = new THREE.Mesh(boxGeo, bodyMat);
      frontBumper.scale.set(1.88, .24, .22);
      frontBumper.position.set(0, .45, 2.21);
      body.add(frontBumper);

      const rearBumper = new THREE.Mesh(boxGeo, bodyMat);
      rearBumper.scale.set(1.88, .24, .22);
      rearBumper.position.set(0, .45, -2.21);
      body.add(rearBumper);

      const grille = new THREE.Mesh(boxGeo, signalMat);
      grille.scale.set(1.05, .19, .06);
      grille.position.set(0, .55, 2.24);
      body.add(grille);
    }

    const headLights = [];
    if (hero) {
      for (const x of [-.64, .64]) {
        const light = new THREE.Mesh(boxGeo, headMat);
        light.scale.set(.48, .15, .055);
        light.position.set(x, .82, 2.24);
        body.add(light);
        headLights.push(light);
      }
    } else {
      const bar = new THREE.Mesh(boxGeo, headMat);
      bar.scale.set(1.3, .12, .055);
      bar.position.set(0, .8, 2.24);
      body.add(bar);
      headLights.push(bar);
    }

    const brakeMat = hero
      ? new THREE.MeshStandardMaterial({ color: 0x7a0b16, emissive: 0xff1a2e, emissiveIntensity: .35, roughness: .3 })
      : tailMat;
    const rearLights = [];
    if (hero) {
      for (const x of [-.67, .67]) {
        const light = new THREE.Mesh(boxGeo, brakeMat);
        light.scale.set(.42, .15, .055);
        light.position.set(x, .82, -2.24);
        body.add(light);
        rearLights.push(light);
      }
    } else {
      const bar = new THREE.Mesh(boxGeo, brakeMat);
      bar.scale.set(1.3, .12, .055);
      bar.position.set(0, .8, -2.24);
      body.add(bar);
      rearLights.push(bar);
    }

    if (hero) {
      const plate = new THREE.Mesh(boxGeo, plateMat);
      plate.scale.set(.62, .17, .035);
      plate.position.set(0, .55, -2.245);
      body.add(plate);
    }


    if (hero) {
      const splitter = new THREE.Mesh(boxGeo, signalMat);
      splitter.scale.set(1.92, .08, .4);
      splitter.position.set(0, .3, 2.12);
      body.add(splitter);

      const diffuser = new THREE.Mesh(boxGeo, signalMat);
      diffuser.scale.set(1.72, .12, .35);
      diffuser.position.set(0, .3, -2.1);
      body.add(diffuser);

      const spoiler = new THREE.Mesh(boxGeo, bodyMat);
      spoiler.scale.set(1.7, .08, .42);
      spoiler.position.set(0, 1.18, -2.03);
      spoiler.castShadow = true;
      body.add(spoiler);
      const thirdBrake = new THREE.Mesh(boxGeo, brakeMat);
      thirdBrake.scale.set(.62, .055, .05);
      thirdBrake.position.set(0, 1.235, -2.245);
      body.add(thirdBrake);

      const rearWindow = new THREE.Mesh(boxGeo, glassMat);
      rearWindow.scale.set(1.3, .34, .05);
      rearWindow.position.set(0, 1.2, -1.095);
      body.add(rearWindow);

      for (const x of [-.55, .55]) {
        const pipe = new THREE.Mesh(cylinderGeo, rimMat);
        pipe.scale.set(.055, .3, .055);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, .36, -2.36);
        body.add(pipe);
      }
      for (const x of [-.65, .65]) {
        const strut = new THREE.Mesh(boxGeo, signalMat);
        strut.scale.set(.07, .28, .1);
        strut.position.set(x, 1.01, -2.02);
        body.add(strut);
      }

      for (const x of [-1.02, 1.02]) {
        const mirror = new THREE.Mesh(boxGeo, bodyMat);
        mirror.scale.set(.24, .11, .2);
        mirror.position.set(x, 1.1, .55);
        body.add(mirror);
      }
    }

    const wheels = [];
    const frontPivots = [];
    for (const [x, z] of [[-.99, 1.37], [.99, 1.37], [-.99, -1.37], [.99, -1.37]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, .37, z);
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      pivot.add(tire);
      if (hero) {
        const rim = new THREE.Mesh(rimGeo, rimMat);
        pivot.add(rim);
      }
      root.add(pivot);
      wheels.push(tire);
      if (z > 0) frontPivots.push(pivot);
    }

    root.userData = { body, wheels, frontPivots, brakeMat, rearLights, headLights };
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
    speedKmh: 0,
    gear: 'N',
    drifting: false,
    camMode: 0,
    shake: 0,
    vForward: 0,
    lastVForward: 0,
    lateral: 0
  };

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
    const rpm = clamp(speed / 210, 0, 1);
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
    state.drifting = false;
    hero.position.copy(SPAWN);
    hero.rotation.y = 0;
    camera.position.set(SPAWN.x, 4.4, SPAWN.z - 9);
    showToast('Reset · Shibuya Loop');
  }

  window.addEventListener('keydown', (e) => {
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
    if (movingCar) movingCar.hitTimer = 1.2;
  }

  function collideTraffic() {
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
      else vF += 15.5 * dt * (1 - Math.min(1, vF / 58));
    }
    if (brake) {
      if (vF > .5) vF -= 27 * dt;
      else vF -= 8 * dt;
    }
    if (handbrake) vF -= Math.sign(vF) * 11 * dt;

    vF -= vF * .045 * dt;
    vF -= Math.sign(vF) * .32 * dt;
    vF = clamp(vF, -12, 58);

    const maxSteer = .56 / (1 + Math.abs(vF) * .038);
    const targetSteer = steerInput * maxSteer;
    state.steer += (targetSteer - state.steer) * Math.min(1, 9 * dt);

    const baseYaw = Math.abs(vF) > .55
      ? (vF / 2.7) * Math.tan(state.steer) * (handbrake ? 1.25 : 1)
      : 0;
    const maxYaw = (handbrake ? 15 : 9.5) / Math.max(2.5, Math.abs(vF));
    const yaw = clamp(baseYaw, -maxYaw, maxYaw);
    state.heading += yaw * dt;

    const oldVel = new THREE.Vector2(
      fwd.x * vF + right.x * vL,
      fwd.y * vF + right.y * vL
    );
    const grip = handbrake ? 1.65 : 8.8;
    const newFwd = new THREE.Vector2(Math.sin(state.heading), Math.cos(state.heading));
    const newRight = new THREE.Vector2(-Math.cos(state.heading), Math.sin(state.heading));
    let nvF = oldVel.dot(newFwd);
    let nvL = oldVel.dot(newRight);
    nvL *= Math.exp(-grip * dt);
    if (handbrake) nvF *= Math.exp(-.55 * dt);
    state.vel.set(newFwd.x * nvF + newRight.x * nvL, newFwd.y * nvF + newRight.y * nvL);
    state.pos.x += state.vel.x * dt;
    state.pos.z += state.vel.y * dt;

    collideBlocks();
    collideTraffic();

    state.vForward = state.vel.dot(newFwd);
    state.lateral = nvL;
    state.speedKmh = Math.abs(state.vForward) * 3.6;
    state.drifting = Math.abs(nvL) > 2 && state.speedKmh > 22 && Math.abs(state.vForward) > 3;
    state.gear = state.vForward > .5 ? 'D' : (state.vForward < -.5 ? 'R' : 'N');

    const accel = (vF - state.lastVForward) / Math.max(dt, .001);
    state.lastVForward = vF;
    const targetRoll = clamp(yaw * vF * .005 + nvL * .011, -.085, .085);
    const targetPitch = clamp(-accel * .0017, -.045, .045);
    state.bodyRoll += (targetRoll - state.bodyRoll) * Math.min(1, 7 * dt);
    state.bodyPitch += (targetPitch - state.bodyPitch) * Math.min(1, 7 * dt);

    state.wheelSpin += vF / .36 * dt;

    hero.position.set(state.pos.x, 0, state.pos.z);
    hero.rotation.y = state.heading;
    const body = hero.userData.body;
    body.rotation.z = state.bodyRoll;
    body.rotation.x = state.bodyPitch;
    for (const wheel of hero.userData.wheels) wheel.rotation.x = state.wheelSpin;
    for (const pivot of hero.userData.frontPivots) pivot.rotation.y = state.steer;
    hero.userData.brakeMat.emissiveIntensity = (brake || handbrake) ? 2.6 : .35;

    state.shake *= Math.exp(-5 * dt);
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
      desiredCamera.y = 1.24;
      lookTarget.copy(state.pos).addScaledVector(fwd3, 30);
      lookTarget.y = 1.25;
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
      desiredCamera.y = height;
      camera.position.lerp(desiredCamera, 1 - Math.exp(-5.5 * dt));
      lookTarget.copy(state.pos).addScaledVector(fwd3, 6 + speed * .075);
      lookTarget.y = 1.15;
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
    sunLight.position.set(state.pos.x - 110, 170, state.pos.z - 70);
    sunLight.target.position.set(state.pos.x, 0, state.pos.z);
    sunLight.target.updateMatrixWorld();
  }

  // --- HUD, minimap, toast --------------------------------------------------
  const speedEl = document.getElementById('speed');
  const gearEl = document.getElementById('gear');
  const fpsEl = document.getElementById('fps');
  const rpmEl = document.getElementById('rpm-fill');
  const driftEl = document.getElementById('drift');
  const toastEl = document.getElementById('toast');
  const minimap = document.getElementById('minimap');
  const mm = minimap.getContext('2d');
  let toastTimer = 0;
  let minimapTimer = 0;
  let fpsFrames = 0;
  let fpsWindowStart = performance.now();

  function showToast(message, duration = 2400) {
    toastEl.textContent = message;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), duration);
  }

  function updateHud() {
    speedEl.textContent = Math.round(state.speedKmh);
    gearEl.textContent = state.gear;
    rpmEl.style.width = `${Math.min(100, state.speedKmh / 2.1)}%`;
    driftEl.classList.toggle('on', state.drifting);
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
  showToast('WASD to drive · SPACE to drift · C camera · M sound', 5200);
  animate();

  window.__forza = { state, blocks, traffic, camera, renderer, scene };
</script>
