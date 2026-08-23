const STORAGE='seniorHelpersIL-v4';
const PROFILE='seniorHelpersIL-member-v3';
const engine=window.SeniorHelpersEngine;

const cats={
  Food:{icon:'🍎',note:'Food pantries, SNAP, and senior meals.'},
  Housing:{icon:'🏠',note:'Shelter, rent help, and affordable housing.'},
  Bills:{icon:'💡',note:'Utility bills and household expenses.'},
  'Money & Benefits':{icon:'💵',note:'Benefits, budgeting, and money support.'},
  Healthcare:{icon:'♥',note:'Medicaid, Medicare costs, and prescriptions.'}
};

const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const intro=document.querySelector('#pageIntro');
const stepLabel=document.querySelector('#stepLabel');
const stepName=document.querySelector('#stepName');
const progress=document.querySelector('#progressFill');
const profileButton=document.querySelector('#profileButton');
const restartButton=document.querySelector('#restartButton');
const homeLink=document.querySelector('#homeLink');

let state=load(STORAGE,{needs:[],zip:'',medicare:'',medicaid:''});
let member=load(PROFILE,null);
let step=1;
let view='flow';
let filter='All';

function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function saveMember(){if(!member?.name)return;member.updatedAt=new Date().toISOString();localStorage.setItem(PROFILE,JSON.stringify(member));syncHeader()}
function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slug(value=''){return String(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function show(el,msg){el.textContent=msg;el.hidden=false}
function syncHeader(){profileButton.textContent=member?'My Profile':'Create Profile'}
function setHead(head,sub,n){title.textContent=head;intro.textContent=sub;stepLabel.textContent=`Step ${n} of 3`;stepName.textContent=['Choose help','Location','Action Plan'][n-1];progress.style.width=`${n===1?33.33:n===2?66.66:100}%`;window.scrollTo({top:0,behavior:'smooth'})}
function render(){syncHeader();if(view==='profile')return renderProfile();if(view==='create')return renderCreate();if(step===1)return renderNeeds();if(step===2)return renderRouting();return renderPlan()}

function renderNeeds(){
  setHead('What do you need help with?','Choose every area that matters.',1);
  app.innerHTML=`<form id="needsForm"><div class="help-grid">${Object.entries(cats).map(([name,data])=>`<label class="help-card ${state.needs.includes(name)?'selected':''}"><input type="checkbox" value="${esc(name)}" ${state.needs.includes(name)?'checked':''}><span class="help-icon">${data.icon}</span><span><span class="help-title">${name}</span><span class="help-note">${data.note}</span></span><span class="help-check">✓</span></label>`).join('')}</div><p class="error" id="needErr" hidden>Choose at least one area.</p><div class="actions"><button class="button">Continue →</button></div></form>`;
  document.querySelectorAll('.help-card').forEach(card=>card.onchange=()=>card.classList.toggle('selected',card.querySelector('input').checked));
  document.querySelector('#needsForm').onsubmit=e=>{e.preventDefault();const selected=[...document.querySelectorAll('.help-card input:checked')].map(x=>x.value);if(!selected.length)return document.querySelector('#needErr').hidden=false;state.needs=selected;saveState();step=2;render()};
}

function optionRow(label,name,values,current){return `<div class="form-section field"><span class="group-label">${label}</span><div class="segment-grid">${values.map(value=>`<label class="segment ${current===value?'selected':''}"><input type="radio" name="${name}" value="${value}" ${current===value?'checked':''}><span>${value}</span></label>`).join('')}</div></div>`}
function bindSegments(){document.querySelectorAll('.segment').forEach(segment=>segment.onclick=()=>setTimeout(()=>{const name=segment.querySelector('input').name;document.querySelectorAll(`[name="${name}"]`).forEach(input=>input.closest('.segment').classList.toggle('selected',input.checked))},0))}
function renderRouting(){
  const healthcare=state.needs.includes('Healthcare');
  setHead('Where should we look?','Your ZIP finds nearby Illinois help.',2);
  app.innerHTML=`<form class="form-card" id="routingForm"><div class="field"><label class="field-label" for="zip">Illinois ZIP code</label><input id="zip" class="zip-input" inputmode="numeric" maxlength="5" value="${esc(state.zip)}" placeholder="60625"><p class="field-help">This is the only required detail.</p></div>${healthcare?`<div class="form-section"><span class="eyebrow">Optional healthcare details</span><p class="field-help">Skip these if you are unsure.</p>${optionRow('Do you have Medicare?','medicare',['Yes','No','Not sure'],state.medicare)}${optionRow('Do you have Medicaid?','medicaid',['Yes','No','Not sure'],state.medicaid)}</div>`:''}<p class="error" id="routingErr" hidden></p><div class="actions split"><button type="button" class="button secondary" id="routingBack">← Back</button><button class="button">See my Action Plan →</button></div></form>`;
  bindSegments();
  document.querySelector('#routingBack').onclick=()=>{step=1;render()};
  document.querySelector('#routingForm').onsubmit=e=>{e.preventDefault();const zip=document.querySelector('#zip').value.trim();if(!/^6\d{4}$/.test(zip))return show(document.querySelector('#routingErr'),'Enter a valid Illinois ZIP.');state.zip=zip;if(healthcare){state.medicare=document.querySelector('[name="medicare"]:checked')?.value||'';state.medicaid=document.querySelector('[name="medicaid"]:checked')?.value||''}saveState();step=3;render()};
}

function recommendations(){return engine?.recommendations(state,member)||[]}
function renderPlan(){
  setHead(member?`${member.name.split(' ')[0]}'s Action Plan`:'Your Illinois Action Plan','Start with the steps that fit your needs.',3);
  const all=recommendations();
  const visible=filter==='All'?all:all.filter(item=>item.category===filter);
  app.innerHTML=`<section class="plan-toolbar"><div><strong>Choose a help area</strong><p>Use colors to follow one topic.</p></div><div class="filter-row"><button class="filter ${filter==='All'?'active':''}" data-filter="All">All steps</button>${state.needs.map(name=>`<button class="filter category-${slug(name)} ${filter===name?'active':''}" data-filter="${esc(name)}">${cats[name].icon} ${name}</button>`).join('')}</div></section>${!member?`<section class="profile-prompt"><div><span class="eyebrow">Save what matters</span><h2>Create your member profile.</h2><p>Keep programs and your Action Plan.</p></div><button class="button" id="createPlanProfile">Create Profile</button></section>`:`<section class="profile-prompt saved"><div><span class="eyebrow">Profile saved</span><h2>Your Action Plan stays with you.</h2></div><button class="button" id="openProfile">My Profile</button></section>`}<div class="recommendations">${visible.map((item,index)=>`<article class="recommendation category-${slug(item.category)}"><div class="rank">${index+1}</div><div class="recommendation-copy"><span class="category-label">${cats[item.category].icon} ${item.category}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>${item.reason?`<p class="recommendation-reason"><strong>Why this step:</strong> ${esc(item.reason)}</p>`:''}<small>${esc(item.source)}</small></div><div class="recommendation-actions"><a class="button small" href="${item.url}" target="_blank" rel="noopener">${esc(item.actionLabel||'Open resource')}</a>${member?`<button class="button small secondary" data-save="${item.id}">${member.savedPrograms?.some(x=>x.id===item.id)?'Saved ✓':'Save to profile'}</button>`:''}</div></article>`).join('')}</div><div class="actions split"><button class="button secondary" id="changeAnswers">← Change answers</button><button class="button" id="newPlan">Start new plan</button></div>`;
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;renderPlan()});
  document.querySelector('#createPlanProfile')?.addEventListener('click',()=>{view='create';render()});
  document.querySelector('#openProfile')?.addEventListener('click',()=>{view='profile';render()});
  document.querySelectorAll('[data-save]').forEach(button=>button.onclick=()=>{const item=all.find(x=>x.id===button.dataset.save);member.savedPrograms=member.savedPrograms||[];if(!member.savedPrograms.some(x=>x.id===item.id))member.savedPrograms.push({...item,status:'Saved'});saveMember();renderPlan()});
  document.querySelector('#changeAnswers').onclick=()=>{step=2;render()};
  document.querySelector('#newPlan').onclick=restart;
}

