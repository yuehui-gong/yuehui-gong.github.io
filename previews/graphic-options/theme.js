(()=>{
const colors={olive:'#292b22',forest:'#182b26',slate:'#242e3c',steel:'#263235'},accents={yellow:'#f3e84c',orange:'#ff9656',lime:'#c0ed65',blue:'#76b7ff',teal:'#55ddce',terracotta:'#e2895c'};
const nav=document.querySelector('.site-links');if(nav)nav.innerHTML='<a href="index.html">Landing</a><a href="about.html">About</a><a href="project.html">Project</a><button id="preview-switch" role="switch" aria-label="Daylight mode" aria-checked="false"></button>';
document.getElementById('preview-switch')?.addEventListener('click',()=>parent.postMessage({type:'preview-toggle'},location.origin));
const title=document.querySelector('#studio-title, #headline h1, #proj-title');
if(title){const wrap=document.createElement('div');wrap.className='study-title';title.before(wrap);wrap.append(title);const g=document.createElement('div');g.className='graphic-study';g.setAttribute('aria-hidden','true');g.innerHTML='<div class="study-organic"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div><div class="study-rectangles"><i></i><i></i></div><div class="study-editing"><i></i><i></i><i></i><i></i><small></small></div>';wrap.append(g);new ResizeObserver(()=>{g.querySelector('small').textContent='H1 / '+Math.round(title.getBoundingClientRect().width)+' × '+Math.round(title.getBoundingClientRect().height);}).observe(title);}
if(document.body.dataset.page!=='home'){const repeats=document.createElement('div');repeats.className='organic-repeats';repeats.setAttribute('aria-hidden','true');repeats.innerHTML='<div class="organic-echo echo-middle"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div><div class="organic-echo echo-bottom"><svg viewBox="0 0 700 700" aria-hidden="true"><path class="organic-fill" d="M40 450 C-10 365 80 310 160 280 C240 250 205 170 285 145 C370 118 405 220 490 245 C600 277 650 340 615 415 C580 490 475 460 405 505 C325 557 335 635 230 625 C125 615 100 540 40 450 Z"/><path class="organic-line" d="M125 600 C35 545 90 430 155 375 C220 320 170 250 200 175 C230 100 325 65 390 105 C455 145 410 240 460 285 C510 330 650 300 655 390 C660 480 545 510 475 520 C380 535 390 640 300 660 C225 677 190 640 125 600 Z"/></svg></div>';document.body.append(repeats);}
let state={},raf=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');const stage=document.querySelector('#stage');let water,ctx;
if(stage){water=document.createElement('canvas');water.id='underwater';water.setAttribute('aria-hidden','true');stage.prepend(water);ctx=water.getContext('2d');}
function drawWater(t=0){if(!water)return;const w=water.width,h=water.height,day=state.mode==='day';ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,day?'#b7cfcd':'#45565d');bg.addColorStop(.42,day?'#dce7e2':'#1d3039');bg.addColorStop(1,day?'#f4f6ed':'#080f18');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
// Light shafts widen and soften with depth; the water surface refracts slowly.
ctx.globalCompositeOperation='screen';ctx.filter='blur(22px)';for(let i=0;i<9;i++){const x=(i/8)*w+Math.sin(t*.00014+i*1.7)*w*.045;const light=ctx.createLinearGradient(x,0,x,h*.9);light.addColorStop(0,day?'#ffffff44':'#c3e1df55');light.addColorStop(1,'#ffffff00');ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x-12,0);ctx.lineTo(x+30,0);ctx.lineTo(x+w*.16,h*.9);ctx.lineTo(x-w*.08,h*.9);ctx.fill();}
// Crisp, flattened reflection islands on the underside of the water.
// The yellow reference marks describe contours, not the reflection colour.
ctx.filter='none';ctx.globalCompositeOperation='source-over';
const phase=t*.00012,surfaceDepth=Math.min(h*.19,175);
for(let row=0;row<7;row++){
 const depth=row/6;
 for(let col=0;col<10;col++){
  const seed=row*17+col*3.73;
  const cx=(col+.25+Math.sin(seed)*.3)*w/9+Math.sin(phase+seed)*8;
  const cy=5+Math.pow(depth,1.5)*surfaceDepth+Math.sin(seed*2.1)*7;
  const rx=w*(.018+.024*(.5+.5*Math.sin(seed*4.1)))*(1+depth*.4);
  const ry=(3+depth*7)*(.75+.35*Math.cos(seed));
  const points=[];
  for(let j=0;j<24;j++){
   const angle=j/24*Math.PI*2;
   const ripple=1+.2*Math.sin(angle*3+seed+phase)+.12*Math.cos(angle*5-seed+phase*.7);
   points.push([cx+Math.cos(angle)*rx*ripple,cy+Math.sin(angle)*ry*ripple]);
  }
  ctx.beginPath();ctx.moveTo((points[23][0]+points[0][0])/2,(points[23][1]+points[0][1])/2);
  for(let j=0;j<24;j++){const next=points[(j+1)%24];ctx.quadraticCurveTo(...points[j],(points[j][0]+next[0])/2,(points[j][1]+next[1])/2);}ctx.closePath();
  const shade=ctx.createLinearGradient(0,cy-ry,0,cy+ry);
  const alpha=(.23+.16*(.5+.5*Math.sin(seed)))*(1-depth*.74);
  shade.addColorStop(0,'rgba(7,20,28,'+alpha*.85+')');
  shade.addColorStop(.42,'rgba(175,205,211,'+alpha*.55+')');
  shade.addColorStop(.8,'rgba(222,239,237,'+alpha+')');
  shade.addColorStop(1,'rgba(222,239,237,'+alpha*.3+')');
  ctx.fillStyle=shade;ctx.fill();
 }
}
ctx.filter='none';ctx.globalCompositeOperation='source-over';for(let i=0;i<45;i++){const x=((i*137.17)%w+Math.sin(t*.0001+i)*10),y=((i*81.23+t*.002)%h);ctx.fillStyle=day?'#667b7518':'#d8ebe921';ctx.fillRect(x,y,1,1);}}
let last=0;function tick(t){if(t-last>40){drawWater(t);last=t;}raf=requestAnimationFrame(tick)}
function syncWater(){cancelAnimationFrame(raf);if(!water||state.graphics!=='underwater')return;water.width=Math.min(1400,stage.clientWidth);water.height=Math.round(water.width*stage.clientHeight/stage.clientWidth);drawWater(0);if(state.motion==='subtle'&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(tick);}
window.addEventListener('resize',syncWater);document.addEventListener('visibilitychange',syncWater);reduced.addEventListener('change',syncWater);
function apply(v){state=v;document.body.dataset.graphics=v.graphics||'none';document.body.dataset.motion=v.motion||'static';document.getElementById('preview-switch')?.setAttribute('aria-checked',v.mode==='day');const day=v.mode==='day',accent=accents[v.accent]||accents.yellow;for(const el of [document.documentElement,document.body]){el.classList.toggle('day',day);for(const [k,value] of Object.entries({bg:day?'#fafbf7':colors[v.palette]||colors.olive,paper:day?'#fafbf7':colors[v.palette]||colors.olive,ink:day?'#242c29':'#f2f1e9',muted:day?'#5d6962':'#b2bdb6',grey:day?'#5d6962':'#b2bdb6','ink-dim':day?'#5d6962':'#b2bdb6','ink-faint':day?'#68736c':'#a3afa7',line:day?'#25352933':'#eaf4ee33',accent}))el.style.setProperty('--'+k,value,'important')}window.dispatchEvent(new CustomEvent('site-theme',{detail:day?'day':'night'}));syncWater();}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='palette-preview')apply(e.data)});parent.postMessage({type:'palette-ready'},location.origin);
document.querySelectorAll('.site-links a,.site-brand').forEach(a=>{a.onclick=e=>{e.preventDefault();const target=a.getAttribute('href');parent.postMessage({type:'preview-page',page:target.startsWith('about')?'about':target.startsWith('project.html')?'project':'index'},location.origin)}});
})();

