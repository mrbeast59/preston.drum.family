import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   NIPPON OPEN ROAD
   An original, procedural Japan-inspired open-world driving sandbox.
   Everything in this file is generated: terrain, roads, city, trees, cars,
   signs, activities and weather. There are no external map or model assets.
--------------------------------------------------------------------------- */

const CONFIG = {
  worldSize: 2400,
  chunkSize: 300,
  terrainNearSegments: 24,
  terrainFarSegments: 7,
  lodNearDistance: 740,
  seaLevel: 0,
  hillScale: 1,
  city: { x: -520, z: 380, width: 460, depth: 440, elevation: 8, blend: 108 },
  spawn: { x: -620, z: 280, heading: Math.PI / 2 },
  dayLengthSeconds: 720,
  weatherCycleSeconds: 150,
  stuntDensity: 1,
  treeDensity: 1,
  drawDistance: 1750,
  car: {
    power: 52,
    reversePower: 16,
    brake: 52,
    drag: 0.025,
    maxSpeed: 88,
    steer: 1.8,
    wheelbase: 2.8,
    grip: 11.2,
    driftGrip: 2.4,
    handbrakeGrip: 0.72
  },
  surfaces: {
    asphalt: { grip: 1.0, drag: 0.32, label: 'Asphalt' },
    dirt: { grip: 0.7, drag: 1.1, label: 'Dirt' },
    gravel: { grip: 0.8, drag: 0.8, label: 'Gravel' },
    snow: { grip: 0.52, drag: 0.75, label: 'Snow' },
    grass: { grip: 0.62, drag: 1.3, label: 'Grass' },
    sand: { grip: 0.58, drag: 1.5, label: 'Sand' },
    water: { grip: 0.4, drag: 5.0, label: 'Water' }
  }
};
window.JAPAN_CONFIG = CONFIG;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const fract = (v) => v - Math.floor(v);

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const worldRandom = mulberry32(0x51a7c0de);
const rand = (a = 0, b = 1) => a + worldRandom() * (b - a);
const pick = (a) => a[(worldRandom() * a.length) | 0];

function hash2(ix, iz) {
  let h = Math.imul(ix | 0, 374761393) + Math.imul(iz | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function noise2(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uz);
}

function fbm(x, z, octaves = 4) {
  let sum = 0;
  let amp = 0.55;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, z * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

function ridged(x, z, octaves = 4) {
  let sum = 0;
  let amp = 0.6;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2(x * freq, z * freq) * 2 - 1);
    sum += n * n * amp;
    norm += amp;
    amp *= 0.52;
    freq *= 2.04;
  }
  return sum / norm;
}

// ---------------------------------------------------------------------------
// DOM / renderer
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const ui = {
  area: $('areaName'),
  clock: $('clock'),
  weather: $('weatherLabel'),
  weatherShort: $('weatherShort'),
  altitude: $('altitude'),
  speed: $('speed'),
  gear: $('gear'),
  rpm: $('rpmFill'),
  fps: $('fps'),
  score: $('score'),
  rank: $('scoreRank'),
  combo: $('combo'),
  stunts: $('stuntCount'),
  minimap: $('minimap'),
  compass: $('compass'),
  eventCard: $('eventCard'),
  eventKicker: $('eventKicker'),
  eventName: $('eventName'),
  eventDetail: $('eventDetail'),
  eventBar: $('eventBar'),
  prompt: $('prompt'),
  promptText: $('promptText'),
  toast: $('toast'),
  mapPanel: $('mapPanel'),
  mapCanvas: $('mapCanvas'),
  mapClose: $('mapClose'),
  loading: $('loading'),
  loadFill: $('loadFill'),
  loadStatus: $('loadStatus'),
  drift: $('drift'),
  rainFlash: $('rainFlash')
};

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fb8c4, 230, CONFIG.drawDistance);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.12, 6000);
camera.position.set(CONFIG.spawn.x, 8, CONFIG.spawn.z - 12);

const world = new THREE.Group();
scene.add(world);

// ---------------------------------------------------------------------------
// Textures
// ---------------------------------------------------------------------------
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
  tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return tex;
}

function makeLabelTexture(text, fg = '#ffffff', bg = 'rgba(8,14,18,.9)', accent = '#ff4b3e') {
  return makeTexture(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = bg;
    g.fillRect(2, 2, w - 4, h - 4);
    g.strokeStyle = accent;
    g.lineWidth = 5;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = fg;
    g.font = '800 55px Segoe UI, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 3);
  });
}

const asphaltTex = makeTexture(256, 256, (g) => {
  g.fillStyle = '#343a3d';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 40 + Math.random() * 35;
    g.fillStyle = `rgba(${v},${v + 1},${v + 2},${0.3 + Math.random() * 0.5})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.2, 1.2);
  }
  g.strokeStyle = 'rgba(10,12,13,.22)';
  g.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    g.moveTo(Math.random() * 256, Math.random() * 256);
    g.lineTo(Math.random() * 256, Math.random() * 256);
    g.stroke();
  }
});

const dirtTex = makeTexture(256, 256, (g) => {
  g.fillStyle = '#76634e';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6000; i++) {
    const v = Math.random();
    g.fillStyle = v > .6 ? 'rgba(164,137,101,.36)' : 'rgba(58,44,30,.35)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 5, 1 + Math.random() * 3);
  }
  for (let i = 0; i < 22; i++) {
    g.strokeStyle = 'rgba(60,44,30,.18)';
    g.lineWidth = 2 + Math.random() * 3;
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 40, 0, Math.PI * 2);
    g.stroke();
  }
});

const gravelTex = makeTexture(256, 256, (g) => {
  g.fillStyle = '#7a776f';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8500; i++) {
    const v = 80 + Math.random() * 90;
    g.fillStyle = `rgba(${v},${v},${v - 8},${0.25 + Math.random() * 0.6})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
});

const snowTex = makeTexture(256, 256, (g) => {
  g.fillStyle = '#dfe8eb';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = Math.random() > .5 ? 'rgba(255,255,255,.35)' : 'rgba(160,178,184,.2)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 1 + Math.random() * 2);
  }
});

const laneTex = makeTexture(32, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(242,230,195,.92)';
  g.fillRect(w * .32, h * .12, w * .36, h * .46);
});

const whiteLineTex = makeTexture(32, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(242,247,247,.76)';
  g.fillRect(w * .34, h * .08, w * .32, h * .8);
});

const windowTexA = makeTexture(256, 512, (g, w, h) => {
  g.fillStyle = '#18252d';
  g.fillRect(0, 0, w, h);
  for (let y = 18; y < h; y += 27) {
    for (let x = 14; x < w; x += 34) {
      const lit = Math.random() > .58;
      g.fillStyle = lit ? `rgba(255,213,145,${.25 + Math.random() * .6})` : 'rgba(89,131,148,.18)';
      g.fillRect(x, y, 16, 12);
      g.fillStyle = 'rgba(0,0,0,.22)';
      g.fillRect(x, y + 13, 16, 2);
    }
  }
});

const windowTexB = makeTexture(256, 512, (g, w, h) => {
  g.fillStyle = '#263238';
  g.fillRect(0, 0, w, h);
  for (let y = 10; y < h; y += 20) {
    for (let x = 8; x < w; x += 28) {
      const lit = Math.random() > .72;
      g.fillStyle = lit ? `rgba(160,229,255,${.22 + Math.random() * .45})` : 'rgba(14,23,29,.52)';
      g.fillRect(x, y, 19, 11);
    }
  }
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(0, 0, 4, h);
});

const windowTexC = makeTexture(256, 512, (g, w, h) => {
  g.fillStyle = '#332b2a';
  g.fillRect(0, 0, w, h);
  for (let y = 16; y < h; y += 35) {
    for (let x = 10; x < w; x += 42) {
      const lit = Math.random() > .64;
      g.fillStyle = lit ? `rgba(255,185,117,${.24 + Math.random() * .5})` : 'rgba(28,29,30,.65)';
      g.fillRect(x, y, 25, 20);
    }
  }
});

const cloudTex = makeTexture(256, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  for (let i = 0; i < 34; i++) {
    const x = 30 + Math.random() * (w - 60);
    const y = h * .55 + Math.random() * 30;
    const r = 18 + Math.random() * 44;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,.34)');
    grad.addColorStop(.55, 'rgba(255,255,255,.16)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
});

const shadowTex = makeTexture(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const grad = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(0,0,0,.55)');
  grad.addColorStop(.58, 'rgba(0,0,0,.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
});

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------
const CITY = CONFIG.city;
const WORLD_HALF = CONFIG.worldSize / 2;

function cityMaskAt(x, z) {
  const dx = Math.abs(x - CITY.x) - CITY.width / 2;
  const dz = Math.abs(z - CITY.z) - CITY.depth / 2;
  const d = Math.max(dx, dz, 0);
  return 1 - smoothstep(0, CITY.blend, d);
}

function rawHeight(x, z) {
  const coast = smoothstep(-1090, -850, x);
  let h = -16 + coast * 19;

  const inland = smoothstep(-760, 260, x);
  h += inland * 38;

  const mountain = smoothstep(120, 1180, x);
  h += mountain * mountain * 210;

  const ridge = ridged(x * .0031 + 4.7, z * .0031 - 2.2, 4);
  h += ridge * ridge * 92 * mountain;

  h += (fbm(x * .0062 + 11, z * .0062 - 4, 4) - .5) * 25;
  h += (fbm(x * .018 - 2, z * .018 + 8, 3) - .5) * 5.2;

  // Two broad massifs keep the highlands from reading as a single ramp.
  h += Math.exp(-(((x - 735) ** 2 + (z - 370) ** 2) / (2 * 245 ** 2))) * 64 * mountain;
  h += Math.exp(-(((x - 940) ** 2 + (z + 470) ** 2) / (2 * 290 ** 2))) * 82 * mountain;

  const valley = ridged(x * .0042 - 3, z * .0042 + 8, 3);
  h -= (1 - valley) * 22 * mountain;

  return h * CONFIG.hillScale;
}

function terrainHeight(x, z) {
  let h = rawHeight(x, z);
  const city = cityMaskAt(x, z);
  if (city > 0) {
    const cityDetail = (fbm(x * .05, z * .05, 2) - .5) * 0.5;
    h = lerp(h, CITY.elevation + cityDetail, city * .985);
  }
  // Harbor apron: a low, flat working waterfront.
  const harborX = smoothstep(-875, -800, x) * (1 - smoothstep(-785, -715, x));
  const harborZ = smoothstep(170, 250, z) * (1 - smoothstep(550, 640, z));
  h = lerp(h, 2.2, harborX * harborZ * .72 * (1 - cityMaskAt(x, z) * .9));
  return h;
}

function terrainSlope(x, z) {
  const e = 3.5;
  const dx = (terrainHeight(x + e, z) - terrainHeight(x - e, z)) / (2 * e);
  const dz = (terrainHeight(x, z + e) - terrainHeight(x, z - e)) / (2 * e);
  return Math.sqrt(dx * dx + dz * dz);
}

function terrainNormal(x, z, target = new THREE.Vector3()) {
  const e = 4;
  const hL = terrainHeight(x - e, z);
  const hR = terrainHeight(x + e, z);
  const hD = terrainHeight(x, z - e);
  const hU = terrainHeight(x, z + e);
  return target.set(hL - hR, 2 * e, hD - hU).normalize();
}

const COLORS = {
  sand: new THREE.Color(0xc8b88e),
  wetSand: new THREE.Color(0x9a8b6e),
  grass: new THREE.Color(0x70884e),
  grassDark: new THREE.Color(0x4c6a3d),
  forest: new THREE.Color(0x345b3e),
  rice: new THREE.Color(0x6f9955),
  rock: new THREE.Color(0x686a61),
  rockDark: new THREE.Color(0x4e5350),
  snow: new THREE.Color(0xe9eff0),
  snowShade: new THREE.Color(0xc9d6da),
  city: new THREE.Color(0x5c6461),
  cityLight: new THREE.Color(0x6b726e)
};

function terrainColor(x, z, h) {
  const moisture = fbm(x * .004 + 22, z * .004 - 9, 3);
  const patch = fbm(x * .016 - 3, z * .016 + 12, 2);
  const city = cityMaskAt(x, z);
  let c;
  if (h < 1.2) {
    c = COLORS.wetSand.clone();
  } else if (h < 4.8) {
    c = COLORS.sand.clone().lerp(COLORS.grass, smoothstep(1.2, 5, h));
  } else if (h > 188) {
    c = COLORS.snow.clone();
  } else if (h > 98) {
    c = COLORS.rock.clone().lerp(COLORS.forest, moisture * .42);
  } else {
    c = COLORS.grass.clone().lerp(COLORS.forest, moisture * .55);
    if (patch > .6 && h < 45) c.lerp(COLORS.rice, .32);
  }

  if (h > 145) c.lerp(COLORS.rockDark, smoothstep(145, 195, h) * .34);
  if (h > 168) c.lerp(COLORS.snow, smoothstep(168, 235, h) * .95);
  if (city > 0) c.lerp(COLORS.city, city * (patch > .4 ? .9 : .72));
  c.offsetHSL(0, 0, (patch - .5) * .035);
  return c;
}

function regionAt(x, z, h = terrainHeight(x, z)) {
  if (x < -830 && h < 8) return 'Minato Harbor';
  if (cityMaskAt(x, z) > .62) return 'Neon Ward';
  if (h > 190) return 'Yuki Alpine';
  if (h > 108) return 'Kurohana Pass';
  if (h > 52) return 'Kaze Hills';
  if (z < 40 && x > -300) return 'Hoshino Plains';
  if (z > 570 && x < -200) return 'Sakura Suburbs';
  if (x > 120 && h < 90) return 'Toge Foothills';
  return 'Hoshino Plains';
}

const terrainMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: .97,
  metalness: .02
});

function makeChunkGeometry(cx, cz, segments) {
  const geo = new THREE.PlaneGeometry(CONFIG.chunkSize, CONFIG.chunkSize, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = cx + pos.getX(i);
    const z = cz + pos.getZ(i);
    const rawH = terrainHeight(x, z);
    const h = visualTerrainHeight(x, z);
    pos.setY(i, h);
    const c = terrainColor(x, z, rawH);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

const terrainChunks = [];
const terrainGroup = new THREE.Group();
world.add(terrainGroup);

function buildTerrainChunks() {
  const count = Math.ceil(CONFIG.worldSize / CONFIG.chunkSize);
  for (let iz = 0; iz < count; iz++) {
    for (let ix = 0; ix < count; ix++) {
      const cx = -WORLD_HALF + CONFIG.chunkSize / 2 + ix * CONFIG.chunkSize;
      const cz = -WORLD_HALF + CONFIG.chunkSize / 2 + iz * CONFIG.chunkSize;
      const high = new THREE.Mesh(makeChunkGeometry(cx, cz, CONFIG.terrainNearSegments), terrainMaterial);
      const low = new THREE.Mesh(makeChunkGeometry(cx, cz, CONFIG.terrainFarSegments), terrainMaterial);
      high.position.set(cx, 0, cz);
      low.position.set(cx, 0, cz);
      high.receiveShadow = true;
      low.receiveShadow = true;
      high.frustumCulled = true;
      low.frustumCulled = true;
      low.visible = false;
      high.userData.chunk = { x: cx, z: cz };
      terrainGroup.add(high, low);
      terrainChunks.push({ x: cx, z: cz, high, low });
    }
  }
}

let lodTimer = 0;
function updateTerrainLOD(dt, force = false) {
  lodTimer -= dt;
  if (!force && lodTimer > 0) return;
  lodTimer = .3;
  for (const c of terrainChunks) {
    const dx = camera.position.x - c.x;
    const dz = camera.position.z - c.z;
    const near = Math.sqrt(dx * dx + dz * dz) < CONFIG.lodNearDistance;
    c.high.visible = near;
    c.low.visible = !near;
  }
}

// Ocean
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x28647a,
  roughness: .24,
  metalness: .25,
  transparent: true,
  opacity: .88
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(6200, 6200), waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.07;
world.add(water);

// ---------------------------------------------------------------------------
// Sky / sun / clouds
// ---------------------------------------------------------------------------
const skyUniforms = {
  topColor: { value: new THREE.Color(0x3d6fa5) },
  horizonColor: { value: new THREE.Color(0xf4c38d) },
  sunColor: { value: new THREE.Color(0xffd9a0) },
  sunDirection: { value: new THREE.Vector3(.6, .3, .2) },
  night: { value: 0 }
};

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(3400, 32, 18),
  new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      uniform float night;
      varying vec3 vWorld;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 dir = normalize(vWorld - cameraPosition);
        float h = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(horizonColor, topColor, pow(h, .58));
        float solar = max(dot(dir, normalize(sunDirection)), 0.0);
        col = mix(col, sunColor, pow(solar, 7.0) * .28);
        col += sunColor * pow(solar, 750.0) * 1.7;

        float band = smoothstep(.015, .22, dir.y);
        vec2 starUv = vec2(atan(dir.z, dir.x) * 12.0, dir.y * 48.0);
        float star = step(.992, hash21(floor(starUv))) * band * night;
        col += vec3(.8, .88, 1.0) * star * .9;

        float horizonGlow = pow(1.0 - h, 6.0) * .14;
        col += sunColor * horizonGlow;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  })
);
scene.add(sky);

