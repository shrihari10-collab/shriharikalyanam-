(function(){
"use strict";
var C=window.INV||{}; var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var NS='http://www.w3.org/2000/svg';

/* guest name from ?name= */
var guest=''; try{ guest=(new URLSearchParams(location.search).get('name')||'').replace(/[_\s]+/g,' ').trim().slice(0,60);}catch(e){}
$$('[data-guest]').forEach(function(el){ if(guest){el.textContent=guest;} else if(el.hasAttribute('data-hide-empty')){el.style.display='none';} });
if(guest){
  var fem=/^(ಶ್ರೀಮತಿ|ಶ್ರೀಮತೀ|ಸೌ[.\s]|smt|shrimati|mrs)/i.test(guest), mal=!fem&&/^(ಶ್ರೀ|shri|sri|mr[.\s])/i.test(guest);
  $$('[data-pre],[data-post]').forEach(function(x){
    var v=x.getAttribute('data-named'); if(v===null) v=fem?x.getAttribute('data-fem'):(mal?x.getAttribute('data-male'):null);
    if(v!==null) x.textContent=v;
  });
}
$$('[data-has-guest]').forEach(function(el){ if(!guest) el.style.display='none'; });
$$('[data-no-guest]').forEach(function(el){ if(guest) el.style.display='none'; });
var gi=$('#guestInput'); if(gi&&guest) gi.value=guest;

/* ornaments from traced data */
var ORN=window.ORN||{};
$$('svg[data-orn]').forEach(function(s){
  var o=ORN[s.getAttribute('data-orn')]; if(!o) return;
  s.setAttribute('viewBox','0 0 '+o.w+' '+o.h);
  var p=document.createElementNS(NS,'path'); p.setAttribute('d',o.d); p.setAttribute('pathLength','1'); s.appendChild(p);
});


/* handwriting: words are "written" left-to-right with a soft pen edge */
var WSEL='.hero .bless,.hero .names,.hero .sub,.hero .dline,.card p,.card h1,.sec h2.h,.sec .sub,.box small,.box .dt,.box p,.sec>p,.stp,.st,.cap';
function writeify(el){
  var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null), nodes=[], n, spans=[];
  while((n=tw.nextNode())) nodes.push(n);
  nodes.forEach(function(t){
    if(!t.nodeValue.trim()) return;
    var f=document.createDocumentFragment();
    t.nodeValue.split(/(\s+)/).forEach(function(p){
      if(!p) return;
      if(/^\s+$/.test(p)){ f.appendChild(document.createTextNode(p)); return; }
      var w=document.createElement('span'); w.className='w'; if(el.classList.contains('gold')||(t.parentNode.closest&&t.parentNode.closest('.gold'))){var g=document.createElement('span'); g.className='gi'; g.textContent=p; w.appendChild(g);} else w.textContent=p; spans.push(w); f.appendChild(w);
    });
    t.parentNode.replaceChild(f,t);
  });
  var step=Math.min(.14,3.6/Math.max(spans.length,1));
  spans.forEach(function(w,i){ w.style.setProperty('--d',(i*step).toFixed(3)+'s'); });
  el.classList.add('wr'); el._wt=(spans.length*step+1.1)*1000;
}
function wGo(el){ el.classList.add('wi'); setTimeout(function(){el.classList.add('done')},(el._wt||2000)+400); }
var wEls=[], wHero=[];
if(!reduce){
  $$(WSEL).forEach(function(el){ if(!el.querySelector('.cd')&&!el.closest('.cdwrap')){ writeify(el); (el.closest('.hero')?wHero:wEls).push(el); } });
}
var wio=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
  var hit=es.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top}), acc=0;
  hit.forEach(function(e){ var el=e.target; wio.unobserve(el); setTimeout(function(){wGo(el)},acc); acc+=Math.min(el._wt,1600)*.6; });
},{threshold:.3,rootMargin:'0px 0px -4% 0px'}):null;
wEls.forEach(function(el){ if(wio) wio.observe(el); else wGo(el); });
function writeHero(){ var t=200; wHero.forEach(function(el){ setTimeout(function(){wGo(el)},t); t+=Math.min(el._wt,1800)*.75; }); }

/* reveal on scroll */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('in'); $$('svg.draw',e.target).forEach(function(s){s.classList.add('go')}); io.unobserve(e.target);} })},{threshold:.15}):null;
$$('.rv').forEach(function(el){ io?io.observe(el):el.classList.add('in'); });

/* audio */
var bgm=$('#bgm'), snd=$('#snd');
function setSnd(){ if(snd) snd.classList.toggle('mute', !bgm||bgm.paused); }
if(snd&&bgm){ snd.addEventListener('click',function(){ if(bgm.paused){bgm.play().catch(function(){});}else{bgm.pause();} }); bgm.addEventListener('play',setSnd); bgm.addEventListener('pause',setSnd); setSnd(); }

