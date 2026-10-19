(()=>{
const colors={olive:'#292b22',forest:'#182b26',slate:'#242e3c',steel:'#263235'},accents={yellow:'#f3e84c',orange:'#ff9656',lime:'#c0ed65',blue:'#76b7ff',teal:'#55ddce',terracotta:'#e2895c'};
const daylight={olive:{bg:'#ffffff',ink:'#303323',muted:'#656951'},forest:{bg:'#ffffff',ink:'#173d2d',muted:'#536d5c'},slate:{bg:'#ffffff',ink:'#22364f',muted:'#596b83'},steel:{bg:'#ffffff',ink:'#243f46',muted:'#567279'}};
const nav=document.querySelector('.site-links');if(nav)nav.innerHTML='<a href="index.html">Landing</a><a href="about.html">About</a><a href="project.html">Project</a><button id="preview-switch" role="switch" aria-label="Daylight mode" aria-checked="false"></button>';
document.getElementById('preview-switch')?.addEventListener('click',()=>parent.postMessage({type:'preview-toggle'},location.origin));
const title=document.querySelector('#studio-title, #headline h1, #proj-title');
if(title){const wrap=document.createElement('div');wrap.className='study-title';title.before(wrap);wrap.append(title);const g=document.createElement('div');g.className='graphic-study';g.setAttribute('aria-hidden','true');g.innerHTML='<div class="study-organic"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div><div class="study-rectangles"><i></i><i></i></div><div class="study-editing"><i></i><i></i><i></i><i></i><small></small></div>';wrap.append(g);new ResizeObserver(()=>{g.querySelector('small').textContent='H1 / '+Math.round(title.getBoundingClientRect().width)+' × '+Math.round(title.getBoundingClientRect().height);}).observe(title);}
if(document.body.dataset.page!=='home'){const repeats=document.createElement('div');repeats.className='organic-repeats';repeats.setAttribute('aria-hidden','true');repeats.innerHTML='<div class="organic-echo echo-middle"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div><div class="organic-echo echo-bottom"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div>';document.body.append(repeats);}
let state={},raf=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');const stage=document.querySelector('#stage');let water,ctx;
if(stage){water=document.createElement('canvas');water.id='underwater';water.setAttribute('aria-hidden','true');stage.prepend(water);ctx=water.getContext('2d');}
// Deterministic interpolated noise: no periodic wave bands or visible tiles.
function waterNoise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const hash=(a,b)=>{let n=Math.imul(a,374761393)+Math.imul(b,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;}
function drawWater(t=0){if(!water)return;if(state.graphics==='universe'){drawUniverse(t);return;}const w=water.width,h=water.height,day=state.mode==='day';ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,day?'#b7cfcd':'#44484b');bg.addColorStop(.42,day?'#dce7e2':'#252a2e');bg.addColorStop(1,day?'#f4f6ed':'#0a0d11');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
// Light shafts widen and soften with depth; the water surface refracts slowly.
ctx.globalCompositeOperation='screen';ctx.filter='blur(22px)';for(let i=0;i<9;i++){const x=(i/8)*w+Math.sin(t*.00014+i*1.7)*w*.045;const light=ctx.createLinearGradient(x,0,x,h*.9);light.addColorStop(0,day?'#ffffff44':'#c3d5d72e');light.addColorStop(1,'#ffffff00');ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x-12,0);ctx.lineTo(x+30,0);ctx.lineTo(x+w*.16,h*.9);ctx.lineTo(x-w*.08,h*.9);ctx.fill();}
ctx.filter='none';ctx.globalCompositeOperation='source-over';
const surfaceDepth=Math.min(h*.27,230),phase=t*.000025,sw=640,sh=120;
if(!drawWater.surface){drawWater.surface=document.createElement('canvas');drawWater.surface.width=sw;drawWater.surface.height=sh;drawWater.pixels=drawWater.surface.getContext('2d').createImageData(sw,sh);}
const sc=drawWater.surface.getContext('2d'),pixels=drawWater.pixels;
for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
 const u=x/sw*20,v=y/sh*12;
 const warp=waterNoise(u*.45+phase,v*.5)*2;
 const a=waterNoise(u+phase,v+warp-phase*.4);
 const b=waterNoise(u*2.3-phase*.3,v*2.3+warp);
 const c=waterNoise(u*5.7+phase*.4,v*5.7);
 const n=a*.55+b*.30+c*.15;
 const slope=waterNoise(u+phase,v+warp+.12-phase*.4)-a;
 const fade=Math.pow(1-y/sh,2.3);
 const value=Math.max(0,Math.min(255,(day?145:80)+(n-.5)*125+slope*390));
 const i=(y*sw+x)*4;pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value;pixels.data[i+3]=Math.round(fade*230);
}
sc.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(drawWater.surface,0,0,w,surfaceDepth);
ctx.filter='none';ctx.globalCompositeOperation='source-over';for(let i=0;i<45;i++){const x=((i*137.17)%w+Math.sin(t*.0001+i)*10),y=((i*81.23+t*.002)%h);ctx.fillStyle=day?'#667b7518':'#d8ebe921';ctx.fillRect(x,y,1,1);}}

