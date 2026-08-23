(function(){
  const SIZE_KEY='seniorHelpersIL-large-text';

  function applyTextSize(){
    const large=localStorage.getItem(SIZE_KEY)==='true';
    document.body.classList.toggle('large-text',large);
    const button=document.querySelector('#textSizeButton');
    if(button)button.textContent=large?'Standard text':'Larger text';
  }

  function addTextSizeControl(){
    const actions=document.querySelector('.header-actions');
    if(!actions||document.querySelector('#textSizeButton'))return;
    actions.insertAdjacentHTML('afterbegin','<button class="header-button text-size-button" id="textSizeButton" type="button">Larger text</button>');
    document.querySelector('#textSizeButton').onclick=()=>{
      const next=!document.body.classList.contains('large-text');
      localStorage.setItem(SIZE_KEY,String(next));
      applyTextSize();
    };
    applyTextSize();
  }

  addTextSizeControl();
})();
