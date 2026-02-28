# Toney AI Specification

This directory contains the approved behavioral and personalization specification for Toney, the Boptone AI chat agent.

## Documents

| File | Version | Status | Description |
|---|---|---|---|
| `toney-v1.0-system-prompt.md` | v1.0 | Live | Base behavioral specification: three pillars, three registers, human frequency, geo-locale layer, guardrails |
| `toney-v1.1-personalization-addendum.md` | v1.1 | Approved, pending implementation | Deep artist personalization: persistent profile structure, "Know This Artist" instruction block, trust-building behavioral layer |

## Implementation

The v1.0 system prompt is live in `server/routers/toney.ts`. The geo-adaptive locale layer is in `server/toneyLocale.ts` with 18 country profiles.

v1.1 implementation requires two workstreams — see the addendum document for the full checklist.

v2.0 (enterprise operational infrastructure layer) is planned for a future development cycle.

## Change Policy

All changes to Toney's behavioral specification must be drafted as a document and approved before any code is written. The system prompt is the foundation of the entire agent — changes compound quickly in both directions.
