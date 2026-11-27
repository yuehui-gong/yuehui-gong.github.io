(()=>{
 const list=document.getElementById('awards-list');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let field,rows=[],frame=0;
 // All tiles use one continuous world-space bedding function, independent of year boundaries.
 const bed=(x,y)=>y+65*Math.sin(x*.009+y*.0011)+26*Math.sin(x*.018-y*.0015)+8*Math.sin(x*.049+y*.012)+3*Math.sin(x*.13+y*.04);
 function paint(){
  if(!field)return;field.replaceChildren();const w=list.clientWidth,h=list.clientHeight;
  const ink=document.documentElement.classList.contains('day')?'32,37,34':'227,230,224';
  for(let top=0;top<h;top+=800){
   const height=Math.min(800,h-top),canvas=document.createElement('canvas'),dpr=Math.min(devicePixelRatio,1.5);canvas.className='stratum-drawing';canvas.style.top=top+'px';canvas.style.height=height+'px';canvas.width=w*dpr;canvas.height=height*dpr;field.append(canvas);const c=canvas.getContext('2d');c.scale(dpr,dpr);c.translate(0,-top);
   for(let y=Math.floor((top-140)/160)*160;y<top+height+150;y+=160){
    // Alternating thick dark beds, fine lamination and granular porous layers.
    c.beginPath();for(let x=0;x<=w+5;x+=5){const yy=bed(x,y);x?c.lineTo(x,yy):c.moveTo(x,yy)}for(let x=w+5;x>=0;x-=5)c.lineTo(x,bed(x,y+30));c.closePath();c.fillStyle=`rgba(${ink},.74)`;c.fill();
    for(let j=40;j<118;j+=3){c.beginPath();for(let x=0;x<=w+5;x+=5){const yy=bed(x,y+j);x?c.lineTo(x,yy):c.moveTo(x,yy)}c.strokeStyle=`rgba(${ink},${j%4===0?.64:.36})`;c.lineWidth=j%4===0?1:.6;c.stroke()}
    let seed=(y+10000)*971;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    for(let i=0;i<w*8;i++){const x=rand()*w,yy=bed(x,y+119+rand()*39);c.fillStyle=`rgba(${ink},${.22+rand()*.48})`;c.fillRect(x,yy,rand()*.9+.35,rand()*.9+.35)}
   }
  }
 }
 function reveal(){frame=0;const vh=innerHeight;rows.forEach(row=>{const y=row.getBoundingClientRect().top;const t=reduced.matches?1:Math.max(0,Math.min(1,(vh*.96-y)/(vh*.36)));row.style.opacity=t;row.style.transform=`translate(${(1-t)*-35}px,${(1-t)*18}px)`;row.style.clipPath=`inset(0 ${(1-t)*18}% ${(1-t)*25}% 0)`})}
 function schedule(){if(!frame)frame=requestAnimationFrame(reveal)}
 function setup(){if(field||!list.querySelector('.award-row'))return;rows=[...list.querySelectorAll('.award-row')];field=document.createElement('div');field.className='geology-field';field.setAttribute('aria-hidden','true');list.prepend(field);new ResizeObserver(()=>{paint();schedule()}).observe(list);paint();schedule()}
 new MutationObserver(setup).observe(list,{childList:true});setup();window.addEventListener('site-theme',paint);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 // Keyboard focus always exposes the focused award regardless of scroll position.
 list.addEventListener('focusin',e=>{const row=e.target.closest('.award-row');if(row){row.style.opacity=1;row.style.transform='none';row.style.clipPath='none'}});
})();