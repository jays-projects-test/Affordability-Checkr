// Affordability Checkr tax engine, verified against GOV.UK, 9 November 2026.
// Annualised estimates for England, Wales and Northern Ireland only.
export const TAX_YEARS = {
  '2025/26': { allowance:12570, basicBand:37700, additionalStart:125140, niStart:12570, niUpper:50270, employeeNI:.08, class4NI:.06 },
  '2026/27': { allowance:12570, basicBand:37700, additionalStart:125140, niStart:12570, niUpper:50270, employeeNI:.08, class4NI:.06 }
};
export function safeNumber(value) { const n=Number(value); return Number.isFinite(n)?Math.max(0,n):0; }
export function calculateIncomeTax(amount, year='2026/27') {
  const rules=TAX_YEARS[year] || TAX_YEARS['2026/27'];
  const gross=safeNumber(amount);
  const allowance=Math.max(0,rules.allowance-Math.max(0,gross-100000)/2);
  const taxable=Math.max(0,gross-allowance);
  const basic=Math.min(taxable,rules.basicBand)*.20;
  const higher=Math.max(0,Math.min(taxable,rules.additionalStart)-rules.basicBand)*.40;
  const additional=Math.max(0,taxable-rules.additionalStart)*.45;
  return {gross,allowance,taxable,basic,higher,additional,total:basic+higher+additional};
}
export function calculateNI(gross,kind,year='2026/27') {
  const rules=TAX_YEARS[year] || TAX_YEARS['2026/27'];
  const rate=kind==='paye'?rules.employeeNI:kind==='self'?rules.class4NI:0;
  return kind==='other'?0:Math.max(0,Math.min(gross,rules.niUpper)-rules.niStart)*rate+Math.max(0,gross-rules.niUpper)*.02;
}
export function calculatePerson(person,year='2026/27') {
  const kind=person.type || 'paye';
  const gross=kind==='self'?Math.max(0,safeNumber(person.revenue)-safeNumber(person.expenses)):
    kind==='paye'&&person.payMode==='hourly'?safeNumber(person.hourly)*safeNumber(person.hours)*safeNumber(person.weeks):safeNumber(person.salary);
  const taxableOther=kind==='other' && person.otherTax!=='non-taxable';
  const income=taxableOther||kind!=='other'?calculateIncomeTax(gross,year):{gross,allowance:0,taxable:0,basic:0,higher:0,additional:0,total:0};
  const ni=calculateNI(gross,kind,year);
  const due=income.total+ni;
  return {gross,profit:gross,allowance:income.allowance,taxable:income.taxable,basic:income.basic,higher:income.higher,additional:income.additional,incomeTax:income.total,ni,totalTax:due,net:gross-due,kind,excluded:kind==='other'&&person.otherTax==='non-taxable'};
}
