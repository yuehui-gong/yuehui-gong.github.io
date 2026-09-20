// Original Jupi artwork with a deterministic four-beat walking rig.
// One cycle advances 24 / .65 source pixels; stance paws remain fixed in world space.
const JUPI_STRIDE=24/.65;
function jupiFoot(phase,rootX){
  phase=((phase%1)+1)%1;
  if(phase<.65)return {x:rootX+12-24*phase/.65,y:115,planted:true};
  const t=(phase-.65)/.35;
  return {x:rootX-12+24*(t*t*(3-2*t)),y:115-9*Math.sin(Math.PI*t),planted:false};
}
function drawJupiGait(c,art,distance,scale,pause){
  const phase=distance/(JUPI_STRIDE*scale);
  function limb(rx,ry,offset,front,far){
    const foot=jupiFoot(phase+offset,rx),dx=foot.x-rx,dy=foot.y-ry;
    const len=Math.hypot(dx,dy),bend=Math.sqrt(Math.max(0,18*18-len*len/4));
    const sign=front?1:-1;
    const knee={x:(rx+foot.x)/2-sign*dy/len*bend,y:(ry+foot.y)/2+sign*dx/len*bend};
    c.lineCap='round';c.lineJoin='round';
    function segment(ax,ay,bx,by,width,base,light){
      c.strokeStyle=base;c.lineWidth=width;c.beginPath();c.moveTo(Math.round(ax),Math.round(ay));c.lineTo(Math.round(bx),Math.round(by));c.stroke();
      c.strokeStyle=light;c.lineWidth=width*.47;c.beginPath();c.moveTo(Math.round(ax-1),Math.round(ay));c.lineTo(Math.round(bx-1),Math.round(by-1));c.stroke();
      // Small square fur marks keep the limbs in the original pixel vocabulary.
      c.fillStyle=base;for(let i=1;i<4;i++){const t=i/4;c.fillRect(Math.round(ax+(bx-ax)*t+2),Math.round(ay+(by-ay)*t),2,2)}
    }
    segment(rx,ry,knee.x,knee.y,front?10:12,far?'#665347':'#99643d',far?'#95806b':'#c08a57');
    segment(knee.x,knee.y,foot.x,foot.y-3,front?8:7,far?'#9d9080':'#d8c7a7',far?'#bcac96':'#f0e3c6');
    // Reuse the old sprite's paw texture rather than drawing a new character.
    c.save();if(far)c.globalAlpha=.9;c.drawImage(art,front?74:35,107,12,9,Math.round(foot.x-5),Math.round(foot.y-7),12,9);c.restore();
  }
  // Four contacts: near hind, near front, far hind, far front, each 1/4 cycle apart.
  limb(52,85,.5,false,true);limb(84,86,.75,true,true);
  limb(47,85,0,false,false);limb(78,86,.25,true,false);
  // Keep the original torso, coat, face and tail completely stable between frames.
  c.save();c.beginPath();c.moveTo(0,0);c.lineTo(128,0);c.lineTo(128,87);c.lineTo(93,87);c.lineTo(88,96);c.lineTo(76,96);c.lineTo(68,91);c.lineTo(57,91);c.lineTo(49,94);c.lineTo(37,91);c.lineTo(29,86);c.lineTo(0,86);c.closePath();c.clip();c.drawImage(art,0,0);c.restore();
}
