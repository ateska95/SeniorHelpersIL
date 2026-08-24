(function(){
  if(typeof render!=='function'||typeof renderNeeds!=='function'||typeof renderPlan!=='function')return;

  let medicareReturn='needs';
  let medicareTopic='all';

  const medicarePrograms=[
    {
      id:'msp',topic:'costs',icon:'💲',title:'Medicare Savings Programs',
      text:'May help pay Part A or Part B premiums. Some programs can also help with deductibles, coinsurance, and copays.',
      note:'If you qualify for an MSP, you also qualify for Extra Help with Medicare drug costs.',
      action:'Check Medicare Savings Programs',source:'Medicare.gov',
      url:'https://www.medicare.gov/basics/costs/help/medicare-savings-programs'
    },
    {
      id:'extra-help',topic:'drugs',icon:'💊',title:'Extra Help with drug costs',
      text:'Helps people with limited income and resources pay Medicare Part D premiums, deductibles, and prescription costs.',
      note:'People with full Medicaid, an MSP, or SSI generally get Extra Help automatically.',
      action:'Check Extra Help',source:'Medicare.gov',
      url:'https://www.medicare.gov/basics/costs/help/drug-costs'
    },
    {
      id:'medicaid',topic:'dual',icon:'♥',title:'Medicare + Medicaid help',
      text:'Illinois Medicaid can work together with Medicare and may open additional cost help and plan options.',
      note:'Illinois ABE is the state application and benefits portal.',
      action:'Open Illinois ABE',source:'State of Illinois',
      url:'https://abe.illinois.gov/'
    },
    {
      id:'ship',topic:'guidance',icon:'🧭',title:'Illinois SHIP counseling',
      text:'Free, independent Medicare counseling for coverage questions, bills, appeals, plan comparisons, and cost assistance.',
      note:'SHIP counselors are not connected to insurance companies or health plans.',
      action:'Visit Illinois SHIP',source:'Illinois Department on Aging',
      url:'https://ilaging.illinois.gov/ship.html'
    },
    {
      id:'payment-plan',topic:'drugs',icon:'📅',title:'Medicare Prescription Payment Plan',
      text:'Lets people with Medicare drug coverage spread covered out-of-pocket prescription costs across the calendar year.',
      note:'This can help with monthly cash flow, but it does not lower the total drug cost.',
      action:'Learn about monthly payments',source:'Medicare.gov',
      url:'https://www.medicare.gov/prescription-payment-plan'
    },
    {
      id:'drug-assistance',topic:'drugs',icon:'🏷️',title:'Drug manufacturer assistance',
      text:'Some pharmaceutical companies offer programs that may help with the cost of specific medications.',
      note:'Medicare provides a tool for finding Pharmaceutical Assistance Programs.',
      action:'Find drug assistance',source:'Medicare.gov',
      url:'https://www.medicare.gov/basics/get-started-with-medicare/using-medicare/helpful-tools'
    },
    {
      id:'enrollment',topic:'enrollment',icon:'🪪',title:'Sign up for Medicare Part A & Part B',
      text:'Find out when and how to enroll, including situations involving job-based coverage or a missed enrollment window.',
      note:'Medicare enrollment in Part A and Part B is generally handled through Social Security.',
      action:'Check how to sign up',source:'Medicare.gov',
      url:'https://www.medicare.gov/basics/get-started-with-medicare/sign-up/ready-to-sign-up-for-part-a-part-b'
    },
    {
      id:'appeals',topic:'appeals',icon:'📄',title:'Claims, appeals, and complaints',
      text:'Use Medicare guidance if a service, item, payment, or prescription is denied or you need to challenge a decision.',
      note:'Appeal steps depend on whether you have Original Medicare, Medicare Advantage, or a drug plan.',
      action:'Get appeal help',source:'Medicare.gov',
      url:'https://www.medicare.gov/providers-services/claims-appeals-complaints'
    },
    {
      id:'smp',topic:'fraud',icon:'🛡️',title:'Senior Medicare Patrol',
      text:'Illinois SMP helps people prevent, detect, and report Medicare and Medicaid fraud, waste, and abuse.',
      note:'Use this when a bill, call, or Medicare charge looks suspicious.',
      action:'Visit Illinois SMP',source:'Illinois Department on Aging',
      url:'https://ilaging.illinois.gov/ship/senior-medicare-patrol.html'
    },
    {
      id:'compare',topic:'compare',icon:'⚖️',title:'Compare Medicare coverage',
      text:'Compare Medicare Advantage and Part D options by costs, benefits, prescriptions, and other plan details.',
      note:'Keeping your current coverage is always a valid outcome if it remains the best fit.',
      action:'Open Medicare Plan Compare',source:'Medicare.gov',
      url:'https://www.medicare.gov/plan-compare/'
    }
  ];

  const topicButtons=[
    ['all','All Medicare help'],
    ['costs','Lower Medicare costs'],
    ['drugs','Prescription costs'],
    ['dual','Medicare + Medicaid'],
    ['guidance','Talk through Medicare'],
    ['enrollment','Enrollment'],
    ['appeals','Bills & appeals'],
    ['fraud','Fraud & scams'],
    ['compare','Compare coverage']
  ];

  function addHeaderButton(){
    const actions=document.querySelector('.header-actions');
    if(!actions||document.querySelector('#medicareHelpButton'))return;
    actions.insertAdjacentHTML('afterbegin','<button class="header-button" id="medicareHelpButton" type="button">Medicare Help</button>');
    document.querySelector('#medicareHelpButton').onclick=()=>openMedicareHelp(screen||'needs');
  }

  function openMedicareHelp(from){
    medicareReturn=from&&from!=='medicareHelp'?from:'needs';
    medicareTopic='all';
    screen='medicareHelp';
    render();
  }

  function companyContent(){
    if(document.querySelector('.company-story'))return;
    app.insertAdjacentHTML('beforeend',`
      <section class="company-story" aria-label="About SeniorHelpersIL">
        <div class="company-story-main">
          <span class="eyebrow">What is SeniorHelpersIL?</span>
          <h2>One place for Illinois senior help and Medicare guidance.</h2>
          <p>We help older adults find assistance, understand Medicare savings programs, organize healthcare preferences, and prepare for better plan decisions.</p>
          <div class="company-promise">We do not start by asking which insurance plan you want. We start by asking what you are trying to solve.</div>
        </div>
        <div class="company-service-grid">
          <article><span>1</span><div><strong>Find everyday help</strong><p>Food, housing, utility bills, benefits, and other Illinois resources.</p></div></article>
          <article><span>2</span><div><strong>Find Medicare savings</strong><p>Extra Help, Medicare Savings Programs, Medicaid, drug-cost help, and counseling.</p></div></article>
          <article><span>3</span><div><strong>Prepare for plan decisions</strong><p>Save your current plan, doctors, prescriptions, pharmacies, hospitals, and priorities.</p></div></article>
        </div>
        <div class="company-trust-grid">
          <div><strong>No account needed for basic help.</strong><span>See an Action Plan before deciding whether to save anything.</span></div>
          <div><strong>Keeping your plan can be the right answer.</strong><span>A plan change should solve a real problem, not create one.</span></div>
          <div><strong>Official sources come first.</strong><span>We point to Medicare.gov, Illinois agencies, and trusted community resources.</span></div>
        </div>
        <div class="company-actions">
          <button type="button" class="button" id="homeMedicareHelp">Explore Medicare help</button>
          ${member?'<button type="button" class="button secondary" id="homeHealthProfile">Review my profile</button>':''}
        </div>
      </section>`);
    document.querySelector('#homeMedicareHelp').onclick=()=>openMedicareHelp('needs');
    document.querySelector('#homeHealthProfile')?.addEventListener('click',()=>{returnScreen='needs';screen='profile';render();});
  }

  function programCard(item){
    return `<article class="medicare-program-card">
      <div class="medicare-program-icon" aria-hidden="true">${item.icon}</div>
      <div class="medicare-program-copy">
        <span class="medicare-source">${esc(item.source)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
        <div class="medicare-program-note">${esc(item.note)}</div>
      </div>
      <a class="button secondary" href="${item.url}" target="_blank" rel="noopener">${esc(item.action)}</a>
    </article>`;
  }

  function renderMedicareHelp(){
    const programs=medicareTopic==='all'?medicarePrograms:medicarePrograms.filter(x=>x.topic===medicareTopic);
    const getsMedicare=(state.medicare||member?.coverage?.medicare)==='Yes';
    app.innerHTML=`
      ${shell('Medicare Help',`
        <div class="concierge-message"><strong>What Medicare question are you trying to solve?</strong>Start with a topic, or browse all of the programs below.</div>
        ${getsMedicare?'<div class="medicare-savings-callout"><strong>Start with savings before changing coverage.</strong><span>Medicare Savings Programs and Extra Help can sometimes reduce costs without requiring a plan change.</span></div>':''}
        <div class="medicare-help-topics">${topicButtons.map(([key,label])=>`<button type="button" class="${medicareTopic===key?'active':''}" data-medicare-topic="${key}">${label}</button>`).join('')}</div>
      `)}
      <section class="medicare-help-center">
        <div class="medicare-help-intro">
          <div><span class="eyebrow">Medicare Help Center</span><h2>${medicareTopic==='all'?'Programs, protections, and next steps':topicButtons.find(x=>x[0]===medicareTopic)?.[1]||'Medicare help'}</h2></div>
          <p>These links go to Medicare.gov or official Illinois resources. SeniorHelpersIL organizes them around the problem you are trying to solve.</p>
        </div>
        <div class="medicare-program-grid">${programs.map(programCard).join('')}</div>
        <section class="medicare-connection-card">
          <div><span class="eyebrow">A useful connection</span><h3>Medicare savings programs often work together.</h3><p>If you qualify for Medicaid or a Medicare Savings Program, you generally qualify automatically for Extra Help with Medicare drug costs. Checking one program can uncover another.</p></div>
          <a class="button" href="https://www.medicare.gov/basics/costs/help/drug-costs" target="_blank" rel="noopener">Learn about Extra Help</a>
        </section>
        <div class="medicare-help-footer">
          <button type="button" class="concierge-link-button" id="medicareHelpBack">← Back</button>
          ${member?'<button type="button" class="button secondary" id="medicareProfileButton">My Health Profile</button>':'<button type="button" class="button secondary" id="medicareCreateProfile">Save a profile</button>'}
        </div>
      </section>`;

    app.querySelectorAll('[data-medicare-topic]').forEach(button=>button.onclick=()=>{medicareTopic=button.dataset.medicareTopic;renderMedicareHelp();});
    document.querySelector('#medicareHelpBack').onclick=()=>{screen=medicareReturn||'needs';render();};
    document.querySelector('#medicareProfileButton')?.addEventListener('click',()=>{returnScreen='medicareHelp';screen='profile';render();});
    document.querySelector('#medicareCreateProfile')?.addEventListener('click',()=>{returnScreen='medicareHelp';screen='create';render();});
  }

  const priorRender=render;
  render=function(){
    if(screen==='medicareHelp'){syncHeader();document.body.dataset.view='medicareHelp';return renderMedicareHelp();}
    return priorRender();
  };

  const priorNeeds=renderNeeds;
  renderNeeds=function(){priorNeeds();companyContent();};

  const priorPlan=renderPlan;
  renderPlan=function(){
    priorPlan();
    if(!state.needs.includes('Healthcare'))return;
    const footer=document.querySelector('.concierge-plan-footer');
    if(!footer||document.querySelector('.medicare-help-prompt'))return;
    footer.insertAdjacentHTML('beforebegin',`<section class="medicare-help-prompt"><div><span class="eyebrow">More Medicare help</span><h3>Need help beyond plan comparison?</h3><p>Explore savings programs, drug-cost help, enrollment, appeals, Medicaid, and free Illinois counseling.</p></div><button type="button" class="button secondary" id="planMedicareHelp">Open Medicare Help Center</button></section>`);
    document.querySelector('#planMedicareHelp').onclick=()=>openMedicareHelp('plan');
  };

  const priorProfile=renderProfile;
  renderProfile=function(){
    priorProfile();
    if(screen!=='profile'||document.querySelector('.health-setup'))return;
    const target=document.querySelector('.health-profile-card');
    if(!target||document.querySelector('.profile-medicare-help'))return;
    target.insertAdjacentHTML('afterend',`<section class="profile-medicare-help"><div><span class="eyebrow">Medicare resources</span><h2>Get help with Medicare costs and coverage.</h2><p>Extra Help, Medicare Savings Programs, Medicaid, SHIP counseling, prescription support, enrollment, and appeals are all available in one place.</p></div><button type="button" class="button secondary" id="profileMedicareHelp">Open Medicare Help Center</button></section>`);
    document.querySelector('#profileMedicareHelp').onclick=()=>openMedicareHelp('profile');
  };

  addHeaderButton();
  if(screen==='needs')companyContent();
})();