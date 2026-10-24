/* Staggered team profiles with full biographies. */
(async()=>{
const field=document.getElementById('people-field');if(!field)return;
const read=async url=>{const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw Error(response.status);return response.json()};
try{
const config=await read('content/about/index.json');
const profiles=await Promise.all(config.members.map(async id=>({id,...await read('content/about/team/'+id+'/profile.json')})));
field.className='people-field team-editorial';field.removeAttribute('aria-live');field.setAttribute('aria-label','The team');
field.replaceChildren();
for(const p of profiles){
const article=document.createElement('article');article.className='editorial-person';
const img=new Image();img.src='content/about/team/'+p.id+'/'+p.portraitA;img.alt=p.portraitAlt||p.name;img.decoding='async';img.loading='lazy';
const name=document.createElement('h3');name.textContent=p.name;
article.append(img,name);
if(p.role){const role=document.createElement('p');role.className='editorial-role';role.textContent=p.role;article.append(role);}
const bio=document.createElement('div');bio.className='editorial-bio';
for(const text of p.bio||[]){const paragraph=document.createElement('p');paragraph.textContent=text;bio.append(paragraph);}
article.append(bio);field.append(article);
}
}catch(error){console.error(error);field.textContent='Team profiles could not load. Please refresh.'}
})();
