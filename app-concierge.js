const STORAGE='seniorHelpersIL-concierge-v1';
const PROFILE='seniorHelpersIL-member-v3';
const engine=window.SeniorHelpersEngine;

const cats={
  Food:{icon:'🍎'},
  Housing:{icon:'🏠'},
  Bills:{icon:'💡'},
  'Money & Benefits':{icon:'💵'},
  Healthcare:{icon:'♥'}
};

const app=document.querySelector('#app');
const profileButton=document.querySelector('#profileButton');
const homeLink=document.querySelector('#homeLink');

let state=load(STORAGE,{needs:[],zip:'',medicare:'',medicaid:''});
let member=load(PROFILE,null);
let screen='needs';
let routeStage='zip';
let activeTopic=state.needs[0]||'';
let returnScreen='needs';

function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function saveMember(){if(!member?.name)return;member.updatedAt=new Date().toISOString();localStorage.setItem(PROFILE,JSON.stringify(member));syncHeader()}
function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slug(value=''){return String(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function syncHeader(){profileButton.textContent=member?'My Profile':'Create Profile'}
function shell(label,body){
  return `<section class="senior-concierge"><div class="concierge-card">
    <header class="concierge-head">
      <div class="concierge-id"><span class="concierge-mark">SH</span><div><strong>SeniorHelpersIL Guide</strong><small>No account required to see help.</small></div></div>
      <span class="concierge-step">${label}</span>
    </header>
    <div class="concierge-body">${body}</div>
  </div></section>`;
}
function render(){
  syncHeader();
  document.body.dataset.view=screen;
  if(screen==='needs')return renderNeeds();
  if(screen==='routing')return renderRouting();
  if(screen==='plan')return renderPlan();
  if(screen==='create')return renderCreate();
  if(screen==='profile')return renderProfile();
}

function renderNeeds(){
  const choices=Object.keys(cats);
  app.innerHTML=shell('Choose help',`
    <div class="concierge-message"><strong>What would you like help with today?</strong>Choose one or more.</div>
    <div class="concierge-choices">
      ${choices.map(name=>`<button type="button" class="concierge-choice ${state.needs.includes(name)?'selected':''}" data-need="${esc(name)}"><span class="concierge-choice-icon">${cats[name].icon}</span>${esc(name)}</button>`).join('')}
    </div>
    ${state.needs.length?`<div class="concierge-selected"><strong>You chose:</strong><div class="concierge-chips">${state.needs.map(name=>`<span class="concierge-chip">${cats[name].icon} ${esc(name)}</span>`).join('')}</div></div>`:''}
    <details class="concierge-why"><summary>Why am I choosing this?</summary><p>Your choices decide which Illinois programs appear in your Action Plan.</p></details>
    <div class="concierge-actions"><button type="button" class="concierge-link-button" id="clearNeeds">Clear choices</button><button type="button" class="button" id="needsContinue" ${state.needs.length?'':'disabled'}>Continue →</button></div>`);

  app.querySelectorAll('[data-need]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.need;
    state.needs=state.needs.includes(name)?state.needs.filter(x=>x!==name):[...state.needs,name];
    activeTopic=state.needs[0]||'';
    saveState();renderNeeds();
  }));
  document.querySelector('#clearNeeds').onclick=()=>{state.needs=[];activeTopic='';saveState();renderNeeds()};
  document.querySelector('#needsContinue').onclick=()=>{if(!state.needs.length)return;routeStage='zip';screen='routing';render()};
}

