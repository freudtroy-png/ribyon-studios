/* ═══════════════════════════════════════════════════════════
   Ribyon Client Portal
   Flows: invite accept → login → dashboard
   (Projects · Invoices · Files · Messages · Approvals)
   ═══════════════════════════════════════════════════════════ */
const API='https://ribyon-cms-api.freudtroy.workers.dev';
const TK='rs_portal_token';
const ME='rs_portal_client';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function money(n,cur){cur=cur||'KSh';return cur+' '+(Number(n)||0).toLocaleString(undefined,{maximumFractionDigits:0});}
function fmt(d){if(!d)return'';var x=new Date(d);if(isNaN(x))return d;return x.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

function token(){try{return localStorage.getItem(TK)||'';}catch(e){return'';}}
function client(){try{return JSON.parse(localStorage.getItem(ME)||'null');}catch(e){return null;}}
function setAuth(t,c){try{if(t)localStorage.setItem(TK,t);else localStorage.removeItem(TK);if(c)localStorage.setItem(ME,JSON.stringify(c));else localStorage.removeItem(ME);}catch(e){}}
function toast(msg,err){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.className='toast show'+(err?' err':'');clearTimeout(t._h);t._h=setTimeout(function(){t.className='toast';},2600);}

function api(path,opts){opts=opts||{};opts.headers=opts.headers||{};if(token())opts.headers['Authorization']='Bearer '+token();if(opts.body&&typeof opts.body==='object'){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(opts.body);}return fetch(API+path,opts).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});});}

/* ─── Router ─── */
function render(){
  var app=document.getElementById('app');
  var qs=new URLSearchParams(location.search);
  var invite=qs.get('invite');
  if(invite)renderAccept(app,invite);
  else if(token()&&client())renderPortal(app);
  else renderLogin(app);
}

/* ─── Login ─── */
function renderLogin(app){
  app.innerHTML='<div class="screen"><div class="box"><img src="logo.png" alt="Ribyon Studios" class="logo"><h1>Client Portal</h1><p class="sub">Sign in to follow your projects, invoices and files.</p><input type="email" id="pEmail" placeholder="Email" autocomplete="email" onkeydown="if(event.key===\'Enter\')login()"><input type="password" id="pPass" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')login()"><button class="btn btn-primary" onclick="login()">Sign in</button><p id="pErr" class="form-error"></p><p class="hint">New here? <a href="https://ribyon-studios.vercel.app/#contact">Contact Ribyon Studios</a> to get access.</p></div></div>';
}
function login(){
  var em=document.getElementById('pEmail').value.trim();
  var pw=document.getElementById('pPass').value;
  if(!em||!pw){document.getElementById('pErr').textContent='Enter your email and password.';return;}
  api('/api/portal/login',{method:'POST',body:{email:em,password:pw}}).then(function(res){
    if(res.ok&&res.j.token){setAuth(res.j.token,res.j.client);toast('Welcome, '+res.j.client.name);render();}
    else document.getElementById('pErr').textContent=res.j.error||'Incorrect credentials.';
  }).catch(function(){document.getElementById('pErr').textContent='Cannot reach the server.';});
}

