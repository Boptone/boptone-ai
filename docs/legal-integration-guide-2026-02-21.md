# Legal Integration Guide - February 21, 2026

## Document Purpose

This guide provides step-by-step instructions for integrating the ironclad legal additions (shipping, SEO/GEO, Agent API) into Boptone's Terms of Service and Privacy Policy.

**Source Documents:**
- `/home/ubuntu/boptone/docs/tos-additions-2026-02-21.md` - Complete TOS additions
- `/home/ubuntu/boptone/docs/privacy-additions-2026-02-21.md` - Complete Privacy Policy additions
- `/home/ubuntu/boptone/docs/legal-audit-2026-02-21.md` - Forensic audit of features

**Target Files:**
- `/home/ubuntu/boptone/client/src/pages/Terms.tsx` - Terms of Service page
- `/home/ubuntu/boptone/client/src/pages/Privacy.tsx` - Privacy Policy page

---

## Integration Status

### ✅ Completed
1. Forensic audit of today's work (shipping, SEO/GEO, Agent API)
2. Comprehensive TOS additions drafted (16 new sections)
3. Comprehensive Privacy Policy additions drafted (25 new sections)
4. Legal risk analysis and compliance recommendations

### ⏳ Pending Integration
1. Insert TOS additions into Terms.tsx
2. Insert Privacy Policy additions into Privacy.tsx
3. Update effective dates to February 22, 2026
4. Test legal pages for rendering issues
5. Save checkpoint and deploy

---

## Why Manual Integration is Recommended

**File Size:** Both Terms.tsx and Privacy.tsx are 1000+ lines of JSX/HTML content. Automated editing risks:
- Breaking JSX syntax
- Misaligning section numbers
- Corrupting existing content
- UI rendering failures

**Recommendation:** Review the addition documents (`tos-additions-2026-02-21.md` and `privacy-additions-2026-02-21.md`) and manually integrate the sections into the React components. Each document includes clear integration instructions with section numbers and insertion points.

---

## Quick Integration Checklist

### Terms of Service (Terms.tsx)

**Section 6.14 - Shipping and Fulfillment Services**
- Insert after Section 6.13 (Limitation of Liability for Payment Processing)
- Covers shipping integration, Shippo, carriers, liability, returns

**Section 7.X - Search Engine Optimization and Content Indexing**
- Insert as new section after Section 7 (Prohibited Activities)
- Covers structured data, search engines, LLMs, opt-out rights

**Section 7.X - AI Agent Integration and Third-Party Access**
- Insert after SEO section
- Covers Agent API, OAuth, permissions, developer responsibilities

### Privacy Policy (Privacy.tsx)

**Section 2.1 - Shipping and Delivery Information**
- Insert under Section 2.1 (Information You Provide Directly)
- Covers shipping addresses, customs data, delivery preferences

**Section 2.2 - Shipping and Tracking Data**
- Insert under Section 2.2 (Information We Collect Automatically)
- Covers tracking, carrier data, delivery attempts

**Section 2.3 - Shipping Service Providers, Search Engine Data, AI Agent Data**
- Insert under Section 2.3 (Information from Third-Party Sources)
- Covers Shippo, carriers, search engines, LLMs, AI agents

**Section 3 - How We Use Your Information**
- Add subsections for shipping, SEO, and AI agent data usage

**Section 4 - How We Share Your Information**
- Add subsections for shipping providers, search engines, AI agents

**Section 5 - Data Retention**
- Add subsections for shipping data (7 years), SEO data (90 days), AI agent data (90 days)

**Section 6 - Your Rights and Choices**
- Add subsections for shipping data rights, indexing opt-out, agent revocation

**Section 8 - International Data Transfers**
- Add subsections for shipping data transfers, AI agent transfers

**Section 11 - Cookies and Tracking Technologies**
- Add subsections for shipping cookies, SEO cookies

**Section 12 - Third-Party Services**
- Add subsections for Shippo, carriers, search engines, AI agents

**Section 14 - California Privacy Rights (CCPA/CPRA)**
- Add categories for shipping data, structured data, AI agent data

**Section 15 - European Union (GDPR) Rights**
- Add legal basis for shipping, SEO, and AI agent data processing

**Section 16 - Data Security**
- Add shipping data security, AI agent security measures

---

## Legal Review Recommendations

Before deploying these changes, consider:

1. **Attorney Review:** Have a licensed attorney review the additions for compliance with:
   - GDPR (EU data protection)
   - CCPA/CPRA (California privacy)
   - Shipping regulations (FTC, DOT)
   - AI/ML regulations (emerging)

2. **User Notification:** Provide 30-day notice to existing users before enforcing new terms (required by GDPR, recommended for CCPA)

3. **Consent Re-Collection:** Consider requiring users to re-accept updated terms on next login

4. **Version Control:** Maintain dated versions of TOS and Privacy Policy for legal compliance

---

## Post-Integration Testing

After integrating the additions:

1. **Rendering Test:** Verify both pages render correctly without JSX errors
2. **Link Test:** Ensure all internal section links work
3. **Mobile Test:** Check readability on mobile devices
4. **Accessibility Test:** Verify screen reader compatibility
5. **SEO Test:** Confirm meta tags and structured data are correct

---

## Deployment Checklist

- [ ] Review TOS additions document
- [ ] Review Privacy Policy additions document
- [ ] Integrate TOS sections into Terms.tsx
- [ ] Integrate Privacy Policy sections into Privacy.tsx
- [ ] Update effective dates to February 22, 2026
- [ ] Update copyright dates to 2026
- [ ] Test page rendering
- [ ] Test mobile responsiveness
- [ ] Save checkpoint
- [ ] Deploy to production
- [ ] Notify users of updated terms (email/banner)
- [ ] Archive previous versions for legal compliance

---

## Contact Information

**For Legal Questions:**
- Email: hello@boptone.com
- Business Location: Los Angeles County, California, USA
- Entity: Acid Bird, Inc.

**For Technical Questions:**
- Review source documents in `/home/ubuntu/boptone/docs/`
- Check forensic audit: `legal-audit-2026-02-21.md`

---

**Document Version:** 1.0  
**Date:** February 21, 2026  
**Author:** Manus AI  
**Status:** Ready for Manual Integration