/* intro: open the scroll */
var scroll=$('#scroll'), seal=$('#seal'), opened=false;
document.documentElement.classList.add('locked'); window.scrollTo(0,0);
function finish(){
  document.body.classList.add('opened'); document.documentElement.classList.remove('locked'); window.scrollTo(0,0);
  startFx(); writeHero();
  $$('.hero .rv').forEach(function(el,i){ setTimeout(function(){el.classList.add('in')},150+i*180); });
}
function openIt(){
  if(opened) return; opened=true;
  if(bgm){ bgm.volume=.7; bgm.play().catch(function(){}); }
  if(reduce){ finish(); return; }
  scroll.classList.add('open');
  $$('#intro svg.draw').forEach(function(s){ setTimeout(function(){s.classList.add('go')},900); });
  setTimeout(finish,4900);
}
if(seal){ seal.addEventListener('click',openIt); }
var ti=$('#intro'); if(ti){ ti.addEventListener('click',openIt); }
var skip=$('#skip'); if(skip){ skip.addEventListener('click',function(e){e.stopPropagation(); opened=true; if(bgm){bgm.play().catch(function(){});} finish();}); }

/* countdown (English) */
var target=new Date(C.target||'2027-01-28T12:18:00+05:30').getTime();
var cdEl=$('#cd');
function p2(n){return n<10?'0'+n:String(n)}
function tick(){
  if(!cdEl) return; var d=target-Date.now();
  if(d<=0){ cdEl.style.display='none'; var m=$('#cdmsg'); if(m) m.textContent=C.cdDone||''; return; }
  var s=Math.floor(d/1000);
  var v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];
  $$('b',cdEl).forEach(function(b,i){ b.textContent=i?p2(v[i]):String(v[i]); });
}
tick(); setInterval(tick,1000);

/* calendar */
function pad(n){return (n<10?'0':'')+n}
function gcal(ev){ return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(ev.title)+'&dates='+ev.start+'/'+ev.end+'&details='+encodeURIComponent(ev.desc)+'&location='+encodeURIComponent(ev.loc); }
function esc(s){return s.replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
function icsFile(ev){
  var t=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Shrihari-Nagaveni//Invitation//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+ev.id+'@invite','DTSTAMP:20261109T170000Z','DTSTART:'+ev.start,'DTEND:'+ev.end,'SUMMARY:'+esc(ev.title),'LOCATION:'+esc(ev.loc),'DESCRIPTION:'+esc(ev.desc),'END:VEVENT','END:VCALENDAR'].join('\r\n');
  var b=new Blob([t],{type:'text/calendar;charset=utf-8'}), a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=ev.id+'.ics'; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
}
(C.events||[]).forEach(function(ev){
  var g=$('[data-gcal="'+ev.id+'"]'), i=$('[data-ics="'+ev.id+'"]');
  if(g) g.href=gcal(ev); if(i) i.addEventListener('click',function(){icsFile(ev)});
});

/* RSVP / blessings via WhatsApp */
var f=$('#rsvp');
if(f){ f.addEventListener('submit',function(e){
  e.preventDefault(); var name=(f.name.value||'').trim()||guest||'';
  var yes=f.att.value==='yes', msg=(f.msg.value||'').trim();
  var t='ನಮಸ್ಕಾರ 🙏\n'+(name?'ನಾನು '+name+'.\n':'')+(yes?C.yesText:C.noText)+(msg?'\n\n'+msg:'');
  var a=document.createElement('a'); a.href='https://wa.me/'+C.phone+'?text='+encodeURIComponent(t); a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); setTimeout(function(){a.remove()},500);
}); }

