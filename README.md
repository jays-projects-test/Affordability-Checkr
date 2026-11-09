# Affordability Checkr — v7.0

A complete, static, mobile-friendly website for GitHub Pages. No account, tracking, servers, API keys, package manager, build step or database are required.

## Deployment

1. Upload `index.html`, `styles.css`, `app.js`, `rules.js`, and `.nojekyll` to the **root** of a GitHub repository (not a subfolder).
2. Commit them to `main`.
3. In **Settings → Pages**, choose `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Your Pages URL will be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
5. Hard-refresh the page if an older version is cached.

## Privacy and data

This is a **static website**. There is no remote database because users don't sign in or share data. Inputs and referencing checklist progress are saved via browser `localStorage` with the key `checkr-v7`. Reset clears the values to zero. PDF reports are generated locally via your browser's built-in print dialog; select **Save as PDF**.

## Functions

- Renting overview: 1–5 PAYE, self-employed or other-income applicants, gross/turnover and expenses, editable rent and income multiple.
- Buying: input directly or use renting household, savings, emergency reserve, debt, property price, deposit, mortgage term, repayment rate and editable purchase fees. Estimates are bounded by both borrowing limits and deposit/cash costs. Standard, 5% deposit, First Homes and Shared Ownership comparison routes.
- England Stamp Duty for qualifying first-time buyers or the standard rate when the purchase price is over £500,000. Shared Ownership SDLT deliberately excluded because share election and transaction rules are complex.
- 2025/26 and 2026/27 UK Income Tax (England/Wales/NI) and NI calculations. Wales currently uses same main rates; Scotland is not modelled.
- Referencing checklist, accessible beginner tour, professional browser-generated A4 PDF reports for renting and buying.

## Important boundaries

- Maximum mortgage uses the lower of: (a) adjusted income × an editable multiple; and (b) a simplified monthly affordability cap (35% of annual estimated net pay / 12 less declared monthly debts and service charge). Debt is also deducted from gross income for the borrowing-multiple illustration; this is a scenario assumption, not how every lender underwrites applications. Actual lenders use different rules.
- When no income or savings are entered, purchase budget remains zero.
- The loan / cash projection uses the **chosen deposit percentage**. The displayed maximum property price is the largest price that fits the selected deposit fraction, all editable cash costs, illustrative mortgage cap and monthly payment assumptions.
- The additional Shared Ownership rent is estimated at an editable percent of the unsold share (most new builds around 2.75%); service charges vary.
- Cash needed excludes recurring expenses like insurance, utilities and council tax. Shared Ownership SDLT is not included; obtain a solicitor estimate.
- Estimates do not constitute mortgage advice, tax advice, legal advice, lender approval or agency referencing approval.
- No live lender rates, no bank API, no automated tax-rule updates. Review `rules.js` after tax changes and update site copy.

## Sources (verified 9 November 2026)

- https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
- https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
- https://www.gov.uk/stamp-duty-land-tax/residential-property-rates
- https://www.gov.uk/first-homes-scheme
- https://www.gov.uk/shared-ownership-scheme
- https://www.gov.uk/shared-ownership-scheme/paying-rent
- https://www.moneyhelper.org.uk/en/homes/buying-a-home/estimate-your-overall-buying-and-moving-costs

Initial personal financial inputs **and editable buying-fee allowances** are zero. Click **Add suggested buying costs** to fill illustrative fees, then adjust to match actual quotes. Interest rate, term, deposit percentage, and income multiple are labelled modelling assumptions rather than personal funds.
