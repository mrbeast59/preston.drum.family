---
layout: page
short_title: " "
title: ""
permalink: /math-work/62562718-1c0d-45e5-8fca-cd3b008884ca
---

<style>
    body { margin: 0; overflow: hidden; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Arial', sans-serif; }
    #game-container { position: relative; width: 1200px; height: 600px; overflow: hidden; border: 4px solid #333; }
    canvas { cursor: pointer; display: block; }

    #live-score {
        position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
        font-size: 28px; color: white; font-weight: bold; text-shadow: 2px 2px #000;
        z-index: 5; pointer-events: none; display: none;
    }

    .overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: none; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 10;
        transition: background 0.3s ease;
    }
    .overlay.active { display: flex; }

    .bg-pattern { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.2; pointer-events: none; z-index: -1; }
    .gd-title { font-size: 80px; font-weight: 900; -webkit-text-stroke: 3px #000; text-shadow: 5px 5px 0px #222; margin-bottom: 20px; font-style: italic; }
    .play-circle {
        width: 120px; height: 120px; background: #fb0; border: 6px solid #fff; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        box-shadow: 0 8px 0 #c80; transition: 0.1s;
    }
    .play-triangle { width: 0; height: 0; border-top: 25px solid transparent; border-bottom: 25px solid transparent; border-left: 45px solid white; margin-left: 10px; }

    #level-slider { display: flex; align-items: center; gap: 40px; z-index: 11; }
    .nav-arrow { font-size: 60px; cursor: pointer; user-select: none; font-weight: bold; text-shadow: 2px 2px #000; }
    .level-card {
        width: 350px; height: 220px; background: rgba(0,0,0,0.5); border: 5px solid #fff;
        display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 20px;
    }
    .difficulty-face { width: 60px; height: 60px; border: 3px solid #000; border-radius: 10px; margin-bottom: 10px; }

    .progress-container { width: 80%; background: #333; height: 20px; border: 2px solid #fff; margin-top: 15px; position: relative; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f0; width: 0%; transition: width 0.5s ease; }
    .progress-text { position: absolute; width: 100%; text-align: center; font-size: 12px; font-weight: bold; line-height: 20px; text-shadow: 1px 1px #000; }

    .btn-group { display: flex; gap: 20px; margin-top: 20px; }
    .gd-btn { padding: 12px 30px; background: #fb0; border: 3px solid #fff; border-radius: 10px; font-weight: bold; cursor: pointer; color: #fff; text-shadow: 2px 2px #000; box-shadow: 0 5px 0 #c80; }
    .gd-btn.blue { background: #09f; box-shadow: 0 5px 0 #06c; }
</style>

<div id="game-container">
    <div id="live-score">0%</div>
    <canvas id="g" width="1200" height="600"></canvas>

    <div id="home-screen" class="overlay active" style="background: linear-gradient(180deg, #0095ff 0%, #0045ff 100%);">
        <h1 class="gd-title">GEO DASH</h1>
        <div class="play-circle" onclick="showLevels()">
            <div class="play-triangle"></div>
        </div>
    </div>

    <div id="level-screen" class="overlay">
        <canvas id="menu-bg-canvas" class="bg-pattern"></canvas>
        <div style="position: absolute; top: 20px; left: 20px; cursor: pointer; font-weight: bold;" onclick="showHome()">BACK</div>
        <div id="level-slider">
            <div class="nav-arrow" onclick="changeSlide(-1)">&#10094;</div>
            <div id="current-slide" class="level-card" onclick="startCurrentLevel()">
                <div id="slide-face" class="difficulty-face"></div>
                <h2 id="slide-title" style="margin: 0;"></h2>
                <p id="slide-index" style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;"></p>
                <div class="progress-container">
                    <div id="progress-fill" class="progress-fill"></div>
                    <div id="progress-text" class="progress-text">0%</div>
                </div>
            </div>
            <div class="nav-arrow" onclick="changeSlide(1)">&#10095;</div>
        </div>
    </div>

    <div id="end-screen" class="overlay" style="background: rgba(0,0,0,0.85);">
        <h2 id="end-status" style="font-size: 50px; -webkit-text-stroke: 2px #000;"></h2>
        <div id="score-summary" style="font-size: 24px; margin-bottom: 10px;"></div>
        <div class="btn-group">
            <div class="gd-btn" onclick="retryLevel()">RETRY</div>
            <div class="gd-btn blue" onclick="showLevels()">EXIT</div>
        </div>
    </div>
</div>

<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
const mbc = document.getElementById('menu-bg-canvas'), mbctx = mbc.getContext('2d');
const scoreUI = document.getElementById('live-score');
mbc.width = 1200; mbc.height = 600;

const menus = { home: document.getElementById('home-screen'), levels: document.getElementById('level-screen'), end: document.getElementById('end-screen') };

const GRAV = 0.85, JUMP = -11.8, GROUND = 550;
let p = { x: 120, y: 520, w: 30, h: 30, vy: 0, vx: 0, ground: false, rot: 0, coyote: 0, buffer: 0, visible: true };
let obs = [], particles = [], speed = 6.8, state = 'MENU', isHolding = false, lastTime = 0, bgAnim = 0;
let currentSlideIdx = 0, score = 0, nextGenX = 1200, winTimer = 0;
let winTrail = [], explosionParticles = [];

const levels = [
    {
        name: "STEREO MADNESS", color: "#0066ff", bgType: "grid", face: "#0f0", length: 15000,
        data: [
            {t:'s', x:800}, {t:'s', x:1100}, {t:'s', x:1400},
            {t:'b', x:1700, y:GROUND-60, w:180, h:60}, {t:'s', x:1775, y:GROUND-90},
            {t:'b', x:2100, y:GROUND-60, w:180, h:60}, {t:'s', x:2175, y:GROUND-90},
            {t:'s', x:2500, n:2}, {t:'s', x:2850, n:2},
            {t:'b', x:3200, y:GROUND-60, w:120, h:60},
            {t:'b', x:3440, y:GROUND-120, w:120, h:120},
            {t:'b', x:3680, y:GROUND-180, w:120, h:180},
            {t:'b', x:3920, y:GROUND-120, w:120, h:120},
            {t:'b', x:4160, y:GROUND-60, w:120, h:60},
            {t:'s', x:4450, n:3},
            {t:'b', x:4750, y:GROUND-90, w:300, h:90}, {t:'s', x:4850, y:GROUND-120},
            {t:'b', x:5150, y:GROUND-150, w:220, h:150},
            {t:'b', x:5450, y:GROUND-210, w:220, h:210},
            {t:'b', x:5850, y:GROUND-80, w:500, h:30}, {t:'b', x:5850, y:GROUND-340, w:500, h:30},
            {t:'s', x:6600, n:3},
            {t:'s', x:7100, n:3},
            {t:'b', x:7800, y:GROUND-60, w:250, h:60},
            {t:'s', x:8100, n:1},
            {t:'b', x:8500, y:GROUND-80, w:200, h:80},
            {t:'b', x:8900, y:GROUND-110, w:200, h:110},
            {t:'s', x:9300, n:2},
            {t:'b', x:9700, y:GROUND-40, w:500, h:40}, {t:'s', x:9850, y:GROUND-70},
            {t:'b', x:10300, y:GROUND-110, w:200, h:110},
            {t:'b', x:10700, y:GROUND-110, w:200, h:110},
            {t:'s', x:11200, n:3},
            {t:'b', x:11800, y:GROUND-80, w:400, h:80}, {t:'b', x:11800, y:GROUND-320, w:400, h:40},
            {t:'s', x:12400, n:2},
            {t:'b', x:12800, y:GROUND-40, w:150, h:40},
            {t:'b', x:13100, y:GROUND-80, w:150, h:80},
            {t:'b', x:13400, y:GROUND-120, w:150, h:120},
            {t:'s', x:13850, n:1}, {t:'s', x:14250, n:1}, {t:'s', x:14650, n:2}
        ]
    },
    {
        name: "BACK ON TRACK", color: "#a033ff", bgType: "stripes", face: "#0f0", length: 4500,
        data: [{t:'s', x:800}, {t:'b', x:1030, y:GROUND-70, w:180, h:70}, {t:'s', x:1105, y:GROUND-100}]
    },
    {
        name: "POLARGEIST", color: "#22cc33", bgType: "blocks", face: "#ff0", length: 5000,
        data: [{t:'s', x:700}, {t:'b', x:930, y:GROUND-110, w:180, h:110}, {t:'s', x:1005, y:GROUND-140}]
    },
    { name: "THE VOID", color: "#111", bgType: "grid", face: "#f0f", infinite: true }
];

let highScores = JSON.parse(localStorage.getItem('gdHighScores')) || [0,0,0,0];

function updateMenuUI() {
    const lvl = levels[currentSlideIdx];
    document.getElementById('slide-title').innerText = lvl.name;
    document.getElementById('slide-face').style.background = lvl.face;
    document.getElementById('slide-index').innerText = lvl.infinite ? "Level ∞" : `Level ${currentSlideIdx + 1}`;
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const best = highScores[currentSlideIdx];

    if(lvl.infinite) {
        fill.style.width = "100%"; fill.style.background = "#f0f";
        text.innerText = `Best: ${Math.floor(best/10)}m`;
    } else {
        let percent = Math.min(Math.floor((best / lvl.length) * 100), 100);
        fill.style.width = percent + "%"; fill.style.background = "#0f0";
        text.innerText = percent + "%";
    }
}

function saveHighScore() {
    if (score > highScores[currentSlideIdx]) {
        highScores[currentSlideIdx] = score;
        localStorage.setItem('gdHighScores', JSON.stringify(highScores));
    }
}

function generateInfinite() {
    if (state !== 'PLAYING' || !levels[currentSlideIdx].infinite) return;
    while (nextGenX < 1400) {
        let diff = Math.min(score / 12000, 1);
        let type = Math.random() > 0.4 ? 's' : 'b';
        if (type === 's') {
            let num = (score < 2500) ? 1 : ((Math.random() < 0.3 * diff) ? 3 : (Math.random() < 0.6 * diff ? 2 : 1));
            obs.push({t:'s', x: nextGenX, n: num});
            nextGenX += 300 + (num * 30);
        } else {
            let h = 40 + (Math.random() * 60 * diff);
            let w = 80 + (Math.random() * 100);
            obs.push({t:'b', x: nextGenX, y: GROUND - h, w: w, h: h});
            nextGenX += w + 300;
        }
    }
}

function drawGenericBG(context, lvl, animValue) {
    context.strokeStyle = "rgba(255, 255, 255, 0.4)";
    context.lineWidth = 2;
    let shift = animValue % 100;
    if (lvl.bgType === "grid") {
        for (let x = -shift; x < 1300; x += 100) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 600); context.stroke(); }
        for (let y = -shift; y < 700; y += 100) { context.beginPath(); context.moveTo(0, y); context.lineTo(1200, y); context.stroke(); }
    } else if (lvl.bgType === "stripes") {
        for (let x = -600 - (shift*2); x < 1600; x += 60) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x - 600, 600); context.stroke(); }
    } else if (lvl.bgType === "blocks") {
        for (let x = -shift; x < 1300; x += 150) { for (let y = -shift; y < 700; y += 150) { context.strokeRect(x, y, 75, 75); } }
    }
}

function changeSlide(dir) {
    currentSlideIdx = (currentSlideIdx + dir + levels.length) % levels.length;
    updateMenuUI();
}

function showHome() { hideAll(); menus.home.classList.add('active'); state = 'MENU'; scoreUI.style.display = 'none'; }
function showLevels() { hideAll(); menus.levels.classList.add('active'); state = 'MENU'; scoreUI.style.display = 'none'; updateMenuUI(); }
function hideAll() { Object.values(menus).forEach(m => m.classList.remove('active')); }
function retryLevel() { startLevel(currentSlideIdx); }
function startCurrentLevel() { startLevel(currentSlideIdx); }

function startLevel(idx) {
    currentSlideIdx = idx;
    const lvl = levels[idx];
    obs = lvl.infinite ? [] : JSON.parse(JSON.stringify(lvl.data));
    particles = []; score = 0; nextGenX = 1200; winTimer = 0;
    winTrail = []; explosionParticles = [];
    hideAll();
    scoreUI.innerText = lvl.infinite ? "0" : "0%";
    scoreUI.style.display = 'block';
    p.y = GROUND - 30; p.x = 120; p.vy = 0; p.vx = 0; p.rot = 0; p.visible = true; state = 'PLAYING';
}

function triggerEnd(win) {
    if (win && winTimer === 0) {
        state = 'WINNING_ANIM';
        winTimer = 1;
        return;
    }
    saveHighScore();
    state = win ? 'WIN' : 'OVER';
    scoreUI.style.display = 'none';
    const status = document.getElementById('end-status');
    const summary = document.getElementById('score-summary');
    status.innerText = win ? "LEVEL COMPLETE!" : "CRASHED!";
    status.style.color = win ? "#4f4" : "#f44";
    summary.innerText = levels[currentSlideIdx].infinite ? `Distance: ${Math.floor(score/10)}m` : `Progress: ${Math.min(Math.floor((score/levels[currentSlideIdx].length)*100), 100)}%`;
    menus.end.classList.add('active');
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        explosionParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 8 + 4,
            life: 1.0
        });
    }
}

