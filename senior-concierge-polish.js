(function(){
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function polish(){
    if(document.body.dataset.design!=='F')return;
    document.querySelectorAll('.concierge-id small').forEach(el=>setText(el,'No account required to see help.'));
    document.querySelectorAll('.concierge-step').forEach(el=>{
      const card=el.closest('.concierge-card');
      const text=card?.textContent||'';
      if(/What would you like help with/i.test(text))setText(el,'Choose help');
      else if(/ZIP code/i.test(text))setText(el,'Location');
      else if(/Do you have Medicare/i.test(text))setText(el,'Medicare');
      else if(/Do you have Medicaid/i.test(text))setText(el,'Medicaid');
      else if(/Here is what I heard/i.test(text))setText(el,'Review');
      else if(/good place to start/i.test(text))setText(el,'Action Plan');
    });
    setText(document.querySelector('.design-lab-name'),'Senior-friendly concierge');
    setText(document.querySelector('.layout-lab-note'),'Senior-friendly concierge');
  }
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish();});}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-design','data-view']});
  schedule();
})();
