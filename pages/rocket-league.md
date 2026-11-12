---
layout: game
title: "Aero Strike - Rocketball Arena"
---

<style type="text/css">
  :root {
    --azure: #35b8ff;
    --ember: #ff6a3d;
    --ink: #f3f9ff;
    --muted: #8ea6b9;
    --panel: rgba(7, 14, 24, .82);
    --line: rgba(255, 255, 255, .14);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: #050810; color: var(--ink); font-family: "Segoe UI", "Trebuchet MS", system-ui, sans-serif; }
  canvas { display: block; }

  .menu-screen {
    position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center;
    padding: 24px; overflow: auto;
    background:
      radial-gradient(circle at 50% 8%, rgba(31, 107, 174, .38), transparent 40%),
      radial-gradient(circle at 12% 90%, rgba(255, 88, 48, .13), transparent 34%),
      linear-gradient(145deg, #071322, #03060c 72%);
  }
  #homescreen { display: flex; }
  .menu-screen::before {
    content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .44;
    background-image:
      linear-gradient(rgba(91, 176, 224, .08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91, 176, 224, .08) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: linear-gradient(to bottom, black, transparent 86%);
  }
  .menu-screen::after {
    content: ""; position: absolute; width: min(78vw, 900px); aspect-ratio: 1;
    border: 1px solid rgba(97, 189, 235, .16); border-radius: 50%;
    box-shadow: 0 0 0 42px rgba(97, 189, 235, .025), 0 0 0 118px rgba(97, 189, 235, .018), 0 0 140px rgba(45, 163, 224, .12);
    pointer-events: none;
  }
  .menu-card {
    position: relative; z-index: 1; width: min(760px, 100%); padding: clamp(26px, 5vw, 52px);
    text-align: center; border: 1px solid var(--line); border-radius: 24px;
    background: linear-gradient(145deg, rgba(12, 27, 44, .93), rgba(5, 10, 18, .94));
    box-shadow: 0 30px 100px rgba(0, 0, 0, .58), inset 0 1px 0 rgba(255, 255, 255, .08);
    backdrop-filter: blur(18px);
  }
  .eyebrow { color: var(--azure); font-size: 10px; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; }
  .logo { margin: 10px 0 4px; font-size: clamp(54px, 11vw, 104px); line-height: .85; letter-spacing: -.075em; font-style: italic; font-weight: 900; }
  .logo span { display: block; color: transparent; background: linear-gradient(95deg, var(--azure), #d4f6ff 48%, var(--ember)); -webkit-background-clip: text; background-clip: text; }
  .tagline { max-width: 440px; margin: 18px auto 0; color: #b9cddd; font-size: 14px; line-height: 1.6; letter-spacing: .02em; }
  .home-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 25px; }
  .btn {
    min-width: 190px; padding: 13px 22px; border: 1px solid rgba(255, 255, 255, .22); border-radius: 10px;
    color: var(--ink); background: rgba(255, 255, 255, .08); font: inherit; font-size: 13px; font-weight: 800;
    letter-spacing: .12em; cursor: pointer; transition: transform .18s, background .18s, border-color .18s;
  }
  .btn:hover, .btn:focus-visible { transform: translateY(-2px); border-color: rgba(255, 255, 255, .55); background: rgba(255, 255, 255, .15); outline: 2px solid #fff; outline-offset: 3px; }
  .btn.primary { color: #06111c; border-color: var(--azure); background: linear-gradient(95deg, var(--azure), #92e6ff); box-shadow: 0 10px 28px rgba(53, 184, 255, .22); }
  .btn.primary:hover { background: linear-gradient(95deg, #8fe8ff, #d5f7ff); }
  .btn.danger { color: #ffd8d0; border-color: rgba(255, 106, 61, .4); background: rgba(255, 106, 61, .1); }
  .btn.ghost { color: var(--muted); background: transparent; }
  .controls {
    display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 19px; margin-top: 24px;
    color: var(--muted); font-size: 10px; letter-spacing: .06em;
  }
  .controls b { color: #e8f6ff; font-weight: 800; }
  .menu-note { margin: 20px 0 0; color: #637b8d; font-size: 9px; line-height: 1.6; letter-spacing: .05em; }

  .menu-card h2 { margin: 8px 0 4px; font-size: clamp(38px, 8vw, 64px); line-height: .9; letter-spacing: -.06em; font-style: italic; }
  .mode-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 24px; text-align: left; }
  .mode-card {
    min-height: 112px; padding: 16px; border: 1px solid var(--line); border-radius: 14px;
    color: var(--ink); background: linear-gradient(145deg, rgba(255, 255, 255, .075), rgba(255, 255, 255, .025));
    cursor: pointer; font: inherit; text-align: left; transition: transform .18s, border-color .18s, background .18s;
  }
  .mode-card:hover, .mode-card:focus-visible { transform: translateY(-3px); border-color: var(--azure); background: linear-gradient(145deg, rgba(53, 184, 255, .16), rgba(255, 255, 255, .03)); outline: 2px solid #fff; outline-offset: 3px; }
  .mode-card b { display: block; font-size: 24px; font-style: italic; letter-spacing: -.03em; }
  .mode-card small { display: block; margin-top: 5px; color: var(--muted); font-size: 11px; line-height: 1.4; }
  .mode-card .mode-kicker { display: block; margin-bottom: 5px; color: var(--azure); font-size: 8px; font-weight: 800; letter-spacing: .19em; text-transform: uppercase; }
  .mode-card.heat .mode-kicker { color: var(--ember); }
  .menu-footer { display: flex; justify-content: center; margin-top: 18px; }
  #pause-sub { min-height: 22px; margin: 10px 0 22px; color: var(--muted); font-size: 14px; letter-spacing: .04em; }

  #ui { display: none; position: fixed; inset: 0; z-index: 10; pointer-events: none; color: #fff; font-family: "Segoe UI", "Trebuchet MS", system-ui, sans-serif; }
  .scorebug {
    position: absolute; top: 18px; left: 50%; display: flex; align-items: center; gap: 18px;
    padding: 10px 16px; transform: translateX(-50%); border: 1px solid var(--line); border-radius: 12px;
    background: var(--panel); box-shadow: 0 15px 40px rgba(0, 0, 0, .4); backdrop-filter: blur(12px);
  }
  .team { display: flex; align-items: center; gap: 9px; min-width: 112px; }
  .team.ember { justify-content: flex-end; }
  .team span { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: .2em; }
  .team b { font-size: 32px; line-height: .8; font-style: italic; letter-spacing: -.04em; }
  .team.azure b { color: var(--azure); text-shadow: 0 0 18px rgba(53, 184, 255, .45); }
  .team.ember b { color: var(--ember); text-shadow: 0 0 18px rgba(255, 106, 61, .45); }
  .match-clock { min-width: 78px; text-align: center; }
  #mode-label { display: block; color: #849bad; font-size: 8px; font-weight: 800; letter-spacing: .19em; }
  #timer { display: block; margin-top: 3px; font-size: 24px; line-height: 1; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.02em; white-space: nowrap; }
  #boost-label { position: absolute; right: 32px; bottom: 73px; color: #ffe59a; font-size: 10px; font-weight: 800; letter-spacing: .18em; text-align: right; }
  #boost-container { position: absolute; right: 30px; bottom: 30px; width: 210px; height: 28px; overflow: hidden; border: 2px solid rgba(255, 255, 255, .8); border-radius: 8px; background: rgba(0, 0, 0, .52); transform: skewX(-20deg); display: none; }
  #boost-fill { height: 100%; width: 33%; background: linear-gradient(90deg, #ffcf4d, #ff8b36); box-shadow: 0 0 20px rgba(255, 206, 77, .75); transition: width .1s; }
  #boost-text { display: none; position: absolute; right: 34px; bottom: 32px; z-index: 2; color: #fff4b8; font-size: 19px; font-weight: 900; font-style: italic; text-shadow: 0 2px 4px #000; }
  #goal-msg { display: none; position: absolute; top: 24%; width: 100%; z-index: 12; color: #fff; font-size: clamp(48px, 9vw, 92px); font-weight: 900; font-style: italic; letter-spacing: -.05em; text-align: center; text-shadow: 0 0 24px rgba(53, 184, 255, .85), 0 5px 0 rgba(0, 0, 0, .5); pointer-events: none; }
  #countdown { position: absolute; top: 36%; width: 100%; z-index: 20; color: #fff; font-size: clamp(70px, 12vw, 140px); font-weight: 900; font-style: italic; text-align: center; text-shadow: 0 0 36px rgba(53, 184, 255, .7), 0 6px 0 rgba(0, 0, 0, .35); pointer-events: none; }
  #replay-ui { display: none; position: absolute; bottom: 24px; left: 26px; z-index: 15; color: #ff8a70; font-size: 11px; font-weight: 800; letter-spacing: .17em; animation: blink .8s infinite; }
  #goal-flash { position: fixed; inset: 0; z-index: 8; opacity: 0; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(170, 234, 255, .4), transparent 58%); }
  #goal-flash.on { animation: goalFlash .6s ease-out; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
  @keyframes goalFlash { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }

  @media (max-width: 680px) {
    .menu-screen { padding: 12px; }
    .menu-card { padding: 24px 16px; border-radius: 18px; }
    .tagline { font-size: 12px; }
    .mode-grid { grid-template-columns: 1fr; }
    .mode-card { min-height: 88px; }
    .scorebug { top: 10px; gap: 8px; padding: 8px 9px; }
    .team { min-width: 67px; gap: 5px; }
    .team span { font-size: 7px; letter-spacing: .12em; }
    .team b { font-size: 25px; }
    #timer { font-size: 19px; }
    #boost-container { right: 14px; bottom: 15px; width: 145px; height: 22px; }
    #boost-label { right: 16px; bottom: 46px; font-size: 8px; }
    #boost-text { right: 18px; bottom: 17px; font-size: 14px; }
    #replay-ui { left: 14px; bottom: 12px; font-size: 9px; }
  }
</style>

<div id="homescreen" class="menu-screen">
  <div class="menu-card">
    <div class="eyebrow">Night League · Rocketball</div>
    <h1 class="logo">AERO<span>STRIKE</span></h1>
    <p class="tagline">Rocket-powered cars. One ball. No brakes. Read the bounce, hit the boost, and own the night.</p>
    <div class="home-actions">
      <button class="btn primary" onclick="showModes()">ENTER THE ARENA</button>
    </div>
    <div class="controls">
      <span><b>WASD</b> drive</span>
      <span><b>SPACE</b> jump / flip</span>
      <span><b>SHIFT</b> boost</span>
      <span><b>ESC</b> pause</span>
    </div>
    <p class="menu-note">Original arena · procedural cars · no external assets</p>
  </div>
</div>

<div id="modescreen" class="menu-screen">
  <div class="menu-card">
    <div class="eyebrow">Choose your match</div>
    <h2>TEAM UP</h2>
    <div class="mode-grid">
      <button class="mode-card" onclick="startGame('1v1')">
        <span class="mode-kicker">Solo duel</span>
        <b>1 v 1</b>
        <small>One rival, one goal. Learn the angles.</small>
      </button>
      <button class="mode-card" onclick="startGame('2v2')">
        <span class="mode-kicker">Squad</span>
        <b>2 v 2</b>
        <small>Trade the ball and cover the middle.</small>
      </button>
      <button class="mode-card" onclick="startGame('3v3')">
        <span class="mode-kicker">Full chaos</span>
        <b>3 v 3</b>
        <small>Six cars, one ball, no clean lane.</small>
      </button>
      <button class="mode-card heat" onclick="startGame('heatseeker')">
        <span class="mode-kicker">Special rule</span>
        <b>HEATSEEKER</b>
        <small>The ball locks onto the next goal. Defend or get burned.</small>
      </button>
      <button class="mode-card" onclick="startGame('practice')">
        <span class="mode-kicker">No clock</span>
        <b>FREE PRACTICE</b>
        <small>Infinite boost. Empty arena. Find your line.</small>
      </button>
    </div>
    <div class="menu-footer">
      <button class="btn ghost" onclick="showHome()">BACK</button>
    </div>
  </div>
</div>

<div id="pausescreen" class="menu-screen">
  <div class="menu-card">
    <div class="eyebrow">Match control</div>
    <h2 id="pause-title">PAUSED</h2>
    <p id="pause-sub">Take a breath. The arena can wait.</p>
    <div class="home-actions">
      <button id="resume-btn" class="btn primary" onclick="togglePause()">RESUME</button>
      <button class="btn" onclick="restartMatch()">RESTART</button>
      <button class="btn danger" onclick="leaveMatch()">LEAVE MATCH</button>
    </div>
  </div>
</div>

<div id="ui">
  <div class="scorebug">
    <div class="team azure"><span>AZURE</span><b id="blue-score">0</b></div>
    <div class="match-clock"><small id="mode-label">DUEL</small><strong id="timer">3:00</strong></div>
    <div class="team ember"><b id="orange-score">0</b><span>EMBER</span></div>
  </div>
  <div id="boost-label">BOOST</div>
  <div id="boost-text">33</div>
  <div id="boost-container"><div id="boost-fill"></div></div>
</div>
<div id="goal-msg">GOAL!</div>
<div id="countdown"></div>
<div id="replay-ui">● REPLAY</div>
<div id="goal-flash"></div>

<script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>

<script type="module">
  import * as THREE from 'three';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // --- Renderer and scene ---------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050810);
  scene.fog = new THREE.Fog(0x07111d, 300, 680);

  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1600);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  scene.add(new THREE.HemisphereLight(0x9fcfff, 0x0a0d17, 1.35));
  scene.add(new THREE.AmbientLight(0xffffff, .16));
  const keyLight = new THREE.DirectionalLight(0xdff4ff, 2.1);
  keyLight.position.set(30, 80, 20);
  scene.add(keyLight);

  // --- Arena ----------------------------------------------------------------
  const arenaW = 200;
  const arenaD = 350;
  const wallH = 40;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaW, arenaD),
    new THREE.MeshStandardMaterial({ color: 0x0b141f, roughness: .86, metalness: .2 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const blueZone = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaW, arenaD / 2),
    new THREE.MeshBasicMaterial({ color: 0x0a3f73, transparent: true, opacity: .32, depthWrite: false })
  );
  blueZone.rotation.x = -Math.PI / 2;
  blueZone.position.set(0, .015, -arenaD / 4);
  scene.add(blueZone);

  const orangeZone = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaW, arenaD / 2),
    new THREE.MeshBasicMaterial({ color: 0x6b2b12, transparent: true, opacity: .27, depthWrite: false })
  );
  orangeZone.rotation.x = -Math.PI / 2;
  orangeZone.position.set(0, .015, arenaD / 4);
  scene.add(orangeZone);

  const linePositions = [];
  for (let x = -arenaW / 2 + 10; x < arenaW / 2; x += 20) linePositions.push(x, .035, -arenaD / 2, x, .035, arenaD / 2);
  for (let z = -arenaD / 2 + 10; z < arenaD / 2; z += 20) linePositions.push(-arenaW / 2, .035, z, arenaW / 2, .035, z);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x3c7f9f, transparent: true, opacity: .22 })));

  const centerLine = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaW, .26),
    new THREE.MeshBasicMaterial({ color: 0xdaf8ff, transparent: true, opacity: .5, depthWrite: false })
  );
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = .04;
  scene.add(centerLine);

  const centerRing = new THREE.Mesh(
    new THREE.RingGeometry(18, 18.5, 64),
    new THREE.MeshBasicMaterial({ color: 0x6ce7ff, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false })
  );
  centerRing.rotation.x = -Math.PI / 2;
  centerRing.position.y = .045;
  scene.add(centerRing);

  const wallMat = new THREE.MeshBasicMaterial({ color: 0x42b9e9, transparent: true, opacity: .09, side: THREE.DoubleSide, depthWrite: false });
  const sideWallGeo = new THREE.PlaneGeometry(arenaD, wallH);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(sideWallGeo, wallMat);
    wall.position.set(side * arenaW / 2, wallH / 2, 0);
    wall.rotation.y = side * Math.PI / 2;
    scene.add(wall);
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(.45, .32, arenaD),
      new THREE.MeshBasicMaterial({ color: side < 0 ? 0x35b8ff : 0xff6a3d, toneMapped: false })
    );
    rail.position.set(side * arenaW / 2, wallH, 0);
    scene.add(rail);
  }

  const endWallGeo = new THREE.PlaneGeometry(75, wallH);
  const endWallMat = new THREE.MeshBasicMaterial({ color: 0x3c92b3, transparent: true, opacity: .08, side: THREE.DoubleSide, depthWrite: false });
  for (const side of [-1, 1]) {
    for (const x of [-62.5, 62.5]) {
      const wall = new THREE.Mesh(endWallGeo, endWallMat);
      wall.position.set(x, wallH / 2, side * arenaD / 2);
      scene.add(wall);
    }
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(75, .32, .45),
      new THREE.MeshBasicMaterial({ color: side < 0 ? 0x35b8ff : 0xff6a3d, toneMapped: false })
    );
    rail.position.set(-62.5, wallH, side * arenaD / 2);
    scene.add(rail);
    const rail2 = rail.clone();
    rail2.position.x = 62.5;
    scene.add(rail2);
  }

  const goalPosts = [];
  function buildGoal(team, z) {
    const color = team === 'azure' ? 0x35b8ff : 0xff6a3d;
    const group = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .9, metalness: .35, roughness: .25 });
    for (const x of [-26, 26]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 20, 8), postMat);
      post.position.set(x, 10, 0);
      group.add(post);
      goalPosts.push(post);
    }
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(54, 1.5, 1.5), postMat);
    crossbar.position.set(0, 20, 0);
    group.add(crossbar);
    const mouth = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 20),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .055, side: THREE.DoubleSide, depthWrite: false })
    );
    mouth.position.set(0, 10, 0);
    group.add(mouth);
    const netPositions = [];
    for (let x = -25; x <= 25; x += 5) netPositions.push(x, 0, 0, x, 20, 0);
    for (let y = 0; y <= 20; y += 1.5) netPositions.push(-25, y, 0, 25, y, 0);
    const netGeo = new THREE.BufferGeometry();
    netGeo.setAttribute('position', new THREE.Float32BufferAttribute(netPositions, 3));
    const net = new THREE.LineSegments(netGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .2 }));
    net.position.z = -1.8;
    group.add(net);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(50, .2, 1),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .65, toneMapped: false })
    );
    bar.position.set(0, 3.2, 0);
    group.add(bar);
    group.position.z = z;
    scene.add(group);
    return group;
  }
  const goalB = buildGoal('azure', -arenaD / 2);
  const goalO = buildGoal('ember', arenaD / 2);

  const boardCanvas = document.createElement('canvas');
  boardCanvas.width = 1024;
  boardCanvas.height = 256;
  const boardCtx = boardCanvas.getContext('2d');
  const boardGradient = boardCtx.createLinearGradient(0, 0, 1024, 0);
  boardGradient.addColorStop(0, '#081523');
  boardGradient.addColorStop(.5, '#122f47');
  boardGradient.addColorStop(1, '#1d1318');
  boardCtx.fillStyle = boardGradient;
  boardCtx.fillRect(0, 0, 1024, 256);
  boardCtx.fillStyle = '#35b8ff';
  boardCtx.fillRect(0, 0, 1024, 8);
  boardCtx.fillStyle = '#ff6a3d';
  boardCtx.fillRect(0, 248, 1024, 8);
  boardCtx.textAlign = 'center';
  boardCtx.fillStyle = '#dff8ff';
  boardCtx.font = 'italic 900 96px Segoe UI, Arial, sans-serif';
  boardCtx.fillText('AERO STRIKE', 512, 125);
  boardCtx.fillStyle = '#7bdfff';
  boardCtx.font = '800 22px Segoe UI, Arial, sans-serif';
  boardCtx.letterSpacing = '8px';
  boardCtx.fillText('NIGHT LEAGUE  //  ROCKETBALL', 512, 177);
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 16),
    new THREE.MeshBasicMaterial({ map: boardTex, side: THREE.DoubleSide, transparent: true })
  );
  board.position.set(0, 45, arenaD / 2 + 4);
  board.rotation.y = Math.PI;
  scene.add(board);

  const adMatA = new THREE.MeshBasicMaterial({ color: 0x35b8ff, transparent: true, opacity: .24, toneMapped: false });
  const adMatB = new THREE.MeshBasicMaterial({ color: 0xff6a3d, transparent: true, opacity: .2, toneMapped: false });
  for (let i = 0; i < 8; i++) {
    const z = -140 + i * 40;
    for (const side of [-1, 1]) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 20), side < 0 ? adMatA : adMatB);
      board.position.set(side * (arenaW / 2 + 2), 5, z);
      scene.add(board);
    }
  }

  const towerMat = new THREE.MeshStandardMaterial({ color: 0x162534, metalness: .6, roughness: .35 });
  for (const x of [-92, 92]) {
    for (const z of [-162, 162]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2, 32, 2), towerMat);
      tower.position.set(x, 16, z);
      scene.add(tower);
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, .9, 3.5),
        new THREE.MeshBasicMaterial({ color: z < 0 ? 0x8fe7ff : 0xffb08c, toneMapped: false })
      );
      lamp.position.set(x, 32, z);
      scene.add(lamp);
    }
  }

  const dustPositions = [];
  for (let i = 0; i < 180; i++) {
    dustPositions.push((Math.random() - .5) * arenaW * .96, 5 + Math.random() * 55, (Math.random() - .5) * arenaD * .96);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x76c9ec, size: .32, transparent: true, opacity: .45, depthWrite: false })));

  const blueLight = new THREE.PointLight(0x35b8ff, 90, 180, 2);
  blueLight.position.set(0, 12, -arenaD / 2 + 8);
  scene.add(blueLight);
  const orangeLight = new THREE.PointLight(0xff6a3d, 90, 180, 2);
  orangeLight.position.set(0, 12, arenaD / 2 - 8);
  scene.add(orangeLight);

  // --- Cars -----------------------------------------------------------------
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: .92 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xa7b8c7, metalness: .9, roughness: .22 });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x080c12, metalness: .65, roughness: .28 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x081521, metalness: .75, roughness: .14 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd9f5ff, emissiveIntensity: 2.5, roughness: .18 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x540a0a, emissive: 0xff2d1a, emissiveIntensity: 1.8, roughness: .25 });

  function buildCar(primary, accent) {
    const root = new THREE.Group();
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .34, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1.15, 1, 1);
    shadow.position.y = .02;
    root.add(shadow);

    const paintMat = new THREE.MeshStandardMaterial({ color: primary, metalness: .55, roughness: .24 });
    const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .55, metalness: .45, roughness: .25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 7.2), paintMat);
    body.position.y = 1.05;
    bodyPivot.add(body);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(3.15, .5, 1.8), accentMat);
    nose.position.set(0, .9, 3.65);
    bodyPivot.add(nose);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.45, .8, 2.6), glassMat);
    cabin.position.set(0, 1.72, -.35);
    bodyPivot.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.05, .12, 2.05), accentMat);
    roof.position.set(0, 2.15, -.35);
    bodyPivot.add(roof);

    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(4.15, .16, .6), carbonMat);
    spoiler.position.set(0, 1.66, -3.45);
    bodyPivot.add(spoiler);
    for (const x of [-1.25, 1.25]) {
      const stay = new THREE.Mesh(new THREE.BoxGeometry(.12, .45, .3), carbonMat);
      stay.position.set(x, 1.4, -3.42);
      bodyPivot.add(stay);
    }

    const splitter = new THREE.Mesh(new THREE.BoxGeometry(4.25, .12, .5), carbonMat);
    splitter.position.set(0, .46, 3.85);
    bodyPivot.add(splitter);

    const wheels = [];
    const tireGeo = new THREE.CylinderGeometry(.56, .56, .46, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(.3, .3, .48, 12);
    rimGeo.rotateZ(Math.PI / 2);
    for (const x of [-2.08, 2.08]) {
      for (const z of [-2.65, 2.65]) {
        const wheel = new THREE.Mesh(tireGeo, tireMat);
        wheel.position.set(x, .57, z);
        bodyPivot.add(wheel);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(x * 1.02, .57, z);
        bodyPivot.add(rim);
        wheels.push(wheel);
      }
    }

    for (const x of [-1.25, 1.25]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(.44, .18, .08), headMat);
      head.position.set(x, 1.08, 3.86);
      bodyPivot.add(head);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.42, .16, .06), tailMat);
      tail.position.set(x, 1.08, -3.64);
      bodyPivot.add(tail);
    }
    const rearBar = new THREE.Mesh(new THREE.BoxGeometry(3.25, .09, .06), tailMat);
    rearBar.position.set(0, 1.2, -3.65);
    bodyPivot.add(rearBar);
    for (const x of [-1.96, 1.96]) {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(.12, .42, .72), accentMat);
      endplate.position.set(x, 1.75, -3.45);
      bodyPivot.add(endplate);
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(.13, .18, 4.7), carbonMat);
      skirt.position.set(x * 1.02, .55, 0);
      bodyPivot.add(skirt);
    }
    for (const x of [-.8, .8]) {
      const exhaustGeo = new THREE.CylinderGeometry(.13, .15, .35, 10);
      exhaustGeo.rotateX(Math.PI / 2);
      const exhaust = new THREE.Mesh(exhaustGeo, rimMat);
      exhaust.position.set(x, .56, -3.75);
      bodyPivot.add(exhaust);
    }

    const underglow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 8.2),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .26, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.y = .035;
    root.add(underglow);

    const flames = [];
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb35c, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending });
    const flameGeo = new THREE.ConeGeometry(.25, 1.3, 8);
    flameGeo.rotateX(Math.PI / 2);
    for (const x of [-.8, .8]) {
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, .74, -4.1);
      flame.visible = false;
      bodyPivot.add(flame);
      flames.push(flame);
    }

    root.userData = {
      bodyPivot,
      flames,
      wheels,
      setBoost(active) {
        for (const flame of flames) {
          flame.visible = active;
          if (active) flame.scale.set(1, 1, .72 + Math.random() * .55);
        }
      }
    };
    return root;
  }

  const car = buildCar(0x1e9eff, 0x6be7ff);
  const carBody = car.userData.bodyPivot;
  scene.add(car);

  const blueBots = [];
  const orangeBots = [];
  function createBot(color) {
    const accent = color === 0x1e9eff ? 0x6be7ff : 0xffad78;
    const bot = buildCar(color, accent);
    bot.userData.vel = 0;
    scene.add(bot);
    return bot;
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xf5fbff, metalness: .18, roughness: .3, emissive: 0x1a4560, emissiveIntensity: .22 })
  );
  ball.position.set(0, 3, 0);
  const ballWire = new THREE.Mesh(
    new THREE.SphereGeometry(2.84, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x9be9ff, wireframe: true, transparent: true, opacity: .22 })
  );
  ball.add(ballWire);
  ball.add(new THREE.PointLight(0x8de4ff, 16, 70));
  scene.add(ball);

  // --- Boost pads -----------------------------------------------------------
  const pads = [];
  const padBigMat = new THREE.MeshStandardMaterial({ color: 0xffb02e, emissive: 0xff8a16, emissiveIntensity: .9, roughness: .35 });
  const padSmallMat = new THREE.MeshStandardMaterial({ color: 0xffd85a, emissive: 0xffc22f, emissiveIntensity: .6, roughness: .35 });
  function createPad(x, z, size) {
    const group = new THREE.Group();
    const radius = size === 100 ? 3.8 : 2.1;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .35, 20), size === 100 ? padBigMat : padSmallMat);
    disc.position.y = .3;
    group.add(disc);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.16, .1, 6, 28),
      new THREE.MeshBasicMaterial({ color: 0xffdf7a, transparent: true, opacity: .65, toneMapped: false })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = .54;
    group.add(ring);
    group.position.set(x, 0, z);
    scene.add(group);
    pads.push({ mesh: group, amount: size, active: true, respawnTime: 0, maxRespawn: size === 100 ? 500 : 210 });
  }
  createPad(-arenaW / 2 + 20, -arenaD / 2 + 20, 100);
  createPad(arenaW / 2 - 20, -arenaD / 2 + 20, 100);
  createPad(-arenaW / 2 + 20, arenaD / 2 - 20, 100);
  createPad(arenaW / 2 - 20, arenaD / 2 - 20, 100);
  createPad(-arenaW / 2 + 10, 0, 100);
  createPad(arenaW / 2 - 10, 0, 100);
  for (let z = -120; z <= 120; z += 60) {
    if (z === 0) continue;
    createPad(0, z, 12);
    createPad(-40, z, 12);
    createPad(40, z, 12);
  }
  createPad(-30, 0, 12);
  createPad(30, 0, 12);

  // --- Game state -----------------------------------------------------------
  let history = [], isReplaying = false, replayFrame = 0, countdownActive = false, gameStarted = false, isPaused = false;
  let activeMode = '1v1';
  let carVel = 0, carRot = 0, carYVel = 0, isGrounded = true;
  let canFlip = false, flipTimer = 0;
  let boostAmount = 33;
  let ballVel = new THREE.Vector3(0, 0, 0);
  let scoreB = 0, scoreO = 0;
  let heatseekerTarget = null;
  let matchSeconds = 180;
  let matchTimerInterval = null;
  let countdownInterval = null;
  let loopToken = 0;
  let goalPulse = 0;

  const keys = {};
  window.onkeydown = e => {
    if (e.code === 'Escape' && gameStarted) {
      togglePause();
      return;
    }
    if (e.code === 'Space' && gameStarted && !isPaused && !countdownActive && !isReplaying) {
      e.preventDefault();
      keys[e.code] = true;
      if (e.repeat) return;
      if (isGrounded) {
        carYVel = .62;
        isGrounded = false;
        canFlip = true;
      } else if (canFlip) {
        performFlip();
      }
      return;
    }
    keys[e.code] = true;
  };
  window.onkeyup = e => keys[e.code] = false;
  window.addEventListener('blur', () => { for (const key in keys) keys[key] = false; });

  function performFlip() {
    canFlip = false;
    flipTimer = 28;
    if (keys.ArrowUp || keys.KeyW) { carVel += 1.5; carBody.rotation.x = 0; }
    else if (keys.ArrowDown || keys.KeyS) { carVel -= 1.5; carBody.rotation.x = 0; }
    else if (keys.ArrowLeft || keys.KeyA) { carRot += .5; carVel += .5; }
    else if (keys.ArrowRight || keys.KeyD) { carRot -= .5; carVel += .5; }
    else { carYVel += .28; }
  }

  function showHome() {
    document.getElementById('homescreen').style.display = 'flex';
    document.getElementById('modescreen').style.display = 'none';
    document.getElementById('pausescreen').style.display = 'none';
  }
  function showModes() {
    document.getElementById('homescreen').style.display = 'none';
    document.getElementById('modescreen').style.display = 'flex';
  }
  window.showHome = showHome;
  window.showModes = showModes;

  function setScoreUi() {
    document.getElementById('blue-score').innerText = scoreB;
    document.getElementById('orange-score').innerText = scoreO;
  }

  function updateTimerDisplay() {
    const timer = document.getElementById('timer');
    if (activeMode === 'practice') {
      timer.innerText = 'FREE PLAY';
      return;
    }
    const mins = Math.floor(matchSeconds / 60);
    const secs = matchSeconds % 60;
    timer.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function modeName(mode) {
    return { '1v1': 'DUEL', '2v2': 'DOUBLES', '3v3': 'TRIOS', heatseeker: 'HEATSEEKER', practice: 'PRACTICE' }[mode] || 'MATCH';
  }

  window.togglePause = function() {
    if (!gameStarted) return;
    isPaused = !isPaused;
    document.getElementById('pausescreen').style.display = isPaused ? 'flex' : 'none';
  };

  window.leaveMatch = function() {
    gameStarted = false;
    loopToken++;
    isPaused = false;
    clearInterval(matchTimerInterval);
    clearInterval(countdownInterval);
    document.getElementById('pausescreen').style.display = 'none';
    document.getElementById('ui').style.display = 'none';
    document.getElementById('boost-container').style.display = 'none';
    document.getElementById('boost-text').style.display = 'none';
    document.getElementById('goal-msg').style.display = 'none';
    document.getElementById('replay-ui').style.display = 'none';
    document.getElementById('countdown').innerText = '';
    document.getElementById('homescreen').style.display = 'flex';
    scoreB = 0;
    scoreO = 0;
    setScoreUi();
    document.getElementById('pause-title').innerText = 'PAUSED';
    document.getElementById('pause-sub').innerText = 'Take a breath. The arena can wait.';
    document.getElementById('resume-btn').style.display = 'block';
  };

  window.restartMatch = function() {
    if (!activeMode) return;
    startGame(activeMode);
  };

  window.startGame = function(mode) {
    activeMode = mode;
    document.getElementById('modescreen').style.display = 'none';
    document.getElementById('homescreen').style.display = 'none';
    document.getElementById('pausescreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    document.getElementById('boost-container').style.display = 'block';
    document.getElementById('boost-text').style.display = 'block';
    document.getElementById('pause-title').innerText = 'PAUSED';
    document.getElementById('pause-sub').innerText = 'Take a breath. The arena can wait.';
    document.getElementById('resume-btn').style.display = 'block';
    document.getElementById('mode-label').innerText = modeName(mode);
    document.getElementById('goal-msg').style.display = 'none';
    document.getElementById('replay-ui').style.display = 'none';
    document.getElementById('countdown').innerText = '';
    document.getElementById('goal-flash').classList.remove('on');

    scoreB = 0;
    scoreO = 0;
    setScoreUi();
    matchSeconds = mode === 'practice' ? 0 : 180;
    updateTimerDisplay();

    clearInterval(matchTimerInterval);
    clearInterval(countdownInterval);
    if (mode !== 'practice') {
      matchTimerInterval = setInterval(() => {
        if (!isPaused && !countdownActive && !isReplaying) {
          matchSeconds--;
          if (matchSeconds <= 0) {
            matchSeconds = 0;
            endGame();
          }
          updateTimerDisplay();
        }
      }, 1000);
    }

    for (const b of blueBots) scene.remove(b);
    for (const b of orangeBots) scene.remove(b);
    blueBots.length = 0;
    orangeBots.length = 0;

    if (mode === '1v1' || mode === 'heatseeker') {
      orangeBots.push(createBot(0xff5a32));
    } else if (mode === '2v2') {
      blueBots.push(createBot(0x1e9eff));
      orangeBots.push(createBot(0xff5a32));
      orangeBots.push(createBot(0xff5a32));
    } else if (mode === '3v3') {
      blueBots.push(createBot(0x1e9eff));
      blueBots.push(createBot(0x1e9eff));
      orangeBots.push(createBot(0xff5a32));
      orangeBots.push(createBot(0xff5a32));
      orangeBots.push(createBot(0xff5a32));
    }

    gameStarted = true;
    isPaused = false;
    loopToken++;
    resetPositions();
    animate(loopToken);
  };

  function endGame() {
    gameStarted = false;
    isPaused = true;
    loopToken++;
    clearInterval(matchTimerInterval);
    clearInterval(countdownInterval);
    document.getElementById('pause-title').innerText = scoreB === scoreO ? 'DRAW' : (scoreB > scoreO ? 'AZURE WINS' : 'EMBER WINS');
    document.getElementById('pause-sub').innerText = `AZURE ${scoreB}  ·  EMBER ${scoreO}`;
    document.getElementById('resume-btn').style.display = 'none';
    document.getElementById('pausescreen').style.display = 'flex';
  }

  function resetPositions() {
    isReplaying = false;
    replayFrame = 0;
    history = [];
    car.position.set(-20, 0, -100);
    car.rotation.set(0, 0, 0);
    carBody.rotation.set(0, 0, 0);
    carRot = 0;
    carVel = 0;
    carYVel = 0;
    isGrounded = true;
    canFlip = false;
    flipTimer = 0;
    boostAmount = 33;
    heatseekerTarget = null;
    updateBoostUI();
    blueBots.forEach((b, i) => {
      b.position.set(20 + i * 15, 0, -100);
      b.rotation.set(0, 0, 0);
      b.userData.vel = 0;
    });
    orangeBots.forEach((b, i) => {
      b.position.set(-20 + i * 20, 0, 100);
      b.rotation.set(0, Math.PI, 0);
      b.userData.vel = 0;
    });
    ball.position.set(0, 3, 0);
    ballVel.set(0, 0, 0);
    ball.material.color.set(0xf5fbff);
    ball.scale.setScalar(1);
    startCountdown();
    resetPads();
  }

  function resetPads() {
    pads.forEach(p => { p.active = true; p.mesh.visible = true; p.respawnTime = 0; });
  }

  function updateBoostUI() {
    const val = activeMode === 'practice' ? 100 : Math.floor(boostAmount);
    document.getElementById('boost-text').innerText = val;
    document.getElementById('boost-fill').style.width = `${val}%`;
  }

  function startCountdown() {
    clearInterval(countdownInterval);
    countdownActive = true;
    let count = 3;
    const el = document.getElementById('countdown');
    el.innerText = '';
    countdownInterval = setInterval(() => {
      if (isPaused) return;
      el.innerText = count > 0 ? count : 'GO!';
      if (count < 0) {
        clearInterval(countdownInterval);
        el.innerText = '';
        countdownActive = false;
        car.position.y = 0;
        carYVel = 0;
        car.rotation.x = 0;
        car.rotation.z = 0;
      }
      count--;
    }, 720);
  }

  function startReplay(team) {
    isReplaying = true;
    replayFrame = 0;
    goalPulse = 1;
    document.getElementById('goal-msg').innerText = `${team} SCORES`;
    document.getElementById('goal-msg').style.display = 'block';
    document.getElementById('replay-ui').style.display = 'block';
    const flash = document.getElementById('goal-flash');
    flash.classList.remove('on');
    void flash.offsetWidth;
    flash.classList.add('on');
  }

  function updateBotAI(bot, team) {
    const targetGoal = team === 'blue' ? new THREE.Vector3(0, 0, arenaD / 2) : new THREE.Vector3(0, 0, -arenaD / 2);
    const pushDir = new THREE.Vector3().subVectors(ball.position, targetGoal).normalize();
    const attackPoint = new THREE.Vector3().copy(ball.position).add(pushDir.multiplyScalar(10));
    let diff = Math.atan2(attackPoint.x - bot.position.x, attackPoint.z - bot.position.z) - bot.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const speedFactor = activeMode === '3v3' ? .05 : .04;
    bot.rotation.y += Math.sign(diff) * .045;
    bot.userData.vel += speedFactor;
    bot.userData.vel *= .96;
    bot.translateZ(bot.userData.vel);

    if (bot.position.distanceTo(ball.position) < 7) {
      ballVel.set(ball.position.x - bot.position.x, .3, (ball.position.z - bot.position.z) + bot.userData.vel * 2.5).multiplyScalar(.3);
      if (activeMode === 'heatseeker') {
        heatseekerTarget = team === 'blue' ? 'orange' : 'blue';
        ballVel.multiplyScalar(1.1);
      }
    }
    if (Math.abs(bot.position.x) > arenaW / 2 - 3) bot.position.x = Math.sign(bot.position.x) * (arenaW / 2 - 3);
    if (Math.abs(bot.position.z) > arenaD / 2 - 4) bot.position.z = Math.sign(bot.position.z) * (arenaD / 2 - 4);
    bot.userData.setBoost(bot.userData.vel > .12);
  }

  function animate(token) {
    if (!gameStarted || token !== loopToken) return;
    requestAnimationFrame(() => animate(token));
    if (isPaused) {
      renderer.render(scene, camera);
      return;
    }

    if (!isReplaying) {
      if (!countdownActive) {
        if (keys.ArrowUp || keys.KeyW) carVel += .04;
        if (keys.ArrowDown || keys.KeyS) carVel -= .03;
        if (keys.ArrowLeft || keys.KeyA) carRot += .04;
        if (keys.ArrowRight || keys.KeyD) carRot -= .04;

        const boosting = (keys.ShiftLeft || keys.ShiftRight) && (activeMode === 'practice' || boostAmount > 0);
        if (boosting) {
          carVel += .06;
          if (!isGrounded) carYVel += .03;
          if (activeMode !== 'practice') boostAmount = Math.max(0, boostAmount - .34);
        }
        car.userData.setBoost(boosting);

        pads.forEach(p => {
          if (p.active) {
            p.mesh.rotation.y += .02;
            if (car.position.distanceTo(p.mesh.position) < 5 && boostAmount < 100) {
              boostAmount = Math.min(100, boostAmount + p.amount);
              p.active = false;
              p.mesh.visible = false;
              p.respawnTime = p.maxRespawn;
            }
          } else if (--p.respawnTime <= 0) {
            p.active = true;
            p.mesh.visible = true;
          }
        });
        updateBoostUI();

        carVel *= .97;
        car.rotation.y = carRot;
        car.translateZ(carVel);
        car.position.x = clamp(car.position.x, -arenaW / 2 + 4, arenaW / 2 - 4);
        car.position.z = clamp(car.position.z, -arenaD / 2 + 4, arenaD / 2 - 4);

        if (!isGrounded) {
          carYVel -= .02;
          car.position.y += carYVel;
          if (flipTimer > 0) {
            carBody.rotation.x += .4;
            flipTimer--;
            if (flipTimer === 0) carBody.rotation.x = 0;
          }
          if (car.position.y <= 0) {
            car.position.y = 0;
            carYVel = 0;
            isGrounded = true;
            canFlip = false;
            carBody.rotation.x = 0;
          }
        }

        orangeBots.forEach(b => updateBotAI(b, 'orange'));
        blueBots.forEach(b => updateBotAI(b, 'blue'));
        if (activeMode === 'heatseeker' && heatseekerTarget) {
          const goalPos = heatseekerTarget === 'orange' ? new THREE.Vector3(0, 5, arenaD / 2) : new THREE.Vector3(0, 5, -arenaD / 2);
          const toGoal = new THREE.Vector3().subVectors(goalPos, ball.position).normalize();
          ballVel.lerp(toGoal.multiplyScalar(Math.max(1.8, ballVel.length())), .05);
          ball.material.color.set(heatseekerTarget === 'orange' ? 0x35b8ff : 0xff6a3d);
        }

        ballVel.y -= .015;
        ball.position.add(ballVel);
        ball.rotation.x += ballVel.z * .015;
        ball.rotation.z -= ballVel.x * .015;
        if (ball.position.y <= 3) {
          ball.position.y = 3;
          ballVel.y *= -.5;
          ballVel.x *= .99;
          ballVel.z *= .99;
        }
        if (Math.abs(ball.position.x) > arenaW / 2 - 3) {
          ballVel.x *= -.8;
          ball.position.x = Math.sign(ball.position.x) * (arenaW / 2 - 3);
        }
        if (Math.abs(ball.position.z) > arenaD / 2 - 3) {
          if (Math.abs(ball.position.x) < 25 && ball.position.y < 20) {
            const azureScores = ball.position.z > 0;
            if (azureScores) scoreB++; else scoreO++;
            setScoreUi();
            startReplay(azureScores ? 'AZURE' : 'EMBER');
          } else {
            ballVel.z *= -.8;
            ball.position.z = Math.sign(ball.position.z) * (arenaD / 2 - 3);
          }
        }
        if (car.position.distanceTo(ball.position) < 7) {
          ballVel.set(ball.position.x - car.position.x, .3, (ball.position.z - car.position.z) + carVel * 2.5).multiplyScalar(.3);
          if (activeMode === 'heatseeker') {
            heatseekerTarget = 'orange';
            ballVel.multiplyScalar(1.1);
          }
        }

        const camOff = new THREE.Vector3(0, 10.5, -29).applyMatrix4(car.matrixWorld);
        camera.position.lerp(camOff, .1);
        camera.lookAt(new THREE.Vector3(0, 2.1, 25).applyMatrix4(car.matrixWorld));
        camera.fov += ((boosting ? 74 : 68) - camera.fov) * .08;
        camera.updateProjectionMatrix();
      }
      const frameData = {
        cp: car.position.clone(), cr: car.rotation.y, cy: car.position.y, br: carBody.rotation.x,
        bp: ball.position.clone(), ob: [], bb: []
      };
      orangeBots.forEach(b => frameData.ob.push({ p: b.position.clone(), r: b.rotation.y }));
      blueBots.forEach(b => frameData.bb.push({ p: b.position.clone(), r: b.rotation.y }));
      history.push(frameData);
      if (history.length > 240) history.shift();
    } else {
      const d = history[replayFrame];
      if (d) {
        car.position.copy(d.cp);
        car.rotation.y = d.cr;
        car.position.y = d.cy;
        carBody.rotation.x = d.br;
        ball.position.copy(d.bp);
        d.ob.forEach((data, i) => { if (orangeBots[i]) { orangeBots[i].position.copy(data.p); orangeBots[i].rotation.y = data.r; } });
        d.bb.forEach((data, i) => { if (blueBots[i]) { blueBots[i].position.copy(data.p); blueBots[i].rotation.y = data.r; } });
      }
      camera.position.lerp(new THREE.Vector3(112, 58, 0), .05);
      camera.lookAt(ball.position);
      if (++replayFrame >= history.length) {
        isReplaying = false;
        history = [];
        document.getElementById('goal-msg').style.display = 'none';
        document.getElementById('replay-ui').style.display = 'none';
        resetPositions();
      }
    }

    if (goalPulse > 0) {
      goalPulse = Math.max(0, goalPulse - .028);
      const pulse = 1 + Math.sin(goalPulse * 26) * .06 * goalPulse;
      goalB.scale.setScalar(pulse);
      goalO.scale.setScalar(pulse);
      blueLight.intensity = 90 + goalPulse * 120;
      orangeLight.intensity = 90 + goalPulse * 120;
    } else {
      blueLight.intensity = 90;
      orangeLight.intensity = 90;
      goalB.scale.setScalar(1);
      goalO.scale.setScalar(1);
    }

    renderer.render(scene, camera);
  }

  window.__aero = {
    scene, camera, renderer, car, ball, keys,
    get boostAmount() { return boostAmount; },
    get activeMode() { return activeMode; },
    get gameStarted() { return gameStarted; },
    get countdownActive() { return countdownActive; },
    get isReplaying() { return isReplaying; },
    get isPaused() { return isPaused; }
  };

  // Keep the score/time labels in sync if the page is opened mid-match.
  setScoreUi();
  updateTimerDisplay();
  animate(loopToken);
</script>
