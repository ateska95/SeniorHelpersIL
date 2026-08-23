(function(){
  const app=document.querySelector('#app');
  if(!app)return;

  function identifyView(){
    let view='other';
    if(app.querySelector('.help-grid')) view='needs';
    else if(app.querySelector('#routingForm')) view='routing';
    else if(app.querySelector('.action-plan-groups')) view='plan';
    else if(app.querySelector('.profile-dashboard')) view='profile';
    document.body.dataset.view=view;

    app.querySelectorAll('.help-card').forEach(card=>{
      const title=card.querySelector('.help-title')?.textContent.trim()||'';
      card.dataset.category=title;
      card.classList.toggle('help-card-wide',title==='Money & Benefits');
    });

    app.querySelectorAll('.action-category').forEach(section=>{
      const category=section.querySelector('.eyebrow')?.textContent.trim()||'';
      section.dataset.category=category;
    });

    const switcher=document.querySelector('.design-lab-switcher');
    if(switcher){
      const design=document.body.dataset.design||'F';
      const blurbs={
        A:'Directory layout',
        B:'Quick-task grid',
        C:'Benefits guide',
        D:'Guided journey',
        E:'App dashboard',
        F:'Split navigation'
      };
      let note=switcher.querySelector('.layout-lab-note');
      if(!note){note=document.createElement('span');note.className='layout-lab-note';switcher.appendChild(note)}
      note.textContent=blurbs[design];
    }
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(identifyView));
  observer.observe(app,{childList:true,subtree:true});
  observer.observe(document.body,{attributes:true,attributeFilter:['data-design']});
  identifyView();
})();
