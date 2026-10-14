window.buildMobileLanding=function(projects,words){
  const stage=document.getElementById('stage');const selected=[];let offset=0,lastTouch=0,previousFocus;
  let moving=[];const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const matches=()=>projects.filter(p=>selected.every(k=>p.kw.includes(k)));
  const root=document.createElement('section');root.id='mobile-explore';root.setAttribute('aria-label','Explore by keyword');
  root.innerHTML='<p class="mobile-hint">Tap a word to explore our projects</p><div class="mobile-selected"></div><div class="mobile-word-field"></div>';
  stage.append(root);
  const toolbar=document.createElement('div');toolbar.className='mobile-toolbar';toolbar.innerHTML='<button type="button" class="mobile-all">All keywords</button><button type="button" class="mobile-results-button">View projects</button>';stage.append(toolbar);
  const sheet=document.createElement('div');sheet.className='mobile-sheet';sheet.hidden=true;sheet.innerHTML='<section class="mobile-sheet-content" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title"><div class="mobile-sheet-head"><h2 id="mobile-sheet-title"></h2><button type="button" class="mobile-close" aria-label="Close">×</button></div><div class="mobile-sheet-body"></div></section>';document.body.append(sheet);
  const field=root.querySelector('.mobile-word-field'),chips=root.querySelector('.mobile-selected'),hint=root.querySelector('.mobile-hint'),resultButton=toolbar.querySelector('.mobile-results-button');
  const lines=document.createElementNS('http://www.w3.org/2000/svg','svg');lines.classList.add('mobile-connections');lines.setAttribute('aria-hidden','true');field.append(lines);
  const photo=document.createElement('img');photo.className='mobile-photo';photo.alt='';field.append(photo);
  function close(){sheet.hidden=true;previousFocus?.focus();}
  function open(title){previousFocus=document.activeElement;sheet.querySelector('h2').textContent=title;sheet.hidden=false;sheet.querySelector('.mobile-close').focus();}
  function toggle(word){lastTouch=Date.now();const i=selected.indexOf(word);if(i>=0)selected.splice(i,1);else if(selected.length<3)selected.push(word);close();offset=0;render();}
  function render(){
    const matched=matches();const related=selected.length?[...new Set(matched.flatMap(p=>p.kw))].filter(w=>!selected.includes(w)):words;
    const count=window.innerHeight<680?8:10;
    let visible=related.slice(offset,offset+count);
    if(!selected.length && visible.length<count)visible.push(...related.slice(0,count-visible.length));
    if(selected.length){
      const unrelated=words.filter(w=>!selected.includes(w)&&!related.includes(w));
      visible=[selected[0],...related.slice(0,6),...unrelated.slice(0,2)];
    }
    const old=new Map(moving.map(n=>[n.word,n]));const width=field.clientWidth,height=field.clientHeight;
    const focusSlots=[[.24,.08],[.76,.13],[.22,.30],[.78,.32],[.23,.73],[.77,.70],[.27,.92],[.73,.94]];
    moving=visible.map((word,i)=>{
      let n=old.get(word);if(!n){const b=document.createElement('button');b.type='button';b.className='mobile-word';b.textContent=word;b.onclick=()=>toggle(word);field.append(b);n={word,button:b,x:width/2,y:height/2,phase:i*1.7};}
      const anchor=selected.length&&i===0,active=anchor||!selected.length||related.includes(word);
      n.button.classList.toggle('is-anchor',Boolean(anchor));n.button.classList.toggle('is-dim',!active);n.button.disabled=!active;n.button.setAttribute('aria-pressed',String(selected.includes(word)));
      const slot=selected.length?(anchor?[.5,.5]:focusSlots[i-1]):[(i%2===0?.23:.77)+(i%3-1)*.018,(Math.floor(i/2)+.5)/Math.ceil(count/2)+(i%2?.02:-.02)];
      n.tx=slot[0]*width;n.ty=slot[1]*height;n.anchor=anchor;n.active=active;old.delete(word);return n;
    });
    old.forEach(n=>n.button.remove());
    lines.innerHTML=selected.length?moving.filter(n=>n.active&&!n.anchor).map(()=>'<line/>').join(''):'';
    photo.hidden=!selected.length||!matched.length;if(!photo.hidden)photo.src=matched[0].img;
    chips.innerHTML=selected.map(w=>`<button type="button" aria-label="Remove ${escape(w)}">${escape(w)} ×</button>`).join('');[...chips.children].forEach((b,i)=>b.onclick=()=>toggle(selected[i]));
    hint.textContent=selected.length?'Connected ideas move closer. Tap to refine.':'Follow a word. Discover a connection.';
    resultButton.textContent=`View ${matched.length} project${matched.length===1?'':'s'}`;
  }
  toolbar.querySelector('.mobile-all').onclick=()=>{
    open('All keywords');const body=sheet.querySelector('.mobile-sheet-body');body.innerHTML='<input class="mobile-search" type="search" placeholder="Search keywords" aria-label="Search keywords"><div class="mobile-keyword-list"></div>';
    const input=body.querySelector('input'),list=body.querySelector('.mobile-keyword-list');
    function fill(){const filtered=[...words].sort((a,b)=>a.localeCompare(b)).filter(w=>w.toLowerCase().includes(input.value.toLowerCase()));list.innerHTML=filtered.map(w=>`<button type="button">${escape(w)}</button>`).join('');[...list.children].forEach((b,i)=>b.onclick=()=>toggle(filtered[i]));}
    input.oninput=fill;fill();
  };
  resultButton.onclick=()=>{const found=matches();open(`${found.length} projects`);sheet.querySelector('.mobile-sheet-body').innerHTML=`<div class="mobile-projects">${found.map(p=>`<a href="https://yuehui-gong.github.io/project.html?slug=${encodeURIComponent(p.slug)}"><img src="${escape(p.img)}" alt="${escape(p.heroAlt||p.title)}" loading="lazy"><h3>${escape(p.title)}</h3><p>${escape([p.loc,p.year].filter(Boolean).join(' · '))}</p></a>`).join('')}</div>`;};
  sheet.querySelector('.mobile-close').onclick=close;sheet.onclick=e=>{if(e.target===sheet)close();};
  sheet.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...sheet.querySelectorAll('button,input,a')].filter(e=>!e.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}}});
  root.addEventListener('pointerdown',()=>lastTouch=Date.now());
  setInterval(()=>{if(selected.length||!sheet.hidden||document.hidden||Date.now()-lastTouch<15000||root.contains(document.activeElement))return;offset=(offset+10)%words.length;render();},12000);
  function animate(now){
    const width=field.clientWidth,height=field.clientHeight;
    moving.forEach(n=>{
      n.width=n.button.offsetWidth;n.height=n.button.offsetHeight;
      const drift=reduced||selected.length?0:5;
      const tx=n.tx+Math.sin(now/5100+n.phase)*drift,ty=n.ty+Math.cos(now/6200+n.phase)*drift;
      n.x+= (tx-n.x)*(reduced?1:.07);n.y+=(ty-n.y)*(reduced?1:.07);
    });
    // Keep the actual word hit areas separate while they are pulled into position.
    for(let pass=0;pass<3;pass++)for(let i=0;i<moving.length;i++)for(let j=i+1;j<moving.length;j++){
      const a=moving[i],b=moving[j],dx=b.x-a.x,dy=b.y-a.y;
      const ox=(a.width+b.width)/2+10-Math.abs(dx),oy=(a.height+b.height)/2+12-Math.abs(dy);
      if(ox>0&&oy>0){const shift=Math.min(oy/2,10),sign=dy>=0?1:-1;if(!a.anchor)a.y-=sign*shift;if(!b.anchor)b.y+=sign*shift;}
    }
    moving.forEach(n=>{n.x=Math.max(n.width/2+2,Math.min(width-n.width/2-2,n.x));n.y=Math.max(n.height/2+2,Math.min(height-n.height/2-2,n.y));n.button.style.transform=`translate(${n.x-n.width/2}px,${n.y-n.height/2}px)`;});
    const anchor=moving.find(n=>n.anchor);if(anchor){let i=0;moving.filter(n=>n.active&&!n.anchor).forEach(n=>{const l=lines.children[i++];if(l){l.setAttribute('x1',anchor.x);l.setAttribute('y1',anchor.y);l.setAttribute('x2',n.x);l.setAttribute('y2',n.y);}});}
    requestAnimationFrame(animate);
  }
  window.addEventListener('resize',render);render();requestAnimationFrame(animate);
};
