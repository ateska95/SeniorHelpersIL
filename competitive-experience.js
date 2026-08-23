(function(){
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

  if(typeof step!=='undefined'&&typeof view!=='undefined'&&step===3&&view==='flow')renderPlan();
})();
