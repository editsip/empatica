(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manual = null;
  try { manual = localStorage.getItem('empatica-motion'); } catch {}
  const quiet = () => manual === 'reduce' || (manual !== 'full' && reduced.matches);
  const scenes = [];
  const palettes = { interference: ['#df4b27','#e7ad54','#e4d750','#194fca','#afc7ca'], matter:['#273629','#47633a','#93a463','#d6c550','#db673a'] };
  function project(x,y,z,angle,w,h,scale,centerY=.44) {
    const c=Math.cos(angle),s=Math.sin(angle),xx=x*c+z*s,zz=-x*s+z*c;
    const perspective=1/(1+zz*.12);
    return [w*.5+xx*scale*perspective,h*centerY+(y-zz*.23)*scale*perspective,zz];
  }
  // Two banks of stems rise towards a shared opening. Their lengths and
  // spacing follow different progressions at each depth.
  function presence(ctx, width, height, x, y) {
    const compact = width < 760;
    const columns = compact ? 49 : 96;
    const layers = compact ? 5 : 7;
    const graphite = ['#a19f91', '#77786c', '#555b51', '#343b32', '#262e28', '#242923', '#202721'];
    const blue = ['#88aaa6', '#648e94', '#4c7c88', '#346778', '#28566e', '#234b66', '#254c72'];
    ctx.save();
    ctx.lineCap = 'butt';

    for (let layer = 0; layer < layers; layer++) {
      const depth = layer / (layers - 1);
      const span = 1.01 - (1 - depth) * .28;
      const drift = x * (.016 + depth * .072);
      ctx.lineWidth = (compact ? .7 : .8) + depth * (compact ? .64 : 1.12);
      ctx.globalAlpha = .52 + depth * .4;
      for (const hanging of [true, false]) {
        const colors = hanging ? graphite : blue;
        ctx.strokeStyle = colors[Math.round(depth * (colors.length - 1))];
        ctx.beginPath();
        for (let i = 0; i < columns; i++) {
          const position = i / (columns - 1);
          const u = hanging ? position : 1 - position;
          const axis = .5 + (position - .5) * span + (hanging ? -.024 : .032) * (1 - depth) + drift;
          const edge = Math.pow(Math.abs(2 * axis - 1), 2.6);
          const slope = (u - .5) * (.038 + .022 * depth);
          const root = .024 + (1 - depth) * .078 + slope + y * depth * .018;
          const crest = Math.max(0, 1 - Math.abs(u - .18 - depth * .14) * 2.25);
          const length = .053 + .142 * crest + .064 * (1 - u) + edge * .108;
          const limit = (compact ? .306 : .267) + edge * .19;
          const tip = Math.min(limit, root + length * (.7 + depth * .3));
          const tipX = axis + (hanging ? .008 : -.009) * (depth + .3) + x * depth * .008;
          ctx.moveTo(axis * width, (hanging ? root : 1 - root) * height);
          ctx.lineTo(tipX * width, (hanging ? tip : 1 - tip) * height);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function sample(seed) {
    const value = Math.sin(seed * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  const suspendedSigns = Array.from({length: 23}, (_, index) => {
    const seed = index * 6 + 1;
    return {
      x: (index % 4 + .20 + sample(seed) * .60) / 4,
      y: (Math.floor(index / 4) + .15 + sample(seed + 1) * .70) / 6,
      angle: (sample(seed + 2) - .5) * Math.PI,
      length: .18 + sample(seed + 3) * .29,
      depth: sample(seed + 4),
      accent: index % 7 === 1,
    };
  });

  function business(ctx, w, h, x, y) {
    const compact = w < 760;
    const left = w * (compact ? .12 : .54);
    const width = w - left;
    const scale = Math.min(width, h * 1.35);
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, 0, width, h);
    ctx.clip();

    for (const sign of suspendedSigns) {
      const depth = .22 + sign.depth * .78;
      const centerX = left + width * (.16 + sign.x * .83) + x * width * .11 * depth;
      const centerY = h * (.08 + sign.y * .84) + y * h * .08 * depth;
      const angle = sign.angle + x * depth * .26;
      const half = sign.length * scale * (.32 + depth * .30);
      const dx = Math.cos(angle) * half;
      const dy = Math.sin(angle) * half;

      ctx.strokeStyle = sign.accent ? '#b83927' : '#262822';
      ctx.globalAlpha = (sign.accent ? .24 : .12) + depth * .18;
      ctx.lineWidth = .8 + depth * 1.25;
      ctx.beginPath();
      ctx.moveTo(centerX - dx, centerY - dy);
      ctx.lineTo(centerX + dx, centerY + dy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function interference(ctx,w,h,x,y){
    const side=Math.min(w*.76,h*.72),cx=w*.5,cy=h*.47;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.19+x*.07);
    ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=40;ctx.shadowOffsetY=24;
    ctx.fillStyle='#33372f';ctx.fillRect(-side*.48,-side*.48,side*.96,side*.96);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    for(let layer=0;layer<3;layer++){
      ctx.save();ctx.translate((layer-1)*(18+x*30),(layer-1)*(15+y*16));ctx.rotate((layer-1)*(.055+x*.035));
      const length=side*(.95-layer*.04),step=side/92;
      ctx.beginPath();ctx.rect(-length/2,-length/2,length,length);ctx.clip();
      for(let i=-65;i<65;i++){
        const q=i*step;
        const col=palettes.interference[((Math.floor((i+65)/17)+layer)%5+5)%5];
        ctx.globalAlpha=layer===0?.72:.65;ctx.strokeStyle=col;ctx.lineWidth=step*.37;
        ctx.beginPath();ctx.moveTo(q,-length/2);ctx.lineTo(q,length/2);ctx.stroke();
        const lower=Math.sin(i*.035+layer)*length*.16;
        ctx.globalAlpha=.5;ctx.strokeStyle=layer===1?'#e5d85a':'#c0d1cc';ctx.lineWidth=step*.32;
        ctx.beginPath();ctx.moveTo(q,-length*.22+lower);ctx.lineTo(q,length*.18+lower);ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha=1;ctx.restore();
  }
  function matter(ctx,w,h,x,y){
    const scale=Math.min(w*.35,h*.6),a=-.4+x*.25;
    const count=w<600?98:170;
    const lines=[];
    for(let i=0;i<count;i++){
      const u=i/(count-1),ax=(u-.5)*3.15;
      const curve=Math.sin(u*Math.PI*2-.65+x*.1)*.24;
      const len=.36+.31*Math.sin(u*Math.PI);
      for(let j=0;j<5;j++){
        const z=(j-2)*.12;
        const p1=project(ax,curve-len*.5,z,a,w,h,scale,.46),p2=project(ax,curve+len*.5,z,a,w,h,scale,.46);
        const col=palettes.matter[(Math.floor(u*5)+j)%5];
        lines.push({p1,p2,col,z:p1[2],j});
      }
    }
    lines.sort((aa,bb)=>bb.z-aa.z);
    lines.forEach(l=>{ctx.strokeStyle=l.col;ctx.globalAlpha=.75;ctx.lineWidth=Math.max(1.1,scale*.006);ctx.beginPath();ctx.moveTo(...l.p1.slice(0,2));ctx.lineTo(...l.p2.slice(0,2));ctx.stroke();});ctx.globalAlpha=1;
  }
  const renderers={presence,business,interference,matter};
  document.querySelectorAll('canvas[data-art]').forEach(canvas=>{
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const holder=canvas.parentElement;
    const interaction=holder.closest('[data-art-interaction]') || holder;
    const state={canvas,ctx,holder,x:0,y:0,tx:0,ty:0,visible:false,raf:0,w:0,h:0};scenes.push(state);
    function draw(){if(!state.w||!state.h)return;ctx.clearRect(0,0,state.w,state.h);renderers[canvas.dataset.art]?.(ctx,state.w,state.h,state.x,state.y);}
    function tick(){state.raf=0;state.x+=(state.tx-state.x)*.1;state.y+=(state.ty-state.y)*.1;draw();if(state.visible&&!document.hidden&&(Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)>.002))state.raf=requestAnimationFrame(tick);}
    state.draw=draw;state.wake=()=>{if(!state.raf&&state.visible&&!document.hidden&&!quiet())state.raf=requestAnimationFrame(tick);};
    new ResizeObserver(entries=>{const b=entries[0].contentRect;state.w=b.width;state.h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(b.width*d);canvas.height=Math.round(b.height*d);ctx.setTransform(d,0,0,d,0,0);draw();}).observe(holder);
    interaction.addEventListener('pointermove', event => {
      if (quiet() || event.pointerType === 'touch') return;
      const bounds = interaction.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      state.tx = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      state.ty = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      state.wake();
    });
    interaction.addEventListener('pointerleave', () => {
      if (quiet()) return;
      state.tx = 0;
      state.ty = 0;
      state.wake();
    });
  });
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const s=scenes.find(s=>s.canvas===entry.target);if(!s)return;s.visible=entry.isIntersecting;if(s.visible)s.wake();else{cancelAnimationFrame(s.raf);s.raf=0;}}),{rootMargin:'120px'});scenes.forEach(s=>observer.observe(s.canvas));
  let scrollFrame=0;
  addEventListener('scroll',()=>{if(quiet()||scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;scenes.filter(s=>s.visible).forEach(s=>{const b=s.holder.getBoundingClientRect();s.tx=Math.max(-1,Math.min(1,(innerHeight*.5-b.top-b.height*.5)/innerHeight));s.ty=s.tx*.3;s.wake();});});},{passive:true});
  document.addEventListener('visibilitychange',()=>scenes.forEach(s=>{if(document.hidden){cancelAnimationFrame(s.raf);s.raf=0;}else s.wake();}));
  const apply=()=>{document.documentElement.dataset.motion=quiet()?'reduce':'full';document.querySelectorAll('[data-motion-toggle]').forEach(b=>b.setAttribute('aria-pressed',String(quiet())));if(quiet())scenes.forEach(s=>{cancelAnimationFrame(s.raf);s.raf=0;s.x=s.tx=0;s.y=s.ty=0;s.draw();});document.dispatchEvent(new Event('empatica:motionchange'));};
  document.querySelectorAll('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{manual=quiet()?'full':'reduce';try{localStorage.setItem('empatica-motion',manual);}catch{}apply();}));
  reduced.addEventListener('change',apply);apply();
})();
