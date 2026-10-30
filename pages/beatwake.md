---
layout: game
short_title: " "
title: ""
---

<style type="text/css">
  body{margin:0;overflow:hidden;background:#070a1c;display:flex;justify-content:center;align-items:center;height:100vh;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif}
  #stage{position:relative;width:1200px;height:600px;flex:none;overflow:hidden;color:#eaf6ff;touch-action:none;user-select:none;-webkit-user-select:none}
  #stage canvas{display:block;width:1200px;height:600px}
  .ov{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(7,10,28,.86)}
  .ov[hidden],#hud[hidden]{display:none}
  .logo{margin:0;font-size:104px;font-weight:900;font-style:italic;letter-spacing:.04em;background:linear-gradient(95deg,#37f3c8 20%,#ff4fa3 80%);-webkit-background-clip:text;background-clip:text;color:transparent}
  h2{margin:0 0 6px;font-size:42px}
  .sub{margin:0 0 10px;opacity:.85;font-size:17px}
  .btn{min-width:230px;padding:13px 28px;font:inherit;font-weight:700;font-size:19px;color:#eaf6ff;background:#151c46;border:2px solid #37f3c8;border-radius:4px 14px 4px 14px;cursor:pointer;box-shadow:0 4px 0 #0c8a72}
  .btn.alt{border-color:#ff4fa3;box-shadow:0 4px 0 #962b63}
  .btn:hover,.btn:focus-visible{background:#37f3c8;color:#07142a;outline:3px solid #fff;outline-offset:3px}
  .btn.alt:hover,.btn.alt:focus-visible{background:#ff4fa3}
  .tg[aria-pressed=true]::after{content:": on"}
  .tg[aria-pressed=false]::after{content:": off"}
  .row{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:1100px}
  .cards{display:flex;gap:18px}
  .card{width:250px;height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:inherit;color:inherit;background:#101640;border:2px solid #4a58b8;border-radius:4px 22px 4px 22px;cursor:pointer}
  .card b{font-size:25px}
  .card small{opacity:.85;font-size:15px}
  .card:hover,.card:focus-visible{border-color:#37f3c8;outline:3px solid #fff;outline-offset:3px}
  .bar{width:78%;height:12px;background:#1d2660;border-radius:6px;overflow:hidden}
  .bar i{display:block;height:100%;background:#37f3c8}
  label{display:flex;gap:10px;align-items:center;font-size:17px}
  input[type=range]{width:150px;accent-color:#37f3c8}
  .sw{width:46px;height:46px;border:3px solid #4a58b8;border-radius:8px;cursor:pointer;padding:0}
  .sw[aria-pressed=true]{border-color:#fff;box-shadow:0 0 0 3px #ffd34f}
  .sw:focus-visible{outline:3px solid #fff;outline-offset:3px}
  #hud{position:absolute;top:14px;left:0;right:0;z-index:5;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;text-shadow:0 2px 0 #000;font-weight:700}
  #pb{position:relative;width:520px;height:14px;background:rgba(0,0,0,.5);border:2px solid #eaf6ff;border-radius:8px;overflow:hidden}
  #pf{position:absolute;left:0;top:0;bottom:0;width:0;background:#37f3c8}
  #pb s{position:absolute;top:0;bottom:0;width:2px;background:#fff;opacity:.6}
  #bm{position:absolute;top:0;bottom:0;width:3px;background:#ff4fa3}
  #pt{font-size:26px}
  #at{font-size:15px;opacity:.9}
  #toast{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:20;background:#ff4fa3;color:#1a0714;padding:8px 16px;border-radius:6px;font-weight:700;opacity:0;transition:opacity .3s;pointer-events:none}
  #toast.on{opacity:1}
  @media (prefers-reduced-motion:reduce){#toast{transition:none}}
</style>
<div id="stage">
  <canvas id="g" width="1200" height="600" aria-label="Beatwake game area"></canvas>
  <div id="hud" hidden><div id="pb"><i id="pf"></i><u id="bm"></u></div><span id="pt">0%</span><span id="at"></span></div>
  <div id="toast" role="status" aria-live="polite"></div>

  <section id="home" class="ov" aria-label="Main menu">
    <h1 class="logo">BEATWAKE</h1>
    <p class="sub">Jump to the beat. Space, click or tap to jump. Esc pauses, R restarts.</p>
    <button class="btn" data-go="levels">Play</button>
    <button class="btn alt" data-go="opts">Options</button>
  </section>

  <section id="levels" class="ov" hidden aria-label="Track select">
    <h2>Choose a track</h2>
    <div class="cards" id="cards"></div>
    <div class="row">
      <button class="btn tg" id="prac" aria-pressed="false">Practice mode</button>
      <button class="btn alt" data-go="home">Back</button>
    </div>
    <p class="sub">Practice drops a checkpoint at every beacon. X adds one, C removes one. Best runs only count outside practice.</p>
  </section>

  <section id="opts" class="ov" hidden aria-label="Options">
    <h2>Options</h2>
    <div class="row">
      <label>Music <input type="range" data-k="mv" min="0" max="1" step=".05"></label>
      <label>Effects <input type="range" data-k="sv" min="0" max="1" step=".05"></label>
      <label>Audio sync, ms <input type="range" data-k="off" min="-150" max="150" step="10"></label>
    </div>
    <div class="row">
      <button class="btn tg" data-k="calm">Calm visuals</button>
      <button class="btn tg" data-k="shake">Screen shake</button>
      <button class="btn tg" data-k="forgive">Forgiving hitboxes</button>
      <button class="btn tg" data-k="auto">Auto retry</button>
    </div>
    <p class="sub">Icon color</p>
    <div class="row" id="sws"></div>
    <button class="btn alt" data-go="home">Back</button>
  </section>

  <section id="pause" class="ov" hidden aria-label="Paused">
    <h2>Paused</h2>
    <button class="btn" id="resume">Resume</button>
    <button class="btn" id="restart">Restart</button>
    <button class="btn alt" id="quit">Quit to tracks</button>
  </section>

  <section id="end" class="ov" hidden aria-label="Run result">
    <h2 id="et"></h2>
    <p class="sub" id="es"></p>
    <div class="row">
      <button class="btn" id="retry">Retry</button>
      <button class="btn" id="next">Next track</button>
      <button class="btn alt" id="quit2">Tracks</button>
    </div>
  </section>
</div>

<script>
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// World units are pixels on a 1200x600 stage; 1 tile = 40px. The sim runs at a fixed 120 Hz.
const W=1200,H=600,T=40,FL=480,DT=1/120,PX=220,PS=34,G=3456,JV=864,MF=1200,COY=8,BUF=13,STEP=10,LEAD=108;

/* ---------- save data: tolerant of missing or corrupt storage ---------- */
const KEY='beatwake.save.v1';
const DEF={mv:.7,sv:.8,off:0,calm:false,shake:true,forgive:false,auto:true,skin:0,best:{},tries:{}};
let save={...DEF};
try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&typeof o==='object')save={...DEF,...o};else if(matchMedia('(prefers-reduced-motion: reduce)').matches)save.calm=true}catch(e){}
if(!save.best||typeof save.best!=='object')save.best={};
if(!save.tries||typeof save.tries!=='object')save.tries={};
const SK=[['Aqua','#37f3c8'],['Sunrise','#ffd34f'],['Coral','#ff5d5d'],['Orchid','#d46bff'],['Lime','#9dff4f'],['Snow','#ffffff'],['Amber','#ff9a2f'],['Rose','#ff4fa3']];
if(!SK[save.skin])save.skin=0;
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
let toastT=0;const toast=m=>{const el=$('#toast');el.textContent=m;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),3500)};

/* ---------- level data: beat-grid phrases ----------
   Speed = bpm/60*4 tiles/s, so one bar = 16 tiles = 4 beats. A level is a string of bars,
   each character naming a phrase. Entries: ['s',x,y] spike, ['b',x,y,w,h] block, ['g',x,w] pit,
   ['w',x,y] saw, ['z',x,w] beat plate (lethal on the first 45% of every beat). Every phrase starts and
   ends on the floor with landing room, so any order of phrases can be played. */
const PH={'.':[],a:[['s',8]],b:[['s',8],['s',9]],c:[['b',8,0,4,1]],d:[['b',7,0,3,2],['s',13]],e:[['g',8,3]],f:[['w',8,0]],
 g:[['s',6],['s',12]],k:[['s',6],['z',11,2]],m:[['b',5,0,3,1],['b',8,0,3,2],['b',11,0,3,3]],n:[['w',6,0],['w',12,0]],
 o:[['g',6,3],['s',13]],q:[['b',6,0,6,1],['s',9,1]],r:[['w',8,2],['s',12]]};
const POOL=['acef','bdgk','mnoq','r'];
const LV=[
 {id:'first-wake',name:'First Wake',diff:'Easy',bpm:120,hue:172,root:57,seq:'..acfecaefcaecfaeacfecaefcaecfa.',bass:[0,-1,-1,0,-1,-1,0,-1,7,-1,-1,5,-1,-1,3,-1]},
 {id:'tideline',name:'Tideline',diff:'Normal',bpm:132,hue:212,root:55,seq:'..acbgekdfbgeqkdmbgkenfdmbgeqkd.',bass:[0,-1,0,0,-1,0,-1,12,0,-1,0,0,-1,7,-1,5]},
 {id:'ember-parade',name:'Ember Parade',diff:'Hard',bpm:146,hue:338,root:52,seq:'..bgkrmnoqrdkbgrmnoqrkdbmrgnoqkr.',bass:[0,0,-1,0,12,-1,0,-1,0,0,-1,7,-1,10,-1,12]},
 {id:'afterglow',name:'Afterglow',diff:'Endless',bpm:140,hue:270,root:50,endless:true,bass:[0,-1,0,-1,7,-1,0,0,-1,5,-1,3,-1,7,-1,10]}];

const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function build(d,seed){
 const lv={d,spd:d.bpm/60*4*T,bd:60/d.bpm,cols:{},bars:0,end:Infinity,gen:null};
 const add=(o,a,b)=>{o.fr=0;for(let c=Math.floor(a/T);c<=Math.floor((b-.01)/T);c++)(lv.cols[c]||(lv.cols[c]=[])).push(o)};
 const fl=(x,w)=>({k:'b',x,y:FL,w,h:200,f:1});
 add(fl(-800,800),-800,0);
 const bar=(i,ch)=>{const x0=i*16,gaps=[];
  for(const [t,x,a,b,c] of PH[ch]){const X=(x0+x)*T;
   if(t==='s')add({k:'s',x:X,y:FL-((a||0)+1)*T},X,X+T);
   else if(t==='b')add({k:'b',x:X,y:FL-(a+c)*T,w:b*T,h:c*T},X,X+b*T);
   else if(t==='g')gaps.push([X,X+a*T]);
   else if(t==='w')add({k:'w',x:X,cx:X+T/2,cy:FL-((a||0)+.5)*T},X+T/2-18,X+T/2+18);
   else if(t==='z')add({k:'z',x:X,y:FL-14,w:a*T,h:14},X,X+a*T)}
  gaps.sort((p,q)=>p[0]-q[0]);let c0=x0*T;
  for(const [g0,g1] of gaps){if(g0>c0)add(fl(c0,g0-c0),c0,g0);c0=g1}
  add(fl(c0,(x0+16)*T-c0),c0,(x0+16)*T);
  if(i&&i%8===0){const X=(x0+2)*T;add({k:'c',x:X,i:i/8},X,X+T)}};
 if(d.endless){const rnd=mulberry(seed||1);
  lv.gen=x=>{while(lv.bars*16*T<x){const i=lv.bars++,tier=Math.min(3,Math.floor(i/10));let ch='.';
   if(i>=2&&!(tier<1&&rnd()<.35)){const p=POOL.slice(0,tier+1).join('');ch=p[(rnd()*p.length)|0]}bar(i,ch)}};lv.gen(W*2)}
 else{[...d.seq+'..'].forEach((ch,i)=>bar(i,ch));lv.end=d.seq.length*16*T}
 return lv}

/* ---------- simulation: pure and deterministic (same code runs in the headless solver) ---------- */
const newState=()=>({n:-LEAD,y:FL-PS,vy:0,g:true,coy:COY,buf:0,cp:0,jump:false});
const on=(t,lv)=>((t/lv.bd)%1+1)%1<.45;
function tri(l,t,r,b,x0,x1,by,ax,ay){ // rect vs upright triangle (SAT)
 if(r<=x0||l>=x1||b<=ay||t>=by)return false;const h=by-ay;
 return !(h*(r-x0)+(ax-x0)*(b-by)<0||-h*(l-x1)+(x1-ax)*(b-by)<0)}
function step(s,lv,press,fg){ // returns 0 alive, 1 dead, 2 finished
 const pt=s.y,pb=s.y+PS;s.n++;const x=s.n*DT*lv.spd,t=s.n*DT;
 s.buf=press?BUF:Math.max(0,s.buf-1);
 if(s.buf>0&&(s.g||s.coy>0)){s.vy=-JV;s.g=false;s.coy=0;s.buf=0;s.jump=true}
 s.y+=s.vy*DT+.5*G*DT*DT;s.vy=Math.min(s.vy+G*DT,MF);
 const m=fg?5:2,L=x+m,R=x+PS-m,U=s.y+m,D=s.y+PS-m;let gr=false;
 for(let c=Math.floor(x/T);c<=Math.floor((x+PS)/T);c++){const a=lv.cols[c];if(!a)continue;
  for(let i=0;i<a.length;i++){const o=a[i];
   if(o.k==='b'){
    if(x+PS>o.x&&x<o.x+o.w&&s.y+PS>o.y&&s.y<o.y+o.h){
     if(pb<=o.y+STEP){s.y=o.y-PS;if(s.vy>0)s.vy=0;gr=true}          // land (or step up a small ledge)
     else if(pt>=o.y+o.h-STEP){s.y=o.y+o.h;if(s.vy<0)s.vy=0}       // bump head, not lethal
     else return 1}                                                 // side hit
   }else if(o.k==='s'){const ins=fg?10:7,tip=fg?14:9;if(tri(L,U,R,D,o.x+ins,o.x+T-ins,o.y+T,o.x+T/2,o.y+tip))return 1}
   else if(o.k==='w'){const r=fg?14:17,dx=o.cx-Math.min(Math.max(o.cx,L),R),dy=o.cy-Math.min(Math.max(o.cy,U),D);if(dx*dx+dy*dy<r*r)return 1}
   else if(o.k==='z'){if(on(t,lv)&&R>o.x&&L<o.x+o.w&&D>o.y&&U<o.y+o.h)return 1}
   else if(o.k==='c'){if(x+PS/2>=o.x&&s.cp<o.i)s.cp=o.i}}}
 s.g=gr;s.coy=gr?COY:Math.max(0,s.coy-1);
 if(s.y>H+80)return 1;
 return x+PS>=lv.end?2:0}

/* ---------- audio: procedural score scheduled on the audio clock ---------- */
const AU={ctx:null,l:null,id:0,
 init(){if(this.ctx){if(this.ctx.state!=='running')this.ctx.resume().catch(()=>{});return}
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)throw 0;const c=this.ctx=new C(),k=c.createDynamicsCompressor();k.connect(c.destination);
   this.mus=c.createGain();this.sfxb=c.createGain();this.mus.connect(k);this.sfxb.connect(k);
   const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b;this.vol();c.resume().catch(()=>{})}
  catch(e){this.ctx=null;toast('Audio is unavailable here, so the game will run silent.')}},
 vol(){if(this.ctx){this.mus.gain.value=save.mv*.55;this.sfxb.gain.value=save.sv*.6}},
 comp(){const c=this.ctx;return Math.max(-.15,Math.min(.4,(c.baseLatency||0)+(c.outputLatency||0)+save.off/1000))},
 tone(B,type,f,t,d,v,f2,lp){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  if(lp){const q=c.createBiquadFilter();q.frequency.value=lp;o.connect(q);q.connect(g)}else o.connect(g);g.connect(B);o.start(t);o.stop(t+d+.02)},
 noise(B,t,d,v,hp){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.nb;f.type='highpass';f.frequency.value=hp;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(B);s.start(t,Math.random()*.5);s.stop(t+d+.02)},
 play(l,base,n){this.stop();if(!this.ctx||this.ctx.state!=='running')return;const c=this.ctx;this.bus=c.createGain();this.bus.connect(this.mus);
  this.l=l;this.base=base;this.sd=60/l.d.bpm/4;this.k=Math.ceil(n*DT/this.sd);this.id=setInterval(()=>this.pump(),25);this.pump()},
 stop(){clearInterval(this.id);if(this.bus){const b=this.bus;b.gain.setTargetAtTime(0,this.ctx.currentTime,.02);setTimeout(()=>{try{b.disconnect()}catch(e){}},200);this.bus=null}},
 pump(){const c=this.ctx,cm=this.comp();while(this.base+this.k*this.sd-cm<c.currentTime+.15)this.beat(this.k++,this.base+(this.k-1)*this.sd-cm)},
 beat(k,t){if(k<0)return;const d=this.l.d,B=this.bus,bar=k>>4,i=k&15,e=Math.min(3,bar>>2),f=m=>440*2**((m-69)/12),pr=[0,-4,-2,-5][bar&3];
  if(i%4===0)this.tone(B,'sine',150,t,.18,.9,42);
  if(e>=1&&(i===4||i===12))this.noise(B,t,.12,.35,1500);
  if(e>=1&&i%2===0)this.noise(B,t,.04,.12,7000);
  if(d.bass[i]>=0)this.tone(B,'sawtooth',f(d.root-12+pr+d.bass[i]),t,this.sd*1.8,.22,0,500);
  if(e>=2)this.tone(B,'square',f(d.root+12+pr+[0,3,5,7,10][(i*3+bar)%5]+(i>7?12:0)),t,this.sd*1.4,.07,0,2400);
  if(e>=3&&i%8===6)this.tone(B,'sine',150,t,.18,.7,42)},
 sfx(n){if(!this.ctx)return;const t=this.ctx.currentTime,B=this.sfxb;
  if(n==='jump')this.tone(B,'square',380,t,.1,.16,760);
  else if(n==='land')this.noise(B,t,.05,.15,300);
  else if(n==='die'){this.noise(B,t,.5,.6,200);this.tone(B,'sawtooth',300,t,.45,.3,40)}
  else if(n==='cp'){this.tone(B,'sine',880,t,.12,.25);this.tone(B,'sine',1320,t+.08,.2,.25)}
  else if(n==='win')[523,659,784,1047,1319].forEach((f,i)=>this.tone(B,'triangle',f,t+i*.09,.3,.25));
  else this.tone(B,'triangle',660,t,.06,.18)}};

/* ---------- game state ---------- */
let lv=null,S=null,cur=0,mode='menu',practice=false,cps=[],att=1,base=0,useA=false,phys=false,held=false,edge=false,evq=[],tD=0,tC=0,shk=0,fid=0,lastP=-1,lastA='',errShown=0,susT=0;
const R={py:0,rot:0},parts=Array.from({length:260},()=>({x:0,y:0,vx:0,vy:0,life:0,max:1,sz:3,c:'#fff',g:0}));let pi=0;
const clock=()=>useA?AU.ctx.currentTime:performance.now()/1000;
const spark=(x,y,vx,vy,life,sz,c,g)=>{const p=parts[pi=(pi+1)%parts.length];p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=p.max=life;p.sz=sz;p.c=c;p.g=g||0};
function rebase(){useA=!!(AU.ctx&&AU.ctx.state==='running');base=clock()-S.n*DT;AU.play(lv,base,S.n)}
function spawn(sn){S=sn?{...sn}:newState();R.py=S.y;R.rot=0;evq.length=0;held=phys;edge=false;mode='play';parts.forEach(p=>p.life=0);rebase()}
function pct(){const x=S.n*DT*lv.spd;return lv.d.endless?Math.max(0,Math.floor(x/T)):Math.min(100,Math.max(0,Math.floor((x+PS)/lv.end*100)))}
function rec(win){if(practice)return;const v=win?100:pct(),id=lv.d.id;if(v>(save.best[id]||0)){save.best[id]=v;persist()}}
function start(i){cur=i;lv=build(LV[i],(Math.random()*1e9)|0);cps=[];att=1;save.tries[lv.d.id]=(save.tries[lv.d.id]||0)+1;persist();AU.init();hideAll();lastP=-1;lastA='';
 const pb=$('#pb');pb.querySelectorAll('s').forEach(n=>n.remove());
 if(isFinite(lv.end))for(let k=1;k*128*T<lv.end;k++){const s=document.createElement('s');s.style.left=(k*128*T/lv.end*100)+'%';pb.append(s)}
 $('#bm').style.left=(lv.d.endless?-9:save.best[lv.d.id]||0)+'%';$('#hud').hidden=false;spawn(null)}
function restart(){cps=[];att++;lastP=-1;spawn(null)}
function retry(){att++;spawn(practice&&cps.length?cps[cps.length-1]:null)}
function die(){mode='dead';tD=performance.now();AU.stop();AU.sfx('die');shk=save.calm||!save.shake?0:16;
 const px=S.n*DT*lv.spd+17;for(let i=0;i<30;i++)spark(px,S.y+17,(Math.random()-.5)*700,(Math.random()-.5)*700,.8,6,SK[save.skin][1],900);rec(false)}
function win(){mode='win';tD=performance.now();AU.stop();AU.sfx('win');rec(true)}
function pause(){if(mode!=='play'&&mode!=='count')return;mode='pause';AU.stop();show('pause')}
function resume(){hideAll();mode='count';tC=performance.now()}
function endScreen(w){mode='end';$('#hud').hidden=true;const id=lv.d.id,b=save.best[id]||0;
 $('#et').textContent=w?'Track cleared':'Crashed';
 $('#es').textContent=w?`Cleared in ${att} ${att===1?'attempt':'attempts'}.`:(lv.d.endless?`You ran ${pct()} m. Best is ${b} m.`:`You reached ${pct()}%. Best is ${b}%.`);
 $('#next').hidden=!w||!LV[cur+1];show('end')}
function tick(){
 R.py=S.y;if(lv.gen)lv.gen(S.n*DT*lv.spd+W*2);
 const lim=(S.n+1)*DT;while(evq.length&&evq[0][0]<lim){const e=evq.shift();held=e[1];if(e[1])edge=true}
 const was=S.g,vy=S.vy,cp0=S.cp,r=step(S,lv,edge||held,save.forgive);edge=false;
 const px=S.n*DT*lv.spd;
 if(S.jump){S.jump=false;AU.sfx('jump')}
 if(S.g&&!was&&vy>300){AU.sfx('land');for(let i=0;i<4;i++)spark(px+17,S.y+PS,(Math.random()-.5)*160,-Math.random()*90,.3,3,'#fff',300)}
 R.rot=S.g?R.rot+(Math.round(R.rot/90)*90-R.rot)*.35:R.rot+540*DT;
 if(S.cp!==cp0){AU.sfx('cp');if(practice)cps.push({...S})}
 if((S.n&3)===0)spark(px+8,S.y+17,-40,0,.35,S.g?4:7,SK[save.skin][1],0);
 if(r===1)die();else if(r===2)win()}

/* ---------- rendering ---------- */
const c=$('#g'),ctx=c.getContext('2d');
const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)};
function bg(hue,cx,pul){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${hue},60%,${7+pul*6}%)`);g.addColorStop(1,`hsl(${(hue+40)%360},55%,${16+pul*8}%)`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(let l=0;l<3;l++){const sp=.12+l*.15,w=90+l*50,o=cx*sp;ctx.fillStyle=`hsl(${hue+l*10},45%,${9+l*4+pul*3}%)`;
  for(let i=Math.floor(o/w);i<o/w+W/w+2;i++){const h=50+((i*2654435761>>>0)%100)*(1+l*.6);ctx.fillRect(i*w-o,FL-h-l*30,w-14,h+l*30+4)}}}
function render(dt){
 const d=lv?lv.d:LV[0],hue=d.hue,bd=lv?lv.bd:.5;let x=0,y=FL-PS,tl=performance.now()/1000;
 if(lv&&S){const a=mode==='play'?Math.min(1,Math.max(0,(clock()-base-S.n*DT)/DT)):0;tl=(S.n+a)*DT;x=tl*lv.spd;y=R.py+(S.y-R.py)*a}
 const ph=((tl/bd)%1+1)%1,pul=Math.pow(Math.max(0,1-ph*2.5),2)*(save.calm?.2:1),cx=lv?x-PX:tl*160,col=SK[save.skin][1];
 shk*=.88;const sh=shk>.3?shk:0;ctx.save();if(sh)ctx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
 bg(lv?hue:200,cx,pul);
 if(lv){fid++;const c0=Math.floor(cx/T)-1,c1=c0+Math.ceil(W/T)+3,acc=`hsl(${(hue+150)%360},100%,${62+pul*18}%)`,edgeC=`hsl(${hue},95%,${60+pul*25}%)`;
  if(isFinite(lv.end)){const fx=lv.end-cx;if(fx<W+60){ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(fx,0,60,FL)}}
  for(let k=c0;k<=c1;k++){const a=lv.cols[k];if(!a)continue;
   for(const o of a){if(o.fr===fid)continue;o.fr=fid;const sx=o.x-cx;
    if(o.k==='b'){ctx.fillStyle=`hsl(${hue},42%,${15+pul*5}%)`;ctx.fillRect(sx,o.y,o.w,Math.min(o.h,H-o.y));ctx.fillStyle=edgeC;ctx.fillRect(sx,o.y,o.w,4);
     if(!o.f){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=2;ctx.strokeRect(sx+4,o.y+8,o.w-8,o.h-12)}}
    else if(o.k==='s'){ctx.beginPath();ctx.moveTo(sx,o.y+T);ctx.lineTo(sx+T/2,o.y+3);ctx.lineTo(sx+T,o.y+T);ctx.closePath();ctx.fillStyle=acc;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke()}
    else if(o.k==='w'){ctx.save();ctx.translate(o.cx-cx,o.cy);ctx.rotate(tl*(save.calm?1:7));ctx.beginPath();
     for(let i=0;i<16;i++){const r=i%2?13:21,an=i*Math.PI/8;ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r)}
     ctx.closePath();ctx.fillStyle='#ffd34f';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
    else if(o.k==='z'){const live=on(tl,lv);ctx.fillStyle=live?'#ff3d6e':(ph>.82?'rgba(255,61,110,.7)':'rgba(255,61,110,.28)');ctx.fillRect(sx,o.y,o.w,o.h);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(sx,o.y,o.w,o.h)}
    else if(o.k==='c'){const hit=S&&S.cp>=o.i,bx=sx+T/2;ctx.fillStyle=hit?'#37f3c8':'#8a93d8';ctx.fillRect(bx-2,FL-90,4,90);
     ctx.beginPath();ctx.moveTo(bx,FL-112);ctx.lineTo(bx+14,FL-96);ctx.lineTo(bx,FL-80);ctx.lineTo(bx-14,FL-96);ctx.closePath();ctx.fill()}}}
  if(mode!=='dead'){const py=mode==='win'?y-(performance.now()-tD)*.25:y;ctx.save();ctx.translate(PX+PS/2,py+PS/2);ctx.rotate(R.rot*Math.PI/180);
   ctx.fillStyle=col;rr(-17,-17,34,34,8);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
   ctx.fillStyle='rgba(7,10,28,.85)';ctx.fillRect(-8,-8,16,16);ctx.fillStyle=col;ctx.globalAlpha=.55+pul*.45;const q=5+pul*3;ctx.fillRect(-q,-q,q*2,q*2);ctx.restore()}}
 for(const p of parts){if(p.life<=0)continue;p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.fillRect(p.x-cx-p.sz/2,p.y-p.sz/2,p.sz,p.sz)}
 ctx.globalAlpha=1;ctx.restore();
 if(mode==='win'&&lv){const px=S.n*DT*lv.spd+17;for(let i=0;i<2;i++)spark(px,y,(Math.random()-.5)*500,-Math.random()*400,.9,6,SK[(Math.random()*SK.length)|0][1],700)}
 ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 150px "Trebuchet MS",sans-serif';
 if(mode==='count'){ctx.fillText(Math.max(1,3-Math.floor((performance.now()-tC)/500)),W/2,H/2+40)}
 else if(mode==='dead'){ctx.globalAlpha=.7;ctx.font='900 90px "Trebuchet MS",sans-serif';ctx.fillText(lv.d.endless?pct()+' m':pct()+'%',W/2,H/2);ctx.globalAlpha=1}
 if(lv&&S&&mode!=='menu'){const p=pct();if(p!==lastP){lastP=p;$('#pt').textContent=lv.d.endless?p+' m':p+'%';$('#pf').style.width=(lv.d.endless?100:p)+'%'}
  const a=`Attempt ${att}${practice?', practice mode':''}`;if(a!==lastA){lastA=a;$('#at').textContent=a}}}

/* ---------- main loop: the sim chases the audio clock, so music and obstacles cannot drift ---------- */
let lastT=0;
function frame(ts){requestAnimationFrame(frame);const dt=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;
 try{const now=performance.now();
  if(mode==='play'){
   if(useA&&AU.ctx.state!=='running'){if(!susT)susT=now;else if(now-susT>400){susT=0;pause()}}else susT=0;
   if(mode==='play'){const tg=clock()-base;let k=0;while(mode==='play'&&(S.n+1)*DT<=tg&&k<12){tick();k++}
    if(mode==='play'&&(S.n+1)*DT<=tg){base+=tg-S.n*DT;AU.play(lv,base,S.n)}}} // resync after a long stall
  else if(mode==='count'&&now-tC>1500){mode='play';held=phys;rebase()}
  else if(mode==='dead'&&now-tD>(save.auto?650:350)){save.auto?retry():endScreen(false)}
  else if(mode==='win'&&now-tD>1500)endScreen(true);
  render(dt)}
 catch(err){console.error(err);if(!errShown){errShown=1;toast('Unexpected error: '+err.message+'. Returning to the menu.');mode='menu';AU.stop();lv=null;$('#hud').hidden=true;show('home')}}}

/* ---------- input: events are timestamped so jumps land on the right sim tick at any frame rate ---------- */
const age=e=>{const a=performance.now()-e.timeStamp;return a>=0&&a<100?a/1000:0};
const press=(down,e)=>{if(mode==='play')evq.push([clock()-(e?age(e):0)-base,down])};
const JK=['Space','ArrowUp','KeyW'];
addEventListener('keydown',e=>{
 if(JK.includes(e.code)){if(mode==='play'||mode==='count'||mode==='dead')e.preventDefault();if(!e.repeat&&!phys){phys=true;press(true,e)}return}
 if(e.code==='Escape'||e.code==='KeyP'){if(mode==='play'||mode==='count')pause();else if(mode==='pause')resume();return}
 if(e.code==='KeyR'&&(mode==='play'||mode==='pause'||mode==='dead')){hideAll();restart();return}
 if(practice&&mode==='play'){if(e.code==='KeyX'){cps.push({...S});AU.sfx('cp');toast('Checkpoint placed')}else if(e.code==='KeyC'&&cps.length){cps.pop();toast('Checkpoint removed')}}});
addEventListener('keyup',e=>{if(JK.includes(e.code)){phys=false;press(false,e)}});
$('#stage').addEventListener('pointerdown',e=>{if(mode==='play'||mode==='dead'||mode==='count'){e.preventDefault();if(!phys){phys=true;press(true,e)}}});
const rel=e=>{if(phys){phys=false;press(false,e)}};addEventListener('pointerup',rel);addEventListener('pointercancel',rel);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});addEventListener('blur',pause);

/* ---------- menus ---------- */
function hideAll(){$$('.ov').forEach(o=>o.hidden=true)}
function show(id){hideAll();const el=$('#'+id);el.hidden=false;if(id==='levels')cards();
 if(id==='home'||id==='levels'||id==='opts'){mode='menu';$('#hud').hidden=true}
 const f=el.querySelector('button,input');if(f)f.focus({preventScroll:true})}
function cards(){const el=$('#cards');el.textContent='';
 LV.forEach((d,i)=>{const b=document.createElement('button'),v=save.best[d.id]||0;b.className='card';
  b.innerHTML=`<b>${d.name}</b><small>${d.diff}, ${d.bpm} BPM</small><span class="bar"><i style="width:${d.endless?100:v}%"></i></span><small>${d.endless?'Best '+v+' m':v+'% best'}</small>`;
  b.onclick=()=>start(i);el.append(b)})}
function syncUI(){$$('[data-k]').forEach(el=>{const k=el.dataset.k;if(el.type==='range')el.value=save[k];else el.setAttribute('aria-pressed',String(!!save[k]))});
 $$('.sw').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===save.skin)))}
SK.forEach(([n,col],i)=>{const b=document.createElement('button');b.className='sw';b.style.background=col;b.setAttribute('aria-label',n+' icon');b.onclick=()=>{save.skin=i;persist();syncUI()};$('#sws').append(b)});
$$('input[data-k]').forEach(el=>el.oninput=()=>{save[el.dataset.k]=+el.value;AU.vol();persist()});
$$('button[data-k]').forEach(el=>el.addEventListener('click',()=>{save[el.dataset.k]=!save[el.dataset.k];persist();syncUI()}));
$('#prac').onclick=e=>{practice=!practice;e.currentTarget.setAttribute('aria-pressed',String(practice))};
const quit=()=>{AU.stop();lv=null;S=null;show('levels')};
$('#resume').onclick=resume;$('#restart').onclick=()=>{hideAll();restart()};$('#quit').onclick=quit;$('#quit2').onclick=quit;
$('#retry').onclick=()=>{hideAll();$('#hud').hidden=false;restart()};$('#next').onclick=()=>start(cur+1);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;AU.init();AU.sfx('ui');if(b.dataset.go)show(b.dataset.go)});
addEventListener('error',e=>toast('Unexpected error: '+(e.message||'unknown')));

/* ---------- scale the fixed-size stage to the window, keeping the canvas sharp ---------- */
function fit(){const s=Math.min(innerWidth/W,innerHeight/H),q=Math.min(s*(devicePixelRatio||1),2);
 $('#stage').style.transform=`scale(${s})`;c.width=Math.round(W*q);c.height=Math.round(H*q);ctx.setTransform(q,0,0,q,0,0)}
addEventListener('resize',fit);
window.__bw={LV,PH,build,newState,step,DT,PS,T};
if(!ctx)toast('Canvas is not supported in this browser.');
fit();syncUI();show('home');requestAnimationFrame(frame);
})();
</script>
