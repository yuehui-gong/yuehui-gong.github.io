(()=>{
 const list=document.getElementById('awards-list');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let field,rows=[],frame=0;
 const terrain=document.getElementById('main');
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const noise=x=>{const i=Math.floor(x),f=x-i,t=f*f*(3-2*f);return hash(i)*(1-t)+hash(i+1)*t};
 // Unequal, compressed beds and long folds, with smaller fractures along each seam.
 const bed=(x,y,w)=>{const t=x/w;return y+100*Math.sin(t*5.1+y*.0014)+62*(noise(t*5+y*.0007)-.5)+38*Math.sin(t*11-y*.001)+18*(noise(t*19+y*.002)-.5)+5*(noise(x*.08+y*.035)-.5)+2*(noise(x*.31+y*.09)-.5)};
 function paint(){
  if(!field)return;field.replaceChildren();const w=terrain.clientWidth,h=terrain.clientHeight;
  const ink=document.documentElement.classList.contains('day')?'32,37,34':'224,228,222';
  for(let top=0;top<h;top+=800){
   const height=Math.min(800,h-top),canvas=document.createElement('canvas'),dpr=Math.min(devicePixelRatio,1.5);canvas.className='stratum-drawing';canvas.style.top=top+'px';canvas.style.height=height+'px';canvas.width=w*dpr;canvas.height=height*dpr;field.append(canvas);const c=canvas.getContext('2d');c.scale(dpr,dpr);c.translate(0,-top);
   // Dense packets alternate with open bedding; no repeating solid ribbons.
   for(let y=Math.floor((top-220)/2)*2;y<top+height+220;y+=2){
    const packet=noise(y*.019),major=y%38===0;if(packet<.38&&!major)continue;
    c.beginPath();let pen=false;
    for(let x=0;x<=w+3;x+=3){const yy=bed(x,y,w);if(noise(x*.018+y*.12)<.2&&!major){pen=false;continue}if(pen)c.lineTo(x,yy);else c.moveTo(x,yy);pen=true}
    c.strokeStyle=`rgba(${ink},${major?.28:.045+packet*.14})`;c.lineWidth=major?1.05:.55;c.stroke();
   }
   for(let strip=Math.floor((top-220)/100)*100;strip<top+height+220;strip+=100){
    let seed=(strip+10000)*971;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    for(let i=0;i<w*5;i++){const x=rand()*w,depth=strip+rand()*100;if(noise(depth*.019)<.46)continue;const yy=bed(x,depth,w);c.fillStyle=`rgba(${ink},${.055+rand()*.17})`;c.fillRect(x,yy,rand()*.9+.25,rand()*.6+.25)}
   }
  }
 }
 function reveal(){frame=0;const vh=innerHeight;rows.forEach(row=>{const y=row.getBoundingClientRect().top;const t=reduced.matches?1:Math.max(0,Math.min(1,(vh*.96-y)/(vh*.36)));row.style.opacity=t;row.style.transform=`translate(${(1-t)*-35}px,${(1-t)*18}px)`;row.style.clipPath=`inset(0 ${(1-t)*18}% ${(1-t)*25}% 0)`})}
 function schedule(){if(!frame)frame=requestAnimationFrame(reveal)}
 function setup(){if(field||!list.querySelector('.award-row'))return;rows=[...list.querySelectorAll('.award-row')];field=document.createElement('div');field.className='geology-field';field.setAttribute('aria-hidden','true');terrain.prepend(field);new ResizeObserver(()=>{paint();schedule()}).observe(terrain);paint();schedule()}
 new MutationObserver(setup).observe(list,{childList:true});setup();window.addEventListener('site-theme',paint);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 // Keyboard focus always exposes the focused award regardless of scroll position.
 list.addEventListener('focusin',e=>{const row=e.target.closest('.award-row');if(row){row.style.opacity=1;row.style.transform='none';row.style.clipPath='none'}});
})();