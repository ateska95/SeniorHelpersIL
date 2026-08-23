(function(){
  const root=document.querySelector('#app');
  if(!root)return;
  let busy=false;

  function isF(){return document.body.dataset.design==='F'}
  function view(){return document.body.dataset.view||''}
  function removeExisting(){root.querySelectorAll('.senior-concierge,.concierge-plan-welcome').forEach(el=>el.remove())}
  function hiddenCards(){return [...root.querySelectorAll('.help-card')].map(card=>({
    card,
    input:card.querySelector('input'),
    title:card.querySelector('.help-title')?.textContent.trim()||'',
    note:card.querySelector('.help-note')?.textContent.trim()||'',
    icon:card.querySelector('.help-icon')?.textContent.trim()||'•'
  })).filter(x=>x.input)}
  function setRadio(name,value){
    const input=[...document.querySelectorAll(`[name="${name}"]`)].find(el=>el.value===value);
    if(input){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
  }
  function shell(stepText,body){
    return `<section class="senior-concierge"><div class="concierge-card">
      <header class="concierge-head">
        <div class="concierge-id"><span class="concierge-mark">SH</span><div><strong>SeniorHelpersIL Guide</strong><small>A simple guide, not a government website.</small></div></div>
        <span class="concierge-step">${stepText}</span>
      </header>
      <div class="concierge-body">${body}</div>
    </div></section>`;
  }

  function buildNeeds(){
    const form=root.querySelector('#needsForm');
    const grid=form?.querySelector('.help-grid');
    const items=hiddenCards();
    if(!form||!grid||!items.length)return;
    const chosen=items.filter(x=>x.input.checked);
    const body=`
      <div class="concierge-message"><strong>What would you like help with today?</strong>Choose one or more. You can change this later.</div>
      <div class="concierge-choices">${items.map(item=>`<button type="button" class="concierge-choice ${item.input.checked?'selected':''}" data-concierge-need="${item.title}"><span class="concierge-choice-icon">${item.icon}</span>${item.title}</button>`).join('')}</div>
      ${chosen.length?`<div class="concierge-selected"><strong>You chose:</strong><div class="concierge-chips">${chosen.map(x=>`<span class="concierge-chip">${x.icon} ${x.title}</span>`).join('')}</div></div>`:''}
      <details class="concierge-why"><summary>Why am I choosing this?</summary><p>Your choices decide which Illinois programs and resources appear in your Action Plan. No account is required to see results.</p></details>
      <div class="concierge-actions"><button type="button" class="concierge-link-button" data-concierge-clear>Clear choices</button><button type="button" class="button" data-concierge-continue ${chosen.length?'':'disabled'}>Continue →</button></div>
      <p class="concierge-error" data-concierge-error hidden>Please choose at least one area.</p>
      <div class="concierge-help-line"><span>Prefer help from a person?</span><a href="tel:211">Call Illinois 211</a></div>`;
    grid.insertAdjacentHTML('beforebegin',shell('Step 1 of 2',body));
    const panel=form.querySelector('.senior-concierge');
    panel.querySelectorAll('[data-concierge-need]').forEach(button=>button.onclick=()=>{
      const item=items.find(x=>x.title===button.dataset.conciergeNeed);
      item.input.checked=!item.input.checked;
      item.input.dispatchEvent(new Event('change',{bubbles:true}));
      buildFresh();
    });
    panel.querySelector('[data-concierge-clear]').onclick=()=>{items.forEach(x=>{x.input.checked=false;x.input.dispatchEvent(new Event('change',{bubbles:true}));});buildFresh();};
    panel.querySelector('[data-concierge-continue]').onclick=()=>{
      if(!items.some(x=>x.input.checked)){panel.querySelector('[data-concierge-error]').hidden=false;return;}
      form.requestSubmit();
    };
  }

  function buildRouting(){
    const form=root.querySelector('#routingForm');
    if(!form)return;
    const health=Boolean(form.querySelector('[name="medicare"]'));
    const saved={
      zip:form.querySelector('#zip')?.value||'',
      medicare:form.querySelector('[name="medicare"]:checked')?.value||'',
      medicaid:form.querySelector('[name="medicaid"]:checked')?.value||''
    };
    let stage='zip';

    function draw(){
      root.querySelector('.senior-concierge')?.remove();
      let body='';
      let stepText='Step 2 of 2';
      if(stage==='zip'){
        body=`<div class="concierge-message"><strong>What is your Illinois ZIP code?</strong>I use this only to point you toward nearby help.</div>
          <input class="concierge-input" data-czip inputmode="numeric" maxlength="5" value="${saved.zip}" placeholder="60625" aria-label="Illinois ZIP code">
          <details class="concierge-why"><summary>Why do you need my ZIP?</summary><p>Many food, housing, utility, and healthcare programs serve specific areas. Your ZIP makes the results more useful.</p></details>
          <div class="concierge-actions"><button type="button" class="concierge-link-button" data-cback>← Back</button><button type="button" class="button" data-cnext>${health?'Continue →':'Review my answers →'}</button></div><p class="concierge-error" data-cerror hidden>Enter a 5-digit Illinois ZIP code.</p>`;
      }else if(stage==='medicare'||stage==='medicaid'){
        const isMedicare=stage==='medicare';
        const question=isMedicare?'Do you have Medicare?':'Do you have Medicaid?';
        const why=isMedicare?'This helps me show Medicare cost-saving programs only when they may apply.':'Medicaid can change which assistance and Medicare options are most useful.';
        body=`<div class="concierge-message"><strong>${question}</strong>If you are unsure, choose “Not sure.”</div>
          <div class="concierge-choices concierge-single">${['Yes','No','Not sure'].map(v=>`<button type="button" class="concierge-choice ${saved[stage]===v?'selected':''}" data-canswer="${v}">${v}</button>`).join('')}</div>
          <details class="concierge-why"><summary>Why do you ask this?</summary><p>${why}</p></details>
          <div class="concierge-actions"><button type="button" class="concierge-link-button" data-cback>← Back</button><button type="button" class="button" data-cnext ${saved[stage]?'':'disabled'}>${stage==='medicare'?'Continue →':'Review my answers →'}</button></div>`;
      }else{
        body=`<div class="concierge-message"><strong>Here is what I heard.</strong>Please check this before I build your Action Plan.</div>
          <div class="concierge-review">
            <div class="concierge-review-row"><span>ZIP code</span><strong>${saved.zip}</strong></div>
            ${health?`<div class="concierge-review-row"><span>Medicare</span><strong>${saved.medicare||'Not answered'}</strong></div><div class="concierge-review-row"><span>Medicaid</span><strong>${saved.medicaid||'Not answered'}</strong></div>`:''}
          </div>
          <div class="concierge-actions"><button type="button" class="concierge-link-button" data-cedit>Change an answer</button><button type="button" class="button" data-csubmit>Show my Action Plan →</button></div>
          <div class="concierge-trust"><span>✓</span><div><strong>No account required.</strong> Your answers are used to build this Action Plan.</div></div>`;
      }
      form.insertAdjacentHTML('afterbegin',shell(stepText,body));
      const panel=form.querySelector('.senior-concierge');
      if(stage==='zip'){
        panel.querySelector('[data-cnext]').onclick=()=>{const z=panel.querySelector('[data-czip]').value.trim();if(!/^6\d{4}$/.test(z)){panel.querySelector('[data-cerror]').hidden=false;return;}saved.zip=z;form.querySelector('#zip').value=z;stage=health?'medicare':'review';draw();};
        panel.querySelector('[data-cback]').onclick=()=>form.querySelector('#routingBack')?.click();
      }else if(stage==='medicare'||stage==='medicaid'){
        panel.querySelectorAll('[data-canswer]').forEach(button=>button.onclick=()=>{saved[stage]=button.dataset.canswer;setRadio(stage,button.dataset.canswer);panel.querySelectorAll('[data-canswer]').forEach(x=>x.classList.toggle('selected',x===button));panel.querySelector('[data-cnext]').disabled=false;});
        panel.querySelector('[data-cnext]').onclick=()=>{if(!saved[stage])return;stage=stage==='medicare'?'medicaid':'review';draw();};
        panel.querySelector('[data-cback]').onclick=()=>{stage=stage==='medicare'?'zip':'medicare';draw();};
      }else{
        panel.querySelector('[data-cedit]').onclick=()=>{stage='zip';draw();};
        panel.querySelector('[data-csubmit]').onclick=()=>form.requestSubmit();
      }
    }
    draw();
  }

  function buildPlan(){
    const groups=root.querySelector('.action-plan-groups');
    if(!groups)return;
    const activeFilter=document.querySelector('.filter.active');
    const active=(activeFilter?.textContent||state?.needs?.[0]||'your first topic').trim();
    const all=typeof recommendations==='function'?recommendations():[];
    const activeItems=all.filter(item=>item.category===active || active.includes(item.category));
    const first=activeItems[0];
    const topics=(state?.needs||[]);
    const body=`
      <div class="concierge-message"><strong>I found a good place to start.</strong>${first?first.title:'Your first recommendation is below.'}</div>
      <div class="concierge-message user"><strong>My focus:</strong>${active}</div>
      ${first?.reason?`<details class="concierge-why"><summary>Why is this first?</summary><p>${first.reason}</p></details>`:''}
      ${topics.length>1?`<div class="concierge-topic-jump">${topics.map(topic=>`<button type="button" class="${topic===active?'active':''}" data-ctopic="${topic}">${topic}</button>`).join('')}</div>`:''}
      <div class="concierge-plan-actions"><a class="button secondary" href="tel:211">I want help from a person</a></div>
      <div class="concierge-trust"><span>✓</span><div><strong>Practical help comes first.</strong> You can open more options only when you want them.</div></div>`;
    groups.insertAdjacentHTML('beforebegin',`<section class="concierge-plan-welcome">${shell('Your Action Plan',body)}</section>`);
    const panel=root.querySelector('.concierge-plan-welcome');
    panel.querySelectorAll('[data-ctopic]').forEach(button=>button.onclick=()=>{
      const target=[...document.querySelectorAll('.filter')].find(x=>x.textContent.includes(button.dataset.ctopic));
      target?.click();
    });
  }

  function buildFresh(){
    if(busy||!isF())return;
    busy=true;
    try{
      removeExisting();
      if(view()==='needs')buildNeeds();
      else if(view()==='routing')buildRouting();
      else if(view()==='plan')buildPlan();
    }finally{busy=false;}
  }

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;buildFresh();});}
  const observer=new MutationObserver(mutations=>{
    if(!isF())return;
    const meaningful=mutations.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('.senior-concierge,.concierge-plan-welcome')));
    if(meaningful)schedule();
  });
  observer.observe(root,{childList:true,subtree:false});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-design','data-view']});
  schedule();
})();
