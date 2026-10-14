window.buildMobileLanding=function(projects,words){
  const stage=document.getElementById('stage');const selected=[];let offset=0,lastTouch=0,previousFocus;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const matches=()=>projects.filter(p=>selected.every(k=>p.kw.includes(k)));
  const root=document.createElement('section');root.id='mobile-explore';root.setAttribute('aria-label','Explore by keyword');
  root.innerHTML='<p class="mobile-hint">Tap a word to explore our projects</p><div class="mobile-selected"></div><div class="mobile-word-field"></div>';
  stage.append(root);
  const toolbar=document.createElement('div');toolbar.className='mobile-toolbar';toolbar.innerHTML='<button type="button" class="mobile-all">All keywords</button><button type="button" class="mobile-results-button">View projects</button>';stage.append(toolbar);
  const sheet=document.createElement('div');sheet.className='mobile-sheet';sheet.hidden=true;sheet.innerHTML='<section class="mobile-sheet-content" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title"><div class="mobile-sheet-head"><h2 id="mobile-sheet-title"></h2><button type="button" class="mobile-close" aria-label="Close">×</button></div><div class="mobile-sheet-body"></div></section>';document.body.append(sheet);
  const field=root.querySelector('.mobile-word-field'),chips=root.querySelector('.mobile-selected'),hint=root.querySelector('.mobile-hint'),resultButton=toolbar.querySelector('.mobile-results-button');
  function close(){sheet.hidden=true;previousFocus?.focus();}
  function open(title){previousFocus=document.activeElement;sheet.querySelector('h2').textContent=title;sheet.hidden=false;sheet.querySelector('.mobile-close').focus();}
  function toggle(word){lastTouch=Date.now();const i=selected.indexOf(word);if(i>=0)selected.splice(i,1);else if(selected.length<3)selected.push(word);close();offset=0;render();}
  function render(){
    const matched=matches();const related=selected.length?[...new Set(matched.flatMap(p=>p.kw))].filter(w=>!selected.includes(w)):words;
    const count=window.innerHeight<680?8:10;
    const visible=related.slice(offset,offset+count);if(visible.length<count && !selected.length)visible.push(...related.slice(0,count-visible.length));
    field.innerHTML=visible.map((w,i)=>`<button type="button" class="mobile-word" style="--delay:-${i*.8}s">${escape(w)}</button>`).join('');
    [...field.children].forEach((b,i)=>b.onclick=()=>toggle(visible[i]));
    chips.innerHTML=selected.map(w=>`<button type="button" aria-label="Remove ${escape(w)}">${escape(w)} ×</button>`).join('');[...chips.children].forEach((b,i)=>b.onclick=()=>toggle(selected[i]));
    hint.textContent=selected.length?'Tap a related word to refine, or view projects':'Tap a word to explore our projects';
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
  window.addEventListener('resize',render);render();
};
