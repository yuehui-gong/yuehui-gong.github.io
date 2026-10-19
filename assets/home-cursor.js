(()=>{
  if(document.querySelector('.home-cursor'))return;
  const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const cursor=document.createElement('div');
  cursor.className='home-cursor';cursor.setAttribute('aria-hidden','true');
  document.body.append(cursor);
  const hide=()=>{cursor.classList.remove('is-visible');document.documentElement.classList.remove('home-cursor-active');};
  document.addEventListener('pointermove',event=>{
    if(!fine.matches||event.pointerType!=='mouse'){hide();return;}
    // Keep the point visible inside native modal dialogs too.
    const parent=event.target.closest('dialog[open]')||document.body;
    if(cursor.parentElement!==parent)parent.append(cursor);
    cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;
    cursor.classList.add('is-visible');document.documentElement.classList.add('home-cursor-active');
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',hide);
  document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')hide();},{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Tab')hide();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
  window.addEventListener('blur',hide);window.addEventListener('pagehide',hide);fine.addEventListener('change',hide);
})();