const sunLight = new THREE.DirectionalLight(0xffe2b2, 2.1);
sunLight.position.set(-400, 550, 220);
scene.add(sunLight);
const hemisphere = new THREE.HemisphereLight(0xc8e4f2, 0x3c3a2e, 1.1);
scene.add(hemisphere);
const ambient = new THREE.AmbientLight(0x2c3740, .32);
scene.add(ambient);
const fillLight = new THREE.DirectionalLight(0x9fc0d1, .38);
fillLight.position.set(520, 360, -380);
scene.add(fillLight);

const cloudGroup = new THREE.Group();
for (let i = 0; i < 24; i++) {
  const mat = new THREE.SpriteMaterial({
    map: cloudTex,
    color: 0xffffff,
    transparent: true,
    opacity: rand(.12, .27),
    depthWrite: false,
    fog: true
  });
  const s = new THREE.Sprite(mat);
  s.position.set(rand(-1250, 1250), rand(250, 420), rand(-1250, 1250));
  s.scale.set(rand(120, 300), rand(35, 85), 1);
  cloudGroup.add(s);
}
scene.add(cloudGroup);

// ---------------------------------------------------------------------------
// Weather particles
// ---------------------------------------------------------------------------
const weatherState = {
  type: 'clear',
  intensity: 0,
  cycle: 0,
  rain: null,
  snow: null,
  petals: null
};

function makePoints(count, color, size, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = rand(-70, 70);
    positions[i * 3 + 1] = rand(0, 45);
    positions[i * 3 + 2] = rand(-70, 70);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
    fog: true
  });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  p.visible = false;
  scene.add(p);
  return p;
}

weatherState.rain = makePoints(1100, 0xa8c8dc, .26, .62);
weatherState.snow = makePoints(900, 0xf4fbff, .48, .9);
weatherState.petals = makePoints(260, 0xffb8ca, .32, .75);

// ---------------------------------------------------------------------------
// Roads
// ---------------------------------------------------------------------------
const roadGroup = new THREE.Group();
world.add(roadGroup);
const roads = [];
const roadSegments = [];
const elevatedRoads = [];

const sidewalkTex = makeTexture(128, 128, (g) => {
  g.fillStyle = '#b4b1a9';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(40,43,43,.2)';
  g.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, 128); g.stroke();
    g.beginPath(); g.moveTo(0, i * 16); g.lineTo(128, i * 16); g.stroke();
  }
});

