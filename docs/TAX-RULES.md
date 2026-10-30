# Rules and evidence

Checked: 2026-10-03. Version: `2568-expanded-2.0` / `2569-expanded-2.0`.

Scope: Thai employment salary/bonus (40(1)), individual case using the supported eligibility-confirmed allowances below. This is an estimate, not submission of a tax return. Zero tax does not establish that no filing is required. Tax is stored/calculated in integer satang, rounding the aggregate tax to satang for estimates.

## Standing rules used for both years

Statement-import engineering update (2026-10-30): importing a deposit or expense into the ledger does not establish taxable gross salary or legal deduction eligibility. No rule amounts, calculation functions or tax inputs are changed by import. This note does not represent a new legal-rule review.

| Rule | Official evidence | Application |
|---|---|---|
| Salary/bonus; expenses 50%, jointly capped at 100,000 baht | [Revenue Code 40(1), 42 bis](https://www.rd.go.th/5937.html) | One combined salary+bonus income; ledger expenses are not substituted |
| Personal deduction 60,000 baht | [Revenue Code 47(1)(a)](https://www.rd.go.th/5937.html) | Automatic standard personal deduction |
| Own life insurance, aggregate eligible amount 100,000 baht | [47(1)(d)](https://www.rd.go.th/5937.html) and [Ministerial Regulation 126, 2(61)](https://www.rd.go.th/2502.html) | 10,000 deduction plus up to 90,000 exemption. Eligible premiums, Thai insurer, minimum 10-year policy and applicable refund criteria; user confirmation required |
| Own health insurance 25,000 baht, shared life/health ceiling 100,000 baht | [Regulation 126, 2(97), amended by 365 effective 2020 onward](https://www.rd.go.th/2502.html), [RD criteria and consent guidance](https://www.rd.go.th/62777.html) | Life uses the shared ceiling first; eligible own health, evidence and insurer consent confirmation |
| RMF 30% of taxable assessable income, at most 500,000 baht | [Regulation 126, 2(55), amended by 357 effective 2020 onward](https://www.rd.go.th/2502.html) | Integer-satang percentage ceiling using assessable income after PVD/GPF exemptions; shared 500,000 cap with supported employee PVD/GPF amounts |
| RMF holding/age and continued-purchase criteria | [Regulation 126](https://www.rd.go.th/2502.html), [RD guidance](https://www.rd.go.th/62777.html), [2568 PND91 manual, item 10](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Confirmation required; 5 years from first purchase, redemption age 55, continued purchases under criteria; exceptions/transfer cases excluded |
| Eight progressive bands | [RD calculation method](https://www.rd.go.th/555.html), [2568 manual, table 1](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Net 0–150k exempt; up to 300k 5%; 500k 10%; 750k 15%; 1m 20%; 2m 25%; 5m 30%; remainder 35% |
| Deduct actual employee SSO payments | [Code 47(1)(j)](https://www.rd.go.th/5937.html), [RD evidence guidance](https://www.rd.go.th/60061.html) | Actual input, capped at normal annual bound for the selected year; never inferred from salary |

## Year-specific SSO

| Year | Income period | Normal M33 maximum | Evidence |
|---|---|---|---|
| 2568 | 2025-01-01–2025-12-31 | 9,000 baht (750 × 12) | [RD 2568 deduction summary](https://rd.go.th/fileadmin/user_upload/lorkhor/newsbanner/2025/12/PR1161_12122568.pdf), [manual page 9](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) |
| 2569 | 2026-01-01–2026-12-31 | 10,500 baht (875 × 12) | [Gazette volume 142 part 81a, 12 Dec 2025, pp.5–6](https://ratchakitcha.soc.go.th/documents/98728.pdf) effective 1 Jan 2026: M33 wage ceiling 17,500 for 2026–2028; [government PR explanation of 875/month](https://songkhla.prd.go.th/th/content/category/detail/id/33/iid/477946) |

10,500 is a normal full-year upper bound, derived as 875 × 12. Use actual employee payments from evidence; partial-year employment and temporary contribution relief may reduce the paid amount. This app does not assume every user pays the maximum or calculate each month's SSO entitlement.

The 2569 option is basic annual planning using the current standing statutes above. It does not copy temporary 2568 programs into 2569 and does not claim that all final 2569 filing rules have been published. Recheck official rules before actual filing or extending supported deductions.

## Independent fixtures

- 2568: salary 600,000 + bonus 60,000 − expenses 100,000 − deductions (60,000 + SSO 9,000 + life 20,000 + health 15,000 + RMF 30,000) = net 426,000. Tax = 150,000 × 5% + 126,000 × 10% = **20,100 baht**. Withheld 32,000 gives an estimated refund of **11,900 baht**.
- 2569: identical inputs with actual SSO 10,500 give net 424,500. Tax = 7,500 + 124,500 × 10% = **19,950 baht**. Withheld 32,000 gives **12,050 baht** estimated refund. Entering SSO 5,000 uses 5,000 rather than assuming 10,500.

## Additional standing allowances implemented

| Rule | Official evidence | Application |
|---|---|---|
| Spouse 60,000; biological child 30,000; eligible second and later children born from 2018 additional 30,000 | [Code 47(1)(b)/(c)](https://www.rd.go.th/5937.html), [2568 PND91 manual items 2–3](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Registered spouse with no income; individual filing. Biological child bonus uses legal birth order including deceased children. Child is minor, or <=25 in higher education, or court-declared incompetent/quasi-incompetent, supported and non-exempt assessable income <30,000. Eligible adoptees 30,000 each, limited to remaining slots in 3 after all living biological children, not just eligible ones. Counts and eligibility confirmed by user |
| Parents 30,000 each | [Code 47(1)(ญ)](https://www.rd.go.th/5937.html), [manual item 6](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Up to own 2 and spouse 2 when spouse has no income; >=60, income <=30,000, supported, no sibling duplicate claim, Ly03 confirmation |
| Home interest up to 100,000 | [Code 47(1)(ซ)](https://www.rd.go.th/5937.html), [Regulation 126, 2(53)](https://www.rd.go.th/2502.html), [manual item 5](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Eligible borrower/lender/security/evidence. User enters own allocated share after joint-borrower allocation; not principal or full monthly instalment |
| PVD first 10,000 deduction; eligible excess up to 490,000 exemption before expenses; legal contribution rate <=15% wage | [Code 47(1)(จ)](https://www.rd.go.th/5937.html), [Regulation 126, 2(35)](https://www.rd.go.th/2502.html), [manual income-exemption item 1 and deduction item 8](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Employee contribution only, separate user-supplied wage base. Cap entered total at 15% base/500,000, split first 10,000 after expenses and remaining exempt before expense calculation. Employer contributions, withdrawals, exceptional/transfer cases excluded |
| GPF employee contribution up to 500,000, exemption before expenses | [Regulation 126, 2(43)](https://www.rd.go.th/2502.html), [manual income-exemption item 2](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Employee eligible amount from certificate; not state match/compensation. PVD then GPF allocated within shared retirement ceiling; RMF gets remaining room. Do not infer contributions from wages |
| Thai ESG new purchases 2024–2026: 30% assessable income, max 300,000, hold 5 years day-to-day | [Regulation 126, 2(105)/(106), amended 398](https://www.rd.go.th/2502.html) | Purchases in selected 2568/2569, certificate/consent confirmation; separate from retirement cap. Thai ESGX, transferred LTF and special shared purchase measures excluded |
| SSF new-purchase eligibility 2020–2024 | [Regulation 126, 2(102)](https://www.rd.go.th/2502.html) | Educational only for 2568/2569; no new purchase deduction. Previously claimed units retain holding obligations |
| Direct government-hospital donations 2x up to 10% remaining income before donations | [RD ruling / Decree 663](https://www.rd.go.th/26594.html), [RD hospital vs hospital foundation ruling](https://rd.go.th/26607.html), [manual page 2 computation order](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Actual paid amount doubled then capped. Hospital foundations are not assigned this direct-hospital 2x right. Other 2x rights excluded |
| General eligible donations 1x up to 10% remaining after supported 2x donations | [Code 47(7)](https://www.rd.go.th/5937.html), [manual](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf) | Eligible recipient and evidence confirmation. Political donations/other special programs excluded; never enter same donation twice |
| From 1 Jan 2026, relevant temple/public-charity donations require e-Donation | [RD official law notice](https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/e-do_1-1-69.pdf) | 2569 ordinary-donation confirmation names the recipients subject to this requirement; do not generalise this requirement to every category |

Retirement exemption is subtracted before computing salary expenses and percentage-based fund limits. Combined deduction display includes these exemptions once; the detailed computation separates them before expenses. Family totals show confirmed count-based rights. Hospital donation input display is paid amount, allowed column is doubled/capped amount.

## Additional independent fixtures

- 900,000 salary, expenses 100,000, personal 60,000, spouse 60,000, 2 biological children + 1 eligible adoptee + 1 birth-order bonus = 120,000, parents 90,000, home interest capped 100,000: net **370,000**, tax **14,500** (7,500 + 7,000).
- Salary/wage 180,000; employee PVD 27,000. Exempt 17,000 before expenses, assessable 163,000, expense 81,500, personal 60,000 and PVD first 10,000: net **11,500**. GPF 20,000 instead: assessable 160,000, expense 80,000, personal 60,000, net **20,000**.
- Salary 2,000,000; PVD 200,000, GPF 100,000, RMF submitted 500,000 (allowed 200,000), Thai ESG submitted 500,000 (allowed 300,000): expenses 100,000, personal 60,000, net **1,040,000**, tax **125,000**.
- 900,000 salary without other extra deductions: pre-donation net 740,000. Hospital donation 40,000 doubles to 80,000 but allowed 74,000; general donation 100,000 allowed 66,600 (10% of 666,000). Final net **599,400**, tax **42,410**.

No new legal right is inferred for SSF or unsupported income/temporary programs. See `src/scope.ts` for the single application scope source. These source extracts were checked on 2026-10-03; recheck before expanding to other cases or later years.
