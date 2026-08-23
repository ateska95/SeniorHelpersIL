(function(){
  const SIZE_KEY='seniorHelpersIL-large-text';

  function applyTextSize(){
    const large=localStorage.getItem(SIZE_KEY)==='true';
    document.body.classList.toggle('large-text',large);
    const button=document.querySelector('#textSizeButton');
    if(button)button.textContent=large?'Standard text':'Larger text';
  }

  function addTextSizeControl(){
    const actions=document.querySelector('.header-actions');
    if(!actions||document.querySelector('#textSizeButton'))return;
    actions.insertAdjacentHTML('afterbegin','<button class="header-button text-size-button" id="textSizeButton" type="button">Larger text</button>');
    document.querySelector('#textSizeButton').onclick=()=>{
      const next=!document.body.classList.contains('large-text');
      localStorage.setItem(SIZE_KEY,String(next));
      applyTextSize();
    };
    restartButton.style.display='none';
    applyTextSize();
  }

  const shortNotes={
    Food:'Food and meals',
    Housing:'Housing and rent',
    Bills:'Utility bills',
    'Money & Benefits':'Benefits and savings',
    Healthcare:'Medicare and Medicaid'
  };

  const priorNeeds=renderNeeds;
  renderNeeds=function(){
    priorNeeds();
    intro.textContent='Pick one or more.';
    document.querySelector('.product-promise')?.remove();
    document.querySelector('.promise-note')?.remove();
    document.querySelector('#needsForm')?.insertAdjacentHTML('beforebegin','<p class="simple-promise">Get help first. No account needed.</p>');
    document.querySelectorAll('.help-card').forEach(card=>{
      const name=card.querySelector('.help-title')?.textContent.trim();
      const note=card.querySelector('.help-note');
      if(note&&shortNotes[name])note.textContent=shortNotes[name];
    });
  };

  const priorPlan=renderPlan;
  renderPlan=function(){
    if(state.needs?.length&&(filter==='All'||!state.needs.includes(filter)))filter=state.needs[0];
    priorPlan();
    intro.textContent='Start with one step.';

    document.querySelector('[data-filter="All"]')?.remove();
    const toolbar=document.querySelector('.plan-toolbar');
    if(toolbar){
      if((state.needs||[]).length<=1)toolbar.remove();
      else{
        const strong=toolbar.querySelector('strong');
        if(strong)strong.textContent='Choose a topic';
        toolbar.querySelector('p')?.remove();
      }
    }

    const ranking=document.querySelector('.ranking-promise');
    if(ranking)ranking.innerHTML='<strong>Practical help comes first.</strong>';

    document.querySelector('.savings-stack')?.remove();

    const progressBox=document.querySelector('.progress-summary');
    if(progressBox){
      const count=progressBox.querySelector('.progress-count')?.textContent||'0/0';
      if(count.startsWith('0/'))progressBox.remove();
      else progressBox.innerHTML=`<strong>${count} steps done</strong><span class="progress-count">${count}</span>`;
    }

    document.querySelectorAll('.recommendation-reason').forEach(reason=>reason.remove());
    document.querySelectorAll('.action-category-header p').forEach(p=>p.remove());
    document.querySelectorAll('.more-steps').forEach(block=>{
      const category=block.closest('.action-category')?.querySelector('.eyebrow')?.textContent.trim()||'';
      const summary=block.querySelector('summary');
      if(summary)summary.textContent=`More ${category.toLowerCase()} help`;
    });

    const pathway=document.querySelector('.medicare-pathway');
    if(pathway){
      pathway.querySelector('.medicare-pathway-head p')?.remove();
      pathway.querySelectorAll('.medicare-steps small').forEach(el=>el.remove());
      pathway.querySelector('.medicare-note')?.remove();
    }

    const groups=document.querySelector('.action-plan-groups');
    const profile=document.querySelector('.profile-prompt');
    if(groups&&profile){
      groups.insertAdjacentElement('afterend',profile);
      const heading=profile.querySelector('h2');
      const copy=profile.querySelector('p');
      const button=profile.querySelector('.button');
      if(member){
        if(heading)heading.textContent='Plan saved.';
        if(copy)copy.remove();
        if(button)button.textContent='My Profile';
      }else{
        if(heading)heading.textContent='Save this plan.';
        if(copy)copy.textContent='Only your name is required.';
        if(button)button.textContent='Save plan';
      }
    }
  };

  addTextSizeControl();
  if(typeof step!=='undefined'&&typeof view!=='undefined')render();
})();