function update(dt) {
    bgAnim += 1;

    if (state === 'WINNING_ANIM') {
        winTimer++;
        if (winTimer < 40) {
            p.y -= 4;
            p.rot += 15;
        } else if (winTimer < 75) {
            p.vx = 35;
            p.x += p.vx;
            p.rot += 40;
            // Add to trail
            winTrail.push({x: p.x, y: p.y, rot: p.rot, life: 1.0});

            // Check wall hit
            if (p.x >= 1150 && p.visible) {
                p.visible = false;
                createExplosion(p.x, p.y);
            }
        }

        // Update trail life
        winTrail.forEach((t, i) => { t.life -= 0.05; if(t.life <= 0) winTrail.splice(i, 1); });

        // Update explosion
        explosionParticles.forEach((ep, i) => {
            ep.x += ep.vx; ep.y += ep.vy; ep.vy += 0.5; ep.life -= 0.02;
            if(ep.life <= 0) explosionParticles.splice(i, 1);
        });

        if (winTimer > 100) triggerEnd(true);
        return;
    }

    if (state !== 'PLAYING') return;
    let fSpeed = speed * (dt / 16.6);
    score += fSpeed;
    if (levels[currentSlideIdx].infinite) {
        scoreUI.innerText = Math.floor(score/10);
        nextGenX -= fSpeed; generateInfinite();
    } else {
        scoreUI.innerText = Math.min(Math.floor((score / levels[currentSlideIdx].length) * 100), 100) + "%";
    }

    if (isHolding) p.buffer = 6;
    if (p.buffer > 0 && (p.ground || p.coyote > 0)) { p.vy = JUMP; p.ground = false; p.coyote = 0; p.buffer = 0; }
    p.buffer--; p.vy += GRAV; p.y += p.vy;
    let onAny = false;
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; onAny = true; }

    for (let i = obs.length - 1; i >= 0; i--) {
        let o = obs[i], oy = o.y || (GROUND - 30), ow = (o.t === 's') ? (30 * (o.n||1)) : o.w, oh = o.h || 30;
        o.x -= fSpeed;
        if (o.x + ow < -200) { obs.splice(i, 1); continue; }
        if (p.x + 2 < o.x + ow && p.x + p.w - 2 > o.x && p.y + 2 < oy + oh && p.y + p.h - 2 > oy) {
            if (o.t === 's') triggerEnd(false);
            else if (p.vy >= 0 && (p.y + p.h - p.vy) <= oy + 25) { p.y = oy - p.h; p.vy = 0; onAny = true; }
            else triggerEnd(false);
        }
    }
    p.ground = onAny; p.coyote = p.ground ? 8 : p.coyote - 1;
    p.rot = p.ground ? Math.round(p.rot / 90) * 90 : p.rot + 9;
    if (p.ground) particles.push({ x: p.x, y: p.y + 28, vx: -Math.random() * 3 - 2, vy: -Math.random() * 1, life: 1 });
    particles.forEach((part, i) => { part.x -= speed; part.y += part.vy; part.life -= 0.05; if (part.life <= 0) particles.splice(i, 1); });
    if (!levels[currentSlideIdx].infinite && score >= levels[currentSlideIdx].length) triggerEnd(true);
}

