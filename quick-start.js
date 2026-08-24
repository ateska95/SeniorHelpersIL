(function(){
  if(typeof renderNeeds!=='function'||typeof renderRouting!=='function'||typeof renderPlan!=='function')return;

  const problems=[
    {category:'Food',icon:'🍎',title:'I need help paying for food',note:'Groceries, SNAP, food pantries, and senior meal programs.'},
    {category:'Housing',icon:'🏠',title:'I need help with rent or housing',note:'Affordable housing, rent help, eviction, and local housing support.'},
    {category:'Bills',icon:'💡',title:'I need help paying household bills',note:'Electric, gas, utility, and other household bill assistance.'},
    {category:'Money & Benefits',icon:'💵',title:'I want to find benefits or save money',note:'Senior benefits, discounts, assistance programs, and ways to lower costs.'},
    {category:'Healthcare',icon:'♥',title:'I need help with Medicare or healthcare',note:'Medicare costs, prescriptions, Medicaid, coverage, and plan options.'}
  ];

  const shortNames={Food:'Food',Housing:'Housing',Bills:'Bills','Money & Benefits':'Benefits & savings',Healthcare:'Medicare & healthcare'};
  const priorNeeds=renderNeeds;
  const priorPlan=renderPlan;

  renderNeeds=function(){
    priorNeeds();
    const body=app.querySelector('.senior-concierge .concierge-body');
    if(!body)return;
    const chosen=problems.filter(item=>state.needs.includes(item.category));
    body.innerHTML=`
      <div class="quick-start-intro">
        <span class="eyebrow">Start here</span>
        <h1>What do you need help with right now?</h1>
        <p>Choose every problem that sounds like your situation. We’ll give you a quick place to start.</p>
        <div class="quick-start-promise"><span>✓</span><strong>No profile needed for your first answer.</strong></div>
      </div>
      <div class="problem-choice-list" aria-label="Choose the problems you need help with">
        ${problems.map(item=>`<button type="button" class="concierge-choice problem-choice ${state.needs.includes(item.category)?'selected':''}" data-quick-need="${esc(item.category)}" aria-pressed="${state.needs.includes(item.category)}"><span class="problem-choice-icon" aria-hidden="true">${item.icon}</span><span class="problem-choice-copy"><strong>${esc(item.title)}</strong><small>${esc(item.note)}</small></span></button>`).join('')}
      </div>
      ${chosen.length?`<div class="quick-selection-summary"><strong>${chosen.length} ${chosen.length===1?'problem':'problems'} selected</strong><div class="concierge-chips">${chosen.map(item=>`<span class="concierge-chip">${item.icon} ${esc(shortNames[item.category])}</span>`).join('')}</div></div>`:''}
      <div class="quick-start-actions">
        <button type="button" class="concierge-link-button" id="quickClear" ${chosen.length?'':'disabled'}>Clear choices</button>
        <button type="button" class="button quick-answer-button" id="quickContinue" ${chosen.length?'':'disabled'}>Get my quick answer →</button>
      </div>
      <p class="quick-start-footnote">Want more detail later? You can create a profile after your answer to save doctors, prescriptions, your current Medicare plan, and other preferences.</p>`;

    body.querySelectorAll('[data-quick-need]').forEach(button=>button.onclick=()=>{
      const name=button.dataset.quickNeed;
      state.needs=state.needs.includes(name)?state.needs.filter(x=>x!==name):[...state.needs,name];
      activeTopic=state.needs[0]||'';
      saveState();
      renderNeeds();
    });
    document.querySelector('#quickClear').onclick=()=>{state.needs=[];activeTopic='';saveState();renderNeeds();};
    document.querySelector('#quickContinue').onclick=()=>{if(!state.needs.length)return;routeStage='zip';screen='routing';render();};
  };

  renderRouting=function(){
    const healthcare=state.needs.includes('Healthcare');

    if(routeStage==='zip'){
      app.innerHTML=shell('Almost there',`
        <div class="quick-routing-heading"><span class="eyebrow">One quick detail</span><h2>What is your Illinois ZIP code?</h2><p>We use your ZIP to find programs and help available where you live.</p></div>
        <input id="routeZip" class="concierge-input" inputmode="numeric" maxlength="5" value="${esc(state.zip)}" placeholder="60625" aria-label="Illinois ZIP code">
        <p class="concierge-error" id="zipError" hidden>Enter a 5-digit Illinois ZIP code.</p>
        <div class="concierge-actions"><button type="button" class="concierge-link-button" id="routeBack">← Change problems</button><button type="button" class="button" id="zipNext">${healthcare?'Next →':'Show my quick answer →'}</button></div>`);
      document.querySelector('#routeBack').onclick=()=>{screen='needs';render();};
      document.querySelector('#zipNext').onclick=()=>{
        const zip=document.querySelector('#routeZip').value.trim();
        if(!/^6\d{4}$/.test(zip)){document.querySelector('#zipError').hidden=false;return;}
        state.zip=zip;saveState();
        if(healthcare){routeStage='medicare';renderRouting();}
        else{activeTopic=state.needs[0]||'';screen='plan';render();}
      };
      return;
    }

    if(routeStage==='medicare'||routeStage==='medicaid'){
      const key=routeStage;
      const isMedicare=key==='medicare';
      const current=state[key]||'';
      app.innerHTML=shell(isMedicare?'Medicare':'Medicaid',`
        <div class="quick-routing-heading"><span class="eyebrow">${isMedicare?'Medicare':'One last question'}</span><h2>Do you have ${isMedicare?'Medicare':'Medicaid'}?</h2><p>Choose “Not sure” if you don’t know. This only helps us show the most useful programs first.</p></div>
        <div class="concierge-choices concierge-single quick-answer-choices">${['Yes','No','Not sure'].map(value=>`<button type="button" class="concierge-choice ${current===value?'selected':''}" data-quick-answer="${value}">${value}</button>`).join('')}</div>
        <div class="concierge-actions"><button type="button" class="concierge-link-button" id="routePrev">← Back</button><button type="button" class="button" id="answerNext" ${current?'':'disabled'}>${isMedicare?'Next →':'Show my quick answer →'}</button></div>`);
      app.querySelectorAll('[data-quick-answer]').forEach(button=>button.onclick=()=>{state[key]=button.dataset.quickAnswer;saveState();renderRouting();});
      document.querySelector('#routePrev').onclick=()=>{routeStage=isMedicare?'zip':'medicare';renderRouting();};
      document.querySelector('#answerNext').onclick=()=>{
        if(!state[key])return;
        if(isMedicare){routeStage='medicaid';renderRouting();}
        else{activeTopic=state.needs[0]||'';screen='plan';render();}
      };
      return;
    }

    routeStage='zip';
    renderRouting();
  };

  renderPlan=function(){
    priorPlan();
    if(member||document.querySelector('.deeper-help-card'))return;
    const footer=document.querySelector('.concierge-plan-footer');
    if(!footer)return;
    footer.insertAdjacentHTML('beforebegin',`<section class="deeper-help-card"><div><span class="eyebrow">Want a deeper answer?</span><h3>Build your SeniorHelpersIL profile.</h3><p>Save your doctors, prescriptions, pharmacy, current Medicare plan, and preferences so future answers and plan comparisons can be more personal.</p></div><button type="button" class="button secondary" id="deeperProfileButton">Create my profile</button></section>`);
    const oldSave=document.querySelector('#savePlan');
    if(oldSave)oldSave.textContent='Create my profile';
    document.querySelector('#deeperProfileButton').onclick=()=>{returnScreen='plan';screen='create';render();};
  };

  if(screen==='needs')renderNeeds();
})();
