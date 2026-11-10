(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (page === 'index' && location.hash === '#selected-works') {
    location.replace('imprese.html' + location.search + '#selected-works');
    return;
  }
  const strings=window.EMPATICA_COPY||{};
  let lang='it';
  try { const saved=localStorage.getItem('empatica-language'); if(saved==='en'||saved==='it')lang=saved; } catch {}
  const param=new URLSearchParams(location.search).get('lang');if(param==='en'||param==='it')lang=param;
  const phrase=key=>strings[key]?.[lang]||strings[key]?.it||key;
  const menu=document.getElementById('main-nav');
  const menuToggle=document.querySelector('.menu-toggle');
  function closeMenu(){menu.dataset.open='false';menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='Menu';}
  function translate(){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-copy]').forEach(el=>{const value=phrase(el.dataset.copy);el.replaceChildren();value.split('\n').forEach((part,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(part));});});
    document.querySelectorAll('[data-copy-aria]').forEach(el=>el.setAttribute('aria-label',phrase(el.dataset.copyAria)));
    document.querySelectorAll('[data-copy-content]').forEach(el=>el.setAttribute('content',phrase(el.dataset.copyContent)));
    document.querySelectorAll('.lang-toggle').forEach(b=>{b.textContent=lang==='it'?'EN':'IT';b.setAttribute('aria-label',lang==='it'?'Read in English':'Leggi in italiano');});
    if(menuToggle.getAttribute('aria-expanded')==='true')menuToggle.textContent=phrase('nav.close');
  }
  document.querySelectorAll('.lang-toggle').forEach(b=>b.addEventListener('click',()=>{lang=lang==='it'?'en':'it';try{localStorage.setItem('empatica-language',lang);}catch{}translate();}));translate();
  menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menu.dataset.open=String(open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?phrase('nav.close'):'Menu';});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.dataset.open==='true'){closeMenu();menuToggle.focus();}});
  const desktopMenu = matchMedia('(width > 820px)');
  desktopMenu.addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  let opener=null;
  const contact=document.getElementById('contact-dialog');
  const info=document.getElementById('info-dialog');
  const form=document.getElementById('inquiry-form');
  const status=document.getElementById('form-status');
  const success=document.getElementById('inquiry-success');
  let sending=false;
  function openDialog(dialog,source){closeMenu();opener=source;dialog.showModal();document.body.style.overflow='hidden';}
  document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
    if(button.classList.contains('another-message')){form.reset();form.hidden=false;success.hidden=true;status.textContent='';form.elements.name.focus();return;}
    form.elements.area.value=button.dataset.contact||'';
    openDialog(contact,button);
  }));
  document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>openDialog(info,b)));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      const returnTo = opener && menu.contains(opener) && !desktopMenu.matches ? menuToggle : opener;
      returnTo?.focus({ preventScroll: true });
    });
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(sending||!form.reportValidity())return;
    if(!form.elements.message.value.trim()){status.textContent=phrase('form.empty');form.elements.message.focus();return;}
    if (form.dataset.delivery === 'email') {
      const {name, email, area, message} = form.elements;
      const subject = area.value || phrase('form.contact');
      const draft = [message.value.trim(), '', name.value.trim(), email.value.trim()].join('\r\n');
      const recipient = form.querySelector('a[href^="mailto:"]').href;
      location.href = recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(draft);
      return;
    }
    if(location.protocol==='file:'||['localhost','127.0.0.1','::1'].includes(location.hostname)){status.textContent=phrase('form.preview');return;}
    const body=new URLSearchParams();new FormData(form).forEach((value,key)=>body.append(key,String(value).trim()));
    const submit=form.querySelector('[type=submit]');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
    sending=true;submit.disabled=true;form.setAttribute('aria-busy','true');status.textContent=phrase('form.sending');
    try {
      const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString(),signal:controller.signal});
      if(!response.ok)throw new Error('Not accepted');
      form.hidden=true;status.textContent='';success.hidden=false;success.focus({preventScroll:true});
    } catch {status.textContent=phrase('form.error');}
    finally {clearTimeout(timer);sending=false;submit.disabled=false;form.removeAttribute('aria-busy');}
  });
  const header = document.querySelector('.site-header');
  const headerLinks = [...menu.querySelectorAll('[data-nav-section]')];
  const headerSections = [...document.querySelectorAll('[data-header-section]')];
  const dark=[...document.querySelectorAll('[data-dark]')];
  const brand=document.querySelector('.brand');
  const clamp=value=>Math.min(1,Math.max(0,value));
  const smooth=value=>value*value*(3-2*value);
  let scrollFrame=0;
  function updatePosition(){
    scrollFrame=0;
    const headerHeight = header.offsetHeight;
    const boundary = headerHeight - 20;
    document.body.classList.toggle('header-dark',dark.some(el=>{const b=el.getBoundingClientRect();return b.top<=boundary&&b.bottom>boundary;}));
    const progress=smooth(clamp((scrollY-24)/360));
    const reduced=document.documentElement.dataset.motion==='reduce';
    const p=reduced?(progress>.5?1:0):progress;
    brand.style.setProperty('--brand-progress',p.toFixed(4));
    brand.style.setProperty('--brand-turn',(reduced?0:Math.sin(p*Math.PI)*48).toFixed(3)+'deg');
    brand.style.setProperty('--tail-turn',(-p*88).toFixed(3)+'deg');
    brand.style.setProperty('--tail-opacity',(1-smooth(clamp((p-.15)/.75))).toFixed(4));
    brand.dataset.compact=String(p===1);
    if (!headerSections.length) return;
    const readingLine = headerHeight + 40;
    const current = headerSections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= readingLine && bounds.bottom > readingLine;
    });
    const currentKey = current?.hasAttribute('data-room')
      ? 'rooms'
      : current?.id ?? (page === 'imprese' ? 'business' : null);
    headerLinks.forEach(link => {
      if (link.dataset.navSection === currentKey) {
        link.setAttribute('aria-current', currentKey === 'business' ? 'page' : 'location');
      }
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updatePosition);},{passive:true});addEventListener('resize',updatePosition);updatePosition();
  document.addEventListener('empatica:motionchange',updatePosition);
  const aliases={strategy:'relazioni',identity:'relazioni',sound:'relazioni',digital:'materia',tools:'materia',accessibility:'studio',contact:'contatti'};
  if(document.body.dataset.page==='index'&&aliases[location.hash.slice(1)]){const target=aliases[location.hash.slice(1)];history.replaceState(null,'','#'+target);requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView());}
})();
