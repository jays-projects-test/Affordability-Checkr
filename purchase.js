// Home buying scenarios: England only. Illustrations, not live mortgage offers or eligibility decisions.
const $=id=>document.getElementById(id);
const gbp=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const initial={route:'standard',price:350000,depositPct:10,rate:4.75,years:30,discount:30,share:40,shareRentRate:2.75,service:150,otherMonthly:200,location:'london',firstTime:true,lisaSavings:0};
let s={...initial};
try{const v=JSON.parse(localStorage.getItem('checkr-home-v1'));if(v&&typeof v==='object')s={...s,...v};}catch{}
const minmax=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0));
const repayment=(capital,apr,years)=>{if(capital<=0)return 0;const m=apr/1200,n=years*12;return m===0?capital/n:capital*m/(1-Math.pow(1+m,-n));};
function stampDuty(price,firstTime){
 const band=(a,b,r)=>Math.max(0,Math.min(price,b)-a)*r;
 if(firstTime&&price<=500000)return band(300000,500000,.05);
 return band(125000,250000,.02)+band(250000,925000,.05)+band(925000,1500000,.1)+Math.max(0,price-1500000)*.12;
}
function calc(){
 const market=s.price;const discount=s.route==='firsthomes'?s.discount/100:0;
 const effectivePrice=market*(1-discount);
 const sharePct=s.route==='shared'?s.share/100:1;
 const purchased=effectivePrice*sharePct;
 const minDeposit=s.route==='future'?2.5:5;
 const depositPct=Math.max(minDeposit,s.depositPct);
 const deposit=purchased*depositPct/100;
 const governmentEquity=s.route==='future'?market*.2:0;
 const mortgage=Math.max(0,purchased-deposit-governmentEquity);
 const monthly=repayment(mortgage,s.rate,s.years);
 const rent=s.route==='shared'?market*(1-sharePct)*(s.shareRentRate/100)/12:0;
 const service=s.service;const other=s.otherMonthly;
 const annualMortgageMultiple=4.5;
 const requiredIncome=mortgage/annualMortgageMultiple;
 const cashStamp=s.route==='shared'?null:stampDuty(effectivePrice,s.firstTime);
 const upfront=deposit+(cashStamp||0)+2500;
 return {market,effectivePrice,purchased,deposit,mortgage,monthly,rent,service,other,governmentEquity,requiredIncome,cashStamp,upfront,total:monthly+rent+service+other,interestTotal:monthly*s.years*12-mortgage};
}
function num(id,value,step=1000,min=0,max=10000000){return `<input class="purchase-input" type="number" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}" inputmode="decimal">`;}
function ctrl(label,id,value,min,max,step,suffix=''){return `<div class="purchase-control"><div class="purchase-control-heading"><label for="${id}">${label}</label><div class="pc-val">${num(id,value,step,min,max)}${suffix}</div></div><input type="range" id="${id}Slider" min="${min}" max="${max}" step="${step}" value="${Math.min(max,value)}" aria-label="${label}"><div class="purchase-scale"><span>${min}${suffix}</span><span>${max.toLocaleString('en-GB')}${suffix}</span></div></div>`;}
const schemes=[
 {id:'standard',title:'Standard mortgage',tag:'Everyone can explore',desc:'Buy the full property with your deposit and a mortgage. No government scheme needed.',more:'Illustrative borrowing uses 4.5× gross income, not a lending decision. 5–10% deposit mortgages may be available from lenders.',url:'https://www.gov.uk/buying-a-home'},
 {id:'guarantee',title:'5% deposit mortgage',tag:'Available · UK-wide',desc:'The Mortgage Guarantee Scheme supports participating lenders offering eligible 95% mortgages. You still repay the entire loan.',more:'The government guarantee protects the lender, not the buyer. It does not reduce your monthly payment or guarantee approval.',url:'https://www.gov.uk/government/publications/2025-mortgage-guarantee-scheme'},
 {id:'firsthomes',title:'First Homes discount',tag:'Available · England',desc:'Eligible first-time buyers purchase a specific First Homes property at 30–50% below market value.',more:'Combined income cap £90k in London / £80k elsewhere; discounted new-build price cap £420k London / £250k elsewhere. You must pass local rules. The same percentage discount applies when you resell.',url:'https://www.gov.uk/first-homes-scheme'},
 {id:'shared',title:'Shared Ownership',tag:'Available · England',desc:'Buy a share of a home (often 10–75%) and pay rent on the portion owned by a housing provider.',more:'Combined income cap £90k in London / £80k elsewhere, plus affordability rules. Rent, service charges and future rent increases matter. Stamp Duty is complex; get a solicitor quote.',url:'https://www.gov.uk/shared-ownership-scheme'},
 {id:'future',title:'Your First Home',tag:'Not open yet · England',desc:'New announced route with a 2.5% deposit and 20% government equity loan for qualifying new-build homes.',more:'Expected to open February 2027, subject to participating properties and eligibility. Equity loan interest-free for five years, but repayment depends on property value; future charges are not estimated here.',url:'https://www.gov.uk/government/publications/your-first-home'}
];
export function initPurchase(getHousehold){
 const routes=$('purchaseRoutes');
 routes.innerHTML=schemes.map(x=>`<button class="scheme-choice" type="button" data-scheme="${x.id}" aria-pressed="false"><span class="scheme-choice-top"><strong>${x.title}</strong><small>${x.tag}</small></span><span class="scheme-desc">${x.desc}</span><span class="scheme-action">Use this route →</span></button>`).join('');
 routes.addEventListener('click',e=>{const choice=e.target.closest('[data-scheme]');if(!choice)return;s.route=choice.dataset.scheme;s.depositPct=choice.dataset.scheme==='future'?2.5:choice.dataset.scheme==='guarantee'?5:10;save();renderPurchase(getHousehold());});
 $('purchaseControls').addEventListener('input',e=>{
  const el=e.target;if(!el.id)return;const id=el.id.replace(/Slider$/,'');
  const key={homePrice:'price',depositPct:'depositPct',mortgageRate:'rate',mortgageTerm:'years',firstHomeDiscount:'discount',ownershipShare:'share',shareRentRate:'shareRentRate',serviceCharge:'service',otherCost:'otherMonthly',lisaSavings:'lisaSavings'}[id];
  if(!key)return;
  s[key]=Number(el.value)||0;
  if(key==='depositPct')s[key]=Math.max(s.route==='future'?2.5:5,s[key]);
  if(el.type==='range'){$(id).value=s[key];}else{const range=$(id+'Slider');if(range)range.value=s[key];}
  save();renderResults(getHousehold());
 });
 $('purchaseControls').addEventListener('change',()=>renderPurchase(getHousehold()));
 $('purchaseLocation').addEventListener('change',e=>{s.location=e.target.value;save();renderPurchase(getHousehold());});
 $('purchaseFtb').addEventListener('change',e=>{s.firstTime=e.target.checked;save();renderPurchase(getHousehold());});
 $('purchaseRates').addEventListener('input',e=>{if(e.target.id==='lenderRate'){s.rate=minmax(e.target.value,0,20);$('mortgageRate').value=s.rate;$('mortgageRateSlider').value=s.rate;save();renderResults(getHousehold());}});
 $('purchaseRates').addEventListener('change',()=>renderPurchase(getHousehold()));
 renderPurchase(getHousehold());
}
function save(){try{localStorage.setItem('checkr-home-v1',JSON.stringify(s));}catch{}}
function renderPurchase(t){
 document.querySelectorAll('[data-scheme]').forEach(b=>{const selected=b.dataset.scheme===s.route;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 const selected=schemes.find(x=>x.id===s.route);
 $('purchaseChosen').innerHTML=`<div><div class="eyebrow">YOUR SELECTED ROUTE</div><h3>${selected.title}</h3><p>${selected.more}</p></div><a href="${selected.url}" target="_blank" rel="noopener noreferrer">Official rules ↗</a>`;
 $('purchaseLocation').value=s.location;
 $('purchaseFtb').checked=s.firstTime;
 const controls=[ctrl('Property market value','homePrice',s.price,100000,1000000,5000,'£'),ctrl('Deposit (% of what you buy)','depositPct',Math.max(s.route==='future'?2.5:5,s.depositPct),s.route==='future'?2.5:5,50,.5,'%'),ctrl('Illustrative annual interest rate','mortgageRate',s.rate,1,12,.05,'%'),ctrl('Mortgage term (years)','mortgageTerm',s.years,5,40,1,' years')];
 if(s.route==='firsthomes')controls.push(ctrl('Discount off market price','firstHomeDiscount',s.discount,30,50,5,'%'));
 if(s.route==='shared'){controls.push(ctrl('Share you buy','ownershipShare',s.share,10,75,5,'%'));controls.push(ctrl('Yearly rent rate on unsold share','shareRentRate',s.shareRentRate,0,3,.05,'%'));}
 controls.push(ctrl('Monthly service / maintenance allowance','serviceCharge',s.service,0,1000,10,'£'));
 controls.push(ctrl('Other monthly ownership costs','otherCost',s.otherMonthly,0,1000,10,'£'));
 $('purchaseControls').innerHTML=controls.join('');
 $('lenderRate').value=s.rate;
 renderResults(t);
}
function renderResults(t){
 const c=calc();const income=t.gross;const feasible=income>=c.requiredIncome;
 $('purchaseResults').innerHTML=`
 <div class="purchase-kpis"><div><small>Your estimated mortgage</small><strong>${gbp(c.mortgage)}</strong></div><div><small>Illustrative monthly mortgage</small><strong>${gbp(c.monthly)}</strong></div><div><small>All-in monthly cost estimate</small><strong>${gbp(c.total)}</strong></div></div>
 <div class="purchase-summary-list">
 <div><span>Full market value</span><b>${gbp(c.market)}</b></div>
 ${s.route==='firsthomes'?`<div><span>Price after ${s.discount}% discount</span><b>${gbp(c.effectivePrice)}</b></div>`:''}
 ${s.route==='shared'?`<div><span>Price of your ${s.share}% share</span><b>${gbp(c.purchased)}</b></div>`:''}
 <div><span>Cash deposit needed</span><b>${gbp(c.deposit)}</b></div>
 ${s.route==='future'?`<div><span>Government equity loan (20% of value)</span><b>${gbp(c.governmentEquity)}</b></div><div><span>Monthly equity loan interest, years 1–5</span><b>£0</b></div><div><span>Indicative monthly equity interest, year 6</span><b>${gbp(c.governmentEquity*.015/12)}</b></div><div><span>Indicative monthly equity interest, year 7 onward</span><b>${gbp(c.governmentEquity*.03/12)}</b></div>`:''}
 <div><span>Monthly mortgage repayment</span><b>${gbp(c.monthly)}</b></div>
 ${s.route==='shared'?`<div><span>Monthly rent on remaining share</span><b>${gbp(c.rent)}</b></div>`:''}
 <div><span>Monthly service / maintenance allowance</span><b>${gbp(c.service)}</b></div>
 <div><span>Other monthly costs</span><b>${gbp(c.other)}</b></div>
 <div class="purchase-strong"><span>Monthly total to budget for</span><b>${gbp(c.total)}</b></div>
 <div><span>Deposit + assumed £2,500 buying costs${c.cashStamp===null?' (SDLT excluded)':''}</span><b>${gbp(c.upfront)}</b></div>
 ${c.cashStamp===null?`<div><span>Stamp Duty on shared ownership</span><b>Solicitor quote required</b></div>`:`<div><span>Estimated Stamp Duty (England)</span><b>${gbp(c.cashStamp)}</b></div>`}
 <div><span>Total interest over mortgage term, if rate stays unchanged</span><b>${gbp(c.interestTotal)}</b></div>
 </div>
 <div class="mortgage-afford ${feasible?'mortgage-afford-ok':'mortgage-afford-warn'}"><div class="result-top"><b>${feasible?'Indicative income threshold met':'Indicative income below threshold'}</b><span>${feasible?'✓':'!'}</span></div><p>Your selected applicants earn <b>${gbp(income)} per year</b> before personal tax. A simple 4.5× borrowing illustration suggests <b>${gbp(c.requiredIncome)} annual income</b> for this mortgage. This is NOT a bank decision: debts, childcare, credit history, outgoings, employment type, income evidence and lender stress tests all matter.</p></div>
 ${eligibilityMessage(t,c)}
 `;
 $('rateScenarioText').textContent=`At ${s.rate.toFixed(2)}% over ${s.years} years: ${gbp(c.monthly)}/month mortgage payment. Rates below are sensitivity examples, not verified live lender offers.`;
 const points=[Math.max(0,s.rate-1),s.rate,s.rate+1];
 $('rateSensitivity').innerHTML=points.map(rate=>`<div><span>${rate.toFixed(2)}% interest</span><b>${gbp(repayment(c.mortgage,rate,s.years))}/mo</b></div>`).join('');
}
function eligibilityMessage(t,c){
 const limit=s.location==='london'?90000:80000;
 let msgs=[];
 if(s.route==='firsthomes'||s.route==='shared'){
  msgs.push(t.gross>limit?`<b>Income caution:</b> your estimated combined annual income of ${gbp(t.gross)} is above the usual ${gbp(limit)} scheme cap.`:`<b>Income screen:</b> your estimated combined income is within the ${gbp(limit)} scheme cap, but you still need the property, local and full eligibility checks.`);
 }
 if(s.route==='firsthomes'){
  const priceCap=s.location==='london'?420000:250000;
  if(!s.firstTime)msgs.push('<b>First-time buyer requirement:</b> all purchasers need to qualify as first-time buyers.');
  if(c.effectivePrice>priceCap)msgs.push(`<b>Property cap:</b> this price exceeds the ${gbp(priceCap)} ceiling for a new-build First Homes property in your selected area.`);
  if(c.mortgage<c.effectivePrice*.5)msgs.push('<b>Mortgage requirement:</b> First Homes requires a mortgage funding at least 50% of the discounted price.');
 }
 if(s.route==='shared')msgs.push('<b>Shared ownership:</b> housing associations assess affordability including rent, service charges and household spending. A simple income multiplier alone is not enough.');
 if(s.route==='future'){
  const cap=s.location==='london'?140000:110000;
  msgs.push(`<b>Not available to apply for yet:</b> Your First Home is expected to open February 2027. The published household income ceiling is ${gbp(cap)} for your selected area. ${t.gross>cap?'Your current income estimate is above that ceiling.':'Your income appears within that ceiling, but other conditions apply.'} Local property price caps and lender checks also apply.`);
  msgs.push(`<b>Equity loan payments:</b> published rates are 0% for years 1–5, 1.5% in year 6 (about ${gbp(c.governmentEquity*.015/12)}/mo), and 3% from year 7 (about ${gbp(c.governmentEquity*.03/12)}/mo), based on the original loan amount. These are separate from mortgage repayments and do not repay the equity loan principal. The amount owed when repaid tracks 20% of the home's then value.`);
  if(!s.firstTime)msgs.push('<b>First-time buyer requirement:</b> this scheme is designed for eligible first-time buyers.');
 }
 if(s.route==='guarantee')msgs.push('<b>5% mortgages:</b> the lender still carries out full affordability checks. The government does not pay part of your deposit or mortgage.');
 if(s.location!=='england'&&s.location!=='london')msgs.push('<b>Location:</b> this purchase calculator and Stamp Duty estimate are for England only. Scotland, Wales and Northern Ireland use different taxes and some different schemes.');
 if(!s.firstTime)msgs.push('<b>First-time status:</b> first-time Stamp Duty relief and some schemes may not be available if any purchaser has owned residential property anywhere in the world.');
 return msgs.length?`<div class="purchase-cautions">${msgs.map(x=>`<p>${x}</p>`).join('')}</div>`:'';
}
export function updatePurchase(t){if($('purchaseResults'))renderResults(t);}
