renderPlan=function(){
  setHead(member?`${member.name.split(' ')[0]}'s Action Plan`:'Your Illinois Action Plan','Choose a topic. Start with its first step.',3);
  const all=recommendations();
  const categories=filter==='All'?state.needs:state.needs.filter(name=>name===filter);

  const categoryBlocks=categories.map(category=>{
    const items=all.filter(item=>item.category===category);
    if(!items.length)return '';
    const first=items[0];
    const more=items.slice(1);
    const itemCard=(item,index,isPrimary=false)=>`<article class="recommendation category-${slug(item.category)} ${isPrimary?'primary-step':''}">
      <div class="rank">${index+1}</div>
      <div class="recommendation-copy">
        <div class="recommendation-meta"><span class="category-label">${cats[item.category].icon} ${item.category}</span><span class="role-label">${esc(item.role||'Next step')}</span></div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
        ${item.reason?`<p class="recommendation-reason"><strong>Why this step:</strong> ${esc(item.reason)}</p>`:''}
        <small>${esc(item.source)}</small>
      </div>
      <div class="recommendation-actions">
        <a class="button small" href="${item.url}" target="_blank" rel="noopener">${esc(item.actionLabel||'Open resource')}</a>
        ${member?`<button class="button small secondary" data-save="${item.id}">${member.savedPrograms?.some(x=>x.id===item.id)?'Saved ✓':'Save to profile'}</button>`:''}
      </div>
    </article>`;

    return `<section class="action-category category-${slug(category)}">
      <header class="action-category-header">
        <div class="action-category-icon">${cats[category].icon}</div>
        <div><span class="eyebrow">${category}</span><h2>Your ${category.toLowerCase()} steps</h2><p>Start with the first step below.</p></div>
      </header>
      <div class="recommendations">${itemCard(first,0,true)}</div>
      ${more.length?`<details class="more-steps"><summary>See ${more.length} more ${category.toLowerCase()} ${more.length===1?'step':'steps'}</summary><div class="recommendations secondary-steps">${more.map((item,index)=>itemCard(item,index+1,false)).join('')}</div></details>`:''}
    </section>`;
  }).join('');

  app.innerHTML=`
    <section class="plan-toolbar compact-toolbar">
      <div><strong>What do you want to work on?</strong><p>Pick one topic or view everything.</p></div>
      <div class="filter-row"><button class="filter ${filter==='All'?'active':''}" data-filter="All">All topics</button>${state.needs.map(name=>`<button class="filter category-${slug(name)} ${filter===name?'active':''}" data-filter="${esc(name)}">${cats[name].icon} ${name}</button>`).join('')}</div>
    </section>
    ${!member?`<section class="profile-prompt"><div><span class="eyebrow">Keep your Action Plan</span><h2>Save these steps for later.</h2><p>Create a profile with only your name.</p></div><button class="button" id="createPlanProfile">Save My Plan</button></section>`:`<section class="profile-prompt saved"><div><span class="eyebrow">Saved to your profile</span><h2>Your Action Plan stays with you.</h2></div><button class="button" id="openProfile">My Profile</button></section>`}
    <div class="action-plan-groups">${categoryBlocks}</div>
    <div class="actions split"><button class="button secondary" id="changeAnswers">← Change location</button><button class="button" id="newPlan">Start new plan</button></div>`;

  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;renderPlan()});
  document.querySelector('#createPlanProfile')?.addEventListener('click',()=>{view='create';render()});
  document.querySelector('#openProfile')?.addEventListener('click',()=>{view='profile';render()});
  document.querySelectorAll('[data-save]').forEach(button=>button.onclick=()=>{
    const item=all.find(x=>x.id===button.dataset.save);
    member.savedPrograms=member.savedPrograms||[];
    if(!member.savedPrograms.some(x=>x.id===item.id))member.savedPrograms.push({...item,status:'Saved'});
    saveMember();
    renderPlan();
  });
  document.querySelector('#changeAnswers').onclick=()=>{step=2;render()};
  document.querySelector('#newPlan').onclick=restart;
};

if(typeof step!=='undefined'&&typeof view!=='undefined'&&step===3&&view==='flow')renderPlan();
