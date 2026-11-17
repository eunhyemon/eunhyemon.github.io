const grid=document.querySelector('#projects');let projects=[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(grid){
  function render(cat='All'){
    const list=projects.filter(p=>cat==='All'||p.category===cat);
    const count=document.querySelector('#count');
    if(count)count.textContent=String(list.length).padStart(2,'0')+' PROJECTS';
    grid.innerHTML=list.length?list.map(p=>{
      const preview=typeof p.preview==='string'?p.preview:'';
      const motion=/\.(mp4|webm)(?:[?#]|$)/i.test(preview);
      const pic=motion?p.thumbnail:(preview||p.thumbnail);
      
      return `<a class="project" href="project.html?slug=${encodeURIComponent(p.slug)}" aria-label="${esc(p.title)} 상세 보기"><span class="cover"><img src="${esc(pic)}" alt="" loading="lazy"></span><span class="meta"><h3>${esc(p.title)}</h3></span></a>`;
    }).join(''):'<p class="empty">프로젝트가 아직 없어요.</p>';
    grid.dispatchEvent(new CustomEvent('work:rendered'));
    if(window.ScrollTrigger)ScrollTrigger.refresh();
  }
  document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');render(b.dataset.filter);
  }));
  fetch('data/projects.json').then(r=>{if(!r.ok)throw Error('unavailable');return r.json()}).then(data=>{projects=data;render()}).catch(()=>grid.innerHTML='<p class="empty">프로젝트 데이터를 불러오지 못했어요.</p>');
}
const friend=document.querySelector('.friend');const eyes=document.querySelector('#pupils');
if(friend&&eyes&&matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){addEventListener('pointermove',e=>{const r=friend.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y)||1,t=Math.min(d/200,1);eyes.style.transform=`translate(${x/d*t*9}px,${y/d*t*9}px)`},{passive:true})}
if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  if(document.querySelector('.hero h1')){
    gsap.from('.hero h1',{opacity:0,y:18,duration:1.05,ease:'power2.out'});
    gsap.from('.friend',{opacity:0,duration:1.1,delay:.18,ease:'power2.out'});
    gsap.from('.hero-bottom',{opacity:0,y:14,duration:1,delay:.4,ease:'power2.out'});
  }
  gsap.to('.float-title',{y:-7,rotation:.35,duration:3.4,ease:'sine.inOut',repeat:-1,yoyo:true});
  gsap.to('.friend',{y:-6,duration:3.8,ease:'sine.inOut',repeat:-1,yoyo:true});
}
/* Small stagger for About / Contact; classes are applied only when motion is allowed. */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const blocks=document.querySelectorAll('.about > div > *, .contact > *');
  if(blocks.length){
    blocks.forEach((el,i)=>{el.classList.add('page-reveal');el.style.setProperty('--page-delay',Math.min(i*115,520)+'ms');});
    requestAnimationFrame(()=>requestAnimationFrame(()=>blocks.forEach(el=>el.classList.add('page-reveal-in'))));
  }
}

/* Accessible, persistent theme control on every page. */
(function(){const key='eunhye-theme';let stored=null;try{stored=localStorage.getItem(key)}catch(e){}const root=document.documentElement;const buttons=document.querySelectorAll('.theme-toggle');function apply(mode){root.dataset.theme=mode;buttons.forEach(b=>{b.setAttribute('aria-label',mode==='dark'?'라이트 모드로 변경':'다크 모드로 변경');b.setAttribute('aria-pressed',String(mode==='dark'));b.title=mode==='dark'?'Light mode':'Dark mode'})}apply(stored==='dark'||stored==='light'?stored:'light');root.classList.add('theme-ready');buttons.forEach(b=>b.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';apply(next);try{localStorage.setItem(key,next)}catch(e){}}))})();