function renderCreate(){
  title.textContent='Create your member profile.';intro.textContent='Only your name is required.';stepLabel.textContent='Optional';stepName.textContent='Save your progress';progress.style.width='100%';
  app.innerHTML=`<form class="form-card narrow" id="createForm"><div class="field"><label class="field-label" for="newName">Name</label><input id="newName" autocomplete="name" required></div><div class="field"><label class="field-label" for="newEmail">Email</label><input id="newEmail" type="email" autocomplete="email"><p class="field-help">Optional. Email your Action Plan later.</p></div><div class="field"><label class="field-label" for="newPhone">Cell phone</label><input id="newPhone" type="tel" autocomplete="tel"><p class="field-help">Optional. Text your Action Plan later.</p></div><div class="actions split"><button type="button" class="button secondary" id="cancelCreate">Cancel</button><button class="button">Save My Profile</button></div></form>`;
  document.querySelector('#cancelCreate').onclick=()=>{view='flow';step=3;render()};
  document.querySelector('#createForm').onsubmit=e=>{e.preventDefault();const name=document.querySelector('#newName').value.trim();if(!name)return;member={name,email:document.querySelector('#newEmail').value.trim(),phone:document.querySelector('#newPhone').value.trim(),zip:state.zip,dob:'',contact:'',coverage:{medicare:state.medicare||'',medicaid:state.medicaid||'',lis:'',msp:'',plan:'',snap:'',housing:'',utilities:''},health:{doctors:'',hospitals:'',drugs:'',pharmacy:''},household:{size:'',income:'',savings:''},helpAreas:[...state.needs],savedPrograms:[],permissions:{emailPlan:false,textPlan:false,medicareContact:false},createdAt:new Date().toISOString()};saveMember();view='flow';step=3;render()};
}