function renderRouting(){
  const healthcare=state.needs.includes('Healthcare');
  if(!healthcare && (routeStage==='medicare'||routeStage==='medicaid'))routeStage='review';

  if(routeStage==='zip'){
    app.innerHTML=shell('Location',`
      <div class="concierge-message"><strong>What is your Illinois ZIP code?</strong>I use this to point you toward nearby help.</div>
      <input id="routeZip" class="concierge-input" inputmode="numeric" maxlength="5" value="${esc(state.zip)}" placeholder="60625" aria-label="Illinois ZIP code">
      <details class="concierge-why"><summary>Why do you need my ZIP?</summary><p>Many programs serve specific areas. Your ZIP makes the results more useful.</p></details>
      <p class="concierge-error" id="zipError" hidden>Enter a 5-digit Illinois ZIP code.</p>
      <div class="concierge-actions"><button type="button" class="concierge-link-button" id="routeBack">← Back</button><button type="button" class="button" id="zipNext">${healthcare?'Continue →':'Review my answers →'}</button></div>`);
    document.querySelector('#routeBack').onclick=()=>{screen='needs';render()};
    document.querySelector('#zipNext').onclick=()=>{
      const zip=document.querySelector('#routeZip').value.trim();
      if(!/^6\d{4}$/.test(zip)){document.querySelector('#zipError').hidden=false;return;}
      state.zip=zip;saveState();routeStage=healthcare?'medicare':'review';renderRouting();
    };
    return;
  }

  if(routeStage==='medicare'||routeStage==='medicaid'){
    const key=routeStage;
    const isMedicare=key==='medicare';
    const current=state[key]||'';
    app.innerHTML=shell(isMedicare?'Medicare':'Medicaid',`
      <div class="concierge-message"><strong>Do you have ${isMedicare?'Medicare':'Medicaid'}?</strong>If you are unsure, choose “Not sure.”</div>
      <div class="concierge-choices concierge-single">
        ${['Yes','No','Not sure'].map(v=>`<button type="button" class="concierge-choice ${current===v?'selected':''}" data-answer="${v}">${v}</button>`).join('')}
      </div>
      <details class="concierge-why"><summary>Why do you ask this?</summary><p>${isMedicare?'This helps me show Medicare cost-saving programs only when they may apply.':'Medicaid can change which assistance and Medicare options are most useful.'}</p></details>
      <div class="concierge-actions"><button type="button" class="concierge-link-button" id="routePrev">← Back</button><button type="button" class="button" id="answerNext" ${current?'':'disabled'}>${isMedicare?'Continue →':'Review my answers →'}</button></div>`);
    app.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{state[key]=button.dataset.answer;saveState();renderRouting()});
    document.querySelector('#routePrev').onclick=()=>{routeStage=isMedicare?'zip':'medicare';renderRouting()};
    document.querySelector('#answerNext').onclick=()=>{if(!state[key])return;routeStage=isMedicare?'medicaid':'review';renderRouting()};
    return;
  }

  app.innerHTML=shell('Review',`
    <div class="concierge-message"><strong>Here is what I heard.</strong>Please check this before I build your Action Plan.</div>
    <div class="concierge-review">
      <div class="concierge-review-row"><span>Help with</span><strong>${state.needs.map(esc).join(', ')}</strong></div>
      <div class="concierge-review-row"><span>ZIP code</span><strong>${esc(state.zip)}</strong></div>
      ${healthcare?`<div class="concierge-review-row"><span>Medicare</span><strong>${esc(state.medicare||'Not answered')}</strong></div><div class="concierge-review-row"><span>Medicaid</span><strong>${esc(state.medicaid||'Not answered')}</strong></div>`:''}
    </div>
    <div class="concierge-actions"><button type="button" class="concierge-link-button" id="editAnswers">Change an answer</button><button type="button" class="button" id="showPlan">Show my Action Plan →</button></div>
    <div class="concierge-trust"><span>✓</span><div><strong>No account required.</strong> Your answers are used to build this Action Plan on this device.</div></div>`);
  document.querySelector('#editAnswers').onclick=()=>{routeStage='zip';renderRouting()};
  document.querySelector('#showPlan').onclick=()=>{activeTopic=state.needs[0]||'';screen='plan';render()};
}

