(()=>{
 const list=document.getElementById('awards-list');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target)}}),{threshold:.06});
 let groups=[];
 function draw(section,index){
  const canvas=section.querySelector('canvas'),w=section.clientWidth,h=section.clientHeight,dpr=Math.min(devicePixelRatio,2);
  canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);
  const day=document.documentElement.classList.contains('day');const ink=day?'32,37,34':'224,228,222';
  let seed=7831+index*971;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  // Broad folds plus fine irregularity make continuous geological bedding.
  const fold=(x)=>{const t=x/w;return 36*Math.sin(t*6.2+index*.9)+20*Math.sin(t*13.5+1.2)+8*Math.sin(t*29+index)+3*Math.sin(t*76)};
  const bed=(x,j)=>42+j*2.3+fold(x)*(0.5+j/90)+2*Math.sin(x*.032+j*.52);
  for(let j=0;j<36;j++){
   c.beginPath();for(let x=-4;x<=w+4;x+=4){const y=bed(x,j);x===-4?c.moveTo(x,y):c.lineTo(x,y)}
   c.strokeStyle=`rgba(${ink},${j%9===0?.52:.16+random()*.14})`;c.lineWidth=j%11===0?1.3:.55;c.stroke();
  }
  // Sediment grains follow the folds; sparse traces run down the exposed sides.
  for(let i=0;i<w*10;i++){
   const x=random()*w,y=random()*150;const yy=y+fold(x)*.7;
   if(yy<0)continue;c.fillStyle=`rgba(${ink},${.12+random()*.34})`;c.beginPath();c.arc(x,yy,random()*.65+.25,0,Math.PI*2);c.fill();
  }
  for(let i=0;i<w*h/110;i++){
   const x=random()*w,y=145+random()*(h-145);
   // Keep the reading field quiet, concentrating the geological texture at edges.
   const edge=x<w*.055||x>w*.94;
   if(!edge&&random()>.035)continue;
   c.fillStyle=`rgba(${ink},${edge?.19:.07})`;c.fillRect(x,y,.8,.8);
  }
  // Exposed bedding continues down both margins, leaving an untextured reading pocket.
  c.save();c.beginPath();c.rect(0,150,w*.065,h);c.rect(w*.95,150,w*.05,h);c.clip();
  for(let j=0;j<(h-150)/6;j++){
   c.beginPath();for(let x=0;x<=w;x+=5){const y=175+j*6+fold(x)*(1+Math.sin(j*.05)*.35)+3*Math.sin(j*.31+x*.02);x?c.lineTo(x,y):c.moveTo(x,y)}
   c.strokeStyle=`rgba(${ink},${j%13===0?.28:.11})`;c.lineWidth=.6;c.stroke();
  }c.restore();
  // Fine vertical survey marks echo the globe's measured, dotted graphic language.
  c.strokeStyle=`rgba(${ink},.24)`;c.lineWidth=.6;
  const ruler=w*.035;c.beginPath();c.moveTo(ruler,155);c.lineTo(ruler,h-20);c.stroke();
  for(let y=160;y<h-20;y+=20){c.beginPath();c.moveTo(ruler,y);c.lineTo(ruler+(y%100===60?9:4),y);c.stroke()}
 }
 function setup(){
  const fresh=[...list.querySelectorAll('.award-year-group')];if(!fresh.length)return;
  groups=fresh;groups.forEach((section,i)=>{if(section.querySelector('canvas'))return;const canvas=document.createElement('canvas');canvas.className='stratum-drawing';canvas.setAttribute('aria-hidden','true');section.prepend(canvas);if(i&&!reduced){section.classList.add('waiting');observer.observe(section)}new ResizeObserver(()=>draw(section,i)).observe(section);draw(section,i)});
 }
 new MutationObserver(setup).observe(list,{childList:true});setup();
 window.addEventListener('site-theme',()=>groups.forEach(draw));
})();