const KEY = 'affordability-checkr-tour-seen-v1';
const overlay = document.getElementById('welcomeTour');
const title = document.getElementById('tourTitle');
const copy = document.getElementById('tourCopy');
const count = document.getElementById('tourCount');
const previous = document.getElementById('tourBack');
const next = document.getElementById('tourNext');
const skip = document.getElementById('tourSkip');
const openButton = document.getElementById('openTour');
const dots = document.getElementById('tourDots');
const slides = [
  { icon:'⌂', eyebrow:'WELCOME · 1 OF 4', title:'Welcome to Affordability Checkr', copy:'A free, simple way to see what you could afford to rent or buy in England. No account required — your figures stay in this browser.' },
  { icon:'☷', eyebrow:'YOUR HOUSEHOLD · 2 OF 4', title:'Start with your income', copy:'On Overview, add up to five people. Choose PAYE, self-employed or other income. Use the sliders or enter amounts to estimate take-home pay and rent affordability.' },
  { icon:'⌂', eyebrow:'RENTING · 3 OF 4', title:'Check renting and referencing', copy:'Set your monthly rent on Overview to see an income-based estimate. Visit Referencing checklist to see what documents agencies may request and who checks them.' },
  { icon:'◇', eyebrow:'BUYING · 4 OF 4', title:'Explore buying your first home', copy:'Open Buying a home to compare a standard mortgage with first-time buyer schemes, deposits, repayments and income needed. On mobile, swipe the navigation tabs sideways to find “Buying a home”.' }
];
let step = 0;
let focusReturn = null;
function render(){
  const item=slides[step];
  document.getElementById('tourIcon').textContent=item.icon;
  document.getElementById('tourEyebrow').textContent=item.eyebrow;
  title.textContent=item.title;
  copy.textContent=item.copy;
  count.textContent=`${step+1} of ${slides.length}`;
  previous.hidden=step===0;
  next.textContent=step===slides.length-1?'Start exploring →':'Next →';
  dots.innerHTML=slides.map((_,i)=>`<span class="tour-dot${i===step?' current':''}" aria-hidden="true"></span>`).join('');
}
function openTour(){
  focusReturn=document.activeElement;
  step=0;
  render();
  overlay.hidden=false;
  document.body.classList.add('tour-open');
  next.focus();
}
function closeTour(){
  overlay.hidden=true;
  document.body.classList.remove('tour-open');
  try{localStorage.setItem(KEY,'1');}catch{}
  (focusReturn instanceof HTMLElement?focusReturn:openButton).focus();
}
previous.addEventListener('click',()=>{if(step>0){step--;render();}});
next.addEventListener('click',()=>{if(step<slides.length-1){step++;render();}else closeTour();});
skip.addEventListener('click',closeTour);
openButton.addEventListener('click',openTour);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeTour();});
overlay.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closeTour();return;}
  if(e.key==='Tab'){
    const buttons=[...overlay.querySelectorAll('button:not([hidden])')];
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
try{if(localStorage.getItem(KEY)!=='1')openTour();}catch{openTour();}
