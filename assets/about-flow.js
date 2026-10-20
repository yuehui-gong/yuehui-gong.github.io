/* Continuous portrait ribbon. Biography text stays outside the moving track. */
(async()=>{
const field=document.getElementById('people-field');if(!field)return;
const read=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return r.json()};
try{
const config=await read('content/about/index.json');
const profiles=await Promise.all(config.members.map(async id=>({id,...await read('content/about/team/'+id+'/profile.json')})));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
field.className='people-field team-ribbon';field.style.maxWidth=(profiles.length*344-320*1.2-24)+'px';field.removeAttribute('aria-live');field.setAttribute('aria-label','Team portraits. Select a portrait to read the biography.');
const track=document.createElement('div');track.className='portrait-track';
const dialog=document.createElement('dialog');dialog.className='team-reader';const close=document.createElement('button');close.type='button';close.textContent='Close';const body=document.createElement('div');dialog.append(close,body);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
function open(p){body.replaceChildren();const h=document.createElement('h3');h.id='team-reader-name';h.textContent=p.name;const bio=document.createElement('div');bio.className='team-bio';for(const value of p.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=value;bio.append(paragraph)}body.append(h,bio);dialog.setAttribute('aria-labelledby',h.id);dialog.showModal()}
let suppressClickUntil=0;
const groups=[];for(let copy=0;copy<1;copy++){const group=document.createElement('div');group.className='portrait-group';profiles.forEach(p=>{const button=document.createElement('button');button.type='button';button.className='ribbon-person';button.setAttribute('aria-label','Read biography of '+p.name);const face=document.createElement('span');face.className='ribbon-face';const img=new Image();img.src='content/about/team/'+p.id+'/'+p.portraitA;img.alt=p.portraitAlt||p.name;img.decoding='async';const name=document.createElement('span');name.className='ribbon-name';name.textContent=p.name;const caption=document.createElement('span');caption.className='ribbon-caption';caption.textContent='Read biography';const excerpt=document.createElement('span');excerpt.className='ribbon-bio';excerpt.textContent=(p.bio||[])[0]||'';img.draggable=false;face.append(img);button.append(face,name,excerpt,caption);button.onclick=()=>{if(performance.now()>suppressClickUntil)open(p)};group.append(button)});groups.push(group);track.append(group)}field.replaceChildren(track);
let portraitWidth=320,step=292,offset=0,width=0,last=0,raf=0,visible=false,hover=false,focus=false,manual=false,drag=null,resumeTimer;
function stopped(){return manual||!!drag||reduced.matches||!visible||document.hidden||hover||focus||dialog.open}
const cards=[...groups[0].children];
function wrap(value){return ((value%width)+width)%width}
function draw(){track.style.transform='none';cards.forEach((card,i)=>{card.style.transform=reduced.matches?'none':`translate3d(${wrap(i*step-offset+portraitWidth*1.2)-portraitWidth*1.2}px,0,0)`})}
function measure(){portraitWidth=Math.min(320,Math.max(160,field.clientWidth/3.75));field.style.setProperty('--portrait-width',portraitWidth+'px');step=portraitWidth+24;width=profiles.length*step;track.style.height=reduced.matches?'auto':Math.ceil(Math.max(...cards.map(c=>c.offsetHeight)))+'px';offset=wrap(offset);draw()}
function schedule(){if(stopped()){last=0;return}if(!raf)raf=requestAnimationFrame(frame)}
function frame(now){raf=0;if(stopped()){last=0;return}offset=wrap(offset+Math.min(last?(now-last)/1000:0,.05)*28);last=now;draw();schedule()}
field.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest('.ribbon-person')){hover=true;schedule()}});field.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&!e.relatedTarget?.closest('.ribbon-person')){hover=false;schedule()}});
field.addEventListener('focusin',e=>{focus=e.target.matches(':focus-visible');if(!reduced.matches&&e.target.matches(':focus-visible')&&groups[0].contains(e.target)){const index=[...groups[0].children].indexOf(e.target);offset=wrap(index*step-field.clientWidth/2+portraitWidth/2);draw()}schedule()});field.addEventListener('focusout',e=>{focus=field.contains(e.relatedTarget)&&e.relatedTarget.matches(':focus-visible');if(!focus&&width)offset=wrap(offset);schedule()});
function moveBy(delta){if(!width)return;if(reduced.matches){field.scrollLeft+=delta;return}offset=wrap(offset+delta);draw()}
function pauseManual(){manual=true;clearTimeout(resumeTimer);last=0;resumeTimer=setTimeout(()=>{manual=false;schedule()},3000)}
field.addEventListener('wheel',e=>{if(e.ctrlKey||reduced.matches)return;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!delta)return;e.preventDefault();pauseManual();moveBy(delta*(e.deltaMode===1?16:e.deltaMode===2?field.clientWidth:1))},{passive:false});
field.addEventListener('pointerdown',e=>{if(e.button!==0||reduced.matches)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};last=0});
field.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=drag.x-e.clientX,dy=drag.y-e.clientY;if(!drag.moved&&Math.abs(dx)<7)return;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)){drag=null;schedule();return}if(!drag.moved){drag.moved=true;field.setPointerCapture(e.pointerId);field.classList.add('is-dragging')}pauseManual();moveBy(dx);drag.x=e.clientX;drag.y=e.clientY;suppressClickUntil=performance.now()+500});
function endDrag(e){if(!drag||drag.id!==e.pointerId)return;if(drag.moved)suppressClickUntil=performance.now()+500;drag=null;field.classList.remove('is-dragging');if(field.hasPointerCapture(e.pointerId))field.releasePointerCapture(e.pointerId);hover=false;schedule()}
field.addEventListener('pointerup',endDrag);field.addEventListener('pointercancel',endDrag);
dialog.addEventListener('close',schedule);document.addEventListener('visibilitychange',schedule);
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()});observer.observe(field);
new ResizeObserver(measure).observe(field);reduced.addEventListener('change',()=>{measure();schedule()});measure();schedule();
}catch(e){console.error(e);field.textContent='Team profiles could not load. Please refresh.'}
})();
