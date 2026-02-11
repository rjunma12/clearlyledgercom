

## Update Privacy Policy and Terms of Service

This plan rewrites both legal pages with comprehensive, detailed content reflecting ClearlyLedger's actual data processing practices (Railway backend, immediate file deletion, anonymized format retention). It also updates the Footer with additional legal links and compliance badges.

---

### Files to Modify (3 files)

#### 1. `src/pages/PrivacyPolicy.tsx` -- Complete rewrite

Replace the current sparse 11-section page with a comprehensive privacy policy containing:

- **Section 1: Data Collection and Processing** -- Account info, bank statement processing flow (HTTPS upload to Railway, temporary processing, immediate deletion, zero storage), and anonymized data retention explanation with concrete examples of what is/isn't kept
- **Section 2: Data Storage and Security** -- Infrastructure details (database on secure cloud, processing on Railway), file storage policy table (0-second retention for PDFs, 90 days for results), security measures (TLS 1.3, AES-256, JWT, rate limiting)
- **Section 3: How We Use Your Information** -- Service delivery, service improvement with data anonymization process (6-step PII removal), legal obligations
- **Section 4: Data Sharing and Third Parties** -- No-sell policy, service providers list (Railway for processing, database for auth/storage, Resend for email, Dodo Payments for billing) with purpose and retention for each
- **Section 5: Cookies** -- Authentication and preferences only, no third-party tracking
- **Section 6: Your Data Rights** -- Access, delete, portability (export as Excel/CSV/JSON)
- **Section 7: Data Retention Periods** -- Visual table with retention periods for each data type
- **Section 8: Children's Privacy** -- 18+ requirement
- **Section 9: International Transfers** -- Global processing with encryption safeguards
- **Section 10: Changes to Policy** -- Material changes via email, minor via page update
- **Section 11: Contact** -- helppropsal@outlook.com

Add Navbar and Footer components (currently missing from PrivacyPolicy). Update effective/last-updated dates to February 11, 2026.

#### 2. `src/pages/TermsOfService.tsx` -- Expand existing sections

Add/expand the following sections while keeping existing structure:

- **Section 5 (File Uploads and Data Handling)** -- Expand with: files processed on secure backend servers, transmitted over HTTPS, PDFs permanently deleted immediately after conversion, cannot recover files, results available 90 days. Add user agreement bullets (own files only, no malware, no reverse engineering)
- **New Section 5.5: Data Usage for Service Improvement** -- Consent to anonymized format patterns, what is/isn't kept, opt-out mention
- **New Section 5.6: File Storage and Deletion** -- Automatic deletion policy details (0-second retention, memory-only, no backups, no recovery), user-managed data (90-day results, account deletion)
- **Expand Section 9 (Service Availability)** -- Add parsing accuracy disclaimer (350+ banks, no 100% guarantee, user verification responsibility), permanent deletion acknowledgment
- **Expand Section 10 (Limitation of Liability)** -- Add data loss and financial consequences disclaimers
- **New Section after 12: Acceptable Use Policy** -- File upload rules, service abuse prevention, data misuse prohibition, consequences
- **New Section: Data Retention and Deletion** -- Automatic deletion schedule (immediate for PDFs, 90-day for results, 30-day account deletion), retained data after deletion (anonymized patterns, payment records 7 years)

#### 3. `src/components/Footer.tsx` -- Add links and compliance badges

- Add "Security" and "Data Processing" links to the Company column
- Replace "Secure payments" text in the bottom bar with compliance badges: "TLS 1.3 Encrypted" and "GDPR Aligned"

---

### Technical Details

**PrivacyPolicy.tsx changes:**
- Add `Navbar` and `Footer` imports and render them (matching TermsOfService pattern)
- Wrap content in container with consistent styling
- Add `FileText` icon header matching TermsOfService style
- Content grows from ~100 lines of JSX to ~400 lines
- All contact emails remain helppropsal@outlook.com per project standard

**TermsOfService.tsx changes:**
- Expand from 15 sections to ~20 sections
- Keep existing section numbering where possible, insert new sections logically
- Content grows from ~280 lines to ~500 lines

**Footer.tsx changes:**
- Company column: add 2 new Link elements for `/security` and `/data-processing`
- Bottom bar: replace "Secure payments" span with Lock icon + "TLS 1.3 Encrypted" and Shield icon + "GDPR Aligned"
- Add `Shield, Lock` imports from lucide-react

