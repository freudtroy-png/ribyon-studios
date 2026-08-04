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
  app.innerHTML='<div class="portal"><header class="portal-head"><div class="brand"><img src="logo.png" alt="Ribyon Studios"><span class="sep"></span><span>Client Portal</span></div><div class="who"><div class="avatar">'+esc((c&&(c.displayName||c.name)||'C').charAt(0).toUpperCase())+'</div><div class="meta"><b>'+esc(c&&(c.displayName||c.name)||'')+'</b><small>'+(c&&c.email||'')+'</small></div><button class="out" onclick="logout()">'+ic('logout')+' Sign out</button></div></header>'+
  '<div class="tabs"><button class="tab-back" id="tabBack" onclick="tabBack()" style="display:none" title="Back">'+ic('back')+'</button>'+['overview','projects','invoices','files','activity','messages','settings'].map(function(t){return '<button data-tab="'+t+'" onclick="showTab(\''+t+'\')" class="'+(_tab===t?'active':'')+'">'+tabLabel(t)+'</button>';}).join('')+'</div>'+
  '<div class="portal-body"><div id="tabWrap">Loading…</div></div></div>';
  loadData();
}
function tabLabel(t){return{overview:'Overview',projects:'Projects',invoices:'Invoices',files:'Files',activity:'What\'s new',messages:'Messages',settings:'Settings'}[t]||t;}
var _tabHistory=[];
function showTab(t){
  if(t!==_tab){_tabHistory.push(_tab);if(_tabHistory.length>20)_tabHistory.shift();}
  _tab=t;document.querySelectorAll('.tabs button').forEach(function(b){if(b.classList.contains('tab-back'))return;b.classList.toggle('active',b.getAttribute('data-tab')===t);});renderTab();updateTabBack();
}
function tabBack(){if(_tabHistory.length){showTab(_tabHistory.pop());return;}showTab('overview');}
function updateTabBack(){var b=document.getElementById('tabBack');if(b)b.style.display=_tabHistory.length?'inline-flex':'none';}
function logout(){setAuth('',null);toast('Signed out');render();}

function loadData(silent){
  api('/api/portal/data').then(function(res){
    if(!res.ok){if(res.j.error==='Unauthorized'){setAuth('',null);render();return;}if(!silent)document.getElementById('tabWrap').innerHTML='<div class="empty"><p>Could not load your data.</p></div>';return;}
    _data=res.j;renderTab();
    if(_tab==='messages'){markRead();scrollChat();}
  }).catch(function(){if(!silent)document.getElementById('tabWrap').innerHTML='<div class="empty"><p>Could not reach the server.</p></div>';});
}
function renderTab(){
  var w=document.getElementById('tabWrap');if(!w)return;
  var d=_data||{projects:[],invoices:[],media:[],messages:[],feed:[]};
  if(_tab==='overview')w.innerHTML=overviewHtml(d);
  else if(_tab==='projects')w.innerHTML=projectsHtml(d);
  else if(_tab==='invoices')w.innerHTML=invoicesHtml(d);
  else if(_tab==='files')w.innerHTML=filesHtml(d);
  else if(_tab==='activity')w.innerHTML=activityHtml(d);
  else if(_tab==='settings')w.innerHTML=settingsHtml(d);
  else if(_tab==='messages'){w.innerHTML=messagesHtml(d);startMsgPoll();scrollChat();}
  updateTabBadges();
}
function scrollChat(){var th=document.getElementById('thread');if(th)th.scrollTop=th.scrollHeight;}
function updateTabBadges(){
  var d=_data||{};
  var unread=(d.messages||[]).filter(function(m){return m.from==='ribyon'&&!m.clientRead;}).length;
  var btn=document.querySelector('.tabs button[data-tab="messages"]');
  if(btn)btn.classList.toggle('has-unread',unread>0);
  var fresh=(d.feed||[]).filter(function(f){var s=(Date.now()-new Date(f.date).getTime())/1000;return s<86400;}).length;
  var abtn=document.querySelector('.tabs button[data-tab="activity"]');
  if(abtn&&fresh>0)abtn.classList.add('has-unread');
}

