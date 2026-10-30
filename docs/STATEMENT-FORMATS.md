# Statement format coverage — 2026-10-30

The owner has no anonymised exports to supply. This release validates **generic explicit-column formats**, not seven bank-specific retail exports. A bank name or instructions showing an export button are not evidence that a parser accepts that exported file. No real customer statement is committed or uploaded.

| Format | Verified with synthetic fixtures | Boundary |
|---|---|---|
| CSV | UTF-8/UTF-16/Windows-874, comma/semicolon/tab, quoted cells, four-digit Buddhist/AD dates, explicit debit/credit or signed/type mapping | Unknown headers need manual mapping; balance is never an amount source |
| XLSX | Existing reader, multiple sheet selection, date cells and exact decimal strings | No .xls, encryption, macro execution or formula evaluation |
| Text-layer PDF | Two pages, explicit Date/Description/Credit/Debit/Balance columns, repeated headers and wrapped descriptions; offline real-worker extraction | No scan OCR, protected PDFs, two-digit-year inference or unrecognised layouts; columns must reconstruct unambiguously |

| Bank target | Observed evidence | Adapter/certification status |
|---|---|---|
| KBank | Official public statement sample and export instructions below | Pending variant fixtures; the sample's combined amounts/two-digit dates are not accepted by the generic reader |
| SCB | Official SCB EASY statement-request guide | Pending layout evidence/variant fixtures |
| Krungthai | No usable layout fixture obtained | Pending |
| Krungsri | No usable layout fixture obtained | Pending |
| TTB | No usable layout fixture obtained | Pending |
| GSB | No usable layout fixture obtained | Pending |
| Bangkok Bank | No usable layout fixture obtained | Pending |

Primary evidence inspected 2026-10-30:
- [KBank public sample](https://www.kasikornbank.com/SiteCollectionDocuments/News/statement/document/Information-Statement-02.pdf) — observed via the official public document, not vendored as personal data or treated as a supported parser fixture.
- [KBank K PLUS statement instructions](https://www.kasikornbank.com/th/kplus/instruction/statement).
- [SCB EASY statement-request guide](https://www.scb.co.th/th/personal-banking/digital-banking/scb-easy/how-to/request-statement).

Admitting a variant requires a privacy-cleared or authoritative layout sample, a synthetic fixture retaining its column/row conventions, direction/amount/date/source-origin tests and an end-to-end import check. Until then users may try the generic mapper, but the product must not label that bank supported. OCR/document salary prefill, automatic categorisation, deduction claims and sync remain outside this slice.
