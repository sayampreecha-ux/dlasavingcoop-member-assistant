# Signed primary-source check — 24 Oct 2026 — PR #166

## Document verification performed in this release review
Official website directory pages:
- Ordinary loan: https://www.dlasavingcoop.com/show.php?No=774
- Emergency loan: https://www.dlasavingcoop.com/show.php?No=773
- Special debt consolidation: https://www.dlasavingcoop.com/show.php?No=2385

Three signed 2569 PDFs were downloaded from the above official indexes through their published Google Drive links and visually read page-by-page, because the PDFs are scanned images without extractable text:

1. Ordinary loan 2569 — https://drive.google.com/file/d/1QQo5gux4sB3xdcbFvxYBeV-D30gOkXnV/view — 4 pages. Page 1 §2 effective 1 October 2026, repeals 2567 and 2568 criteria; page 2 §5(1–3) up to 200,000 requires 6 monthly shares, 200,001–500,000 requires 12 months and 10% shares, 500,001–2,000,000 requires 12 months and 10% shares; page 3 §6 guarantors 1/2/3 by 500k/1m/2m, §8 applications accepted in person, by post, mobile or web application.
2. Emergency loan 2569 — https://drive.google.com/file/d/1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p/view — 3 pages. Page 1 §2 effective 1 October 2026; page 2 §5(1–2) maximum 4 times monthly income capped at 30,000 after 3 months or 60,000 after 6 months, §5(5) maximum 15 installments, §§7–8 submission in person, post, email or official app/web. The publicly linked emergency application form https://drive.google.com/file/d/1w1_mMEJ2SLFlPDypcZDRMb8w3Wa2Bf7Y/view was independently read: it lists borrower documentation but no named personal guarantor field. This is not conclusive proof that every emergency product has no guarantor requirement; member-specific liabilities remain evidence-locked.
3. Special quality-of-life debt consolidation 2569 — https://drive.google.com/file/d/1Ek7aw6J-fgIE2AKOv_QruD57pQpJXVjU/view — 4 pages. Page 1 §2 effective 1 October 2026, §4 3 years/36 shares for up to 3m; page 2 §4 5 years/60 shares for up to 5m, §5(1) 80% appraisal and maximum 5m, §5(4) offset other cooperative loan contracts upon approval; page 3 §8 application in person, by post, mobile or web application.

## Version conflict resolved
An earlier signed ordinary-loan amendment (No. 3) 2569, https://drive.google.com/file/d/13wpjwmUycDYCkNIK6oPX1EorzEN7LOaK/view, effective 1 April 2026, required 24 share-payment months for 1,000,001–2,000,000 baht. This was superseded by the complete signed ordinary-loan announcement effective 1 October 2026, which requires 12 months for 500,001–2,000,000 baht. Do not reintroduce the superseded 24-month rule.

## Scoped code changes
- special_debt_explained_verified: direct overview instead of generic menu.
- share_monthly_max_verified: short follow-up responds with published 5,000 shares/month cap (prior signed share-amendment review already in QA report).
- emergency_guarantor_document_scope: distinguish emergency loan from ordinary guarantor requirements and cite both criteria and form; do not certify personal guarantor status.
- Preserved withdrawal-specific deposit-document follow-up after a generic deposit form route incorrectly intercepted it (CI #736 exposed this).

## Remaining release gate
This evidence check validates selected public claims, not all 110 questions. The existing semantic report currently records 30 CORRECT / 16 PARTIAL / 0 WRONG / 31 SAFE_HANDOFF / 33 NOT_VERIFIED on its own earlier candidate SHA. Regenerate/re-adjudicate the full 110 on final SHA before using any new totals. Do not Merge/Deploy until official evidence, semantic acceptance and final CI all pass.