function recommendations(){return engine?.recommendations(state,member)||[]}
function resourceCard(item,primary=false){
  const saved=member?.savedPrograms?.some(x=>x.id===item.id);
  return `<article class="concierge-resource ${primary?'primary':''} category-${slug(item.category)}">
    <div class="concierge-resource-copy"><span class="category-label">${cats[item.category]?.icon||'•'} ${esc(item.category)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><small>${esc(item.source)}</small></div>
    <div class="concierge-resource-actions"><a class="button" href="${item.url}" target="_blank" rel="noopener">${esc(item.actionLabel||'Open resource')}</a>${member?`<button type="button" class="button secondary" data-save="${item.id}">${saved?'Saved ✓':'Save to profile'}</button>`:''}</div>
  </article>`;
}
function renderPlan(){
  const all=recommendations();
  if(!activeTopic||!state.needs.includes(activeTopic))activeTopic=state.needs[0]||'';
  const items=all.filter(x=>x.category===activeTopic);
  const first=items[0];
  const more=items.slice(1);
  app.innerHTML=`
    ${shell('Action Plan',`
      <div class="concierge-message"><strong>Here’s where I’d start.</strong>${first?esc(first.title):'I found your next steps.'}</div>
      ${state.needs.length>1?`<div class="concierge-topic-jump">${state.needs.map(topic=>`<button type="button" class="${topic===activeTopic?'active':''}" data-topic="${esc(topic)}">${cats[topic].icon} ${esc(topic)}</button>`).join('')}</div>`:''}
      ${first?.reason?`<details class="concierge-why"><summary>Why is this first?</summary><p>${esc(first.reason)}</p></details>`:''}
    `)}
    <section class="concierge-results">
      ${first?resourceCard(first,true):'<p>No recommendation is available for this topic yet.</p>'}
      ${more.length?`<details class="concierge-more"><summary>More ${esc(activeTopic.toLowerCase())} help</summary><div class="concierge-more-list">${more.map(x=>resourceCard(x)).join('')}</div></details>`:''}
    </section>
    <section class="concierge-plan-footer">
      ${member?`<button type="button" class="button secondary" id="openProfileFromPlan">My Profile</button>`:`<button type="button" class="button secondary" id="savePlan">Save this plan</button>`}
      <button type="button" class="concierge-link-button" id="changeAnswers">Change answers</button>
      <button type="button" class="concierge-link-button" id="startOver">Start over</button>
    </section>`;

  app.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>{activeTopic=button.dataset.topic;renderPlan()});
  app.querySelectorAll('[data-save]').forEach(button=>button.onclick=()=>{
    const item=all.find(x=>x.id===button.dataset.save);if(!item)return;
    member.savedPrograms=member.savedPrograms||[];
    if(!member.savedPrograms.some(x=>x.id===item.id))member.savedPrograms.push({...item,status:'Saved'});
    saveMember();renderPlan();
  });
  document.querySelector('#savePlan')?.addEventListener('click',()=>{returnScreen='plan';screen='create';render()});
  document.querySelector('#openProfileFromPlan')?.addEventListener('click',()=>{returnScreen='plan';screen='profile';render()});
  document.querySelector('#changeAnswers').onclick=()=>{routeStage='zip';screen='routing';render()};
  document.querySelector('#startOver').onclick=restart;
}

