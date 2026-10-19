(()=>{const stage=document.getElementById('stage');if(!stage)return;const water=document.createElement('canvas');water.id='universe-background';water.setAttribute('aria-hidden','true');stage.prepend(water);const ctx=water.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,last=0;
function waterNoise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const hash=(a,b)=>{let n=Math.imul(a,374761393)+Math.imul(b,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;}

function drawUniverse(t){
 const w=water.width,h=water.height;
 if(!drawUniverse.texture){
  const tex=document.createElement('canvas');tex.width=640;tex.height=400;const tc=tex.getContext('2d'),im=tc.createImageData(640,400);
  for(let y=0;y<400;y++)for(let x=0;x<640;x++){
   const u=x/640,v=y/400,n=waterNoise(u*5,v*5)*.55+waterNoise(u*13+10,v*13)*.3+waterNoise(u*37,v*37)*.15;
   const belt=Math.exp(-Math.pow((v-(.65-u*.42+waterNoise(u*4,2)*.18))/.22,2));
   const dust=Math.pow(Math.max(0,n-.22),2)*belt;
   const i=(y*640+x)*4;im.data[i]=3+dust*51;im.data[i+1]=4+dust*60;im.data[i+2]=7+dust*84;im.data[i+3]=255;
  }tc.putImageData(im,0,0);drawUniverse.texture=tex;
 }
 ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.fillStyle='#030407';ctx.fillRect(0,0,w,h);ctx.drawImage(drawUniverse.texture,-10+Math.sin(t*.000018)*7,-10,w+20,h+20);
 let seed=2406;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<340;i++){
  const x=rand()*w,y=rand()*h,r=rand(),phase=rand()*6.28;
  const alpha=(.12+r*.55)*(.9+.1*Math.sin(t*.00035+phase));
  ctx.fillStyle='rgba(225,232,245,'+alpha+')';ctx.beginPath();ctx.arc(x,y,r>.97?1.3:.3+r*.5,0,Math.PI*2);ctx.fill();
  if(r>.985){const g=ctx.createRadialGradient(x,y,0,x,y,6);g.addColorStop(0,'rgba(190,210,255,.22)');g.addColorStop(1,'rgba(190,210,255,0)');ctx.fillStyle=g;ctx.fillRect(x-6,y-6,12,12);}
 }
}

function tick(t){if(t-last>40){drawUniverse(t);last=t}raf=requestAnimationFrame(tick)}function sync(){cancelAnimationFrame(raf);water.width=Math.min(1600,stage.clientWidth);water.height=Math.round(water.width*stage.clientHeight/stage.clientWidth);if(document.documentElement.classList.contains('day'))return;drawUniverse(0);if(!reduced.matches&&!document.hidden)raf=requestAnimationFrame(tick)}window.addEventListener('resize',sync);window.addEventListener('site-theme',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);document.fonts.ready.then(()=>window.dispatchEvent(new Event('resize')));sync()})();