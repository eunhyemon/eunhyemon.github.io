/* Project expansion from the work collage. The header stays mounted; browser history works. */
(() => {
 if (!document.body.classList.contains('work-home')) return;
 const board=document.getElementById('projects');
 if (!board) return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUrl=value=>{
   if(typeof value!=='string')return '';
   const src=value.trim();
   if(!src||src.startsWith('//'))return '';
   try{
     const url=new URL(src,location.href);
     return (url.protocol==='https:'||url.protocol==='http:')?src:'';
   }catch(_){return ''}
 };
 const projectsPromise=fetch('data/projects.json').then(r=>{if(!r.ok)throw Error('project data');return r.json()});
 let overlay=null,activeCard=null,activeSlug='',busy=false;
 const closeLink=()=>document.querySelector('#site-header .nav-close');
 const makeMedia=(item,i)=>{
   const entry=typeof item==='string'?{src:item}:item;
   if(!entry||typeof entry!=='object')return '';
   const src=safeUrl(entry.src||entry.url);if(!src)return '';
   const caption=entry.caption?'<figcaption>'+esc(entry.caption)+'</figcaption>':'';
   if(entry.type==='video'||/\.(mp4|webm)(?:[?#]|$)/i.test(src))
     return '<figure class="project-media"><video controls playsinline preload="metadata" src="'+esc(src)+'"></video>'+caption+'</figure>';
   return '<figure class="project-media"><img loading="lazy" src="'+esc(src)+'" alt="'+esc(entry.alt||'Project image '+(i+1))+'">'+caption+'</figure>';
 };
 const videoMarkup=url=>{
   const source=safeUrl(url);if(!source)return '';
   if(/\.(mp4|webm)(?:[?#]|$)/i.test(source))return makeMedia({src:source,type:'video'},0);
   let u;try{u=new URL(source)}catch(_){return ''}
   const host=u.hostname.replace(/^www\./,'');
   let embed='';
   if(host==='vimeo.com'||host==='player.vimeo.com'){
     const id=u.pathname.split('/').find(p=>/^\d+$/.test(p));if(id)embed='https://player.vimeo.com/video/'+id;
   }
   if(['youtube.com','m.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)){
     const id=host==='youtu.be'?u.pathname.split('/')[1]:(u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]);
     if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))embed='https://www.youtube-nocookie.com/embed/'+id;
   }
   return embed?'<div class="project-embed"><iframe loading="lazy" title="Project video" src="'+esc(embed)+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>':'';
 };
 const createOverlay=(project,thumbnail)=>{
   const gallery=Array.isArray(project.media)?project.media:(Array.isArray(project.images)?project.images:[]);
   const images=gallery.length?gallery:[project.image||project.thumbnail];
   const hero=safeUrl(thumbnail||project.image||project.thumbnail);
   const channel=safeUrl(project.channelUrl);
   const el=document.createElement('section');
   el.className='project-overlay';
   el.setAttribute('role','dialog');
   el.setAttribute('aria-modal','true');
   el.setAttribute('aria-label',project.title+' project detail');
   el.innerHTML='<div class="project-overlay-scroll"><div class="project-overlay-inner">'+
    '<div class="project-overlay-cover"><img src="'+esc(hero)+'" alt="'+esc(project.title)+' project thumbnail"></div>'+
    '<div class="project-overlay-content"><div class="project-overlay-body">'+
    '<div class="project-heading"><small>'+esc(project.category||'WORK')+(project.projectType?' / '+esc(project.projectType):'')+'</small>'+
    '<h1>'+esc(project.title)+'</h1>'+(project.summary?'<p class="project-summary">'+esc(project.summary)+'</p>':'')+
    (channel&&channel.startsWith('https://')?'<p class="project-channel"><a href="'+esc(channel)+'" target="_blank" rel="noopener noreferrer">VIEW CHANNEL ↗</a></p>':'')+
    '<div class="project-facts"><span>ROLE</span><strong>'+esc(project.role||project.category||'')+'</strong></div></div>'+
    '<div class="project-gallery">'+images.map(makeMedia).join('')+(project.video?videoMarkup(project.video):'')+'</div>'+
    '<button class="overlay-back" type="button">← BACK TO WORK</button></div></div></div></div>';
   el.querySelector('.overlay-back').addEventListener('click',close);
   return el;
 };
 const tween=async(img,from,to,duration)=>{
   if(!img||reduced.matches||!img.animate)return;
   const clone=img.cloneNode(false);
   clone.removeAttribute('loading');
   clone.className='project-expand-ghost';
   Object.assign(clone.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
   document.body.appendChild(clone);
   try{
     const animation=clone.animate([
       {left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},
       {left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'}
     ],{duration,easing:'cubic-bezier(.2,.72,.16,1)',fill:'forwards'});
     await animation.finished;
   }catch(_){}
   clone.remove();
 };
 async function open(card,slug,push=true){
   if(busy||overlay||!slug)return;
   busy=true;
   let project;
   try{const items=await projectsPromise;project=items.find(p=>p.slug===slug)}catch(_){}
   if(!project){busy=false;location.href='project.html?slug='+encodeURIComponent(slug);return}
   const thumb=card?.querySelector('.cover img')||null;
   activeCard=card;activeSlug=slug;
   overlay=createOverlay(project,thumb?.currentSrc||project.thumbnail);
   document.body.appendChild(overlay);
   const targetImage=overlay.querySelector('.project-overlay-cover img');
   targetImage.style.visibility='hidden';
   const source=thumb?.getBoundingClientRect();
   const target=overlay.querySelector('.project-overlay-cover').getBoundingClientRect();
   document.body.classList.add('project-open');
   requestAnimationFrame(()=>overlay?.classList.add('is-visible'));
   if(push)history.pushState({haileyOverlay:true,slug},'', 'project.html?slug='+encodeURIComponent(slug));
   if(thumb&&source&&source.width>0&&target.width>0){
     await tween(thumb,source,target,590);
   }else if(!reduced.matches){
     await new Promise(done=>setTimeout(done,220));
   }
   if(!overlay){busy=false;return}
   targetImage.style.visibility='visible';
   overlay.classList.add('is-settled');
   busy=false;
   if(push)closeLink()?.focus({preventScroll:true});
 }
 async function closeVisual(){
   if(!overlay||busy)return;
   busy=true;
   const el=overlay;
   el.classList.remove('is-settled');
   const img=el.querySelector('.project-overlay-cover img');
   const from=el.querySelector('.project-overlay-cover').getBoundingClientRect();
   const thumb=activeCard?.querySelector('.cover img');
   const to=thumb?.getBoundingClientRect();
   el.querySelector('.project-overlay-scroll').scrollTop=0;
   if(img&&thumb&&to&&to.width>0){
     el.classList.remove('is-visible');
     await tween(img,from,to,500);
   }else{
     el.classList.remove('is-visible');
     await new Promise(done=>setTimeout(done,reduced.matches?0:220));
   }
   el.remove();
   if(overlay===el)overlay=null;
   document.body.classList.remove('project-open');
   activeCard?.focus({preventScroll:true});
   activeCard=null;activeSlug='';busy=false;
 }
 function close(){
   if(!overlay||busy)return;
   if(history.state?.haileyOverlay && location.pathname.endsWith('/project.html'))history.back();
   else{history.replaceState(null,'','index.html');closeVisual()}
 }
 // Old page-transition handler intentionally ignores project cards.
 document.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target.closest('a.project[href]');
   if(!anchor||!board.contains(anchor))return;
   const url=new URL(anchor.href,location.href);
   if(url.pathname!==new URL('project.html',location.href).pathname)return;
   event.preventDefault();
   open(anchor,url.searchParams.get('slug'));
 });
 document.addEventListener('click',event=>{
   const link=event.target.closest('#site-header .nav-close');
   if(!link||!overlay)return;
   event.preventDefault();
   close();
 });
 document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&overlay){event.preventDefault();close()}
 });
 addEventListener('popstate',()=>{
   const slug=new URLSearchParams(location.search).get('slug');
   if(overlay&&(!slug||slug!==activeSlug))closeVisual();
   else if(!overlay&&slug){
     const card=[...board.querySelectorAll('.project')].find(a=>new URL(a.href,location.href).searchParams.get('slug')===slug);
     if(card)open(card,slug,false);
   }
 });
})();
