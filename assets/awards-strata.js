(()=>{
 const list=document.getElementById('awards-list');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let field,rows=[],frame=0;
 const terrain=document.getElementById('main');
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const noise=x=>{const i=Math.floor(x),f=x-i,t=f*f*(3-2*f);return hash(i)*(1-t)+hash(i+1)*t};
 // Individual beds vary in thickness, pinch out, and share broad geological folds.
 function paint(){
  if(!field)return;field.replaceChildren();const w=terrain.clientWidth,h=terrain.clientHeight;
  const ink=document.documentElement.classList.contains('day')?'32,37,34':'224,228,222';
  const beds=[];let depth=-300,k=0;
  while(depth<h+400){beds.push({y:depth,id:k});depth+=35+hash(k+40)*105;k++}
  const seam=(x,b)=>{const t=x/w,y=b.y,i=b.id;return y+75*Math.sin(t*5+y*.0008)+100*(noise(t*3.2+y*.0004)-.5)+48*Math.tanh((t-(.27+.12*Math.sin(y*.001)))*15)+22*(noise(t*8+i*.17)-.5)+8*(noise(x*.035+i*.3)-.5)+2*(noise(x*.18)-.5)};
  for(let top=0;top<h;top+=800){
   const height=Math.min(800,h-top),canvas=document.createElement('canvas'),dpr=Math.min(devicePixelRatio,1.5);canvas.className='stratum-drawing';canvas.style.top=top+'px';canvas.style.height=height+'px';canvas.width=w*dpr;canvas.height=height*dpr;field.append(canvas);const c=canvas.getContext('2d');c.scale(dpr,dpr);c.translate(0,-top);
   for(let bi=0;bi<beds.length-1;bi++){
    const b=beds[bi],next=beds[bi+1];if(next.y<top-230||b.y>top+height+230)continue;
    const at=(x,f)=>seam(x,b)*(1-f)+seam(x,next)*f;
    // Sparse, broken boundary traces rather than a regular wave grid.
    for(let j=0;j<3;j++){c.beginPath();let pen=false;for(let x=0;x<=w+2;x+=2){if(noise(x*.012+bi*8+j*1.7)<.19){pen=false;continue}const y=seam(x,b)+j*2.1;if(pen)c.lineTo(x,y);else c.moveTo(x,y);pen=true}c.strokeStyle=`rgba(${ink},${j===0?.3:.12})`;c.lineWidth=j===0?1.1:.6;c.stroke()}
    const type=bi%5;
    // Sandstone: mottled stipple, small horizontal grains, quiet porous pockets.
    let seed=bi*977+71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const count=w*(next.y-b.y)*(type===1?.13:.055);
    for(let j=0;j<count;j++){const x=rand()*w,f=rand();const patch=noise(x*.009+bi*11+f*3);if(patch<.33||type===3&&f>.14)continue;const y=at(x,f);const alpha=(.07+rand()*.23)*(type===3?.5:1);c.fillStyle=`rgba(${ink},${alpha})`;c.fillRect(x,y,rand()<.12?1+rand()*3:.45+rand()*.75,.4+rand()*.65)}
    // Shale: local short laminations that merge and disappear inside a bed.
    if(type===0||type===2||type===4){const n=type===2?22:8;for(let j=1;j<n;j++){const f=j/n;c.beginPath();let pen=false;for(let x=0;x<=w;x+=3){if(noise(x*.006+bi*5+j*.21)<.4){pen=false;continue}const y=at(x,f)+1.5*(noise(x*.07+j)-.5);if(pen)c.lineTo(x,y);else c.moveTo(x,y);pen=true}c.strokeStyle=`rgba(${ink},${type===2?.11:.17})`;c.lineWidth=.65;c.stroke()}}
    // Occasional thin mineral lens pinches out rather than spanning the page.
    if(type===1){const left=hash(bi+8)*w*.65,right=Math.min(w,left+w*(.15+hash(bi+3)*.3));c.beginPath();for(let x=left;x<=right;x+=3)c.lineTo(x,at(x,.12));for(let x=right;x>=left;x-=3)c.lineTo(x,at(x,.12)+Math.sin((x-left)/(right-left)*Math.PI)*(3+hash(bi)*5));c.closePath();c.fillStyle=`rgba(${ink},.15)`;c.fill()}
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