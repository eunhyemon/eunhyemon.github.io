if(document.querySelector('#projects')){
let projects=[];const grid=document.querySelector('#projects'),dlg=document.querySelector('#detail'),out=document.querySelector('#detail-content');const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(cat='All'){const list=projects.filter(p=>cat==='All'||p.category===cat);document.querySelector('#count').textContent=String(list.length).padStart(2,'0')+' PROJECTS';grid.innerHTML=list.length?list.map(p=>`<button class="project" data-slug="${esc(p.slug)}"><span class="cover"><img src="${esc(p.thumbnail)}" alt="${esc(p.title)} 썸네일" loading="lazy"></span><span class="meta"><span><h3>${esc(p.title)}</h3><p>${esc(p.category)}</p></span><time>${esc(p.year)}</time></span></button>`).join(''):'<p class="empty">프로젝트가 아직 없어요.</p>'}document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)});grid.onclick=e=>{const b=e.target.closest('[data-slug]');if(!b)return;const p=projects.find(x=>x.slug===b.dataset.slug);if(!p)return;const video=p.video&&/^https:\/\/(www\.)?(vimeo\.com|youtube\.com|youtu\.be)\//.test(p.video)?`<a target="_blank" rel="noopener noreferrer" href="${esc(p.video)}">WATCH VIDEO ↗</a>`:'';out.innerHTML=`<div class="detail"><img src="${esc(p.image||p.thumbnail)}" alt="${esc(p.title)}"><small>${esc(p.category)} / ${esc(p.year)}</small><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><small>ROLE — ${esc(p.role)}</small>${video}</div>`;dlg.showModal()};document.querySelector('#close').onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg)dlg.close()};const friend=document.querySelector('.friend'),eyes=document.querySelector('#pupils');if(matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches)addEventListener('pointermove',e=>{const r=friend.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y)||1,t=Math.min(d/200,1);eyes.style.transform=`translate(${x/d*t*9}px,${y/d*t*9}px)`},{passive:true});fetch('data/projects.json').then(r=>{if(!r.ok)throw Error('unavailable');return r.json()}).then(data=>{projects=data;render()}).catch(()=>grid.innerHTML='<p class="empty">프로젝트 데이터를 불러오지 못했어요.</p>');

}
/* Scroll motion: optional enhancement; content stays visible without GSAP */
function initScrollMotion(){
 if(!window.gsap||!window.ScrollTrigger||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 gsap.registerPlugin(ScrollTrigger);
 gsap.from('.hero h1',{autoAlpha:0,y:18,duration:1.2,ease:'power2.out',delay:.12});
 gsap.from('.friend',{autoAlpha:0,y:24,rotation:-10,duration:1.15,ease:'power2.out',delay:.5});
 gsap.utils.toArray('.section-title,.about h2,.about p,.contact h2,.contact>a').forEach(el=>{
  gsap.from(el,{autoAlpha:0,y:48,duration:1.05,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
 });
 if(grid){const observer=new MutationObserver(()=>{
  gsap.utils.toArray('.project:not([data-animated])').forEach(el=>{
   el.dataset.animated='true';
   gsap.from(el,{autoAlpha:0,y:65,duration:1.1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
  });
  ScrollTrigger.refresh();
 });
 observer.observe(grid,{childList:true});
 gsap.utils.toArray('.project').forEach(el=>{
  el.dataset.animated='true';
  gsap.from(el,{autoAlpha:0,y:65,duration:1.1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
 });}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initScrollMotion);else initScrollMotion();

if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){gsap.to('.float-title',{y:-9,rotation:.5,duration:3.4,ease:'sine.inOut',repeat:-1,yoyo:true});}
