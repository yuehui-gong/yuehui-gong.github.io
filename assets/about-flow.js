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
const portrait=document.createElement('button');portrait.type='button';portrait.className='team-cutout';portrait.setAttribute('aria-label','Read biography of '+p.name);portrait.addEventListener('click',()=>showBiography(p));portrait.append(img);article.append(portrait,name);

const bio=document.createElement('div');bio.className='editorial-bio';
bio.id='bio-'+p.id;portrait.setAttribute('aria-describedby',bio.id);for(const text of p.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=text;bio.append(paragraph);}bio.tabIndex=0;bio.setAttribute('role','region');bio.setAttribute('aria-label',p.name+' biography');
article.append(bio);field.append(article);
}
}catch(error){console.error(error);field.textContent='Team profiles could not load. Please refresh.'}
})();
