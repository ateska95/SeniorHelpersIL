(function(){
  if(typeof render!=='function'||typeof shell!=='function'||typeof esc!=='function')return;
  const priorRender=render;
  render=function(){
    if(screen==='planCompare'&&!state.zip){
      if(member?.zip){state.zip=member.zip;saveState();return priorRender();}
      syncHeader();document.body.dataset.view='planCompare';
      app.innerHTML=`${shell('Compare Plans',`<div class="concierge-message"><strong>What is your Illinois ZIP code?</strong>Medicare plan availability is local. Start with ZIP, then add as much or as little health information as you want.</div><input id="compareZip" class="concierge-input" inputmode="numeric" maxlength="5" placeholder="60625" aria-label="Illinois ZIP code"><p class="concierge-error" id="compareZipError" hidden>Enter a 5-digit Illinois ZIP code.</p><div class="concierge-actions"><button type="button" class="concierge-link-button" id="compareZipBack">← Back</button><button type="button" class="button" id="compareZipNext">See demo plans →</button></div>`)}<section class="plan-market-shell"><div class="plan-market-note"><strong>Prototype:</strong> the plans shown after this step are fictional and are not real plan availability for your ZIP code.</div></section>`;
      document.querySelector('#compareZipBack').onclick=()=>{screen='medicareHelp';render();};
      document.querySelector('#compareZipNext').onclick=()=>{const zip=document.querySelector('#compareZip').value.trim();if(!/^6\d{4}$/.test(zip)){document.querySelector('#compareZipError').hidden=false;return;}state.zip=zip;saveState();priorRender();};
      return;
    }
    return priorRender();
  };
})();
