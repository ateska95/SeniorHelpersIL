(function(){
  const KEY='seniorHelpersIL-design-lab';
  const designs={
    A:'Public-service directory',
    B:'Control-center dashboard',
    C:'Playful tactile interface',
    D:'Punk-zine collage',
    E:'One-card-at-a-time wizard',
    F:'Concierge chat'
  };

  function setDesign(code){
    if(!designs[code])code='F';
    document.body.dataset.design=code;
    localStorage.setItem(KEY,code);
    document.querySelectorAll('.design-lab-button').forEach(button=>{
      const active=button.dataset.design===code;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const name=document.querySelector('.design-lab-name');
    if(name)name.textContent=designs[code];
    const meta=document.querySelector('meta[name="theme-color"]');
    const colors={A:'#b4232f',B:'#0f4168',C:'#f2b735',D:'#ff3f7d',E:'#0078b9',F:'#315f51'};
    if(meta)meta.setAttribute('content',colors[code]);
  }

  function mount(){
    if(document.querySelector('.design-lab-switcher'))return;
    const panel=document.createElement('aside');
    panel.className='design-lab-switcher';
    panel.setAttribute('aria-label','Compare website interaction designs');
    panel.innerHTML=`
      <strong>Compare interface</strong>
      <div class="design-lab-buttons">
        ${Object.keys(designs).map(code=>`<button class="design-lab-button" type="button" data-design="${code}" aria-label="Interface ${code}: ${designs[code]}" aria-pressed="false">${code}</button>`).join('')}
      </div>
      <span class="design-lab-name"></span>`;
    document.body.insertBefore(panel,document.body.firstChild);
    panel.querySelectorAll('.design-lab-button').forEach(button=>button.onclick=()=>setDesign(button.dataset.design));
    setDesign(localStorage.getItem(KEY)||'F');
  }

  mount();
})();