/* story: Saptapadi */
var scenes=$$('.scene'), lamps=$$('#spbar .dya'), sbar=$('#spbar'), thread=$('#thread'), pathEl=$('#path');
function lampsUpdate(){
  var n=0; $$('.scene.lit').forEach(function(s){ var k=+s.getAttribute('data-step'); if(k>n) n=k; });
  lamps.forEach(function(l,i){ l.classList.toggle('on',i<n); }); if(sbar) sbar.classList.toggle('all',n>=8);
}
if(scenes.length){
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){ es.forEach(function(e){
      if(!e.isIntersecting) return; var s=e.target; if(s.classList.contains('lit')) return; s.classList.add('lit'); so.unobserve(s);
      var d=s.querySelector('.node .dya'); if(d&&window.__burst){ var r=d.getBoundingClientRect(); window.__burst(r.left+r.width/2,r.top+r.height*.35); }
      lampsUpdate(); }); },{threshold:.25,rootMargin:'0px 0px -8% 0px'});
    scenes.forEach(function(s){ so.observe(s); });
    var fo=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); fo.unobserve(e.target);} }); },{threshold:.35});
    $$('.feet').forEach(function(f){ fo.observe(f); });
  } else { scenes.forEach(function(s){s.classList.add('lit')}); $$('.feet').forEach(function(f){f.classList.add('in')}); lampsUpdate(); }
  var busy=false;
  function onScroll(){ if(busy) return; busy=true; requestAnimationFrame(function(){ busy=false;
    if(pathEl&&thread){ var r=pathEl.getBoundingClientRect(), p=(innerHeight*.62-r.top)/r.height; thread.style.setProperty('--p',Math.max(0,Math.min(1,p)).toFixed(4)); }
    if(!reduce) scenes.forEach(function(s){ var r=s.getBoundingClientRect(); if(r.bottom<-120||r.top>innerHeight+120) return;
      var c=r.top+r.height/2-innerHeight/2, im=s.querySelector('.pic-in img'); if(im) im.style.setProperty('--py',(c*-.03).toFixed(1)+'px'); }); }); }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); onScroll();
}

/* gold dust (floating sparkles) + sparks when a diya lights */
var cv=$('#fx'), fxOn=false;
function startFx(){
  if(!cv||fxOn||reduce) return; fxOn=true;
  var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0,H=0;
  function size(){ W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); } size(); addEventListener('resize',size);
  var n=innerWidth<500?36:48, S=[], B=[];
  for(var i=0;i<n;i++) S.push({x:Math.random()*W,y:Math.random()*H,r:.7+Math.random()*1.9,speed:.12+Math.random()*.3,drift:.2+Math.random()*.5,phase:Math.random()*6.283,alpha:.3+Math.random()*.55});
  window.__burst=function(x,y){ for(var i=0;i<18;i++){ var a=Math.random()*6.283,v=.6+Math.random()*2.4; B.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.8,life:0,max:40+Math.random()*40,size:.8+Math.random()*2.2,hue:40+Math.random()*14}); } };
  (function loop(t){ requestAnimationFrame(loop); if(document.hidden) return; ctx.clearRect(0,0,W,H);
    S.forEach(function(p){ p.y-=p.speed; p.x+=Math.sin(t/1600+p.phase)*p.drift*.3; if(p.y<-6){p.y=H+6;p.x=Math.random()*W;}
      var tw=.5+.5*Math.sin(t/900+p.phase*3), a=p.alpha*(.35+.65*tw);
      ctx.save(); ctx.globalAlpha=a; ctx.shadowBlur=9; ctx.shadowColor='rgba(240,200,110,.95)'; ctx.fillStyle='rgb(244,210,135)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill(); ctx.restore(); });
    B=B.filter(function(e){return e.life<e.max});
    B.forEach(function(e){ e.life++; e.x+=e.vx; e.y+=e.vy; e.vy+=.05; e.vx*=.985; var k=1-e.life/e.max;
      ctx.save(); ctx.globalAlpha=k; ctx.shadowBlur=6; ctx.shadowColor='hsl('+e.hue+',90%,65%)'; ctx.fillStyle='hsl('+e.hue+',85%,'+(58+k*20)+'%)'; ctx.beginPath(); ctx.arc(e.x,e.y,e.size*k+.3,0,6.283); ctx.fill(); ctx.restore(); });
  })(0);
}
})();

/* keep ceremonial first lines + title on ONE line on narrow phones */
(function(){
  var FS='.paper-in .sl,.paper-in h2,.card .sh,.card h1.tt,.hero .bless';
  function fit(el){
    el.style.whiteSpace='nowrap'; el.style.fontSize='';
    var fs=parseFloat(getComputedStyle(el).fontSize), n=0;
    var r=document.createRange(); r.selectNodeContents(el);
    function cw(){ var a=el.getBoundingClientRect().width, b=0; for(var k=0;k<el.childNodes.length;k++){ r.selectNode(el.childNodes[k]); var q=r.getBoundingClientRect(); b=Math.max(b,q.width); } var rr=document.createRange(); rr.selectNodeContents(el); var all=rr.getBoundingClientRect().width; return Math.max(all,b); }
    var lim=function(){ var par=el.parentElement, c=getComputedStyle(par); return (par.clientWidth-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight))*.96; };
    while(cw()>lim() && fs>8.5 && n++<60){ fs-=.5; el.style.fontSize=fs+'px'; }
  }
  function fitAll(){ var l=document.querySelectorAll(FS); for(var i=0;i<l.length;i++) fit(l[i]); }
  fitAll();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitAll);
  addEventListener('load',fitAll); addEventListener('resize',fitAll);
})();
