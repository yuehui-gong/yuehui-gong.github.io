(() => {
  const map = document.querySelector('.contact-map');
  if (!map) return;
  const viewport = map.querySelector('.contact-map-viewport');
  const drawing = map.querySelector('.contact-map-drawing');
  const land = map.querySelector('.contact-map-land');
  const dots = map.querySelector('#contact-map-land-dots');
  const labels = map.querySelector('.contact-map-labels');
  const pins = map.querySelector('.contact-map-pins');
  const home = {x:360,y:315,zoom:1};
  const view = {...home};
  const minZoom = .75, maxZoom = 28;
  const clamp = (value,min,max) => Math.max(min,Math.min(value,max));
  const svg = (name,attributes) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg',name);
    for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,value);
    return element;
  };
  // Same Pacific-centered Mercator projection as contact-map.svg.
  const project = (lon,lat) => ({
    x:((lon+360)%360)*2,
    y:360-(360/Math.PI)*Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))
  });
  const places = [
    ['Suzhou','China',120.58,31.3,-1,-1],
    ['Shanghai','China',121.47,31.23,1,1],
    ['Philadelphia','USA',-75.1558333,39.9494444,-1,1],
    ['New York','USA',-74.00639,40.71417,1,-1]
  ].map(([name,country,lon,lat,side,lane]) => {
    const position = project(lon,lat);
    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'contact-map-city';
    label.textContent = name;
    label.setAttribute('aria-label',`Zoom to ${name}, ${country}`);
    label.addEventListener('click',() => {
      Object.assign(view,position,{zoom:Math.max(view.zoom,12)});
      requestDraw();
    });
    labels.append(label);
    const marker = svg('g',{class:'contact-map-pin'});
    const leader = svg('line',{stroke:'#83a94d','stroke-width':.75,opacity:.85});
    marker.append(leader);
    const rings = svg('g',{});
    rings.append(
      svg('circle',{r:9,fill:'none',stroke:'#b9ec68',opacity:.3}),
      svg('circle',{r:5,fill:'#0a1009',stroke:'#b9ec68'}),
      svg('circle',{r:2,fill:'#c0ed65'})
    );
    marker.append(rings);
    pins.append(marker);
    return {...position,label,marker,leader,rings,side,lane};
  });

  let frame = 0;
  const scale = () => viewport.clientWidth/540*view.zoom;
  function requestDraw(){
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function draw(){
    frame = 0;
    const w = viewport.clientWidth, h = viewport.clientHeight, k = scale();
    if (!w || !h || !k) return;
    const bound = (value,span) => span >= 720 ? 360 : clamp(value,span/2,720-span/2);
    view.x = bound(view.x,w/k);
    view.y = bound(view.y,h/k);
    drawing.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const tx = w/2-view.x*k, ty = h/2-view.y*k;
    land.setAttribute('transform',`translate(${tx} ${ty}) scale(${k})`);
    dots.setAttribute('patternTransform',`scale(${1/k})`);
    for (const city of places) {
      const x = tx+city.x*k, y = ty+city.y*k;
      const visible = x >= 2 && x <= w-2 && y >= 2 && y <= h-2;
      city.label.hidden = !visible;
      city.marker.style.display = visible ? '' : 'none';
      if (!visible) continue;
      const lw = city.label.offsetWidth, lh = city.label.offsetHeight;
      const left = clamp(x+(city.side<0 ? -lw-12 : 12),8,w-lw-8);
      const top = clamp(y+(city.lane<0 ? -lh-15 : 15),42,h-lh-8);
      city.label.style.transform = `translate(${left}px,${top}px)`;
      city.rings.setAttribute('transform',`translate(${x} ${y})`);
      for (const [key,value] of Object.entries({x1:x,y1:y,x2:clamp(x,left,left+lw),y2:clamp(y,top,top+lh)})) {
        city.leader.setAttribute(key,value);
      }
    }
  }
  function zoomAt(factor,from,to=from){
    const w = viewport.clientWidth, h = viewport.clientHeight, oldScale = scale();
    if (!oldScale) return;
    view.zoom = clamp(view.zoom*factor,minZoom,maxZoom);
    const nextScale = scale();
    view.x += (from.x-w/2)/oldScale-(to.x-w/2)/nextScale;
    view.y += (from.y-h/2)/oldScale-(to.y-h/2)/nextScale;
    requestDraw();
  }
  const center = () => ({x:viewport.clientWidth/2,y:viewport.clientHeight/2});
  viewport.addEventListener('keydown',event => {
    if (event.target !== viewport) return;
    const key = event.key;
    const step = 42/scale();
    if (key === '+' || key === '=') zoomAt(1.65,center());
    else if (key === '-') zoomAt(1/1.65,center());
    else if (key === '0' || key === 'Home') Object.assign(view,home);
    else if (key === 'ArrowLeft') view.x -= step;
    else if (key === 'ArrowRight') view.x += step;
    else if (key === 'ArrowUp') view.y -= step;
    else if (key === 'ArrowDown') view.y += step;
    else return;
    event.preventDefault();
    requestDraw();
  });

  const localPoint = event => {
    const rect = viewport.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  };
  map.addEventListener('wheel',event => {
    if (!event.deltaY) return;
    event.preventDefault();
    const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1;
    zoomAt(Math.exp(-event.deltaY*units*.002),localPoint(event));
  },{passive:false});

  const pointers = new Map();
  const gesture = () => {
    const [a,b] = pointers.values();
    return b ? {x:(a.x+b.x)/2,y:(a.y+b.y)/2,gap:Math.hypot(a.x-b.x,a.y-b.y)} : {...a,gap:0};
  };
  viewport.addEventListener('pointerdown',event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    viewport.focus({preventScroll:true});
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId,localPoint(event));
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove',event => {
    if (!pointers.has(event.pointerId)) return;
    const from = gesture();
    pointers.set(event.pointerId,localPoint(event));
    const to = gesture();
    zoomAt(from.gap>0 && to.gap>0 ? to.gap/from.gap : 1,from,to);
  });
  const endPointer = event => {
    pointers.delete(event.pointerId);
    if (!pointers.size) viewport.classList.remove('is-dragging');
  };
  for (const type of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(type,endPointer);
  new ResizeObserver(requestDraw).observe(viewport);
  document.fonts?.ready.then(requestDraw);
  requestDraw();
})();
