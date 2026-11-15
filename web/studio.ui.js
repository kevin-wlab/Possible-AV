(function(){var p=location.pathname.replace(/\/$/,'')||'/',m={'/':'/','/services':'/services','/audio':'/services','/displays':'/services','/projection':'/services','/lighting':'/services','/fabrication':'/services','/networks':'/services','/live-video':'/services','/interactive':'/services','/logistics':'/services','/work':'/work','/about':'/about'},t=m[p];document.querySelectorAll('.nav .links a').forEach(function(a){a.classList.toggle('cur',a.getAttribute('href')===t);});})();
(function(){var n=document.querySelector('.nav'),b=document.getElementById('menuBtn');function set(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o);}b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();set(!n.classList.contains('open'));});document.addEventListener('click',function(e){if(!n.contains(e.target)||e.target.closest('.links a'))set(false);});})();
(function(){var d=document.documentElement,w=window,n=navigator,me=document.currentScript;
function lite(why){if(w.__pavLite)return;w.__pavLite=why;d.classList.add('lite');scrollTo(0,0);}
w.__pavGoLite=lite;var gl=null;try{var c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl');}catch(e){}
var slow=!gl||(n.connection&&n.connection.saveData)||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||/[?&#]lite\b/.test(location.search+location.hash);
if(slow){lite(!gl?'nogl':'device');return;}
var f=0,t0=0,tl=0,ready=0;w.__pavTick=function(){var t=performance.now();if(!ready){ready=1;w.__pavReady=1;}if(tl&&t-tl>400)f=0;tl=t;f++;if(f===30)t0=t;if(f===120){if((t-t0)/90>55)lite('fps');w.__pavTick=null;}};
setTimeout(function(){if(!w.__pavReady)lite('timeout');},6000);
var s=document.createElement('script');s.type='module';s.src=(me&&me.src||'').replace(/\.ui\.js(\?.*)?$/,'.js');document.body.appendChild(s);})();
