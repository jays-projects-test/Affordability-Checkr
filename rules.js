/* Reviewed 09 Nov 2026. Edit these versioned constants when legislation changes. */
export const RULES = {
  '2025/26': {personalAllowance:12570,taperStart:100000,basicBand:37700,additionalThreshold:125140,niLower:12570,niUpper:50270,payeNI:.08,class4NI:.06},
  '2026/27': {personalAllowance:12570,taperStart:100000,basicBand:37700,additionalThreshold:125140,niLower:12570,niUpper:50270,payeNI:.08,class4NI:.06}
};
export const REFERENCES = {
  tax:'https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past',
  ni:'https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions',
  stamp:'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
  firstHomes:'https://www.gov.uk/first-homes-scheme',
  shared:'https://www.gov.uk/shared-ownership-scheme',
  costs:'https://www.moneyhelper.org.uk/en/homes/buying-a-home/estimate-your-overall-buying-and-moving-costs',
  mortgage:'https://www.moneyhelper.org.uk/en/homes/buying-a-home/mortgage-affordability-calculator',
  rent:'https://www.gov.uk/private-renting',
  right:'https://www.gov.uk/check-tenant-right-to-rent-documents',
  fees:'https://www.gov.uk/government/collections/tenant-fees-act',
  lifetime:'https://www.gov.uk/lifetime-isa'
};
export const num=(x)=>Math.max(0,Number.isFinite(Number(x))?Number(x):0);
export const gbp=(x,dp=0)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:dp,maximumFractionDigits:dp}).format(Number(x)||0);
export function taxOf(amount,year='2026/27'){
  const r=RULES[year]||RULES['2026/27'];const gross=num(amount);
  const allowance=Math.max(0,r.personalAllowance-Math.max(0,gross-r.taperStart)/2);
  const taxable=Math.max(0,gross-allowance);
  const basic=Math.min(taxable,r.basicBand)*.2;
  const higher=Math.max(0,Math.min(taxable,r.additionalThreshold)-r.basicBand)*.4;
  const additional=Math.max(0,taxable-r.additionalThreshold)*.45;
  return {allowance,taxable,basic,higher,additional,incomeTax:basic+higher+additional};
}
export function personCalc(p,year='2026/27'){
  const gross=p.type==='self'?Math.max(0,num(p.revenue)-num(p.expenses)):p.type==='paye'&&p.mode==='hourly'?num(p.rate)*num(p.hours)*num(p.weeks):num(p.salary);
  const t=p.type==='other'&&p.otherTreatment==='untaxed'?{allowance:0,taxable:0,basic:0,higher:0,additional:0,incomeTax:0}:taxOf(gross,year);
  const r=RULES[year];const niRate=p.type==='self'?r.class4NI:p.type==='paye'?r.payeNI:0;
  const ni=Math.max(0,Math.min(gross,r.niUpper)-r.niLower)*niRate+(p.type==='other'?0:Math.max(0,gross-r.niUpper)*.02);
  return {...t,gross,ni,totalTax:t.incomeTax+ni,net:gross-t.incomeTax-ni};
}
export function stampDutyEngland(price,firstTime=true){
  price=num(price);if(firstTime&&price<=500000){return Math.max(0,price-300000)*.05;}
  const tiers=[[125000,0],[250000,.02],[925000,.05],[1500000,.10],[Infinity,.12]];
  let last=0,total=0;for(const [end,rate] of tiers){total+=Math.max(0,Math.min(price,end)-last)*rate;last=end;if(price<=end)break;}return total;
}
export function mortgagePayment(principal,annualRate,years){
  const p=num(principal),n=Math.max(1,num(years)*12),r=num(annualRate)/1200;
  return !p?0:!r?p/n:p*r/(1-Math.pow(1+r,-n));
}
export function mortgagePrincipal(monthlyPayment,annualRate,years){
  const m=num(monthlyPayment),n=Math.max(1,num(years)*12),r=num(annualRate)/1200;
  return !m?0:!r?m*n:m*(1-Math.pow(1+r,-n))/r;
}
export function purchaseCosts(price,c={}){
  const sdlt=c.shared?0:stampDutyEngland(price,c.firstTime!==false);
  // Shared ownership SDLT is deliberately excluded: election and tranche rules vary.
  const legal=num(c.legal),survey=num(c.survey),mortgageFee=num(c.mortgageFee),moving=num(c.moving),misc=num(c.misc);
  return {sdlt,legal,survey,mortgageFee,moving,misc,total:sdlt+legal+survey+mortgageFee+moving+misc};
}
export function buyerCalc(b,income,netAnnual){
  const householdIncome=num(income),savings=num(b.savings),reserve=num(b.reserve),debt=num(b.debt),rate=num(b.rate),term=Math.max(1,num(b.term)||30);
  const route=b.route||'standard',share=route==='shared'?num(b.share)/100:1;
  const discount=route==='firsthomes'?num(b.discount)/100:0;
  const depositPct=route==='five'?5:Math.max(5,Math.min(95,num(b.depositPct)));
  const cash=Math.max(0,savings-reserve);
  const adjustedIncome=Math.max(0,householdIncome-debt*12);
  const multipleCap=adjustedIncome*num(b.multiple);
  const housingBudget=Math.max(0,(num(netAnnual)/12)*.35-debt-num(b.service));
  const paymentCap=mortgagePrincipal(housingBudget,rate,term);
  const loanCap=Math.min(multipleCap,paymentCap);
  const costsFor=(marketPrice)=>purchaseCosts(marketPrice*(1-discount)*(share||1),{...b,shared:route==='shared'});
  function calcAt(marketPrice){
    const paidPrice=marketPrice*(1-discount)*share;
    const deposit=paidPrice*depositPct/100;
    const loan=Math.max(0,paidPrice-deposit);
    const costs=costsFor(marketPrice);
    const monthlyMortgage=mortgagePayment(loan,rate,term);
    const unsoldRent=route==='shared'?marketPrice*(1-share)*num(b.unsoldRent)/100/12:0;
    const monthly=monthlyMortgage+unsoldRent+num(b.service);
    return {marketPrice,paidPrice,deposit,loan,costs,upfront:deposit+costs.total,monthlyMortgage,unsoldRent,monthly,shortfall:Math.max(0,deposit+costs.total-cash),remaining:cash-deposit-costs.total,depositPct};
  }
  // Separate lender-like cap and hard cash requirements; no false approval at zero income.
  const feasible=p=>{const x=calcAt(p);return x.upfront<=cash+1e-6&&x.loan<=loanCap+1e-6&&x.monthly<=housingBudget+num(b.service)+1e-6&&x.paidPrice>0};
  let lo=0,hi=5000000;for(let i=0;i<65;i++){const mid=(lo+hi)/2;if(feasible(mid))lo=mid;else hi=mid;}
  let maxMarket=lo;
  // Binary search assumes feasibility monotone; zero-income/cash cases return zero.
  if(!householdIncome||!cash||!loanCap)maxMarket=0;
  const example=calcAt(maxMarket),target=calcAt(num(b.target));
  return {householdIncome,cash,adjustedIncome,multipleCap,paymentCap,loanCap,housingBudget,maxMarket,example,target,route,term,rate,depositPct,share,discount,affordableTarget:!!b.target&&feasible(num(b.target))};
}