/* ─── Accept invite ─── */
function renderAccept(app,invite){
  app.innerHTML='<div class="screen"><div class="box"><span class="badge-invite">You\'ve been invited</span><img src="logo.png" alt="Ribyon Studios" class="logo"><h1>Set up your access</h1><p class="sub">Create a password to open your client portal.</p><input type="email" id="pEmail" placeholder="Email" autocomplete="email"><input type="password" id="pPass" placeholder="Create a password (6+ chars)" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')accept()"><button class="btn btn-primary" onclick="accept()">Create account</button><p id="pErr" class="form-error"></p></div></div>';
  var c=client();if(c&&c.email)document.getElementById('pEmail').value=c.email;
  document.getElementById('pEmail').focus();
}
function accept(){
  var invite=new URLSearchParams(location.search).get('invite');
  var em=document.getElementById('pEmail').value.trim();
  var pw=document.getElementById('pPass').value;
  var err=document.getElementById('pErr');
  if(!em){err.textContent='Enter your email.';return;}
  if(!pw||pw.length<6){err.textContent='Password must be at least 6 characters.';return;}
  api('/api/portal/accept',{method:'POST',body:{invite:invite,email:em,password:pw}}).then(function(res){
    if(res.ok&&res.j.token){setAuth(res.j.token,res.j.client);history.replaceState(null,'',location.pathname);toast('Welcome, '+res.j.client.name);render();}
    else err.textContent=res.j.error||'Could not activate. Check the link and email.';
  }).catch(function(){err.textContent='Cannot reach the server.';});
}

