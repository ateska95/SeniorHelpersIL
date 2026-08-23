(function(){
  const app=document.querySelector('#app');
  if(!app)return;
  let applying=false;
  let buildToken='';

  const designNames={
    A:'Public-service directory',
    B:'Control-center dashboard',
    C:'Playful tactile interface',
    D:'Punk-zine collage',
    E:'One-card-at-a-time wizard',
    F:'Concierge chat'
  };

  function setRadio(name,value){
    const input=document.querySelector(`[name="${name}"][value="${CSS.escape(value)}"]`);
    if(input){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
  }

  function currentCards(){
    return [...app.querySelectorAll('.help-card')].map(card=>({
      card,
      input:card.querySelector('input'),
      title:card.querySelector('.help-title')?.textContent.trim()||'',
      note:card.querySelector('.help-note')?.textContent.trim()||'',
      icon:card.querySelector('.help-icon')?.textContent.trim()||'•'
    }));
  }

  function updateSwitcher(){
    const code=document.body.dataset.design||'F';
    const note=document.querySelector('.layout-lab-note');
    if(note)note.textContent=designNames[code];
    const name=document.querySelector('.design-lab-name');
    if(name)name.textContent=designNames[code];
  }

  function buildWizardNeeds(){
    const form=app.querySelector('#needsForm');
    const grid=form?.querySelector('.help-grid');
    if(!form||!grid||form.querySelector('.wizard-deck'))return;
    const cards=currentCards();
    if(!cards.length)return;
    let index=Math.max(0,cards.findIndex(x=>!x.input.checked));
    if(index<0)index=0;

    const deck=document.createElement('section');
    deck.className='wizard-deck';
    grid.insertAdjacentElement('beforebegin',deck);

    function renderWizard(){
      const item=cards[index];
      const selected=cards.filter(x=>x.input.checked);
      deck.innerHTML=`
        <div class="wizard-selected-title">Need ${index+1} of ${cards.length}</div>
        <div class="wizard-card">
          <div class="wizard-emoji">${item.icon}</div>
          <h2>${item.title}</h2>
          <p>${item.note}</p>
          <button type="button" class="button wizard-toggle ${item.input.checked?'selected':''}">${item.input.checked?'✓ Added':'Add this need'}</button>
        </div>
        <div class="radical-selected">${selected.length?selected.map(x=>`<span class="radical-chip">${x.icon} ${x.title}</span>`).join(''):'<span class="radical-chip">Nothing added yet</span>'}</div>
        <div class="wizard-nav">
          <button type="button" class="button secondary wizard-prev" ${index===0?'disabled':''}>← Previous</button>
          <button type="button" class="button wizard-next">${index===cards.length-1?'Continue →':'Next →'}</button>
        </div>
        <p class="error wizard-error" hidden>Please add at least one need.</p>`;
      deck.querySelector('.wizard-toggle').onclick=()=>{
        item.input.checked=!item.input.checked;
        item.input.dispatchEvent(new Event('change',{bubbles:true}));
        renderWizard();
      };
      deck.querySelector('.wizard-prev').onclick=()=>{if(index>0){index--;renderWizard();}};
      deck.querySelector('.wizard-next').onclick=()=>{
        if(index<cards.length-1){index++;renderWizard();return;}
        if(!cards.some(x=>x.input.checked)){deck.querySelector('.wizard-error').hidden=false;return;}
        form.requestSubmit();
      };
    }
    renderWizard();
  }

  function buildWizardRoute(){
    const form=app.querySelector('#routingForm');
    if(!form||form.querySelector('.wizard-route'))return;
    const healthcare=Boolean(form.querySelector('[name="medicare"]'));
    const holder=document.createElement('section');
    holder.className='wizard-route';
    form.appendChild(holder);
    const stages=healthcare?['zip','medicare','medicaid']:['zip'];
    let pos=0;
    const answers={
      zip:form.querySelector('#zip')?.value||'',
      medicare:form.querySelector('[name="medicare"]:checked')?.value||'',
      medicaid:form.querySelector('[name="medicaid"]:checked')?.value||''
    };

    function screen(){
      const stage=stages[pos];
      if(stage==='zip'){
        holder.innerHTML=`<div class="wizard-route-screen"><span class="eyebrow">One thing at a time</span><h2>What is your Illinois ZIP code?</h2><input class="wizard-zip" inputmode="numeric" maxlength="5" value="${answers.zip}" placeholder="60625"><p class="error wizard-route-error" hidden>Enter a valid Illinois ZIP.</p><button type="button" class="button wizard-route-next">${stages.length===1?'Show my plan →':'Next →'}</button><div><button type="button" class="header-button wizard-route-back">← Back</button></div></div>`;
        holder.querySelector('.wizard-route-next').onclick=()=>{
          const zip=holder.querySelector('.wizard-zip').value.trim();
          if(!/^6\d{4}$/.test(zip)){holder.querySelector('.wizard-route-error').hidden=false;return;}
          answers.zip=zip;form.querySelector('#zip').value=zip;
          if(stages.length===1){form.requestSubmit();return;}
          pos++;screen();
        };
      } else {
        const label=stage==='medicare'?'Do you have Medicare?':'Do you have Medicaid?';
        holder.innerHTML=`<div class="wizard-route-screen"><span class="eyebrow">Question ${pos+1} of ${stages.length}</span><h2>${label}</h2><div class="wizard-route-actions">${['Yes','No','Not sure'].map(v=>`<button type="button" class="button secondary segment-button ${answers[stage]===v?'selected':''}" data-value="${v}">${v}</button>`).join('')}</div><button type="button" class="button wizard-route-next" disabled>${pos===stages.length-1?'Show my plan →':'Next →'}</button><div><button type="button" class="header-button wizard-route-back">← Previous</button></div></div>`;
        holder.querySelectorAll('.segment-button').forEach(btn=>btn.onclick=()=>{
          answers[stage]=btn.dataset.value;
          setRadio(stage,btn.dataset.value);
          holder.querySelectorAll('.segment-button').forEach(x=>x.classList.toggle('selected',x===btn));
          holder.querySelector('.wizard-route-next').disabled=false;
        });
        if(answers[stage])holder.querySelector('.wizard-route-next').disabled=false;
        holder.querySelector('.wizard-route-next').onclick=()=>{
          if(!answers[stage])return;
          if(pos===stages.length-1){form.requestSubmit();return;}
          pos++;screen();
        };
      }
      holder.querySelector('.wizard-route-back').onclick=()=>{
        if(pos>0){pos--;screen();}
        else form.querySelector('#routingBack')?.click();
      };
    }
    screen();
  }

  function buildChatNeeds(){
    const form=app.querySelector('#needsForm');
    const grid=form?.querySelector('.help-grid');
    if(!form||!grid||form.querySelector('.chat-deck'))return;
    const cards=currentCards();
    const deck=document.createElement('section');
    deck.className='chat-deck';
    grid.insertAdjacentElement('beforebegin',deck);

    function renderChat(){
      const selected=cards.filter(x=>x.input.checked);
      deck.innerHTML=`<div class="chat-thread">
        <div class="chat-bubble"><strong>Hi. What can I help you with?</strong>You can pick more than one.</div>
        ${selected.length?`<div class="chat-bubble user">I need help with ${selected.map(x=>x.title).join(', ')}.</div>`:''}
        <div class="chat-choices">${cards.map(x=>`<button type="button" class="chat-choice ${x.input.checked?'selected':''}" data-title="${x.title}">${x.icon} ${x.title}</button>`).join('')}</div>
        <div class="chat-done"><button type="button" class="button chat-continue">${selected.length?'That’s what I need →':'Choose a topic'}</button></div>
        <p class="error chat-error" hidden>Pick at least one topic.</p>
      </div>`;
      deck.querySelectorAll('.chat-choice').forEach(btn=>btn.onclick=()=>{
        const item=cards.find(x=>x.title===btn.dataset.title);
        item.input.checked=!item.input.checked;
        item.input.dispatchEvent(new Event('change',{bubbles:true}));
        renderChat();
      });
      deck.querySelector('.chat-continue').onclick=()=>{
        if(!cards.some(x=>x.input.checked)){deck.querySelector('.chat-error').hidden=false;return;}
        form.requestSubmit();
      };
    }
    renderChat();
  }

  function buildChatRoute(){
    const form=app.querySelector('#routingForm');
    if(!form||form.querySelector('.chat-route'))return;
    const healthcare=Boolean(form.querySelector('[name="medicare"]'));
    const holder=document.createElement('section');holder.className='chat-route';form.appendChild(holder);
    holder.innerHTML=`<div class="chat-thread">
      <div class="chat-bubble"><strong>What is your Illinois ZIP code?</strong>I’ll use it to find local help.</div>
      <div class="chat-input-row"><input class="chat-zip" inputmode="numeric" maxlength="5" value="${form.querySelector('#zip')?.value||''}" placeholder="60625"></div>
      ${healthcare?`<div class="chat-bubble"><strong>Do you have Medicare?</strong></div><div class="chat-choices chat-medicare">${['Yes','No','Not sure'].map(v=>`<button type="button" class="chat-choice" data-value="${v}">${v}</button>`).join('')}</div><div class="chat-bubble"><strong>Do you have Medicaid?</strong></div><div class="chat-choices chat-medicaid">${['Yes','No','Not sure'].map(v=>`<button type="button" class="chat-choice" data-value="${v}">${v}</button>`).join('')}</div>`:''}
      <div class="chat-done"><button type="button" class="button chat-show-plan">Show my plan →</button></div>
      <div><button type="button" class="header-button chat-back">← Back</button></div>
      <p class="error chat-route-error" hidden>Enter a valid Illinois ZIP.</p>
    </div>`;
    if(healthcare){
      [['.chat-medicare','medicare'],['.chat-medicaid','medicaid']].forEach(([selector,name])=>{
        const current=form.querySelector(`[name="${name}"]:checked`)?.value||'';
        holder.querySelectorAll(`${selector} .chat-choice`).forEach(btn=>{
          btn.classList.toggle('selected',btn.dataset.value===current);
          btn.onclick=()=>{setRadio(name,btn.dataset.value);holder.querySelectorAll(`${selector} .chat-choice`).forEach(x=>x.classList.toggle('selected',x===btn));};
        });
      });
    }
    holder.querySelector('.chat-show-plan').onclick=()=>{
      const zip=holder.querySelector('.chat-zip').value.trim();
      if(!/^6\d{4}$/.test(zip)){holder.querySelector('.chat-route-error').hidden=false;return;}
      form.querySelector('#zip').value=zip;form.requestSubmit();
    };
    holder.querySelector('.chat-back').onclick=()=>form.querySelector('#routingBack')?.click();
  }

  function buildChatPlan(){
    if(app.querySelector('.chat-plan-intro'))return;
    const groups=app.querySelector('.action-plan-groups');
    if(!groups)return;
    const active=document.querySelector('.filter.active')?.textContent.trim()||state?.needs?.[0]||'this';
    groups.insertAdjacentHTML('beforebegin',`<div class="chat-thread chat-plan-intro"><div class="chat-bubble user">Show me ${active.toLowerCase()} help.</div><div class="chat-bubble"><strong>Here’s where I’d start.</strong>I’ll keep the extra options tucked away unless you want them.</div></div>`);
  }

  function apply(){
    if(applying)return;applying=true;
    try{
      updateSwitcher();
      const design=document.body.dataset.design||'F';
      const view=document.body.dataset.view||'';
      const token=`${design}:${view}:${app.childElementCount}:${app.textContent.length}`;
      if(token===buildToken){applying=false;return;}
      buildToken=token;
      app.querySelectorAll('.wizard-deck,.wizard-route,.chat-deck,.chat-route,.chat-plan-intro').forEach(el=>el.remove());
      if(design==='E'&&view==='needs')buildWizardNeeds();
      if(design==='E'&&view==='routing')buildWizardRoute();
      if(design==='F'&&view==='needs')buildChatNeeds();
      if(design==='F'&&view==='routing')buildChatRoute();
      if(design==='F'&&view==='plan')buildChatPlan();
    } finally {applying=false;}
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(()=>{buildToken='';apply();}));
  observer.observe(app,{childList:true,subtree:true});
  observer.observe(document.body,{attributes:true,attributeFilter:['data-design','data-view']});
  requestAnimationFrame(apply);
})();
