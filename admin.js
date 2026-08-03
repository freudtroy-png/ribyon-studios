/* ═══════════════════════════════════════════════════════════
   Ribyon CMS v4 — Ink & Ember
   Libs: Chart.js, SortableJS, Quill.js
   ═══════════════════════════════════════════════════════════ */
const PW='admin123',KEY='rs_data';
const API='https://ribyon-cms-api.freudtroy.workers.dev';
const SITE_URL='https://ribyon-studios.vercel.app';
const ROLES=['superadmin','admin','editor','viewer'];
const ROLE_RANK={'superadmin':4,'admin':3,'editor':2,'viewer':1};

const I={
dash:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/><rect x="9" y="9" width="5.5" height="5.5" rx="1"/></svg>',
page:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7"/></svg>',
svc:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 3.5l3 2.5-3 2.5M13.5 12.5h-6M13.5 8.5h-6M13.5 4.5h-6"/></svg>',
brief:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M5.5 8h5M8 5.5v5"/></svg>',
client:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>',
blog:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2.5h10v11H3z"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/></svg>',
image:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><circle cx="5.5" cy="6" r="1.5"/><path d="M2 12l3-3 2 2 3-3 4 4"/></svg>',
inbox:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.5 8.5h3.5l1 2h4l1-2h3.5"/><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/></svg>',
alert:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 11v.5"/></svg>',
invoice:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 1.5v13l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5V1.5H3z"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/></svg>',
settings:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.5 3.5l-1.5 1.5M5 11L3.5 12.5M12.5 12.5L11 11M5 5L3.5 3.5"/></svg>',
projects:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="5.5" rx="1"/><rect x="2" y="9.5" width="5.5" height="4.5" rx="1"/><rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1"/></svg>',
chart:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 13.5h12M4 10.5l3-5 3 3 4-6"/></svg>',
activity:'<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8h3l2 5 2-10 2 5 3-2"/></svg>',
eye:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3.5C4.5 3.5 1.5 8 1.5 8s3 4.5 6.5 4.5S14.5 8 14.5 8s-3-4.5-6.5-4.5z"/><circle cx="8" cy="8" r="2"/></svg>',
plus:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg>',
trash:'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 4.5h11M5.5 4.5V3a1 1 0 011-1h3a1 1 0 011 1v1.5M6.5 7.5v4M9.5 7.5v4M3.5 4.5l.8 9a1 1 0 001 .9h5.4a1 1 0 001-.9l.8-9"/></svg>',
close:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
menu:'<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M2 8h12M2 12h12"/></svg>',
upload:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10.5v-8M5 5.5l3-3 3 3"/><path d="M2.5 9.5v3a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-3"/></svg>',
check:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3.5 3.5L13 5"/></svg>',
link:'<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 9l-2 2a2.5 2.5 0 103.5 3.5L12 11"/><path d="M9 7l2-2a2.5 2.5 0 00-3.5-3.5L4 5"/></svg>',
empty:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="22" height="18" rx="2"/><path d="M3 10.5h22"/><circle cx="9" cy="17" r="1.5"/><circle cx="13" cy="17" r="1.5"/></svg>',
search:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3.5 3.5"/></svg>',
bell:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5A4.5 4.5 0 003.5 6v2l-1 2.5h11L12.5 8V6A4.5 4.5 0 008 1.5z"/><path d="M6 12.5a2 2 0 004 0"/></svg>',
download:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5v9M4.5 7l3.5 3.5L11.5 7"/><path d="M2.5 11v2.5a1 1 0 001 1h9a1 1 0 001-1V11"/></svg>',
mail:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 4.5l6.5 4.5 6.5-4.5"/></svg>',
duplicate:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="10.5" height="10.5" rx="1"/><path d="M1.5 11.5V2a.5.5 0 01.5-.5h9"/></svg>',
drag:'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h6M5 8h6M5 12h6"/></svg>',
edit:'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11.5 2l2.5 2.5L5 13.5H2.5V11L11.5 2z"/></svg>',
key:'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="8" r="3.5"/><path d="M8.5 8H14v3h-2.5v-1.5"/></svg>'
};

/* ─── Defaults ─── */
const DEFAULTS={
settings:{currency:'KSh',taxRate:16,companyName:'Ribyon Studios',companyEmail:'hello@ribyon.com',companyPhone:'+254 700 000 000'},
pages:{home:{hero:{headline:"Brand direction for leaders who refuse to be generic.",highlight:"who refuse to be generic.",subtitle:"Brand direction and design. Built in Nairobi. For the world.",statNum:"50",statSuffix:"+",statLabel:"brands built — Nairobi to New York"},cta:{title:"Ready to build a brand that stands out?",subtitle:"30-minute call. No pitch. Just honest advice.",btn:"Start a conversation"}}},
services:[
{id:1,num:"01",title:"Brand Identity",conviction:"A visual language that knows what it stands for.",tags:["Positioning","Color & Type","Guidelines","Launch"],image:"",order:0},
{id:2,num:"02",title:"Web & Digital",conviction:"Websites that don't look like templates — because they aren't.",tags:["UI/UX","Front-end","Performance","CMS"],image:"",order:1},
{id:3,num:"03",title:"Brand Strategy",conviction:"Clarity that makes every decision obvious.",tags:["Research","Positioning","Messaging","Architecture"],image:"",order:2},
{id:4,num:"04",title:"Content Systems",conviction:"A system for everything you publish.",tags:["Templates","Guidelines","Tone","Scalability"],image:"",order:3}
],
clients:[
{id:1,name:"Galactic Core",logo:"LOGO STRIP FILES/GC LONG WHITE.png",email:"",phone:"",notes:""},
{id:2,name:"Technologies",logo:"LOGO STRIP FILES/ICON WHITE+ORANGE (HORIZONTAL) TECHNOLOGIES.png",email:"",phone:"",notes:""},
{id:3,name:"Pixel Plus",logo:"LOGO STRIP FILES/PIXEL PLUS LOGO.png",email:"",phone:"",notes:""},
{id:4,name:"Pollant Travels",logo:"LOGO STRIP FILES/POLLANT TRAVELS.png",email:"",phone:"",notes:""},
{id:5,name:"Safari Yetu",logo:"LOGO STRIP FILES/SAFARI YETU LOGO WHITE.png",email:"",phone:"",notes:""}
],
portfolio:[
{id:1,name:"Tronavo",category:"Rebrand & Brand System",image:"",desc:"Full brand overhaul.",url:"",order:0},
{id:2,name:"Galactic Core",category:"Web Design",image:"",desc:"Custom web experience.",url:"",order:1},
{id:3,name:"Safari Yetu",category:"Social Content",image:"",desc:"Content system and templates.",url:"",order:2},
{id:4,name:"Pixelplus",category:"Identity",image:"",desc:"Brand identity and visual language.",url:"",order:3},
{id:5,name:"Tybrite POS",category:"Product & Retail",image:"",desc:"POS system branding.",url:"",order:4},
{id:6,name:"Pollant Travels",category:"Strategy",image:"",desc:"Brand strategy for a travel company.",url:"",order:5}
],
tenets:[{id:1,num:"01",label:"Strategy first",isStat:false},{id:2,num:"02",label:"You own the work",isStat:false},{id:3,num:"03",label:"Fixed scope",isStat:false},{id:4,num:"04",label:"Stage-fit",isStat:false},{id:5,num:"05",label:"98% Return rate",isStat:true}],
manifesto:[{id:1,num:"01",quote:"Most agencies sell you a process. We sell you a <em>point of view</em>.",text:"Strategy without conviction is just decoration."},{id:2,num:"02",quote:"If your brand looks like it was made in a template, <em>it was.</em>",text:"We don't do cookie-cutter."},{id:3,num:"03",quote:"Great branding isn't about being liked. <em>It's about being recognised.</em>",text:"A brand that tries to please everyone ends up invisible."}],
tiers:[{id:1,label:"Starter",name:"Brand Kit",desc:"For founders who need to show up looking like they've already arrived.",price:"KSh 35k",cta:"Make it happen →",focus:false},{id:2,label:"Growth",name:"Brand System",desc:"For teams that outgrew their first logo.",price:"KSh 75k",cta:"Build the system →",focus:true},{id:3,label:"Premium",name:"Brand Platform",desc:"For organisations that need the full arsenal.",price:"Custom",cta:"Start a conversation →",focus:false}],
blog:[{id:1,title:"Why brand direction matters more than a logo",slug:"brand-direction-matters",excerpt:"A logo is a mark. A brand is a direction.",date:"2026-03-15",status:"published",body:"Full article content here...",category:"Branding",tags:[],seoDesc:""},{id:2,title:"Building brands in Nairobi for the world",slug:"nairobi-brands-world",excerpt:"How East African creativity is shaping global brand design.",date:"2026-04-02",status:"published",body:"",category:"Strategy",tags:[],seoDesc:""},{id:3,title:"The fixed scope advantage",slug:"fixed-scope-advantage",excerpt:"Why unlimited revisions are a trap.",date:"2026-05-10",status:"draft",body:"",category:"Process",tags:[],seoDesc:""}],
inquiries:[],complaints:[],invoices:[],media:[],projects:[],activity:[],notifications:[]
};

/* ─── Storage ─── */
function get(){try{var d=localStorage.getItem(KEY);if(!d)return JSON.parse(JSON.stringify(DEFAULTS));var data=JSON.parse(d);migrate(data);return data;}catch(e){return JSON.parse(JSON.stringify(DEFAULTS));}}
function set(d){localStorage.setItem(KEY,JSON.stringify(d));showSaveStatus('local');schedulePush();}

/* ─── Cloud Sync (Cloudflare Worker + D1 + R2) ─── */
var _syncTimer=null,_lastSyncedAt=0;
function apiAuth(){return{'Authorization':'Bearer '+PW,'Content-Type':'application/json'};}
function cloudEnabled(){try{return localStorage.getItem('rs_cloud')==='1';}catch(e){return false;}}
function setCloudEnabled(on){try{localStorage.setItem('rs_cloud',on?'1':'0');}catch(e){}}
async function pushCloud(d){try{showSaveStatus('syncing');var r=await fetch(API+'/api/data',{method:'PUT',headers:apiAuth(),body:JSON.stringify({data:d||get()})});_lastSyncedAt=Date.now();if(r.ok)showSaveStatus('synced');else showSaveStatus('local');return r.ok;}catch(e){showSaveStatus('local');return false;}}
async function pullCloud(){try{var r=await fetch(API+'/api/data',{method:'GET',headers:apiAuth()});if(!r.ok)return null;var j=await r.json();return j.data||null;}catch(e){return null;}}
function schedulePush(){if(!cloudEnabled())return;clearTimeout(_syncTimer);_syncTimer=setTimeout(function(){pushCloud().then(function(ok){if(!ok)toast('Cloud sync failed');});},1200);}
async function syncFromCloud(){var d=await pullCloud();if(d){migrate(d);set(d);renderApp();toast('Loaded from cloud');return true;}return false;}
function migrate(d){  if(!d.projects)d.projects=[];if(!d.activity)d.activity=[];if(!d.notifications)d.notifications=[];if(!d.settings)d.settings=DEFAULTS.settings;
  (d.services||[]).forEach(function(s,i){if(s.order===undefined)s.order=i;});
  (d.portfolio||[]).forEach(function(p,i){if(p.order===undefined)p.order=i;});
  (d.clients||[]).forEach(function(c){if(c.email===undefined)c.email='';if(c.phone===undefined)c.phone='';if(c.notes===undefined)c.notes='';});
  (d.blog||[]).forEach(function(b){if(b.category===undefined)b.category='';if(b.tags===undefined)b.tags=[];if(b.seoDesc===undefined)b.seoDesc='';});
  (d.invoices||[]).forEach(function(i){if(!i.items)i.items=[{desc:i.desc||'Service',qty:1,rate:parseFloat(i.amount)||0}];if(i.payments===undefined)i.payments=[];if(i.balance===undefined)i.balance=calcBalance(i);if(i.dueDate===undefined)i.dueDate=i.date;if(i.currency===undefined)i.currency='KSh';if(i.notes===undefined)i.notes='';if(i.terms===undefined)i.terms='';});
}
function calcBalance(inv){var total=inv.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0);var paid=(inv.payments||[]).reduce(function(s,p){return s+(parseFloat(p.amount)||0);},0);return Math.max(0,total-paid);}
function id(items){var m=0;items.forEach(function(i){if(i.id>m)m=i.id;});return m+1;}
function pad(n){return String(n).padStart(2,'0');}
function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function now(){return new Date().toISOString().split('T')[0];}
function fmtDate(d){if(!d)return '';var p=d.split('-');return p[1]+'/'+p[2]+'/'+p[0];}
function g(id){return document.getElementById(id)&&document.getElementById(id).value||'';}

