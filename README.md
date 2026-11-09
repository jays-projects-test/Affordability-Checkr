# Affordability Checkr

A responsive, free UK rental affordability, tax and first-time home buying dashboard. No user account, API key, database or build process required.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository called `affordability-checkr`.
2. Upload `index.html`, `style.css`, `app.js`, `tax.js`, `purchase.js` and `README.md` to the **root** of the repository.
3. Open your repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**. Select `main` and `/ (root)`, then **Save**.
5. Once GitHub finishes deploying, your website is at `https://YOUR-USERNAME.github.io/affordability-checkr/`.

For a custom domain, configure it in **Settings → Pages → Custom domain** and follow GitHub's DNS instructions.

To run locally, use any static web server because the JavaScript uses ES modules. For example, from the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How the calculations work

- Supports up to **five separate applicants**: PAYE salary/hourly, self-employed (turnover minus expenses), or other income.
- Tax years **2025/26** and **2026/27**. Applies England, Wales and Northern Ireland non-savings Income Tax bands, standard Personal Allowance and taper, employee Class 1 and self-employed Class 4 NI.
- Includes an interactive **tax scenario editor** on the Tax breakdown tab, as well as income sliders on the Overview tab.
- Annualised estimates: actual PAYE NI can differ where earnings fluctuate between payroll periods; assumes standard NI category A and ordinary tax code.
- Rent affordability compares annual assessable income against **30×**, **36×** or **40×** the monthly rent. Acceptance of other income, variable hours and joint applications depends on the referencing provider.
- Data is stored **only in browser localStorage**, to retain a draft after page refresh. No accounts, backend, tracking or transmitted income data. Use Reset to clear this stored draft. Do not use on shared devices if privacy matters.

### Limits

The site is an illustrative estimator, not a filing system or guarantee of rental approval. It does **not** include Scottish Income Tax, dividends/savings-specific tax rates, student loans, pension relief, benefits-specific rules, multiple jobs or overlapping PAYE/self-employment for one person, marriage allowance, payments on account, VAT, losses or exact per-pay-period National Insurance. 'Other' income is simplified and may be subject to different rates or reliefs. Do not enter multiple types of taxable earnings for one individual as separate applicants: that incorrectly doubles their Personal Allowance. Do not use this app as a substitute for an accountant or HMRC.

### Official sources (rates reviewed 9 November 2026)

- [HMRC Income Tax rates and allowances](https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past)
- [HMRC National Insurance rates and allowances](https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions)
- [Self-employed NI](https://www.gov.uk/self-employed-national-insurance-rates)

For each future tax year, recheck these HMRC sources and update `TAX_YEARS` in `tax.js` before claiming the new rates are supported.


## Tenant referencing checklist (added November 2026)

The **Referencing checklist** tab gives first-time renters in **England** a plain-English breakdown of common, PAYE and self-employed checks, parties responsible, and statutory tenant protections. A progress checklist is saved locally in the browser. It does not ask users to upload documents. Official references are linked within the tab. The legal guidance is focused on England because Right to Rent and tenancy rules differ in Scotland, Wales and Northern Ireland.


## Buying a Home (England)

The purchase tab models standard repayment mortgages, a 5% deposit scenario through the Mortgage Guarantee Scheme, First Homes property discounts, Shared Ownership mortgage plus rent, and the *Your First Home* scheme (not accepting applications as of November 2026, expected February 2027).

The tab includes adjustable house price, deposit, interest rate, mortgage length, property discount, shared ownership percentage, service charges and other ownership costs. It uses the existing household income for a simple illustrative 4.5× income borrowing test. This is **not** an offer, lender affordability decision or current lender quote. Shared ownership Stamp Duty requires legal advice and is deliberately omitted from its up-front estimate. 'Your First Home' shows published equity loan interest rates after five years but excludes future property value effects and possible fees. Rates are user-entered illustrative values, **not live offers from the linked banks**.

The 2026 rules and programme sources are linked directly inside the app from GOV.UK, plus London City Hall. Stamp Duty estimates are for qualifying **England** transactions, not Scotland/Wales/Northern Ireland and exclude nonresident surcharges and higher rates. If any purchase is complex, obtain a solicitor's calculation.

Data remains local to the user's browser; the site does not request uploads of sensitive financial documents.

## First-visit tour (v5)

The welcome popup appears automatically on the first visit to a browser. It briefly introduces applicant income, renting and referencing, and buying a home (including a tip to swipe the navigation tabs sideways on mobile). Visitors may skip, move backwards/forwards, or reopen it with **? Take the tour** in the header. The completion flag lives only in that browser's `localStorage`; no login or data transfer is involved. `tour.js` is required at the repository root.
