---
layout: game
title: "Nippon Open Road"
permalink: /japan-drive/
---

<style>
  :root {
    --ink: #f5f2e9;
    --muted: #aab6bb;
    --panel: rgba(10, 17, 21, .78);
    --line: rgba(255, 255, 255, .15);
    --red: #ff4b3e;
    --cyan: #66e6ff;
    --gold: #ffd166;
    --sakura: #ff9eb5;
    --green: #77e6a2;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: #081014; color: var(--ink); font-family: 'Segoe UI', 'Hiragino Sans', system-ui, sans-serif; }
  canvas { display: block; }
  .panel {
    background: linear-gradient(180deg, rgba(13, 22, 27, .86), rgba(7, 12, 16, .62));
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 14px 38px rgba(0, 0, 0, .36), inset 0 1px 0 rgba(255, 255, 255, .07);
    backdrop-filter: blur(12px);
  }
  #hud { position: fixed; inset: 0; z-index: 10; pointer-events: none; }
  #place { position: absolute; top: 18px; left: 18px; min-width: 236px; padding: 12px 16px 11px 19px; border-left: 3px solid var(--red); }
  #place .eyebrow { color: var(--sakura); font-size: 9px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; }
  #place .area { margin-top: 3px; font-size: 22px; font-weight: 800; letter-spacing: -.02em; text-shadow: 0 4px 18px rgba(0, 0, 0, .4); }
  #place .meta { margin-top: 5px; color: var(--muted); font-size: 10px; letter-spacing: .055em; }
  #place .meta b { color: #eaf3f5; font-weight: 700; }
  #help { position: absolute; top: 18px; right: 18px; width: 190px; padding: 12px 14px; color: #bcc9cd; font-size: 10px; line-height: 1.9; letter-spacing: .02em; }
  #help b { display: inline-block; min-width: 77px; color: #fff; font-weight: 700; }
  #help .head { margin-bottom: 4px; color: var(--cyan); font-size: 8px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
  #compassWrap { position: absolute; top: 18px; left: 50%; width: 310px; height: 44px; transform: translateX(-50%); overflow: hidden; border-radius: 9px; background: linear-gradient(90deg, transparent, rgba(8, 14, 18, .72) 16%, rgba(8, 14, 18, .72) 84%, transparent); border-top: 1px solid rgba(255, 255, 255, .08); border-bottom: 1px solid rgba(255, 255, 255, .08); }
  #compass { width: 310px; height: 44px; }
  #speedo { position: absolute; right: 20px; bottom: 20px; width: 222px; padding: 13px 17px 12px; text-align: right; }
  #gear { position: absolute; left: 15px; top: 15px; width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid rgba(255, 255, 255, .24); border-radius: 8px; background: rgba(255, 255, 255, .055); color: #fff; font-size: 19px; font-weight: 800; }
  #speed { font-size: 65px; line-height: .78; font-weight: 800; font-style: italic; letter-spacing: -.045em; font-variant-numeric: tabular-nums; text-shadow: 0 5px 20px rgba(0, 0, 0, .5); }
  #unit { margin-top: 6px; color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: .31em; }
  #rpm { height: 4px; margin-top: 11px; overflow: hidden; border-radius: 99px; background: rgba(255, 255, 255, .11); }
  #rpmFill { display: block; width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--cyan), var(--gold) 68%, var(--red)); transition: width .08s linear; }
  #fps { position: absolute; right: 0; bottom: calc(100% + 6px); padding: 4px 6px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 6px; background: rgba(8, 13, 17, .72); color: #b9c5c9; font-size: 9px; font-weight: 700; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
  #drift { position: absolute; left: 15px; bottom: 12px; color: var(--sakura); font-size: 9px; font-weight: 800; letter-spacing: .17em; opacity: 0; transition: opacity .12s; }
  #drift.on { opacity: 1; }
  #minimapPanel { position: absolute; left: 18px; bottom: 18px; padding: 8px; border-radius: 14px; }
  #minimap { width: 182px; height: 182px; border-radius: 9px; }
  #scoreCard { position: absolute; left: 18px; bottom: 226px; width: 198px; padding: 10px 12px 9px; }
  #scoreCard .label { color: var(--muted); font-size: 8px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
  #score { margin: 2px 0 2px; font-size: 28px; line-height: 1; font-weight: 800; font-style: italic; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
  #scoreCard .row { display: flex; justify-content: space-between; gap: 8px; color: var(--muted); font-size: 8px; font-weight: 700; letter-spacing: .08em; }
  #combo { color: var(--gold); }
  #combo.hot { text-shadow: 0 0 12px rgba(255, 209, 102, .55); }
  #stuntCount { margin-top: 4px; color: #7f949b; font-size: 7px; letter-spacing: .1em; }
  #eventCard { position: absolute; top: 78px; left: 50%; min-width: 300px; padding: 10px 18px 11px; text-align: center; transform: translate(-50%, -7px); opacity: 0; transition: opacity .18s, transform .18s; }
  #eventCard.on { opacity: 1; transform: translate(-50%, 0); }
  #eventCard .kicker { color: var(--cyan); font-size: 8px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
  #eventCard .name { margin-top: 2px; font-size: 15px; font-weight: 800; }
  #eventCard .detail { margin-top: 3px; color: #bdc9cd; font-size: 10px; letter-spacing: .04em; }
  #eventCard .bar { height: 3px; margin-top: 7px; overflow: hidden; border-radius: 99px; background: rgba(255, 255, 255, .12); }
  #eventCard .bar i { display: block; width: 0; height: 100%; background: linear-gradient(90deg, var(--cyan), var(--gold)); transition: width .12s linear; }
  #prompt { position: absolute; left: 50%; bottom: 28px; padding: 10px 18px; border: 1px solid rgba(255, 209, 102, .45); border-radius: 999px; background: rgba(11, 17, 20, .86); box-shadow: 0 0 24px rgba(255, 209, 102, .12); color: #fff; font-size: 11px; letter-spacing: .05em; opacity: 0; transform: translate(-50%, 8px); transition: .16s; }
  #prompt.on { opacity: 1; transform: translate(-50%, 0); }
  #prompt b { color: var(--gold); }
  #toast { position: absolute; top: 132px; left: 50%; max-width: min(560px, 78vw); padding: 10px 18px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 999px; background: rgba(9, 14, 18, .86); box-shadow: 0 12px 28px rgba(0, 0, 0, .3); color: #f4f7f7; font-size: 11px; letter-spacing: .035em; text-align: center; opacity: 0; transform: translate(-50%, -7px); transition: .22s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #toast.on { opacity: 1; transform: translate(-50%, 0); }
  #toast b { color: var(--gold); }
  #timeHint { position: absolute; right: 20px; bottom: 178px; padding: 7px 9px; color: #93a3a8; font-size: 8px; letter-spacing: .08em; }
  #timeHint b { color: #e8f0f1; }
  #weatherTag { position: absolute; right: 20px; bottom: 205px; padding: 8px 10px; color: #dce7e9; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
  #weatherTag i { display: inline-block; width: 6px; height: 6px; margin-right: 5px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); vertical-align: 1px; }
  #vignette { position: fixed; inset: 0; z-index: 5; pointer-events: none; background: radial-gradient(ellipse at 50% 46%, transparent 48%, rgba(3, 7, 9, .5) 100%); }
  #rainFlash { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: #d9eff8; opacity: 0; }
  #mapPanel { position: fixed; inset: 0; z-index: 30; display: none; align-items: center; justify-content: center; padding: 22px; background: rgba(4, 9, 12, .86); backdrop-filter: blur(10px); }
  #mapPanel.open { display: flex; }
  .map-shell { position: relative; width: min(1040px, 100%); max-height: 96vh; padding: 18px; overflow: auto; border: 1px solid rgba(255, 255, 255, .16); border-radius: 18px; background: linear-gradient(145deg, rgba(16, 26, 31, .98), rgba(7, 12, 16, .98)); box-shadow: 0 32px 100px rgba(0, 0, 0, .7); }
  .map-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
  .map-kicker { color: var(--red); font-size: 9px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; }
  .map-top h2 { margin: 3px 0 0; font-size: 30px; line-height: 1; letter-spacing: -.04em; font-style: italic; }
  .map-top p { margin: 6px 0 0; color: var(--muted); font-size: 10px; letter-spacing: .03em; }
  #mapClose { padding: 9px 14px; border: 1px solid rgba(255, 255, 255, .2); border-radius: 8px; background: rgba(255, 255, 255, .06); color: #fff; font: inherit; font-size: 10px; font-weight: 800; letter-spacing: .1em; cursor: pointer; }
  #mapCanvas { display: block; width: 100%; height: auto; aspect-ratio: 1; border: 1px solid rgba(255, 255, 255, .12); border-radius: 12px; background: #0b1519; }
  .legend { display: flex; flex-wrap: wrap; gap: 7px 16px; margin-top: 12px; color: #b3c0c4; font-size: 9px; letter-spacing: .04em; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .legend i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
  #loading { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 22px; background: radial-gradient(circle at 50% 35%, #122a31, #071013 68%); transition: opacity .6s; }
  #loading.hide { opacity: 0; pointer-events: none; }
  .load-box { width: min(520px, 100%); text-align: center; }
  .load-mark { display: inline-flex; align-items: center; gap: 12px; color: var(--sakura); font-size: 9px; font-weight: 800; letter-spacing: .26em; text-transform: uppercase; }
  .load-mark::before, .load-mark::after { content: ''; display: block; width: 42px; height: 1px; background: linear-gradient(90deg, transparent, var(--sakura)); }
  .load-mark::after { background: linear-gradient(90deg, var(--sakura), transparent); }
  .load-box h1 { margin: 12px 0 4px; font-size: clamp(38px, 8vw, 66px); line-height: .9; letter-spacing: -.065em; font-style: italic; font-weight: 900; }
  .load-box h1 em { color: var(--red); font-style: inherit; }
  .load-box p { margin: 10px 0 0; color: #a7b6ba; font-size: 11px; letter-spacing: .04em; }
  .load-track { height: 3px; margin: 22px auto 9px; overflow: hidden; border-radius: 99px; background: rgba(255, 255, 255, .12); }
  #loadFill { display: block; width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--cyan), var(--sakura), var(--gold)); transition: width .22s; }
  #loadStatus { color: #82979c; font-size: 8px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
  .load-note { margin-top: 28px; color: #65777c; font-size: 8px; line-height: 1.7; letter-spacing: .05em; }
  @media (max-width: 820px) {
    #help, #compassWrap { display: none; }
    #place { top: 12px; left: 12px; min-width: 0; padding: 9px 12px 8px 14px; }
    #place .area { font-size: 17px; }
    #place .meta { font-size: 9px; }
    #speedo { right: 12px; bottom: 12px; width: 166px; padding: 10px 12px; }
    #speed { font-size: 47px; }
    #gear { width: 30px; height: 30px; top: 11px; left: 11px; font-size: 15px; }
    #minimapPanel { left: 12px; bottom: 12px; padding: 6px; }
    #minimap { width: 118px; height: 118px; }
    #scoreCard { left: 12px; bottom: 148px; width: 132px; padding: 8px 9px; }
    #score { font-size: 21px; }
    #scoreCard .row { font-size: 7px; }
    #stuntCount { font-size: 6px; }
    #timeHint, #weatherTag { display: none; }
    #eventCard { top: 74px; min-width: 260px; }
    #toast { top: 118px; font-size: 10px; max-width: 86vw; }
    #mapPanel { padding: 8px; }
    .map-shell { padding: 12px; }
    .map-top h2 { font-size: 23px; }
    .map-top p { display: none; }
    .legend { font-size: 8px; gap: 5px 10px; }
  }
</style>

<div id="hud">
  <div id="place" class="panel">
    <div class="eyebrow">Kai Prefecture · Japan</div>
    <div class="area" id="areaName">Minato Harbor</div>
    <div class="meta"><b id="clock">16:30</b> · <span id="weatherLabel">Clear</span> · <span id="altitude">14 m</span></div>
  </div>

  <div id="compassWrap"><canvas id="compass" width="310" height="44"></canvas></div>

  <div id="help" class="panel">
    <div class="head">Drive / Explore</div>
    <div><b>WASD / ARROWS</b> drive</div>
    <div><b>SPACE</b> handbrake</div>
    <div><b>R</b> reset &nbsp; <b>C</b> camera</div>
    <div><b>E</b> interact</div>
    <div><b>M</b> map &nbsp; <b>T</b> time</div>
    <div><b>Y</b> weather &nbsp; <b>H</b> help</div>
  </div>

  <div id="weatherTag" class="panel"><i></i><span id="weatherShort">Clear skies</span></div>
  <div id="timeHint" class="panel"><b>T</b> time &nbsp; · &nbsp; <b>Y</b> weather</div>

  <div id="scoreCard" class="panel">
    <div class="label">Open road score</div>
    <div id="score">0</div>
    <div class="row"><span id="scoreRank">ROOKIE</span><span id="combo">x1.0</span></div>
    <div id="stuntCount">ACTIVITIES 0 / 0</div>
  </div>

  <div id="minimapPanel" class="panel"><canvas id="minimap" width="364" height="364"></canvas></div>

  <div id="eventCard" class="panel">
    <div class="kicker" id="eventKicker">EVENT</div>
    <div class="name" id="eventName">Neon Circuit</div>
    <div class="detail" id="eventDetail">Checkpoint 1 / 5</div>
    <div class="bar"><i id="eventBar"></i></div>
  </div>

  <div id="prompt"><b>E</b> <span id="promptText">start event</span></div>
  <div id="toast"></div>

  <div id="speedo" class="panel">
    <div id="gear">N</div>
    <div id="fps">-- FPS</div>
    <div id="speed">0</div>
    <div id="unit">KM/H</div>
    <div id="rpm"><i id="rpmFill"></i></div>
    <div id="drift">DRIFT</div>
  </div>
</div>

<div id="vignette"></div>
<div id="rainFlash"></div>

<div id="mapPanel" aria-hidden="true">
  <div class="map-shell">
    <div class="map-top">
      <div>
        <div class="map-kicker">Kai Prefecture · Open Road</div>
        <h2>THE WHOLE MAP</h2>
        <p>Coast, city, rice plains, switchbacks and alpine snow. Every marker is a place to drive.</p>
      </div>
      <button id="mapClose" type="button">CLOSE · M</button>
    </div>
    <canvas id="mapCanvas" width="1100" height="1100"></canvas>
    <div class="legend">
      <span><i style="background:#ff8a3d"></i>Speed trap</span>
      <span><i style="background:#66e6ff"></i>Speed zone</span>
      <span><i style="background:#ff6fa5"></i>Drift zone</span>
      <span><i style="background:#ffd166"></i>Danger sign</span>
      <span><i style="background:#77e6a2"></i>Bonus board</span>
      <span><i style="background:#c49bff"></i>Collectible</span>
      <span><i style="background:#ff4b3e"></i>Race event</span>
      <span><i style="background:#f4f1e8"></i>Barn find</span>
    </div>
  </div>
</div>

<div id="loading">
  <div class="load-box">
    <div class="load-mark">Original procedural world</div>
    <h1>NIPPON<br><em>OPEN ROAD</em></h1>
    <p>Kai Prefecture · 2,400 m of coast, city and mountain</p>
    <div class="load-track"><i id="loadFill"></i></div>
    <div id="loadStatus">Surveying the coastline</div>
    <div class="load-note">No third-party map, model or texture assets. Every road, ridge and landmark is generated in the browser.</div>
  </div>
</div>

<script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>
<script type="module" src="/assets/js/japan-drive.js"></script>