function drawUniverse(t){
 const w=water.width,h=water.height;
 if(!drawUniverse.texture){
  const tex=document.createElement('canvas');tex.width=640;tex.height=400;const tc=tex.getContext('2d'),im=tc.createImageData(640,400);
  for(let y=0;y<400;y++)for(let x=0;x<640;x++){
   const u=x/640,v=y/400,n=waterNoise(u*5,v*5)*.55+waterNoise(u*13+10,v*13)*.3+waterNoise(u*37,v*37)*.15;
   const belt=Math.exp(-Math.pow((v-(.65-u*.42+waterNoise(u*4,2)*.18))/.22,2));
   const dust=Math.pow(Math.max(0,n-.22),2)*belt;
   const i=(y*640+x)*4;im.data[i]=3+dust*51;im.data[i+1]=4+dust*60;im.data[i+2]=7+dust*84;im.data[i+3]=255;
  }tc.putImageData(im,0,0);drawUniverse.texture=tex;
 }
 ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.fillStyle='#030407';ctx.fillRect(0,0,w,h);ctx.drawImage(drawUniverse.texture,-10+Math.sin(t*.000018)*7,-10,w+20,h+20);
 let seed=2406;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<340;i++){
  const x=rand()*w,y=rand()*h,r=rand(),phase=rand()*6.28;
  const alpha=(.12+r*.55)*(.9+.1*Math.sin(t*.00035+phase));
  ctx.fillStyle='rgba(225,232,245,'+alpha+')';ctx.beginPath();ctx.arc(x,y,r>.97?1.3:.3+r*.5,0,Math.PI*2);ctx.fill();
  if(r>.985){const g=ctx.createRadialGradient(x,y,0,x,y,6);g.addColorStop(0,'rgba(190,210,255,.22)');g.addColorStop(1,'rgba(190,210,255,0)');ctx.fillStyle=g;ctx.fillRect(x-6,y-6,12,12);}
 }
}
let last=0;function tick(t){if(t-last>40){drawWater(t);last=t;}raf=requestAnimationFrame(tick)}
function syncWater(){cancelAnimationFrame(raf);if(!water||!['underwater','universe'].includes(state.graphics))return;water.width=Math.min(1400,stage.clientWidth);water.height=Math.round(water.width*stage.clientHeight/stage.clientWidth);drawWater(0);if(state.motion==='subtle'&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(tick);}
window.addEventListener('resize',syncWater);document.addEventListener('visibilitychange',syncWater);reduced.addEventListener('change',syncWater);
const fontFamilies={condensed:"'Roboto Condensed',sans-serif",space:"'Space Grotesk',sans-serif",arial:'Arial,Helvetica,sans-serif',georgia:'Georgia,serif',mono:"'JetBrains Mono',monospace"};
function apply(v){state=v;const modeButton=document.getElementById('preview-switch');if(modeButton){modeButton.disabled=v.graphics==='universe';modeButton.title=v.graphics==='universe'?'Universe uses a dark background':'Switch day/night';}window.previewFont=fontFamilies[v.font]||fontFamilies.space;document.body.dataset.font=v.font||'space';document.documentElement.style.setProperty('--preview-font',window.previewFont);document.fonts.load('400 18px '+window.previewFont).then(()=>window.dispatchEvent(new Event('resize')));document.body.dataset.graphics=v.graphics||'none';document.body.dataset.motion=v.motion||'static';document.getElementById('preview-switch')?.setAttribute('aria-checked',v.mode==='day');const light=daylight[v.palette]||daylight.olive;window.previewInk=light.ink;const day=v.mode==='day',accent=accents[v.accent]||accents.yellow;for(const el of [document.documentElement,document.body]){el.classList.toggle('day',day);for(const [k,value] of Object.entries({bg:v.graphics==='universe'?'#030407':day?light.bg:colors[v.palette]||colors.olive,paper:v.graphics==='universe'?'#030407':day?light.bg:colors[v.palette]||colors.olive,ink:day?light.ink:'#f2f1e9',muted:day?light.muted:'#b2bdb6',grey:day?light.muted:'#b2bdb6','ink-dim':day?light.muted:'#b2bdb6','ink-faint':day?light.muted:'#a3afa7',line:day?light.ink+'33':'#eaf4ee33',accent}))el.style.setProperty('--'+k,value,'important')}window.dispatchEvent(new CustomEvent('site-theme',{detail:day?'day':'night'}));syncWater();}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='palette-preview')apply(e.data)});parent.postMessage({type:'palette-ready'},location.origin);
document.querySelectorAll('.site-links a,.site-brand').forEach(a=>{a.onclick=e=>{e.preventDefault();const target=a.getAttribute('href');parent.postMessage({type:'preview-page',page:target.startsWith('about')?'about':target.startsWith('project.html')?'project':'index'},location.origin)}});
})();



