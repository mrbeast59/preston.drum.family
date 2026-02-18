---
layout: page
short_title: " "
title: ""
permalink: /45aef978-cc21-4939-8316-61ec65ffc483
---

<style type="text/css">
  body { margin: 0; overflow: hidden; background: #000; font-family: 'Arial Black', sans-serif; }

  /* MENUS */
  .menu-screen {
      position: absolute; width: 100%; height: 100%;
      background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070');
      background-size: cover; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100;
  }
  h1 { color: #fff; font-size: 80px; margin-bottom: 20px; text-shadow: 0 0 20px #00aaff; }
  .btn {
      padding: 20px 50px; font-size: 30px; margin: 10px; width: 400px;
      background: #00aaff; color: white; border: none; border-radius: 10px;
      cursor: pointer; transition: transform 0.2s, background 0.2s;
  }
  .btn:hover { transform: scale(1.05); background: #0088cc; }
  .btn-secondary { background: #ffa500; }
  .btn-secondary:hover { background: #cc8400; }

  /* HUD */
  #ui { position: absolute; top: 20px; width: 100%; text-align: center; color: white; font-size: 28px; pointer-events: none; text-shadow: 2px 2px #000; display: none; }
  #goal-msg { position: absolute; top: 30%; width: 100%; text-align: center; color: #fff; font-size: 80px; display: none; text-shadow: 0 0 20px #000; pointer-events: none; z-index: 10; }
  #countdown { position: absolute; top: 40%; width: 100%; text-align: center; color: #ffff00; font-size: 120px; text-shadow: 0 0 30px #000; pointer-events: none; z-index: 20; }
  #replay-ui { position: absolute; bottom: 20px; left: 20px; color: red; font-size: 20px; display: none; animation: blink 0.5s infinite; }

  /* BOOST METER */
  #boost-container {
      position: absolute; bottom: 30px; right: 30px; width: 200px; height: 30px;
      border: 4px solid white; border-radius: 15px; background: rgba(0,0,0,0.5);
      display: none; overflow: hidden; transform: skewX(-20deg);
  }
  #boost-fill {
      width: 33%; height: 100%; background: #ffff00;
      box-shadow: 0 0 15px #ffff00; transition: width 0.1s;
  }
  #boost-text {
      position: absolute; bottom: 70px; right: 80px; color: #ffff00;
      font-size: 40px; text-shadow: 2px 2px black; display: none; transform: skewX(-20deg);
  }

  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } }
</style>
<div id="homescreen" class="menu-screen">
    <h1>ROCKET LEAGUE</h1>
    <button class="btn" onclick="showModes()">START GAME</button>
</div>

<div id="modescreen" class="menu-screen" style="display: none;">
    <h1>SELECT MODE</h1>
    <button class="btn" onclick="startGame('1v1')">1 vs 1 (Bot)</button>
    <button class="btn btn-secondary" onclick="startGame('practice')">Free Practice</button>
</div>

<div id="ui"><span id="blue-score" style="color: #00aaff;">BLUE 0</span> - <span id="orange-score" style="color: #ffa500;">0 ORANGE</span></div>
<div id="goal-msg">GOAL!</div>
<div id="countdown"></div>
<div id="replay-ui">● REPLAY</div>

<div id="boost-text">33</div>
<div id="boost-container"><div id="boost-fill"></div></div>

