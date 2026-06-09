// Ginger Instal — Tier 2 — micro interactions
(function(){
  // Mobile nav toggle
  const burger = document.querySelector('.burger');
  const links = document.querySelector('nav.links');
  if(burger && links){
    burger.addEventListener('click', ()=>{
      links.classList.toggle('open');
      burger.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', ()=>{
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>o.classList.remove('open'));
      if(!open) item.classList.add('open');
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Stats counter
  const counters = document.querySelectorAll('.stat .n[data-count]');
  const co = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(1, Math.ceil(target/40));
      const t = setInterval(()=>{
        cur = Math.min(target, cur+step);
        el.textContent = cur + suffix;
        if(cur>=target) clearInterval(t);
      }, 35);
      co.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach(c=>co.observe(c));

  // Lightbox for gallery
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,10,.92);display:none;align-items:center;justify-content:center;z-index:200;cursor:zoom-out;padding:32px;';
  lb.innerHTML = '<img style="max-width:100%;max-height:100%;border-radius:6px;box-shadow:0 32px 64px rgba(0,0,0,.5)">';
  document.body.appendChild(lb);
  document.querySelectorAll('.gallery a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const img = a.querySelector('img');
      if(!img) return;
      lb.querySelector('img').src = img.src;
      lb.style.display = 'flex';
    });
  });
  lb.addEventListener('click', ()=>lb.style.display='none');
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') lb.style.display='none'; });

  // Form submit demo
  const form = document.querySelector('form.contact');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = 'Odesláno ✓';
      btn.style.background = '#2d8a4d';
      setTimeout(()=>{ form.reset(); btn.textContent='Odeslat poptávku'; btn.style.background=''; }, 2500);
    });
  }
})();
