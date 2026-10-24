/* Shared lazy media policy: visible videos only, one active mobile tile, poster only for reduced motion / Save-Data. */
(()=>{'use strict';
const mobile=matchMedia('(max-width:781px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)'),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const states=new Map();let frame=0;
const restricted=()=>reduce.matches||connection?.saveData===true;
function load(v){const s=states.get(v);if(s.attached)return;if(v.dataset.src)v.src=v.dataset.src;v.querySelectorAll('source[data-src]').forEach(source=>source.src=source.dataset.src);s.attached=true;v.load();}
function posterOnly(v){const s=states.get(v);v.pause();if(!s.attached)return;v.removeAttribute('src');v.querySelectorAll('source[src]').forEach(source=>source.removeAttribute('src'));s.attached=false;v.load();}
function play(v){const s=states.get(v);if(s.starting||!v.paused)return;load(v);v.muted=true;s.starting=true;v.play().catch(()=>{}).finally(()=>{s.starting=false;});}
function activate(item){if(!item)return;const group=item.closest('.gcim-video-accordion');if(!group)return;group.querySelectorAll('.gcim-video-accordion-item.is-active').forEach(e=>{if(e!==item)e.classList.remove('is-active')});item.classList.add('is-active');}
function reconcile(){frame=0;
 const chosen=new Set();
 if(mobile.matches){
  document.querySelectorAll('.gcim-video-accordion').forEach(group=>{
   const visible=[...states].filter(([v,s])=>s.item&&group.contains(s.item)&&s.visible);
   if(!visible.length)return;
   const selected=visible.find(([,s])=>s.item.classList.contains('is-active'))||visible.sort((a,b)=>b[1].ratio-a[1].ratio)[0];
   chosen.add(selected[0]);activate(selected[1].item);
  });
 }
 for(const [v,s] of states){
  if(restricted()){posterOnly(v);continue;}
  const allowed=s.visible&&!document.hidden&&(!mobile.matches||!s.item||chosen.has(v));
  if(allowed)play(v);else v.pause();
 }
}
function schedule(){if(!frame)frame=requestAnimationFrame(reconcile);}
const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=states.get(e.target);if(s){s.visible=e.isIntersecting&&e.intersectionRatio>.05;s.ratio=e.intersectionRatio;}}schedule();},{threshold:[0,.05,.15,.5,1]});
function prepare(root){
 root.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(href==='#'||/^index(?:-[a-z]+)?\.html#$/.test(href)){a.hidden=true;const li=a.closest('li');if(li)li.hidden=true;}});
 root.querySelectorAll('.gcim-header__search-toggle,.gcim-header__search,.gcim-footer-initiatives').forEach(e=>e.hidden=true);
 root.querySelectorAll('video').forEach(v=>{if(states.has(v))return;
  v.autoplay=false;v.removeAttribute('autoplay');v.preload='none';v.muted=true;v.playsInline=true;
  // Also normalize subsequently inserted videos to deferred sources.
  if(v.hasAttribute('src')){v.dataset.src=v.getAttribute('src');v.removeAttribute('src');}
  v.querySelectorAll('source[src]').forEach(source=>{source.dataset.src=source.getAttribute('src');source.removeAttribute('src');});
  const item=v.closest('.gcim-video-accordion-item');
  const setAspect=()=>{if(!item)return;const w=v.videoWidth||Number(v.getAttribute('width'))||832,h=v.videoHeight||Number(v.getAttribute('height'))||480;item.style.setProperty('--gc-video-aspect',`${w} / ${h}`);};setAspect();v.addEventListener('loadedmetadata',setAspect);
  states.set(v,{item,visible:false,ratio:0,attached:false,starting:false});observer.observe(v);
 });
 root.querySelectorAll('.gcim-video-accordion').forEach(group=>{if(group.dataset.gcInitialized)return;group.dataset.gcInitialized='true';if(!group.querySelector('.is-active'))group.querySelector('.gcim-video-accordion-item')?.classList.add('is-active');group.addEventListener('click',e=>{if(mobile.matches&&!e.target.closest('button,a')){activate(e.target.closest('.gcim-video-accordion-item'));schedule();}});});
}
function policyChanged(){schedule();}
function init(){prepare(document);new MutationObserver(entries=>{for(const e of entries)for(const node of e.addedNodes)if(node.nodeType===1){if(node.matches('video'))prepare(node.parentElement);else if(node.querySelector('video,a[href]'))prepare(node);}}).observe(document.body,{childList:true,subtree:true});reduce.addEventListener('change',policyChanged);connection?.addEventListener('change',policyChanged);mobile.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
