/* Individual scrollable project pages; optional media fields in projects.json. */
(()=>{
const root=document.getElementById('project-detail');if(!root)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=new URLSearchParams(location.search).get('slug');
const safeUrl=s=>typeof s==='string'&&!/^(?:javascript|data):/i.test(s.trim())?s.trim():'';
function mediaItem(entry,i){
  const item=typeof entry==='string'?{src:entry}:entry;
  if(!item||typeof item!=='object')return '';
  const src=safeUrl(item.src||item.url);if(!src)return '';
  const caption=item.caption?'<figcaption>'+esc(item.caption)+'</figcaption>':'';
  const video=item.type==='video'||/\.(?:mp4|webm)(?:[?#]|$)/i.test(src);
  if(video)return '<figure class="project-media"><video controls playsinline preload="metadata" src="'+esc(src)+'"></video>'+caption+'</figure>';
  return '<figure class="project-media"><img src="'+esc(src)+'" alt="'+esc(item.alt||'Project visual '+(i+1))+'" loading="lazy">'+caption+'</figure>';
}
function embedVideo(raw){
  const source=safeUrl(raw);if(!source)return '';
  if(/\.(?:mp4|webm)(?:[?#]|$)/i.test(source))return mediaItem({src:source,type:'video'},0);
  let url;
  try{url=new URL(source)}catch(e){return ''}
  const host=url.hostname.replace(/^www\./,'');
  let embed='';
  if(host==='vimeo.com'||host==='player.vimeo.com'){const parts=url.pathname.split('/').filter(Boolean);const id=parts.find(x=>/^\d+$/.test(x));if(id)embed='https://player.vimeo.com/video/'+id}
  if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'||host==='youtube-nocookie.com'){const id=host==='youtu.be'?url.pathname.split('/')[1]:(url.searchParams.get('v')||url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]);if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id))embed='https://www.youtube-nocookie.com/embed/'+id}
  if(!embed)return '<p class="project-external"><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">WATCH VIDEO ↗</a></p>';
  return '<div class="project-embed"><iframe src="'+esc(embed)+'" title="프로젝트 영상" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
}
fetch('data/projects.json').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(items=>{
  const index=items.findIndex(p=>p.slug===slug);
  if(index<0){root.innerHTML='<p class="empty">프로젝트를 찾을 수 없습니다. <a href="work.html">목록으로 돌아가기 ↗</a></p>';return}
  const p=items[index];document.title=p.title+' — EUNHYE';
  const gallery=Array.isArray(p.media)?p.media:(Array.isArray(p.images)?p.images:[]);
  const cover=safeUrl(p.image||p.thumbnail);
  const visibleGallery=gallery.length?gallery:[cover];
  const summary=p.summary?'<p class="project-summary">'+esc(p.summary)+'</p>':'';
  root.innerHTML='<div class="project-heading"><small>'+esc(p.category||'WORK')+' / '+esc(p.year||'')+'</small><h1>'+esc(p.title)+'</h1>'+summary+'<div class="project-facts"><span>ROLE</span><strong>'+esc(p.role||p.category||'')+'</strong></div></div><div class="project-gallery">'+visibleGallery.map(mediaItem).join('')+(p.video?embedVideo(p.video):'')+'</div>';
  const before=items[index-1],after=items[index+1],pager=document.getElementById('project-pager');
  pager.innerHTML=(before?'<a href="project.html?slug='+encodeURIComponent(before.slug)+'">← PREVIOUS <span>'+esc(before.title)+'</span></a>':'<span></span>')+(after?'<a href="project.html?slug='+encodeURIComponent(after.slug)+'">NEXT → <span>'+esc(after.title)+'</span></a>':'<span></span>');
}).catch(()=>{root.innerHTML='<p class="empty">프로젝트 데이터를 불러오지 못했어요. <a href="work.html">목록으로 돌아가기 ↗</a></p>'});
})();