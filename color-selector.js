(function(){
  const KEY='seniorHelpersIL-color-palette-v1';
  const palettes={
    sage:{label:'Sage',theme:'#315f51'},
    harbor:{label:'Harbor Blue',theme:'#3f6f8a'},
    'navy-sand':{label:'Navy & Sand',theme:'#4a6279'},
    plum:{label:'Soft Plum',theme:'#6e5a78'},
    teal:{label:'Slate Teal',theme:'#477577'},
    terracotta:{label:'Terracotta',theme:'#8a6252'}
  };

  function applyPalette(code){
    if(!palettes[code])code='sage';
    document.body.dataset.palette=code;
    try{localStorage.setItem(KEY,code)}catch{}
    document.querySelectorAll('.color-option').forEach(button=>{
      const active=button.dataset.palette===code;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',palettes[code].theme);
  }

  function mount(){
    if(document.querySelector('.color-selector'))return;
    const panel=document.createElement('aside');
    panel.className='color-selector';
    panel.setAttribute('aria-label','Choose website colors');
    panel.innerHTML=`
      <strong class="color-selector-title">Choose colors</strong>
      <div class="color-options">
        ${Object.entries(palettes).map(([code,item])=>`<button type="button" class="color-option" data-palette="${code}" aria-pressed="false"><span class="color-swatch" aria-hidden="true"></span><span>${item.label}</span></button>`).join('')}
      </div>`;
    const header=document.querySelector('.site-header');
    if(header)header.insertAdjacentElement('afterend',panel);
    else document.body.insertAdjacentElement('afterbegin',panel);
    panel.querySelectorAll('.color-option').forEach(button=>button.onclick=()=>applyPalette(button.dataset.palette));
    let saved='sage';
    try{saved=localStorage.getItem(KEY)||'sage'}catch{}
    applyPalette(saved);
  }

  mount();
})();