<script type="importmap">
    { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>

<script type="module">
    import * as THREE from 'three';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.PointLight(0xffffff, 2000);
    light.position.set(0, 80, 0);
    scene.add(light);

    // --- ARENA ---
    const arenaW = 200, arenaD = 350, wallH = 40;
    const blueT = new THREE.Mesh(new THREE.PlaneGeometry(arenaW, arenaD/2), new THREE.MeshPhongMaterial({color: 0x0a3d62}));
    blueT.rotation.x = -Math.PI/2; blueT.position.z = -arenaD/4; scene.add(blueT);
    const orangeT = new THREE.Mesh(new THREE.PlaneGeometry(arenaW, arenaD/2), new THREE.MeshPhongMaterial({color: 0x633d0a}));
    orangeT.rotation.x = -Math.PI/2; orangeT.position.z = arenaD/4; scene.add(orangeT);

    const wallMat = new THREE.MeshPhongMaterial({color: 0x00ffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide, emissive: 0x00ffff, emissiveIntensity: 0.1});
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(arenaD, wallH), wallMat); lw.position.set(-arenaW/2, wallH/2, 0); lw.rotation.y = Math.PI/2; scene.add(lw);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(arenaD, wallH), wallMat); rw.position.set(arenaW/2, wallH/2, 0); rw.rotation.y = -Math.PI/2; scene.add(rw);
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(arenaW, wallH), wallMat); bw.position.set(0, wallH/2, -arenaD/2); scene.add(bw);
    const ow = new THREE.Mesh(new THREE.PlaneGeometry(arenaW, wallH), wallMat); ow.position.set(0, wallH/2, arenaD/2); scene.add(ow);

    const goalB = new THREE.Mesh(new THREE.BoxGeometry(50, 20, 2), new THREE.MeshPhongMaterial({color: 0x00aaff, emissive: 0x00aaff})); goalB.position.z = -arenaD/2; scene.add(goalB);
    const goalO = new THREE.Mesh(new THREE.BoxGeometry(50, 20, 2), new THREE.MeshPhongMaterial({color: 0xffa500, emissive: 0xffa500})); goalO.position.z = arenaD/2; scene.add(goalO);

    // --- BOOST PADS SYSTEM ---
    const pads = [];
    const padGeoBig = new THREE.CylinderGeometry(4, 4, 1, 16);
    const padGeoSmall = new THREE.CylinderGeometry(2, 2, 0.5, 12);
    const matBig = new THREE.MeshPhongMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.5});
    const matSmall = new THREE.MeshPhongMaterial({color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.3});

    function createPad(x, z, size) {
        const mesh = new THREE.Mesh(size === 100 ? padGeoBig : padGeoSmall, size === 100 ? matBig : matSmall);
        mesh.position.set(x, 0.5, z);
        scene.add(mesh);
        pads.push({ mesh: mesh, amount: size, active: true, respawnTime: 0, maxRespawn: size === 100 ? 600 : 240 });
    }

    // 6 Big Pads (Corners + Mid)
    createPad(-arenaW/2 + 20, -arenaD/2 + 20, 100); // Back Left Blue
    createPad(arenaW/2 - 20, -arenaD/2 + 20, 100);  // Back Right Blue
    createPad(-arenaW/2 + 20, arenaD/2 - 20, 100);  // Back Left Orange
    createPad(arenaW/2 - 20, arenaD/2 - 20, 100);   // Back Right Orange
    createPad(-arenaW/2 + 10, 0, 100);              // Mid Left
    createPad(arenaW/2 - 10, 0, 100);               // Mid Right

    // Small Pads (12%) - Scattered grid
    for(let z = -120; z <= 120; z+=60) {
        if (z === 0) continue; // Skip exact center line
        createPad(0, z, 12); // Center column
        createPad(-40, z, 12);
        createPad(40, z, 12);
    }
    // Add a few more near center
    createPad(-30, 0, 12); createPad(30, 0, 12);

    // --- PLAYERS ---
    const car = new THREE.Group();
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 8), new THREE.MeshPhongMaterial({color: 0x2196F3}));
    carBody.position.y = 1; car.add(carBody); scene.add(car);

    const bot = new THREE.Group();
    const botBody = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 8), new THREE.MeshPhongMaterial({color: 0xffa500}));
    botBody.position.y = 1; bot.add(botBody); scene.add(bot);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), new THREE.MeshPhongMaterial({color: 0xffffff}));
    ball.position.set(0, 3, 0); scene.add(ball);

    // --- GAME LOGIC ---
    let history = [], isReplaying = false, replayFrame = 0, countdownActive = false, gameStarted = false;
    let activeMode = '1v1';
    let carVel = 0, carRot = 0, carYVel = 0, isGrounded = true;
    let boostAmount = 33;
    let botVel = 0, botRot = 0;
    let ballVel = new THREE.Vector3(0,0,0);
    let scoreB = 0, scoreO = 0;
    const keys = {};
    window.onkeydown = e => keys[e.code] = true;
    window.onkeyup = e => keys[e.code] = false;

    window.showModes = function() {
        document.getElementById('homescreen').style.display = 'none';
        document.getElementById('modescreen').style.display = 'flex';
    }

    window.startGame = function(mode) {
        activeMode = mode;
        document.getElementById('modescreen').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        document.getElementById('boost-container').style.display = 'block';
        document.getElementById('boost-text').style.display = 'block';

        bot.visible = (activeMode === '1v1');
        gameStarted = true;
        resetPositions();
        animate();
    }

    function resetPositions() {
        car.position.set(-arenaW/2 + 25, 1, -arenaD/2 + 25);
        car.rotation.y = Math.PI / 4;
        carVel = 0; carYVel = 0;
        boostAmount = 33; // Start with 33 boost on kickoff
        updateBoostUI();

        if (activeMode === '1v1') {
            bot.position.set(arenaW/2 - 25, 1, arenaD/2 - 25);
            bot.rotation.y = -Math.PI * 0.75;
            botVel = 0;
        }

        ball.position.set(0, 3, 0);
        ballVel.set(0,0,0);
        startCountdown();
        resetPads();
    }

    function resetPads() {
        pads.forEach(p => { p.active = true; p.mesh.visible = true; p.respawnTime = 0; });
    }

    function updateBoostUI() {
        const val = activeMode === 'practice' ? 100 : Math.floor(boostAmount);
        document.getElementById('boost-text').innerText = val;
        document.getElementById('boost-fill').style.width = val + '%';
    }

    function startCountdown() {
        countdownActive = true;
        let count = 3;
        const el = document.getElementById('countdown');
        const timer = setInterval(() => {
            el.innerText = count > 0 ? count : "GO!";
            if (count < 0) { clearInterval(timer); el.innerText = ""; countdownActive = false; }
            count--;
        }, 800);
    }

    function startReplay() {
        isReplaying = true; replayFrame = 0;
        document.getElementById('goal-msg').style.display = 'block';
        document.getElementById('replay-ui').style.display = 'block';
    }

    function animate() {
        if (!gameStarted) return;
        requestAnimationFrame(animate);

        if (!isReplaying) {
            if (!countdownActive) {
                // --- PLAYER CONTROLS ---
                if (keys['ArrowUp']) carVel += 0.04;
                if (keys['ArrowDown']) carVel -= 0.03;
                if (keys['ArrowLeft']) carRot += 0.04;
                if (keys['ArrowRight']) carRot -= 0.04;
                if (keys['Space'] && isGrounded) { carYVel = 0.5; isGrounded = false; }

                // --- BOOST LOGIC ---
                if (keys['ShiftLeft'] || keys['ShiftRight']) {
                    if (activeMode === 'practice' || boostAmount > 0) {
                        carVel += 0.06; // Boost Power
                        if (!isGrounded) carYVel += 0.03; // Fly Power

                        if (activeMode !== 'practice') {
                            boostAmount -= 0.4; // Consume boost
                            if (boostAmount < 0) boostAmount = 0;
                        }
                    }
                }

                // Pad Collision
                pads.forEach(p => {
                    if (p.active) {
                        p.mesh.rotation.y += 0.02;
                        if (car.position.distanceTo(p.mesh.position) < 5) {
                            if (boostAmount < 100) {
                                boostAmount += p.amount;
                                if (boostAmount > 100) boostAmount = 100;
                                p.active = false;
                                p.mesh.visible = false;
                                p.respawnTime = p.maxRespawn;
                            }
                        }
                    } else {
                        p.respawnTime--;
                        if (p.respawnTime <= 0) {
                            p.active = true;
                            p.mesh.visible = true;
                        }
                    }
                });
                updateBoostUI();

                // Car Physics
                carVel *= 0.97; car.rotation.y = carRot; car.translateZ(carVel);
                if (!isGrounded) {
                    carYVel -= 0.02; car.position.y += carYVel;
                    if (car.position.y <= 1) { car.position.y = 1; carYVel = 0; isGrounded = true; }
                }

                // --- BOT AI (1v1) ---
                if (activeMode === '1v1') {
                    const targetGoal = new THREE.Vector3(0, 0, -arenaD/2);
                    const pushDir = new THREE.Vector3().subVectors(ball.position, targetGoal).normalize();
                    const attackPoint = new THREE.Vector3().copy(ball.position).add(pushDir.multiplyScalar(10));

                    let diff = Math.atan2(attackPoint.x - bot.position.x, attackPoint.z - bot.position.z) - bot.rotation.y;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;

                    bot.rotation.y += Math.sign(diff) * 0.045;
                    botVel += 0.04; botVel *= 0.97; bot.translateZ(botVel);

                    if (Math.abs(bot.position.x) > arenaW/2 - 3) bot.position.x = Math.sign(bot.position.x)*(arenaW/2-3);
                    if (Math.abs(bot.position.z) > arenaD/2 - 4) bot.position.z = Math.sign(bot.position.z)*(arenaD/2-4);
                    if (bot.position.distanceTo(ball.position) < 7) {
                        ballVel.set(ball.position.x-bot.position.x, 0.3, (ball.position.z-bot.position.z)+botVel*2.5).multiplyScalar(0.3);
                    }
                }

                // Physics & Boundaries
                if (Math.abs(car.position.x) > arenaW/2 - 3) car.position.x = Math.sign(car.position.x)*(arenaW/2-3);
                if (Math.abs(car.position.z) > arenaD/2 - 4) car.position.z = Math.sign(car.position.z)*(arenaD/2-4);

                ballVel.y -= 0.015; ball.position.add(ballVel);
                if (ball.position.y <= 3) {
                    ball.position.y = 3; ballVel.y *= -0.5;
                    ballVel.x *= 0.985; ballVel.z *= 0.985;
                }

                if (Math.abs(ball.position.x) > arenaW/2 - 3) { ballVel.x *= -0.8; ball.position.x = Math.sign(ball.position.x)*(arenaW/2-3); }
                if (Math.abs(ball.position.z) > arenaD/2 - 3) {
                    if (Math.abs(ball.position.x) < 25 && ball.position.y < 20) {
                        if (ball.position.z < 0) scoreO++; else scoreB++;
                        document.getElementById('blue-score').innerText = "BLUE " + scoreB;
                        document.getElementById('orange-score').innerText = scoreO + " ORANGE";
                        startReplay();
                    } else { ballVel.z *= -0.8; ball.position.z = Math.sign(ball.position.z)*(arenaD/2-3); }
                }

                if (car.position.distanceTo(ball.position) < 7) {
                    ballVel.set(ball.position.x-car.position.x, 0.3, (ball.position.z-car.position.z)+carVel*2.5).multiplyScalar(0.3);
                }
            }

            history.push({
                cp: car.position.clone(), cr: car.rotation.y, cy: car.position.y,
                bp: ball.position.clone(),
                btp: bot.position.clone(), btr: bot.rotation.y
            });
            if (history.length > 240) history.shift();

            const camOff = new THREE.Vector3(0, 15, -40).applyMatrix4(car.matrixWorld);
            camera.position.lerp(camOff, 0.1);
            camera.lookAt(new THREE.Vector3(0, 2, 30).applyMatrix4(car.matrixWorld));

        } else {
            let d = history[replayFrame];
            car.position.copy(d.cp); car.rotation.y = d.cr; car.position.y = d.cy;
            if (activeMode === '1v1') { bot.position.copy(d.btp); bot.rotation.y = d.btr; }
            ball.position.copy(d.bp);
            camera.position.lerp(new THREE.Vector3(120, 60, 0), 0.05);
            camera.lookAt(ball.position);
            replayFrame++;
            if (replayFrame >= history.length) {
                isReplaying = false; history = [];
                document.getElementById('goal-msg').style.display = 'none';
                document.getElementById('replay-ui').style.display = 'none';
                resetPositions();
            }
        }
        renderer.render(scene, camera);
    }
</script>
