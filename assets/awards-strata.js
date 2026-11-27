(()=>{
 const list=document.getElementById('awards-list');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let field,rows=[],frame=0;
 // All tiles use one continuous world-space bedding function, independent of year boundaries.
 const bed=(x,y,w)=>{const t=x/w;return y+36*Math.sin(t*6.2+y*.0006)+20*Math.sin(t*13.5+1.2)+8*Math.sin(t*29+y*.001)+3*Math.sin(t*76)};
 function paint(){
  if(!field)return;field.replaceChildren();const w=list.clientWidth,h=list.clientHeight;
  const ink=document.documentElement.classList.contains('day')?'32,37,34':'224,228,222';
  for(let top=0;top<h;top+=800){
   const height=Math.min(800,h-top),canvas=document.createElement('canvas'),dpr=Math.min(devicePixelRatio,1.5);canvas.className='stratum-drawing';canvas.style.top=top+'px';canvas.style.height=height+'px';canvas.width=w*dpr;canvas.height=height*dpr;field.append(canvas);const c=canvas.getContext('2d');c.scale(dpr,dpr);c.translate(0,-top);
   // The original fine contours continue through the entire section, with no solid bands.
   for(let y=Math.floor((top-100)/3)*3;y<top+height+100;y+=3){
    c.beginPath();for(let x=0;x<=w+4;x+=4){const yy=bed(x,y,w)+2*Math.sin(x*.032+y*.06);x?c.lineTo(x,yy):c.moveTo(x,yy)}
    const density=(1+Math.sin(y*.019))/2;c.strokeStyle=`rgba(${ink},${y%27===0?.42:.06+density*.19})`;c.lineWidth=y%33===0?1:.5;c.stroke();
   }
   // Deterministic grains in world coordinates keep tile joins invisible.
   for(let strip=Math.floor((top-100)/100)*100;strip<top+height+100;strip+=100){
    let seed=(strip+10000)*971;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    for(let i=0;i<w*3;i++){const x=rand()*w,yy=bed(x,strip+rand()*100,w);c.fillStyle=`rgba(${ink},${.1+rand()*.28})`;c.beginPath();c.arc(x,yy,rand()*.6+.2,0,Math.PI*2);c.fill()}
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