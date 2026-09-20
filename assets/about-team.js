(async()=>{
 const field=document.getElementById('people-field');
 const read=async p=>{const r=await fetch(p);if(!r.ok)throw Error('Unable to load '+p);return r.json()};
 const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el};
 let active=null,timer;
 function close(returnFocus=false){clearTimeout(timer);if(!active)return;const card=active;active=null;card.classList.remove('is-open');card.querySelector('.b-panel').hidden=true;card.querySelector('button').setAttribute('aria-expanded','false');if(returnFocus)card.querySelector('button').focus()}
 function open(card){clearTimeout(timer);if(active!==card)close();active=card;card.classList.add('is-open');card.querySelector('.b-panel').hidden=false;card.querySelector('button').setAttribute('aria-expanded','true')}
 try{
 const config=await read('content/about/index.json');
 const studio=document.getElementById('studio-photo');studio.src=config.studio.image;studio.alt=config.studio.alt;
 document.getElementById('studio-caption').textContent=config.studio.caption;document.getElementById('studio-credit').textContent=config.studio.credit;
 const profiles=await Promise.all(config.members.map(async id=>({id,p:await read('content/about/team/'+id+'/profile.json')})));field.replaceChildren();
 profiles.forEach(({id,p},i)=>{
 const base='content/about/team/'+id+'/';const card=document.createElement('article');card.className='team-card';
 const button=document.createElement('button');button.className='portrait-trigger';button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','b-'+id);button.setAttribute('aria-label','Discover the B-side of '+p.name);
 const portrait=new Image();portrait.src=base+p.portraitA;portrait.alt=p.portraitAlt||p.name;portrait.width=600;portrait.height=600;portrait.loading='lazy';button.append(portrait,text('span','B-SIDE ↗','portrait-tag'));
 const bio=document.createElement('div');bio.className='team-bio';(Array.isArray(p.bio)?p.bio:[p.bio]).forEach(paragraph=>bio.append(text('p',paragraph)));
 const idx=document.createElement('div');idx.className='team-index';idx.append(text('span',String(i+1).padStart(2,'0')+' / A-SIDE'),text('span','FIELD NOTES'));
 const panel=document.createElement('section');panel.className='b-panel';panel.id='b-'+id;panel.hidden=true;panel.setAttribute('aria-label',p.name+' — B-side');
 const top=document.createElement('div');top.className='b-top';const dismiss=text('button','×','b-close');dismiss.type='button';dismiss.setAttribute('aria-label','Close B-side');top.append(text('span',String(i+1).padStart(2,'0')+' / '+p.bLabel.toUpperCase()),dismiss);
 const bImage=new Image();bImage.src=base+p.portraitB;bImage.alt=p.bAlt;bImage.width=700;bImage.height=600;bImage.loading='lazy';
 const bottom=document.createElement('div');bottom.className='b-bottom';bottom.append(text('span',p.name),text('span','B / PERSONAL'));
 panel.append(top,bImage,text('h4',p.bTitle),text('p',p.bCaption),bottom);
 card.append(button,idx,text('h3',p.name),text('p',p.role,'team-role'),bio,panel);field.append(card);
 button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&innerWidth>700)open(card)});
 card.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')timer=setTimeout(()=>{if(active===card)close()},180)});
 panel.addEventListener('pointerenter',()=>clearTimeout(timer));
 button.addEventListener('click',e=>{if(e.detail===0||e.pointerType==='touch'){active===card?close():open(card)}else open(card)});
 dismiss.addEventListener('click',()=>close(true));
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true)});
 document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))close()});
 document.addEventListener('focusin',e=>{if(active&&!active.contains(e.target))close()});
 }catch(error){console.error(error);field.replaceChildren(text('p','Team profiles are temporarily unavailable. Please try again shortly.'))}
})();
