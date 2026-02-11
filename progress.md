# Build Progress

## Current Feature
**ID:** F001-017
**Phase:** 3 → 4
**Status:** Data model approved, starting TDD implementation

**Spec:** `docs/specs/F001-017-file-storage.spec`
- User: Team member / team admin
- Screens: 4 (FileUploader, profile avatar, team avatar, note attachments)
- Flows: 4 (avatar upload, team avatar, note attachment, quota exceeded)
- Acceptance criteria: 10

**Data Model:**
- New table: `files` (storageId, fileName, fileType, fileSize, teamId, uploadedBy, purpose)
- Schema: users.avatarStorageId, teams.avatarStorageId
- Storage: Convex native file storage (generateUploadUrl)
- Quota: sum(fileSize) per team vs planConfig.storageQuotaMB

## PRD Anchor (Source of Truth)
**Feature:** F001-017
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-017 -->/,/<!-- END_FEATURE: F001-017 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

<!-- DO NOT INVENT REQUIREMENTS. Re-extract from PRD when needed. -->

---

## Last Completed
**ID:** F001-012
**Date:** 2026-02-11

Marketing Site & Legal Pages — landing page, pricing, contact form, legal MDX pages.

**Spec:** `docs/specs/F001-012-marketing-legal.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 212 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 7 complete | 10 pending
