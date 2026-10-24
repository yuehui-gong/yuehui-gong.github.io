/* Fixed team grid with compact biographies and an accessible reader. */
(async()=>{
const field=document.getElementById('people-field');if(!field)return;
const read=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return r.json()};
try{
const config=await read('content/about/index.json');
const profiles=await Promise.all(config.members.map(async id=>({id,...await read('content/about/team/'+id+'/profile.json')})));
field.className='people-field team-static';field.removeAttribute('aria-live');field.setAttribute('aria-label','Team profiles');
const track=document.createElement('div');track.className='portrait-track';
const dialog=document.createElement('dialog');dialog.className='team-reader';const close=document.createElement('button');close.type='button';close.textContent='Close';const body=document.createElement('div');dialog.append(close,body);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
function open(p){body.replaceChildren();const h=document.createElement('h3');h.id='team-reader-name';h.textContent=p.name;const bio=document.createElement('div');bio.className='team-bio';for(const value of p.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=value;bio.append(paragraph)}body.append(h,bio);dialog.setAttribute('aria-labelledby',h.id);dialog.showModal()}
let suppressClickUntil=0;
const groups=[];for(let copy=0;copy<1;copy++){const group=document.createElement('div');group.className='portrait-group';profiles.forEach(p=>{const button=document.createElement('button');button.type='button';button.className='ribbon-person';button.setAttribute('aria-label','Read biography of '+p.name);const face=document.createElement('span');face.className='ribbon-face';const img=new Image();img.src='content/about/team/'+p.id+'/'+p.portraitA;img.alt=p.portraitAlt||p.name;img.decoding='async';const name=document.createElement('span');name.className='ribbon-name';name.textContent=p.name;const caption=document.createElement('span');caption.className='ribbon-caption';caption.textContent='Read biography';const excerpt=document.createElement('span');excerpt.className='ribbon-bio';excerpt.textContent=(p.bio||[])[0]||'';img.draggable=false;face.append(img);button.append(face,name,excerpt,caption);button.onclick=()=>{if(performance.now()>suppressClickUntil)open(p)};group.append(button)});groups.push(group);track.append(group)}field.replaceChildren(track);
}catch(e){console.error(e);field.textContent='Team profiles could not load. Please refresh.'}
})();