/* ─── Portal ─── */
var _data=null,_tab='overview';
function renderPortal(app){
  var c=client();
  app.innerHTML='<div class="portal"><header class="portal-head"><div class="brand"><img src="logo.png" alt="Ribyon Studios"><span class="sep"></span><span>Client Portal</span></div><div class="who"><div class="avatar">'+esc((c&&c.name||'C').charAt(0).toUpperCase())+'</div><div class="meta"><b>'+esc(c&&c.name||'')+'</b><small>'+(c&&c.email||'')+'</small></div><button class="out" onclick="logout()">Sign out</button></div></header>'+
  '<div class="tabs">'+['overview','projects','invoices','files','messages'].map(function(t){return '<button data-tab="'+t+'" onclick="showTab(\''+t+'\')" class="'+(_tab===t?'active':'')+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>';}).join('')+'</div>'+
  '<div class="portal-body"><div id="tabWrap">Loading…</div></div></div>';
  loadData();
}
function showTab(t){_tab=t;document.querySelectorAll('.tabs button').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-tab')===t);});renderTab();}
function logout(){setAuth('',null);toast('Signed out');render();}

function loadData(){
  api('/api/portal/data').then(function(res){
    if(!res.ok){if(res.j.error==='Unauthorized'){setAuth('',null);render();return;}document.getElementById('tabWrap').innerHTML='<div class="empty"><p>Could not load your data.</p></div>';return;}
    _data=res.j;renderTab();
  }).catch(function(){document.getElementById('tabWrap').innerHTML='<div class="empty"><p>Could not reach the server.</p></div>';});
}
function renderTab(){
  var w=document.getElementById('tabWrap');if(!w)return;
  var d=_data||{projects:[],invoices:[],media:[],messages:[]};
  if(_tab==='overview')w.innerHTML=overviewHtml(d);
  else if(_tab==='projects')w.innerHTML=projectsHtml(d);
  else if(_tab==='invoices')w.innerHTML=invoicesHtml(d);
  else if(_tab==='files')w.innerHTML=filesHtml(d);
  else if(_tab==='messages')w.innerHTML=messagesHtml(d);
}

/* ─── Overview ─── */
function overviewHtml(d){
  var active=(d.projects||[]).filter(function(p){return p.status==='active';}).length;
  var done=(d.projects||[]).filter(function(p){return p.status==='done';}).length;
  var out=(d.invoices||[]).reduce(function(s,i){return s+((i.balance!==undefined?i.balance:i.total)||0);},0);
  var files=(d.media||[]).length;
  return '<div class="page-hd"><div><h2>Welcome back</h2><p>Here\'s what\'s happening with '+esc(d.client&&d.client.name||'your brand')+'.</p></div></div>'+
  '<div class="stats"><div class="stat"><div class="stat-num">'+(active+done)+'</div><div class="stat-label">Projects</div><div class="stat-sub">'+active+' in progress · '+done+' done</div></div>'+
  '<div class="stat"><div class="stat-num">'+(d.invoices||[]).length+'</div><div class="stat-label">Invoices</div><div class="stat-sub">'+money(out,d.invoices&&d.invoices[0]&&d.invoices[0].currency||'KSh')+' outstanding</div></div>'+
  '<div class="stat"><div class="stat-num">'+files+'</div><div class="stat-label">Files</div><div class="stat-sub">Shared with you</div></div>'+
  '<div class="stat"><div class="stat-num">'+(d.messages||[]).length+'</div><div class="stat-label">Messages</div><div class="stat-sub">In your thread</div></div></div>'+
  '<div class="card"><div class="card-hd"><strong>Your projects</strong></div><div class="card-body">'+(d.projects&&d.projects.length?projectList(d.projects):'<p>No active projects right now.</p>')+'</div></div>';
}
function projectList(ps){
  return '<div>'+ps.map(function(p){return '<div class="proj"><div class="info"><b>'+esc(p.title)+'</b>'+(p.desc?'<div class="desc">'+esc(p.desc)+'</div>':'')+'</div><div class="meta"><span class="status status-'+(p.status||'todo')+'">'+(p.status||'todo')+'</span>'+(p.deadline?'<span class="deadline">Due '+fmt(p.deadline)+'</span>':'')+'</div></div>';}).join('')+'</div>';
}

/* ─── Projects ─── */
function projectsHtml(d){
  var ps=d.projects||[];
  return '<div class="page-hd"><div><h2>Projects</h2><p>Follow the work in real time.</p></div></div>'+
  '<div class="card"><div class="card-body">'+(ps.length?ps.map(function(p){return projectCard(p);}).join(''):'<div class="empty"><p>No projects yet — we\'ll share new ones here.</p></div>')+'</div></div>';
}
function projectCard(p){
  var st=p.status||'todo';
  var ap=classForApproval(p.approved);
  return '<div class="proj"><div class="info"><b>'+esc(p.title)+'</b>'+(p.desc?'<div class="desc">'+esc(p.desc)+'</div>':'')+'<div style="margin-top:.4rem"><span class="status status-'+st+'">'+st+'</span>'+(p.approved?' <span class="status '+ap.cls+'">'+ap.txt+'</span>':'')+'</div></div>'+
  '<div class="meta"><span class="deadline">'+(p.deadline?'Due '+fmt(p.deadline):'No deadline')+'</span></div>'+
  '<div class="actions">'+(p.approved==='approved'?'<button class="btn btn-success btn-sm" disabled>Approved</button>':'<button class="btn btn-success btn-sm" onclick="approveProject('+p.id+',true)">Approve</button>')+'<button class="btn btn-ghost btn-sm" onclick="requestChanges('+p.id+',\''+esc(p.title.replace(/\\/g,'').replace(/'/g,'&#39;'))+'\')">Needs changes</button></div></div>';
}
function classForApproval(a){
  if(a==='approved')return{cls:'status-approved',txt:'Approved'};
  if(a==='rejected')return{cls:'status-rejected',txt:'Changes requested'};
  return{cls:'status-pending',txt:'Awaiting review'};
}
function approveProject(id,ok){
  api('/api/portal/approve',{method:'POST',body:{projectId:id,approved:ok}}).then(function(res){
    if(res.ok){toast(ok?'Deliverable approved — thank you!':'Changes noted.');loadData();}
    else toast(res.j.error||'Could not update',true);
  });
}
function requestChanges(id,title){
  var note=prompt('What changes would you like for "'+title+'"?');
  if(note===null)return;
  api('/api/portal/approve',{method:'POST',body:{projectId:id,approved:false,note:note}}).then(function(res){
    if(res.ok){toast('Changes requested');loadData();}
    else toast(res.j.error||'Could not update',true);
  });
}

/* ─── Invoices ─── */
function invoicesHtml(d){
  var is=d.invoices||[];
  return '<div class="page-hd"><div><h2>Invoices</h2><p>Your billing history.</p></div></div>'+
  (is.length?'<div class="card">'+is.map(function(i){return invoiceRow(i);}).join('')+'</div>':'<div class="empty"><p>No invoices yet.</p></div>');
}
function invoiceRow(i){
  var total=i.total!==undefined?i.total:(i.amount||0);
  var bal=i.balance!==undefined?i.balance:total;
  var paid=(i.payments||[]).reduce(function(s,p){return s+(Number(p.amount)||0);},0);
  return '<div class="inv"><div class="info"><b>'+esc(i.number||('Invoice #'+i.id))+'</b><div class="sub">Issued '+fmt(i.date)+(i.dueDate?' · Due '+fmt(i.dueDate):'')+'</div></div>'+
  '<div class="amounts"><div class="total">'+money(total,i.currency)+'</div><div class="bal">'+(bal<=0?'Paid in full':(paid>0?'Paid '+money(paid,i.currency)+' · Balance '+money(bal,i.currency):'Balance '+money(bal,i.currency)))+'</div></div>'+
  '<div class="actions"><span class="status status-'+i.status+'">'+i.status+'</span><button class="btn btn-ghost btn-sm" onclick="viewInvoice('+i.id+')">View</button><button class="btn btn-ghost btn-sm" onclick="printInvoice('+i.id+')">PDF</button></div></div>';
}
function viewInvoice(id){
  var i=(_data.invoices||[]).find(function(x){return x.id===id;});if(!i)return;
  var rows=(i.items||[]).map(function(li){return '<tr><td>'+esc(li.desc)+'</td><td style="text-align:center">'+li.qty+'</td><td style="text-align:right">'+money(li.rate,i.currency)+'</td><td style="text-align:right">'+money((Number(li.qty)||0)*(Number(li.rate)||0),i.currency)+'</td></tr>';}).join('');
  var paid=(i.payments||[]).reduce(function(s,p){return s+(Number(p.amount)||0);},0);
  var total=i.total!==undefined?i.total:(i.amount||0);
  var m=document.createElement('div');m.className='screen';m.style.position='fixed';m.style.inset='0';m.style.zIndex='300';m.style.cursor='pointer';
  m.innerHTML='<div class="box" style="max-width:560px;cursor:default" onclick="event.stopPropagation()"><h1>'+esc(i.number)+'</h1><p class="sub">'+esc(i.client)+'</p>'+
  '<table style="width:100%;font-size:.82rem;border-collapse:collapse;margin:1rem 0"><thead><tr style="color:var(--stone);font-size:.66rem;text-transform:uppercase;letter-spacing:.08em"><th style="text-align:left;padding:.4rem">Item</th><th style="padding:.4rem">Qty</th><th style="text-align:right;padding:.4rem">Rate</th><th style="text-align:right;padding:.4rem">Total</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--stone-line);padding-top:.7rem;font-weight:700"><span>Total</span><span>'+money(total,i.currency)+'</span></div>'+
  '<div style="display:flex;justify-content:space-between;margin-top:.3rem;color:var(--stone)"><span>Paid</span><span>'+money(paid,i.currency)+'</span></div>'+
  '<div style="display:flex;justify-content:space-between;margin-top:.3rem;color:'+(total-paid>0?'var(--amber)':'var(--green)')+'"><span>Balance</span><span>'+money(Math.max(0,total-paid),i.currency)+'</span></div>'+
  '<button class="btn btn-ghost btn-sm" style="margin-top:1.2rem;width:100%;justify-content:center" onclick="printInvoice('+i.id+')">Download / Print PDF</button></div>';
  document.body.appendChild(m);m.addEventListener('click',function(){m.remove();});
}
function printInvoice(id){
  var i=(_data.invoices||[]).find(function(x){return x.id===id;});if(!i)return;
  var rows=(i.items||[]).map(function(li){return '<tr><td>'+esc(li.desc)+'</td><td style="text-align:center">'+li.qty+'</td><td style="text-align:right">'+(li.rate||0).toLocaleString()+'</td><td style="text-align:right">'+((Number(li.qty)||0)*(Number(li.rate)||0)).toLocaleString()+'</td></tr>';}).join('');
  var paid=(i.payments||[]).reduce(function(s,p){return s+(Number(p.amount)||0);},0);
  var total=i.total!==undefined?i.total:(i.amount||0);
  var w=window.open('','_blank');if(!w)return;
  w.document.write('<!DOCTYPE html><html><head><title>'+esc(i.number)+'</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:48px;color:#111}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{border-bottom:1px solid #ddd;padding:9px 6px;font-size:13px}th{text-align:left;font-size:11px;text-transform:uppercase;color:#666}.tot{display:flex;justify-content:space-between;margin-top:10px;font-size:14px}h1{font-size:26px;letter-spacing:-.5px}.sub{color:#666;font-size:13px}.r{text-align:right}</style></head><body><h1>'+esc(i.number)+'</h1><div class="sub">Ribyon Studios · '+esc(i.client)+'</div><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Total</th></tr></thead><tbody>'+rows+'</tbody></table><div class="tot"><strong>Total</strong><strong>'+(total||0).toLocaleString()+'</strong></div><div class="tot"><span>Paid</span><span>'+(paid||0).toLocaleString()+'</span></div><div class="tot"><span>Balance</span><span>'+Math.max(0,total-paid).toLocaleString()+'</span></div></body></html>');
  w.document.close();setTimeout(function(){w.focus();w.print();},300);
}

/* ─── Files ─── */
function filesHtml(d){
  var ms=d.media||[];
  return '<div class="page-hd"><div><h2>Files</h2><p>Assets and deliverables shared with you.</p></div></div>'+
  (ms.length?'<div class="media-grid">'+ms.map(function(m){return '<div class="media-item"><a href="'+esc(m.url||'')+'" target="_blank" rel="noopener">'+(m.url?'<img src="'+esc(m.url)+'" alt="">':'<div style="height:120px;background:var(--stone-bg);display:flex;align-items:center;justify-content:center;color:var(--stone-light)">no preview</div>')+'<div class="cap"><b>'+esc(m.name||('file-'+m.id))+'</b><small>'+fmt(m.date)+'</small><span class="dl">Download →</span></div></a></div>';}).join('')+'</div>':'<div class="empty"><p>No shared files yet.</p></div>');
}

/* ─── Messages ─── */
function messagesHtml(d){
  var ms=(d.messages||[]).slice().reverse();
  return '<div class="page-hd"><div><h2>Messages</h2><p>One thread with the Ribyon team.</p></div></div>'+
  '<div class="card"><div class="card-body"><div class="thread" id="thread">'+(ms.length?ms.map(msgBubble).join(''):'<div class="empty"><p>No messages yet — say hello!</p></div>')+'</div>'+
  '<div class="composer"><input type="text" id="msgText" placeholder="Write a message…" onkeydown="if(event.key===\'Enter\')sendMsg()"><button class="btn btn-primary" onclick="sendMsg()">Send</button></div></div></div>';
  var th=document.getElementById('thread');if(th)th.scrollTop=th.scrollHeight;
}
function msgBubble(m){
  var who=m.from==='client'?'You':'Ribyon Studios';
  return '<div class="msg '+m.from+'"><div class="who">'+who+'</div>'+esc(m.text)+'<div class="when">'+fmt(m.date)+'</div></div>';
}
function sendMsg(){
  var t=document.getElementById('msgText');if(!t)return;
  var v=t.value.trim();if(!v)return;
  api('/api/portal/message',{method:'POST',body:{text:v}}).then(function(res){
    if(res.ok){t.value='';loadData();toast('Sent');}
    else toast(res.j.error||'Could not send',true);
  });
}

render();