function renderCreate(){
  app.innerHTML=shell('Save plan',`
    <div class="concierge-message"><strong>Save your Action Plan.</strong>Only your name is required.</div>
    <form id="createProfileForm" class="concierge-form">
      <label>Name<input id="newName" autocomplete="name" required></label>
      <label>Email <span>(optional)</span><input id="newEmail" type="email" autocomplete="email"></label>
      <label>Cell phone <span>(optional)</span><input id="newPhone" type="tel" autocomplete="tel"></label>
      <div class="concierge-actions"><button type="button" class="concierge-link-button" id="cancelCreate">Cancel</button><button class="button">Save my plan</button></div>
    </form>`);
  document.querySelector('#cancelCreate').onclick=()=>{screen=returnScreen;render()};
  document.querySelector('#createProfileForm').onsubmit=e=>{
    e.preventDefault();const name=document.querySelector('#newName').value.trim();if(!name)return;
    member={name,email:document.querySelector('#newEmail').value.trim(),phone:document.querySelector('#newPhone').value.trim(),zip:state.zip,dob:'',contact:'',coverage:{medicare:state.medicare||'',medicaid:state.medicaid||'',lis:'',msp:'',plan:'',snap:'',housing:'',utilities:''},health:{doctors:'',hospitals:'',drugs:'',pharmacy:''},household:{size:'',income:'',savings:''},helpAreas:[...state.needs],savedPrograms:recommendations().map(x=>({...x,status:'Recommended'})),permissions:{emailPlan:false,textPlan:false,medicareContact:false},createdAt:new Date().toISOString()};
    saveMember();screen=returnScreen==='needs'?'plan':returnScreen;render();
  };
}

function renderProfile(){
  if(!member){returnScreen='needs';screen='create';return render()}
  const saved=member.savedPrograms||[];
  app.innerHTML=shell('My Profile',`
    <div class="concierge-message"><strong>${esc(member.name)}’s profile</strong>Keep the details that make future help easier.</div>
    <form id="profileForm" class="concierge-form profile-grid">
      <label>Name<input id="pName" value="${esc(member.name)}" required></label>
      <label>ZIP<input id="pZip" value="${esc(member.zip||'')}"></label>
      <label>Email<input id="pEmail" type="email" value="${esc(member.email||'')}"></label>
      <label>Cell phone<input id="pPhone" type="tel" value="${esc(member.phone||'')}"></label>
      <label>Current Medicare plan<input id="pPlan" value="${esc(member.coverage?.plan||'')}"></label>
      <label>Preferred pharmacy<input id="pPharmacy" value="${esc(member.health?.pharmacy||'')}"></label>
      <label class="full">Doctors<textarea id="pDoctors">${esc(member.health?.doctors||'')}</textarea></label>
      <label class="full">Medicines<textarea id="pDrugs">${esc(member.health?.drugs||'')}</textarea></label>
      <div class="concierge-actions full"><button type="button" class="concierge-link-button" id="backFromProfile">← Back</button><button class="button">Save profile</button></div>
    </form>
    <details class="concierge-more profile-programs"><summary>Saved programs (${saved.length})</summary><div class="concierge-more-list">${saved.map(item=>`<div class="saved-program"><strong>${esc(item.title)}</strong><select data-status="${item.id}">${['Recommended','Saved','Applied','Completed','Not interested'].map(s=>`<option ${item.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')||'<p>No saved programs yet.</p>'}</div></details>`);
  document.querySelector('#backFromProfile').onclick=()=>{screen=returnScreen;render()};
  document.querySelector('#profileForm').onsubmit=e=>{e.preventDefault();member.name=document.querySelector('#pName').value.trim()||member.name;member.zip=document.querySelector('#pZip').value.trim();member.email=document.querySelector('#pEmail').value.trim();member.phone=document.querySelector('#pPhone').value.trim();member.coverage={...member.coverage,plan:document.querySelector('#pPlan').value.trim()};member.health={...member.health,pharmacy:document.querySelector('#pPharmacy').value.trim(),doctors:document.querySelector('#pDoctors').value.trim(),drugs:document.querySelector('#pDrugs').value.trim()};saveMember();renderProfile()};
  app.querySelectorAll('[data-status]').forEach(select=>select.onchange=()=>{const item=member.savedPrograms.find(x=>x.id===select.dataset.status);if(item)item.status=select.value;saveMember()});
}

function restart(){state={needs:[],zip:'',medicare:'',medicaid:''};saveState();activeTopic='';routeStage='zip';screen='needs';render()}

profileButton.onclick=()=>{returnScreen=screen==='profile'?'needs':screen;screen=member?'profile':'create';render()};
homeLink.onclick=e=>{e.preventDefault();screen='needs';render()};
render();