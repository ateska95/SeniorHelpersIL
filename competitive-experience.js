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
})();