function profileSection(name,body,open=false){return `<details class="profile-section" ${open?'open':''}><summary><span>${name}</span><span aria-hidden="true">⌄</span></summary><div class="profile-section-body">${body}</div></details>`}
function selectOptions(current,values){return `<option value="">Not added</option>${values.map(v=>`<option ${current===v?'selected':''}>${v}</option>`).join('')}`}
function renderProfile(){
  if(!member){view='create';return render()}
  title.textContent=`${member.name.split(' ')[0]}'s Profile`;intro.textContent='Add details only when useful.';stepLabel.textContent='Member workspace';stepName.textContent='My Profile';progress.style.width='100%';
  const saved=member.savedPrograms||[];
  app.innerHTML=`<div class="profile-dashboard"><section class="profile-hero"><div><span class="eyebrow">My Profile</span><h2>${esc(member.name)}</h2><p>Keep your help in one place.</p></div><div class="share-buttons"><button class="button" id="emailPlan">Email my plan</button><button class="button secondary" id="textPlan">Text my plan</button></div></section>${profileSection('About Me',`<form id="aboutForm" class="profile-form"><label>Name<input id="pName" value="${esc(member.name)}" required></label><label>ZIP<input id="pZip" value="${esc(member.zip||'')}"></label><label>Birthdate<input id="pDob" type="date" value="${esc(member.dob||'')}"></label><label>Email<input id="pEmail" type="email" value="${esc(member.email||'')}"></label><label>Cell phone<input id="pPhone" type="tel" value="${esc(member.phone||'')}"></label><label>Preferred contact<select id="pContact">${selectOptions(member.contact||'',['Email','Text','Phone'])}</select></label><button class="button small">Save</button></form>`,true)}${profileSection('Coverage & Benefits',`<form id="coverageForm" class="profile-form"><label>Medicare<select id="pMedicare">${selectOptions(member.coverage?.medicare||'',['Yes','No','Not sure'])}</select></label><label>Medicaid<select id="pMedicaid">${selectOptions(member.coverage?.medicaid||'',['Yes','No','Not sure'])}</select></label><label>Extra Help / LIS<select id="pLis">${selectOptions(member.coverage?.lis||'',['Yes','No','Not sure'])}</select></label><label>Medicare Savings Program<select id="pMsp">${selectOptions(member.coverage?.msp||'',['Yes','No','Not sure'])}</select></label><label>Current Medicare plan<input id="pPlan" value="${esc(member.coverage?.plan||'')}"></label><label>SNAP<select id="pSnap">${selectOptions(member.coverage?.snap||'',['Yes','No','Not sure'])}</select></label><button class="button small">Save</button></form>`)}${profileSection('Healthcare Details',`<form id="healthForm" class="profile-form"><label>Doctors<textarea id="pDoctors">${esc(member.health?.doctors||'')}</textarea></label><label>Hospitals<textarea id="pHospitals">${esc(member.health?.hospitals||'')}</textarea></label><label>Medicines<textarea id="pDrugs">${esc(member.health?.drugs||'')}</textarea></label><label>Preferred pharmacy<input id="pPharmacy" value="${esc(member.health?.pharmacy||'')}"></label><button class="button small">Save</button></form>`)}${profileSection('Household Screening',`<form id="householdForm" class="profile-form"><label>Household size<input id="pHousehold" inputmode="numeric" value="${esc(member.household?.size||'')}"></label><label>Monthly income range<select id="pIncome">${selectOptions(member.household?.income||'',['Under $1,500','$1,500-$2,000','$2,001-$2,500','$2,501-$3,500','Over $3,500'])}</select></label><label>Savings range<select id="pSavings">${selectOptions(member.household?.savings||'',['Under $5,000','$5,000-$10,000','$10,001-$20,000','Over $20,000'])}</select></label><button class="button small">Save</button></form>`)}${profileSection('Saved Programs',saved.length?`<div>${saved.map(item=>`<div class="saved-program category-${slug(item.category)}"><div><span class="category-label">${cats[item.category]?.icon||'•'} ${esc(item.category)}</span><strong>${esc(item.title)}</strong></div><select data-status="${item.id}">${['Saved','Applied','Completed','Not interested'].map(status=>`<option ${item.status===status?'selected':''}>${status}</option>`).join('')}</select></div>`).join('')}</div>`:'<p>No programs saved yet.</p>')}${profileSection('Contact Choices',`<form id="permissionForm" class="check-form"><label><input id="emailPermission" type="checkbox" ${member.permissions?.emailPlan?'checked':''}> Email my Action Plan.</label><label><input id="textPermission" type="checkbox" ${member.permissions?.textPlan?'checked':''}> Text my Action Plan.</label><label><input id="medicarePermission" type="checkbox" ${member.permissions?.medicareContact?'checked':''}> Contact me about Medicare help.</label><button class="button small">Save</button></form>`)}<div class="actions split"><button class="button secondary" id="backToPlan">← Action Plan</button><button class="button" id="profileNewPlan">Start new plan</button></div></div>`;

  document.querySelector('#aboutForm').onsubmit=e=>{e.preventDefault();member.name=document.querySelector('#pName').value.trim()||member.name;member.zip=document.querySelector('#pZip').value.trim();member.dob=document.querySelector('#pDob').value;member.email=document.querySelector('#pEmail').value.trim();member.phone=document.querySelector('#pPhone').value.trim();member.contact=document.querySelector('#pContact').value;saveMember();renderProfile()};
  document.querySelector('#coverageForm').onsubmit=e=>{e.preventDefault();member.coverage={...member.coverage,medicare:document.querySelector('#pMedicare').value,medicaid:document.querySelector('#pMedicaid').value,lis:document.querySelector('#pLis').value,msp:document.querySelector('#pMsp').value,plan:document.querySelector('#pPlan').value.trim(),snap:document.querySelector('#pSnap').value};saveMember()};
  document.querySelector('#healthForm').onsubmit=e=>{e.preventDefault();member.health={...member.health,doctors:document.querySelector('#pDoctors').value.trim(),hospitals:document.querySelector('#pHospitals').value.trim(),drugs:document.querySelector('#pDrugs').value.trim(),pharmacy:document.querySelector('#pPharmacy').value.trim()};saveMember()};
  document.querySelector('#householdForm').onsubmit=e=>{e.preventDefault();member.household={size:document.querySelector('#pHousehold').value.trim(),income:document.querySelector('#pIncome').value,savings:document.querySelector('#pSavings').value};saveMember()};
  document.querySelector('#permissionForm').onsubmit=e=>{e.preventDefault();member.permissions={emailPlan:document.querySelector('#emailPermission').checked,textPlan:document.querySelector('#textPermission').checked,medicareContact:document.querySelector('#medicarePermission').checked,updatedAt:new Date().toISOString()};saveMember()};
  document.querySelectorAll('[data-status]').forEach(select=>select.onchange=()=>{const item=member.savedPrograms.find(x=>x.id===select.dataset.status);if(item)item.status=select.value;saveMember()});
  document.querySelector('#emailPlan').onclick=()=>sharePlan('email');
  document.querySelector('#textPlan').onclick=()=>sharePlan('text');
  document.querySelector('#backToPlan').onclick=()=>{view='flow';step=3;render()};
  document.querySelector('#profileNewPlan').onclick=restart;
}

function planText(){const items=member?.savedPrograms?.length?member.savedPrograms:recommendations();const lines=items.map(item=>`• ${item.title}: ${item.url}`);return `${member?.name?member.name.split(' ')[0]+"'s ":''}SeniorHelpersIL Action Plan\n\n${lines.join('\n')}\n\nSeniorHelpersIL`}
function sharePlan(type){const text=planText();if(type==='email'){window.location.href=`mailto:${encodeURIComponent(member?.email||'')}?subject=${encodeURIComponent('My SeniorHelpersIL Action Plan')}&body=${encodeURIComponent(text)}`}else{window.location.href=`sms:${member?.phone||''}?&body=${encodeURIComponent(text)}`}}
function restart(){state={needs:[],zip:'',medicare:'',medicaid:''};saveState();step=1;view='flow';filter='All';render()}

profileButton.onclick=()=>{view=member?'profile':'create';render()};
restartButton.onclick=restart;
homeLink.onclick=e=>{e.preventDefault();view='flow';step=1;render()};
render();