/* ─── Activity & Notifications ─── */
function logActivity(action,detail){var data=get();if(!data.activity)data.activity=[];data.activity.unshift({id:id(data.activity),action:action,detail:detail,date:now(),time:new Date().toTimeString().slice(0,5)});if(data.activity.length>100)data.activity=data.activity.slice(0,100);set(data);}
function addNotif(text){var data=get();if(!data.notifications)data.notifications=[];data.notifications.unshift({id:id(data.notifications),text:text,date:now(),read:false});if(data.notifications.length>50)data.notifications=data.notifications.slice(0,50);set(data);updateNotifBadge();}
function updateNotifBadge(){var data=get();var n=(data.notifications||[]).filter(function(x){return !x.read;}).length;var dot=document.getElementById('notifDot');if(dot)dot.style.display=n>0?'block':'none';}

/* ─── Toast & Save status ─── */
var _toastTimer;
function toast(msg){var t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}clearTimeout(_toastTimer);t.textContent=msg;t.classList.add('show');_toastTimer=setTimeout(function(){t.classList.remove('show');},2200);}
var _saveStatusTimer;
function showSaveStatus(state){
  var el=document.getElementById('saveStatus');if(!el)return;
  var labels={local:'Saved locally',syncing:'Saving…',synced:'✓ Saved to cloud'};
  el.textContent=labels[state]||'';
  el.className='save-status save-'+state;
  el.style.display='block';
  clearTimeout(_saveStatusTimer);
  if(state!=='syncing'){_saveStatusTimer=setTimeout(function(){el.style.display='none';},2600);}
}

/* ─── Login & Roles ─── */
function setAuth(token,user){try{if(token)localStorage.setItem('rs_token',token);else localStorage.removeItem('rs_token');localStorage.setItem('rs_user',JSON.stringify(user||{}));}catch(e){}}
function getToken(){try{return localStorage.getItem('rs_token')||'';}catch(e){return '';}}
function currentUser(){try{var u=localStorage.getItem('rs_user');return u?JSON.parse(u):{};}catch(e){return {};}}
function role(){return currentUser().role||'viewer';}
function canEdit(){return ROLE_RANK[role()]>=ROLE_RANK.editor;}
function canManage(){return ROLE_RANK[role()]>=ROLE_RANK.admin;}
function isSuper(){return role()==='superadmin';}
function apiAuth(){return{'Authorization':'Bearer '+(getToken()||PW),'Content-Type':'application/json'};}

function login(u,p){
  if(!u||!p){document.getElementById('loginError').textContent='Enter email and password';return;}
  fetch(API+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:u,password:p})})
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
    .then(function(res){
      if(res.ok&&res.j.token){
        setAuth(res.j.token,res.j.user);localStorage.setItem('rs_auth','1');renderApp();
        addNotif('Signed in as '+res.j.user.username+' ('+res.j.user.role+')');
        if(cloudEnabled()){setTimeout(function(){syncFromCloud();},600);}else{document.getElementById('loginError').textContent='';}
        return;
      }
      if(!cloudEnabled()&&p===PW){localStorage.setItem('rs_auth','1');setAuth('',{username:'admin',role:'superadmin'});renderApp();document.getElementById('loginError').textContent='';return;}
      document.getElementById('loginError').textContent=res.j.error||'Incorrect credentials';
    })
    .catch(function(){
      if(p===PW){localStorage.setItem('rs_auth','1');setAuth('',{username:'admin',role:'superadmin'});renderApp();document.getElementById('loginError').textContent='';return;}
      document.getElementById('loginError').textContent='Cannot reach server';
    });
}
function logout(){localStorage.removeItem('rs_auth');localStorage.removeItem('rs_token');renderApp();}

