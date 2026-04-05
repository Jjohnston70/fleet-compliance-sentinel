# Chrome Automation Prompt -- CMMC Web Page Capture

Copy and paste this entire prompt into a Claude in Chrome session. It will navigate to each page, capture content, and save screenshots or page text for your knowledge base.

---

## THE PROMPT

```
I need you to visit 18 web pages in sequence -- 11 regulation/portal pages plus 7 PDF downloads that failed from automated download. For each page:

1. Navigate to the URL
2. Take a screenshot of the page
3. Read the full page text content
4. If it's a PDF link, download it (I'll confirm each download)

Work through them in order. After each page, give me a brief summary of what's on it, then move to the next.

=== GROUP A: 7 FAILED PDF DOWNLOADS (dodcio.defense.gov) ===
These PDFs blocked automated download. I need you to navigate to each and download them.

A1. CMMC Assessment Guide Level 2 v2.13
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf

A2. CMMC Model Overview v2.13
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview.pdf

A3. CMMC Scoping Guide Level 2 (v2)
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2v2.pdf

A4. CMMC Scoping Guide Level 2 (v2.13 Sep 2024)
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2.pdf

A5. CMMC Assessment Guide Level 1 v2.13
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf

A6. CMMC Assessment Guide Level 3 v2.13
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3v2.pdf

A7. CMMC Assessment Guide Level 2 v2.0 (Original Dec 2021)
    https://dodcio.defense.gov/Portals/0/Documents/CMMC/AG_Level2_MasterV2.0_FINAL_202112016_508.pdf

=== GROUP B: 11 REGULATION & PORTAL WEB PAGES ===
For these, take a screenshot AND extract the full page text content so I can save it.

B1. 32 CFR Part 170 -- CMMC Program Rule
    https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170

B2. DFARS 252.204-7012 -- Safeguarding CDI & Cyber Incident Reporting
    https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting.

B3. DFARS 252.204-7021 -- CMMC Requirements (Final Rule)
    https://www.federalregister.gov/documents/2025/09/10/2025-17359/defense-federal-acquisition-regulation-supplement-assessing-contractor-implementation-of

B4. FAR 52.204-21 -- Basic Safeguarding of Covered Contractor Information Systems
    https://www.acquisition.gov/far/52.204-21

B5. CUI Registry -- All CUI Categories (NARA)
    https://www.archives.gov/cui

B6. SPRS Portal -- Score Submission
    https://www.sprs.csd.disa.mil/nistsp.htm

B7. Cyber-AB -- CMMC Accreditation Body
    https://cyberab.org/

B8. DoD CIO CMMC Resources Hub
    https://dodcio.defense.gov/CMMC/Resources-Documentation/

B9. Federal Register CMMC Final Rule (Full Text + Preamble)
    https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program

B10. 32 CFR Part 2002 -- CUI Program Implementation (NARA)
     https://www.ecfr.gov/current/title-32/subtitle-B/chapter-XX/part-2002

B11. CISA Cybersecurity Advisories
     https://www.cisa.gov/news-events/cybersecurity-advisories

Start with Group A (the PDF downloads), then move to Group B (the web pages).
For Group B pages, after reading the page text, provide it to me so I can save it as markdown.
```

---

## AFTER THE CHROME SESSION

Save the downloaded PDFs to:
```
~/Documents/Documents/constitution -compliance-gov-docs/cmmc-knowledge-base/01-tier1-core-regulatory/
```

Save the web page text extracts to:
```
~/Documents/Documents/constitution -compliance-gov-docs/cmmc-knowledge-base/04-tier4-adjacent-govcon/
```

Use these filenames for the web page saves:
- B1:  `32-CFR-Part-170-CMMC-Program-Rule.md`
- B2:  `DFARS-252.204-7012-Safeguarding-CDI.md`
- B3:  `DFARS-252.204-7021-CMMC-Requirements.md`
- B4:  `FAR-52.204-21-Basic-Safeguarding.md`
- B5:  `CUI-Registry-NARA.md`
- B6:  `SPRS-Portal-Reference.md`
- B7:  `CyberAB-CMMC-Accreditation-Body.md`
- B8:  `DoD-CIO-CMMC-Resources-Hub.md`
- B9:  `Federal-Register-CMMC-Final-Rule.md`
- B10: `32-CFR-Part-2002-CUI-Program.md`
- B11: `CISA-Cybersecurity-Advisories.md`