function draw() {
    const lvl = levels[currentSlideIdx];
    ctx.fillStyle = lvl.color; ctx.fillRect(0, 0, 1200, 600);
    drawGenericBG(ctx, lvl, bgAnim);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; ctx.fillRect(0, GROUND, 1200, 50);
    particles.forEach(part => { ctx.fillStyle = `rgba(0, 255, 255, ${part.life})`; ctx.fillRect(part.x, part.y, 3, 3); });

    // Win Trail
    winTrail.forEach(t => {
        ctx.save(); ctx.translate(t.x + 15, t.y + 15); ctx.rotate(t.rot * Math.PI / 180);
        ctx.fillStyle = `rgba(0, 255, 255, ${t.life * 0.5})`; ctx.fillRect(-15, -15, 30, 30);
        ctx.restore();
    });

    // Player
    if (p.visible) {
        ctx.save(); ctx.translate(p.x + 15, p.y + 15); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = "#0ff"; ctx.fillRect(-15, -15, 30, 30);
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.strokeRect(-15, -15, 30, 30);
        ctx.fillStyle = "white"; ctx.fillRect(-8, -10, 5, 5); ctx.fillRect(3, -10, 5, 5);
        ctx.restore();
    }

    // Explosion
    explosionParticles.forEach(ep => {
        ctx.fillStyle = `rgba(0, 255, 255, ${ep.life})`;
        ctx.fillRect(ep.x, ep.y, ep.size, ep.size);
    });

    // Obstacles
    obs.forEach(o => {
        let oy = o.y || (GROUND - 30);
        if (o.t === 's') {
            ctx.fillStyle = "#eee";
            for(let i=0; i<(o.n||1); i++) {
                ctx.beginPath(); ctx.moveTo(o.x+(i*30), oy+30); ctx.lineTo(o.x+(i*30)+15, oy); ctx.lineTo(o.x+(i*30)+30, oy+30); ctx.fill();
            }
        } else {
            ctx.fillStyle = "#222"; ctx.fillRect(o.x, oy, o.w, o.h);
            ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.strokeRect(o.x, oy, o.w, o.h);
            ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
            ctx.strokeRect(o.x + 5, oy + 5, o.w - 10, o.h - 10);
        }
    });
    if (state === 'MENU') {
        menus.levels.style.background = lvl.color;
        mbctx.clearRect(0,0,1200,600); drawGenericBG(mbctx, lvl, bgAnim * 0.5);
    }
}

function gameLoop(t) { let dt = t - lastTime; lastTime = t; update(Math.min(dt || 16, 32)); draw(); requestAnimationFrame(gameLoop); }
window.addEventListener('keydown', e => { if(e.code==='Space' || e.code==='ArrowUp') isHolding = true; });
window.addEventListener('keyup', () => isHolding = false);
c.addEventListener('mousedown', () => { if(state === 'PLAYING') isHolding = true; });
window.addEventListener('mouseup', () => isHolding = false);
requestAnimationFrame(gameLoop);
updateMenuUI();
</script>
