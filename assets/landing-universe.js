(()=>{
const stage=document.getElementById('stage');if(!stage)return;
const canvas=document.createElement('canvas');canvas.id='universe-background';canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);const ctx=canvas.getContext('2d');if(!ctx)return;
function draw(){
if(document.documentElement.classList.contains('day'))return;
let seed=72941;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
const d=window.devicePixelRatio||1;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#030509';ctx.fillRect(0,0,w,h);
const count=Math.round(w*h/180);for(let i=0;i<count;i++){const x=rand()*w,y=rand()*h;const band=Math.exp(-Math.pow((y/h-(.86-.68*x/w+.055*Math.sin(x/w*9)))/.15,2));const density=.27+.53*band+.08*Math.sin(x/w*7+y/h*3);if(rand()>density)continue;const v=rand(),bright=v>.987;const radius=bright?.85+rand()*.65:.25+Math.pow(rand(),2)*.65;const alpha=bright?.78+rand()*.22:.18+Math.pow(rand(),2)*.52;const tone=rand();const rgb=tone<.08?'199,215,234':tone>.95?'237,226,209':'220,226,233';if(bright){const halo=2.5+rand()*1.5;const g=ctx.createRadialGradient(x,y,0,x,y,halo);for(let j=0;j<=16;j++){const t=j/16;const a=.11*Math.exp(-7*t*t)*(1-t);g.addColorStop(t,`rgba(${rgb},${a})`);}ctx.fillStyle=g;ctx.fillRect(x-halo,y-halo,halo*2,halo*2);}ctx.fillStyle=`rgba(${rgb},${alpha})`;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();}


}
let frame;function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
new ResizeObserver(schedule).observe(stage);window.addEventListener('resize',schedule);window.addEventListener('site-theme',schedule);
// Repaint at native pixel density when moving between monitors.
function watchDensity(){const query=matchMedia(`(resolution: ${devicePixelRatio}dppx)`);query.addEventListener('change',()=>{schedule();watchDensity();},{once:true});}watchDensity();
document.fonts.ready.then(()=>window.dispatchEvent(new Event('resize')));schedule();
})();
