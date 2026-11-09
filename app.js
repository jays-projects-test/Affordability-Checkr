import {calculatePerson,safeNumber} from './tax.js';
const $=id=>document.getElementById(id);
const gbp=(n,digits=0)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n||0);
const newPerson=(id,type='paye',name='Applicant')=>({id,name,type,payMode:'annual',salary:24000,hourly:12.5,hours:40,weeks:48,revenue:58000,expenses:10000,otherTax:'taxable'});
const initial=()=>({year:'2026/27',rent:1500,multiplier:30,people:[{...newPerson(1,'self','You')},{...newPerson(2,'paye','Applicant 2')}]});
let state=initial();
let editingTaxApplicant=1;
try{const saved=JSON.parse(localStorage.getItem('affordability-checkr-v1'));if(saved&&['2025/26','2026/27'].includes(saved.year)&&Array.isArray(saved.people)&&saved.people.length>0&&saved.people.length<=5){state={...initial(),...saved,people:saved.people.map((p,i)=>({...newPerson(i+1),...p,id:i+1}))};}}catch{}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slider=(id,field,value,max,step=500,min=0)=>`<div class="slider-line"><input type="range" data-id="${id}" data-field="${field}" min="${min}" max="${max}" step="${step}" value="${Math.min(max,Math.max(min,value))}" aria-label="${field} slider"><span class="range-hint">${gbp(max)}</span></div>`;
const field=(p,key,title,max=150000,step=500,withSlider=true)=>`<div class="field"><label for="field-${p.id}-${key}">${title}</label><div class="number-wrap"><span>£</span><input id="field-${p.id}-${key}" type="number" data-id="${p.id}" data-field="${key}" min="0" max="10000000" step="any" value="${safeNumber(p[key])}" inputmode="decimal"></div>${withSlider?slider(p.id,key,safeNumber(p[key]),max,step):''}</div>`;
function personMarkup(p){const r=calculatePerson(p,state.year);let fields='';
if(p.type==='self')fields=`<div class="field-grid">${field(p,'revenue','Annual turnover')}${field(p,'expenses','Business expenses',100000)}</div><div class="small-notice">Profit = turnover − allowable business expenses. Your Personal Allowance does not reduce your business profit.</div>`;
if(p.type==='paye')fields=`<div class="field"><label for="mode-${p.id}">How are they paid?</label><select id="mode-${p.id}" data-id="${p.id}" data-field="payMode"><option value="annual" ${p.payMode==='annual'?'selected':''}>Annual gross salary</option><option value="hourly" ${p.payMode==='hourly'?'selected':''}>Hourly rate</option></select></div>${p.payMode==='annual'?field(p,'salary','Gross annual income',150000):`<div class="field-grid">${field(p,'hourly','Hourly pay (£)',100,0.5,false)}${field(p,'hours','Hours / week',80,1,false)}</div><div class="field">${field(p,'weeks','Paid weeks / year',52,1,false)}</div><div class="small-notice">Include paid holiday weeks. Variable hours may be assessed differently by an agency.</div>`}`;
if(p.type==='other')fields=`${field(p,'salary','Annual income',150000)}<div class="field"><label for="other-${p.id}">Estimated tax treatment</label><select id="other-${p.id}" data-id="${p.id}" data-field="otherTax"><option value="taxable" ${p.otherTax==='taxable'?'selected':''}>Ordinary taxable income (no NI)</option><option value="non-taxable" ${p.otherTax==='non-taxable'?'selected':''}>Non-taxable income</option></select></div><div class="small-notice">Simplified estimate only. Dividends, savings, rental income and benefits can have different rules. Check whether the letting agent accepts this income.</div>`;
return `<article class="applicant"><div class="applicant-top"><div class="person-label"><span class="avatar">${p.id}</span><input class="person-name" type="text" maxlength="32" aria-label="Applicant name" data-id="${p.id}" data-field="name" value="${escapeHTML(p.name)}"></div><button class="remove" type="button" data-remove="${p.id}" aria-label="Remove ${escapeHTML(p.name)}" title="Remove applicant">×</button></div><div class="person-content"><div class="type-tabs" role="group" aria-label="Income type for ${escapeHTML(p.name)}"><button type="button" data-type="paye" data-id="${p.id}" class="type-btn ${p.type==='paye'?'active':''}">PAYE</button><button type="button" data-type="self" data-id="${p.id}" class="type-btn ${p.type==='self'?'active':''}">Self-employed</button><button type="button" data-type="other" data-id="${p.id}" class="type-btn ${p.type==='other'?'active':''}">Other</button></div><div class="fields">${fields}</div><div class="person-foot"><div class="foot-metric"><small>${p.type==='self'?'Business profit':'Annual gross'}</small><b>${gbp(r.gross)}</b></div><div class="foot-metric"><small>Estimated tax + NI</small><b>${gbp(r.totalTax)}</b></div><div class="foot-metric"><small>Monthly net</small><b>${gbp(r.net/12)}</b></div></div></div></article>`;}
function totals(){const results=state.people.map(p=>({...calculatePerson(p,state.year),name:p.name}));const sum=k=>results.reduce((a,b)=>a+b[k],0);return {results,gross:sum('gross'),net:sum('net'),incomeTax:sum('incomeTax'),ni:sum('ni'),tax:sum('totalTax')};}
function taxEditorMarkup(p){
  if(!p)return '';
  if(p.type==='self')return `${field(p,'revenue','Annual turnover',150000)}${field(p,'expenses','Business expenses',100000)}`;
  if(p.type==='paye')return `${p.payMode==='hourly'?`${field(p,'hourly','Hourly rate (£)',100,.25)}${field(p,'hours','Hours per week',80,1)}${field(p,'weeks','Paid weeks per year',52,1)}`:field(p,'salary','Gross annual salary',150000)}`;
  return field(p,'salary','Other annual income',150000);
}
function renderTaxEditor(){
  if(!state.people.some(p=>p.id===editingTaxApplicant))editingTaxApplicant=state.people[0].id;
  $('taxApplicant').innerHTML=state.people.map(p=>`<option value="${p.id}" ${p.id===editingTaxApplicant?'selected':''}>${escapeHTML(p.name)}</option>`).join('');
  $('taxControls').innerHTML=taxEditorMarkup(state.people.find(p=>p.id===editingTaxApplicant));
}
function updateTaxBreakdown(){
  const t=totals();
  $('taxCards').innerHTML=t.results.map(r=>`<article class="panel tax-person"><h3>${escapeHTML(r.name)}</h3><div class="type-caption">${r.kind==='self'?'Self-employed · trading profit':r.kind==='paye'?'PAYE employment':'Other income · simplified'} · ${escapeHTML(state.year)}</div><div class="summary-rows"><div><span>Annual ${r.kind==='self'?'profit':'income'}</span><b>${gbp(r.gross)}</b></div><div><span>Personal Allowance${r.excluded?' (not applied)':''}</span><b>${gbp(r.allowance)}</b></div><div><span>Taxable amount</span><b>${gbp(r.taxable)}</b></div><div><span>Income Tax · 20%</span><b>${gbp(r.basic)}</b></div><div><span>Income Tax · 40%</span><b>${gbp(r.higher)}</b></div><div><span>Income Tax · 45%</span><b>${gbp(r.additional)}</b></div><div><span>${r.kind==='self'?'Class 4 NI':r.kind==='paye'?'Employee Class 1 NI':'NI (not modelled)'}</span><b>${gbp(r.ni)}</b></div><div><span>Tax + NI</span><b>${gbp(r.totalTax)}</b></div><div class="summary-strong"><span>Annual take-home</span><b>${gbp(r.net)}</b></div><div class="summary-strong"><span>Monthly take-home</span><b>${gbp(r.net/12)}</b></div></div></article>`).join('');
  $('taxGrossTotal').textContent=gbp(t.gross);$('taxIncomeTotal').textContent=gbp(t.incomeTax);$('taxNITotal').textContent=gbp(t.ni);$('taxNetTotal').textContent=gbp(t.net);
}
function render(){state.people=state.people.slice(0,5);$('taxYear').value=state.year;$('rentNumber').value=state.rent;$('rentRange').value=Math.min(5000,state.rent);$('multiplier').value=String(state.multiplier);$('applicants').innerHTML=state.people.map(personMarkup).join('');$('peopleCounter').textContent=`${state.people.length} / 5`;$('addApplicant').disabled=state.people.length>=5;$('addApplicant').textContent=state.people.length>=5?'Maximum 5 applicants reached':'+ Add another applicant';
const t=totals(),required=state.rent*state.multiplier,maximum=t.gross/state.multiplier,passes=t.gross>=required;
$('householdIncome').textContent=gbp(t.gross);$('householdNet').textContent=gbp(t.net/12);$('maxRent').textContent=gbp(maximum);$('householdTax').textContent=gbp(t.tax);
$('requiredIncome').textContent=gbp(required);$('availableIncome').textContent=gbp(t.gross);$('afterRent').textContent=gbp(t.net/12-state.rent);$('statusText').textContent=passes?`${gbp(t.gross-required)} above the income threshold.`:`${gbp(required-t.gross)} below the income threshold.`;$('statusPill').className='status '+(passes?'good':'bad');$('statusPill').textContent=passes?'✓ Meets threshold':'! Below threshold';$('resultBox').classList.toggle('fail',!passes);$('progress').style.width=`${required<=0?100:Math.min(100,100*t.gross/required)}%`;
const largest=Math.max(1,...t.results.map(r=>r.gross));$('incomeBars').innerHTML=t.results.map(r=>`<div class="bar-row"><div class="bar-head"><span>${escapeHTML(r.name)}</span><b>${gbp(r.gross)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${r.gross/largest*100}%"></div></div></div>`).join('');
renderTaxEditor();updateTaxBreakdown();try{localStorage.setItem('affordability-checkr-v1',JSON.stringify(state));}catch{}
}
// Keep focus and selection while updating calculations on numeric input. Rebuild on committed change.
function updateSummaryOnly(){const t=totals(),req=state.rent*state.multiplier;const pass=t.gross>=req;$('householdIncome').textContent=gbp(t.gross);$('householdNet').textContent=gbp(t.net/12);$('maxRent').textContent=gbp(t.gross/state.multiplier);$('householdTax').textContent=gbp(t.tax);$('requiredIncome').textContent=gbp(req);$('availableIncome').textContent=gbp(t.gross);$('afterRent').textContent=gbp(t.net/12-state.rent);$('statusPill').className='status '+(pass?'good':'bad');$('statusPill').textContent=pass?'✓ Meets threshold':'! Below threshold';$('resultBox').classList.toggle('fail',!pass);$('statusText').textContent=pass?`${gbp(t.gross-req)} above the income threshold.`:`${gbp(req-t.gross)} below the income threshold.`;$('progress').style.width=`${req<=0?100:Math.min(100,100*t.gross/req)}%`;state.people.forEach((p,i)=>{const el=$('applicants').children[i];if(!el)return;const r=t.results[i];const cells=el.querySelectorAll('.foot-metric b');cells[0].textContent=gbp(r.gross);cells[1].textContent=gbp(r.totalTax);cells[2].textContent=gbp(r.net/12);});$('incomeBars').innerHTML=t.results.map(r=>`<div class="bar-row"><div class="bar-head"><span>${escapeHTML(r.name)}</span><b>${gbp(r.gross)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${r.gross/Math.max(1,...t.results.map(z=>z.gross))*100}%"></div></div></div>`).join('');updateTaxBreakdown();try{localStorage.setItem('affordability-checkr-v1',JSON.stringify(state));}catch{}}
$('applicants').addEventListener('click',e=>{const type=e.target.closest('[data-type]');if(type){const p=state.people.find(p=>p.id===Number(type.dataset.id));if(p){p.type=type.dataset.type;render();}return;}const remove=e.target.closest('[data-remove]');if(remove&&state.people.length>1){state.people=state.people.filter(p=>p.id!==Number(remove.dataset.remove));render();}});
$('applicants').addEventListener('input',e=>{const el=e.target;const key=el.dataset.field;const p=state.people.find(p=>p.id===Number(el.dataset.id));if(!p||!key)return;p[key]=key==='name'?el.value:safeNumber(el.value);if(el.type==='range'){const num=$(`field-${p.id}-${key}`);if(num)num.value=el.value;}else if(el.type==='number'){const range=$('applicants').querySelector(`input[type="range"][data-id="${p.id}"][data-field="${key}"]`);if(range)range.value=Math.min(Number(range.max),safeNumber(el.value));}updateSummaryOnly();});
$('applicants').addEventListener('change',e=>{const el=e.target;const p=state.people.find(p=>p.id===Number(el.dataset.id));if(p&&el.dataset.field){p[el.dataset.field]=['payMode','otherTax','name'].includes(el.dataset.field)?el.value:safeNumber(el.value);render();}});
$('taxApplicant').addEventListener('change',e=>{editingTaxApplicant=Number(e.target.value);renderTaxEditor();});
$('taxControls').addEventListener('input',e=>{
  const el=e.target,p=state.people.find(p=>p.id===Number(el.dataset.id)),key=el.dataset.field;
  if(!p||!key)return;
  p[key]=safeNumber(el.value);
  if(el.type==='range'){
    const num=$('taxControls').querySelector(`[data-id="${p.id}"][data-field="${key}"][type="number"]`);if(num)num.value=el.value;
  }else if(el.type==='number'){
    const range=$('taxControls').querySelector(`[data-id="${p.id}"][data-field="${key}"][type="range"]`);if(range)range.value=Math.min(Number(range.max),p[key]);
  }
  updateSummaryOnly();
});
$('taxControls').addEventListener('change',()=>render());
$('addApplicant').addEventListener('click',()=>{if(state.people.length>=5)return;let id=1;while(state.people.some(p=>p.id===id))id++;state.people.push(newPerson(id,'paye',`Applicant ${id}`));render();});
$('reset').addEventListener('click',()=>{if(confirm('Reset all applicants and calculations to the example values?')){state=initial();render();}});
$('taxYear').addEventListener('change',e=>{state.year=e.target.value;render();});
$('rentNumber').addEventListener('input',e=>{state.rent=Math.min(15000,safeNumber(e.target.value));$('rentRange').value=Math.min(5000,state.rent);updateSummaryOnly();});$('rentNumber').addEventListener('change',render);
$('rentRange').addEventListener('input',e=>{state.rent=safeNumber(e.target.value);$('rentNumber').value=state.rent;updateSummaryOnly();});
$('multiplier').addEventListener('change',e=>{state.multiplier=Number(e.target.value);render();});
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.page').forEach(page=>page.classList.toggle('active',page.id===btn.dataset.tab));render();}));
$('downloadCsv').addEventListener('click',()=>{const rows=[['Tax year','Applicant','Type','Gross/profit','Personal allowance','Income tax','NI','Net'],...state.people.map(p=>{const r=calculatePerson(p,state.year);return [state.year,p.name,p.type,r.gross.toFixed(2),r.allowance.toFixed(2),r.incomeTax.toFixed(2),r.ni.toFixed(2),r.net.toFixed(2)];})];const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='affordability-checkr-'+state.year.replace('/','-')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);});
render();

// Checklist state is private to this browser, separate from financial calculations.
const refBoxes = [...document.querySelectorAll('input[data-ref]')];
const refKey = 'affordability-checkr-reference-v1';
let refSaved = [];
try { const raw=JSON.parse(localStorage.getItem(refKey)); if(Array.isArray(raw))refSaved=raw; }catch{}
refBoxes.forEach(box => {box.checked = refSaved.includes(box.dataset.ref);});
function updateRefProgress(){
  const checked=refBoxes.filter(box=>box.checked).length;
  document.getElementById('refProgressText').textContent=`${checked} of ${refBoxes.length} prepared`;
  document.getElementById('refProgressBar').style.width=`${100*checked/Math.max(1,refBoxes.length)}%`;
  try{localStorage.setItem(refKey,JSON.stringify(refBoxes.filter(box=>box.checked).map(box=>box.dataset.ref)));}catch{}
}
refBoxes.forEach(box=>box.addEventListener('change',updateRefProgress));
document.getElementById('refClear').addEventListener('click',()=>{refBoxes.forEach(box=>{box.checked=false});updateRefProgress();});
updateRefProgress();
