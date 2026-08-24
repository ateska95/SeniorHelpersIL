(function(){
  if(typeof renderProfile!=='function'||typeof member==='undefined')return;

  let healthSetupActive=false;
  let healthStage=0;
  let healthDraft=null;

  const stages=['Current plan','Doctors','Prescriptions','Pharmacies','Hospitals','What matters','Review'];
  const planTypes=['Medicare Advantage','Original Medicare','Original Medicare + Medigap','Original Medicare + Part D','Other coverage','No current Medicare plan','Not sure'];
  const priorityOptions=['Keep my doctors','Keep my hospital','Lower prescription costs','Lowest total yearly cost','Low monthly premium','Broad doctor network','Dental benefits','Vision benefits','Hearing benefits','OTC or grocery allowance','Transportation','Fitness benefits','Out-of-state or travel flexibility'];

  function lines(value){return String(value||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean)}
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function ensureHealthProfile(){
    member.coverage=member.coverage||{};
    member.health=member.health||{};
    const existing=member.healthProfile||{};
    const pharmacySeed=existing.pharmacies||((existing.pharmacy?.name||member.health.pharmacy)?[{name:existing.pharmacy?.name||member.health.pharmacy||'',type:existing.pharmacy?.type||''}]:[]);
    member.healthProfile={
      currentPlan:{type:existing.currentPlan?.type||'',name:existing.currentPlan?.name||member.coverage.plan||''},
      doctors:Array.isArray(existing.doctors)?existing.doctors:lines(member.health.doctors).map(name=>({name,specialty:''})),
      drugs:Array.isArray(existing.drugs)?existing.drugs:lines(member.health.drugs).map(name=>({name,dose:'',frequency:'',quantity:''})),
      pharmacies:Array.isArray(pharmacySeed)?pharmacySeed:[],
      hospitals:Array.isArray(existing.hospitals)?existing.hospitals:lines(member.health.hospitals).map(name=>({name})),
      priorities:Array.isArray(existing.priorities)?existing.priorities:[],
      otherNeeds:existing.otherNeeds||''
    };
    return member.healthProfile;
  }
  function mirrorHealthProfile(){
    const hp=member.healthProfile;
    member.coverage=member.coverage||{};
    member.health=member.health||{};
    member.coverage.plan=hp.currentPlan.name||hp.currentPlan.type||'';
    member.health.doctors=hp.doctors.map(x=>[x.name,x.specialty].filter(Boolean).join(' — ')).join('\n');
    member.health.drugs=hp.drugs.map(x=>[x.name,x.dose,x.frequency,x.quantity?`Qty ${x.quantity}`:''].filter(Boolean).join(' — ')).join('\n');
    member.health.pharmacy=hp.pharmacies.map(x=>x.name).filter(Boolean).join(', ');
    member.health.hospitals=hp.hospitals.map(x=>x.name).filter(Boolean).join('\n');
  }
  function commitDraft(){
    if(!healthDraft)return;
    member.healthProfile=clone(healthDraft);
    mirrorHealthProfile();
    saveMember();
  }
  function sectionCount(hp){
    return [
      Boolean(hp.currentPlan.type||hp.currentPlan.name),
      hp.doctors.length>0,
      hp.drugs.length>0,
      hp.pharmacies.length>0,
      hp.hospitals.length>0,
      hp.priorities.length>0||Boolean(hp.otherNeeds)
    ].filter(Boolean).length;
  }
  function startHealth(stage=0){
    healthDraft=clone(ensureHealthProfile());
    healthStage=stage;
    healthSetupActive=true;
    renderProfile();
  }
  function closeHealth(){healthSetupActive=false;healthDraft=null;renderProfile()}
  function nextStage(){commitDraft();healthStage=Math.min(stages.length-1,healthStage+1);renderProfile()}
  function previousStage(){commitDraft();healthStage=Math.max(0,healthStage-1);renderProfile()}
  function summaryValue(value,fallback='Not added'){return value?esc(value):fallback}

  function healthHeader(){
    return `<div class="health-stage-head"><div><span class="eyebrow">Health Profile</span><h2>${stages[healthStage]}</h2><p>Everything here is optional. Add only what you want us to remember.</p></div><span class="health-stage-count">${healthStage+1} of ${stages.length}</span></div>`;
  }
  function stageActions(nextLabel='Continue →',allowSkip=true){
    return `<div class="health-stage-actions"><button type="button" class="health-skip" id="healthBack">${healthStage===0?'Exit setup':'← Back'}</button><div class="health-stage-actions-right">${allowSkip&&healthStage<stages.length-1?'<button type="button" class="health-skip" id="healthSkip">Skip for now</button>':''}<button type="button" class="button" id="healthNext">${nextLabel}</button></div></div>`;
  }
  function bindStageActions(onNext){
    document.querySelector('#healthBack').onclick=()=>healthStage===0?closeHealth():previousStage();
    document.querySelector('#healthSkip')?.addEventListener('click',nextStage);
    document.querySelector('#healthNext').onclick=onNext||nextStage;
  }

  function renderCurrentPlan(){
    const plan=healthDraft.currentPlan;
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>What coverage do you have now?</strong>This gives us a baseline for future plan comparisons.</div>
      <div class="health-option-grid">${planTypes.map(type=>`<button type="button" class="health-option ${plan.type===type?'selected':''}" data-plan-type="${esc(type)}">${esc(type)}</button>`).join('')}</div>
      <div class="health-entry-form"><label class="full">Plan name <span>(optional)</span><input id="healthPlanName" value="${esc(plan.name||'')}" placeholder="Example: your current plan name"></label></div>
      <details class="concierge-why"><summary>Why save my current plan?</summary><p>When plan comparison is connected, your current plan can be used as the starting point instead of assuming a new plan is better.</p></details>
      ${stageActions()}
    </div>`);
    app.querySelectorAll('[data-plan-type]').forEach(button=>button.onclick=()=>{healthDraft.currentPlan.type=button.dataset.planType;app.querySelectorAll('[data-plan-type]').forEach(x=>x.classList.toggle('selected',x===button));});
    bindStageActions(()=>{healthDraft.currentPlan.name=document.querySelector('#healthPlanName').value.trim();nextStage();});
  }

  function doctorItem(x,i){return `<div class="health-list-item"><div><strong>${esc(x.name)}</strong>${x.specialty?`<small>${esc(x.specialty)}</small>`:''}</div><button type="button" class="health-remove" data-remove-doctor="${i}">Remove</button></div>`}
  function renderDoctors(){
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>Are there doctors you want to keep?</strong>Add one, several, or none.</div>
      ${healthDraft.doctors.length?`<div class="health-list">${healthDraft.doctors.map(doctorItem).join('')}</div>`:'<div class="health-empty">No doctors added yet.</div>'}
      <div class="health-entry-form"><label>Doctor name<input id="doctorName" placeholder="Doctor name"></label><label>Specialty <span>(optional)</span><input id="doctorSpecialty" placeholder="Primary care, cardiology, etc."></label><button type="button" class="button secondary" id="addDoctor">+ Add doctor</button></div>
      ${stageActions()}
    </div>`);
    function addDoctor(){const name=document.querySelector('#doctorName').value.trim();if(!name)return false;healthDraft.doctors.push({name,specialty:document.querySelector('#doctorSpecialty').value.trim()});commitDraft();renderDoctors();return true}
    document.querySelector('#addDoctor').onclick=addDoctor;
    app.querySelectorAll('[data-remove-doctor]').forEach(button=>button.onclick=()=>{healthDraft.doctors.splice(Number(button.dataset.removeDoctor),1);commitDraft();renderDoctors();});
    bindStageActions(()=>{const name=document.querySelector('#doctorName').value.trim();if(name){healthDraft.doctors.push({name,specialty:document.querySelector('#doctorSpecialty').value.trim()});}nextStage();});
  }

  function drugItem(x,i){const detail=[x.dose,x.frequency,x.quantity?`Qty ${x.quantity}`:''].filter(Boolean).join(' · ');return `<div class="health-list-item"><div><strong>${esc(x.name)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div><button type="button" class="health-remove" data-remove-drug="${i}">Remove</button></div>`}
  function renderDrugs(){
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>What prescriptions do you take?</strong>Add as many or as few as you want.</div>
      ${healthDraft.drugs.length?`<div class="health-list">${healthDraft.drugs.map(drugItem).join('')}</div>`:'<div class="health-empty">No prescriptions added yet.</div>'}
      <div class="health-entry-form"><label>Drug name<input id="drugName" placeholder="Medication name"></label><label>Dosage <span>(optional)</span><input id="drugDose" placeholder="Example: 10 mg"></label><label>How often? <span>(optional)</span><input id="drugFrequency" placeholder="Example: once daily"></label><label>Quantity <span>(optional)</span><input id="drugQuantity" inputmode="numeric" placeholder="Example: 30"></label><button type="button" class="button secondary" id="addDrug">+ Add prescription</button></div>
      <details class="concierge-why"><summary>Why do prescriptions matter?</summary><p>Drug coverage and estimated yearly prescription costs can vary by Medicare plan.</p></details>
      ${stageActions()}
    </div>`);
    function addDrug(){const name=document.querySelector('#drugName').value.trim();if(!name)return false;healthDraft.drugs.push({name,dose:document.querySelector('#drugDose').value.trim(),frequency:document.querySelector('#drugFrequency').value.trim(),quantity:document.querySelector('#drugQuantity').value.trim()});commitDraft();renderDrugs();return true}
    document.querySelector('#addDrug').onclick=addDrug;
    app.querySelectorAll('[data-remove-drug]').forEach(button=>button.onclick=()=>{healthDraft.drugs.splice(Number(button.dataset.removeDrug),1);commitDraft();renderDrugs();});
    bindStageActions(()=>{const name=document.querySelector('#drugName').value.trim();if(name)healthDraft.drugs.push({name,dose:document.querySelector('#drugDose').value.trim(),frequency:document.querySelector('#drugFrequency').value.trim(),quantity:document.querySelector('#drugQuantity').value.trim()});nextStage();});
  }

  function pharmacyItem(x,i){return `<div class="health-list-item"><div><strong>${esc(x.name)}</strong>${x.type?`<small>${esc(x.type)}</small>`:''}</div><button type="button" class="health-remove" data-remove-pharmacy="${i}">Remove</button></div>`}
  function renderPharmacies(){
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>Where do you prefer to fill prescriptions?</strong>You can add more than one pharmacy.</div>
      ${healthDraft.pharmacies.length?`<div class="health-list">${healthDraft.pharmacies.map(pharmacyItem).join('')}</div>`:'<div class="health-empty">No pharmacy preference added yet.</div>'}
      <div class="health-entry-form"><label>Pharmacy name<input id="pharmacyName" placeholder="Pharmacy name"></label><label>How do you use it?<select id="pharmacyType"><option value="">No preference</option><option>Retail pharmacy</option><option>Mail order</option><option>Either retail or mail order</option></select></label><button type="button" class="button secondary" id="addPharmacy">+ Add pharmacy</button></div>
      <details class="concierge-why"><summary>Why does pharmacy matter?</summary><p>Some plans have preferred in-network pharmacies that may lower prescription costs.</p></details>
      ${stageActions()}
    </div>`);
    function addPharmacy(){const name=document.querySelector('#pharmacyName').value.trim();if(!name)return false;healthDraft.pharmacies.push({name,type:document.querySelector('#pharmacyType').value});commitDraft();renderPharmacies();return true}
    document.querySelector('#addPharmacy').onclick=addPharmacy;
    app.querySelectorAll('[data-remove-pharmacy]').forEach(button=>button.onclick=()=>{healthDraft.pharmacies.splice(Number(button.dataset.removePharmacy),1);commitDraft();renderPharmacies();});
    bindStageActions(()=>{const name=document.querySelector('#pharmacyName').value.trim();if(name)healthDraft.pharmacies.push({name,type:document.querySelector('#pharmacyType').value});nextStage();});
  }

  function hospitalItem(x,i){return `<div class="health-list-item"><div><strong>${esc(x.name)}</strong></div><button type="button" class="health-remove" data-remove-hospital="${i}">Remove</button></div>`}
  function renderHospitals(){
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>Are there hospitals or health systems you prefer?</strong>Add any that matter to you.</div>
      ${healthDraft.hospitals.length?`<div class="health-list">${healthDraft.hospitals.map(hospitalItem).join('')}</div>`:'<div class="health-empty">No hospital preference added yet.</div>'}
      <div class="health-entry-form"><label class="full">Hospital or health system<input id="hospitalName" placeholder="Hospital or health system"></label><button type="button" class="button secondary" id="addHospital">+ Add hospital</button></div>
      ${stageActions()}
    </div>`);
    function addHospital(){const name=document.querySelector('#hospitalName').value.trim();if(!name)return false;healthDraft.hospitals.push({name});commitDraft();renderHospitals();return true}
    document.querySelector('#addHospital').onclick=addHospital;
    app.querySelectorAll('[data-remove-hospital]').forEach(button=>button.onclick=()=>{healthDraft.hospitals.splice(Number(button.dataset.removeHospital),1);commitDraft();renderHospitals();});
    bindStageActions(()=>{const name=document.querySelector('#hospitalName').value.trim();if(name)healthDraft.hospitals.push({name});nextStage();});
  }

  function renderPriorities(){
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>What matters most in your Medicare coverage?</strong>Choose anything you care about. You do not need to rank them yet.</div>
      <div class="health-priority-grid">${priorityOptions.map(item=>`<button type="button" class="health-priority ${healthDraft.priorities.includes(item)?'selected':''}" data-priority="${esc(item)}">${esc(item)}</button>`).join('')}</div>
      <div class="health-entry-form"><label class="full">Anything else? <span>(optional)</span><textarea id="otherHealthNeeds" placeholder="Tell us anything you would want considered in a future plan comparison.">${esc(healthDraft.otherNeeds||'')}</textarea></label></div>
      ${stageActions('Review health profile →')}
    </div>`);
    app.querySelectorAll('[data-priority]').forEach(button=>button.onclick=()=>{const item=button.dataset.priority;healthDraft.priorities=healthDraft.priorities.includes(item)?healthDraft.priorities.filter(x=>x!==item):[...healthDraft.priorities,item];button.classList.toggle('selected',healthDraft.priorities.includes(item));});
    bindStageActions(()=>{healthDraft.otherNeeds=document.querySelector('#otherHealthNeeds').value.trim();nextStage();});
  }

  function reviewSection(title,value,stage){return `<section class="health-review-section"><div class="health-review-section-head"><h3>${esc(title)}</h3><button type="button" data-edit-health="${stage}">Edit</button></div><p>${value}</p></section>`}
  function renderReview(){
    const hp=healthDraft;
    const doctors=hp.doctors.length?`${hp.doctors.length} doctor${hp.doctors.length===1?'':'s'}: ${esc(hp.doctors.map(x=>x.name).join(', '))}`:'None added';
    const drugs=hp.drugs.length?`${hp.drugs.length} prescription${hp.drugs.length===1?'':'s'}: ${esc(hp.drugs.map(x=>x.name).join(', '))}`:'None added';
    const pharmacies=hp.pharmacies.length?esc(hp.pharmacies.map(x=>x.name).join(', ')):'None added';
    const hospitals=hp.hospitals.length?esc(hp.hospitals.map(x=>x.name).join(', ')):'None added';
    const priorities=hp.priorities.length?esc(hp.priorities.join(', ')):'None selected';
    app.innerHTML=shell('Health Profile',`<div class="health-setup">${healthHeader()}
      <div class="concierge-message"><strong>Here is your health profile.</strong>You can leave any section blank and update this later.</div>
      <div class="health-review">
        ${reviewSection('Current plan',summaryValue(hp.currentPlan.name||hp.currentPlan.type),0)}
        ${reviewSection('Doctors',doctors,1)}
        ${reviewSection('Prescriptions',drugs,2)}
        ${reviewSection('Pharmacies',pharmacies,3)}
        ${reviewSection('Hospitals',hospitals,4)}
        ${reviewSection('What matters',priorities+(hp.otherNeeds?`<br>${esc(hp.otherNeeds)}`:''),5)}
      </div>
      <div class="health-ready"><span>✓</span><div><strong>Ready for future plan comparison.</strong><br>This prototype saves the information as your comparison preferences. It does not yet verify networks, formularies, or live plan data.</div></div>
      ${stageActions('Finish →',false)}
    </div>`);
    app.querySelectorAll('[data-edit-health]').forEach(button=>button.onclick=()=>{commitDraft();healthStage=Number(button.dataset.editHealth);renderProfile();});
    document.querySelector('#healthBack').onclick=previousStage;
    document.querySelector('#healthNext').onclick=()=>{commitDraft();member.healthProfileCompletedAt=new Date().toISOString();saveMember();closeHealth();};
  }

  function renderHealthSetup(){
    if(!healthDraft)healthDraft=clone(ensureHealthProfile());
    if(healthStage===0)return renderCurrentPlan();
    if(healthStage===1)return renderDoctors();
    if(healthStage===2)return renderDrugs();
    if(healthStage===3)return renderPharmacies();
    if(healthStage===4)return renderHospitals();
    if(healthStage===5)return renderPriorities();
    return renderReview();
  }

  function renderProfileHome(){
    if(!member){returnScreen='needs';screen='create';return render()}
    const hp=ensureHealthProfile();
    const filled=sectionCount(hp);
    const saved=member.savedPrograms||[];
    const planText=hp.currentPlan.name||hp.currentPlan.type||'Not added';
    const healthButton=filled===0?'Set up my health profile':filled<6?'Continue health profile':'Edit health profile';
    app.innerHTML=shell('My Profile',`
      <div class="concierge-message"><strong>${esc(member.name)}’s profile</strong>Save only the details you want SeniorHelpersIL to remember.</div>
      <section class="health-profile-card">
        <div class="health-profile-head"><div><span class="eyebrow">Optional</span><h2>My Health Profile</h2><p>Set up doctors, prescriptions, pharmacies, hospitals, your current plan, and what matters to you.</p></div><span class="health-progress">${filled} of 6 added</span></div>
        <div class="health-summary-grid">
          <div class="health-summary-item"><div><span>Current plan</span><strong>${esc(planText)}</strong></div><button type="button" data-health-jump="0">Edit</button></div>
          <div class="health-summary-item"><div><span>Doctors</span><strong>${hp.doctors.length?`${hp.doctors.length} added`:'Not added'}</strong></div><button type="button" data-health-jump="1">Edit</button></div>
          <div class="health-summary-item"><div><span>Prescriptions</span><strong>${hp.drugs.length?`${hp.drugs.length} added`:'Not added'}</strong></div><button type="button" data-health-jump="2">Edit</button></div>
          <div class="health-summary-item"><div><span>Pharmacies</span><strong>${hp.pharmacies.length?`${hp.pharmacies.length} added`:'Not added'}</strong></div><button type="button" data-health-jump="3">Edit</button></div>
          <div class="health-summary-item"><div><span>Hospitals</span><strong>${hp.hospitals.length?`${hp.hospitals.length} added`:'Not added'}</strong></div><button type="button" data-health-jump="4">Edit</button></div>
          <div class="health-summary-item"><div><span>Coverage priorities</span><strong>${hp.priorities.length?`${hp.priorities.length} selected`:'Not added'}</strong></div><button type="button" data-health-jump="5">Edit</button></div>
        </div>
        <div class="health-profile-actions"><button type="button" class="button health-profile-cta" id="startHealthProfile">${healthButton}</button></div>
        <div class="health-privacy-note"><strong>Prototype note:</strong> this demo stores health-profile details on this device. Do not enter a Medicare number, Social Security number, bank information, or other account numbers.</div>
      </section>
      <details class="profile-basics"><summary>Basic profile details</summary><form id="basicProfileForm" class="concierge-form profile-grid">
        <label>Name<input id="hpName" value="${esc(member.name)}" required></label><label>ZIP<input id="hpZip" value="${esc(member.zip||'')}"></label><label>Email<input id="hpEmail" type="email" value="${esc(member.email||'')}"></label><label>Cell phone<input id="hpPhone" type="tel" value="${esc(member.phone||'')}"></label>
        <div class="concierge-actions full"><button class="button">Save basic details</button></div></form></details>
      <details class="concierge-more profile-programs"><summary>Saved programs (${saved.length})</summary><div class="concierge-more-list">${saved.length?saved.map(item=>`<div class="saved-program"><strong>${esc(item.title)}</strong><select data-health-status="${esc(item.id)}">${['Recommended','Saved','Applied','Completed','Not interested'].map(s=>`<option ${item.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join(''):'<p>No programs saved yet.</p>'}</div></details>
      <div class="concierge-plan-footer"><button type="button" class="concierge-link-button" id="healthProfileBack">← Back</button></div>`);
    document.querySelector('#startHealthProfile').onclick=()=>startHealth(filled===6?6:0);
    app.querySelectorAll('[data-health-jump]').forEach(button=>button.onclick=()=>startHealth(Number(button.dataset.healthJump)));
    document.querySelector('#basicProfileForm').onsubmit=e=>{e.preventDefault();member.name=document.querySelector('#hpName').value.trim()||member.name;member.zip=document.querySelector('#hpZip').value.trim();member.email=document.querySelector('#hpEmail').value.trim();member.phone=document.querySelector('#hpPhone').value.trim();saveMember();renderProfile();};
    app.querySelectorAll('[data-health-status]').forEach(select=>select.onchange=()=>{const item=member.savedPrograms.find(x=>x.id===select.dataset.healthStatus);if(item)item.status=select.value;saveMember();});
    document.querySelector('#healthProfileBack').onclick=()=>{screen=returnScreen||'needs';render()};
  }

  renderProfile=function(){
    if(!member){returnScreen='needs';screen='create';return render()}
    return healthSetupActive?renderHealthSetup():renderProfileHome();
  };
})();