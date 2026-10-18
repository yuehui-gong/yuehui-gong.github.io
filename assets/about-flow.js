/* Shared team flow: transforms only, no per-frame layout reads. */
(()=>{
const field=document.getElementById('people-field');if(!field)return;
function start(){const cards=[...field.querySelectorAll('.team-card')];if(!cards.length)return false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const dialog=document.createElement('dialog');dialog.className='team-reader';const close=document.createElement('button');close.type='button';close.textContent='Close';const content=document.createElement('div');dialog.append(close,content);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
let hover=false,focused=false,visible=false,travel=0,last=0,raf=0,metrics=[];let height=0,stride=0,lanes=3;
function update(){field.classList.toggle('team-flow',!reduced.matches);if(reduced.matches)cards.forEach(c=>c.style.transform='');schedule()}
function stopped(){return hover||focused||dialog.open||reduced.matches||!visible||document.hidden}
function measure(){lanes=innerWidth<=700?2:3;const cardHeight=Math.max(...cards.map(c=>c.offsetHeight));stride=cardHeight+28;const rows=Math.ceil(cards.length/lanes);height=rows*stride+64;if(!reduced.matches)field.style.height=height+'px';else field.style.height='';metrics=cards.map((c,i)=>({lane:i%lanes,slot:Math.floor(i/lanes),x:(i%lanes)*(field.clientWidth-c.offsetWidth)/(lanes-1)}));draw()}
function draw(){if(reduced.matches)return;cards.forEach((c,i)=>{const m=metrics[i];if(!m)return;const phase=travel/150;const drift=32+32*Math.sin(phase+(m.lane===1?Math.PI:0));const y=12+m.slot*stride+drift;c.style.transform=`translate3d(${m.x}px,${y}px,0)`})}
function frame(now){raf=0;if(stopped()){last=0;return}travel+=Math.min(last?(now-last)/1000:0,.05)*18;last=now;draw();schedule()}
function schedule(){if(!stopped()&&!raf)raf=requestAnimationFrame(frame);else if(stopped())last=0}
cards.forEach(c=>{const trigger=c.querySelector('.portrait-trigger');const read=document.createElement('button');read.type='button';read.className='team-read';read.textContent='Read biography';read.onclick=()=>{content.replaceChildren();const name=c.querySelector('h3').cloneNode(true);name.id='team-reader-name';dialog.setAttribute('aria-labelledby',name.id);content.append(name,c.querySelector('.team-bio').cloneNode(true));dialog.showModal()};c.append(read);c.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;schedule()}});c.addEventListener('pointerleave',()=>{hover=false;schedule()});});
field.addEventListener('focusin',()=>{focused=true;schedule()});field.addEventListener('focusout',e=>{focused=field.contains(e.relatedTarget);schedule()});dialog.addEventListener('close',schedule);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:0}).observe(field);
const resize=new ResizeObserver(measure);resize.observe(field);cards.forEach(c=>resize.observe(c));
reduced.addEventListener('change',()=>{update();measure()});document.addEventListener('visibilitychange',schedule);update();measure();return true}
if(!start()){const observer=new MutationObserver(()=>{if(start())observer.disconnect()});observer.observe(field,{childList:true})}
})();
