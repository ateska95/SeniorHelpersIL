(function(){
  function polish(){
    if(document.body.dataset.design!=='F')return;
    document.querySelectorAll('.concierge-id small').forEach(el=>el.textContent='No account required to see help.');
    document.querySelectorAll('.concierge-step').forEach(el=>{
      const card=el.closest('.concierge-card');
      const text=card?.textContent||'';
      if(/What would you like help with/i.test(text))el.textContent='Choose help';
      else if(/ZIP code/i.test(text))el.textContent='Location';
      else if(/Do you have Medicare/i.test(text))el.textContent='Medicare';
      else if(/Do you have Medicaid/i.test(text))el.textContent='Medicaid';
      else if(/Here is what I heard/i.test(text))el.textContent='Review';
      else if(/good place to start/i.test(text))el.textContent='Action Plan';
    });
    const switchName=document.querySelector('.design-lab-name');
    const switchNote=document.querySelector('.layout-lab-note');
    if(switchName)switchName.textContent='Senior-friendly concierge';
    if(switchNote)switchNote.textContent='Senior-friendly concierge';
  }
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish();});}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-design','data-view']});
  schedule();
})();
