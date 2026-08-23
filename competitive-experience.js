(function(){
  const PROGRESS_KEY='seniorHelpersIL-action-progress-v1';

  const originalRenderNeeds=renderNeeds;
  renderNeeds=function(){
    originalRenderNeeds();
    const form=document.querySelector('#needsForm');
    if(!form)return;
    form.insertAdjacentHTML('beforebegin',`
      <section class="product-promise" aria-label="How SeniorHelpersIL works">
        <article class="promise-card"><span class="promise-number">1</span><strong>Find help first</strong><p>Start with Illinois programs and services.</p></article>
        <article class="promise-card"><span class="promise-number">2</span><strong>Check Medicare savings</strong><p>Review coverage only when useful.</p></article>
        <article class="promise-card"><span class="promise-number">3</span><strong>Get human help</strong><p>Ask for an agent when needed.</p></article>
      </section>
      <p class="promise-note">You can see help without creating an account.</p>`);
  };

  const originalRenderPlan=renderPlan;
  renderPlan=function(){
    originalRenderPlan();
    addSavingsStack();
    addSourceTrust();
    addProgressTracking();
    addMedicarePathway();
  };

  function addSavingsStack(){
    const groups=document.querySelector('.action-plan-groups');
    if(!groups)return;
    const all=recommendations();
    const savings=all.filter(item=>/SNAP|Savings Program|Extra Help|utility assistance|senior discounts|available benefits/i.test(item.title)).slice(0,4);
    if(!savings.length)return;
    const medicare=(state.medicare||member?.coverage?.medicare)==='Yes';
    groups.insertAdjacentHTML('beforebegin',`
      <section class="savings-stack">
        <div class="savings-stack-heading">
          <span class="eyebrow">Low-income savings check</span>
          <h2>Your Savings Stack</h2>
          <p>${medicare?'Check assistance before changing Medicare.':'Check programs that may lower monthly costs.'}</p>
        </div>
        <div class="savings-stack-grid">
          ${savings.map(item=>`<div class="savings-chip category-${slug(item.category)}"><span>${cats[item.category].icon}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.reason||item.text)}</small></div></div>`).join('')}
        </div>
        <p class="stack-note">SeniorHelpersIL looks beyond insurance coverage.</p>
      </section>`);
  }

  function addSourceTrust(){
    const toolbar=document.querySelector('.plan-toolbar');
    if(toolbar&&!document.querySelector('.ranking-promise')){
      toolbar.insertAdjacentHTML('afterend',`<div class="ranking-promise"><strong>How we rank your steps</strong><span>Practical help comes first. Insurance payment is not used.</span></div>`);
    }
    document.querySelectorAll('.recommendation').forEach(card=>{
      const source=card.querySelector('small');
      if(!source||card.querySelector('.source-trust'))return;
      const name=source.textContent.trim();
      const official=/Medicare\.gov|Illinois ABE|Illinois DCEO|Illinois Department|Illinois SHIP/i.test(name);
      source.insertAdjacentHTML('afterend',`<span class="source-trust ${official?'official':'community'}">✓ ${official?'Official public source':'Trusted community source'}</span>`);
    });
  }

  function progressKey(){
    return [state.zip,(state.needs||[]).slice().sort().join(','),state.medicare||'',state.medicaid||''].join('|');
  }
  function progressStore(){
    try{return JSON.parse(localStorage.getItem(PROGRESS_KEY))||{}}catch{return {}}
  }
  function completedIds(){return new Set(progressStore()[progressKey()]||[])}
  function toggleCompleted(id){
    const store=progressStore();
    const set=new Set(store[progressKey()]||[]);
    set.has(id)?set.delete(id):set.add(id);
    store[progressKey()]=[...set];
    localStorage.setItem(PROGRESS_KEY,JSON.stringify(store));
  }
  function addProgressTracking(){
    const groups=document.querySelector('.action-plan-groups');
    if(!groups)return;
    const all=recommendations();
    const done=completedIds();
    const matchedDone=all.filter(item=>done.has(item.id)).length;
    const anchor=document.querySelector('.savings-stack')||groups;
    anchor.insertAdjacentHTML('beforebegin',`
      <section class="progress-summary">
        <div><strong>${matchedDone?`${matchedDone} of ${all.length} steps done`:'Work through your plan at your pace'}</strong><span>${matchedDone?'Your progress stays on this device.':'Mark steps done. No account is needed.'}</span></div>
        <span class="progress-count">${matchedDone}/${all.length}</span>
      </section>`);
    document.querySelectorAll('.recommendation').forEach(card=>{
      const title=card.querySelector('h3')?.textContent.trim();
      const item=all.find(x=>x.title===title);
      const actions=card.querySelector('.recommendation-actions');
      if(!item||!actions)return;
      const isDone=done.has(item.id);
      card.classList.toggle('completed-step',isDone);
      actions.insertAdjacentHTML('beforeend',`<button class="button small completion-button ${isDone?'done':''}" type="button" data-complete="${item.id}">${isDone?'Done ✓':'Mark done'}</button>`);
    });
    document.querySelectorAll('[data-complete]').forEach(button=>button.onclick=()=>{toggleCompleted(button.dataset.complete);renderPlan()});
  }

  function addMedicarePathway(){
    const medicare=(state.medicare||member?.coverage?.medicare)==='Yes';
    if(!medicare||!state.needs.includes('Healthcare'))return;
    const healthcareGroup=document.querySelector('.action-category.category-healthcare');
    if(!healthcareGroup)return;
    healthcareGroup.insertAdjacentHTML('beforebegin',`
      <section class="medicare-pathway">
        <div class="medicare-pathway-head">
          <span class="eyebrow">Self-service Medicare path</span>
          <h2>Change plans only when it helps.</h2>
          <p>Start with savings programs. Compare coverage afterward.</p>
        </div>
        <ol class="medicare-steps">
          <li><span>1</span><div><strong>Check assistance</strong><small>Review MSP and Extra Help first.</small></div></li>
          <li><span>2</span><div><strong>Understand your current plan</strong><small>Know what already works for you.</small></div></li>
          <li><span>3</span><div><strong>Compare total value</strong><small>Look beyond premiums and extra benefits.</small></div></li>
          <li><span>4</span><div><strong>Enroll only if better</strong><small>Keeping your current plan is valid.</small></div></li>
        </ol>
        <div class="medicare-actions">
          <a class="button" href="https://www.medicare.gov/plan-compare/" target="_blank" rel="noopener">Compare Medicare options</a>
          <button class="button secondary" type="button" id="medicareHumanHelp">I want personal help</button>
        </div>
        <p class="medicare-note">A SeniorHelpersIL self-enrollment connection is planned.</p>
      </section>`);
    document.querySelector('#medicareHumanHelp')?.addEventListener('click',()=>{
      if(!member){view='create';render();return;}
      view='profile';render();
      const panel=[...document.querySelectorAll('.profile-section')].find(x=>x.querySelector('summary')?.textContent.includes('Contact Choices'));
      if(panel){panel.open=true;setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'center'}),50)}
    });
  }

  if(typeof step!=='undefined'&&typeof view!=='undefined'&&step===3&&view==='flow')renderPlan();
})();
