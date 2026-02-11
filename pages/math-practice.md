---
layout: page
permalink: /math-work/eea07153-c8c1-46d8-95c7-d13cc86e93d1
---

<style>
    body { margin: 0; overflow: hidden; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Arial', sans-serif; }
    #game-container { position: relative; width: 800px; height: 400px; }
    canvas { border: 4px solid #333; background: #000520; cursor: pointer; display: block; }

    .overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(135deg, rgba(0,10,60,0.95), rgba(0,0,0,0.95));
        display: none; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 10;
    }
    .overlay.active { display: flex; }
    .title { font-size: 72px; font-weight: 900; letter-spacing: 5px; margin-bottom: 30px; text-shadow: 4px 4px #07d; color: #fff; }

    .level-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
    .level-card {
        width: 120px; height: 120px; background: #07d; border: 4px solid #fff;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; border-radius: 15px; font-weight: bold; transition: 0.2s;
    }
    .level-card:hover { transform: scale(1.1); background: #09f; }
    .level-card.locked { opacity: 0.5; background: #333; cursor: default; }

    .btn-group { display: flex; gap: 15px; margin-top: 20px; }
    .btn { padding: 15px 40px; background: #0a4; border: 4px solid #fff; cursor: pointer; border-radius: 12px; font-size: 20px; font-weight: bold; }
    .btn.secondary { background: #666; }
    .btn:hover { transform: scale(1.05); }
</style>

<div id="game-container">
    <canvas id="g" width="800" height="400"></canvas>

    <div id="home-screen" class="overlay active">
        <h1 class="title">GEO DASH</h1>
        <div class="btn" onclick="showLevels()">PLAY</div>
    </div>

    <div id="level-screen" class="overlay">
        <h2 style="font-size: 32px; margin-bottom: 20px;">SELECT LEVEL</h2>
        <div class="level-grid">
            <div class="level-card" onclick="startLevel(1)">
                <span>LVL 1</span>
                <small style="font-size: 10px; margin-top: 5px;">STEREO MADNESS</small>
            </div>
            <div class="level-card locked"><span>LVL 2</span><small>LOCKED</small></div>
            <div class="level-card locked"><span>LVL 3</span><small>LOCKED</small></div>
        </div>
        <div class="btn secondary" onclick="showHome()">BACK</div>
    </div>

    <div id="end-screen" class="overlay">
        <h2 id="end-status" style="font-size: 40px; margin-bottom: 10px;">COMPLETE!</h2>
        <div class="btn-group">
            <div id="retry-btn" class="btn" onclick="retryLevel()">RETRY</div>
            <div class="btn secondary" onclick="showLevels()">LEVELS</div>
        </div>
    </div>
</div>

<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
const menus = {
    home: document.getElementById('home-screen'),
    levels: document.getElementById('level-screen'),
    end: document.getElementById('end-screen')
};

const GRAV = 0.85, JUMP = -11.8, GROUND = 350;
let p = { x: 120, y: 320, w: 30, h: 30, vy: 0, ground: false, rot: 0, coyote: 0, buffer: 0 };
let obs = [], particles = [], speed = 6.8, state = 'MENU', isHolding = false, lastTime = 0, startX = 0, currentLevelNum = 1;

const levels = {
    1: [
        {t:'s', x:800}, {t:'s', x:1150}, {t:'s', x:1500},
        {t:'b', x:1800, y:280, w:120, h:70},
        {t:'b', x:2050, y:220, w:120, h:130},
        {t:'s', x:2400, n:2},
        {t:'b', x:2750, y:280, w:420, h:70},
        {t:'s', x:2900, y:250}, {t:'s', x:3050, y:250},
        {t:'b', x:3400, y:280, w:100, h:70},
        {t:'b', x:3550, y:240, w:100, h:110},
        {t:'b', x:3700, y:200, w:100, h:150},
        {t:'s', x:4100, n:1}, {t:'s', x:4400, n:2},
        {t:'b', x:4800, y:280, w:400, h:70},
        {t:'s', x:5500, n:3}
    ]
};

function showHome() { hideAll(); menus.home.classList.add('active'); state = 'MENU'; }
function showLevels() { hideAll(); menus.levels.classList.add('active'); state = 'MENU'; }
function hideAll() { Object.values(menus).forEach(m => m.classList.remove('active')); }

function retryLevel() {
    startLevel(currentLevelNum);
}

function startLevel(num) {
    if(!levels[num]) return;
    currentLevelNum = num;
    obs = JSON.parse(JSON.stringify(levels[num]));
    startX = obs[obs.length - 1].x; particles = [];
    hideAll();
    p.y = 320; p.vy = 0; p.rot = 0; state = 'PLAYING';
}

function triggerEnd(win) {
    state = win ? 'WIN' : 'OVER';
    const status = document.getElementById('end-status');
    status.innerText = win ? "LEVEL COMPLETE!" : "CRASHED!";
    status.style.color = win ? "#4f4" : "#f44";
    menus.end.classList.add('active');
}

function update(dt) {
    if (state !== 'PLAYING') return;
    let fSpeed = speed * (dt / 16.6);

    if (isHolding) p.buffer = 6;
    if (p.buffer > 0 && (p.ground || p.coyote > 0)) {
        p.vy = JUMP; p.ground = false; p.coyote = 0; p.buffer = 0;
    }
    p.buffer--;

    p.vy += GRAV; p.y += p.vy;

    let onAny = false;
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; onAny = true; }

    for (let i = obs.length - 1; i >= 0; i--) {
        let o = obs[i]; o.x -= fSpeed;
        let oy = o.y || (GROUND - 30);
        let ow = (o.t === 's') ? (30 * (o.n||1)) : o.w;
        let oh = o.h || 30;

        if (p.x < o.x + ow && p.x + p.w > o.x && p.y < oy + oh && p.y + p.h > oy) {
            if (o.t === 's') triggerEnd(false);
            else if (p.vy >= 0 && (p.y + p.h - p.vy) <= oy + 25) {
                p.y = oy - p.h; p.vy = 0; onAny = true;
            } else { triggerEnd(false); }
        }
    }

    p.ground = onAny;
    p.coyote = p.ground ? 8 : p.coyote - 1;
    p.rot = p.ground ? Math.round(p.rot / 90) * 90 : p.rot + 9;

    if (p.ground) particles.push({ x: p.x, y: p.y + 28, vx: -Math.random() * 3 - 2, vy: -Math.random() * 1, life: 1 });
    particles.forEach((part, i) => {
        part.x -= speed; part.y += part.vy; part.life -= 0.05;
        if (part.life <= 0) particles.splice(i, 1);
    });

    if (obs.length > 0 && obs[obs.length-1].x < -150) triggerEnd(true);
}

function draw() {
    ctx.fillStyle = "#000520"; ctx.fillRect(0,0,800,400);
    ctx.fillStyle = "#001040"; ctx.fillRect(0, GROUND, 800, 50);

    particles.forEach(part => {
        ctx.fillStyle = `rgba(0, 255, 255, ${part.life})`;
        ctx.fillRect(part.x, part.y, 3, 3);
    });

    ctx.save();
    ctx.translate(p.x + 15, p.y + 15);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = "#0ff"; ctx.fillRect(-15, -15, 30, 30);
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.strokeRect(-15, -15, 30, 30);
    ctx.restore();

    obs.forEach(o => {
        let oy = o.y || (GROUND - 30);
        if (o.t === 's') {
            ctx.fillStyle = "#f44";
            for(let i=0; i<(o.n||1); i++) {
                ctx.beginPath(); ctx.moveTo(o.x+(i*30), oy+30); ctx.lineTo(o.x+(i*30)+15, oy); ctx.lineTo(o.x+(i*30)+30, oy+30); ctx.fill();
            }
        } else {
            ctx.fillStyle = "#07d"; ctx.fillRect(o.x, oy, o.w, o.h);
            ctx.strokeStyle = "white"; ctx.strokeRect(o.x, oy, o.w, o.h);
        }
    });
}

function gameLoop(t) {
    let dt = t - lastTime; lastTime = t;
    update(Math.min(dt || 16, 32)); draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => { if(e.code==='Space' || e.code==='ArrowUp') isHolding = true; });
window.addEventListener('keyup', () => isHolding = false);
c.addEventListener('mousedown', () => { if(state === 'PLAYING') isHolding = true; });
window.addEventListener('mouseup', () => isHolding = false);

requestAnimationFrame(gameLoop);
</script>
