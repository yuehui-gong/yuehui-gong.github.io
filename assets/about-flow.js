/* Continuous portrait ribbon. Biography text stays outside the moving track. */
(async()=>{
const field=document.getElementById('people-field');if(!field)return;
const read=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return r.json()};
try{
const config=await read('content/about/index.json');const studio=document.getElementById('studio-photo');studio.src=config.studio.image;studio.alt=config.studio.alt;
const profiles=await Promise.all(config.members.map(async id=>({id,...await read('content/about/team/'+id+'/profile.json')})));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
field.className='people-field team-ribbon';field.removeAttribute('aria-live');field.setAttribute('aria-label','Team portraits. Select a portrait to read the biography.');
const track=document.createElement('div');track.className='portrait-track';
const dialog=document.createElement('dialog');dialog.className='team-reader';const close=document.createElement('button');close.type='button';close.textContent='Close';const body=document.createElement('div');dialog.append(close,body);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
function open(p){body.replaceChildren();const h=document.createElement('h3');h.id='team-reader-name';h.textContent=p.name;const bio=document.createElement('div');bio.className='team-bio';for(const value of p.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=value;bio.append(paragraph)}body.append(h,bio);dialog.setAttribute('aria-labelledby',h.id);dialog.showModal()}
const groups=[];for(let copy=0;copy<3;copy++){const group=document.createElement('div');group.className='portrait-group';if(copy!==1)group.setAttribute('aria-hidden','true');profiles.forEach(p=>{const button=document.createElement('button');button.type='button';button.className='ribbon-person';button.setAttribute('aria-label','Read biography of '+p.name);if(copy!==1)button.tabIndex=-1;const face=document.createElement('span');face.className='ribbon-face';const img=new Image();img.src='content/about/team/'+p.id+'/'+p.portraitA;img.alt=p.portraitAlt||p.name;img.decoding='async';const name=document.createElement('span');name.className='ribbon-name';name.textContent=p.name;const caption=document.createElement('span');caption.className='ribbon-caption';caption.textContent=p.role||'Read biography';face.append(img,name,caption);button.append(face);button.onclick=()=>open(p);group.append(button)});groups.push(group);track.append(group)}field.replaceChildren(track);
let offset=0,width=0,last=0,raf=0,visible=false,hover=false,focus=false;
function stopped(){return reduced.matches||!visible||document.hidden||hover||focus||dialog.open}
function draw(){track.style.transform=reduced.matches?'none':`translate3d(${-width-offset}px,0,0)`}
function measure(){width=groups[1].getBoundingClientRect().width;offset=width?offset%width:0;draw()}
function schedule(){if(stopped()){last=0;return}if(!raf)raf=requestAnimationFrame(frame)}
function frame(now){raf=0;if(stopped()){last=0;return}offset=(offset+Math.min(last?(now-last)/1000:0,.05)*28)%width;last=now;draw();schedule()}
field.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest('.ribbon-person')){hover=true;schedule()}});field.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&!e.relatedTarget?.closest('.ribbon-person')){hover=false;schedule()}});
field.addEventListener('focusin',e=>{focus=true;if(!reduced.matches&&e.target.matches(':focus-visible')&&groups[1].contains(e.target)){const index=[...groups[1].children].indexOf(e.target);offset=index*(width/profiles.length)-field.clientWidth/2+(width/profiles.length)/2;draw()}schedule()});field.addEventListener('focusout',e=>{focus=field.contains(e.relatedTarget);if(!focus&&width)offset=(offset%width+width)%width;schedule()});
dialog.addEventListener('close',schedule);document.addEventListener('visibilitychange',schedule);
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()});observer.observe(field);
new ResizeObserver(measure).observe(field);reduced.addEventListener('change',()=>{measure();schedule()});measure();schedule();
}catch(e){console.error(e);field.textContent='Team profiles could not load. Please refresh.'}
})();
