/* Staggered team profiles with compact biography previews. */
(async()=>{
const field=document.getElementById('people-field');if(!field)return;
const read=async url=>{const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw Error(response.status);return response.json()};
try{
const config=await read('content/about/index.json');
const profiles=await Promise.all(config.members.map(async id=>({id,...await read('content/about/team/'+id+'/profile.json')})));
field.className='people-field team-editorial';field.removeAttribute('aria-live');field.setAttribute('aria-label','The team');
field.replaceChildren();
const dialog=document.createElement('dialog');dialog.className='team-reader';
const close=document.createElement('button');close.type='button';close.textContent='Close';
const reader=document.createElement('div');dialog.append(close,reader);document.body.append(dialog);
close.addEventListener('click',()=>dialog.close());
function showBiography(profile){reader.replaceChildren();const title=document.createElement('h3');title.id='team-reader-title';title.textContent=profile.name;const full=document.createElement('div');full.className='team-bio';for(const text of profile.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=text;full.append(paragraph);}reader.append(title,full);dialog.setAttribute('aria-labelledby',title.id);dialog.showModal();}

for(const p of profiles){
const article=document.createElement('article');article.className='editorial-person';
const img=new Image();img.src='content/about/team/'+p.id+'/'+p.portraitA;img.alt=p.portraitAlt||p.name;img.decoding='async';img.loading='lazy';
const name=document.createElement('h3');name.textContent=p.name;
article.append(img,name);
if(p.role){const role=document.createElement('p');role.className='editorial-role';role.textContent=p.role;article.append(role);}
const bio=document.createElement('div');bio.className='editorial-bio';
const paragraph=document.createElement('p');paragraph.textContent=(p.bio||[])[0]||'';bio.append(paragraph);
const more=document.createElement('button');more.type='button';more.className='editorial-read';more.textContent='Read biography';more.setAttribute('aria-label','Read biography of '+p.name);more.addEventListener('click',()=>showBiography(p));article.append(bio,more);field.append(article);
}
}catch(error){console.error(error);field.textContent='Team profiles could not load. Please refresh.'}
})();
