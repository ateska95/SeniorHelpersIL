(function(){
  if(typeof render!=='function'||typeof shell!=='function'||typeof esc!=='function')return;

  let compareReturn='medicareHelp';
  let planFilter='all';
  let sortMode='fit';
  let selectedPlanIds=[];
  let detailPlanId='';
  let enrollPlanId='';
  let enrollStage=0;

  const demoPlans=[
    {id:'demo-lakeview-ppo',name:'Lakeview Choice PPO',type:'PPO',carrier:'Example Health',premium:0,moop:4900,pcp:'$0',specialist:'$35',drugDeductible:'$250',dental:'$2,000 allowance',vision:'$250 allowance',hearing:'$1,000 allowance',otc:'$75 quarterly',travel:'Nationwide urgent/emergency coverage',network:0.95,drugs:1,pharmacy:0.9,fit:94,tag:'Strong overall fit'},
    {id:'demo-prairie-hmo',name:'Prairie Value HMO',type:'HMO',carrier:'Example Health',premium:0,moop:3850,pcp:'$0',specialist:'$25',drugDeductible:'$150',dental:'$1,500 allowance',vision:'$200 allowance',hearing:'$750 allowance',otc:'$100 quarterly',travel:'Emergency and urgent care coverage',network:0.76,drugs:0.92,pharmacy:1,fit:88,tag:'Lowest medical out-of-pocket limit'},
    {id:'demo-community-hmopos',name:'Community Flex HMO-POS',type:'HMO-POS',carrier:'Example Health',premium:18,moop:4200,pcp:'$5',specialist:'$30',drugDeductible:'$0 on Tiers 1–2',dental:'$2,500 allowance',vision:'$300 allowance',hearing:'$1,200 allowance',otc:'$90 quarterly',travel:'Limited out-of-network flexibility',network:0.86,drugs:0.96,pharmacy:0.95,fit:91,tag:'Balanced benefits and network'},
    {id:'demo-horizon-ppo',name:'Horizon Freedom PPO',type:'PPO',carrier:'Example Health',premium:42,moop:3600,pcp:'$0',specialist:'$30',drugDeductible:'$100',dental:'$1,000 allowance',vision:'$200 allowance',hearing:'$800 allowance',otc:'$50 quarterly',travel:'Broader out-of-area flexibility',network:1,drugs:0.88,pharmacy:0.85,fit:89,tag:'Broadest provider flexibility'}
  ];

  function healthProfile(){
    const hp=member?.healthProfile||{};
    return {
      currentPlan:hp.currentPlan?.name||hp.currentPlan?.type||member?.coverage?.plan||'',
      doctors:Array.isArray(hp.doctors)?hp.doctors:[],
      drugs:Array.isArray(hp.drugs)?hp.drugs:[],
      pharmacies:Array.isArray(hp.pharmacies)?hp.pharmacies:[],
      hospitals:Array.isArray(hp.hospitals)?hp.hospitals:[],
      priorities:Array.isArray(hp.priorities)?hp.priorities:[]
    };
  }
  function demoMatch(count,ratio){return count?Math.max(0,Math.min(count,Math.round(count*ratio))):0}
  function planById(id){return demoPlans.find(x=>x.id===id)}
  function money(value){return `$${Number(value).toLocaleString()}`}
  function compareButtonLabel(){return selectedPlanIds.length>=2?`Compare selected (${selectedPlanIds.length})`:'Select 2–3 plans'}

  function openPlanCompare(from){
    compareReturn=from&&from!=='planCompare'?from:'medicareHelp';
    screen='planCompare';
    planFilter='all';
    sortMode='fit';
    render();
  }
  window.openSeniorHelpersPlanCompare=openPlanCompare;

  function profileStrip(){
    const hp=healthProfile();
    return `<section class="plan-profile-strip">
      <div><span>ZIP</span><strong>${esc(state.zip||member?.zip||'Not added')}</strong></div>
      <div><span>Current plan</span><strong>${esc(hp.currentPlan||'Not added')}</strong></div>
      <div><span>Doctors</span><strong>${hp.doctors.length?`${hp.doctors.length} saved`:'None saved'}</strong></div>
      <div><span>Prescriptions</span><strong>${hp.drugs.length?`${hp.drugs.length} saved`:'None saved'}</strong></div>
      <div><span>Priorities</span><strong>${hp.priorities.length?`${hp.priorities.length} saved`:'None saved'}</strong></div>
      ${member?'<button type="button" class="button secondary" id="editHealthBeforeCompare">Edit Health Profile</button>':'<button type="button" class="button secondary" id="createProfileBeforeCompare">Save a Health Profile</button>'}
    </section>`;
  }

  function matchPills(plan){
    const hp=healthProfile();
    const doctorMatches=demoMatch(hp.doctors.length,plan.network);
    const drugMatches=demoMatch(hp.drugs.length,plan.drugs);
    const pharmacyMatches=demoMatch(hp.pharmacies.length,plan.pharmacy);
    const pills=[];
    if(hp.doctors.length)pills.push(`<span class="plan-match ${doctorMatches===hp.doctors.length?'':'warn'}">${doctorMatches}/${hp.doctors.length} doctors matched*</span>`);
    if(hp.drugs.length)pills.push(`<span class="plan-match ${drugMatches===hp.drugs.length?'':'warn'}">${drugMatches}/${hp.drugs.length} drugs covered*</span>`);
    if(hp.pharmacies.length)pills.push(`<span class="plan-match ${pharmacyMatches===hp.pharmacies.length?'':'warn'}">${pharmacyMatches}/${hp.pharmacies.length} pharmacies preferred*</span>`);
    if(!pills.length)pills.push('<span class="plan-match">Add doctors or drugs for a richer comparison</span>');
    return pills.join('');
  }

  function planCard(plan){
    const selected=selectedPlanIds.includes(plan.id);
    return `<article class="plan-card ${selected?'selected':''}">
      <div>
        <div class="plan-card-head"><span class="plan-card-type">${esc(plan.type)}</span><span class="plan-demo-badge">Fictional demo plan</span></div>
        <h3>${esc(plan.name)}</h3><p class="plan-card-sub">${esc(plan.carrier)} · ${esc(plan.tag)} · Demo fit ${plan.fit}%</p>
        <div class="plan-cost-row">
          <div class="plan-cost"><span>Monthly premium</span><strong>${money(plan.premium)}</strong></div>
          <div class="plan-cost"><span>Medical out-of-pocket max</span><strong>${money(plan.moop)}</strong></div>
          <div class="plan-cost"><span>Primary care</span><strong>${esc(plan.pcp)}</strong></div>
          <div class="plan-cost"><span>Specialist</span><strong>${esc(plan.specialist)}</strong></div>
        </div>
        <div class="plan-match-row">${matchPills(plan)}</div>
      </div>
      <div class="plan-card-actions">
        <button type="button" class="button ${selected?'secondary':''}" data-toggle-plan="${plan.id}">${selected?'Selected ✓':'Add to compare'}</button>
        <button type="button" class="button secondary" data-view-plan="${plan.id}">View plan details</button>
      </div>
    </article>`;
  }

  function sortedPlans(){
    let plans=demoPlans.filter(p=>planFilter==='all'||p.type===planFilter||planFilter==='HMO'&&(p.type==='HMO'||p.type==='HMO-POS'));
    if(sortMode==='premium')plans=[...plans].sort((a,b)=>a.premium-b.premium||a.moop-b.moop);
    else if(sortMode==='moop')plans=[...plans].sort((a,b)=>a.moop-b.moop);
    else plans=[...plans].sort((a,b)=>b.fit-a.fit);
    return plans;
  }

  function renderPlanCompare(){
    const hp=healthProfile();
    const current=hp.currentPlan;
    app.innerHTML=`
      ${shell('Compare Plans',`<div class="concierge-message"><strong>Compare Medicare plans around what matters to you.</strong>Start with your ZIP, current coverage, doctors, prescriptions, pharmacies, and priorities—or compare with only the information you want to share.</div>`)}
      <section class="plan-market-shell">
        <div class="plan-market-head"><div><span class="eyebrow">Medicare plan marketplace prototype</span><h2>Plans for ${esc(state.zip||member?.zip||'your area')}</h2><p>These are fictional plans built only to demonstrate the future shopping and enrollment experience.</p></div><span class="plan-demo-badge">Demo data only</span></div>
        ${current?`<div class="plan-current-callout"><strong>Your current coverage stays the baseline.</strong> We would compare alternatives against ${esc(current)} rather than assuming a change is better.</div>`:''}
        ${profileStrip()}
        <div class="plan-market-toolbar">
          <div class="plan-filter-group">
            ${[['all','All plans'],['HMO','HMO'],['PPO','PPO']].map(([key,label])=>`<button type="button" class="plan-filter ${planFilter===key?'active':''}" data-plan-filter="${key}">${label}</button>`).join('')}
          </div>
          <div class="plan-filter-group">
            ${[['fit','Best fit'],['premium','Lowest premium'],['moop','Lowest out-of-pocket max']].map(([key,label])=>`<button type="button" class="plan-filter ${sortMode===key?'active':''}" data-plan-sort="${key}">${label}</button>`).join('')}
          </div>
          <button type="button" class="compare-selected-button" id="compareSelectedPlans" ${selectedPlanIds.length>=2?'':'disabled'}>${compareButtonLabel()}</button>
        </div>
        <div class="plan-grid">${sortedPlans().map(planCard).join('')}</div>
        <div class="plan-market-note"><strong>*Prototype match:</strong> doctor, prescription, and pharmacy matches are simulated for interface testing. A production marketplace would use live network, formulary, pharmacy, eligibility, and plan data before any recommendation or enrollment.</div>
        <div class="plan-back-row"><button type="button" class="concierge-link-button" id="planCompareBack">← Back</button><button type="button" class="concierge-link-button" id="clearPlanSelection">Clear selected plans</button></div>
      </section>`;

    app.querySelectorAll('[data-plan-filter]').forEach(b=>b.onclick=()=>{planFilter=b.dataset.planFilter;renderPlanCompare();});
    app.querySelectorAll('[data-plan-sort]').forEach(b=>b.onclick=()=>{sortMode=b.dataset.planSort;renderPlanCompare();});
    app.querySelectorAll('[data-toggle-plan]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.togglePlan;
      if(selectedPlanIds.includes(id))selectedPlanIds=selectedPlanIds.filter(x=>x!==id);
      else if(selectedPlanIds.length<3)selectedPlanIds=[...selectedPlanIds,id];
      renderPlanCompare();
    });
    app.querySelectorAll('[data-view-plan]').forEach(b=>b.onclick=()=>{detailPlanId=b.dataset.viewPlan;screen='planDetails';render();});
    document.querySelector('#compareSelectedPlans')?.addEventListener('click',()=>{if(selectedPlanIds.length>=2){screen='planSideBySide';render();}});
    document.querySelector('#planCompareBack').onclick=()=>{screen=compareReturn||'medicareHelp';render();};
    document.querySelector('#clearPlanSelection').onclick=()=>{selectedPlanIds=[];renderPlanCompare();};
    document.querySelector('#editHealthBeforeCompare')?.addEventListener('click',()=>{returnScreen='planCompare';screen='profile';render();});
    document.querySelector('#createProfileBeforeCompare')?.addEventListener('click',()=>{returnScreen='planCompare';screen='create';render();});
  }

  function compareRows(plans){
    const rows=[
      ['Plan type',p=>p.type],['Monthly premium',p=>money(p.premium)],['Medical out-of-pocket max',p=>money(p.moop)],['Primary care',p=>p.pcp],['Specialist',p=>p.specialist],['Drug deductible',p=>p.drugDeductible],['Dental',p=>p.dental],['Vision',p=>p.vision],['Hearing',p=>p.hearing],['OTC',p=>p.otc],['Travel / out-of-area',p=>p.travel]
    ];
    return rows.map(([label,get])=>`<tr><td>${esc(label)}</td>${plans.map(p=>`<td>${esc(get(p))}</td>`).join('')}</tr>`).join('');
  }

  function renderSideBySide(){
    const plans=selectedPlanIds.map(planById).filter(Boolean);
    if(plans.length<2){screen='planCompare';return render();}
    app.innerHTML=`${shell('Compare',`<div class="concierge-message"><strong>Compare your selected plans side by side.</strong>Focus first on doctors, drugs, total yearly exposure, and the benefits you actually expect to use.</div>`)}
      <section class="plan-market-shell">
        <div class="plan-compare-table-wrap"><table class="plan-compare-table"><thead><tr><th>Compare</th>${plans.map(p=>`<th>${esc(p.name)}<br><span class="plan-demo-badge">Demo</span></th>`).join('')}</tr></thead><tbody>${compareRows(plans)}</tbody></table></div>
        <div class="plan-grid" style="margin-top:1rem">${plans.map(p=>`<article class="plan-card"><div><h3>${esc(p.name)}</h3><div class="plan-match-row">${matchPills(p)}</div></div><div class="plan-card-actions"><button type="button" class="button" data-side-detail="${p.id}">View details</button></div></article>`).join('')}</div>
        <div class="plan-market-note"><strong>Do not choose from benefits alone.</strong> A production comparison should verify provider networks, prescription coverage, pharmacies, expected yearly costs, eligibility, and enrollment period before presenting a final recommendation.</div>
        <div class="plan-compare-actions"><button type="button" class="concierge-link-button" id="sideBack">← Back to plans</button><button type="button" class="concierge-link-button" id="sideClear">Clear comparison</button></div>
      </section>`;
    app.querySelectorAll('[data-side-detail]').forEach(b=>b.onclick=()=>{detailPlanId=b.dataset.sideDetail;screen='planDetails';render();});
    document.querySelector('#sideBack').onclick=()=>{screen='planCompare';render();};
    document.querySelector('#sideClear').onclick=()=>{selectedPlanIds=[];screen='planCompare';render();};
  }

  function renderPlanDetails(){
    const plan=planById(detailPlanId);if(!plan){screen='planCompare';return render();}
    const hp=healthProfile();
    const d=demoMatch(hp.doctors.length,plan.network),r=demoMatch(hp.drugs.length,plan.drugs),ph=demoMatch(hp.pharmacies.length,plan.pharmacy);
    app.innerHTML=`${shell('Plan Details',`<div class="concierge-message"><strong>${esc(plan.name)}</strong>This fictional plan detail page shows how a consumer could review fit before deciding whether to enroll.</div>`)}
      <section class="plan-market-shell">
        <div class="plan-market-head"><div><span class="eyebrow">${esc(plan.type)} · ${esc(plan.carrier)}</span><h2>${esc(plan.name)}</h2><p>${esc(plan.tag)}</p></div><span class="plan-demo-badge">Fictional demo plan</span></div>
        <div class="plan-detail-grid">
          <section class="plan-detail-panel"><h3>Costs & benefits</h3><div class="plan-detail-list">
            ${[['Monthly premium',money(plan.premium)],['Medical out-of-pocket max',money(plan.moop)],['Primary care',plan.pcp],['Specialist',plan.specialist],['Drug deductible',plan.drugDeductible],['Dental',plan.dental],['Vision',plan.vision],['Hearing',plan.hearing],['OTC',plan.otc],['Travel',plan.travel]].map(([a,b])=>`<div class="plan-detail-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('')}
          </div></section>
          <section class="plan-detail-panel"><h3>Fit with your Health Profile</h3><div class="plan-fit-list">
            <div class="plan-fit-item"><span>👨‍⚕️</span><div><strong>Doctors</strong><br>${hp.doctors.length?`${d} of ${hp.doctors.length} matched in this demo`:'No doctors saved yet'}</div></div>
            <div class="plan-fit-item"><span>💊</span><div><strong>Prescriptions</strong><br>${hp.drugs.length?`${r} of ${hp.drugs.length} covered in this demo`:'No prescriptions saved yet'}</div></div>
            <div class="plan-fit-item"><span>🏪</span><div><strong>Pharmacies</strong><br>${hp.pharmacies.length?`${ph} of ${hp.pharmacies.length} preferred in this demo`:'No pharmacies saved yet'}</div></div>
            <div class="plan-fit-item"><span>🎯</span><div><strong>Your priorities</strong><br>${hp.priorities.length?esc(hp.priorities.slice(0,4).join(', ')):'No priorities saved yet'}</div></div>
          </div></section>
        </div>
        <div class="plan-enroll-banner"><div><h3>Want to enroll online?</h3><p>In production, the next step would verify eligibility, enrollment period, effective date, and live plan details before collecting Medicare enrollment information securely.</p></div><button type="button" class="button" id="startEnrollment">Start online enrollment</button></div>
        <div class="plan-market-note"><strong>Prototype only:</strong> this plan does not exist and these costs, benefits, network results, and drug results are not real.</div>
        <div class="plan-back-row"><button type="button" class="concierge-link-button" id="detailBack">← Back to plans</button><button type="button" class="button secondary" id="detailCompare">${selectedPlanIds.includes(plan.id)?'Selected for comparison ✓':'Add to comparison'}</button></div>
      </section>`;
    document.querySelector('#startEnrollment').onclick=()=>{enrollPlanId=plan.id;enrollStage=0;screen='planEnroll';render();};
    document.querySelector('#detailBack').onclick=()=>{screen='planCompare';render();};
    document.querySelector('#detailCompare').onclick=()=>{if(!selectedPlanIds.includes(plan.id)&&selectedPlanIds.length<3)selectedPlanIds.push(plan.id);screen='planCompare';render();};
  }

  function enrollmentSteps(){return ['Review plan','Eligibility','Personal info','Medicare info','Submit'];}
  function renderEnrollment(){
    const plan=planById(enrollPlanId);if(!plan){screen='planCompare';return render();}
    const steps=enrollmentSteps();
    const stage=Math.min(enrollStage,2);
    let body='';
    if(stage===0)body=`<div class="concierge-message"><strong>Before you enroll.</strong>Review the plan and make sure you have the information you would need for a secure Medicare enrollment.</div><div class="enrollment-checklist">
      <div class="enrollment-check"><span>✓</span><div><strong>Plan selected</strong><br>${esc(plan.name)} · ${esc(plan.type)} · ${money(plan.premium)} monthly premium</div></div>
      <div class="enrollment-check"><span>1</span><div><strong>Have your Medicare card available</strong><br>A production enrollment would securely collect the Medicare information required by the plan.</div></div>
      <div class="enrollment-check"><span>2</span><div><strong>Know your permanent address</strong><br>The plan must be available where you live.</div></div>
      <div class="enrollment-check"><span>3</span><div><strong>Review doctors, drugs, and current coverage</strong><br>Confirm the live plan still meets your needs before submitting.</div></div>
    </div>`;
    else if(stage===1)body=`<div class="concierge-message"><strong>Enrollment eligibility check.</strong>A production marketplace would verify that you are eligible to join this plan now and determine the correct effective date.</div><div class="secure-handoff"><h3>Prototype eligibility result</h3><p>For this demo, assume the consumer has a valid Medicare enrollment period and the plan is available in their ZIP code.</p></div>`;
    else body=`<div class="concierge-message"><strong>Secure enrollment handoff.</strong>This is where the real enrollment system would take over.</div><div class="secure-handoff"><h3>Production integration point</h3><p>SeniorHelpersIL should pass the selected plan and saved non-sensitive preferences into a compliant enrollment workflow. Medicare identifiers, attestations, signatures, and other required enrollment data should be collected there—not in this static prototype.</p></div>`;

    app.innerHTML=`${shell('Online Enrollment',body)}<section class="plan-market-shell"><div class="enrollment-steps">${steps.map((s,i)=>`<div class="enrollment-step ${i===stage?'active':''}">${i+1}. ${esc(s)}</div>`).join('')}</div><div class="plan-market-note"><strong>Demo enrollment only.</strong> No actual insurance application is being submitted and no Medicare identifier is requested on this prototype.</div><div class="plan-back-row"><button type="button" class="concierge-link-button" id="enrollBack">← ${stage===0?'Back to plan':'Previous'}</button>${stage<2?'<button type="button" class="button" id="enrollNext">Continue →</button>':'<button type="button" class="button" id="enrollFinish">Return to plan comparison</button>'}</div></section>`;
    document.querySelector('#enrollBack').onclick=()=>{if(stage===0){detailPlanId=plan.id;screen='planDetails';render();}else{enrollStage--;renderEnrollment();}};
    document.querySelector('#enrollNext')?.addEventListener('click',()=>{enrollStage++;renderEnrollment();});
    document.querySelector('#enrollFinish')?.addEventListener('click',()=>{screen='planCompare';render();});
  }

  function injectMarketplaceCTA(){
    if(screen!=='medicareHelp')return;
    const center=document.querySelector('.medicare-help-center');
    if(!center||document.querySelector('.plan-market-hero'))return;
    center.insertAdjacentHTML('afterbegin',`<section class="plan-market-hero"><span class="eyebrow">Medicare plan shopping</span><h2>Compare Medicare plans</h2><p>See how plans could compare on premiums, out-of-pocket costs, doctors, prescriptions, pharmacies, and benefits. You can browse without enrolling.</p><button type="button" class="button" id="medicareComparePlans">Compare Medicare Plans →</button></section>`);
    document.querySelector('#medicareComparePlans').onclick=()=>openPlanCompare('medicareHelp');
  }

  const priorRender=render;
  render=function(){
    if(screen==='planCompare'){syncHeader();document.body.dataset.view='planCompare';return renderPlanCompare();}
    if(screen==='planSideBySide'){syncHeader();document.body.dataset.view='planSideBySide';return renderSideBySide();}
    if(screen==='planDetails'){syncHeader();document.body.dataset.view='planDetails';return renderPlanDetails();}
    if(screen==='planEnroll'){syncHeader();document.body.dataset.view='planEnroll';return renderEnrollment();}
    const result=priorRender();
    if(screen==='medicareHelp')injectMarketplaceCTA();
    return result;
  };

  const priorPlan=renderPlan;
  renderPlan=function(){
    priorPlan();
    if(activeTopic!=='Healthcare')return;
    const results=document.querySelector('.concierge-results');
    if(!results||document.querySelector('.plan-market-hero'))return;
    results.insertAdjacentHTML('beforebegin',`<section class="plan-market-hero"><span class="eyebrow">Most popular healthcare tool</span><h2>Compare Medicare plans</h2><p>Compare fictional demo plans using your ZIP and any Health Profile details you choose to save.</p><button type="button" class="button" id="healthcareComparePlans">Compare Medicare Plans →</button></section>`);
    document.querySelector('#healthcareComparePlans').onclick=()=>openPlanCompare('plan');
  };

  if(screen==='medicareHelp')injectMarketplaceCTA();
})();
