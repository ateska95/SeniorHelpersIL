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
    priorPlan();
    intro.textContent='Start with one step.';

    const ranking=document.querySelector('.ranking-promise');
    if(ranking)ranking.innerHTML='<strong>Practical help comes first.</strong>';

    const stack=document.querySelector('.savings-stack');
    if(stack){
      const heading=stack.querySelector('.savings-stack-heading');
      if(heading)heading.innerHTML='<h2>Ways you may save</h2>';
      stack.querySelector('.stack-note')?.remove();
      stack.querySelectorAll('.savings-chip small').forEach(el=>el.remove());
    }

    const progressBox=document.querySelector('.progress-summary');
    if(progressBox){
      const count=progressBox.querySelector('.progress-count')?.textContent||'0/0';
      if(count.startsWith('0/'))progressBox.remove();
      else progressBox.innerHTML=`<strong>${count} steps done</strong><span class="progress-count">${count}</span>`;
    }

    document.querySelectorAll('.recommendation-reason').forEach(reason=>reason.remove());
    document.querySelectorAll('.recommendation-copy small').forEach(source=>{
      source.textContent=source.textContent.replace(/^Source:\s*/i,'');
    });

    const pathway=document.querySelector('.medicare-pathway');
    if(pathway){
      pathway.querySelector('.medicare-pathway-head p')?.remove();
      pathway.querySelectorAll('.medicare-steps small').forEach(el=>el.remove());
      pathway.querySelector('.medicare-note')?.remove();
    }
  };

  addTextSizeControl();
  if(typeof step!=='undefined'&&typeof view!=='undefined')render();
})();