const roadMats = {
  asphalt: new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: .93, metalness: .03, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  dirt: new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  gravel: new THREE.MeshStandardMaterial({ map: gravelTex, roughness: .98, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  snow: new THREE.MeshStandardMaterial({ map: snowTex, roughness: .82, metalness: .01, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
};
const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: .92, metalness: .02, side: THREE.DoubleSide });
const laneMat = new THREE.MeshBasicMaterial({ map: laneTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
const edgeLineMat = new THREE.MeshBasicMaterial({ map: whiteLineTex, transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide });
const dirtRutMat = new THREE.MeshBasicMaterial({ color: 0x4c3c2b, transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide });

function makeRoadSamples(coords, closed = false, spacing = 9) {
  const curve = new THREE.CatmullRomCurve3(
    coords.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    closed,
    'catmullrom',
    .24
  );
  const length = curve.getLength();
  const count = Math.max(2, Math.ceil(length / spacing));
  const points = curve.getSpacedPoints(count);
  return { points, length, curve };
}

function roadRibbon(points, width, offset, material, lift = .08, uvScale = 16, fixedY = null, bedHeights = null) {
  const positions = [];
  const uvs = [];
  const indices = [];
  let distance = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const nx = -tz;
    const nz = tx;
    const cx = p.x + nx * offset;
    const cz = p.z + nz * offset;
    if (i > 0) distance += p.distanceTo(prev);
    const lx = cx + nx * width / 2;
    const lz = cz + nz * width / 2;
    const rx = cx - nx * width / 2;
    const rz = cz - nz * width / 2;
    let ly;
    let ry;
    if (fixedY != null) {
      ly = fixedY + lift;
      ry = fixedY + lift;
    } else if (bedHeights) {
      ly = bedHeights[i] + lift;
      ry = ly;
    } else {
      ly = terrainHeight(lx, lz) + lift;
      ry = terrainHeight(rx, rz) + lift;
    }
    positions.push(lx, ly, lz, rx, ry, rz);
    uvs.push(0, distance / uvScale, 1, distance / uvScale);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = false;
  mesh.frustumCulled = true;
  roadGroup.add(mesh);
  return mesh;
}

function computeRoadBed(points) {
  const raw = points.map((p) => terrainHeight(p.x, p.z));
  return raw.map((h, i) => {
    const a = raw[Math.max(0, i - 1)];
    const b = raw[Math.min(raw.length - 1, i + 1)];
    return a * .25 + h * .5 + b * .25;
  });
}

function addRoad(name, coords, width, type = 'asphalt', options = {}) {
  const { closed = false, sidewalk = false, lift = .1, spacing = 9 } = options;
  const { points, length } = makeRoadSamples(coords, closed, spacing);
  const bed = computeRoadBed(points);
  if (sidewalk) {
    roadRibbon(points, width + 9, 0, sidewalkMat, .035, 12);
  }
  const mesh = roadRibbon(points, width, 0, roadMats[type], lift, 16, null, bed);
  mesh.userData.road = name;

  if (type === 'asphalt') {
    roadRibbon(points, .26, 0, laneMat, lift + .012, 13, null, bed);
    roadRibbon(points, .15, width / 2 - .7, edgeLineMat, lift + .012, 14, null, bed);
    roadRibbon(points, .15, -width / 2 + .7, edgeLineMat, lift + .012, 14, null, bed);
  } else if (type === 'dirt') {
    roadRibbon(points, .48, width * .22, dirtRutMat, lift + .012, 11, null, bed);
    roadRibbon(points, .48, -width * .22, dirtRutMat, lift + .012, 11, null, bed);
  } else if (type === 'snow') {
    roadRibbon(points, .18, width / 2 - .55, edgeLineMat, lift + .012, 12, null, bed);
    roadRibbon(points, .18, -width / 2 + .55, edgeLineMat, lift + .012, 12, null, bed);
  }

  const road = { name, points, width, type, length, closed };
  roads.push(road);
  const segs = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const seg = { ax: a.x, az: a.z, bx: b.x, bz: b.z, width, type, name, ay: bed[i - 1] + lift, by: bed[i] + lift };
    segs.push(seg);
    roadSegments.push(seg);
  }
  road.segments = segs;
  road.bed = bed;
  return road;
}

function nearestRoad(x, z, padding = 0) {
  let best = null;
  for (let i = 0; i < roadSegments.length; i++) {
    const s = roadSegments[i];
    const vx = s.bx - s.ax;
    const vz = s.bz - s.az;
    const len2 = vx * vx + vz * vz || 1;
    const t = clamp(((x - s.ax) * vx + (z - s.az) * vz) / len2, 0, 1);
    const px = s.ax + vx * t;
    const pz = s.az + vz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d <= s.width / 2 + padding && (!best || d < best.dist)) {
      best = { dist: d, width: s.width, type: s.type, name: s.name, x: px, z: pz, angle: Math.atan2(vx, vz), y: s.ay + (s.by - s.ay) * t };
    }
  }
  return best;
}

let roadSpatialIndex = null;
function buildRoadSpatialIndex() {
  const cell = 28;
  const cells = new Map();
  for (const s of roadSegments) {
    const margin = s.width / 2 + 20;
    const minX = Math.floor((Math.min(s.ax, s.bx) - margin) / cell);
    const maxX = Math.floor((Math.max(s.ax, s.bx) + margin) / cell);
    const minZ = Math.floor((Math.min(s.az, s.bz) - margin) / cell);
    const maxZ = Math.floor((Math.max(s.az, s.bz) + margin) / cell);
    for (let ix = minX; ix <= maxX; ix++) {
      for (let iz = minZ; iz <= maxZ; iz++) {
        const key = `${ix}:${iz}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(s);
      }
    }
  }
  roadSpatialIndex = { cell, cells };
}

function roadShelfAt(x, z) {
  if (!roadSpatialIndex) buildRoadSpatialIndex();
  const { cell, cells } = roadSpatialIndex;
  const ix = Math.floor(x / cell);
  const iz = Math.floor(z / cell);
  let best = null;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const list = cells.get(`${ix + dx}:${iz + dz}`);
      if (!list) continue;
      for (const s of list) {
        const vx = s.bx - s.ax;
        const vz = s.bz - s.az;
        const len2 = vx * vx + vz * vz || 1;
        const t = clamp(((x - s.ax) * vx + (z - s.az) * vz) / len2, 0, 1);
        const px = s.ax + vx * t;
        const pz = s.az + vz * t;
        const d = Math.hypot(x - px, z - pz);
        if (!best || d < best.dist) best = { dist: d, width: s.width, y: s.ay + (s.by - s.ay) * t };
      }
    }
  }
  return best;
}

function visualTerrainHeight(x, z) {
  const h = terrainHeight(x, z);
  const road = roadShelfAt(x, z);
  if (!road) return h;
  const edge = road.width / 2 + 1.8;
  const blend = 9;
  if (road.dist > edge + blend) return h;
  const shelf = road.y - .09;
  if (road.dist <= edge) return shelf;
  return lerp(shelf, h, smoothstep(edge, edge + blend, road.dist));
}

// City streets -----------------------------------------------------------------
const cityRoadZ = [180, 280, 380, 480, 580];
const cityRoadX = [-700, -600, -500, -400, -300];
for (const z of cityRoadZ) {
  addRoad('Neon Ward street', [[-720, z], [-280, z]], z === 380 ? 18 : 14, 'asphalt', { sidewalk: true, spacing: 12 });
}
for (const x of cityRoadX) {
  addRoad('Neon Ward street', [[x, 150], [x, 610]], x === -500 ? 18 : 14, 'asphalt', { sidewalk: true, spacing: 12 });
}
addRoad('Shrine Lane', [[-720, 640], [-650, 690], [-520, 700], [-400, 660]], 10, 'asphalt', { sidewalk: true });

// Coast, skyway and connectors -------------------------------------------------
addRoad('Minato Coast Highway', [[-800, 1120], [-790, 800], [-805, 500], [-780, 220], [-810, -80], [-825, -380], [-800, -700], [-805, -1020], [-780, -1120]], 18, 'asphalt');
addRoad('Harbor Link', [[-720, 380], [-780, 380], [-814, 380]], 16, 'asphalt');
addRoad('Honshu Skyway', [[-815, -780], [-790, -520], [-760, -260], [-650, -150], [-500, -105], [-340, -70], [-160, 0], [20, 65], [170, 140], [280, 230]], 20, 'asphalt');
addRoad('Neon Ward connector', [[-500, 150], [-500, 25], [-500, -105]], 16, 'asphalt', { sidewalk: true });
addRoad('Sakura Avenue', [[-280, 380], [-80, 425], [120, 390], [280, 300]], 14, 'asphalt');
addRoad('Foothill road', [[-300, 580], [-110, 650], [80, 620], [220, 510], [300, 260]], 12, 'asphalt');
addRoad('Minato south road', [[-500, 580], [-450, 690], [-260, 760]], 13, 'asphalt');

// The switchback climb. Six hairpins, then a short snow spur.
addRoad('Kurohana Pass', [
  [180, 600], [280, 420], [360, 240], [420, 60], [360, -100], [260, -160],
  [340, -260], [440, -200], [520, -40], [580, 140], [540, 320], [460, 420],
  [540, 520], [660, 440], [760, 280], [820, 100], [780, -80], [700, -200],
  [800, -320], [920, -260], [1000, -120], [1040, 60], [1000, 240], [920, 360],
  [1000, 480], [1100, 400], [1140, 260]
], 12, 'asphalt', { spacing: 8 });
addRoad('Yuki Pass', [[1140, 260], [1120, 150], [1060, 70], [1000, 20]], 9, 'snow', { spacing: 8 });

// Farm, rally and suburb roads -------------------------------------------------
addRoad('Hoshino farm loop', [[-320, -140], [-120, -250], [80, -180], [160, 0], [40, 150], [-150, 100], [-320, -140]], 8, 'gravel', { closed: true, spacing: 8 });
addRoad('Rice paddy lanes', [[-260, 40], [-260, 260], [-200, 380]], 7, 'gravel');
addRoad('Hoshino rally', [[-240, 760], [20, 840], [260, 740], [330, 560], [160, 480], [-80, 610], [-240, 760]], 10, 'dirt', { closed: true, spacing: 8 });
addRoad('Sakura suburb loop', [[-740, 640], [-610, 720], [-440, 730], [-400, 880], [-570, 940], [-740, 840], [-740, 640]], 10, 'gravel', { closed: true });
addRoad('Kai hill climb', [[-80, 880], [160, 950], [380, 900], [470, 740], [400, 580], [180, 540]], 10, 'gravel');

// Elevated city expressways (visual multi-level roads).
function addElevatedRoad(name, coords, width, height, level) {
  const { points } = makeRoadSamples(coords, false, 10);
  const y = CITY.elevation + height;
  roadRibbon(points, width, 0, roadMats.asphalt, .12, 14, y);
  roadRibbon(points, .22, 0, laneMat, .14, 11, y);
  roadRibbon(points, .14, width / 2 - .6, edgeLineMat, .14, 12, y);
  roadRibbon(points, .14, -width / 2 + .6, edgeLineMat, .14, 12, y);
  for (let i = 0; i < points.length; i += 2) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len;
    const nz = tx / len;
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.22, 1.05, 3.2), new THREE.MeshStandardMaterial({ color: 0x8a9498, roughness: .45, metalness: .55 }));
      rail.position.set(p.x + nx * side * (width / 2 - .25), y + .65, p.z + nz * side * (width / 2 - .25));
      rail.rotation.y = Math.atan2(tx, tz);
      roadGroup.add(rail);
    }
    if (i > 0 && i % 3 === 0) {
      const isNorthSouth = name === 'Neon Skyway';
      const nearCross = isNorthSouth
        ? cityRoadZ.some((roadZ) => Math.abs(p.z - roadZ) < 14)
        : cityRoadX.some((roadX) => Math.abs(p.x - roadX) < 14);
      if (nearCross) continue;
      const colH = y - CITY.elevation;
      const colMat = new THREE.MeshStandardMaterial({ color: 0x707978, roughness: .82 });
      for (const side of [-1, 1]) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(1.6, colH, 1.6), colMat);
        col.position.set(
          p.x + nx * side * (width / 2 + 1.4),
          CITY.elevation + colH / 2,
          p.z + nz * side * (width / 2 + 1.4)
        );
        roadGroup.add(col);
      }
    }
  }
  elevatedRoads.push({ name, points, width, height, level, type: 'asphalt' });
}

addElevatedRoad('Neon Skyway', [[-500, 120], [-500, 260], [-500, 380], [-500, 500], [-500, 640]], 17, 16, 1);
addElevatedRoad('Kai Loop Overpass', [[-760, 380], [-640, 380], [-500, 380], [-360, 380], [-260, 380]], 17, 28, 2);

// ---------------------------------------------------------------------------
// City
// ---------------------------------------------------------------------------
const treeData = { sakura: [], maple: [], cedar: [], snowpine: [] };
const pendingShrines = [];
function addTreeInstanceLater(x, z, scale = 1, type = 'sakura') {
  if (!treeData[type]) treeData[type] = [];
  treeData[type].push({ x, z, scale, rot: rand(0, Math.PI * 2) });
}

const cityGroup = new THREE.Group();
world.add(cityGroup);
const colliders = [];
const buildingMaterials = [
  new THREE.MeshStandardMaterial({ map: windowTexA, color: 0xffffff, emissive: 0x5d3d1e, emissiveIntensity: .14, roughness: .82, metalness: .08 }),
  new THREE.MeshStandardMaterial({ map: windowTexB, color: 0xffffff, emissive: 0x12384a, emissiveIntensity: .12, roughness: .74, metalness: .16 }),
  new THREE.MeshStandardMaterial({ map: windowTexC, color: 0xffffff, emissive: 0x5f331c, emissiveIntensity: .1, roughness: .86, metalness: .05 })
];
const roofMat = new THREE.MeshStandardMaterial({ color: 0x343b3d, roughness: .75, metalness: .2 });
const poleMat = new THREE.MeshStandardMaterial({ color: 0x353d3f, roughness: .52, metalness: .55 });
const neonMats = [
  new THREE.MeshBasicMaterial({ color: 0xff466f, toneMapped: false }),
  new THREE.MeshBasicMaterial({ color: 0x67e8ff, toneMapped: false }),
  new THREE.MeshBasicMaterial({ color: 0xffd166, toneMapped: false }),
  new THREE.MeshBasicMaterial({ color: 0xc09bff, toneMapped: false })
];
const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3724, roughness: .88 });
const vermilionMat = new THREE.MeshStandardMaterial({ color: 0xc73c2d, roughness: .7, metalness: .05 });
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x807f76, roughness: .94 });
const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x2d3437, roughness: .78, metalness: .16 });
const windowLitMat = new THREE.MeshStandardMaterial({ color: 0xffe5b0, emissive: 0xffc878, emissiveIntensity: .9, roughness: .4 });
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function addBuilding(x, z, w, d, h, materialIndex) {
  const base = terrainHeight(x, z);
  const mat = buildingMaterials[materialIndex % buildingMaterials.length];
  const body = new THREE.Mesh(boxGeo, mat);
  body.scale.set(w, h, d);
  body.position.set(x, base + h / 2, z);
  body.castShadow = false;
  body.receiveShadow = false;
  cityGroup.add(body);
  const roof = new THREE.Mesh(boxGeo, roofMat);
  roof.scale.set(w + 1.4, 1.4, d + 1.4);
  roof.position.set(x, base + h + .7, z);
  cityGroup.add(roof);
  if (h > 55) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, rand(5, 11), 5), poleMat);
    mast.position.set(x + rand(-w * .25, w * .25), base + h + 4, z + rand(-d * .25, d * .25));
    cityGroup.add(mast);
  }
  colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, kind: 'building' });

  if (h > 24 && worldRandom() < .32) {
    const signText = pick(['ネオン', 'カイ', '夜', '走', '港', '山', 'OPEN', 'KAZE']);
    const signTex = makeLabelTexture(signText, '#fff8e8', 'rgba(10,14,18,.92)', pick(['#ff4b3e', '#66e6ff', '#ffd166']));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * .55, 12), 3.1), new THREE.MeshBasicMaterial({ map: signTex, transparent: true, toneMapped: false }));
    sign.position.set(x, base + Math.min(h - 5, rand(12, 34)), z + d / 2 + .08);
    cityGroup.add(sign);
  }
}

function addPark(x, z) {
  const base = terrainHeight(x, z);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(74, 74), new THREE.MeshStandardMaterial({ color: 0x4f7447, roughness: 1 }));
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(x, base + .12, z);
  cityGroup.add(lawn);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xb5aa93, roughness: .9 });
  for (const rot of [0, Math.PI / 2]) {
    const path = new THREE.Mesh(new THREE.PlaneGeometry(7, 74), pathMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = rot;
    path.position.set(x, base + .14, z);
    cityGroup.add(path);
  }
  for (let i = 0; i < 9; i++) {
    const tx = x + rand(-31, 31);
    const tz = z + rand(-31, 31);
    addTreeInstanceLater(tx, tz, rand(.7, 1.15), 'sakura');
  }
  pendingShrines.push({ x: x + 18, z: z - 15, scale: .82 });
}

const blockCenters = [];
for (let ix = 0; ix < 4; ix++) {
  for (let iz = 0; iz < 4; iz++) {
    blockCenters.push({ x: -650 + ix * 100, z: 230 + iz * 100 });
  }
}
const parkBlocks = new Set(['-650:530', '-450:230', '-350:530']);
for (const b of blockCenters) {
  if (parkBlocks.has(`${b.x}:${b.z}`)) {
    addPark(b.x, b.z);
    continue;
  }
  const base = terrainHeight(b.x, b.z);
  const counts = worldRandom() < .45 ? 2 : 1;
  for (let i = 0; i < counts; i++) {
    const w = rand(30, 55);
    const d = rand(32, 58);
    const h = rand(22, i === 0 ? 96 : 72);
    const x = b.x + (i === 0 ? -18 : 20) + rand(-4, 4);
    const z = b.z + rand(-8, 8);
    addBuilding(x, z, w, d, h, (worldRandom() * 3) | 0);
  }
  const parklet = worldRandom() < .26;
  if (parklet) addTreeInstanceLater(b.x + rand(-25, 25), b.z + rand(-25, 25), rand(.7, 1), 'sakura');
}

// City gateway + street furniture
function addCityGateway(x, z, rotation = 0) {
  const group = new THREE.Group();
  const beanMat = new THREE.MeshStandardMaterial({ color: 0x5b1f1b, roughness: .55, metalness: .4 });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9, 1.5), beanMat);
    pillar.position.set(side * 13, 4.5, 0);
    group.add(pillar);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(29, 1.3, 1.8), beanMat);
  beam.position.y = 9;
  group.add(beam);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), new THREE.MeshBasicMaterial({ map: makeLabelTexture('NEON WARD', '#fff7df', 'rgba(8,12,15,.92)', '#ff4b3e'), transparent: true, toneMapped: false }));
  sign.position.set(0, 7.1, .95);
  group.add(sign);
  group.position.set(x, terrainHeight(x, z), z);
  group.rotation.y = rotation;
  cityGroup.add(group);
}
addCityGateway(-270, 380, Math.PI / 2);

function addCityLamp(x, z, rot = 0) {
  const base = terrainHeight(x, z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 7, 6), poleMat);
  pole.position.set(x, base + 3.5, z);
  cityGroup.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, .12, .12), poleMat);
  arm.position.set(x, base + 6.8, z);
  arm.rotation.y = rot;
  cityGroup.add(arm);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.1, .16, .4), windowLitMat);
  lamp.position.set(x, base + 6.65, z);
  lamp.rotation.y = rot;
  cityGroup.add(lamp);
}
for (let x = -680; x <= -320; x += 120) {
  addCityLamp(x, 380, Math.PI / 2);
  addCityLamp(x, 280, Math.PI / 2);
}
for (let z = 210; z <= 560; z += 130) {
  addCityLamp(-500, z, 0);
  addCityLamp(-600, z, 0);
}

// Crosswalks at the central intersections.
const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xe5e2d4, transparent: true, opacity: .62 });
for (const z of cityRoadZ) {
  for (const x of cityRoadX) {
    for (let i = -3; i <= 3; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.2, .03, .55), crosswalkMat);
      stripe.position.set(x + i * 1.8, CITY.elevation + .17, z + 10);
      cityGroup.add(stripe);
    }
  }
}

// ---------------------------------------------------------------------------
// Harbor
// ---------------------------------------------------------------------------
const harborGroup = new THREE.Group();
world.add(harborGroup);
const containerMats = [
  new THREE.MeshStandardMaterial({ color: 0xa94435, roughness: .8 }),
  new THREE.MeshStandardMaterial({ color: 0x3b6d7a, roughness: .8 }),
  new THREE.MeshStandardMaterial({ color: 0xb2833d, roughness: .8 }),
  new THREE.MeshStandardMaterial({ color: 0x526c51, roughness: .8 })
];

function addBox(group, x, y, z, w, h, d, mat) {
  const m = new THREE.Mesh(boxGeo, mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  group.add(m);
  return m;
}

for (const z of [300, 430]) {
  addBox(harborGroup, -866, 1.1, z, 110, 1.7, 18, stoneMat);
  for (let i = 0; i < 4; i++) {
    addBox(harborGroup, -895 + i * 22, 2.1, z, 2.2, 3.2, 2.2, poleMat);
  }
}
addBox(harborGroup, -790, 4.5, 320, 42, 8, 58, new THREE.MeshStandardMaterial({ color: 0x69706e, roughness: .86 }));
addBox(harborGroup, -790, 9.2, 320, 39, .8, 55, roofMat);
for (let i = 0; i < 22; i++) {
  const x = -845 + (i % 4) * 12;
  const z = 470 + Math.floor(i / 4) * 10;
  const stack = (i % 3);
  const c = addBox(harborGroup, x, 2 + stack * 2.6, z, 10, 2.5, 4.4, containerMats[i % containerMats.length]);
  c.rotation.y = (i % 2) * .04;
  if (i < 10) colliders.push({ minX: x - 5, maxX: x + 5, minZ: z - 2.2, maxZ: z + 2.2, kind: 'container' });
}

// Gantry cranes.
for (const z of [300, 430]) {
  for (const x of [-870, -820]) {
    addBox(harborGroup, x, 12, z, 1.2, 24, 1.2, poleMat);
  }
  addBox(harborGroup, -845, 24, z, 52, 1.4, 1.4, poleMat);
  addBox(harborGroup, -868, 19, z, 1.2, 1.2, 18, poleMat);
}

// Lighthouse at the harbor mouth.
const lighthouse = new THREE.Group();
const rockBase = new THREE.Mesh(new THREE.DodecahedronGeometry(15, 0), new THREE.MeshStandardMaterial({ color: 0x555b58, roughness: .95 }));
rockBase.scale.y = .42;
rockBase.position.set(-930, 1, 610);
world.add(rockBase);
const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3.2, 16, 10), new THREE.MeshStandardMaterial({ color: 0xe1ded1, roughness: .72 }));
tower.position.set(-930, 9, 610);
world.add(tower);
const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 2.4, 10), windowLitMat);
beacon.position.set(-930, 18, 610);
world.add(beacon);
const cap = new THREE.Mesh(new THREE.ConeGeometry(2.7, 2.3, 10), new THREE.MeshStandardMaterial({ color: 0x293234, metalness: .5, roughness: .5 }));
cap.position.set(-930, 20.3, 610);
world.add(cap);

// A simple container ship silhouette out in the bay.
const ship = new THREE.Group();
addBox(ship, -1030, 2, 390, 150, 8, 28, new THREE.MeshStandardMaterial({ color: 0x293b43, roughness: .7 }));
addBox(ship, -1065, 11, 390, 26, 18, 22, new THREE.MeshStandardMaterial({ color: 0xd7d4c7, roughness: .8 }));
for (let i = 0; i < 10; i++) {
  addBox(ship, -1000 + i * 12, 7, 390, 9, 5, 18, containerMats[i % containerMats.length]);
}
world.add(ship);

// ---------------------------------------------------------------------------
// Suburbs and farm buildings
// ---------------------------------------------------------------------------
function addHouse(x, z, scale = 1, color = 0xd8d1c1) {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: .9 });
  const body = new THREE.Mesh(boxGeo, bodyMat);
  body.scale.set(9 * scale, 5.4 * scale, 10 * scale);
  body.position.y = 2.7 * scale;
  group.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.8 * scale, 3.1 * scale, 4), roofTileMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 6.9 * scale;
  group.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * scale, 2.7 * scale), new THREE.MeshStandardMaterial({ color: 0x46352a, roughness: .9 }));
  door.position.set(0, 1.35 * scale, 5.06 * scale);
  group.add(door);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8 * scale, 1.3 * scale), windowLitMat);
  win.position.set(2.6 * scale, 2.7 * scale, 5.07 * scale);
  group.add(win);
  group.position.set(x, base, z);
  group.rotation.y = rand(-.4, .4);
  world.add(group);
  colliders.push({ minX: x - 5 * scale, maxX: x + 5 * scale, minZ: z - 5.6 * scale, maxZ: z + 5.6 * scale, kind: 'house' });
}

let houseCount = 0;
for (let attempt = 0; attempt < 220 && houseCount < 26; attempt++) {
  const x = rand(-770, -250);
  const z = rand(650, 960);
  if (nearestRoad(x, z, 9)) continue;
  if (cityMaskAt(x, z) > .05) continue;
  addHouse(x, z, rand(.8, 1.2), pick([0xd8d1c1, 0xc9c5b9, 0xb7c1bc, 0xd2c0a8, 0xb2b8c7]));
  houseCount++;
}
for (let attempt = 0; attempt < 140 && houseCount < 38; attempt++) {
  const x = rand(-280, -80);
  const z = rand(460, 700);
  if (nearestRoad(x, z, 8)) continue;
  if (cityMaskAt(x, z) > .1) continue;
  addHouse(x, z, rand(.75, 1.05), pick([0xc9c2b2, 0xb5b1a6, 0xd6c8b1]));
  houseCount++;
}

function addBarn(x, z, rot = 0) {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const barnMat = new THREE.MeshStandardMaterial({ color: 0x7a3a2c, roughness: .93 });
  const body = new THREE.Mesh(boxGeo, barnMat);
  body.scale.set(18, 9, 26);
  body.position.y = 4.5;
  group.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 6, 4), roofTileMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 12;
  group.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(6, 7), new THREE.MeshStandardMaterial({ color: 0x30251e, roughness: .9 }));
  door.position.set(0, 3.5, 13.05);
  group.add(door);
  group.position.set(x, base, z);
  group.rotation.y = rot;
  world.add(group);
  colliders.push({ minX: x - 10, maxX: x + 10, minZ: z - 13, maxZ: z + 13, kind: 'barn' });
  return { x, z, y: base, rot };
}

const farmBarn = addBarn(-150, 30, .2);

// Rice paddies in the flat western plain.
const paddyMat = new THREE.MeshStandardMaterial({ color: 0x719557, roughness: .9 });
const paddyWaterMat = new THREE.MeshStandardMaterial({ color: 0x537a75, roughness: .32, metalness: .1, transparent: true, opacity: .72 });
for (let i = 0; i < 7; i++) {
  const x = -330 + (i % 3) * 56;
  const z = -40 + Math.floor(i / 3) * 48;
  const w = 44;
  const d = 32;
  const base = terrainHeight(x, z);
  const paddy = new THREE.Mesh(new THREE.PlaneGeometry(w, d), paddyMat);
  paddy.rotation.x = -Math.PI / 2;
  paddy.position.set(x, base + .06, z);
  world.add(paddy);
  for (let row = -2; row <= 2; row++) {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w - 5, 3.1), paddyWaterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, base + .075, z + row * 5.5);
    world.add(water);
  }
  for (const side of [-1, 1]) {
    addBox(world, x, base + .25, z + side * (d / 2 + .4), w + 2, .5, 1, stoneMat);
  }
}

// ---------------------------------------------------------------------------
// Forest, rocks and ground detail
// ---------------------------------------------------------------------------
const trunkGeo = new THREE.CylinderGeometry(.19, .3, 1, 6);
const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
const coneGeo = new THREE.ConeGeometry(1, 1, 7);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3b2a, roughness: 1 });
const treeSpecs = {
  sakura: { trunk: 3.3, broad: true, color: 0xf2a4b8, color2: 0xffc5d2, width: 2.1 },
  maple: { trunk: 3.7, broad: true, color: 0xba5b33, color2: 0xe18d4a, width: 2.25 },
  cedar: { trunk: 4.2, broad: false, color: 0x2f5944, color2: 0x48775a, width: 2.0 },
  snowpine: { trunk: 4.6, broad: false, color: 0x8da7a0, color2: 0xc6d6d2, width: 2.1 }
};

function isNearCollider(x, z, pad = 3) {
  for (const c of colliders) {
    if (x > c.minX - pad && x < c.maxX + pad && z > c.minZ - pad && z < c.maxZ + pad) return true;
  }
  return false;
}

const treeCaps = { sakura: 190, maple: 160, cedar: 180, snowpine: 100 };
for (const key of Object.keys(treeCaps)) treeCaps[key] = Math.round(treeCaps[key] * CONFIG.treeDensity);
const treeTotal = Object.values(treeCaps).reduce((a, b) => a + b, 0);
let planted = 0;
for (let attempt = 0; attempt < 4800 && planted < treeTotal; attempt++) {
  const x = rand(-WORLD_HALF + 70, WORLD_HALF - 70);
  const z = rand(-WORLD_HALF + 70, WORLD_HALF - 70);
  const h = terrainHeight(x, z);
  if (h < 3.2 || h > 250) continue;
  if (terrainSlope(x, z) > .95) continue;
  if (cityMaskAt(x, z) > .1) continue;
  if (nearestRoad(x, z, 5)) continue;
  if (isNearCollider(x, z, 4)) continue;
  const r = worldRandom();
  let type;
  if (h > 178) type = 'snowpine';
  else if (h > 104) type = r < .56 ? 'maple' : 'cedar';
  else if (h < 48) type = r < .43 ? 'sakura' : 'cedar';
  else type = r < .46 ? 'cedar' : 'maple';
  if (treeData[type].length >= treeCaps[type]) continue;
  addTreeInstanceLater(x, z, rand(.65, 1.35), type);
  planted++;
}

function buildTreeType(name) {
  const list = treeData[name];
  if (!list.length) return;
  const spec = treeSpecs[name];
  const trunk = new THREE.InstancedMesh(trunkGeo, trunkMaterial, list.length);
  const mainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .92, metalness: 0 });
  const secondaryMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .94, metalness: 0 });
  const main = new THREE.InstancedMesh(spec.broad ? canopyGeo : coneGeo, mainMat, list.length);
  const secondary = new THREE.InstancedMesh(spec.broad ? canopyGeo : coneGeo, secondaryMat, list.length);
  const dummy = new THREE.Object3D();
  const colorA = new THREE.Color();
  const colorB = new THREE.Color();
  list.forEach((tree, i) => {
    const base = terrainHeight(tree.x, tree.z);
    const s = tree.scale;
    dummy.position.set(tree.x, base + spec.trunk * s / 2, tree.z);
    dummy.rotation.set(0, tree.rot, 0);
    dummy.scale.set(.9 * s, spec.trunk * s, .9 * s);
    dummy.updateMatrix();
    trunk.setMatrixAt(i, dummy.matrix);

    const h1 = spec.broad ? spec.trunk * .95 : spec.trunk * .72;
    const sy1 = spec.broad ? 1.55 : 4.4;
    dummy.position.set(tree.x, base + h1 * s, tree.z);
    dummy.rotation.set(0, tree.rot, 0);
    dummy.scale.set(spec.width * s, sy1 * s, spec.width * s);
    dummy.updateMatrix();
    main.setMatrixAt(i, dummy.matrix);
    colorA.setHex(i % 4 === 0 ? spec.color2 : spec.color);
    colorA.offsetHSL(0, 0, (worldRandom() - .5) * .08);
    main.setColorAt(i, colorA);

    const h2 = spec.broad ? spec.trunk * 1.25 : spec.trunk * 1.35;
    const sy2 = spec.broad ? 1.0 : 2.8;
    dummy.position.set(tree.x + (spec.broad ? .55 * s : 0), base + h2 * s, tree.z - (spec.broad ? .35 * s : 0));
    dummy.rotation.set(0, tree.rot + .7, 0);
    dummy.scale.set(spec.width * .62 * s, sy2 * s, spec.width * .62 * s);
    dummy.updateMatrix();
    secondary.setMatrixAt(i, dummy.matrix);
    colorB.setHex(spec.color2);
    colorB.offsetHSL(0, 0, (worldRandom() - .5) * .07);
    secondary.setColorAt(i, colorB);
  });
  trunk.instanceMatrix.needsUpdate = true;
  main.instanceMatrix.needsUpdate = true;
  secondary.instanceMatrix.needsUpdate = true;
  if (main.instanceColor) main.instanceColor.needsUpdate = true;
  if (secondary.instanceColor) secondary.instanceColor.needsUpdate = true;
  world.add(trunk, main, secondary);
}
// Bamboo groves
const bambooStalkMat = new THREE.MeshStandardMaterial({ color: 0x76964e, roughness: .9 });
const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x507d43, roughness: .9 });
const bambooPositions = [];
for (const grove of [[-170, 660, 85], [260, -650, 100], [-720, -340, 70]]) {
  for (let i = 0; i < 60; i++) {
    const x = grove[0] + rand(-grove[2], grove[2]);
    const z = grove[1] + rand(-grove[2], grove[2]);
    if (nearestRoad(x, z, 4)) continue;
    if (cityMaskAt(x, z) > .1) continue;
    if (terrainHeight(x, z) < 3) continue;
    bambooPositions.push({ x, z, s: rand(.7, 1.3) });
  }
}
if (bambooPositions.length) {
  const stalk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .13, 1, 5), bambooStalkMat, bambooPositions.length);
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), bambooLeafMat, bambooPositions.length);
  const dummy = new THREE.Object3D();
  bambooPositions.forEach((b, i) => {
    const base = terrainHeight(b.x, b.z);
    dummy.position.set(b.x, base + 4.6 * b.s, b.z);
    dummy.scale.set(.75 * b.s, 9 * b.s, .75 * b.s);
    dummy.updateMatrix();
    stalk.setMatrixAt(i, dummy.matrix);
    dummy.position.set(b.x, base + 8.2 * b.s, b.z);
    dummy.scale.set(1.6 * b.s, .7 * b.s, 1.6 * b.s);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
  });
  stalk.instanceMatrix.needsUpdate = true;
  leaves.instanceMatrix.needsUpdate = true;
  world.add(stalk, leaves);
}

// Rocks and crags
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x77786f, roughness: .97 });
const rockCount = 300;
const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
const rockDummy = new THREE.Object3D();
const rockColor = new THREE.Color();
let rockPlaced = 0;
for (let attempt = 0; attempt < 1600 && rockPlaced < rockCount; attempt++) {
  const x = rand(-WORLD_HALF + 40, WORLD_HALF - 40);
  const z = rand(-WORLD_HALF + 40, WORLD_HALF - 40);
  const h = terrainHeight(x, z);
  const slope = terrainSlope(x, z);
  if (h < -.5 || cityMaskAt(x, z) > .15) continue;
  if (slope < .3 && h < 110) continue;
  if (nearestRoad(x, z, 5)) continue;
  const s = rand(.5, 2.6);
  rockDummy.position.set(x, h + s * .32, z);
  rockDummy.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
  rockDummy.scale.set(s, s * rand(.45, .9), s * rand(.7, 1.3));
  rockDummy.updateMatrix();
  rockMesh.setMatrixAt(rockPlaced, rockDummy.matrix);
  rockColor.setHSL(rand(.07, .12), rand(.04, .12), rand(.25, .48));
  rockMesh.setColorAt(rockPlaced, rockColor);
  rockPlaced++;
}
rockMesh.count = rockPlaced;
rockMesh.instanceMatrix.needsUpdate = true;
if (rockMesh.instanceColor) rockMesh.instanceColor.needsUpdate = true;
world.add(rockMesh);

// Grass tufts
const grassGeo = new THREE.ConeGeometry(.28, 1, 4);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x668747, roughness: 1 });
const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, 700);
const grassDummy = new THREE.Object3D();
let grassPlaced = 0;
for (let attempt = 0; attempt < 2200 && grassPlaced < 700; attempt++) {
  const x = rand(-WORLD_HALF + 40, 480);
  const z = rand(-WORLD_HALF + 40, WORLD_HALF - 40);
  const h = terrainHeight(x, z);
  if (h < 3 || h > 130 || cityMaskAt(x, z) > .15) continue;
  if (nearestRoad(x, z, 3)) continue;
  const s = rand(.4, 1.3);
  grassDummy.position.set(x, h + .3 * s, z);
  grassDummy.scale.set(s, s, s);
  grassDummy.rotation.y = rand(0, 4);
  grassDummy.updateMatrix();
  grassMesh.setMatrixAt(grassPlaced, grassDummy.matrix);
  grassPlaced++;
}
grassMesh.count = grassPlaced;
grassMesh.instanceMatrix.needsUpdate = true;
world.add(grassMesh);

// Reeds along the shore.
const reedMat = new THREE.MeshStandardMaterial({ color: 0x8c925e, roughness: .95 });
const reedMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(.08, 2.2, 3), reedMat, 240);
const reedDummy = new THREE.Object3D();
let reeds = 0;
for (let attempt = 0; attempt < 900 && reeds < 240; attempt++) {
  const x = rand(-880, -760);
  const z = rand(-1000, 1000);
  const h = terrainHeight(x, z);
  if (h < .1 || h > 4.5) continue;
  reedDummy.position.set(x, h + 1.1, z);
  reedDummy.scale.set(rand(.7, 1.4), rand(.7, 1.4), rand(.7, 1.4));
  reedDummy.rotation.y = rand(0, 4);
  reedDummy.updateMatrix();
  reedMesh.setMatrixAt(reeds, reedDummy.matrix);
  reeds++;
}
reedMesh.count = reeds;
reedMesh.instanceMatrix.needsUpdate = true;
world.add(reedMesh);

// ---------------------------------------------------------------------------
// Shrines, torii and roadside detail
// ---------------------------------------------------------------------------
function addTorii(x, z, rotation = 0, scale = 1) {
  const group = new THREE.Group();
  const base = terrainHeight(x, z);
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 7.4, 1.05), vermilionMat);
    pillar.position.set(side * 3.1, 3.7, 0);
    group.add(pillar);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.7, .55, 1.7), stoneMat);
    foot.position.set(side * 3.1, .28, 0);
    group.add(foot);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.6, .8, 1.2), vermilionMat);
  lintel.position.y = 7.25;
  group.add(lintel);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.6, .42, .72), vermilionMat);
  beam.position.y = 5.6;
  group.add(beam);
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.3, .18), new THREE.MeshStandardMaterial({ color: 0x1e2525, roughness: .5, metalness: .3 }));
  plaque.position.set(0, 6.25, .4);
  group.add(plaque);
  group.position.set(x, base, z);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  world.add(group);
  return group;
}

function addStoneLantern(x, z, y, scale = 1) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.55, .75, .5, 6), stoneMat);
  base.position.y = .25;
  group.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.2, .28, 2.1, 6), stoneMat);
  post.position.y = 1.4;
  group.add(post);
  const light = new THREE.Mesh(new THREE.BoxGeometry(.85, .7, .85), windowLitMat);
  light.position.y = 2.65;
  group.add(light);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1, .5, 4), stoneMat);
  cap.position.y = 3.2;
  group.add(cap);
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  world.add(group);
}

function addShrine(x, z, scale = 1) {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(13, .7, 10), stoneMat);
  plinth.position.y = .35;
  group.add(plinth);
  const hall = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 6.5), woodMat);
  hall.position.y = 2.8;
  group.add(hall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.6, 2.5, 4), roofTileMat);
  roof.position.y = 6.15;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), new THREE.MeshStandardMaterial({ color: 0x241814, roughness: .8 }));
  door.position.set(0, 1.9, 3.3);
  group.add(door);
  group.position.set(x, base, z);
  group.scale.setScalar(scale);
  world.add(group);
  addTorii(x, z + 10 * scale, 0, .72 * scale);
  addStoneLantern(x - 8 * scale, z + 6 * scale, base, .8 * scale);
  addStoneLantern(x + 8 * scale, z + 6 * scale, base, .8 * scale);
  for (let i = 0; i < 5; i++) {
    addTreeInstanceLater(x + rand(-22, 22) * scale, z + rand(-18, 18) * scale, rand(.7, 1.1) * scale, 'sakura');
  }
}

for (const s of pendingShrines) addShrine(s.x, s.z, s.scale);
addShrine(1080, 330, 1.15);
addTorii(-300, 425, Math.PI / 2, .9);
addTorii(560, 360, .5, 1.0);
addStoneLantern(-312, 438, terrainHeight(-312, 438), .65);

function addHairpinSign(x, z, rotation = 0, text = 'HAIRPIN') {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 4.2, 5), poleMat);
  post.position.y = 2.1;
  group.add(post);
  const tex = makeLabelTexture(text, '#fff6db', 'rgba(22,12,8,.94)', '#ff8a3d');
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.45), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  sign.position.set(0, 4.2, .12);
  group.add(sign);
  group.position.set(x, base, z);
  group.rotation.y = rotation;
  world.add(group);
}

const hairpinSigns = [
  [260, -160], [460, 420], [700, -200], [920, 360], [820, 100]
];
let hairpinIndex = 0;
for (const [x, z] of hairpinSigns) {
  const road = nearestRoad(x, z, 40);
  if (!road) continue;
  const side = hairpinIndex++ % 2 === 0 ? 1 : -1;
  const nx = Math.cos(road.angle);
  const nz = -Math.sin(road.angle);
  const offset = road.width / 2 + 3.6;
  const sx = road.x + nx * side * offset;
  const sz = road.z + nz * side * offset;
  addHairpinSign(sx, sz, Math.atan2(road.x - sx, road.z - sz), 'HAIRPIN');
}

// White roadside guide posts on the pass.
const passRoad = roads.find((r) => r.name === 'Kurohana Pass');
if (passRoad) {
  for (let i = 4; i < passRoad.points.length - 4; i += 3) {
    const p = passRoad.points[i];
    const prev = passRoad.points[i - 1];
    const next = passRoad.points[i + 1];
    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len;
    const nz = tx / len;
    for (const side of [-1, 1]) {
      const x = p.x + nx * side * (passRoad.width / 2 + 1.2);
      const z = p.z + nz * side * (passRoad.width / 2 + 1.2);
      const post = new THREE.Mesh(new THREE.BoxGeometry(.12, .85, .12), new THREE.MeshBasicMaterial({ color: 0xe4e2d3 }));
      post.position.set(x, terrainHeight(x, z) + .42, z);
      world.add(post);
    }
  }
}

// Small utility poles along the farm lanes.
for (let i = 0; i < 16; i++) {
  const x = -330 + i * 24;
  const z = 910 - i * 8;
  if (nearestRoad(x, z, 2)) continue;
  const base = terrainHeight(x, z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 7.5, 5), poleMat);
  pole.position.set(x, base + 3.75, z);
  world.add(pole);
  const cross = new THREE.Mesh(new THREE.BoxGeometry(2.1, .12, .12), poleMat);
  cross.position.set(x, base + 6.6, z);
  world.add(cross);
}

// A shallow highland river and three ponds break up the plains.
const riverPath = [
  [700, -520], [540, -470], [380, -410], [220, -330], [70, -270], [-90, -240],
  [-250, -250], [-410, -230], [-570, -245], [-730, -205], [-825, -185]
];
const riverPoints = makeRoadSamples(riverPath, false, 8).points;
const riverMat = new THREE.MeshStandardMaterial({ color: 0x2f7180, roughness: .2, metalness: .22, transparent: true, opacity: .86, side: THREE.DoubleSide });
roadRibbon(riverPoints, 13, 0, riverMat, .045, 20);
for (let i = 7; i < riverPoints.length - 4; i += 8) {
  const p = riverPoints[i];
  const next = riverPoints[i + 1];
  const angle = Math.atan2(next.x - p.x, next.z - p.z);
  for (const side of [-1, 1]) {
    const x = p.x + Math.cos(angle) * side * 8.5;
    const z = p.z - Math.sin(angle) * side * 8.5;
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const s = rand(.45, 1.3);
    rock.scale.set(s * 1.5, s * .6, s);
    rock.position.set(x, terrainHeight(x, z) + .2, z);
    rock.rotation.y = rand(0, 4);
    world.add(rock);
  }
}
const pondData = [[-265, 85, 16], [-120, -25, 12], [-420, 160, 10]];
const pondMat = new THREE.MeshStandardMaterial({ color: 0x3f7b83, roughness: .18, metalness: .2, transparent: true, opacity: .82, side: THREE.DoubleSide });
for (const [x, z, radius] of pondData) {
  const pond = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), pondMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(x, terrainHeight(x, z) + .055, z);
  world.add(pond);
}
// A little timber bridge over the river on the north farm track.
{
  const p = riverPoints[Math.max(0, Math.floor(riverPoints.length * .42))];
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(24, .35, 4.4), woodMat);
  deck.position.y = .3;
  bridge.add(deck);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(24, .12, .18), woodMat);
    rail.position.set(0, 1.5, side * 2.1);
    bridge.add(rail);
    for (let x = -9; x <= 9; x += 6) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.3, .18), woodMat);
      post.position.set(x, .9, side * 2.1);
      bridge.add(post);
    }
  }
  bridge.position.set(p.x, terrainHeight(p.x, p.z) + .1, p.z);
  bridge.rotation.y = .2;
  world.add(bridge);
}

for (const name of Object.keys(treeData)) buildTreeType(name);

// ---------------------------------------------------------------------------
// Activities, routes and collectibles
// ---------------------------------------------------------------------------
const activityGroup = new THREE.Group();
world.add(activityGroup);
const activities = [];
const races = [];
const ramps = [];
const catGeo = new THREE.SphereGeometry(1, 8, 6);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
const activityColors = {
  trap: '#ff8a3d',
  zone: '#66e6ff',
  drift: '#ff6fa5',
  danger: '#ffd166',
  board: '#77e6a2',
  collectible: '#c49bff',
  barn: '#f4f1e8',
  race: '#ff4b3e'
};
const game = {
  xp: 0,
  chain: 0,
  chainTimer: 0,
  multiplier: 1,
  done: new Set(),
  zone: null,
  driftZone: null,
  race: null,
  airborneStart: null,
  lastJump: 0,
  barnPrompt: null,
  hintPrompt: null
};

function snapToRoad(x, z, pad = 45) {
  const r = nearestRoad(x, z, pad);
  if (!r) return { x, z, angle: 0, width: 14, name: '', type: 'asphalt' };
  return r;
}

function registerActivity(activity) {
  activity.id = activities.length;
  activity.done = false;
  activities.push(activity);
  return activity;
}

function addGate(x, z, angle, width, label, color, height = 6.4) {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x20282b, roughness: .55, metalness: .45 });
  const glow = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(.6, height, .6), postMat);
    post.position.set(side * width / 2, height / 2, 0);
    group.add(post);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.12, height * .75, .68), glow);
    strip.position.set(side * width / 2, height * .45, .02);
    group.add(strip);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(width + .8, .5, .65), postMat);
  beam.position.y = height;
  group.add(beam);
  const tex = makeLabelTexture(label, '#fff8e7', 'rgba(8,13,16,.93)', color);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width * .8, 19), 2.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  sign.position.set(0, height - 1.5, .08);
  group.add(sign);
  group.position.set(x, base, z);
  group.rotation.y = angle;
  activityGroup.add(group);
  return group;
}

function addSuspendedMarker(x, z, color, text) {
  const base = terrainHeight(x, z);
  const mat = new THREE.SpriteMaterial({
    map: makeLabelTexture(text, '#fff8e6', 'rgba(8,13,16,.9)', color),
    transparent: true,
    depthWrite: false,
    toneMapped: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, base + 9, z);
  sprite.scale.set(7.5, 2.1, 1);
  activityGroup.add(sprite);
  return sprite;
}

// Speed traps ---------------------------------------------------------------
const trapDefs = [
  { name: 'Minato Terminal', x: -800, z: 120 },
  { name: 'Skyway North', x: -120, z: 40 },
  { name: 'Neon Boulevard', x: -500, z: 260 }
];
for (const def of trapDefs) {
  const r = snapToRoad(def.x, def.z);
  addGate(r.x, r.z, r.angle, r.width + 7, 'SPEED TRAP', activityColors.trap, 6.6);
  const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x2b3437, roughness: .45, metalness: .4 }));
  cameraBox.position.set(r.x + Math.cos(r.angle) * (r.width / 2 + 1.5), terrainHeight(r.x, r.z) + 5.5, r.z - Math.sin(r.angle) * (r.width / 2 + 1.5));
  cameraBox.rotation.y = r.angle;
  activityGroup.add(cameraBox);
  registerActivity({ type: 'trap', name: def.name, x: r.x, z: r.z, angle: r.angle, best: 0, color: activityColors.trap });
}

// Speed zones ---------------------------------------------------------------
const zoneDefs = [
  { name: 'Minato Cruise', start: [-805, 500], end: [-812, -60] },
  { name: 'Skyway Rush', start: [-500, -105], end: [-160, 0] },
  { name: 'Sakura Avenue', start: [-280, 380], end: [280, 300] }
];
for (const def of zoneDefs) {
  const s = snapToRoad(def.start[0], def.start[1], 80);
  const e = snapToRoad(def.end[0], def.end[1], 80);
  addGate(s.x, s.z, s.angle, s.width + 8, 'SPEED ZONE', activityColors.zone, 5.9);
  addGate(e.x, e.z, e.angle, e.width + 8, 'ZONE FINISH', activityColors.zone, 5.9);
  const zone = {
    start: { x: s.x, z: s.z },
    end: { x: e.x, z: e.z },
    length: Math.hypot(e.x - s.x, e.z - s.z) * 1.12,
    best: 0
  };
  registerActivity({ type: 'zone', name: def.name, x: s.x, z: s.z, angle: s.angle, zone, color: activityColors.zone });
}

// Drift zones ---------------------------------------------------------------
for (const [x, z, name] of [
  [260, -160, 'Hairpin One'],
  [460, 420, 'Hairpin Two'],
  [700, -200, 'Hairpin Three'],
  [920, 360, 'Hairpin Four']
]) {
  const r = snapToRoad(x, z, 40);
  addGate(r.x, r.z, r.angle, 25, 'DRIFT ZONE', activityColors.drift, 5.4);
  addSuspendedMarker(r.x, r.z, activityColors.drift, 'SLIDE');
  registerActivity({ type: 'drift', name, x: r.x, z: r.z, radius: 46, score: 0, color: activityColors.drift });
}

// Danger ramps --------------------------------------------------------------
function buildRamp(x, z, angle, width, length, rise) {
  const base = terrainHeight(x, z);
  const group = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, .18, length), roadMats.asphalt);
  const slope = Math.atan2(rise, length);
  deck.rotation.x = -slope;
  deck.position.y = rise / 2 + .08;
  group.add(deck);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const t = .18 + i * .3;
      const support = new THREE.Mesh(new THREE.BoxGeometry(.32, rise * t + .3, .32), poleMat);
      support.position.set(side * (width / 2 - .4), (rise * t + .3) / 2, -length / 2 + t * length);
      group.add(support);
    }
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(.42, .82, .06), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x1d2224 : 0xffd166, toneMapped: false }));
      stripe.position.set(side * (width / 2 + .01), rise * .62 + .45, -length / 2 + i * (length / 5) + .4);
      stripe.rotation.y = side * Math.PI / 2;
      group.add(stripe);
    }
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 2.3), new THREE.MeshBasicMaterial({ map: makeLabelTexture('DANGER', '#fff8e7', 'rgba(25,12,8,.95)', '#ffd166'), transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  sign.position.set(width / 2 + 3.6, 3.8, 2);
  group.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, 3.8, 5), poleMat);
  post.position.set(width / 2 + 3.6, 1.9, 2);
  group.add(post);
  group.position.set(x, base, z);
  group.rotation.y = angle;
  activityGroup.add(group);
  return { x, z, angle, width, length, rise, base };
}

for (const [x, z, name] of [
  [-805, -650, 'Minato Leap'],
  [145, 930, 'Hillclimb Hop'],
  [580, 140, 'Pass Crest']
]) {
  const r = snapToRoad(x, z, 60);
  const data = buildRamp(r.x, r.z, r.angle, 10, 16, 1.9);
  ramps.push(data);
  registerActivity({ type: 'danger', name, x: r.x, z: r.z, angle: r.angle, ramp: data, color: activityColors.danger });
}
registerActivity({ type: 'danger', name: 'Kurohana Crest', x: 820, z: 100, angle: snapToRoad(820, 100, 70).angle, ramp: null, color: activityColors.danger });

function rampHeightAt(x, z) {
  for (const r of ramps) {
    const dx = x - r.x;
    const dz = z - r.z;
    const along = Math.sin(r.angle) * dx + Math.cos(r.angle) * dz;
    const across = Math.cos(r.angle) * dx - Math.sin(r.angle) * dz;
    if (across > -r.width / 2 && across < r.width / 2 && along > -r.length / 2 && along < r.length / 2) {
      return r.base + ((along + r.length / 2) / r.length) * r.rise + .18;
    }
  }
  return -Infinity;
}

// Bonus boards and collectibles scale with CONFIG.stuntDensity. Gates, races
// and barns stay fixed so the required activities are always present.
const stuntDensity = clamp(CONFIG.stuntDensity, 0, 4);
const scenicRoads = roadSegments.filter((s) => !s.name.includes('Neon Ward'));
function roadsidePoint(seg, distance) {
  const mx = (seg.ax + seg.bx) / 2;
  const mz = (seg.az + seg.bz) / 2;
  const angle = Math.atan2(seg.bx - seg.ax, seg.bz - seg.az);
  const nx = Math.cos(angle);
  const nz = -Math.sin(angle);
  const sideA = [mx + nx * distance, mz + nz * distance];
  const sideB = [mx - nx * distance, mz - nz * distance];
  return terrainHeight(sideA[0], sideA[1]) >= terrainHeight(sideB[0], sideB[1]) ? sideA : sideB;
}

const baseBoardDefs = [
  [-765, 300, 2500], [-655, 620, 2500], [-420, 735, 5000], [-120, 240, 2500],
  [230, 650, 5000], [510, 385, 2500], [815, -20, 5000], [985, 300, 7500],
  [-265, -210, 2500], [355, -520, 5000], [120, -840, 2500], [-625, -440, 5000]
];
const boardDefs = [];
const boardTarget = Math.max(1, Math.round(baseBoardDefs.length * stuntDensity));
for (let i = 0; i < boardTarget; i++) {
  if (i < baseBoardDefs.length) {
    const idx = boardTarget < baseBoardDefs.length
      ? Math.floor(i * baseBoardDefs.length / boardTarget)
      : i;
    boardDefs.push(baseBoardDefs[idx]);
  } else {
    const seg = scenicRoads[(i * 149 + 37) % scenicRoads.length];
    const [bx, bz] = roadsidePoint(seg, seg.width / 2 + 5);
    boardDefs.push([bx, bz, [2500, 5000, 7500][i % 3]]);
  }
}
for (const [x, z, amount] of boardDefs) {
  const road = nearestRoad(x, z, 2);
  let bx = x;
  let bz = z;
  let rotation = rand(-1.2, 1.2);
  if (road) {
    const nx = Math.cos(road.angle);
    const nz = -Math.sin(road.angle);
    bx = road.x + nx * (road.width / 2 + 4.2);
    bz = road.z + nz * (road.width / 2 + 4.2);
    rotation = Math.atan2(road.x - bx, road.z - bz);
  }
  const base = visualTerrainHeight(bx, bz);
  const group = new THREE.Group();
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, 2.3, 5), poleMat);
    post.position.set(side * 2, 1.15, 0);
    group.add(post);
  }
  const tex = makeLabelTexture(`${amount.toLocaleString()} XP`, '#102216', 'rgba(226,244,219,.95)', '#77e6a2');
  const board = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  board.position.set(0, 3.4, 0);
  group.add(board);
  group.position.set(bx, base, bz);
  group.rotation.y = rotation;
  activityGroup.add(group);
  registerActivity({ type: 'board', name: 'Bonus Board', x: bx, z: bz, amount, group, color: activityColors.board });
}

// Lucky cats ----------------------------------------------------------------
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9a63d, metalness: .72, roughness: .28, emissive: 0x3a2200, emissiveIntensity: .25 });
const baseCatDefs = [
  [-650, 530], [-450, 230], [-350, 530], [-735, 205], [-510, 600],
  [-180, 30], [1080, 330], [1000, 20], [-930, 610], [300, -260],
  [700, 500], [-600, 820]
];
const catDefs = [];
const catTarget = Math.max(1, Math.round(baseCatDefs.length * stuntDensity));
for (let i = 0; i < catTarget; i++) {
  if (i < baseCatDefs.length) {
    const idx = catTarget < baseCatDefs.length
      ? Math.floor(i * baseCatDefs.length / catTarget)
      : i;
    catDefs.push(baseCatDefs[idx]);
  } else {
    const seg = scenicRoads[(i * 197 + 73) % scenicRoads.length];
    const [cx, cz] = roadsidePoint(seg, seg.width / 2 + 12);
    catDefs.push([cx, cz]);
  }
}
for (const [x, z] of catDefs) {
  const base = visualTerrainHeight(x, z);
  const group = new THREE.Group();
  const body = new THREE.Mesh(catGeo, goldMat);
  body.scale.set(.55, .7, .48);
  body.position.y = .72;
  group.add(body);
  const head = new THREE.Mesh(catGeo, goldMat);
  head.scale.setScalar(.42);
  head.position.set(0, 1.35, .18);
  group.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(.16, .38, 4), goldMat);
    ear.position.set(side * .22, 1.68, .18);
    group.add(ear);
  }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 4, 8, Math.PI), goldMat);
  tail.position.set(.32, .9, -.2);
  tail.rotation.z = .5;
  group.add(tail);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .04, 4, 24), new THREE.MeshBasicMaterial({ color: activityColors.collectible, transparent: true, opacity: .45, toneMapped: false }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .15;
  group.add(ring);
  group.position.set(x, base, z);
  group.userData.spin = true;
  activityGroup.add(group);
  registerActivity({ type: 'collectible', name: 'Lucky Cat', x, z, group, color: activityColors.collectible });
}

// Barn finds ----------------------------------------------------------------
function addBarnFind(x, z, name, rotation = 0) {
  const barn = addBarn(x, z, rotation);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2), new THREE.MeshBasicMaterial({ map: makeLabelTexture('BARN FIND', '#fff7e5', 'rgba(20,16,11,.94)', '#f4f1e8'), transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  sign.position.set(x, terrainHeight(x, z) + 4.2, z + 13);
  sign.rotation.y = rotation;
  activityGroup.add(sign);
  // A low covered silhouette under a tarp beside the barn.
  const tarp = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.1, 2.3), new THREE.MeshStandardMaterial({ color: 0x70878b, roughness: .92 }));
  tarp.position.set(x + 16, terrainHeight(x + 16, z) + .8, z);
  tarp.rotation.y = rotation;
  tarp.rotation.z = .08;
  activityGroup.add(tarp);
  registerActivity({ type: 'barn', name, x, z, rotation, color: activityColors.barn });
}
addBarnFind(-640, -430, 'Kaze 2000 GT', .4);
addBarnFind(430, 690, 'Hoshi Rally', -.3);
addBarnFind(1060, -350, 'Yuki Special', .9);

// Race events ---------------------------------------------------------------
function addCheckpoint(x, z, angle, color, radius = 7) {
  const base = terrainHeight(x, z);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .38, toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .2, 6, 26), mat);
  ring.position.set(x, base + radius + .5, z);
  ring.rotation.y = angle;
  activityGroup.add(ring);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 16, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .12, toneMapped: false }));
  beacon.position.set(x, base + 8, z);
  activityGroup.add(beacon);
  return { x, z, base, angle, ring, mat, radius, color };
}

function addRace(def) {
  const start = snapToRoad(def.start[0], def.start[1], 80);
  addGate(start.x, start.z, start.angle, start.width + 9, def.name.toUpperCase(), activityColors.race, 7.2);
  const checkpoints = def.checkpoints.map(([x, z], index) => {
    const r = snapToRoad(x, z, 90);
    const cp = addCheckpoint(r.x, r.z, r.angle, index === def.checkpoints.length - 1 ? '#ffd166' : activityColors.race, index === def.checkpoints.length - 1 ? 8 : 7);
    return cp;
  });
  let best = null;
  try { best = parseFloat(localStorage.getItem(`nippon-best-${def.name}`)) || null; } catch (e) { best = null; }
  const race = { ...def, start: { x: start.x, z: start.z, angle: start.angle, width: start.width }, checkpoints, best, active: false, activity: null };
  race.activity = registerActivity({ type: 'race', name: def.name, x: start.x, z: start.z, angle: start.angle, race, color: activityColors.race });
  races.push(race);
  return race;
}

addRace({
  name: 'Neon Circuit', kind: 'Circuit',
  start: [-500, 380],
  checkpoints: [[-500, 580], [-300, 580], [-300, 180], [-700, 180], [-700, 380], [-500, 380]]
});
addRace({
  name: 'Minato Sprint', kind: 'Sprint',
  start: [-500, 380],
  checkpoints: [[-720, 380], [-800, 200], [-810, -100], [-800, -400], [-790, -700]]
});
addRace({
  name: 'Kurohana Climb', kind: 'Point to point',
  start: [180, 600],
  checkpoints: [[360, 240], [420, 60], [260, -160], [460, 420], [700, -200], [920, 360], [1100, 400], [1140, 260]]
});

const activityTotal = activities.length;

// ---------------------------------------------------------------------------
// The car
// ---------------------------------------------------------------------------
const carRoot = new THREE.Group();
carRoot.rotation.order = 'YXZ';
scene.add(carRoot);

const carBody = new THREE.Group();
carRoot.add(carBody);

const paintMat = new THREE.MeshPhysicalMaterial({ color: 0xc4382f, metalness: .5, roughness: .22, clearcoat: 1, clearcoatRoughness: .14 });
const carbonMat = new THREE.MeshStandardMaterial({ color: 0x151b1d, metalness: .58, roughness: .34 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a151c, metalness: .8, roughness: .12 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x090b0c, roughness: .94 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0x9aa5a8, metalness: .92, roughness: .24 });
const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffedbf, emissiveIntensity: 2.5, roughness: .18 });
const tailMat = new THREE.MeshStandardMaterial({ color: 0x5f0910, emissive: 0xff1b2d, emissiveIntensity: .65, roughness: .35 });
const brakeMat = new THREE.MeshStandardMaterial({ color: 0x8a0e14, emissive: 0xff281e, emissiveIntensity: .35, roughness: .3 });

const profile = new THREE.Shape();
profile.moveTo(-2.18, .30);
profile.lineTo(-2.30, .62);
profile.lineTo(-2.14, .92);
profile.lineTo(-1.24, 1.00);
profile.bezierCurveTo(-.96, 1.00, -.68, 1.27, -.38, 1.32);
profile.lineTo(.38, 1.33);
profile.bezierCurveTo(.82, 1.26, 1.48, .98, 2.12, .84);
profile.lineTo(2.30, .56);
profile.lineTo(2.16, .27);
profile.closePath();
// Lower, narrower body with a tapered greenhouse instead of a slab-sided box.
const bodyGeo = new THREE.ExtrudeGeometry(profile, { depth: 1.76, bevelEnabled: true, bevelSize: .045, bevelThickness: .045, bevelSegments: 2, curveSegments: 6, steps: 1 });
bodyGeo.rotateY(-Math.PI / 2);
bodyGeo.translate(.88, 0, 0);
const bodyPosition = bodyGeo.attributes.position;
for (let i = 0; i < bodyPosition.count; i++) {
  const y = bodyPosition.getY(i);
  const z = bodyPosition.getZ(i);
  const crown = 1 - smoothstep(.62, 1.33, y) * .12;
  const nose = 1 - smoothstep(1.45, 2.30, z) * .055;
  const tail = 1 - smoothstep(1.20, 2.30, -z) * .045;
  bodyPosition.setX(i, bodyPosition.getX(i) * crown * nose * tail);
}
bodyPosition.needsUpdate = true;
bodyGeo.computeVertexNormals();
const bodyMesh = new THREE.Mesh(bodyGeo, paintMat);
bodyMesh.castShadow = false;
bodyMesh.receiveShadow = false;
carBody.add(bodyMesh);

const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(1.24, .045, 1.34), carbonMat);
roofPanel.position.set(0, 1.335, -.36);
carBody.add(roofPanel);

for (const side of [-1, 1]) {
  const window = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .35), glassMat);
  window.rotation.y = side * Math.PI / 2;
  window.position.set(side * .805, 1.09, -.24);
  carBody.add(window);
  const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(.22, .04, .04), carbonMat);
  mirrorArm.position.set(side * .88, 1.00, .56);
  carBody.add(mirrorArm);
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(.18, .085, .14), carbonMat);
  mirror.position.set(side * .965, 1.03, .56);
  carBody.add(mirror);
}

const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.18, .46), glassMat);
windshield.position.set(0, 1.11, .66);
windshield.rotation.x = -.60;
carBody.add(windshield);
const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.04, .33), glassMat);
rearGlass.position.set(0, 1.06, -1.22);
rearGlass.rotation.x = .52;
carBody.add(rearGlass);

const lowerTrim = new THREE.Mesh(new THREE.BoxGeometry(1.70, .09, 3.42), carbonMat);
lowerTrim.position.set(0, .245, -.04);
carBody.add(lowerTrim);
for (const side of [-1, 1]) {
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(.055, .10, 2.65), carbonMat);
  skirt.position.set(side * .887, .225, -.02);
  carBody.add(skirt);
}
const frontLip = new THREE.Mesh(new THREE.BoxGeometry(1.68, .07, .36), carbonMat);
frontLip.position.set(0, .225, 2.08);
carBody.add(frontLip);
const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(1.58, .08, .34), carbonMat);
rearDiffuser.position.set(0, .23, -2.07);
carBody.add(rearDiffuser);

const grille = new THREE.Mesh(new THREE.BoxGeometry(1.06, .15, .05), carbonMat);
grille.position.set(0, .50, 2.20);
carBody.add(grille);
for (const side of [-1, 1]) {
  const headlight = new THREE.Mesh(new THREE.BoxGeometry(.48, .07, .05), headMat);
  headlight.position.set(side * .50, .68, 2.18);
  carBody.add(headlight);
  const corner = new THREE.Mesh(new THREE.BoxGeometry(.16, .10, .06), new THREE.MeshBasicMaterial({ color: 0xffb34d, toneMapped: false }));
  corner.position.set(side * .68, .54, 2.15);
  carBody.add(corner);
}
const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.42, .07, .05), tailMat);
tailBar.position.set(0, .67, -2.23);
carBody.add(tailBar);

const ducktail = new THREE.Mesh(new THREE.BoxGeometry(1.48, .05, .24), carbonMat);
ducktail.position.set(0, .98, -2.10);
ducktail.rotation.x = -.12;
carBody.add(ducktail);

const decalTex = makeTexture(512, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#f5ebd6';
  g.font = '900 74px Segoe UI, Arial, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('KAZE', 18, h / 2);
  g.fillStyle = '#ffd166';
  g.fillRect(20, h - 23, 238, 5);
  g.fillStyle = '#f5ebd6';
  g.font = '700 28px Segoe UI, Arial, sans-serif';
  g.fillText('01  /  KAI', 285, h / 2 + 2);
});
const decalMat = new THREE.MeshBasicMaterial({ map: decalTex, transparent: true, depthWrite: false, toneMapped: false });
for (const side of [-1, 1]) {
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.42, .32), decalMat);
  decal.rotation.y = side * Math.PI / 2;
  decal.position.set(side * .887, .66, .30);
  carBody.add(decal);
}

const wheelData = [];
function addWheel(x, z, front) {
  const pivot = new THREE.Group();
  pivot.position.set(x, .37, z);
  const spin = new THREE.Group();
  pivot.add(spin);
  const tireGeo = new THREE.CylinderGeometry(.36, .36, .28, 16);
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, tireMat);
  spin.add(tire);
  const rimGeo = new THREE.CylinderGeometry(.225, .225, .3, 12);
  rimGeo.rotateZ(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  spin.add(rim);
  const sign = Math.sign(x);
  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(.018, .34, .055), rimMat);
    spoke.position.x = sign * .152;
    spoke.rotation.x = i * Math.PI / 5;
    spin.add(spoke);
  }
  const caliper = new THREE.Mesh(new THREE.BoxGeometry(.04, .1, .13), new THREE.MeshStandardMaterial({ color: 0xffc23d, metalness: .4, roughness: .4 }));
  caliper.position.set(sign * .17, .16, 0);
  spin.add(caliper);
  carRoot.add(pivot);
  wheelData.push({ pivot, spin, front, sign });
}
addWheel(-.88, 1.33, true);
addWheel(.88, 1.33, true);
addWheel(-.88, -1.34, false);
addWheel(.88, -1.34, false);

const headlight = new THREE.SpotLight(0xffeccb, 0, 80, .32, .55, 1.2);
headlight.position.set(0, .92, 1.9);
const headlightTarget = new THREE.Object3D();
headlightTarget.position.set(0, .3, 35);
carRoot.add(headlight, headlightTarget);
headlight.target = headlightTarget;

const carShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.9), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: .42, depthWrite: false, toneMapped: false }));
carShadow.rotation.x = -Math.PI / 2;
scene.add(carShadow);

const car = {
  x: CONFIG.spawn.x,
  z: CONFIG.spawn.z,
  y: 0,
  groundY: 0,
  heading: CONFIG.spawn.heading,
  vx: 0,
  vz: 0,
  vy: 0,
  speed: 0,
  slip: 0,
  steer: 0,
  airborne: false,
  waterTime: 0,
  cameraMode: 0,
  wheelSpin: 0
};
const input = { up: false, down: false, left: false, right: false, handbrake: false };

function groundHeightAt(x, z) {
  let h = visualTerrainHeight(x, z) + .11;
  const road = nearestRoad(x, z, .2);
  if (road && road.y != null) h = Math.max(h, road.y + .02);
  const ramp = rampHeightAt(x, z);
  if (ramp > h) h = ramp;
  return h;
}

function surfaceAt(x, z) {
  const road = nearestRoad(x, z, 0);
  if (road) {
    return { ...CONFIG.surfaces[road.type], type: road.type, name: road.name, road: true, width: road.width };
  }
  const h = terrainHeight(x, z);
  if (cityMaskAt(x, z) > .32) return { ...CONFIG.surfaces.asphalt, type: 'asphalt', name: 'Neon Ward pavement', road: false };
  if (h < .3 && x < -780) return { ...CONFIG.surfaces.water, type: 'water', name: 'Minato Bay', road: false };
  if (h < 4.8 && x < -760) return { ...CONFIG.surfaces.sand, type: 'sand', name: 'Minato beach', road: false };
  if (h > 168) return { ...CONFIG.surfaces.snow, type: 'snow', name: 'Yuki snowfield', road: false };
  return { ...CONFIG.surfaces.grass, type: 'grass', name: 'Kai backcountry', road: false };
}

function resolveCollisions() {
  const radius = 1.55;
  for (const c of colliders) {
    if (car.x < c.minX - radius || car.x > c.maxX + radius || car.z < c.minZ - radius || car.z > c.maxZ + radius) continue;
    const dl = Math.abs(car.x - (c.minX - radius));
    const dr = Math.abs(car.x - (c.maxX + radius));
    const dn = Math.abs(car.z - (c.minZ - radius));
    const df = Math.abs(car.z - (c.maxZ + radius));
    const min = Math.min(dl, dr, dn, df);
    if (min === dl) car.x = c.minX - radius;
    else if (min === dr) car.x = c.maxX + radius;
    else if (min === dn) car.z = c.minZ - radius;
    else car.z = c.maxZ + radius;
    car.vx *= .2;
    car.vz *= .2;
  }
}

function resetCar(silent = false) {
  const road = nearestRoad(car.x, car.z, 30);
  car.x = road ? road.x : CONFIG.spawn.x;
  car.z = road ? road.z : CONFIG.spawn.z;
  car.heading = road ? road.angle : CONFIG.spawn.heading;
  car.y = groundHeightAt(car.x, car.z);
  car.groundY = car.y;
  car.vx = 0; car.vz = 0; car.vy = 0;
  car.airborne = false;
  car.waterTime = 0;
  game.airborneStart = null;
  if (!silent) toast('Car reset · nearest road');
}

function updateCar(dt) {
  const handbrake = input.handbrake;
  let fwd = { x: Math.sin(car.heading), z: Math.cos(car.heading) };
  let right = { x: Math.cos(car.heading), z: -Math.sin(car.heading) };
  const speedAbs = Math.hypot(car.vx, car.vz);
  const surface = surfaceAt(car.x, car.z);
  // Positive yaw turns toward local +X, which reads as screen-left from the chase camera.
  const steerTarget = (input.left ? 1 : 0) - (input.right ? 1 : 0);
  car.steer = damp(car.steer, steerTarget, 11, dt);

  const speedNorm = clamp(speedAbs / CONFIG.car.maxSpeed, 0, 1);
  let yawRate = car.steer * CONFIG.car.steer * (.52 - .18 * speedNorm) * (handbrake ? 1.55 : 1) * clamp(speedAbs / 7, 0, 1);
  if (speedAbs < 1.2) yawRate = 0;
  car.heading += yawRate * dt * (car.vx * fwd.x + car.vz * fwd.z < 0 ? -1 : 1);

  fwd = { x: Math.sin(car.heading), z: Math.cos(car.heading) };
  right = { x: Math.cos(car.heading), z: -Math.sin(car.heading) };
  let vF = car.vx * fwd.x + car.vz * fwd.z;
  let vR = car.vx * right.x + car.vz * right.z;

  if (!car.airborne) {
    const maxSpeed = CONFIG.car.maxSpeed * (surface.road ? 1 : .72);
    const throttle = input.up ? 1 : 0;
    const braking = input.down ? 1 : 0;
    if (throttle) vF += CONFIG.car.power * .56 * (1 - clamp(vF / maxSpeed, 0, 1)) * dt;
    if (braking) {
      if (vF > .8) vF -= CONFIG.car.brake * dt;
      else vF -= CONFIG.car.reversePower * dt;
    }
    vF -= vF * CONFIG.car.drag * dt;
    vF -= Math.abs(vF) * surface.drag * dt * .05;
    const slope = (groundHeightAt(car.x + fwd.x * 2, car.z + fwd.z * 2) - groundHeightAt(car.x - fwd.x * 2, car.z - fwd.z * 2)) / 4;
    vF -= 9.81 * slope * dt * .58;
    if (!throttle && !braking && speedAbs < 1.4) vF = 0;
    vF = clamp(vF, -18, maxSpeed);

    const sliding = Math.abs(vR) > 2.4;
    const grip = (handbrake ? CONFIG.car.handbrakeGrip : sliding ? CONFIG.car.driftGrip : CONFIG.car.grip) * surface.grip;
    vR *= Math.exp(-grip * dt);
    if (handbrake && Math.abs(vF) > 4) vR += car.steer * Math.abs(vF) * .11 * dt;
  } else {
    vF *= 1 - .04 * dt;
  }

  car.vx = fwd.x * vF + right.x * vR;
  car.vz = fwd.z * vF + right.z * vR;
  car.x += car.vx * dt;
  car.z += car.vz * dt;
  car.slip = Math.abs(vR) / Math.max(2, Math.abs(vF));

  resolveCollisions();
  car.x = clamp(car.x, -WORLD_HALF + 8, WORLD_HALF - 8);
  car.z = clamp(car.z, -WORLD_HALF + 8, WORLD_HALF - 8);

  const ground = groundHeightAt(car.x, car.z);
  const previousGround = car.groundY;
  if (!car.airborne) {
    if (previousGround - ground > .52 && speedAbs > 13) {
      car.airborne = true;
      car.vy = clamp((previousGround - ground) * 2.3, 0, 7);
      game.airborneStart = { x: car.x, z: car.z, y: car.y, t: 0 };
      car.y = previousGround;
    } else {
      car.y = ground;
      car.groundY = ground;
    }
  }
  if (car.airborne) {
    car.vy -= 24 * dt;
    car.y += car.vy * dt;
    game.airborneStart && (game.airborneStart.t += dt);
    if (car.y <= ground) {
      car.y = ground;
      car.groundY = ground;
      car.airborne = false;
      car.vy = 0;
      handleLanding();
    }
  }

  const ocean = terrainHeight(car.x, car.z) < -.5 && car.x < -780;
  if (ocean && car.y < .8) {
    car.waterTime += dt;
    car.vx *= .94;
    car.vz *= .94;
    if (car.waterTime > 1.1) {
      resetCar(true);
      toast('Minato Bay · reset to the coast road');
    }
  } else car.waterTime = 0;

  car.speed = Math.hypot(car.vx, car.vz);
  car.wheelSpin += vF * dt / .36;
  wheelData.forEach((w) => {
    w.spin.rotation.x = car.wheelSpin;
    if (w.front) w.pivot.rotation.y = car.steer * .4;
  });

  // Align the shell to the surface or to the jump arc.
  let targetPitch;
  let targetRoll;
  if (car.airborne) {
    targetPitch = clamp(-car.vy * .028, -.28, .28);
    targetRoll = 0;
  } else {
    const frontH = groundHeightAt(car.x + fwd.x * 1.35, car.z + fwd.z * 1.35);
    const backH = groundHeightAt(car.x - fwd.x * 1.35, car.z - fwd.z * 1.35);
    const rightH = groundHeightAt(car.x + right.x * .9, car.z + right.z * .9);
    const leftH = groundHeightAt(car.x - right.x * .9, car.z - right.z * .9);
    targetPitch = -Math.atan2(frontH - backH, 2.7);
    targetRoll = Math.atan2(rightH - leftH, 1.8);
    targetPitch += clamp(-vF * yawRate * .006, -.1, .1);
  }
  carRoot.rotation.y = car.heading;
  carRoot.rotation.x = damp(carRoot.rotation.x, targetPitch, 9, dt);
  carRoot.rotation.z = damp(carRoot.rotation.z, targetRoll, 7, dt);
  carRoot.position.set(car.x, car.y, car.z);

  carShadow.position.set(car.x, groundHeightAt(car.x, car.z) + .025, car.z);
  carShadow.rotation.z = -car.heading;
  carShadow.material.opacity = car.airborne ? .18 : .42;

  headlight.intensity = game.nightFactor * 2.8;
  tailMat.emissiveIntensity = .7 + (input.down || handbrake ? 2.4 : 0);
  brakeMat.emissiveIntensity = .4 + (input.down || handbrake ? 2.2 : 0);
}

function updateCamera(dt) {
  const fwd = { x: Math.sin(car.heading), z: Math.cos(car.heading) };
  const speed = car.speed;
  let distance = 10.4 + speed * .045;
  let height = 4.05 + speed * .012;
  let lookAhead = 6.2;
  if (car.cameraMode === 1) {
    distance = 14.5;
    height = 6.3;
    lookAhead = 7;
  } else if (car.cameraMode === 2) {
    distance = -0.2;
    height = 1.18;
    lookAhead = 10;
  }
  const desired = new THREE.Vector3(
    car.x - fwd.x * distance,
    car.y + height,
    car.z - fwd.z * distance
  );
  const floor = visualTerrainHeight(desired.x, desired.z) + 1.15;
  if (desired.y < floor) desired.y = floor;
  const rate = car.cameraMode === 2 ? 22 : 5.5;
  camera.position.lerp(desired, 1 - Math.exp(-rate * dt));
  const look = new THREE.Vector3(
    car.x + fwd.x * lookAhead,
    car.y + (car.cameraMode === 2 ? 1.15 : 1.5),
    car.z + fwd.z * lookAhead
  );
  camera.lookAt(look);
  camera.fov = damp(camera.fov, 58 + Math.min(10, speed * .15), 4, dt);
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------------------
// Time, weather and atmosphere
// ---------------------------------------------------------------------------
Object.assign(game, {
  time: 16.4,
  weather: 'clear',
  weatherTimer: 0,
  nightFactor: 0,
  elapsed: 0,
  eventTimer: 0,
  mapOpen: false,
  fps: 0,
  compassTick: 0,
  mapTick: 0,
  driftIdle: 0
});

const dayTop = new THREE.Color(0x3c6f9e);
const dayHorizon = new THREE.Color(0xc3dbe2);
const duskTop = new THREE.Color(0x273555);
const duskHorizon = new THREE.Color(0xf4b37c);
const nightTop = new THREE.Color(0x050b16);
const nightHorizon = new THREE.Color(0x172334);
const sunDir = new THREE.Vector3();
const tempTop = new THREE.Color();
const tempHorizon = new THREE.Color();
const tempColor = new THREE.Color();
let mapBase = null;
let mapOpen = false;
let toastTimer = 0;
let lastMapDraw = 0;

function toast(text, duration = 2800) {
  ui.toast.textContent = text;
  ui.toast.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('on'), duration);
}

function showEvent(kicker, name, detail, progress = 0) {
  ui.eventKicker.textContent = kicker;
  ui.eventName.textContent = name;
  ui.eventDetail.textContent = detail;
  ui.eventBar.style.width = `${clamp(progress, 0, 1) * 100}%`;
  ui.eventCard.classList.add('on');
}

function hideEvent() {
  ui.eventCard.classList.remove('on');
}

function setPrompt(text) {
  ui.promptText.textContent = text;
  ui.prompt.classList.toggle('on', Boolean(text));
}

function weatherName(type) {
  return type === 'rain' ? 'Rain' : type === 'snow' ? 'Snow' : 'Clear';
}

function cycleWeather(silent = false) {
  const order = ['clear', 'rain', 'snow'];
  const index = order.indexOf(game.weather);
  game.weather = order[(index + 1) % order.length];
  game.weatherTimer = 0;
  if (!silent) toast(`${weatherName(game.weather)} front rolling through Kai`);
}

function cycleTime() {
  game.time = (game.time + 2) % 24;
  toast(`Local time ${formatClock(game.time)}`);
}

function formatClock(time) {
  const h = Math.floor(time) % 24;
  const m = Math.floor((time - Math.floor(time)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function updatePointCloud(points, fall, drift, swirl, dt) {
  if (!points || !points.visible) return;
  const arr = points.geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i + 1] -= fall * dt;
    arr[i] += drift * dt + Math.sin(game.elapsed * 1.7 + i) * swirl * dt;
    arr[i + 2] += Math.cos(game.elapsed * 1.2 + i * .7) * swirl * .6 * dt;
    if (arr[i + 1] < -2) {
      arr[i + 1] = 46;
      arr[i] = rand(-68, 68);
      arr[i + 2] = rand(-68, 68);
    }
    if (arr[i] > 72) arr[i] -= 144;
    if (arr[i] < -72) arr[i] += 144;
    if (arr[i + 2] > 72) arr[i + 2] -= 144;
    if (arr[i + 2] < -72) arr[i + 2] += 144;
  }
  points.geometry.attributes.position.needsUpdate = true;
  points.position.set(car.x, 0, car.z);
}

function updateEnvironment(dt) {
  game.time = (game.time + dt * 24 / CONFIG.dayLengthSeconds) % 24;
  game.weatherTimer += dt;
  if (game.weatherTimer > CONFIG.weatherCycleSeconds) cycleWeather(true);

  const angle = ((game.time - 6) / 24) * Math.PI * 2;
  sunDir.set(Math.cos(angle), Math.sin(angle), .32).normalize();
  const sunY = sunDir.y;
  const dayT = smoothstep(-.08, .18, sunY);
  const duskT = (1 - smoothstep(.12, .4, Math.abs(sunY))) * smoothstep(-.2, .08, sunY);
  game.nightFactor = 1 - smoothstep(-.14, .12, sunY);

  tempTop.copy(nightTop).lerp(dayTop, dayT).lerp(duskTop, duskT * .55);
  tempHorizon.copy(nightHorizon).lerp(dayHorizon, dayT).lerp(duskHorizon, duskT * .8);
  skyUniforms.topColor.value.copy(tempTop);
  skyUniforms.horizonColor.value.copy(tempHorizon);
  skyUniforms.sunDirection.value.copy(sunDir);
  skyUniforms.sunColor.value.setHex(0xffe8c2).lerp(new THREE.Color(0xfff5dd), clamp(sunY * 2, 0, 1));
  skyUniforms.night.value = game.nightFactor;
  sky.position.set(camera.position.x, 0, camera.position.z);

  sunLight.position.set(sunDir.x * 900, sunDir.y * 900, sunDir.z * 900);
  sunLight.intensity = Math.max(0, sunY) * 2.1;
  sunLight.color.copy(skyUniforms.sunColor.value);
  hemisphere.intensity = .42 + dayT * 1.02;
  ambient.intensity = .2 + dayT * .3;
  scene.fog.color.copy(tempHorizon);

  const altitude = terrainHeight(car.x, car.z);
  let fogFar = CONFIG.drawDistance + dayT * 180;
  let fogNear = 220;
  if (game.weather === 'rain') { fogFar = 720; fogNear = 130; }
  if (game.weather === 'snow') { fogFar = 580; fogNear = 105; }
  if (altitude > 145) { fogFar = Math.min(fogFar, 980); fogNear = 170; }
  scene.fog.near = fogNear;
  scene.fog.far = fogFar;

  buildingMaterials.forEach((m) => { m.emissiveIntensity = .07 + game.nightFactor * .48; });
  windowLitMat.emissiveIntensity = .45 + game.nightFactor * 1.7;
  tempColor.copy(nightHorizon).lerp(dayHorizon, dayT);
  cloudGroup.children.forEach((c) => {
    c.material.color.copy(tempColor);
    c.material.opacity = .1 + dayT * .16;
  });

  const rain = game.weather === 'rain';
  const snow = game.weather === 'snow' || (game.weather !== 'rain' && altitude > 182);
  weatherState.rain.visible = rain;
  weatherState.snow.visible = snow;
  weatherState.petals.visible = !rain && !snow && altitude < 125 && game.nightFactor < .52;
  updatePointCloud(weatherState.rain, 42, 4, 1.0, dt);
  updatePointCloud(weatherState.snow, 3.4, .4, 1.8, dt);
  updatePointCloud(weatherState.petals, .8, .8, 2.8, dt);
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------
function buildMapBase() {
  const size = 400;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    const z = -WORLD_HALF + (py + .5) / size * CONFIG.worldSize;
    for (let px = 0; px < size; px++) {
      const x = -WORLD_HALF + (px + .5) / size * CONFIG.worldSize;
      const h = terrainHeight(x, z);
      let c;
      if (h < -.15) {
        const depth = clamp(-h / 24, 0, 1);
        c = new THREE.Color(0x1b4a59).lerp(new THREE.Color(0x0b2633), depth);
      } else {
        c = terrainColor(x, z, h);
        const shade = clamp(.78 + h / 520, .74, 1.1);
        c = c.clone().multiplyScalar(shade);
      }
      const i = (py * size + px) * 4;
      img.data[i] = c.r * 255;
      img.data[i + 1] = c.g * 255;
      img.data[i + 2] = c.b * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2f7180';
  ctx.lineWidth = Math.max(1.2, 13 / CONFIG.worldSize * size * 2.2);
  ctx.beginPath();
  riverPoints.forEach((p, i) => {
    const px = (p.x + WORLD_HALF) / CONFIG.worldSize * size;
    const py = (p.z + WORLD_HALF) / CONFIG.worldSize * size;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  for (const [x, z, radius] of pondData) {
    const px = (x + WORLD_HALF) / CONFIG.worldSize * size;
    const py = (z + WORLD_HALF) / CONFIG.worldSize * size;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.2, radius / CONFIG.worldSize * size * 2.2), 0, Math.PI * 2);
    ctx.fillStyle = '#3f7b83';
    ctx.fill();
  }
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(17,22,23,.22)';
  ctx.fillRect((CITY.x - CITY.width / 2 + WORLD_HALF) / CONFIG.worldSize * size, (CITY.z - CITY.depth / 2 + WORLD_HALF) / CONFIG.worldSize * size, CITY.width / CONFIG.worldSize * size, CITY.depth / CONFIG.worldSize * size);
  for (const road of roads) {
    ctx.strokeStyle = road.type === 'dirt' ? '#9b7956' : road.type === 'gravel' ? '#ae9a7d' : road.type === 'snow' ? '#d7e1e1' : '#a8aaa2';
    ctx.lineWidth = Math.max(1.1, road.width / CONFIG.worldSize * size * 2.4);
    ctx.beginPath();
    road.points.forEach((p, i) => {
      const px = (p.x + WORLD_HALF) / CONFIG.worldSize * size;
      const py = (p.z + WORLD_HALF) / CONFIG.worldSize * size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
  for (const road of elevatedRoads) {
    ctx.strokeStyle = 'rgba(222,230,228,.75)';
    ctx.lineWidth = Math.max(.5, road.width / CONFIG.worldSize * size * 1.2);
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    road.points.forEach((p, i) => {
      const px = (p.x + WORLD_HALF) / CONFIG.worldSize * size;
      const py = (p.z + WORLD_HALF) / CONFIG.worldSize * size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
  ctx.restore();
  mapBase = canvas;
}

function mapPoint(x, z, size) {
  return {
    x: (x + WORLD_HALF) / CONFIG.worldSize * size,
    y: (z + WORLD_HALF) / CONFIG.worldSize * size
  };
}

function drawMarker(ctx, a, size, full = false) {
  const p = mapPoint(a.x, a.z, size);
  const color = a.color || activityColors[a.type] || '#fff';
  ctx.globalAlpha = a.done ? .3 : .96;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(4,10,12,.7)';
  ctx.lineWidth = full ? 1.4 : 1.2;
  const r = full ? (a.type === 'race' ? 8 : 5.5) : (a.type === 'race' ? 4.5 : 3);
  if (a.type === 'race') {
    ctx.beginPath();
    ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();
  } else if (a.type === 'barn') {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r);
    ctx.lineTo(p.x + r, p.y);
    ctx.lineTo(p.x, p.y + r);
    ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (full && a.type === 'race') {
    ctx.globalAlpha = a.done ? .35 : .9;
    ctx.fillStyle = '#fff7e7';
    ctx.font = '700 14px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(a.name, p.x + 13, p.y + 5);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx, size, full = false) {
  const p = mapPoint(car.x, car.z, size);
  const angle = Math.atan2(Math.cos(car.heading), Math.sin(car.heading));
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);
  ctx.fillStyle = '#fff9dd';
  ctx.strokeStyle = '#ff4b3e';
  ctx.lineWidth = full ? 2.5 : 1.5;
  ctx.beginPath();
  const s = full ? 12 : 7;
  ctx.moveTo(s, 0);
  ctx.lineTo(-s * .7, -s * .58);
  ctx.lineTo(-s * .34, 0);
  ctx.lineTo(-s * .7, s * .58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMinimap() {
  if (!mapBase) return;
  const ctx = ui.minimap.getContext('2d');
  const size = ui.minimap.width;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(mapBase, 0, 0, size, size);
  for (const a of activities) drawMarker(ctx, a, size, false);
  drawPlayer(ctx, size, false);
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
}

function drawFullMap() {
  if (!mapBase) return;
  const ctx = ui.mapCanvas.getContext('2d');
  const size = ui.mapCanvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(mapBase, 0, 0, size, size);
  for (const a of activities) drawMarker(ctx, a, size, true);
  drawPlayer(ctx, size, true);
  ctx.fillStyle = 'rgba(255,248,230,.8)';
  ctx.font = '800 16px Segoe UI, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', size / 2, 26);
  ctx.fillStyle = 'rgba(255,248,230,.4)';
  ctx.beginPath();
  ctx.moveTo(size / 2, 11);
  ctx.lineTo(size / 2 - 5, 19);
  ctx.lineTo(size / 2 + 5, 19);
  ctx.closePath();
  ctx.fill();
}

function drawCompass() {
  const ctx = ui.compass.getContext('2d');
  const w = ui.compass.width;
  const h = ui.compass.height;
  ctx.clearRect(0, 0, w, h);
  const bearing = ((car.heading * 180 / Math.PI) + 180 + 360) % 360;
  ctx.strokeStyle = 'rgba(214,232,235,.35)';
  ctx.fillStyle = 'rgba(214,232,235,.7)';
  ctx.font = '600 8px Segoe UI, Arial, sans-serif';
  ctx.textAlign = 'center';
  for (let deg = 0; deg < 360; deg += 10) {
    let rel = ((deg - bearing + 540) % 360) - 180;
    if (Math.abs(rel) > 55) continue;
    const x = w / 2 + rel / 55 * 148;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x, deg % 30 === 0 ? 18 : 14);
    ctx.stroke();
    if (deg % 90 === 0) {
      ctx.fillStyle = deg === 0 ? '#ff9b8e' : 'rgba(232,241,241,.88)';
      ctx.fillText(['N', 'E', 'S', 'W'][deg / 90], x, 32);
    }
  }
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(w / 2, 10);
  ctx.lineTo(w / 2 - 4, 17);
  ctx.lineTo(w / 2 + 4, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(214,232,235,.55)';
  ctx.font = '700 8px Segoe UI, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(bearing).toString().padStart(3, '0')}°`, w - 8, 32);
}

// ---------------------------------------------------------------------------
// Score and activities
// ---------------------------------------------------------------------------
function rankFor(xp) {
  if (xp >= 60000) return 'KAI LEGEND';
  if (xp >= 30000) return 'TOUGE ACE';
  if (xp >= 15000) return 'NIGHT RUNNER';
  if (xp >= 5000) return 'LOCAL';
  return 'ROOKIE';
}

function award(base, label) {
  game.chain = Math.min(20, game.chain + 1);
  game.chainTimer = 9;
  game.multiplier = 1 + Math.min(5, game.chain * .25);
  const total = Math.round(base * game.multiplier);
  game.xp += total;
  toast(`${label} +${total.toLocaleString()} XP · x${game.multiplier.toFixed(1)}`);
}

function markDone(a) {
  if (a.done) return false;
  a.done = true;
  game.done.add(a.id);
  if (a.group) a.group.visible = false;
  return true;
}

function completeActivity(a, points, label) {
  if (!markDone(a)) return;
  award(points, label || a.name);
}

function handleLanding() {
  completeLanding();
}

function completeLanding() {
  if (!game.airborneStart) return;
  const start = game.airborneStart;
  game.airborneStart = null;
  const distance = Math.hypot(car.x - start.x, car.z - start.z);
  if (distance < 4) return;
  const danger = activities.find((a) => a.type === 'danger' && !a.done && Math.hypot(a.x - start.x, a.z - start.z) < 36);
  if (danger) completeActivity(danger, danger.ramp ? 3200 : 2400, 'DANGER SIGN');
  else award(Math.min(3200, Math.round(distance * 25)), 'AIR DISTANCE');
}

function startRace(race) {
  if (game.race) return;
  car.x = race.start.x;
  car.z = race.start.z;
  car.heading = race.start.angle;
  car.y = groundHeightAt(car.x, car.z);
  car.groundY = car.y;
  car.vx = 0; car.vz = 0; car.vy = 0;
  car.airborne = false;
  carRoot.position.set(car.x, car.y, car.z);
  camera.position.set(car.x - Math.sin(car.heading) * 9, car.y + 3.5, car.z - Math.cos(car.heading) * 9);
  game.race = { race, index: 0, time: 0, countdown: 2.4 };
  game.zone = null;
  game.driftZone = null;
  race.checkpoints.forEach((cp) => { cp.mat.opacity = .3; cp.ring.scale.setScalar(1); });
  showEvent('RACE', race.name, 'START IN 3', 0);
  toast(`Event started · ${race.name}`);
}

function finishRace() {
  const current = game.race;
  if (!current) return;
  const race = current.race;
  const time = current.time;
  const previous = race.best;
  if (!previous || time < previous) {
    race.best = time;
    try { localStorage.setItem(`nippon-best-${race.name}`, String(time)); } catch (e) { /* storage may be unavailable */ }
    toast(`NEW BEST · ${race.name} · ${time.toFixed(2)}s`, 4200);
  } else {
    toast(`${race.name} · ${time.toFixed(2)}s · best ${previous.toFixed(2)}s`);
  }
  markDone(race.activity);
  award(10000 + Math.max(0, 4000 - time * 25), 'RACE COMPLETE');
  game.race = null;
  game.eventTimer = 5;
  race.checkpoints.forEach((cp) => { cp.mat.opacity = .28; cp.ring.scale.setScalar(1); });
  showEvent('FINISH', race.name, `${time.toFixed(2)}s · ${race.kind}`, 1);
}

function updateRace(dt) {
  if (!game.race) return;
  const current = game.race;
  const race = current.race;
  if (current.countdown > 0) {
    current.countdown -= dt;
    car.vx = 0; car.vz = 0; car.vy = 0; car.airborne = false;
    car.y = groundHeightAt(car.x, car.z);
    car.groundY = car.y;
    showEvent('RACE', race.name, `START IN ${Math.max(1, Math.ceil(current.countdown))}`, 0);
    if (current.countdown <= 0) {
      toast('GO · ' + race.name);
      showEvent('RACE', race.name, 'Checkpoint 1 / ' + race.checkpoints.length, 0);
    }
    return;
  }
  current.time += dt;
  const cp = race.checkpoints[current.index];
  if (!cp) { finishRace(); return; }
  const dist = Math.hypot(car.x - cp.x, car.z - cp.z);
  cp.mat.opacity = .92;
  cp.ring.scale.setScalar(1 + Math.sin(game.elapsed * 5) * .04);
  race.checkpoints.forEach((other, index) => {
    if (index !== current.index) other.mat.opacity = index < current.index ? .1 : .27;
    if (index !== current.index) other.ring.scale.setScalar(1);
  });
  showEvent('RACE', race.name, `Checkpoint ${current.index + 1} / ${race.checkpoints.length} · ${dist.toFixed(0)} m`, current.index / race.checkpoints.length);
  const passRadius = Math.max(22, Math.min(46, car.speed * .62));
  if (dist < passRadius) {
    current.index++;
    if (current.index >= race.checkpoints.length) finishRace();
    else toast(`Checkpoint ${current.index} · ${current.time.toFixed(1)}s`);
  }
}

function bankDrift() {
  const a = game.driftZone;
  if (!a) return;
  if (a.score > 100) completeActivity(a, Math.round(a.score * .55), 'DRIFT ZONE');
  else hideEvent();
  game.driftZone = null;
  game.driftIdle = 0;
}

function updateActivities(dt) {
  if (game.chainTimer > 0) {
    game.chainTimer -= dt;
    if (game.chainTimer <= 0) {
      game.chain = 0;
      game.multiplier = 1;
    }
  }
  for (const a of activities) {
    if (a.cooldown > 0) a.cooldown -= dt;
    if (a.type === 'collectible' && !a.done) {
      a.group.rotation.y += dt * .9;
      a.group.position.y = terrainHeight(a.x, a.z) + .08 + Math.sin(game.elapsed * 2 + a.id) * .16;
    }
  }

  updateRace(dt);

  if (!game.race) {
    // Speed traps
    for (const a of activities) {
      if (a.type !== 'trap' || (a.cooldown || 0) > 0) continue;
      if (Math.hypot(car.x - a.x, car.z - a.z) < 20 && car.speed > 5) {
        const kmh = car.speed * 3.6;
        a.cooldown = 3;
        if (kmh > a.best) {
          a.best = kmh;
          if (!a.done) completeActivity(a, 2600, 'SPEED TRAP');
          else toast(`Speed trap · ${Math.round(kmh)} km/h`);
        }
      }
    }

    // Speed zones
    if (game.zone) {
      game.zone.t += dt;
      const zone = game.zone.a.zone;
      const dEnd = Math.hypot(car.x - zone.end.x, car.z - zone.end.z);
      showEvent('SPEED ZONE', game.zone.a.name, `${Math.round(game.zone.t)}s · finish ${dEnd.toFixed(0)} m`, clamp(1 - dEnd / Math.max(1, zone.length), 0, 1));
      if (dEnd < 26) {
        const avg = (zone.length / Math.max(1, game.zone.t)) * 3.6;
        if (avg >= 95) {
          completeActivity(game.zone.a, 3500, 'SPEED ZONE');
          showEvent('ZONE COMPLETE', game.zone.a.name, `${Math.round(avg)} km/h average`, 1);
          game.eventTimer = 3;
        } else toast(`Zone average ${Math.round(avg)} km/h · retry for 95`);
        game.zone = null;
      } else if (game.zone.t > 45) {
        toast('Speed zone timed out');
        game.zone = null;
      }
    } else {
      const zone = activities.find((a) => a.type === 'zone' && !a.done && Math.hypot(car.x - a.x, car.z - a.z) < 24 && car.speed > 6);
      if (zone) {
        game.zone = { a: zone, t: 0 };
        toast(`Speed zone · ${zone.name}`);
      }
    }

    // Drift zones
    const nearDrift = activities.find((a) => a.type === 'drift' && !a.done && Math.hypot(car.x - a.x, car.z - a.z) < a.radius);
    const drifting = car.speed > 8 && (input.handbrake || car.slip > .16);
    if (game.driftZone) {
      const current = game.driftZone;
      if (current === nearDrift && drifting) {
        current.score += car.speed * Math.max(.18, car.slip) * dt * 6.5;
        game.driftIdle = 0;
        showEvent('DRIFT ZONE', current.name, `${Math.round(current.score)} pts · hold the slide`, clamp(current.score / 1400, 0, 1));
      } else {
        game.driftIdle += dt;
        if (game.driftIdle > 1 || !nearDrift) bankDrift();
      }
    } else if (nearDrift && drifting) {
      nearDrift.score = 0;
      game.driftZone = nearDrift;
      game.driftIdle = 0;
      toast(`Drift zone · ${nearDrift.name}`);
    }
  }

  // Boards, cats and barn interactions.
  for (const a of activities) {
    if (a.done) continue;
    if (a.type === 'board' && Math.hypot(car.x - a.x, car.z - a.z) < 8 && car.speed > 3) {
      completeActivity(a, a.amount, 'BONUS BOARD');
    } else if (a.type === 'collectible' && Math.hypot(car.x - a.x, car.z - a.z) < 7) {
      completeActivity(a, 1800, 'LUCKY CAT');
    }
  }

  let barn = null;
  for (const a of activities) {
    if (a.type === 'barn' && !a.done && Math.hypot(car.x - a.x, car.z - a.z) < 19) { barn = a; break; }
  }
  game.barnPrompt = barn;
  let raceStart = null;
  if (!game.race) {
    for (const a of activities) {
      if (a.type === 'race' && !a.done && Math.hypot(car.x - a.x, car.z - a.z) < 20) { raceStart = a; break; }
    }
  }
  game.racePrompt = raceStart;
  if (barn) setPrompt(`inspect ${barn.name} barn`);
  else if (raceStart) setPrompt(`start ${raceStart.name}`);
  else setPrompt('');

  if (!game.race && !game.zone && !game.driftZone && game.eventTimer > 0) {
    game.eventTimer -= dt;
    if (game.eventTimer <= 0) hideEvent();
  }
}

function interact() {
  if (game.race) return;
  if (game.barnPrompt) {
    completeActivity(game.barnPrompt, 7500, 'BARN FIND');
    toast(`BARN FIND · ${game.barnPrompt.name} added to the collection`);
    game.barnPrompt = null;
    setPrompt('');
    return;
  }
  if (game.racePrompt) startRace(game.racePrompt.race);
}

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------
let fpsFrames = 0;
let fpsClock = 0;

function updateHud(dt) {
  const kmh = Math.round(car.speed * 3.6);
  ui.speed.textContent = String(kmh);
  const forwardSpeed = car.vx * Math.sin(car.heading) + car.vz * Math.cos(car.heading);
  ui.gear.textContent = forwardSpeed < -.5 ? 'R' : car.speed < .6 ? 'N' : String(Math.min(6, 1 + Math.floor(car.speed / 13)));
  ui.rpm.style.width = `${clamp(car.speed / CONFIG.car.maxSpeed, 0, 1.18) * 100}%`;
  ui.drift.classList.toggle('on', car.slip > .17 && car.speed > 8);
  ui.area.textContent = regionAt(car.x, car.z);
  ui.clock.textContent = formatClock(game.time);
  ui.weather.textContent = weatherName(game.weather);
  ui.weatherShort.textContent = weatherName(game.weather) + ' skies';
  ui.altitude.textContent = `${Math.max(0, Math.round(terrainHeight(car.x, car.z)))} m`;
  ui.score.textContent = Math.round(game.xp).toLocaleString();
  ui.rank.textContent = rankFor(game.xp);
  ui.combo.textContent = `x${game.multiplier.toFixed(1)}`;
  ui.combo.classList.toggle('hot', game.multiplier > 1.4);
  ui.stunts.textContent = `ACTIVITIES ${game.done.size} / ${activityTotal}`;
  fpsFrames++;
  fpsClock += dt;
  if (fpsClock > .5) {
    game.fps = Math.round(fpsFrames / fpsClock);
    ui.fps.textContent = `${game.fps} FPS`;
    fpsFrames = 0;
    fpsClock = 0;
  }
  game.compassTick += dt;
  if (game.compassTick > .1) { drawCompass(); game.compassTick = 0; }
  game.mapTick += dt;
  if (game.mapTick > .12) { drawMinimap(); game.mapTick = 0; }
  if (game.mapOpen && game.elapsed - lastMapDraw > .35) {
    drawFullMap();
    lastMapDraw = game.elapsed;
  }
}

function toggleMap(force) {
  mapOpen = force == null ? !mapOpen : force;
  game.mapOpen = mapOpen;
  ui.mapPanel.classList.toggle('open', mapOpen);
  ui.mapPanel.setAttribute('aria-hidden', mapOpen ? 'false' : 'true');
  if (mapOpen) {
    car.vx = 0; car.vz = 0;
    Object.keys(input).forEach((k) => { input[k] = false; });
    drawFullMap();
  }
}

// ---------------------------------------------------------------------------
// Input and boot
// ---------------------------------------------------------------------------
const keyBinds = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'handbrake'
};

window.addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (e.code === 'Escape' || e.code === 'KeyM') { toggleMap(); return; }
  if (mapOpen) return;
  if (keyBinds[e.code]) { input[keyBinds[e.code]] = true; return; }
  if (e.code === 'KeyR') { resetCar(); return; }
  if (e.code === 'KeyC') {
    car.cameraMode = (car.cameraMode + 1) % 3;
    toast(['Chase camera', 'Long lens', 'Hood camera'][car.cameraMode]);
    return;
  }
  if (e.code === 'KeyE') { interact(); return; }
  if (e.code === 'KeyT') { cycleTime(); return; }
  if (e.code === 'KeyY') { cycleWeather(); return; }
});

window.addEventListener('keyup', (e) => {
  if (keyBinds[e.code]) input[keyBinds[e.code]] = false;
});
window.addEventListener('blur', () => Object.keys(input).forEach((k) => { input[k] = false; }));
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
ui.mapClose.addEventListener('click', () => toggleMap(false));

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setLoad(pct, text) {
  ui.loadFill.style.width = `${pct}%`;
  ui.loadStatus.textContent = text;
}

async function boot() {
  setLoad(8, 'Sculpting the Kai coastline');
  await nextFrame();
  buildTerrainChunks();
  setLoad(42, 'Cutting the Kurohana hairpins');
  await nextFrame();
  buildMapBase();
  setLoad(78, 'Placing the last lucky cat');
  await nextFrame();
  resetCar(true);
  car.y = groundHeightAt(car.x, car.z);
  car.groundY = car.y;
  carRoot.position.set(car.x, car.y, car.z);
  const fwd = { x: Math.sin(car.heading), z: Math.cos(car.heading) };
  camera.position.set(car.x - fwd.x * 9, car.y + 3.5, car.z - fwd.z * 9);
  camera.lookAt(car.x + fwd.x * 4, car.y + 1.4, car.z + fwd.z * 4);
  game.time = 15.6;
  game.weather = 'clear';
  updateEnvironment(0);
  updateHud(0);
  drawMinimap();
  updateTerrainLOD(0, true);
  setLoad(100, 'Ready to drive');
  await nextFrame();
  ui.loading.classList.add('hide');
  setTimeout(() => { ui.loading.style.display = 'none'; }, 700);

  window.__japan = {
    CONFIG,
    game,
    car,
    carRoot,
    activities,
    races,
    roads,
    roadSegments,
    camera,
    renderer,
    scene,
    mapBase: () => mapBase,
    teleport(x, z, heading = car.heading) {
      car.x = x; car.z = z; car.heading = heading;
      car.vx = 0; car.vz = 0; car.vy = 0; car.airborne = false;
      car.y = groundHeightAt(x, z); car.groundY = car.y;
      carRoot.position.set(x, car.y, z);
      carRoot.rotation.set(0, heading, 0);
      const f = { x: Math.sin(heading), z: Math.cos(heading) };
      camera.position.set(x - f.x * 9, car.y + 3.5, z - f.z * 9);
      camera.lookAt(x + f.x * 4, car.y + 1.4, z + f.z * 4);
    },
    setTime(t) { game.time = t; updateEnvironment(0); updateHud(0); },
    setWeather(w) { game.weather = w; game.weatherTimer = 0; updateEnvironment(0); updateHud(0); },
    toggleMap,
    resetCar,
    startRace: (name) => {
      const race = races.find((r) => r.name === name);
      if (race) startRace(race);
    }
  };

  clock.start();
  animate();
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(.05, clock.getDelta());
  game.elapsed += dt;
  if (!game.mapOpen) {
    updateCar(dt);
    updateActivities(dt);
  }
  updateEnvironment(dt);
  updateCamera(dt);
  updateHud(dt);
  updateTerrainLOD(dt);
  renderer.render(scene, camera);
}


// The loading screen must not wait on the heavy terrain build.
boot().catch((err) => {
  console.error(err);
  setLoad(100, 'World generation failed');
  ui.loadStatus.textContent = 'World generation failed — check the console';
});