function renderApp(){var u=localStorage.getItem('rs_user');if(localStorage.getItem('rs_auth')==='1'&&u)renderAdmin();else renderLogin();}
function renderLogin(){document.getElementById('app').innerHTML='<div class="login-screen"><div class="login-box"><img src="logo.png" alt="Ribyon Studios" class="login-logo"><div class="login-title">Ribyon Studio</div><p class="login-sub">Content Management</p><input type="email" id="loginUser" placeholder="Email" autocomplete="email" onkeydown="if(event.key===\'Enter\')login(document.getElementById(\'loginUser\').value,document.getElementById(\'loginPass\').value)"><input type="password" id="loginPass" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')login(document.getElementById(\'loginUser\').value,this.value)"><button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem" onclick="login(document.getElementById(\'loginUser\').value,document.getElementById(\'loginPass\').value)">Sign in</button><p id="loginError" class="login-error"></p></div></div>';}

function renderAdmin(){
  var data=get();var u=currentUser();
  var canE=canEdit(),canM=canManage(),sup=isSuper();
  document.getElementById('app').innerHTML=
    '<div class="app ready">'+
    '<div class="sidebar-overlay" id="sideOverlay" onclick="toggleSidebar()"></div>'+
    '<button class="mobile-toggle" onclick="toggleSidebar()">'+I.menu+'</button>'+
    '<aside class="sidebar" id="sidebar"><div class="sidebar-head"><img src="logo.png" alt="Ribyon" class="side-logo"><span>CMS</span></div>'+
    '<nav class="sidebar-nav" id="sideNav">'+
    '<div class="nav-label">Manage</div>'+
    '<a href="#" onclick="nav(\'dash\')" data-sec="dash">'+I.dash+'Dashboard</a>'+
    '<a href="#" onclick="nav(\'pages\')" data-sec="pages">'+I.page+'Pages</a>'+
    '<a href="#" onclick="nav(\'services\')" data-sec="services">'+I.svc+'Services<span class="badge">'+(data.services||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'portfolio\')" data-sec="portfolio">'+I.brief+'Portfolio<span class="badge">'+(data.portfolio||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'clients\')" data-sec="clients">'+I.client+'Clients<span class="badge">'+(data.clients||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'blog\')" data-sec="blog">'+I.blog+'Blog<span class="badge">'+(data.blog||[]).length+'</span></a>'+
    '<div class="nav-label">Operations</div>'+
    '<a href="#" onclick="nav(\'projects\')" data-sec="projects">'+I.projects+'Projects<span class="badge">'+(data.projects||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'invoices\')" data-sec="invoices">'+I.invoice+'Finance<span class="badge">'+(data.invoices||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'media\')" data-sec="media">'+I.image+'Media<span class="badge">'+(data.media||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'inquiries\')" data-sec="inquiries">'+I.inbox+'Inquiries<span class="badge" id="inqBadge">'+(data.inquiries||[]).length+'</span></a>'+
    '<a href="#" onclick="nav(\'complaints\')" data-sec="complaints">'+I.alert+'Complaints<span class="badge">'+(data.complaints||[]).length+'</span></a>'+
    '<div class="nav-label">Insights</div>'+
    '<a href="#" onclick="nav(\'analytics\')" data-sec="analytics">'+I.chart+'Analytics</a>'+
    '<a href="#" onclick="nav(\'activity\')" data-sec="activity">'+I.activity+'Activity</a>'+
    (sup?'<a href="#" onclick="nav(\'users\')" data-sec="users">'+I.client+'Users</a>':'')+
    '<a href="#" onclick="nav(\'settings\')" data-sec="settings">'+I.settings+'Settings</a>'+
    '</nav>'+
    '<div class="sidebar-foot"><a href="'+SITE_URL+'" target="_blank" rel="noopener">'+I.link+' View site</a><a href="#" onclick="logout()">Sign out</a></div></aside>'+
    '<header class="topbar"><div class="topbar-left"><div class="global-search" id="globalSearchWrap">'+
    '<span class="gs-ico">'+I.search+'</span>'+
    '<input type="text" id="globalSearch" placeholder="Search anything..." oninput="gsSearch(this.value)" onblur="setTimeout(function(){document.getElementById(\'gsResults\').classList.remove(\'open\')},200)" onfocus="gsSearch(this.value)">'+
    '<div class="gs-results" id="gsResults"></div></div></div>'+
    '<div class="topbar-right"><span class="save-status" id="saveStatus" style="display:none"></span>'+
    '<button class="tb-btn" onclick="toggleNotifPanel()">'+I.bell+'<span class="tb-dot" id="notifDot"></span></button>'+
    '<div class="tb-avatar" onclick="nav(\'settings\')" title="'+(u.role||'')+'">'+(u.username?u.username.charAt(0).toUpperCase():'A')+'</div></div></header>'+
    '<main class="main" id="mainArea"></main></div>';
  updateNotifBadge();nav('dash');
}

/* ─── Notifications ─── */
function toggleNotifPanel(){
  var p=document.getElementById('notifPanel');
  if(p){p.classList.toggle('open');return;}
  var data=get();var items=data.notifications||[];
  p=document.createElement('div');p.id='notifPanel';p.className='notif-panel open';
  p.innerHTML='<div class="notif-panel-hd"><h3>Notifications</h3><button class="modal-close" onclick="this.closest(\'.notif-panel\').classList.remove(\'open\')">'+I.close+'</button></div><div class="notif-body">'+
    (items.length?items.map(function(n){return '<div class="notif-item'+(n.read?'':' unread')+'" onclick="markNotifRead('+n.id+')"><div class="notif-text">'+esc(n.text)+'</div><div class="notif-time">'+fmtDate(n.date)+'</div></div>';}).join(''):'<div class="empty">'+I.empty+'<p>No notifications</p></div>')+'</div>';
  document.body.appendChild(p);
}
function markNotifRead(id){var data=get();(data.notifications||[]).forEach(function(n){if(n.id===id)n.read=true;});set(data);updateNotifBadge();}

/* ─── Global Search ─── */
function gsSearch(val){var r=document.getElementById('gsResults');if(!val.trim()){r.classList.remove('open');return;}var data=get();var q=val.toLowerCase().trim();var results=[];(data.services||[]).forEach(function(s){if(s.title.toLowerCase().includes(q))results.push({label:s.title,sec:'Services',nav:'services'});});(data.portfolio||[]).forEach(function(p){if(p.name.toLowerCase().includes(q))results.push({label:p.name,sec:'Portfolio',nav:'portfolio'});});(data.clients||[]).forEach(function(c){if(c.name.toLowerCase().includes(q))results.push({label:c.name,sec:'Clients',nav:'clients'});});(data.blog||[]).forEach(function(b){if(b.title.toLowerCase().includes(q))results.push({label:b.title,sec:'Blog',nav:'blog'});});(data.invoices||[]).forEach(function(i){if((i.number||'').toLowerCase().includes(q)||(i.client||'').toLowerCase().includes(q))results.push({label:i.number+' — '+i.client,sec:'Finance',nav:'invoices'});});(data.projects||[]).forEach(function(p){if(p.title&&p.title.toLowerCase().includes(q))results.push({label:p.title,sec:'Projects',nav:'projects'});});if(results.length>8)results=results.slice(0,8);r.innerHTML=results.length?results.map(function(res){return '<div class="gs-item" onclick="nav(\''+res.nav+'\')">'+esc(res.label)+'<span class="gs-sec">'+res.sec+'</span></div>';}).join(''):'<div class="gs-empty">No results</div>';r.classList.add('open');}

/* ─── Nav ─── */
var _currentSection='';
function nav(sec){
  _currentSection=sec;document.querySelectorAll('.sidebar-nav a').forEach(function(a){a.classList.remove('active');});
  var link=document.querySelector('.sidebar-nav a[data-sec="'+sec+'"]');if(link)link.classList.add('active');
  if(window.innerWidth<=860){document.getElementById('sidebar').classList.remove('open');document.getElementById('sideOverlay').classList.remove('show');}
  var main=document.getElementById('mainArea');
  var fns={dash:renderDashboard,pages:renderPages,services:renderServices,portfolio:renderPortfolio,clients:renderClients,blog:renderBlog,projects:renderProjects,invoices:renderInvoices,media:renderMedia,inquiries:renderInquiries,complaints:renderComplaints,analytics:renderAnalytics,activity:renderActivity,users:renderUsers,settings:renderSettings};
  if(fns[sec])fns[sec](main);
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sideOverlay').classList.toggle('show');}

/* ═══════════════════════════════════════════════════════
   DASHBOARD (Chart.js)
   ═══════════════════════════════════════════════════════ */
function renderDashboard(main){
  var data=get();
  var inqNew=(data.inquiries||[]).filter(function(i){return i.status==='new';}).length;
  var invTotal=(data.invoices||[]).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
  var invPaid=(data.invoices||[]).filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0);
  var projActive=(data.projects||[]).filter(function(p){return p.status!=='done';}).length;
  var publishedBlog=(data.blog||[]).filter(function(b){return b.status==='published';}).length;

  main.innerHTML=
    '<div class="page active">'+
    '<div class="page-hd"><div><h2>Dashboard</h2><p>Studio overview</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="nav(\'invoices\')">'+I.plus+' New invoice</button><button class="btn btn-ghost btn-sm" onclick="nav(\'projects\')">'+I.eye+' Projects</button></div></div>'+
    '<div class="quick-actions"><button class="qa-btn" onclick="nav(\'invoices\')">'+I.plus+' Invoice</button><button class="qa-btn" onclick="nav(\'blog\')">'+I.plus+' Blog post</button><button class="qa-btn" onclick="nav(\'services\')">'+I.plus+' Service</button><button class="qa-btn" onclick="nav(\'portfolio\')">'+I.plus+' Project</button></div>'+
    '<div class="stats">'+
    '<div class="stat"><div class="stat-num">KSh '+(invPaid?invPaid.toLocaleString():'0')+'</div><div class="stat-label">Revenue</div><div class="stat-sub">Collected</div></div>'+
    '<div class="stat"><div class="stat-num">'+inqNew+'</div><div class="stat-label">Inquiries</div><div class="stat-sub">New</div></div>'+
    '<div class="stat"><div class="stat-num">'+projActive+'</div><div class="stat-label">Active</div><div class="stat-sub">Projects</div></div>'+
    '<div class="stat"><div class="stat-num">'+publishedBlog+' / '+(data.blog||[]).length+'</div><div class="stat-label">Blog</div><div class="stat-sub">Published</div></div>'+
    '<div class="stat"><div class="stat-num">'+(data.invoices||[]).length+'</div><div class="stat-label">Invoices</div><div class="stat-sub">KSh '+invTotal.toLocaleString()+'</div></div>'+
    '<div class="stat"><div class="stat-num">'+(data.media||[]).length+'</div><div class="stat-label">Media</div><div class="stat-sub">Files</div></div>'+
    '</div>'+
    '<div class="dash-grid">'+
    '<div class="dash-card dash-full"><div class="dash-card-hd"><strong>Revenue (6 months)</strong></div><div class="dash-card-body"><div class="chart-wrap"><canvas id="dashChart"></canvas></div></div></div>'+
    '<div class="dash-card"><div class="dash-card-hd"><strong>Recent Inquiries</strong><span class="dash-link" onclick="nav(\'inquiries\')">All →</span></div><div class="dash-card-body" id="dashInq">'+inqList(data)+'</div></div>'+
    '<div class="dash-card"><div class="dash-card-hd"><strong>Recent Invoices</strong><span class="dash-link" onclick="nav(\'invoices\')">All →</span></div><div class="dash-card-body" id="dashInv">'+invList(data)+'</div></div>'+
    '</div></div>';
  renderDashChart(data);
}
function inqList(data){var items=(data.inquiries||[]).slice(-5).reverse();if(!items.length)return '<div class="empty">'+I.empty+'<p>No inquiries</p></div>';return items.map(function(i){return '<div class="dash-list-item"><span>'+esc(i.name)+'</span><span class="status status-'+(i.status==='new'?'new':'read')+'">'+i.status+'</span></div>';}).join('');}
function invList(data){var items=(data.invoices||[]).slice(-5).reverse();if(!items.length)return '<div class="empty">'+I.empty+'<p>No invoices</p></div>';return items.map(function(i){return '<div class="dash-list-item"><span>'+esc(i.client||i.number)+'</span><span style="font-weight:600">KSh '+(parseFloat(i.total||i.amount)||0).toLocaleString()+'</span></div>';}).join('');}

var _chartInstances={};
function renderDashChart(data){
  var canvas=document.getElementById('dashChart');if(!canvas)return;
  var months=[];var nowD=new Date();
  for(var m=5;m>=0;m--){var d=new Date(nowD.getFullYear(),nowD.getMonth()-m,1);var mk=d.toISOString().slice(0,7);var ml=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];var rev=(data.invoices||[]).filter(function(i){return i.date&&i.date.slice(0,7)===mk&&i.status==='paid';}).reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0);months.push({lbl:ml,rev:rev});}
  if(_chartInstances.dash)_chartInstances.dash.destroy();
  var ctx=canvas.getContext('2d');
  _chartInstances.dash=new Chart(ctx,{
    type:'bar',
    data:{labels:months.map(function(m){return m.lbl;}),datasets:[{label:'Revenue (KSh)',data:months.map(function(m){return m.rev;}),backgroundColor:'rgba(249,115,22,0.22)',borderColor:'#f97316',borderWidth:2,borderRadius:5,pointRadius:0}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(10,9,8,0.06)'},ticks:{font:{size:10}}},x:{grid:{display:false},ticks:{font:{size:10}}}}}
  });
}

/* ═══════════════════════════════════════════════════════
   PAGES
   ═══════════════════════════════════════════════════════ */
function renderPages(main){var data=get();var h=data.pages.home.hero;var cta=data.pages.home.cta;main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Pages</h2><p>Home page content</p></div><div class="page-hd-actions"><button class="btn btn-ghost btn-sm" onclick="restorePages()">Reset</button><button class="btn btn-primary btn-sm" onclick="savePages()">'+I.check+' Save</button></div></div><div class="card"><div class="card-hd"><strong>Hero Section</strong></div><div class="card-body"><div class="full"><label>Headline</label><input type="text" id="pgHeroHead" value="'+esc(h.headline)+'"></div><div class="row"><div><label>Highlight</label><input type="text" id="pgHeroHL" value="'+esc(h.highlight)+'"></div><div><label>Subtitle</label><input type="text" id="pgHeroSub" value="'+esc(h.subtitle)+'"></div></div><div class="row three"><div><label>Stat number</label><input type="text" id="pgHeroSN" value="'+esc(h.statNum)+'"></div><div><label>Suffix</label><input type="text" id="pgHeroSuf" value="'+esc(h.statSuffix)+'"></div><div><label>Label</label><input type="text" id="pgHeroSL" value="'+esc(h.statLabel)+'"></div></div></div></div><div class="card"><div class="card-hd"><strong>CTA Section</strong></div><div class="card-body"><div class="full"><label>Title</label><input type="text" id="pgCtaTitle" value="'+esc(cta.title)+'"></div><div class="row"><div><label>Subtitle</label><input type="text" id="pgCtaSub" value="'+esc(cta.subtitle)+'"></div><div><label>Button text</label><input type="text" id="pgCtaBtn" value="'+esc(cta.btn)+'"></div></div></div></div></div>';}
function savePages(){var data=get();data.pages.home.hero={headline:g('pgHeroHead'),highlight:g('pgHeroHL'),subtitle:g('pgHeroSub'),statNum:g('pgHeroSN'),statSuffix:g('pgHeroSuf'),statLabel:g('pgHeroSL')};data.pages.home.cta={title:g('pgCtaTitle'),subtitle:g('pgCtaSub'),btn:g('pgCtaBtn')};set(data);logActivity('Updated','Home page');toast('Saved');}
function restorePages(){if(!confirm('Reset page content?'))return;var d=get();d.pages=JSON.parse(JSON.stringify(DEFAULTS.pages));set(d);nav('pages');toast('Restored');}

/* ═══════════════════════════════════════════════════════
   SERVICES (SortableJS)
   ═══════════════════════════════════════════════════════ */
function renderServices(main){
  var data=get();var svcs=(data.services||[]).slice().sort(function(a,b){return (a.order||0)-(b.order||0);});
  main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Services</h2><p>'+(data.services||[]).length+' offerings</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addService()">'+I.plus+' Add</button></div></div><div id="svcList">'+svcs.map(function(s){return svcCard(s);}).join('')+'</div></div>';
  initServiceSortable();
}
function initServiceSortable(){
  var el=document.getElementById('svcList');if(!el||!window.Sortable)return;
  Sortable.create(el,{animation:200,handle:'.svc-drag',onEnd:function(){var data=get();var items=el.querySelectorAll('.card');items.forEach(function(card,i){var id=parseInt(card.id.replace('svc',''));var s=data.services.find(function(x){return x.id===id;});if(s)s.order=i;});set(data);}});
}
function svcCard(s){return '<div class="card" id="svc'+s.id+'"><div class="card-hd"><div class="card-hd-left"><span class="svc-drag" style="cursor:grab;color:var(--stone-light);font-size:0.7rem;padding:0.2rem">⠿</span><span style="font-family:var(--font-display);font-size:0.6rem;font-weight:700;color:var(--stone-light)">'+esc(s.num)+'</span><strong>'+esc(s.title)+'</strong></div><div class="card-actions"><button class="btn btn-ghost btn-sm" onclick="editService('+s.id+')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteService('+s.id+')">'+I.trash+'</button></div></div></div>';}
function editService(id){var data=get();var s=data.services.find(function(x){return x.id===id;});if(!s)return;modal('Edit Service','<div class="row"><div class="form-group"><label>Number</label><input type="text" id="medSvcNum" value="'+esc(s.num)+'"></div><div class="form-group"><label>Title</label><input type="text" id="medSvcTitle" value="'+esc(s.title)+'"></div></div><div class="form-group"><label>Conviction</label><textarea id="medSvcConv">'+esc(s.conviction)+'</textarea></div><div class="form-group"><label>Tags (comma separated)</label><input type="text" id="medSvcTags" value="'+esc((s.tags||[]).join(', '))+'"></div><div class="form-group"><label>Image URL</label><input type="text" id="medSvcImg" value="'+esc(s.image||'')+'"></div>',function(){s.num=g('medSvcNum');s.title=g('medSvcTitle');s.conviction=g('medSvcConv');s.tags=g('medSvcTags').split(',').map(function(t){return t.trim();}).filter(Boolean);s.image=g('medSvcImg');set(data);closeModal();renderServices(document.getElementById('mainArea'));logActivity('Edited service',s.title);toast('Saved');});}
function addService(){var data=get();data.services.push({id:id(data.services),num:pad(data.services.length+1),title:'New Service',conviction:'Description',tags:['Tag'],image:'',order:data.services.length});set(data);renderServices(document.getElementById('mainArea'));logActivity('Added service','New');toast('Added');}
function deleteService(id){if(!confirm('Delete?'))return;var data=get();data.services=data.services.filter(function(x){return x.id!==id;});set(data);renderServices(document.getElementById('mainArea'));updateBadge('services',data.services.length);}

/* ═══════════════════════════════════════════════════════
   PORTFOLIO
   ═══════════════════════════════════════════════════════ */
function renderPortfolio(main){var data=get();var items=(data.portfolio||[]).slice().sort(function(a,b){return (a.order||0)-(b.order||0);});main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Portfolio</h2><p>'+(data.portfolio||[]).length+' projects</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addPortfolio()">'+I.plus+' Add</button></div></div><div id="pfList">'+items.map(function(p){return pfCard(p);}).join('')+'</div></div>';}
function pfCard(p){return '<div class="card" id="pf'+p.id+'"><div class="card-hd"><div class="card-hd-left">'+(p.image?'<img src="'+esc(p.image)+'" class="card-thumb" alt="">':'')+'<strong>'+esc(p.name)+'</strong><span class="sub">'+esc(p.category)+'</span></div><div class="card-actions"><button class="btn btn-ghost btn-sm" onclick="editPortfolio('+p.id+')">Edit</button><button class="btn btn-danger btn-sm" onclick="deletePortfolio('+p.id+')">'+I.trash+'</button></div></div></div>';}
function editPortfolio(id){var data=get();var p=data.portfolio.find(function(x){return x.id===id;});if(!p)return;modal('Edit Project','<div class="row"><div class="form-group"><label>Name</label><input type="text" id="medPfName" value="'+esc(p.name)+'"></div><div class="form-group"><label>Category</label><input type="text" id="medPfCat" value="'+esc(p.category)+'"></div></div><div class="row"><div class="form-group"><label>Image URL</label><input type="text" id="medPfImg" value="'+esc(p.image||'')+'"></div><div class="form-group"><label>URL</label><input type="text" id="medPfUrl" value="'+esc(p.url||'')+'"></div></div><div class="form-group"><label>Description</label><textarea id="medPfDesc">'+esc(p.desc||'')+'</textarea></div>',function(){p.name=g('medPfName');p.category=g('medPfCat');p.image=g('medPfImg');p.url=g('medPfUrl');p.desc=g('medPfDesc');set(data);closeModal();renderPortfolio(document.getElementById('mainArea'));logActivity('Edited project',p.name);toast('Saved');});}
function addPortfolio(){var data=get();data.portfolio.push({id:id(data.portfolio),name:'New Project',category:'Category',image:'',desc:'',url:'',order:data.portfolio.length});set(data);renderPortfolio(document.getElementById('mainArea'));toast('Added');}
function deletePortfolio(id){if(!confirm('Delete?'))return;var data=get();data.portfolio=data.portfolio.filter(function(x){return x.id!==id;});set(data);renderPortfolio(document.getElementById('mainArea'));updateBadge('portfolio',data.portfolio.length);}

/* ═══════════════════════════════════════════════════════
   CLIENTS
   ═══════════════════════════════════════════════════════ */
function renderClients(main){var data=get();main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Clients</h2><p>'+(data.clients||[]).length+' clients</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addClient()">'+I.plus+' Add</button></div></div><div id="clList">'+(data.clients||[]).map(function(c){return clCard(c);}).join('')+'</div></div>';}
function clCard(c){return '<div class="card" id="cl'+c.id+'"><div class="card-hd"><div class="card-hd-left">'+(c.logo?'<img src="'+esc(c.logo)+'" class="card-thumb" style="object-fit:contain" alt="">':'')+'<strong>'+esc(c.name)+'</strong>'+(c.email?'<span class="sub">'+esc(c.email)+'</span>':'')+'</div><div class="card-actions"><button class="btn btn-ghost btn-sm" onclick="editClient('+c.id+')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteClient('+c.id+')">'+I.trash+'</button></div></div></div>';}
function editClient(id){var data=get();var c=data.clients.find(function(x){return x.id===id;});if(!c)return;modal('Edit Client','<div class="row"><div class="form-group"><label>Name</label><input type="text" id="medClName" value="'+esc(c.name)+'"></div><div class="form-group"><label>Logo path</label><input type="text" id="medClLogo" value="'+esc(c.logo)+'"></div></div><div class="row"><div class="form-group"><label>Email</label><input type="email" id="medClEmail" value="'+esc(c.email||'')+'"></div><div class="form-group"><label>Phone</label><input type="text" id="medClPhone" value="'+esc(c.phone||'')+'"></div></div><div class="form-group"><label>Notes</label><textarea id="medClNotes">'+esc(c.notes||'')+'</textarea></div>',function(){c.name=g('medClName');c.logo=g('medClLogo');c.email=g('medClEmail');c.phone=g('medClPhone');c.notes=g('medClNotes');set(data);closeModal();renderClients(document.getElementById('mainArea'));toast('Saved');});}
function addClient(){var data=get();data.clients.push({id:id(data.clients),name:'New Client',logo:'',email:'',phone:'',notes:''});set(data);renderClients(document.getElementById('mainArea'));toast('Added');}
function deleteClient(id){if(!confirm('Delete?'))return;var data=get();data.clients=data.clients.filter(function(x){return x.id!==id;});set(data);renderClients(document.getElementById('mainArea'));updateBadge('clients',data.clients.length);}

/* ═══════════════════════════════════════════════════════
   BLOG (Quill.js)
   ═══════════════════════════════════════════════════════ */
var _quillInstance=null;
function renderBlog(main){var data=get();main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Blog</h2><p>'+(data.blog||[]).length+' posts</p></div><div class="page-hd-actions"><div class="filter-bar" style="margin-bottom:0"><button class="btn btn-ghost btn-sm active" onclick="filterBlog(\'all\',this)">All</button><button class="btn btn-ghost btn-sm" onclick="filterBlog(\'published\',this)">Published</button><button class="btn btn-ghost btn-sm" onclick="filterBlog(\'draft\',this)">Drafts</button></div><button class="btn btn-primary btn-sm" onclick="addBlog()">'+I.plus+' New post</button></div></div><div id="blogList">'+renderBlogItems(data.blog||[],'all')+'</div></div>';}
function renderBlogItems(items,filter){var f=filter==='all'?items:items.filter(function(b){return b.status===filter;});if(!f.length)return emptyState('No posts');return f.slice().reverse().map(function(b){return '<div class="card" id="bl'+b.id+'"><div class="card-hd"><div class="card-hd-left"><strong>'+esc(b.title)+'</strong><span class="sub">'+fmtDate(b.date)+(b.category?' · '+esc(b.category):'')+'</span></div><div style="display:flex;align-items:center;gap:0.5rem"><span class="status status-'+(b.status==='published'?'paid':'draft')+'">'+b.status+'</span><button class="btn btn-ghost btn-sm" onclick="editBlog('+b.id+')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteBlog('+b.id+')">'+I.trash+'</button></div></div></div>';}).join('');}
function filterBlog(f,btn){document.querySelectorAll('#mainArea .filter-bar .btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var data=get();document.getElementById('blogList').innerHTML=renderBlogItems(data.blog||[],f);}

function editBlog(id){
  var data=get();var b=data.blog.find(function(x){return x.id===id;});if(!b)return;
  if(_quillInstance){_quillInstance.destroy();_quillInstance=null;}
  modal('Edit Post','<div class="row"><div class="form-group"><label>Title</label><input type="text" id="medBlTitle" value="'+esc(b.title)+'"></div><div class="form-group"><label>Slug</label><input type="text" id="medBlSlug" value="'+esc(b.slug)+'"></div></div><div class="row three"><div class="form-group"><label>Date</label><input type="date" id="medBlDate" value="'+(b.date||now())+'"></div><div class="form-group"><label>Status</label><select id="medBlStatus"><option value="draft"'+(b.status==='draft'?' selected':'')+'>Draft</option><option value="published"'+(b.status==='published'?' selected':'')+'>Published</option></select></div><div class="form-group"><label>Category</label><input type="text" id="medBlCat" value="'+esc(b.category||'')+'"></div></div><div class="form-group"><label>SEO description</label><input type="text" id="medBlSeo" value="'+esc(b.seoDesc||'')+'"></div><div class="form-group"><label>Excerpt</label><textarea id="medBlExcerpt">'+esc(b.excerpt||'')+'</textarea></div><div class="form-group"><label>Body</label><div id="quillEditor" style="background:var(--white)"></div></div>',
    function(){b.title=g('medBlTitle');b.slug=g('medBlSlug');b.date=g('medBlDate');b.status=g('medBlStatus');b.category=g('medBlCat');b.seoDesc=g('medBlSeo');b.excerpt=g('medBlExcerpt');var fb=document.getElementById('blogBodyFallback');b.body=_quillInstance?_quillInstance.root.innerHTML:(fb?fb.value:b.body);set(data);closeModal();renderBlog(document.getElementById('mainArea'));logActivity('Edited post',b.title);toast('Saved');},true);
  var qe=document.getElementById('quillEditor');
  if(typeof Quill!=='undefined'){
    try{
      _quillInstance=new Quill('#quillEditor',{theme:'snow',modules:{toolbar:[['bold','italic','underline','strike'],[{'header':[1,2,3,false]}],[{'list':'ordered'},{'list':'bullet'}],['link','blockquote','code-block'],['clean']]}});
      _quillInstance.root.innerHTML=b.body||'';
    }catch(e){qe.innerHTML='<textarea id="blogBodyFallback" style="width:100%;min-height:200px;padding:0.75rem;border:1.5px solid var(--stone-line);border-radius:8px;font-family:inherit;font-size:0.9rem;background:var(--white);color:var(--ink)">'+esc(b.body||'')+'</textarea>';}
  }else{
    qe.innerHTML='<textarea id="blogBodyFallback" style="width:100%;min-height:200px;padding:0.75rem;border:1.5px solid var(--stone-line);border-radius:8px;font-family:inherit;font-size:0.9rem;background:var(--white);color:var(--ink)">'+esc(b.body||'')+'</textarea>';
  }
}

function addBlog(){var data=get();data.blog.push({id:id(data.blog),title:'New Post',slug:'new-post',excerpt:'',date:now(),status:'draft',body:'',category:'',tags:[],seoDesc:''});set(data);renderBlog(document.getElementById('mainArea'));toast('Created');}
function deleteBlog(id){if(!confirm('Delete?'))return;var data=get();data.blog=data.blog.filter(function(x){return x.id!==id;});set(data);renderBlog(document.getElementById('mainArea'));}

/* ═══════════════════════════════════════════════════════
   PROJECTS (SortableJS Kanban)
   ═══════════════════════════════════════════════════════ */
function renderProjects(main){var data=get();var projs=data.projects||[];main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Projects</h2><p>'+(projs.length)+' total</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addProject()">'+I.plus+' New project</button></div></div><div class="kanban" id="kanbanBoard"><div class="kanban-col" data-status="todo"><div class="kanban-col-hd"><span>To Do</span><span class="count">'+projs.filter(function(p){return p.status==='todo'||!p.status;}).length+'</span></div><div class="kanban-list" id="kanbanTodo">'+projs.filter(function(p){return p.status==='todo'||!p.status;}).map(function(p){return kanbanCard(p);}).join('')+'</div></div><div class="kanban-col" data-status="active"><div class="kanban-col-hd"><span>In Progress</span><span class="count">'+projs.filter(function(p){return p.status==='active';}).length+'</span></div><div class="kanban-list" id="kanbanActive">'+projs.filter(function(p){return p.status==='active';}).map(function(p){return kanbanCard(p);}).join('')+'</div></div><div class="kanban-col" data-status="done"><div class="kanban-col-hd"><span>Completed</span><span class="count">'+projs.filter(function(p){return p.status==='done';}).length+'</span></div><div class="kanban-list" id="kanbanDone">'+projs.filter(function(p){return p.status==='done';}).map(function(p){return kanbanCard(p);}).join('')+'</div></div></div></div>';initKanban();}
function kanbanCard(p){return '<div class="kanban-card" data-id="'+p.id+'" onclick="editProject('+p.id+')"><div class="kanban-card-title">'+esc(p.title)+'</div>'+(p.desc?'<div class="kanban-card-desc">'+esc(p.desc)+'</div>':'')+'<div class="kanban-card-foot"><span>'+(p.client||'')+'</span><span>'+(p.deadline?fmtDate(p.deadline):'')+'</span></div></div>';}
function initKanban(){
  if(!window.Sortable)return;
  ['kanbanTodo','kanbanActive','kanbanDone'].forEach(function(id){
    var el=document.getElementById(id);if(!el)return;
    Sortable.create(el,{group:'kanban',animation:200,onEnd:function(evt){var pid=parseInt(evt.item.getAttribute('data-id'));var status=evt.to.closest('.kanban-col').getAttribute('data-status');var data=get();var p=data.projects.find(function(x){return x.id===pid;});if(p){p.status=status;set(data);}updateKanbanCounts();}});
  });
}
function updateKanbanCounts(){var data=get();document.querySelectorAll('.kanban-col').forEach(function(col){var status=col.getAttribute('data-status');var count=col.querySelectorAll('.kanban-card').length;var lbl=col.querySelector('.count');if(lbl)lbl.textContent=count;});}
function addProject(){var data=get();data.projects.push({id:id(data.projects),title:'New Project',desc:'',client:'',deadline:'',status:'todo',tasks:[]});set(data);renderProjects(document.getElementById('mainArea'));toast('Created');}
function editProject(id){var data=get();var p=data.projects.find(function(x){return x.id===id;});if(!p)return;modal('Edit Project','<div class="row"><div class="form-group"><label>Title</label><input type="text" id="projTitle" value="'+esc(p.title)+'"></div><div class="form-group"><label>Client</label><input type="text" id="projClient" value="'+esc(p.client||'')+'"></div></div><div class="row"><div class="form-group"><label>Status</label><select id="projStatus"><option value="todo"'+(p.status==='todo'?' selected':'')+'>To Do</option><option value="active"'+(p.status==='active'?' selected':'')+'>In Progress</option><option value="done"'+(p.status==='done'?' selected':'')+'>Complete</option></select></div><div class="form-group"><label>Deadline</label><input type="date" id="projDeadline" value="'+(p.deadline||'')+'"></div></div><div class="form-group"><label>Description</label><textarea id="projDesc">'+esc(p.desc||'')+'</textarea></div>',function(){p.title=g('projTitle');p.client=g('projClient');p.status=g('projStatus');p.deadline=g('projDeadline');p.desc=g('projDesc');set(data);closeModal();renderProjects(document.getElementById('mainArea'));logActivity('Updated project',p.title);toast('Saved');},true);}

/* ═══════════════════════════════════════════════════════
   INVOICES
   ═══════════════════════════════════════════════════════ */
function renderInvoices(main){var data=get();var items=data.invoices||[];main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Finance</h2><p>'+(items.length)+' invoices</p></div><div class="page-hd-actions"><button class="btn btn-ghost btn-sm" onclick="nav(\'analytics\')">'+I.chart+' Reports</button><button class="btn btn-primary btn-sm" onclick="addInvoice()">'+I.plus+' New</button></div></div><div class="stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:1rem"><div class="stat"><div class="stat-num">'+items.length+'</div><div class="stat-label">Total</div></div><div class="stat"><div class="stat-num">KSh '+items.reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0).toLocaleString()+'</div><div class="stat-label">Outstanding</div></div><div class="stat"><div class="stat-num">KSh '+items.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0).toLocaleString()+'</div><div class="stat-label">Collected</div></div><div class="stat"><div class="stat-num">'+items.filter(function(i){return i.status==='paid';}).length+'/'+items.length+'</div><div class="stat-label">Paid</div></div></div><div class="filter-bar" id="invFilters"><button class="btn btn-ghost btn-sm active" onclick="filterInv(\'all\',this)">All</button><button class="btn btn-ghost btn-sm" onclick="filterInv(\'draft\',this)">Draft</button><button class="btn btn-ghost btn-sm" onclick="filterInv(\'sent\',this)">Sent</button><button class="btn btn-ghost btn-sm" onclick="filterInv(\'paid\',this)">Paid</button><button class="btn btn-ghost btn-sm" onclick="filterInv(\'overdue\',this)">Overdue</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Invoice</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody id="invTBody"></tbody></table></div></div>';renderInvTableRows(items,'all');}
function renderInvTableRows(items,filter){var tbody=document.getElementById('invTBody');if(!tbody)return;var f=filter==='all'?items:items.filter(function(i){return i.status===filter;});if(!f.length){tbody.innerHTML='<tr><td colspan="7"><div class="empty" style="padding:1.5rem">'+I.empty+'<p>No invoices</p></div></td></tr>';return;}tbody.innerHTML=f.slice().reverse().map(function(i){var total=i.items?i.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0):parseFloat(i.amount)||0;return '<tr><td><strong>'+esc(i.number)+'</strong></td><td>'+esc(i.client)+'</td><td>'+fmtDate(i.date)+'</td><td>'+(i.dueDate?fmtDate(i.dueDate):'-')+'</td><td><strong>KSh '+total.toLocaleString()+'</strong></td><td><span class="status status-'+i.status+'">'+i.status+'</span></td><td><div class="td-act"><button class="btn btn-ghost btn-xs" onclick="viewInvoice('+i.id+')" title="View">'+I.eye+'</button><button class="btn btn-ghost btn-xs" onclick="editInvoice('+i.id+')" title="Edit">'+I.edit+'</button><button class="btn btn-danger btn-xs" onclick="deleteInvoice('+i.id+')" title="Delete">'+I.trash+'</button></div></td></tr>';}).join('');}
function filterInv(f,btn){document.querySelectorAll('#invFilters .btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var data=get();renderInvTableRows(data.invoices||[],f);}

function addInvoice(){var _ilc=0;modal('New Invoice','<div class="row"><div class="form-group"><label>Invoice #</label><input type="text" id="invNum" value="INV-'+(Date.now().toString().slice(-6))+'"></div><div class="form-group"><label>Client</label><input type="text" id="invClient"></div></div><div class="row"><div class="form-group"><label>Date</label><input type="date" id="invDate" value="'+now()+'"></div><div class="form-group"><label>Due date</label><input type="date" id="invDue" value="'+now()+'"></div></div><div class="form-group"><label>Line Items</label></div><div id="invLines"><div class="inv-line"><input type="text" id="liDesc0" value="Service" placeholder="Description"><input type="number" id="liQty0" value="1" min="1" oninput="calcLineTotalN()"><input type="number" id="liRate0" value="0" min="0" step="0.01" oninput="calcLineTotalN()"><span class="inv-line-total" id="liTotal0">KSh 0</span></div></div><button class="btn btn-ghost btn-sm" onclick="addInvLineN()" style="margin-bottom:0.5rem">'+I.plus+' Add line</button><div class="inv-summary"><div class="inv-summary-row total"><span>Total</span><span id="invTotalN">KSh 0</span></div></div><div class="form-group" style="margin-top:0.75rem"><label>Notes</label><textarea id="invNotes" rows="2"></textarea></div>',function(){var client=g('invClient');if(!client){toast('Client required');return;}var items=[];var li=0;while(document.getElementById('liDesc'+li)){var desc=document.getElementById('liDesc'+li).value;var qty=parseFloat(document.getElementById('liQty'+li).value)||0;var rate=parseFloat(document.getElementById('liRate'+li).value)||0;if(desc&&qty&&rate)items.push({desc:desc,qty:qty,rate:rate});li++;}if(!items.length){toast('Add line items');return;}var data=get();var total=items.reduce(function(s,li){return s+li.qty*li.rate;},0);data.invoices.push({id:id(data.invoices),number:g('invNum'),client:client,date:g('invDate'),dueDate:g('invDue'),items:items,total:total,amount:total,status:'draft',payments:[],balance:total,notes:g('invNotes'),terms:'',currency:'KSh',desc:''});set(data);closeModal();renderInvoices(document.getElementById('mainArea'));logActivity('Created invoice','#'+g('invNum'));addNotif('Invoice #'+g('invNum')+' created');toast('Created');},true);}
function addInvLineN(){var n=document.querySelectorAll('#invLines .inv-line').length;var d=document.createElement('div');d.className='inv-line';d.innerHTML='<input type="text" id="liDesc'+n+'" placeholder="Description"><input type="number" id="liQty'+n+'" value="1" min="1" oninput="calcLineTotalN()"><input type="number" id="liRate'+n+'" value="0" min="0" step="0.01" oninput="calcLineTotalN()"><span class="inv-line-total" id="liTotal'+n+'">KSh 0</span><button class="inv-line-del" onclick="this.parentElement.remove();calcLineTotalN()">×</button>';document.getElementById('invLines').appendChild(d);}
function calcLineTotalN(){var li=0;var subtotal=0;while(document.getElementById('liDesc'+li)){var qty=parseFloat(document.getElementById('liQty'+li).value)||0;var rate=parseFloat(document.getElementById('liRate'+li).value)||0;var t=qty*rate;var el=document.getElementById('liTotal'+li);if(el)el.textContent='KSh '+t.toLocaleString();subtotal+=t;li++;}var te=document.getElementById('invTotalN');if(te)te.textContent='KSh '+subtotal.toLocaleString();}

function viewInvoice(id){var data=get();var i=data.invoices.find(function(x){return x.id===id;});if(!i)return;var total=i.items?i.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0):parseFloat(i.amount)||0;var paid=(i.payments||[]).reduce(function(s,p){return s+(parseFloat(p.amount)||0);},0);var bal=total-paid;modal('Invoice #'+esc(i.number),'<div class="pdf-preview"><div class="pdf-hd"><div><h2>'+esc(data.settings.companyName||'Ribyon Studios')+'</h2><p style="font-size:0.7rem;color:var(--stone)">INVOICE</p></div><div class="pdf-inv-no"><strong>#'+esc(i.number)+'</strong><br><span style="font-size:0.7rem">Date: '+fmtDate(i.date)+'</span>'+(i.dueDate?'<br><span style="font-size:0.7rem">Due: '+fmtDate(i.dueDate)+'</span>':'')+'</div></div><div class="pdf-addr"><div><strong>Bill To</strong><p>'+esc(i.client)+'</p></div><div style="text-align:right"><strong>Status</strong><p><span class="status status-'+i.status+'">'+i.status+'</span></p></div></div><table class="pdf-table"><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>'+(i.items||[]).map(function(li){return '<tr><td>'+esc(li.desc)+'</td><td style="text-align:center">'+li.qty+'</td><td style="text-align:right">KSh '+(parseFloat(li.rate)||0).toLocaleString()+'</td><td style="text-align:right">KSh '+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0)).toLocaleString()+'</td></tr>';}).join('')+'</tbody></table><div class="pdf-total">Total: KSh '+total.toLocaleString()+'</div>'+(paid>0?'<p style="font-size:0.72rem;color:var(--green);margin-top:0.5rem">Paid: KSh '+paid.toLocaleString()+'</p>':'')+(bal>0?'<p style="font-size:0.72rem;color:var(--red);margin-top:0.15rem">Balance: KSh '+bal.toLocaleString()+'</p>':'')+(i.notes?'<p style="font-size:0.7rem;color:var(--stone);margin-top:0.75rem;padding-top:0.5rem;border-top:1px solid var(--stone-line)">'+esc(i.notes)+'</p>':'')+'</div>'+(i.payments&&i.payments.length?'<div class="pay-timeline" style="margin-top:0.75rem">'+i.payments.map(function(p){return '<div class="pay-item paid"><div class="pay-amt">KSh '+(parseFloat(p.amount)||0).toLocaleString()+'</div><div class="pay-info">'+fmtDate(p.date)+'</div><div class="pay-method">'+(p.method||'Manual')+(p.reference?' · Ref: '+esc(p.reference):'')+'</div></div>';}).join('')+'</div>':'')+'<div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">'+(i.status!=='paid'?'<button class="btn btn-success btn-sm" onclick="recordPayment('+i.id+')">Record payment</button>':'')+'<button class="btn btn-ghost btn-sm" onclick="duplicateInvoice('+i.id+')">'+I.duplicate+' Duplicate</button><button class="btn btn-ghost btn-sm" onclick="downloadPdf('+i.id+')">'+I.download+' PDF</button><a href="mailto:?subject=Invoice '+esc(i.number)+'&body=Please find invoice attached" class="btn btn-ghost btn-sm" style="display:inline-flex">'+I.mail+' Send</a><button class="btn btn-ghost btn-sm" onclick="window.print()">'+I.download+' Print</button></div><div class="modal-foot" style="margin-top:1rem"><button class="btn btn-primary" onclick="closeModal();editInvoice('+i.id+')">Edit</button><button class="btn btn-ghost" onclick="closeModal()">Close</button></div>',null,true);}


function downloadPdf(id){var el=document.querySelector('.pdf-preview');if(!el){toast('Open invoice first');return;}var data=get();var i=data.invoices.find(function(x){return x.id===id;});if(!i)return;html2pdf().from(el).set({margin:0.5,filename:'invoice-'+i.number+'.pdf',html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'in',format:'a4',orientation:'portrait'}}).save().then(function(){toast('PDF downloaded');}).catch(function(){toast('PDF failed');});}
function recordPayment(id){modal('Record Payment','<div class="row"><div class="form-group"><label>Amount (KSh)</label><input type="number" id="payAmount" min="0" step="0.01"></div><div class="form-group"><label>Date</label><input type="date" id="payDate" value="'+now()+'"></div></div><div class="row"><div class="form-group"><label>Method</label><select id="payMethod"><option>M-Pesa</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option><option>Other</option></select></div><div class="form-group"><label>Reference</label><input type="text" id="payRef"></div></div>',function(){var amt=parseFloat(g('payAmount'));if(!amt||amt<=0){toast('Valid amount required');return;}var data=get();var i=data.invoices.find(function(x){return x.id===id;});if(!i)return;if(!i.payments)i.payments=[];i.payments.push({amount:amt,date:g('payDate'),method:g('payMethod'),reference:g('payRef')});var total=i.items?i.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0):parseFloat(i.amount)||0;var p=(i.payments||[]).reduce(function(s,pay){return s+(parseFloat(pay.amount)||0);},0);i.balance=Math.max(0,total-p);if(i.balance<=0)i.status='paid';else if(i.status==='draft')i.status='sent';set(data);closeModal();renderInvoices(document.getElementById('mainArea'));logActivity('Payment recorded','#'+i.number);addNotif('Payment of KSh '+amt+' received');toast('Recorded');});}
function duplicateInvoice(id){var data=get();var i=data.invoices.find(function(x){return x.id===id;});if(!i)return;var copy=JSON.parse(JSON.stringify(i));copy.id=id(data.invoices);copy.number='INV-'+(Date.now().toString().slice(-6));copy.status='draft';copy.payments=[];copy.balance=calcBalance(copy);if(copy.items)copy.total=copy.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0);data.invoices.push(copy);set(data);renderInvoices(document.getElementById('mainArea'));toast('Duplicated');}

function editInvoice(id){var data=get();var i=data.invoices.find(function(x){return x.id===id;});if(!i)return;var items=i.items||[{desc:i.desc||'Service',qty:1,rate:parseFloat(i.amount)||0}];var _elc=items.length;modal('Edit Invoice','<div class="row"><div class="form-group"><label>Invoice #</label><input type="text" id="invNum" value="'+esc(i.number)+'"></div><div class="form-group"><label>Client</label><input type="text" id="invClient" value="'+esc(i.client)+'"></div></div><div class="row"><div class="form-group"><label>Date</label><input type="date" id="invDate" value="'+(i.date||now())+'"></div><div class="form-group"><label>Due date</label><input type="date" id="invDue" value="'+(i.dueDate||now())+'"></div></div><div class="form-group"><label>Status</label><select id="invStatus"><option value="draft"'+(i.status==='draft'?' selected':'')+'>Draft</option><option value="sent"'+(i.status==='sent'?' selected':'')+'>Sent</option><option value="paid"'+(i.status==='paid'?' selected':'')+'>Paid</option><option value="overdue"'+(i.status==='overdue'?' selected':'')+'>Overdue</option><option value="cancelled"'+(i.status==='cancelled'?' selected':'')+'>Cancelled</option></select></div><div class="form-group"><label>Line Items</label></div><div id="invLinesE">'+items.map(function(li,idx){return '<div class="inv-line"><input type="text" id="eliDesc'+idx+'" value="'+esc(li.desc)+'"><input type="number" id="eliQty'+idx+'" value="'+li.qty+'" min="1" oninput="calcLineTotalE()"><input type="number" id="eliRate'+idx+'" value="'+li.rate+'" min="0" step="0.01" oninput="calcLineTotalE()"><span class="inv-line-total" id="eliTotal'+idx+'">KSh '+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0)).toLocaleString()+'</span></div>';}).join('')+'</div><button class="btn btn-ghost btn-sm" onclick="addInvLineE()" style="margin-bottom:0.5rem">'+I.plus+' Add line</button><div class="inv-summary"><div class="inv-summary-row total"><span>Total</span><span id="invTotalE">KSh '+items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0).toLocaleString()+'</span></div></div><div class="form-group" style="margin-top:0.75rem"><label>Notes</label><textarea id="invNotes" rows="2">'+esc(i.notes||'')+'</textarea></div>',function(){i.number=g('invNum');i.client=g('invClient');i.date=g('invDate');i.dueDate=g('invDue');i.status=g('invStatus');i.notes=g('invNotes');var items=[];var li=0;while(document.getElementById('eliDesc'+li)){var desc=document.getElementById('eliDesc'+li).value;var qty=parseFloat(document.getElementById('eliQty'+li).value)||0;var rate=parseFloat(document.getElementById('eliRate'+li).value)||0;if(desc&&qty&&rate)items.push({desc:desc,qty:qty,rate:rate});li++;}i.items=items;var total=items.reduce(function(s,li){return s+li.qty*li.rate;},0);i.total=total;i.amount=total;var paid=(i.payments||[]).reduce(function(s,p){return s+(parseFloat(p.amount)||0);},0);i.balance=Math.max(0,total-paid);set(data);closeModal();renderInvoices(document.getElementById('mainArea'));logActivity('Edited invoice','#'+i.number);toast('Saved');},true);}
function addInvLineE(){var n=document.querySelectorAll('#invLinesE .inv-line').length+100;var d=document.createElement('div');d.className='inv-line';d.innerHTML='<input type="text" id="eliDesc'+n+'" placeholder="Description"><input type="number" id="eliQty'+n+'" value="1" min="1" oninput="calcLineTotalE()"><input type="number" id="eliRate'+n+'" value="0" min="0" step="0.01" oninput="calcLineTotalE()"><span class="inv-line-total" id="eliTotal'+n+'">KSh 0</span><button class="inv-line-del" onclick="this.parentElement.remove();calcLineTotalE()">×</button>';document.getElementById('invLinesE').appendChild(d);}
function calcLineTotalE(){var li=0;var total=0;while(document.getElementById('eliDesc'+li)){var qty=parseFloat(document.getElementById('eliQty'+li).value)||0;var rate=parseFloat(document.getElementById('eliRate'+li).value)||0;var t=qty*rate;var el=document.getElementById('eliTotal'+li);if(el)el.textContent='KSh '+t.toLocaleString();total+=t;li++;}var te=document.getElementById('invTotalE');if(te)te.textContent='KSh '+total.toLocaleString();}
function deleteInvoice(id){if(!confirm('Delete?'))return;var data=get();data.invoices=data.invoices.filter(function(x){return x.id!==id;});set(data);renderInvoices(document.getElementById('mainArea'));}

/* ═══════════════════════════════════════════════════════
   MEDIA
   ═══════════════════════════════════════════════════════ */
function renderMedia(main){var data=get();var items=data.media||[];var cloud=cloudEnabled();main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Media Library</h2><p>'+items.length+' files'+(cloud?' · cloud':'')+'</p></div><div class="page-hd-actions"><button class="btn btn-ghost btn-sm" onclick="downloadAllMedia()">'+I.download+' Download all</button><button class="btn btn-ghost btn-sm" onclick="clearAllMedia()">'+I.trash+' Clear</button></div></div><div class="upload-zone" onclick="document.getElementById(\'mediaInput\').click()">'+I.upload+'<p>Click to upload images'+(cloud?' · saved to Cloudflare':'')+'</p></div><input type="file" id="mediaInput" accept="image/*" multiple style="display:none" onchange="handleMediaUpload(this.files)"><div style="margin-top:1rem" class="media-grid" id="mediaGrid">'+items.map(function(m){return '<div class="media-item" onclick="copyMediaUrl('+m.id+')" title="Click to copy URL"><img src="'+esc(m.url||m.data)+'" alt=""><button class="del" onclick="event.stopPropagation();deleteMedia('+m.id+')">'+I.trash+'</button></div>';}).join('')+'</div></div>';}
function handleMediaUpload(files){var data=get();if(!data.media)data.media=[];var pending=files.length;var cloud=cloudEnabled();Array.from(files).forEach(function(file){
  if(cloud){
    var fd=new FormData();fd.append('file',file);
    fetch(API+'/api/media/upload',{method:'POST',headers:{'Authorization':'Bearer '+PW},body:fd})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(j){data.media.push({id:id(data.media),name:file.name,url:j.url,key:j.key,data:'',date:now()});pending--;if(pending===0){set(data);renderMedia(document.getElementById('mainArea'));updateBadge('media',data.media.length);toast('Uploaded to cloud');}})
      .catch(function(){pending--;if(pending===0){toast('Upload failed');}});
  }else{
    var reader=new FileReader();reader.onload=function(e){data.media.push({id:id(data.media),name:file.name,url:'',data:e.target.result,date:now()});pending--;if(pending===0){set(data);renderMedia(document.getElementById('mainArea'));updateBadge('media',data.media.length);toast('Uploaded');}};reader.readAsDataURL(file);
  }
});}
function deleteMedia(id){if(!confirm('Delete?'))return;var data=get();var m=data.media.find(function(x){return x.id===id;});data.media=data.media.filter(function(x){return x.id!==id;});set(data);if(m&&m.key&&cloudEnabled()){fetch(API+'/api/media/delete?key='+encodeURIComponent(m.key),{method:'DELETE',headers:{'Authorization':'Bearer '+PW}}).catch(function(){});}renderMedia(document.getElementById('mainArea'));updateBadge('media',data.media.length);}
function clearAllMedia(){if(!confirm('Delete all?'))return;var data=get();var keys=(data.media||[]).map(function(m){return m.key;}).filter(Boolean);data.media=[];set(data);if(keys.length&&cloudEnabled()){keys.forEach(function(k){fetch(API+'/api/media/delete?key='+encodeURIComponent(k),{method:'DELETE',headers:{'Authorization':'Bearer '+PW}}).catch(function(){});});}renderMedia(document.getElementById('mainArea'));updateBadge('media',0);toast('Cleared');}
function copyMediaUrl(id){var data=get();var m=data.media.find(function(x){return x.id===id;});if(!m)return;var val=m.url||m.data;var input=document.createElement('input');input.value=val;document.body.appendChild(input);input.select();document.execCommand('copy');document.body.removeChild(input);toast('Copied');}
function downloadAllMedia(){var data=get();var items=(data.media||[]).filter(function(m){return m.url||m.data;});if(!items.length){toast('No media');return;}toast('Preparing…');var dlNext=function(i){if(i>=items.length){toast('Downloaded '+items.length+' files');return;}var m=items[i];var src=m.url||m.data;var a=document.createElement('a');a.href=src;a.download=(m.name||('media-'+m.id))||'image';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){dlNext(i+1);},450);};dlNext(0);}

/* ═══════════════════════════════════════════════════════
   INQUIRIES & COMPLAINTS
   ═══════════════════════════════════════════════════════ */
function renderInquiries(main){var data=get();var items=data.inquiries||[];main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Inquiries</h2><p>'+items.length+' messages</p></div><div class="filter-bar" id="inqFilters"><button class="btn btn-ghost btn-sm active" onclick="filterInq(\'all\',this)">All</button><button class="btn btn-ghost btn-sm" onclick="filterInq(\'new\',this)">New</button><button class="btn btn-ghost btn-sm" onclick="filterInq(\'read\',this)">Read</button></div></div><div id="inqList">'+renderInqItems(items,'all')+'</div></div>';}
function renderInqItems(items,filter){if(!items.length)return emptyState('No inquiries');var f=filter==='all'?items:items.filter(function(i){return i.status===filter;});if(!f.length)return emptyState('No '+filter+' inquiries');return f.slice().reverse().map(function(i){return '<div class="card" onclick="viewInquiry('+i.id+')"><div class="card-hd"><div><strong>'+esc(i.name)+'</strong><span class="sub">'+esc(i.email)+' · '+fmtDate(i.date)+'</span></div><span class="status status-'+(i.status==='new'?'new':'read')+'">'+i.status+'</span></div></div>';}).join('');}
function filterInq(f,btn){document.querySelectorAll('#inqFilters .btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var data=get();document.getElementById('inqList').innerHTML=renderInqItems(data.inquiries||[],f);}
function viewInquiry(id){var data=get();var i=data.inquiries.find(function(x){return x.id===id;});if(!i)return;if(i.status==='new'){i.status='read';set(data);updateBadge('inquiries',data.inquiries.length);}modal('Inquiry from '+esc(i.name),'<div style="margin-bottom:0.75rem;font-size:0.8rem"><span class="status status-'+i.status+'">'+i.status+'</span><span style="margin-left:0.5rem;color:var(--stone)">'+fmtDate(i.date)+'</span></div><div class="form-group"><label>Email</label><div style="color:var(--ink);font-size:0.88rem"><a href="mailto:'+esc(i.email)+'" style="color:var(--orange)">'+esc(i.email)+'</a></div></div>'+(i.phone?'<div class="form-group"><label>Phone</label><div style="color:var(--ink)">'+esc(i.phone)+'</div></div>':'')+'<div class="form-group"><label>Message</label><div style="color:var(--ink);font-size:0.85rem;line-height:1.6;background:var(--stone-bg);padding:0.75rem;border-radius:var(--radius)">'+esc(i.message)+'</div></div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Close</button></div>',null);}

function renderComplaints(main){var data=get();var items=data.complaints||[];main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Complaints</h2><p>'+items.length+' reports</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addComplaint()">'+I.plus+' Log</button></div></div><div id="compList">'+renderCompItems(items)+'</div></div>';}
function renderCompItems(items){if(!items.length)return emptyState('No complaints');return items.slice().reverse().map(function(c){return '<div class="card"><div class="card-hd"><div><strong>'+esc(c.client)+'</strong><span class="sub">'+esc(c.subject)+' · '+fmtDate(c.date)+'</span></div><div class="card-actions"><span class="status status-'+(c.status==='open'?'new':'resolved')+'">'+c.status+'</span><button class="btn btn-ghost btn-sm" onclick="viewComplaint('+c.id+')">View</button><button class="btn btn-danger btn-sm" onclick="deleteComplaint('+c.id+')">'+I.trash+'</button></div></div></div>';}).join('');}
function viewComplaint(id){var data=get();var c=data.complaints.find(function(x){return x.id===id;});if(!c)return;modal('Complaint — '+esc(c.client),'<div style="margin-bottom:0.75rem;font-size:0.8rem"><span class="status status-'+(c.status==='open'?'new':'resolved')+'">'+c.status+'</span><span style="margin-left:0.5rem;color:var(--stone)">'+fmtDate(c.date)+'</span></div><div class="form-group"><label>Subject</label><div style="color:var(--ink);font-size:0.88rem">'+esc(c.subject)+'</div></div><div class="form-group"><label>Details</label><div style="color:var(--ink);font-size:0.85rem;line-height:1.6;background:var(--stone-bg);padding:0.75rem;border-radius:var(--radius)">'+esc(c.details)+'</div></div><div class="form-group"><label>Status</label><select id="compStatus" onchange="updateCompStatus('+c.id+',this.value)"><option value="open"'+(c.status==='open'?' selected':'')+'>Open</option><option value="resolved"'+(c.status==='resolved'?' selected':'')+'>Resolved</option></select></div>',function(){closeModal();});}
function updateCompStatus(id,val){var data=get();var c=data.complaints.find(function(x){return x.id===id;});if(c){c.status=val;set(data);renderComplaints(document.getElementById('mainArea'));toast('Updated');}}
function addComplaint(){modal('Log Complaint','<div class="row"><div class="form-group"><label>Client</label><input type="text" id="compClient"></div><div class="form-group"><label>Subject</label><input type="text" id="compSubject"></div></div><div class="form-group"><label>Details</label><textarea id="compDetails" style="min-height:80px"></textarea></div>',function(){if(!g('compClient')||!g('compSubject')){toast('Fill required fields');return;}var data=get();data.complaints.push({id:id(data.complaints),client:g('compClient'),subject:g('compSubject'),details:g('compDetails'),date:now(),status:'open'});set(data);closeModal();renderComplaints(document.getElementById('mainArea'));toast('Logged');});}
function deleteComplaint(id){if(!confirm('Delete?'))return;var data=get();data.complaints=data.complaints.filter(function(x){return x.id!==id;});set(data);renderComplaints(document.getElementById('mainArea'));}

/* ═══════════════════════════════════════════════════════
   ANALYTICS (Chart.js)
   ═══════════════════════════════════════════════════════ */
function renderAnalytics(main){
  var data=get();var inv=data.invoices||[];
  var paidInv=inv.filter(function(i){return i.status==='paid';});
  var totalRev=paidInv.reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0);
  var newInq=(data.inquiries||[]).filter(function(i){return i.status==='new';}).length;
  var doneProj=(data.projects||[]).filter(function(p){return p.status==='done';}).length;
  var draftC=inv.filter(function(i){return i.status==='draft';}).length;
  var paidC=inv.filter(function(i){return i.status==='paid';}).length;
  var sentC=inv.filter(function(i){return i.status==='sent';}).length;
  var overdueC=inv.filter(function(i){return i.status==='overdue';}).length;

  main.innerHTML=
    '<div class="page active"><div class="page-hd"><div><h2>Analytics</h2><p>Performance metrics</p></div></div>'+
    '<div class="stats" style="grid-template-columns:repeat(4,1fr)">'+
    '<div class="stat"><div class="stat-num">KSh '+totalRev.toLocaleString()+'</div><div class="stat-label">Revenue</div></div>'+
    '<div class="stat"><div class="stat-num">'+paidC+'/'+inv.length+'</div><div class="stat-label">Paid</div></div>'+
    '<div class="stat"><div class="stat-num">'+newInq+'</div><div class="stat-label">Inquiries</div></div>'+
    '<div class="stat"><div class="stat-num">'+doneProj+'/'+(data.projects||[]).length+'</div><div class="stat-label">Projects</div></div>'+
    '</div>'+
    '<div class="dash-grid">'+
    '<div class="dash-card dash-full"><div class="dash-card-hd"><strong>Revenue (6 months)</strong></div><div class="dash-card-body"><div class="chart-wrap"><canvas id="analyticsChart"></canvas></div></div></div>'+
    '<div class="dash-card"><div class="dash-card-hd"><strong>Invoice Status</strong></div><div class="dash-card-body"><div class="chart-wrap" style="height:220px"><canvas id="donutChart"></canvas></div></div></div>'+
    '<div class="dash-card"><div class="dash-card-hd"><strong>Export</strong></div><div class="dash-card-body">'+
    '<button class="btn btn-ghost btn-sm" onclick="exportData()" style="margin-bottom:0.4rem">'+I.download+' Backup</button>'+
    '<button class="btn btn-ghost btn-sm" onclick="exportReport()">'+I.download+' CSV report</button>'+
    '</div></div></div></div>';
  renderAnalyticsCharts(data);
}
function renderAnalyticsCharts(data){
  var months=[];var nowD=new Date();
  for(var m=5;m>=0;m--){var d=new Date(nowD.getFullYear(),nowD.getMonth()-m,1);var mk=d.toISOString().slice(0,7);var ml=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];var rev=(data.invoices||[]).filter(function(i){return i.date&&i.date.slice(0,7)===mk&&i.status==='paid';}).reduce(function(s,i){return s+((i.total||parseFloat(i.amount)||0));},0);months.push({lbl:ml,rev:rev});}

  var ac=document.getElementById('analyticsChart');if(ac){
    if(_chartInstances.analytics)_chartInstances.analytics.destroy();
    _chartInstances.analytics=new Chart(ac.getContext('2d'),{type:'line',data:{labels:months.map(function(m){return m.lbl;}),datasets:[{label:'Revenue',data:months.map(function(m){return m.rev;}),borderColor:'#f97316',backgroundColor:'rgba(249,115,22,0.10)',fill:true,tension:0.4,pointBackgroundColor:'#f97316',pointRadius:4,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(10,9,8,0.06)'},ticks:{font:{size:10},callback:function(v){return'KSh '+v;}}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});}

  var dc=document.getElementById('donutChart');if(dc){
    if(_chartInstances.donut)_chartInstances.donut.destroy();
    var draftC=(data.invoices||[]).filter(function(i){return i.status==='draft';}).length;
    var paidC=(data.invoices||[]).filter(function(i){return i.status==='paid';}).length;
    var sentC=(data.invoices||[]).filter(function(i){return i.status==='sent';}).length;
    var overdueC=(data.invoices||[]).filter(function(i){return i.status==='overdue';}).length;
    _chartInstances.donut=new Chart(dc.getContext('2d'),{type:'doughnut',data:{labels:['Paid','Sent','Draft','Overdue'],datasets:[{data:[paidC,sentC,draftC,overdueC],backgroundColor:['#16a34a','#2563eb','#d97706','#dc2626'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,usePointStyle:true,font:{size:10}}}}}});}
}

function exportReport(){var data=get();var inv=data.invoices||[];var csv='Invoice #,Client,Date,Status,Amount\n';inv.forEach(function(i){var amt=i.items?i.items.reduce(function(s,li){return s+((parseFloat(li.qty)||0)*(parseFloat(li.rate)||0));},0):parseFloat(i.amount)||0;csv+=esc(i.number)+','+esc(i.client)+','+(i.date||'')+','+i.status+','+amt+'\n';});var blob=new Blob([csv],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ribyon-report-'+now()+'.csv';a.click();toast('Exported');}

/* ═══════════════════════════════════════════════════════
   ACTIVITY & SETTINGS
   ═══════════════════════════════════════════════════════ */
function renderActivity(main){var data=get();var items=data.activity||[];main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Activity Log</h2><p>'+(items.length)+' events</p></div><div class="page-hd-actions"><button class="btn btn-ghost btn-sm" onclick="clearActivity()">'+I.trash+' Clear</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Action</th><th>Detail</th></tr></thead><tbody>'+(items.length?items.slice(0,50).map(function(a){return '<tr><td style="white-space:nowrap;color:var(--stone)">'+fmtDate(a.date)+' '+a.time+'</td><td><strong>'+esc(a.action)+'</strong></td><td>'+esc(a.detail)+'</td></tr>';}).join(''):'<tr><td colspan="3"><div class="empty">'+I.empty+'<p>No activity</p></div></td></tr>')+'</tbody></table></div></div>';}
function clearActivity(){if(!confirm('Clear log?'))return;var data=get();data.activity=[];set(data);nav('activity');toast('Cleared');}

function renderSettings(main){var data=get();var s=data.settings||DEFAULTS.settings;main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Settings</h2></div></div><div class="card"><div class="card-hd"><strong>Studio</strong></div><div class="card-body"><div class="row"><div class="form-group"><label>Company</label><input type="text" id="setName" value="'+esc(s.companyName||'')+'"></div><div class="form-group"><label>Currency</label><input type="text" id="setCur" value="'+esc(s.currency||'KSh')+'"></div></div><div class="row"><div class="form-group"><label>Email</label><input type="email" id="setEmail" value="'+esc(s.companyEmail||'')+'"></div><div class="form-group"><label>Phone</label><input type="text" id="setPhone" value="'+esc(s.companyPhone||'')+'"></div></div><button class="btn btn-primary btn-sm" onclick="saveSettings()">'+I.check+' Save</button></div></div><div class="card"><div class="card-hd"><strong>Cloud Database</strong><span class="status '+(cloudEnabled()?'status-paid':'status-draft')+'">'+(cloudEnabled()?'Connected':'Off')+'</span></div><div class="card-body"><p style="margin-bottom:0.75rem;font-size:0.82rem;color:var(--stone)">Store your CMS data in Cloudflare D1 and images in R2. Enable to sync everything to the cloud.</p><button class="btn btn-ghost btn-sm" onclick="toggleCloud()">'+(cloudEnabled()?'Disable cloud':'Enable cloud')+'</button>'+(cloudEnabled()?'<button class="btn btn-success btn-sm" onclick="pushNow()" style="margin-left:0.25rem">'+I.upload+' Push now</button><button class="btn btn-ghost btn-sm" onclick="pullNow()" style="margin-left:0.25rem">'+I.download+' Pull</button>':'')+'</div></div><div class="card"><div class="card-hd"><strong>Data</strong></div><div class="card-body"><p style="margin-bottom:0.75rem;font-size:0.82rem;color:var(--stone)">All data in localStorage. Export regularly.</p><button class="btn btn-ghost btn-sm" onclick="exportData()">'+I.download+' Backup</button> <button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'importInput\').click()">Import</button> <button class="btn btn-danger btn-sm" onclick="resetAll()" style="margin-left:0.25rem">Reset</button><input type="file" id="importInput" accept=".json" style="display:none" onchange="importData(this.files[0])"></div></div><div class="card"><div class="card-hd"><strong>About</strong></div><div class="card-body"><p style="font-size:0.82rem;color:var(--stone)">CMS v4 — Ink &amp; Ember · Cloudflare connected</p></div></div></div>';}
function saveSettings(){var data=get();data.settings={companyName:g('setName'),currency:g('setCur'),companyEmail:g('setEmail'),companyPhone:g('setPhone'),taxRate:data.settings.taxRate||16};set(data);logActivity('Updated','Settings');toast('Saved');}
function exportData(){var data=get();var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ribyon-backup-'+now()+'.json';a.click();toast('Downloaded');}
function importData(file){if(!file)return;var reader=new FileReader();reader.onload=function(e){try{var d=JSON.parse(e.target.result);set(d);toast('Imported');nav(_currentSection||'dash');}catch(err){toast('Invalid file');}};reader.readAsText(file);}
function resetAll(){if(!confirm('Delete ALL content?'))return;if(!confirm('Really?'))return;set(JSON.parse(JSON.stringify(DEFAULTS)));nav('dash');toast('Reset');logActivity('Reset','All data reset');}

function toggleCloud(){if(cloudEnabled()){setCloudEnabled(false);toast('Cloud disabled — data stays local');renderSettings(document.getElementById('mainArea'));}else{setCloudEnabled(true);toast('Connecting…');pushCloud().then(function(ok){if(ok){toast('Cloud enabled — pushed');addNotif('Cloud sync enabled');}else{setCloudEnabled(false);toast('Cloud unreachable');}renderSettings(document.getElementById('mainArea'));});}}
function pushNow(){pushCloud(get()).then(function(ok){toast(ok?'Pushed to cloud':'Push failed');});}
function pullNow(){syncFromCloud();}

/* ─── Users (superadmin) ─── */
function renderUsers(main){
  if(!isSuper()){nav('settings');return;}
  main.innerHTML='<div class="page active"><div class="page-hd"><div><h2>Users</h2><p>Team accounts and roles</p></div><div class="page-hd-actions"><button class="btn btn-primary btn-sm" onclick="addUser()">'+I.plus+' Add user</button></div></div><div class="card"><div class="card-body" id="userList"><p style="color:var(--stone);font-size:0.85rem">Loading…</p></div></div></div>';
  loadUsers();
}
var _users=[];
function loadUsers(){
  fetch(API+'/api/users',{headers:{'Authorization':'Bearer '+(getToken()||PW)}})
    .then(function(r){if(!r.ok)throw 0;return r.json();})
    .then(function(j){_users=j.users||[];renderUserRows(_users);})
    .catch(function(){var el=document.getElementById('userList');if(el)el.innerHTML='<p style="color:var(--red);font-size:0.85rem">Could not load users.</p>';});
}
function renderUserRows(users){
  var el=document.getElementById('userList');if(!el)return;
  el.innerHTML='<table class="data-table"><thead><tr><th>User</th><th>Role</th><th>Created</th><th></th></tr></thead><tbody>'+
    users.map(function(u){return '<tr><td><strong>'+esc(u.username)+'</strong>'+(u.email?'<span class="sub">'+esc(u.email)+'</span>':'')+(u.username===currentUser().username?' <span class="status status-paid" style="font-size:0.6rem">you</span>':'')+'</td><td><select onchange="changeUserRole('+u.id+',this.value)">'+ROLES.map(function(r){return '<option value="'+r+'"'+(u.role===r?' selected':'')+'>'+r+'</option>';}).join('')+'</select></td><td style="color:var(--stone);font-size:0.8rem">'+(u.created_at||'').slice(0,10)+'</td><td><div class="td-act"><button class="btn btn-ghost btn-xs" onclick="editUser('+u.id+')" title="Edit user">'+I.edit+'</button><button class="btn btn-ghost btn-xs" onclick="resetUserPass('+u.id+')" title="Reset password">'+I.key+'</button><button class="btn btn-danger btn-xs" onclick="deleteUser('+u.id+','+JSON.stringify(u.username)+')" title="Delete">'+I.trash+'</button></div></td></tr>';}).join('')+
    '</tbody></table>';
}
function addUser(){modal('Add User','<div class="form-group"><label>Email</label><input type="email" id="nuEmail" placeholder="name@email.com"></div><div class="form-group"><label>Password</label><input type="password" id="nuPass"></div><div class="form-group"><label>Role</label><select id="nuRole">'+ROLES.map(function(r){return '<option value="'+r+'">'+r+'</option>';}).join('')+'</select></div>',function(){var em=g('nuEmail').trim();var pw=g('nuPass');if(!em||!pw){toast('Email and password required');return;}fetch(API+'/api/users',{method:'POST',headers:{'Authorization':'Bearer '+(getToken()||PW),'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw,role:g('nuRole')})}).then(function(r){return r.json();}).then(function(j){closeModal();loadUsers();addNotif('User '+em+' added');toast(j.error||'Added');});},false);}
function editUser(id){var u=_users.find(function(x){return x.id===id;});modal('Edit User','<div class="form-group"><label>Email</label><input type="email" id="euEmail" value="'+esc(u&&u.email||'')+'"></div><div class="form-group"><label>Role</label><select id="euRole">'+ROLES.map(function(r){return '<option value="'+r+'"'+(u&&u.role===r?' selected':'')+'>'+r+'</option>';}).join('')+'</select></div>',function(){var em=g('euEmail').trim();if(!em){toast('Email required');return;}fetch(API+'/api/users?id='+id,{method:'PUT',headers:{'Authorization':'Bearer '+(getToken()||PW),'Content-Type':'application/json'},body:JSON.stringify({email:em,role:g('euRole')})}).then(function(r){return r.json();}).then(function(j){closeModal();loadUsers();addNotif('User updated');toast(j.error||'Updated');});},false);}
function changeUserRole(id,role){fetch(API+'/api/users?id='+id,{method:'PUT',headers:{'Authorization':'Bearer '+(getToken()||PW),'Content-Type':'application/json'},body:JSON.stringify({role:role})}).then(function(r){return r.json();}).then(function(j){toast(j.error||'Role updated');addNotif('Role updated');});}
function resetUserPass(id){modal('Reset Password','<div class="form-group"><label>New password</label><input type="password" id="rpPass"></div>',function(){var pw=g('rpPass');if(!pw){toast('Password required');return;}fetch(API+'/api/users?id='+id,{method:'PUT',headers:{'Authorization':'Bearer '+(getToken()||PW),'Content-Type':'application/json'},body:JSON.stringify({password:pw})}).then(function(r){return r.json();}).then(function(j){closeModal();toast(j.error||'Password reset');});},false);}
function deleteUser(id,name){if(!confirm('Delete user '+name+'?'))return;fetch(API+'/api/users?id='+id,{method:'DELETE',headers:{'Authorization':'Bearer '+(getToken()||PW)}}).then(function(r){return r.json();}).then(function(j){loadUsers();toast(j.error||'Deleted');});}

/* ═══════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════ */
var _modalCallback=null;
function modal(title,body,onsave,wide){
  _modalCallback=onsave;
  var m=document.createElement('div');m.className='modal-overlay open';m.id='activeModal';
  m.innerHTML='<div class="modal'+(wide?' modal-wide':'')+'"><div class="modal-hd"><h3>'+title+'</h3><button class="modal-close" onclick="closeModal()">'+I.close+'</button></div>'+body+(onsave?'<div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveModal()">'+I.check+' Save</button></div>':'')+'</div>';
  document.body.appendChild(m);
}
function saveModal(){if(_modalCallback)_modalCallback();}
function closeModal(){var m=document.getElementById('activeModal');if(m){_quillInstance=null;m.classList.remove('open');setTimeout(function(){m.remove();},300);}_modalCallback=null;}
function updateBadge(section,count){document.querySelectorAll('.sidebar-nav a').forEach(function(a){if(a.getAttribute('data-sec')===section){var b=a.querySelector('.badge');if(b)b.textContent=count;}});}
function emptyState(msg){return '<div class="empty">'+I.empty+'<p>'+msg+'</p></div>';}
renderApp();