/* ─── Overview ─── */
function overviewHtml(d){
  var active=(d.projects||[]).filter(function(p){return p.status==='active';}).length;
  var done=(d.projects||[]).filter(function(p){return p.status==='done';}).length;
  var out=(d.invoices||[]).reduce(function(s,i){return s+((i.balance!==undefined?i.balance:i.total)||0);},0);
  var files=(d.media||[]).length;
  return '<div class="page-hd"><div><h2>Welcome back</h2><p>Here\'s what\'s happening with '+esc(d.client&&d.client.name||'your brand')+'.</p></div><button class="btn btn-pay btn-sm" onclick="showTab(\'settings\')">'+ic('plus')+' New project</button></div>'+
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
  var milestones=(p.milestones||[]);
  var doneM=milestones.filter(function(m){return m.done;}).length;
  var pct=milestones.length?Math.round(doneM/milestones.length*100):0;
  return '<div class="proj" style="align-items:flex-start"><div class="info"><b>'+esc(p.title)+'</b>'+(p.desc?'<div class="desc">'+esc(p.desc)+'</div>':'')+
  '<div style="margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.4rem"><span class="status status-'+st+'">'+st+'</span>'+(p.approved?' <span class="status '+ap.cls+'">'+ap.txt+'</span>':'')+'</div>'+
  (milestones.length?'<div class="proj-miles"><div class="mile-prog"><div class="mile-prog-track"><div class="mile-prog-fill" style="width:'+pct+'%"></div></div><span class="mile-prog-txt">'+doneM+'/'+milestones.length+' complete</span></div>'+milestones.map(function(m,i){var done=m.done||false;return '<div class="mile '+(done?'on':'')+'"><span class="mile-dot '+(done?'on':'')+'"></span><span>'+esc(m.label||m.title||'')+'</span>'+(m.date?'<small>'+fmt(m.date)+'</small>':'')+(done&&m.approved!=='approved'?'<button class="btn btn-ghost btn-xs" onclick="approveMilestone('+p.id+','+i+',true)">Approve</button>':(done&&m.approved==='approved'?'<span class="mile-ok">'+ic('check')+' approved</span>':''))+'</div>';}).join('')+'</div>':'')+
  '</div><div class="meta"><span class="deadline">'+(p.deadline?'Due '+fmt(p.deadline):'No deadline')+'</span></div>'+
  '<div class="actions">'+(p.approved==='approved'?'<button class="btn btn-success btn-sm" disabled>Approved</button>':'<button class="btn btn-success btn-sm" onclick="approveProject('+p.id+',true)">Approve</button>')+'<button class="btn btn-ghost btn-sm" onclick="requestChanges('+p.id+',\''+esc(p.title.replace(/\\/g,'').replace(/'/g,'&#39;'))+'\')">Needs changes</button></div></div>';
}
function approveMilestone(pid,idx,ok){
  api('/api/portal/milestone',{method:'POST',body:{projectId:pid,milestoneIndex:idx,approved:ok}}).then(function(res){
    if(res.ok){toast(ok?'Milestone approved!':'Milestone marked for changes.');loadData();}
    else toast(res.j.error||'Could not update',true);
  });
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
  var overdue=bal>0&&i.dueDate&&new Date(i.dueDate)<new Date();
  return '<div class="inv"><div class="info"><b>'+esc(i.number||('Invoice #'+i.id))+'</b><div class="sub">Issued '+fmt(i.date)+(i.dueDate?' · Due '+fmt(i.dueDate):'')+'</div></div>'+
  '<div class="amounts"><div class="total">'+money(total,i.currency)+'</div><div class="bal '+(overdue?'bal-ow':'')+'">'+(bal<=0?'Paid in full':(paid>0?'Paid '+money(paid,i.currency)+' · Balance '+money(bal,i.currency):'Balance '+money(bal,i.currency)))+'</div></div>'+
  '<div class="actions"><span class="status status-'+i.status+'">'+i.status+'</span>'+(bal>0?'<button class="btn btn-pay btn-sm" onclick="payInvoice('+i.id+')">'+ic('pay')+' Pay now</button>':'')+'<button class="btn btn-ghost btn-sm" onclick="viewInvoice('+i.id+')">View</button><button class="btn btn-ghost btn-sm" onclick="printInvoice('+i.id+')">PDF</button></div></div>';
}
function payInvoice(id){
  var i=(_data.invoices||[]).find(function(x){return x.id===id;});if(!i)return;
  var total=i.total!==undefined?i.total:(i.amount||0);
  var paid=(i.payments||[]).reduce(function(s,p){return s+(Number(p.amount)||0);},0);
  var bal=Math.max(0,total-paid);
  var m=document.createElement('div');m.className='screen';m.style.position='fixed';m.style.inset='0';m.style.zIndex='300';m.style.cursor='pointer';
  m.innerHTML='<div class="box" style="max-width:400px;cursor:default" onclick="event.stopPropagation()"><h1>Pay '+esc(i.number)+'</h1><p class="sub">Settle your balance securely — we\'ll confirm the payment and update the invoice.</p>'+
  '<div class="pay-box"><div class="pay-label">Amount due</div><div class="pay-amt">'+money(bal,i.currency)+'</div></div>'+
  '<button class="btn btn-pay" style="width:100%;justify-content:center" onclick="payNow('+id+','+bal+')">'+ic('pay')+' Confirm payment</button>'+
  '<p class="hint" style="text-align:center">You\'ll receive a receipt by email.</p></div>';
  document.body.appendChild(m);m.addEventListener('click',function(){m.remove();});
}
function payNow(id,amt){
  api('/api/portal/pay',{method:'POST',body:{invoiceId:id,amount:amt}}).then(function(res){
    if(res.ok){toast('Payment received — thank you!');loadData();}
    else toast(res.j.error||'Could not process payment',true);
  });
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
  return '<div class="page-hd"><div><h2>Files</h2><p>Assets, deliverables and documents shared with you.</p></div><div class="page-hd-actions"><button class="btn btn-primary" onclick="document.getElementById(\'portalUp\').click()">▲ Upload file</button><input type="file" id="portalUp" style="display:none" onchange="portalUpload(this.files[0])"></div></div>'+
  (ms.length?'<div class="media-grid">'+ms.map(function(m){return '<div class="media-item"><a href="'+esc(m.url||'')+'" target="_blank" rel="noopener">'+(m.url&&/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i.test(m.url)?'<img src="'+esc(m.url)+'" alt="">':'<div style="height:120px;background:var(--stone-bg);display:flex;align-items:center;justify-content:center;color:var(--stone-light)">'+esc((m.name||'').split('.').pop().toUpperCase())+'</div>')+'<div class="cap"><b>'+esc(m.name||('file-'+m.id))+'</b><small>'+fmt(m.date)+(m.fromPortal?' · you':'')+'</small><span class="dl">Download →</span></div></a></div>';}).join('')+'</div>':'<div class="empty"><p>No shared files yet.</p></div>');
}
function portalUpload(file){
  if(!file)return;
  if(file.size>10*1024*1024){alert('File too large — limit 10 MB');return;}
  var f=new FormData();f.append('file',file);
  var btn=document.querySelector('#portalUp');
  fetch(API+'/api/portal/upload',{method:'POST',headers:{'Authorization':'Bearer '+token()},body:f})
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
    .then(function(res){
      if(res.ok){toast('Uploaded');loadData(true);}
      else{alert(res.j.error||'Upload failed');}
    })
    .catch(function(){alert('Upload failed — try again');});
}

/* ─── Activity feed ─── */
function activityHtml(d){
  var feed=d.feed||[];
  var groups={};
  feed.forEach(function(f){var k=dayLabel(f.date);(groups[k]=groups[k]||[]).push(f);});
  var days=Object.keys(groups);
  return '<div class="page-hd"><div><h2>What\'s new</h2><p>Project updates, approvals, payments and messages — all in one place.</p></div></div>'+
  (days.length?'<div class="card"><div class="card-body">'+days.map(function(k){
    return '<div class="feed-day"><div class="feed-day-label">'+esc(k)+'</div>'+groups[k].map(feedItem).join('')+'</div>';
  }).join('')+'</div></div>':'<div class="empty"><p>Nothing here yet. Activity will appear as your projects move.</p></div>');
}
function feedItem(f){
  var ico={approval:ic('approve'),payment:ic('pay'),message:ic('msg'),milestone:ic('flag'),request:ic('plus'),profile:ic('user'),project:ic('proj')}[f.type]||ic('dot');
  return '<div class="feed-item"><div class="feed-ico">'+ico+'</div><div class="feed-body"><div class="feed-text">'+esc(f.text)+'</div><div class="feed-time">'+feedTime(f.date)+'</div></div></div>';
}
function feedTime(d){var x=new Date(d);if(isNaN(x))return'';return x.toLocaleString(undefined,{hour:'2-digit',minute:'2-digit'});}

/* ─── Settings ─── */
function settingsHtml(d){
  var c=d.client||{};
  return '<div class="page-hd"><div><h2>Settings</h2><p>Manage your profile and preferences.</p></div></div>'+
  '<div class="card"><div class="card-hd"><strong>Profile</strong></div><div class="card-body"><div class="field"><label>Display name</label><input id="setName" value="'+esc(c.displayName||c.name||'')+'"></div>'+
  '<div class="field"><label>Phone</label><input id="setPhone" value="'+esc(c.phone||'')+'" placeholder="+254 700 000 000"></div>'+
  '<div class="field"><label>Email</label><input value="'+esc(c.email||'')+'" disabled></div>'+
  '<div class="field"><label>Notify me by email about</label><label class="check"><input type="checkbox" id="setPrefMsg"'+(c.prefs&&c.prefs.email!==false?' checked':'')+'> New messages and replies</label>'+
  '<label class="check"><input type="checkbox" id="setPrefInv"'+(c.prefs&&c.prefs.invoices!==false?' checked':'')+'> Invoices and payments</label></div>'+
  '<button class="btn btn-primary" onclick="saveProfile()">'+ic('check')+' Save changes</button></div></div>'+
  '<div class="card"><div class="card-hd"><strong>Security</strong></div><div class="card-body"><div class="field"><label>New password</label><input type="password" id="setPass" placeholder="6+ characters"></div>'+
  '<button class="btn btn-ghost" onclick="savePassword()">Update password</button></div></div>'+
  '<div class="card"><div class="card-hd"><strong>New project request</strong></div><div class="card-body"><p class="sub" style="margin:0 0 .8rem">Tell us about your next idea — we\'ll get back to you with a quote.</p>'+
  '<div class="field"><label>Project title</label><input id="reqTitle" placeholder="e.g. Brand refresh for launch"></div>'+
  '<div class="field"><label>Details</label><textarea id="reqDetails" rows="3" placeholder="What do you need? Scope, timeline, budget…"></textarea></div>'+
  '<button class="btn btn-pay" onclick="requestProject()">'+ic('plus')+' Send request</button></div></div>';
}
function saveProfile(){
  var name=document.getElementById('setName').value.trim();
  var phone=document.getElementById('setPhone').value.trim();
  var prefs={email:document.getElementById('setPrefMsg').checked,invoices:document.getElementById('setPrefInv').checked};
  api('/api/portal/profile',{method:'POST',body:{name:name,phone:phone,prefs:prefs}}).then(function(res){
    if(res.ok){var c=client();if(c&&res.j.client){res.j.client.email=c.email;setAuth(token(),res.j.client);}toast('Profile saved');loadData();}
    else toast(res.j.error||'Could not save',true);
  });
}
function savePassword(){
  var pw=document.getElementById('setPass').value;
  if(!pw||pw.length<6){toast('Password must be 6+ characters',true);return;}
  api('/api/portal/profile',{method:'POST',body:{password:pw}}).then(function(res){
    if(res.ok){document.getElementById('setPass').value='';toast('Password updated');}
    else toast(res.j.error||'Could not update',true);
  });
}
function requestProject(){
  var title=document.getElementById('reqTitle').value.trim();
  var details=document.getElementById('reqDetails').value.trim();
  if(!title){toast('Give your request a title',true);return;}
  api('/api/portal/request',{method:'POST',body:{title:title,details:details}}).then(function(res){
    if(res.ok){document.getElementById('reqTitle').value='';document.getElementById('reqDetails').value='';toast('Request sent — we\'ll be in touch!');loadData();}
    else toast(res.j.error||'Could not send',true);
  });
}

/* ─── Messages (chat) ─── */
var _msgTimer=null;
function messagesHtml(d){
  var ms=d.messages||[];
  var unread=(ms||[]).filter(function(m){return m.from==='ribyon'&&!m.clientRead;}).length;
  return '<div class="page-hd"><div><h2>Messages</h2><p>Chat with the Ribyon team.</p></div>'+(unread?'<span class="status status-sent">'+unread+' new</span>':'')+'</div>'+
  '<div class="chat"><div class="chat-head"><div class="chat-avatar">R</div><div class="chat-meta"><b>Ribyon Studios</b><small>'+teamStatus(ms)+'</small></div><div class="chat-spacer"></div><button class="btn btn-ghost btn-sm" onclick="refreshMessages()">'+ic('refresh')+' Refresh</button></div>'+
  '<div class="chat-body" id="thread">'+(ms.length?chatItems(ms):chatEmpty())+'</div>'+
  '<div class="chat-composer"><textarea id="msgText" rows="1" placeholder="Write a message…" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendMsg();}"></textarea><button class="btn btn-primary" onclick="sendMsg()">Send</button></div></div>';
}
function teamStatus(ms){
  var last=ms[ms.length-1];
  if(!last)return'Typically replies within a day';
  return last.from==='client'?'Online · usually replies in a few hours':'Ribyon team';
}
function chatEmpty(){
  return '<div class="chat-empty"><div class="chat-empty-ico">'+ic('chat')+'</div><p>No messages yet.</p><span>Say hello — we respond within a day.</span></div>';
}
function chatItems(ms){
  var out='';var prevDate='';
  ms.forEach(function(m){
    var day=dayLabel(m.date);
    if(day!==prevDate){out+='<div class="chat-divider"><span>'+day+'</span></div>';prevDate=day;}
    out+=chatBubble(m);
  });
  return out;
}
function dayLabel(d){
  var x=new Date(d);if(isNaN(x))return fmt(d);
  var todayS=new Date();var y=new Date(todayS);y.setDate(y.getDate()-1);
  var same=function(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();};
  if(same(x,todayS))return'Today';
  if(same(x,y))return'Yesterday';
  return x.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
}
function chatTime(d){var x=new Date(d);if(isNaN(x))return'';return x.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});}
function chatBubble(m){
  var mine=m.from==='client';
  var ticks='<span class="ticks">'+((m.read===true&&mine)||(m.clientRead===true&&!mine)?'✓✓':'✓')+'</span>';
  return '<div class="chat-row '+(mine?'mine':'theirs')+'"><div class="chat-bubble">'+(m.text||'').split('\n').map(function(l){return esc(l);}).join('<br>')+'<div class="chat-meta-line">'+chatTime(m.date)+ticks+'</div></div></div>';
}
function chatAvatar(letter){return '<div class="chat-avatar">'+esc(letter)+'</div>';}
function ic(name){
  var icons={
    refresh:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 8a5.5 5.5 0 10-1.6 3.9"/><path d="M13.5 5v3h-3"/></svg>',
    chat:'<svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1.5 8a6 6 0 0110.5-4M14.5 8a6 6 0 01-10.5 4"/><path d="M12 4.5v3.5M13.75 6.25h-3.5"/></svg>',
    send:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 8L13.5 2.5 11 13.5 8 10 2.5 8z"/></svg>',
    logout:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3H3.5a1 1 0 00-1 1v8a1 1 0 001 1H10"/><path d="M12.5 8H6.5M10.5 5.5L13 8l-2.5 2.5"/></svg>',
    pay:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 6.5h13M4.5 10h2.5"/></svg>',
    check:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8.5l3.2 3.2L13 5"/></svg>',
    plus:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3v10M3 8h10"/></svg>',
    approve:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/><path d="M5.5 8.2l1.7 1.7 3.3-3.6"/></svg>',
    msg:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 3.5h11v8h-7l-3 2.5V11.5h-1z"/></svg>',
    flag:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 14V2.5M4 3h8l-2 2.5 2 2.5H4"/></svg>',
    user:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5" r="2.5"/><path d="M3.5 13.5c.7-2 2.4-3 4.5-3s3.8 1 4.5 3"/></svg>',
    proj:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="3" width="11" height="10" rx="1.5"/><path d="M6 6.5h4M6 9h2.5"/></svg>',
    dot:'<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2"/></svg>',
    back:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10.5 2.5L5 8l5.5 5.5"/></svg>'
  };
  return icons[name]||'';
}
function sendMsg(){
  var t=document.getElementById('msgText');if(!t)return;
  var v=t.value.trim();if(!v)return;
  t.value='';autosize(t);
  api('/api/portal/message',{method:'POST',body:{text:v}}).then(function(res){
    if(res.ok){toast('Sent');loadData(true);}
    else {t.value=v;autosize(t);toast(res.j.error||'Could not send',true);}
  });
}
function autosize(t){if(t){t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px';}}
function refreshMessages(){
  api('/api/portal/data').then(function(res){
    if(res.ok){_data=res.j;renderTab();markRead();}
  });
}
function startMsgPoll(){
  clearInterval(_msgTimer);
  _msgTimer=setInterval(function(){if(_tab==='messages')refreshMessages();},10000);
}
function markRead(){
  api('/api/portal/read',{method:'POST',body:{mark:'client'}});
}

render();
